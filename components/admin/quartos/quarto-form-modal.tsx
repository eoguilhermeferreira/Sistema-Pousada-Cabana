"use client";

import * as React from "react";
import { Loader2, UploadCloud, X } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createQuarto,
  deleteQuartoFoto,
  numeroExists,
  updateQuarto,
  uploadQuartoFoto,
} from "@/services/quartos-service";
import {
  emptyQuartoForm,
  getComodidadeIcon,
  quartoToFormValues,
  statusQuartoLabels,
  statusQuartoOptions,
  type CategoriaQuarto,
  type Comodidade,
  type QuartoDetalhado,
  type QuartoFormValues,
  type QuartoFoto,
} from "@/types/quarto";

const selectClass =
  "flex h-11 w-full rounded-xl border border-gray-text/20 bg-white px-4 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "flex min-h-24 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

function Field({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className ? className : "flex flex-col gap-1.5"}>
      <span className="text-xs font-medium text-gray-text">
        {label}
        {required && <span className="text-status-ocupado"> *</span>}
      </span>
      {children}
      {error && (
        <span className="text-xs font-medium text-status-ocupado">
          {error}
        </span>
      )}
    </label>
  );
}

interface StagedFoto {
  file: File;
  previewUrl: string;
}

interface QuartoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quarto: QuartoDetalhado | null;
  categorias: CategoriaQuarto[];
  comodidades: Comodidade[];
  onSaved: () => void;
}

