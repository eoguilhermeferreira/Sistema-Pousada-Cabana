import { createClient } from "@/lib/supabase/client";
import { onlyDigits } from "@/lib/cpf";
import { formatNumeroNota } from "@/types/nota-fiscal";
import { gerarNotaFiscalPdfBlob } from "@/lib/nota-fiscal-pdf";
import { montarDadosPdf } from "@/lib/nota-fiscal-mapper";
import { enviarWhatsapp, paraNumeroWhatsapp } from "@/lib/whatsapp-confirmacao";
import { listConsumosPorReserva } from "@/services/consumo-service";
import { getReservaById } from "@/services/reservas-service";
import { enviarParaPrefeitura } from "@/services/nota-fiscal-integracao-service";
import {
  calcularResumoNota,
  type EmpresaConfiguracao,
  type EmpresaConfiguracaoUpdate,
  type FiltrosHistoricoNotas,
  type NotaFiscal,
  type NotaFiscalComProdutos,
  type NotaFiscalFormValues,
  type NotaFiscalInsert,
  type ProdutoNotaInput,
} from "@/types/nota-fiscal";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const EMPRESA_ID = "00000000-0000-0000-0000-000000000001";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

// ---------------------------------------------------------------------------
// Empresa (dados usados no cabeçalho de toda nota)
// ---------------------------------------------------------------------------
export async function getEmpresaConfiguracao(): Promise<EmpresaConfiguracao> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("empresa_configuracoes")
    .select("*")
    .eq("id", EMPRESA_ID)
    .single();
  if (error) throw error;
  return data;
}

export async function salvarEmpresaConfiguracao(
  values: EmpresaConfiguracaoUpdate,
): Promise<EmpresaConfiguracao> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("empresa_configuracoes")
    .update(values)
    .eq("id", EMPRESA_ID)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Carregar dados de uma reserva para pré-preencher a nota
// ---------------------------------------------------------------------------
export interface DadosReservaParaNota {
  reservaId: string;
  reservaCodigo: string;
  tomadorNome: string;
  tomadorDocumento: string;
  tomadorTelefone: string;
  tomadorEmail: string;
  tomadorEmpresa: string;
  tomadorCep: string;
  tomadorRua: string;
  tomadorNumero: string;
  tomadorComplemento: string;
  tomadorCidade: string;
  tomadorBairro: string;
  tomadorEstado: string;
  servicoDescricao: string;
  servicoValorUnitario: string;
  produtos: ProdutoNotaInput[];
}

export async function carregarDadosReservaParaNota(
  reservaId: string,
): Promise<DadosReservaParaNota> {
  const [reserva, consumos] = await Promise.all([
    getReservaById(reservaId),
    listConsumosPorReserva(reservaId),
  ]);
  const hospede = reserva.hospede_principal;

  return {
    reservaId,
    reservaCodigo: reserva.codigo,
    tomadorNome: hospede.nome,
    tomadorDocumento: hospede.cpf ?? "",
    tomadorTelefone: hospede.telefone ?? "",
    tomadorEmail: hospede.email ?? "",
    tomadorEmpresa: hospede.empresa ?? "",
    tomadorCep: hospede.cep ?? "",
    tomadorRua: hospede.rua ?? "",
    tomadorNumero: hospede.numero ?? "",
    tomadorComplemento: hospede.complemento ?? "",
    tomadorBairro: hospede.bairro ?? "",
    tomadorCidade: hospede.cidade ?? "",
    tomadorEstado: hospede.estado ?? "",
    servicoDescricao: `Hospedagem referente ao período de ${formatDate(reserva.data_entrada)} até ${formatDate(reserva.data_saida)}.`,
    servicoValorUnitario: String(reserva.valor_total),
    produtos: consumos.map((c) => ({
      id: c.id,
      quartoConsumoId: c.id,
      produtoId: c.produto.id,
      descricao: c.produto.nome,
      quantidade: c.quantidade,
      valorUnitario: c.valor_unitario,
      valorTotal: c.valor_total,
    })),
  };
}

