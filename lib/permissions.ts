import type { CargoUsuario } from "@/types/usuario";
import {
  relatoriosFinanceiros,
  relatoriosOperacionais,
  type RelatorioTab,
} from "@/types/relatorio";

/**
 * Matriz de permissões por cargo. Cobre os exemplos pedidos na Etapa 9
 * (recepção não exclui funcionários, limpeza fica restrita a quartos, etc).
 * A exclusão de funcionários também é reforçada no banco via RLS
 * (policy funcionarios_delete_privilegiado) — aqui é a camada de UI.
 */
export interface PermissoesCargo {
  label: string;
  podeExcluirFuncionarios: boolean;
  podeVerSalario: boolean;
  /** Corrigir/lançar pontos manualmente (também reforçado no banco). */
  podeCorrigirPonto: boolean;
  /** Abas do módulo de Relatórios (Etapa 10) liberadas para o cargo. */
  relatoriosPermitidos: RelatorioTab[];
  /** Prefixos de rota liberados no menu. "*" libera tudo. */
  navegacao: string[];
}

const todosRelatorios: RelatorioTab[] = [...relatoriosOperacionais, ...relatoriosFinanceiros];

export const permissoesPorCargo: Record<CargoUsuario, PermissoesCargo> = {
  administrador: {
    label: "Administrador",
    podeExcluirFuncionarios: true,
    podeVerSalario: true,
    podeCorrigirPonto: true,
    relatoriosPermitidos: todosRelatorios,
    navegacao: ["*"],
  },
  gerente: {
    label: "Gerente",
    podeExcluirFuncionarios: true,
    podeVerSalario: true,
    podeCorrigirPonto: true,
    relatoriosPermitidos: todosRelatorios,
    navegacao: ["*"],
  },
  recepcao: {
    label: "Recepção",
    podeExcluirFuncionarios: false,
    podeVerSalario: false,
    podeCorrigirPonto: false,
    relatoriosPermitidos: relatoriosOperacionais,
    navegacao: [
      "/admin/dashboard",
      "/admin/calendario",
      "/admin/quartos",
      "/admin/hospedes",
      "/admin/reservas",
      "/admin/checkin-checkout",
      "/admin/estoque",
      "/admin/caixa",
      "/admin/funcionarios",
      "/admin/bater-ponto",
      "/admin/relatorios",
    ],
  },
  financeiro: {
    label: "Financeiro",
    podeExcluirFuncionarios: false,
    podeVerSalario: true,
    podeCorrigirPonto: false,
    relatoriosPermitidos: relatoriosFinanceiros,
    navegacao: [
      "/admin/dashboard",
      "/admin/quartos",
      "/admin/reservas",
      "/admin/estoque",
      "/admin/caixa",
      "/admin/funcionarios",
      "/admin/bater-ponto",
      "/admin/relatorios",
    ],
  },
  limpeza: {
    label: "Limpeza",
    podeExcluirFuncionarios: false,
    podeVerSalario: false,
    podeCorrigirPonto: false,
    relatoriosPermitidos: [],
    navegacao: ["/admin/dashboard", "/admin/quartos", "/admin/checkin-checkout"],
  },
};

export function podeAcessarRota(cargo: CargoUsuario, href: string): boolean {
  const permissoes = permissoesPorCargo[cargo];
  if (permissoes.navegacao.includes("*")) return true;
  return permissoes.navegacao.some((permitido) => href.startsWith(permitido));
}