export function QuartoFormModal({
  open,
  onOpenChange,
  quarto,
  categorias,
  comodidades,
  onSaved,
}: QuartoFormModalProps) {
  const isEditing = Boolean(quarto);
  const [values, setValues] = React.useState<QuartoFormValues>(
    emptyQuartoForm,
  );
  const [existingFotos, setExistingFotos] = React.useState<QuartoFoto[]>([]);
  const [stagedFotos, setStagedFotos] = React.useState<StagedFoto[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [uploadingFotos, setUploadingFotos] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setValues(
        quarto
          ? quartoToFormValues(
              quarto,
              quarto.comodidades.map((c) => c.id),
            )
          : {
              ...emptyQuartoForm,
              categoria_id: categorias[0]?.id ?? "",
            },
      );
      setExistingFotos(quarto?.fotos ?? []);
      setStagedFotos([]);
      setErrors({});
      setFormError("");
      setUploadingFotos(false);
      setIsDragOver(false);
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, quarto, categorias]);

  function setField<K extends keyof QuartoFormValues>(
    key: K,
    value: QuartoFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function toggleComodidade(id: string) {
    setValues((prev) => ({
      ...prev,
      comodidade_ids: prev.comodidade_ids.includes(id)
        ? prev.comodidade_ids.filter((c) => c !== id)
        : [...prev.comodidade_ids, id],
    }));
  }

  // Quarto já existe: sobe cada foto pro Storage assim que solta/seleciona,
  // sem precisar clicar em "Salvar alterações". Quarto novo (ainda sem id)
  // continua no modo antigo — fica "staged" e só sobe quando o quarto for
  // criado no submit, porque não existe onde salvar a foto ainda.
  async function handleNovasFotos(files: File[]) {
    if (files.length === 0) return;
    const imagens = files.filter((file) => file.type.startsWith("image/"));
    if (imagens.length === 0) return;

    if (!quarto) {
      setStagedFotos((prev) => [
        ...prev,
        ...imagens.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
      return;
    }

    setUploadingFotos(true);
    setFormError("");
    try {
      let ordem = existingFotos.length;
      for (const file of imagens) {
        const foto = await uploadQuartoFoto(file, quarto.id, ordem);
        setExistingFotos((prev) => [...prev, foto]);
        ordem += 1;
      }
    } catch {
      setFormError("Não foi possível enviar uma ou mais fotos.");
    } finally {
      setUploadingFotos(false);
    }
  }

  function handleFotoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    handleNovasFotos(files);
    event.target.value = "";
  }

  function handleFotoDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    handleNovasFotos(Array.from(event.dataTransfer.files ?? []));
  }

  function removeStagedFoto(index: number) {
    setStagedFotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function removeExistingFoto(foto: QuartoFoto) {
    try {
      await deleteQuartoFoto(foto);
      setExistingFotos((prev) => prev.filter((f) => f.id !== foto.id));
    } catch {
      setFormError("Não foi possível remover a foto.");
    }
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    if (!values.numero.trim()) nextErrors.numero = "Informe o número.";
    if (!values.categoria_id) nextErrors.categoria_id = "Selecione a categoria.";
    const capacidade = Number(values.capacidade_maxima);
    if (!capacidade || capacidade <= 0)
      nextErrors.capacidade_maxima = "Capacidade inválida.";
    const valor = Number(values.valor_diaria);
    if (Number.isNaN(valor) || valor < 0)
      nextErrors.valor_diaria = "Valor inválido.";
    if (
      values.valor_casal &&
      (Number.isNaN(Number(values.valor_casal)) || Number(values.valor_casal) < 0)
    )
      nextErrors.valor_casal = "Valor inválido.";
    if (
      values.valor_pessoa_adicional &&
      (Number.isNaN(Number(values.valor_pessoa_adicional)) ||
        Number(values.valor_pessoa_adicional) < 0)
    )
      nextErrors.valor_pessoa_adicional = "Valor inválido.";
    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const numero = values.numero.trim();
      const duplicate = await numeroExists(numero, quarto?.id);
      if (duplicate) {
        setErrors((prev) => ({
          ...prev,
          numero: "Já existe um quarto com este número.",
        }));
        setSaving(false);
        return;
      }

      const payload = {
        numero,
        categoria_id: values.categoria_id,
        descricao: values.descricao.trim() || null,
        capacidade_maxima: Number(values.capacidade_maxima),
        valor_diaria: Number(values.valor_diaria),
        valor_casal: values.valor_casal ? Number(values.valor_casal) : null,
        valor_pessoa_adicional: values.valor_pessoa_adicional
          ? Number(values.valor_pessoa_adicional)
          : null,
        status: values.status,
      };

      const saved = quarto
        ? await updateQuarto(quarto.id, payload, values.comodidade_ids)
        : await createQuarto(payload, values.comodidade_ids);

      const startOrdem = existingFotos.length;
      for (let i = 0; i < stagedFotos.length; i++) {
        await uploadQuartoFoto(stagedFotos[i]!.file, saved.id, startOrdem + i);
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o quarto.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title={isEditing ? "Editar Quarto" : "Novo Quarto"}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Número do quarto" required error={errors.numero}>
                <Input
                  value={values.numero}
                  onChange={(e) => setField("numero", e.target.value)}
                  placeholder="Ex: 12"
                />
              </Field>
              <Field label="Categoria" required error={errors.categoria_id}>
                <select
                  className={selectClass}
                  value={values.categoria_id}
                  onChange={(e) => setField("categoria_id", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field
                label="Capacidade máxima"
                required
                error={errors.capacidade_maxima}
              >
                <Input
                  type="number"
                  min={1}
                  value={values.capacidade_maxima}
                  onChange={(e) =>
                    setField("capacidade_maxima", e.target.value)
                  }
                />
              </Field>
              <Field
                label="Valor da diária (R$) — 1 pessoa"
                required
                error={errors.valor_diaria}
              >
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={values.valor_diaria}
                  onChange={(e) => setField("valor_diaria", e.target.value)}
                  placeholder="0,00"
                />
              </Field>
              <Field label="Status inicial" error={errors.status}>
                <select
                  className={selectClass}
                  value={values.status}
                  onChange={(e) =>
                    setField(
                      "status",
                      e.target.value as QuartoFormValues["status"],
                    )
                  }
                >
                  {statusQuartoOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusQuartoLabels[status]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="space-y-2 rounded-xl border border-gray-text/20 p-4">
              <p className="text-xs font-medium text-gray-text">
                Preço por ocupação (opcional) — se não preencher, o valor da
                diária acima vale para qualquer quantidade de hóspedes.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Valor da diária (R$) — casal (2 pessoas)"
                  error={errors.valor_casal}
                >
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.valor_casal}
                    onChange={(e) => setField("valor_casal", e.target.value)}
                    placeholder="0,00"
                  />
                </Field>
                <Field
                  label="Adicional por diária — cada pessoa a partir da 3ª"
                  error={errors.valor_pessoa_adicional}
                >
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.valor_pessoa_adicional}
                    onChange={(e) =>
                      setField("valor_pessoa_adicional", e.target.value)
                    }
                    placeholder="0,00"
                  />
                </Field>
              </div>
            </div>

            <Field label="Descrição" error={errors.descricao}>
              <textarea
                className={textareaClass}
                value={values.descricao}
                onChange={(e) => setField("descricao", e.target.value)}
                placeholder="Detalhes sobre o quarto, vista, diferenciais..."
              />
            </Field>

            <div className="space-y-3">
              <span className="text-xs font-medium text-gray-text">
                Comodidades
              </span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-xl border border-gray-text/20 p-4 sm:grid-cols-3">
                {comodidades.map((comodidade) => {
                  const Icon = getComodidadeIcon(comodidade.icone);
                  const checked = values.comodidade_ids.includes(
                    comodidade.id,
                  );
                  return (
                    <label
                      key={comodidade.id}
                      className="flex cursor-pointer items-center gap-2 text-sm text-primary-dark"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleComodidade(comodidade.id)}
                      />
                      <Icon className="size-4 text-gray-text" />
                      {comodidade.nome}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-medium text-gray-text">
                Fotos
              </span>
              <div className="flex flex-wrap gap-3">
                {existingFotos.map((foto) => (
                  <div
                    key={foto.id}
                    className="group relative size-20 overflow-hidden rounded-xl border border-gray-light"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={foto.url}
                      alt="Foto do quarto"
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingFoto(foto)}
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary-dark/70 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {stagedFotos.map((foto, index) => (
                  <div
                    key={foto.previewUrl}
                    className="group relative size-20 overflow-hidden rounded-xl border border-gray-light"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={foto.previewUrl}
                      alt="Foto do quarto"
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeStagedFoto(index)}
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary-dark/70 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {uploadingFotos && (
                  <div className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border border-gray-light text-gray-text">
                    <Loader2 className="size-5 animate-spin" />
                  </div>
                )}
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFotoDrop}
                className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition-colors duration-200 ${
                  isDragOver
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-text/30 text-gray-text hover:border-primary hover:text-primary"
                }`}
              >
                <UploadCloud className="size-6" />
                <span className="text-sm font-medium">
                  Arraste as fotos aqui ou clique para selecionar
                </span>
                <span className="text-xs text-gray-text">
                  {quarto
                    ? "Já salva automaticamente, sem precisar clicar em Salvar."
                    : "Serão salvas quando o quarto for cadastrado."}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFotoSelect}
                />
              </div>
            </div>

            {formError && (
              <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                {formError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-light px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Cadastrar quarto"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
