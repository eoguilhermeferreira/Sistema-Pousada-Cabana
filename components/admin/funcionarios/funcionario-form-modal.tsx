"use client";

import * as React from "react";
import { Camera, KeyRound, Loader2, ScanFace, ShieldCheck } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { CapturaFacialModal } from "@/components/admin/funcionarios/captura-facial-modal";
import { useUsuarioAtual } from "@/components/admin/usuario-context";
import { formatCpf, isValidCpf, onlyDigits } from "@/lib/cpf";
import { formatPhone, isValidPhone } from "@/lib/phone";
import { formatCep, isValidCep, fetchEnderecoPorCep } from "@/lib/cep";
import { permissoesPorCargo } from "@/lib/permissions";
import {
  cpfExists,
  createFuncionario,
  definirPinPonto,
  removerPinPonto,
  salvarTemplatesFaciais,
  updateFuncionario,
  uploadFuncionarioFoto,
} from "@/services/funcionarios-service";
import {
  cargoFuncionarioOptions,
  emptyFuncionarioForm,
  funcionarioToFormValues,
  statusFuncionarioLabels,
  turnoLabels,
  turnoOptions,
  type Funcionario,
  type FuncionarioFormValues,
} from "@/types/funcionario";
import { cargoLabels, type CargoUsuario } from "@/types/usuario";

const selectClass =
  "flex h-11 w-full rounded-xl border border-gray-text/20 bg-white px-4 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "flex min-h-20 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

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

interface FuncionarioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionario: Funcionario | null;
  onSaved: () => void;
}