/** Notas já emitidas/rascunho para uma reserva — evita duplicidade ao
 * chegar pelo botão "Emitir Nota Fiscal" do check-out. */
export async function getNotaPorReserva(reservaId: string): Promise<NotaFiscal | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notas_fiscais")
    .select("*")
    .eq("reserva_id", reservaId)
    .neq("status", "cancelada")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// CRUD da nota
// ---------------------------------------------------------------------------
export async function getNotaById(id: string): Promise<NotaFiscalComProdutos> {
  const supabase = createClient();
  const [{ data: nota, error }, { data: produtos, error: produtosError }] = await Promise.all([
    supabase.from("notas_fiscais").select("*").eq("id", id).single(),
    supabase
      .from("notas_fiscais_produtos")
      .select("*")
      .eq("nota_fiscal_id", id)
      .order("created_at", { ascending: true }),
  ]);
  if (error) throw error;
  if (produtosError) throw produtosError;
  return { ...nota, produtos: produtos ?? [] };
}

export interface SalvarNotaParams {
  id?: string;
  form: NotaFiscalFormValues;
  produtos: ProdutoNotaInput[];
}

export async function salvarNota({ id, form, produtos }: SalvarNotaParams): Promise<NotaFiscal> {
  const supabase = createClient();

  if (id) {
    const { data: existente, error: existenteError } = await supabase
      .from("notas_fiscais")
      .select("status")
      .eq("id", id)
      .single();
    if (existenteError) throw existenteError;
    if (existente.status !== "rascunho") {
      throw new Error("Apenas notas em rascunho podem ser editadas.");
    }
  }

  const resumo = calcularResumoNota(form, produtos);

  const payload: NotaFiscalInsert = {
    data_emissao: form.dataEmissao,
    competencia: `${form.competencia}-01`,
    serie: form.serie.trim() || "1",
    observacoes: form.observacoes.trim() || null,
    reserva_id: form.reservaId,
    tomador_nome: form.tomadorNome.trim(),
    tomador_documento: onlyDigits(form.tomadorDocumento),
    tomador_telefone: form.tomadorTelefone ? onlyDigits(form.tomadorTelefone) : null,
    tomador_email: form.tomadorEmail.trim() || null,
    tomador_empresa: form.tomadorEmpresa.trim() || null,
    tomador_cep: form.tomadorCep ? onlyDigits(form.tomadorCep) : null,
    tomador_rua: form.tomadorRua.trim() || null,
    tomador_numero: form.tomadorNumero.trim() || null,
    tomador_complemento: form.tomadorComplemento.trim() || null,
    tomador_bairro: form.tomadorBairro.trim() || null,
    tomador_cidade: form.tomadorCidade.trim() || null,
    tomador_estado: form.tomadorEstado.trim() || null,
    servico_descricao: form.servicoDescricao.trim(),
    servico_quantidade: Number(form.servicoQuantidade) || 0,
    servico_valor_unitario: Number(form.servicoValorUnitario) || 0,
    servico_valor_total: resumo.valorServicos,
    desconto: resumo.desconto,
    iss_aliquota: Number(form.issAliquota) || 0,
    iss_valor: resumo.issValor,
    valor_produtos: resumo.valorProdutos,
    valor_final: resumo.valorFinal,
  };

  let nota: NotaFiscal;
  if (id) {
    const { data, error } = await supabase
      .from("notas_fiscais")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    nota = data;
  } else {
    const { data, error } = await supabase
      .from("notas_fiscais")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    nota = data;
  }

  const { error: deleteError } = await supabase
    .from("notas_fiscais_produtos")
    .delete()
    .eq("nota_fiscal_id", nota.id);
  if (deleteError) throw deleteError;

  if (produtos.length > 0) {
    const { error: insertError } = await supabase.from("notas_fiscais_produtos").insert(
      produtos.map((item) => ({
        nota_fiscal_id: nota.id,
        quarto_consumo_id: item.quartoConsumoId,
        produto_id: item.produtoId,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valor_unitario: item.valorUnitario,
        valor_total: item.valorTotal,
      })),
    );
    if (insertError) throw insertError;
  }

  return nota;
}

