import { formatCpfCnpj } from "@/lib/cpf";
import { formatCep } from "@/lib/cep";
import { formatPhone } from "@/lib/phone";
import type { NotaFiscalPdfData } from "@/lib/nota-fiscal-pdf";
import {
  formatNumeroNota,
  statusNotaLabels,
  type EmpresaConfiguracao,
  type NotaFiscalComProdutos,
} from "@/types/nota-fiscal";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const competenciaFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function formatCompetencia(value: string) {
  const texto = competenciaFormatter.format(new Date(`${value}T00:00:00`));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Endereço e CEP são campos próprios na nota — CEP não entra mais junto
 * com o resto do endereço, cada um aparece com seu título. */
function montarEndereco(partes: {
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
}): { enderecoCompleto: string; cepFormatado: string } {
  const linha1 = [partes.rua, partes.numero].filter(Boolean).join(", ");
  const linha2 = [partes.bairro, partes.cidade && partes.estado ? `${partes.cidade}/${partes.estado}` : partes.cidade]
    .filter(Boolean)
    .join(" — ");
  return {
    enderecoCompleto: [linha1, partes.complemento, linha2].filter(Boolean).join(" · "),
    cepFormatado: partes.cep ? formatCep(partes.cep) : "",
  };
}

export function montarDadosPdf(
  nota: NotaFiscalComProdutos,
  empresa: EmpresaConfiguracao,
): NotaFiscalPdfData {
  return {
    numeroFormatado: formatNumeroNota(nota.numero, nota.serie),
    statusLabel: statusNotaLabels[nota.status as keyof typeof statusNotaLabels] ?? nota.status,
    dataEmissaoFormatada: formatDate(nota.data_emissao),
    competenciaFormatada: formatCompetencia(nota.competencia),
    codigoAutenticacao: nota.codigo_autenticacao,
    observacoes: nota.observacoes,
    empresa: {
      razaoSocial: empresa.razao_social || "Pousada Cabana",
      nomeFantasia: empresa.nome_fantasia || "Pousada Cabana",
      cnpjFormatado: empresa.cnpj ? formatCpfCnpj(empresa.cnpj) : "",
      inscricaoMunicipal: empresa.inscricao_municipal,
      telefone: empresa.telefone ? formatPhone(empresa.telefone) : "",
      email: empresa.email,
      ...montarEndereco({
        rua: empresa.endereco || null,
        numero: null,
        complemento: null,
        bairro: null,
        cidade: empresa.cidade || null,
        estado: empresa.estado || null,
        cep: empresa.cep || null,
      }),
    },
    tomador: {
      nome: nota.tomador_nome,
      documentoFormatado: nota.tomador_documento ? formatCpfCnpj(nota.tomador_documento) : "—",
      telefoneFormatado: nota.tomador_telefone ? formatPhone(nota.tomador_telefone) : "",
      email: nota.tomador_email ?? "",
      empresa: nota.tomador_empresa ?? "",
      ...montarEndereco({
        rua: nota.tomador_rua,
        numero: nota.tomador_numero,
        complemento: nota.tomador_complemento,
        bairro: nota.tomador_bairro,
        cidade: nota.tomador_cidade,
        estado: nota.tomador_estado,
        cep: nota.tomador_cep,
      }),
    },
    servico: {
      descricao: nota.servico_descricao,
      quantidade: nota.servico_quantidade,
      valorUnitario: nota.servico_valor_unitario,
      valorTotal: nota.servico_valor_total,
      observacoes: null,
    },
    produtos: nota.produtos.map((item) => ({
      descricao: item.descricao,
      quantidade: item.quantidade,
      valorUnitario: item.valor_unitario,
      valorTotal: item.valor_total,
    })),
    resumo: {
      valorServicos: nota.servico_valor_total,
      valorProdutos: nota.valor_produtos,
      desconto: nota.desconto,
      issAliquota: nota.iss_aliquota,
      issValor: nota.iss_valor,
      valorFinal: nota.valor_final,
    },
  };
}
