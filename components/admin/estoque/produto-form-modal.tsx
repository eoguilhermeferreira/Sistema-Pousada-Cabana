"use client";

import * as React from "react";
import { ImagePlus, Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  codigoExists,
  createProduto,
  updateProduto,
  uploadProdutoImagem,
} from "@/services/produtos-service";
import {
  emptyProdutoForm,
  produtoToFormValues,
  unidadeLabels,
  unidadeOptions,
  type CategoriaProduto,
  type Produto,
  type ProdutoFormValues,
} from "@/types/produto";

const inputClass =
  "flex h-11 w-full rounded-xl border border-gray-text/20 bg-white px-4 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-admin-bg";

const selectClass =
  "flex h-11 w-full rounded-xl border border-gray-text/20 bg-white px-4 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "flex min-h-20 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

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

interface ProdutoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: Produto | null;
  categorias: CategoriaProduto[];
  onSaved: () => void;
}

export function ProdutoFormModal({
  open,
  onOpenChange,
  produto,
  categorias,
  onSaved,
}: ProdutoFormModalProps) {
  const isEditing = Boolean(produto);
  const [values, setValues] = React.useState<ProdutoFormValues>(emptyProdutoForm);
  const [imagemUrl, setImagemUrl] = React.useState<string | null>(null);
  const [imagemFile, setImagemFile] = React.useState<File | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setValues(
        produto
          ? produtoToFormValues(produto)
          : { ...emptyProdutoForm, categoria_id: categorias[0]?.id ?? "" },
      );
      setImagemUrl(produto?.imagem_url ?? null);
      setImagemFile(null);
      setErrors({});
      setFormError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, produto, categorias]);

  function setField<K extends keyof ProdutoFormValues>(
    key: K,
    value: ProdutoFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleImagemClick() {
    fileInputRef.current?.click();
  }

  function handleImagemChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImagemFile(file);
    setImagemUrl(URL.createObjectURL(file));
    event.target.value = "";
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    if (!values.codigo.trim()) nextErrors.codigo = "Informe o código interno.";
    if (!values.nome.trim()) nextErrors.nome = "Informe o nome do produto.";
    if (!values.categoria_id) nextErrors.categoria_id = "Selecione a categoria.";
    const custo = Number(values.valor_custo);
    if (Number.isNaN(custo) || custo < 0)
      nextErrors.valor_custo = "Valor inválido.";
    const venda = Number(values.valor_venda);
    if (Number.isNaN(venda) || venda < 0)
      nextErrors.valor_venda = "Valor inválido.";
    if (!isEditing) {
      const quantidade = Number(values.quantidade);
      if (!Number.isInteger(quantidade) || quantidade < 0)
        nextErrors.quantidade = "Quantidade inválida.";
    }
    const estoqueMinimo = Number(values.estoque_minimo);
    if (!Number.isInteger(estoqueMinimo) || estoqueMinimo < 0)
      nextErrors.estoque_minimo = "Valor inválido.";
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
      const codigo = values.codigo.trim();
      const duplicate = await codigoExists(codigo, produto?.id);
      if (duplicate) {
        setErrors((prev) => ({
          ...prev,
          codigo: "Já existe um produto com este código.",
        }));
        setSaving(false);
        return;
      }

      const payload = {
        codigo,
        nome: values.nome.trim(),
        categoria_id: values.categoria_id,
        fornecedor: values.fornecedor.trim() || null,
        descricao: values.descricao.trim() || null,
        valor_custo: Number(values.valor_custo),
        valor_venda: Number(values.valor_venda),
        estoque_minimo: Number(values.estoque_minimo),
        unidade: values.unidade,
        observacoes: values.observacoes.trim() || null,
        ativo: values.ativo,
        ...(isEditing ? {} : { quantidade: Number(values.quantidade) }),
      };

      const saved = produto
        ? await updateProduto(produto.id, payload)
        : await createProduto(payload);

      if (imagemFile) {
        const url = await uploadProdutoImagem(imagemFile, saved.id);
        await updateProduto(saved.id, { imagem_url: url });
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title={isEditing ? "Editar Produto" : "Novo Produto"}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-light bg-admin-bg text-gray-text/50">
                {imagemUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagemUrl}
                    alt="Imagem do produto"
                    className="size-full object-cover"
                  />
                ) : (
                  <ImagePlus className="size-6" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagemChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImagemClick}
                  className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
                >
                  <ImagePlus className="size-4" />
                  {imagemUrl ? "Alterar imagem" : "Adicionar imagem"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nome do produto" required error={errors.nome}>
                <Input
                  value={values.nome}
                  onChange={(e) => setField("nome", e.target.value)}
                  placeholder="Ex: Água mineral 500ml"
                />
              </Field>
              <Field label="Código interno" required error={errors.codigo}>
                <Input
                  value={values.codigo}
                  onChange={(e) => setField("codigo", e.target.value)}
                  placeholder="Ex: PRD-0001"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <Field label="Fornecedor" error={errors.fornecedor}>
                <Input
                  value={values.fornecedor}
                  onChange={(e) => setField("fornecedor", e.target.value)}
                  placeholder="Nome do fornecedor"
                />
              </Field>
            </div>

            <Field label="Descrição" error={errors.descricao}>
              <textarea
                className={textareaClass}
                value={values.descricao}
                onChange={(e) => setField("descricao", e.target.value)}
                placeholder="Detalhes sobre o produto..."
              />
            </Field>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Valor de compra (R$)" required error={errors.valor_custo}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={values.valor_custo}
                  onChange={(e) => setField("valor_custo", e.target.value)}
                  placeholder="0,00"
                />
              </Field>
              <Field label="Valor de venda (R$)" required error={errors.valor_venda}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={values.valor_venda}
                  onChange={(e) => setField("valor_venda", e.target.value)}
                  placeholder="0,00"
                />
              </Field>
              <Field
                label={isEditing ? "Quantidade atual" : "Quantidade inicial"}
                required={!isEditing}
                error={errors.quantidade}
              >
                <Input
                  type="number"
                  min={0}
                  step="1"
                  value={values.quantidade}
                  onChange={(e) => setField("quantidade", e.target.value)}
                  disabled={isEditing}
                  className={inputClass}
                />
              </Field>
              <Field label="Estoque mínimo" required error={errors.estoque_minimo}>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  value={values.estoque_minimo}
                  onChange={(e) => setField("estoque_minimo", e.target.value)}
                />
              </Field>
            </div>
            {isEditing && (
              <p className="-mt-3 text-xs text-gray-text">
                Para alterar a quantidade, use a ação &quot;Movimentar
                estoque&quot; na listagem de produtos.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Unidade" error={errors.unidade}>
                <select
                  className={selectClass}
                  value={values.unidade}
                  onChange={(e) => setField("unidade", e.target.value)}
                >
                  {unidadeOptions.map((unidade) => (
                    <option key={unidade} value={unidade}>
                      {unidadeLabels[unidade] ?? unidade} ({unidade})
                    </option>
                  ))}
                </select>
              </Field>
              <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-primary-dark">
                <Checkbox
                  checked={values.ativo}
                  onCheckedChange={(checked) =>
                    setField("ativo", checked === true)
                  }
                />
                Produto ativo (disponível para consumo/venda)
              </label>
            </div>

            <Field label="Observações" error={errors.observacoes}>
              <textarea
                className={textareaClass}
                value={values.observacoes}
                onChange={(e) => setField("observacoes", e.target.value)}
                placeholder="Observações internas sobre o produto..."
              />
            </Field>

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
              {isEditing ? "Salvar alterações" : "Cadastrar produto"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
