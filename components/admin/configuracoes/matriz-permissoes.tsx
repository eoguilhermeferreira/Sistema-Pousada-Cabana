import { Check, ShieldCheck, X } from "lucide-react";

import { adminNavItems } from "@/lib/admin-nav";
import { permissoesPorCargo, podeAcessarRota } from "@/lib/permissions";
import { cargoLabels, cargoOptions } from "@/types/usuario";

export function MatrizPermissoes() {
  return (
    <div className="rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary-dark">
        <ShieldCheck className="size-4 text-primary" />
        Níveis de acesso
      </h2>
      <p className="mb-4 text-xs text-gray-text">
        Cada cargo visualiza apenas os módulos permitidos. Administrador tem acesso total.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-light bg-admin-bg/60">
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
                Módulo
              </th>
              {cargoOptions.map((cargo) => (
                <th
                  key={cargo}
                  className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-text"
                >
                  {cargoLabels[cargo]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adminNavItems.map((item) => (
              <tr key={item.href} className="border-b border-gray-light last:border-0">
                <td className="px-3 py-2 text-primary-dark">{item.label}</td>
                {cargoOptions.map((cargo) => {
                  const permitido = podeAcessarRota(cargo, item.href);
                  return (
                    <td key={cargo} className="px-3 py-2 text-center">
                      {permitido ? (
                        <Check className="mx-auto size-4 text-status-disponivel" />
                      ) : (
                        <X className="mx-auto size-4 text-gray-text/30" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="px-3 py-2 font-medium text-primary-dark">Excluir funcionários</td>
              {cargoOptions.map((cargo) => (
                <td key={cargo} className="px-3 py-2 text-center">
                  {permissoesPorCargo[cargo].podeExcluirFuncionarios ? (
                    <Check className="mx-auto size-4 text-status-disponivel" />
                  ) : (
                    <X className="mx-auto size-4 text-gray-text/30" />
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium text-primary-dark">Ver salário</td>
              {cargoOptions.map((cargo) => (
                <td key={cargo} className="px-3 py-2 text-center">
                  {permissoesPorCargo[cargo].podeVerSalario ? (
                    <Check className="mx-auto size-4 text-status-disponivel" />
                  ) : (
                    <X className="mx-auto size-4 text-gray-text/30" />
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