export function FuncionarioFormModal({
  open,
  onOpenChange,
  funcionario,
  onSaved,
}: FuncionarioFormModalProps) {
  const usuarioAtual = useUsuarioAtual();
  const podeVerSalario = permissoesPorCargo[usuarioAtual.cargo].podeVerSalario;
  // Mesmo nível de permissão exigido pela RPC definir_pin_ponto_funcionario
  // (administrador ou gerente) — reaproveita podeCorrigirPonto por ser a
  // mesma faixa de acesso já usada pra ações sensíveis do ponto.
  const podeGerenciarPin = permissoesPorCargo[usuarioAtual.cargo].podeCorrigirPonto;

  const isEditing = Boolean(funcionario);
  const [values, setValues] = React.useState<FuncionarioFormValues>(
    emptyFuncionarioForm,
  );
  const [fotoUrl, setFotoUrl] = React.useState<string | null>(null);
  const [fotoFile, setFotoFile] = React.useState<File | null>(null);
  const [descritoresFaciais, setDescritoresFaciais] = React.useState<
    number[][] | null
  >(null);
  const [capturaOpen, setCapturaOpen] = React.useState(false);
  const [temAlmoco, setTemAlmoco] = React.useState(true);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [checkingCep, setCheckingCep] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [pinConfigurado, setPinConfigurado] = React.useState(false);
  const [pinInput, setPinInput] = React.useState("");
  const [pinSaving, setPinSaving] = React.useState(false);
  const [pinError, setPinError] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setValues(
        funcionario ? funcionarioToFormValues(funcionario) : emptyFuncionarioForm,
      );
      setFotoUrl(funcionario?.foto_url ?? null);
      setFotoFile(null);
      setDescritoresFaciais(null);
      setTemAlmoco(funcionario ? Boolean(funcionario.horario_saida_almoco) : true);
      setErrors({});
      setFormError("");
      setPinConfigurado(Boolean(funcionario?.pin_ponto_configurado));
      setPinInput("");
      setPinError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, funcionario]);

  function setField<K extends keyof FuncionarioFormValues>(
    key: K,
    value: FuncionarioFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  // Duração do almoço fica guardada em minutos no banco, mas ninguém
  // pensa em minutos totais ("90 min") — mostra em horas + minutos.
  const duracaoAlmocoTotal = Number(values.duracao_almoco_minutos) || 0;
  const horasAlmoco = Math.floor(duracaoAlmocoTotal / 60);
  const minutosAlmoco = duracaoAlmocoTotal % 60;

  function handleFotoClick() {
    fileInputRef.current?.click();
  }

  function handleFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoUrl(URL.createObjectURL(file));
  }

  function handleCapturaConcluida(
    descritores: number[][],
    fotoCapturada: Blob | null,
  ) {
    setDescritoresFaciais(descritores);
    // A foto captada durante o cadastro facial é usada apenas para
    // identificação visual (avatar) — a autenticação continua baseada
    // exclusivamente no template matemático. Só preenche a foto se o
    // administrador ainda não tiver escolhido uma manualmente.
    if (fotoCapturada && !fotoFile) {
      const file = new File([fotoCapturada], `rosto-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setFotoFile(file);
      setFotoUrl(URL.createObjectURL(file));
    }
  }

  async function handleSalvarPin() {
    if (!funcionario) return;
    if (!/^\d{4,6}$/.test(pinInput)) {
      setPinError("O código precisa ter de 4 a 6 números.");
      return;
    }
    setPinSaving(true);
    setPinError("");
    try {
      await definirPinPonto(funcionario.id, pinInput);
      setPinConfigurado(true);
      setPinInput("");
    } catch (error) {
      setPinError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o código.",
      );
    } finally {
      setPinSaving(false);
    }
  }

  async function handleRemoverPin() {
    if (!funcionario) return;
    setPinSaving(true);
    setPinError("");
    try {
      await removerPinPonto(funcionario.id);
      setPinConfigurado(false);
      setPinInput("");
    } catch (error) {
      setPinError(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o código.",
      );
    } finally {
      setPinSaving(false);
    }
  }

  function handleToggleTemAlmoco(checked: boolean) {
    setTemAlmoco(checked);
    if (!checked) {
      setField("horario_saida_almoco", "");
      setField("duracao_almoco_minutos", "");
    }
  }

  async function handleCepBlur() {
    if (!isValidCep(values.cep)) return;
    setCheckingCep(true);
    try {
      const endereco = await fetchEnderecoPorCep(values.cep);
      if (endereco) {
        setValues((prev) => ({
          ...prev,
          rua: endereco.rua || prev.rua,
          bairro: endereco.bairro || prev.bairro,
          cidade: endereco.cidade || prev.cidade,
          estado: endereco.estado || prev.estado,
        }));
      }
    } finally {
      setCheckingCep(false);
    }
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    if (!values.nome.trim()) nextErrors.nome = "Informe o nome completo.";
    if (!isValidCpf(values.cpf)) nextErrors.cpf = "CPF inválido.";
    if (!isValidPhone(values.telefone))
      nextErrors.telefone = "Telefone inválido.";
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email))
      nextErrors.email = "E-mail inválido.";
    if (!values.cargo) nextErrors.cargo = "Selecione o cargo.";
    if (!values.data_admissao)
      nextErrors.data_admissao = "Informe a data de admissão.";
    if (
      podeVerSalario &&
      values.salario &&
      (Number.isNaN(Number(values.salario)) || Number(values.salario) < 0)
    )
      nextErrors.salario = "Valor inválido.";
    if (
      temAlmoco &&
      values.duracao_almoco_minutos &&
      (Number.isNaN(Number(values.duracao_almoco_minutos)) ||
        Number(values.duracao_almoco_minutos) <= 0)
    )
      nextErrors.duracao_almoco_minutos = "Duração inválida.";
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
      const cpfDigits = onlyDigits(values.cpf);
      const duplicate = await cpfExists(cpfDigits, funcionario?.id);
      if (duplicate) {
        setErrors((prev) => ({
          ...prev,
          cpf: "Já existe um funcionário cadastrado com este CPF.",
        }));
        setSaving(false);
        return;
      }

      const payload = {
        nome: values.nome.trim(),
        cpf: cpfDigits,
        rg: values.rg.trim() || null,
        telefone: onlyDigits(values.telefone),
        email: values.email.trim() || null,
        data_nascimento: values.data_nascimento || null,
        cep: values.cep ? onlyDigits(values.cep) : null,
        rua: values.rua.trim() || null,
        numero: values.numero.trim() || null,
        complemento: values.complemento.trim() || null,
        bairro: values.bairro.trim() || null,
        cidade: values.cidade.trim() || null,
        estado: values.estado.trim() || null,
        cargo: values.cargo as CargoUsuario,
        turno: values.turno,
        ...(podeVerSalario
          ? { salario: values.salario ? Number(values.salario) : null }
          : {}),
        data_admissao: values.data_admissao,
        observacoes: values.observacoes.trim() || null,
        status: values.status,
        horario_entrada: values.horario_entrada || null,
        horario_saida_almoco: temAlmoco ? values.horario_saida_almoco || null : null,
        duracao_almoco_minutos:
          temAlmoco && values.duracao_almoco_minutos
            ? Number(values.duracao_almoco_minutos)
            : null,
        horario_saida: values.horario_saida || null,
      };

      const saved = funcionario
        ? await updateFuncionario(funcionario.id, payload)
        : await createFuncionario(payload);

      let finalFotoUrl = fotoUrl;
      if (fotoFile) {
        finalFotoUrl = await uploadFuncionarioFoto(fotoFile, saved.id);
        await updateFuncionario(saved.id, { foto_url: finalFotoUrl });
      }

      if (descritoresFaciais && descritoresFaciais.length > 0) {
        await salvarTemplatesFaciais(saved.id, descritoresFaciais);
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o funcionário.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent
          title={isEditing ? "Editar Funcionário" : "Novo Funcionário"}
          className="max-w-3xl"
        >
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="space-y-6 px-6 py-6">
              <div className="flex flex-wrap items-center gap-4">
                <HospedeAvatar nome={values.nome} fotoUrl={fotoUrl} size="lg" />
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFotoClick}
                    className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
                  >
                    <Camera className="size-4" />
                    Alterar foto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCapturaOpen(true)}
                    className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
                  >
                    <ScanFace className="size-4" />
                    Cadastrar Rosto
                  </Button>
                  {descritoresFaciais && descritoresFaciais.length > 0 && (
                    <span className="flex items-center gap-1 self-center text-xs font-medium text-status-disponivel">
                      <ShieldCheck className="size-4" />
                      {descritoresFaciais.length} captura(s) prontas para salvar
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                  Dados pessoais
                </h3>
                <Field label="Nome completo" required error={errors.nome}>
                  <Input
                    value={values.nome}
                    onChange={(e) => setField("nome", e.target.value)}
                    placeholder="Nome completo do funcionário"
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="CPF" required error={errors.cpf}>
                    <Input
                      value={values.cpf}
                      onChange={(e) => setField("cpf", formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="RG (opcional)" error={errors.rg}>
                    <Input
                      value={values.rg}
                      onChange={(e) => setField("rg", e.target.value)}
                      placeholder="Opcional"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Telefone" required error={errors.telefone}>
                    <Input
                      value={values.telefone}
                      onChange={(e) =>
                        setField("telefone", formatPhone(e.target.value))
                      }
                      placeholder="(00) 00000-0000"
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="E-mail" error={errors.email}>
                    <Input
                      type="email"
                      value={values.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </Field>
                </div>
                <Field
                  label="Data de nascimento"
                  error={errors.data_nascimento}
                  className="flex w-full max-w-xs flex-col gap-1.5"
                >
                  <Input
                    type="date"
                    value={values.data_nascimento}
                    onChange={(e) => setField("data_nascimento", e.target.value)}
                  />
                </Field>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                  Endereço
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label={checkingCep ? "CEP (buscando...)" : "CEP"}
                    error={errors.cep}
                  >
                    <Input
                      value={values.cep}
                      onChange={(e) => setField("cep", formatCep(e.target.value))}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="Número" error={errors.numero}>
                    <Input
                      value={values.numero}
                      onChange={(e) => setField("numero", e.target.value)}
                      placeholder="Número"
                    />
                  </Field>
                </div>
                <Field label="Rua" error={errors.rua}>
                  <Input
                    value={values.rua}
                    onChange={(e) => setField("rua", e.target.value)}
                    placeholder="Preenchido automaticamente pelo CEP"
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Complemento" error={errors.complemento}>
                    <Input
                      value={values.complemento}
                      onChange={(e) => setField("complemento", e.target.value)}
                      placeholder="Apto, bloco, referência..."
                    />
                  </Field>
                  <Field label="Bairro" error={errors.bairro}>
                    <Input
                      value={values.bairro}
                      onChange={(e) => setField("bairro", e.target.value)}
                      placeholder="Preenchido automaticamente pelo CEP"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Cidade" error={errors.cidade}>
                    <Input
                      value={values.cidade}
                      onChange={(e) => setField("cidade", e.target.value)}
                      placeholder="Preenchido automaticamente pelo CEP"
                    />
                  </Field>
                  <Field label="Estado" error={errors.estado}>
                    <Input
                      value={values.estado}
                      onChange={(e) => setField("estado", e.target.value)}
                      placeholder="UF"
                      maxLength={2}
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                  Cargo e turno
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Cargo" required error={errors.cargo}>
                    <select
                      className={selectClass}
                      value={values.cargo}
                      onChange={(e) =>
                        setField(
                          "cargo",
                          e.target.value as FuncionarioFormValues["cargo"],
                        )
                      }
                    >
                      <option value="">Selecione</option>
                      {cargoFuncionarioOptions.map((cargo) => (
                        <option key={cargo} value={cargo}>
                          {cargoLabels[cargo]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Turno" error={errors.turno}>
                    <select
                      className={selectClass}
                      value={values.turno}
                      onChange={(e) =>
                        setField(
                          "turno",
                          e.target.value as FuncionarioFormValues["turno"],
                        )
                      }
                    >
                      {turnoOptions.map((turno) => (
                        <option key={turno} value={turno}>
                          {turnoLabels[turno]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {podeVerSalario && (
                    <Field label="Salário (R$)" error={errors.salario}>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={values.salario}
                        onChange={(e) => setField("salario", e.target.value)}
                        placeholder="Somente uso administrativo"
                      />
                    </Field>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Data de admissão"
                    required
                    error={errors.data_admissao}
                  >
                    <Input
                      type="date"
                      value={values.data_admissao}
                      onChange={(e) =>
                        setField("data_admissao", e.target.value)
                      }
                    />
                  </Field>
                  <Field label="Status" error={errors.status}>
                    <select
                      className={selectClass}
                      value={values.status}
                      onChange={(e) =>
                        setField(
                          "status",
                          e.target.value as FuncionarioFormValues["status"],
                        )
                      }
                    >
                      {Object.entries(statusFuncionarioLabels).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>
                </div>
                <Field label="Observações" error={errors.observacoes}>
                  <textarea
                    className={textareaClass}
                    value={values.observacoes}
                    onChange={(e) => setField("observacoes", e.target.value)}
                    placeholder="Anotações internas sobre o funcionário..."
                  />
                </Field>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                    Horários de trabalho (opcional)
                  </h3>
                  <p className="mt-1 text-xs text-gray-text">
                    Se preenchidos, o sistema avisa atraso na entrada e no
                    retorno do almoço, e informa quando a saída para o
                    almoço ou a saída final acontecem fora do horário.
                  </p>
                </div>

                <label className="flex items-center gap-2.5">
                  <Checkbox
                    checked={temAlmoco}
                    onCheckedChange={(checked) =>
                      handleToggleTemAlmoco(checked === true)
                    }
                  />
                  <span className="text-sm text-primary-dark">
                    Este funcionário tem horário de almoço
                  </span>
                </label>
                {!temAlmoco && (
                  <p className="text-xs text-gray-text">
                    Sem intervalo — no Bater Ponto, a 2ª batida do dia já
                    fecha como saída final, sem passar por almoço.
                  </p>
                )}

                <div
                  className={
                    temAlmoco
                      ? "grid grid-cols-1 gap-4 sm:grid-cols-4"
                      : "grid grid-cols-1 gap-4 sm:grid-cols-2"
                  }
                >
                  <Field label="Entrada" error={errors.horario_entrada}>
                    <Input
                      type="time"
                      value={values.horario_entrada}
                      onChange={(e) =>
                        setField("horario_entrada", e.target.value)
                      }
                    />
                  </Field>
                  {temAlmoco && (
                    <>
                      <Field
                        label="Saída p/ almoço"
                        error={errors.horario_saida_almoco}
                      >
                        <Input
                          type="time"
                          value={values.horario_saida_almoco}
                          onChange={(e) =>
                            setField("horario_saida_almoco", e.target.value)
                          }
                        />
                      </Field>
                      <Field
                        label="Duração do almoço"
                        error={errors.duracao_almoco_minutos}
                      >
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={0}
                            value={horasAlmoco || ""}
                            onChange={(e) => {
                              const horas = Number(e.target.value) || 0;
                              setField(
                                "duracao_almoco_minutos",
                                String(horas * 60 + minutosAlmoco),
                              );
                            }}
                            placeholder="0"
                            className="w-16"
                          />
                          <span className="text-xs text-gray-text">h</span>
                          <select
                            className={selectClass}
                            value={minutosAlmoco}
                            onChange={(e) => {
                              const minutos = Number(e.target.value);
                              setField(
                                "duracao_almoco_minutos",
                                String(horasAlmoco * 60 + minutos),
                              );
                            }}
                          >
                            <option value={0}>00 min</option>
                            <option value={15}>15 min</option>
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                          </select>
                        </div>
                      </Field>
                    </>
                  )}
                  <Field label="Saída" error={errors.horario_saida}>
                    <Input
                      type="time"
                      value={values.horario_saida}
                      onChange={(e) =>
                        setField("horario_saida", e.target.value)
                      }
                    />
                  </Field>
                </div>
              </div>

              {podeGerenciarPin && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                      Código de Ponto (PIN) — opcional
                    </h3>
                    <p className="mt-1 text-xs text-gray-text">
                      Plano B pro Bater Ponto quando o reconhecimento facial
                      não funcionar. De 4 a 6 números, só administrador ou
                      gerente pode definir.
                    </p>
                  </div>

                  {!isEditing ? (
                    <p className="text-xs text-gray-text">
                      Cadastre o funcionário primeiro pra poder definir o
                      código de ponto.
                    </p>
                  ) : (
                    <div className="space-y-3 rounded-xl border border-gray-text/20 p-4">
                      <div className="flex items-center gap-2">
                        <KeyRound className="size-4 text-gray-text" />
                        {pinConfigurado ? (
                          <span className="text-sm font-medium text-status-disponivel">
                            •••• configurado
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-gray-text">
                            Não configurado
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-end gap-3">
                        <Field label="Novo código" className="flex flex-col gap-1.5">
                          <Input
                            value={pinInput}
                            onChange={(e) =>
                              setPinInput(
                                e.target.value.replace(/\D/g, "").slice(0, 6),
                              )
                            }
                            placeholder="0000"
                            inputMode="numeric"
                            className="w-32"
                          />
                        </Field>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSalvarPin}
                          disabled={pinSaving}
                          className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
                        >
                          {pinSaving && <Loader2 className="size-4 animate-spin" />}
                          {pinConfigurado ? "Atualizar código" : "Salvar código"}
                        </Button>
                        {pinConfigurado && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoverPin}
                            disabled={pinSaving}
                          >
                            Remover código
                          </Button>
                        )}
                      </div>

                      {pinError && (
                        <p className="text-xs font-medium text-status-ocupado">
                          {pinError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {formError && (
                <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                  {formError}
                </p>
              )}
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-light bg-white px-6 py-4">
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
                {isEditing ? "Salvar alterações" : "Cadastrar funcionário"}
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      <CapturaFacialModal
        open={capturaOpen}
        onOpenChange={setCapturaOpen}
        onConcluido={handleCapturaConcluida}
      />
    </>
  );
}
