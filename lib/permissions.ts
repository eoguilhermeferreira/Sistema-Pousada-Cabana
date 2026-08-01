import type { CargoUsuario } from "@/types/usuario";

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
  /** Prefixos de rota liberados no menu. "*" libera tudo. */
  navegacao: string[];
}

export const permissoesPorCargo: Record<CargoUsuario, PermissoesCargo> = {
  administrador: {
    label: "Administrador",
    podeExcluirFuncionarios: true,
    podeVerSalario: true,
    navegacao: ["*"],
  },
  gerente: {
    label: "Gerente",
    podeExcluirFuncionarios: true,
    podeVerSalario: true,
    navegacao: ["*"],
  },
  recepcao: {
    label: "Recepção",
    podeExcluirFuncionarios: false,
    podeVerSalario: false,
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
    ],
  },
  financeiro: {
    label: "Financeiro",
    podeExcluirFuncionarios: false,
    podeVerSalario: true,
    navegacao: [
      "/admin/dashboard",
      "/admin/quartos",
      "/admin/reservas",
      "/admin/estoque",
      "/admin/caixa",
      "/admin/funcionarios",
      "/admin/bater-ponto",
    ],
  },
  limpeza: {
    label: "Limpeza",
    podeExcluirFuncionarios: false,
    podeVerSalario: false,
    navegacao: ["/admin/dashboard", "/admin/quartos", "/admin/checkin-checkout"],
  },
};

export function podeAcessarRota(cargo: CargoUsuario, href: string): boolean {
  const permissoes = permissoesPorCargo[cargo];
  if (permissoes.navegacao.includes("*")) return true;
  return permissoes.navegacao.some((permitido) => href.startsWith(permitido));
}