export async function excluirRascunho(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("notas_fiscais")
    .delete()
    .eq("id", id)
    .eq("status", "rascunho");
  if (error) throw error;
}

export async function emitirNota(id: string): Promise<NotaFiscal> {
  const supabase = createClient();

  const { data: nota, error } = await supabase
    .from("notas_fiscais")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;

  if (nota.status !== "rascunho") {
    throw new Error("Apenas notas em rascunho podem ser emitidas.");
  }
  if (!nota.tomador_nome.trim() || !nota.tomador_documento.trim()) {
    throw new Error("Preencha nome e CPF/CNPJ do tomador antes de emitir.");
  }
  if (!nota.servico_descricao.trim() || nota.servico_valor_total <= 0) {
    throw new Error("Informe a descrição e o valor do serviço antes de emitir.");
  }

  const resultado = await enviarParaPrefeitura(nota);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error: updateError } = await supabase
    .from("notas_fiscais")
    .update({
      status: "emitida",
      emitida_em: new Date().toISOString(),
      emitida_por: user?.id ?? null,
      codigo_autenticacao: resultado.codigoAutenticacao,
      protocolo_prefeitura: resultado.protocolo,
    })
    .eq("id", id)
    .select()
    .single();
  if (updateError) throw updateError;
  return data;
}

export async function cancelarNota(id: string, motivo: string): Promise<NotaFiscal> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notas_fiscais")
    .update({
      status: "cancelada",
      cancelada_em: new Date().toISOString(),
      cancelada_motivo: motivo.trim() || null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Histórico
// ---------------------------------------------------------------------------
export async function listNotas(filtros: FiltrosHistoricoNotas): Promise<NotaFiscal[]> {
  const supabase = createClient();
  let query = supabase
    .from("notas_fiscais")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (filtros.status) query = query.eq("status", filtros.status);
  if (filtros.inicio) query = query.gte("data_emissao", filtros.inicio);
  if (filtros.fim) query = query.lte("data_emissao", filtros.fim);

  const { data, error } = await query;
  if (error) throw error;

  const term = filtros.search.trim().toLowerCase();
  const termDigits = onlyDigits(filtros.search);
  if (!term) return data ?? [];

  return (data ?? []).filter(
    (nota) =>
      nota.tomador_nome.toLowerCase().includes(term) ||
      String(nota.numero).includes(term) ||
      (termDigits && nota.tomador_documento.includes(termDigits)),
  );
}

// ---------------------------------------------------------------------------
// Envio por WhatsApp (gera o PDF, sobe no Storage e manda o link pro cliente)
// ---------------------------------------------------------------------------
export async function enviarNotaFiscalWhatsapp(
  nota: NotaFiscalComProdutos,
  empresa: EmpresaConfiguracao,
): Promise<void> {
  const numero = paraNumeroWhatsapp(nota.tomador_telefone ?? "");
  if (!numero) {
    throw new Error("O tomador não tem telefone cadastrado.");
  }

  const blob = await gerarNotaFiscalPdfBlob(montarDadosPdf(nota, empresa));

  const supabase = createClient();
  const caminho = `${nota.id}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("notas-fiscais-pdf")
    .upload(caminho, blob, { contentType: "application/pdf", upsert: true });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("notas-fiscais-pdf").getPublicUrl(caminho);

  const numeroFormatado = formatNumeroNota(nota.numero, nota.serie);
  const mensagem = [
    `*Nota Fiscal — ${empresa.nome_fantasia || "Pousada Cabana"}*`,
    "",
    `Olá, ${nota.tomador_nome}! Segue sua nota fiscal.`,
    "",
    `*Nota nº:* ${numeroFormatado}`,
    `*Valor:* ${currency.format(nota.valor_final)}`,
    "",
    `PDF: ${publicUrl}`,
    "",
    "Qualquer dúvida, é só responder por aqui.",
  ].join("\n");

  const enviado = await enviarWhatsapp(numero, mensagem);
  if (!enviado) {
    throw new Error(
      "Não foi possível enviar pelo WhatsApp. Confira se o ChatNex está conectado em Configurações > Integrações.",
    );
  }
}
