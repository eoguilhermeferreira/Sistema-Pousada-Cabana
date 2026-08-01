"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsuarioAtual } from "@/components/admin/usuario-context";
import { RelatorioCaixa } from "@/components/admin/relatorios/relatorio-caixa";
import { RelatorioEstoque } from "@/components/admin/relatorios/relatorio-estoque";
import { RelatorioFinanceiro } from "@/components/admin/relatorios/relatorio-financeiro";
import { RelatorioFuncionarios } from "@/components/admin/relatorios/relatorio-funcionarios";
import { RelatorioHospedagens } from "@/components/admin/relatorios/relatorio-hospedagens";
import { RelatorioQuartos } from "@/components/admin/relatorios/relatorio-quartos";
import { permissoesPorCargo } from "@/lib/permissions";
import { listCategorias, listQuartos } from "@/services/quartos-service";
import { listCategoriasProduto } from "@/services/produtos-service";
import { listFuncionarios } from "@/services/funcionarios-service";
import { relatorioTabLabels, type RelatorioTab } from "@/types/relatorio";
import type { CategoriaProduto } from "@/types/produto";
import type { CategoriaQuarto, QuartoComCategoria } from "@/types/quarto";
import type { Funcionario } from "@/types/funcionario";

const todasAbas: RelatorioTab[] = [
  "hospedagens",
  "quartos",
  "financeiro",
  "estoque",
  "funcionarios",
  "caixa",
];

export function RelatoriosPageContent() {
  const usuarioAtual = useUsuarioAtual();
  const abasVisiveis = React.useMemo(() => {
    const permitidas = permissoesPorCargo[usuarioAtual.cargo].relatoriosPermitidos;
    return todasAbas.filter((aba) => permitidas.includes(aba));
  }, [usuarioAtual.cargo]);

  const [quartos, setQuartos] = React.useState<QuartoComCategoria[]>([]);
  const [categoriasQuarto, setCategoriasQuarto] = React.useState<CategoriaQuarto[]>([]);
  const [categoriasProduto, setCategoriasProduto] = React.useState<CategoriaProduto[]>([]);
  const [funcionarios, setFuncionarios] = React.useState<Funcionario[]>([]);
  const [loadingOpcoes, setLoadingOpcoes] = React.useState(true);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      Promise.all([
        listQuartos(),
        listCategorias(),
        listCategoriasProduto(),
        listFuncionarios(),
      ])
        .then(([quartosData, categoriasQuartoData, categoriasProdutoData, funcionariosData]) => {
          setQuartos(quartosData);
          setCategoriasQuarto(categoriasQuartoData);
          setCategoriasProduto(categoriasProdutoData);
          setFuncionarios(funcionariosData);
        })
        .finally(() => setLoadingOpcoes(false));
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  if (abasVisiveis.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">Relatórios</h1>
        </div>
        <p className="rounded-2xl border border-dashed border-gray-light bg-white px-4 py-10 text-center text-sm text-gray-text">
          Nenhum relatório disponível para o seu cargo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Relatórios</h1>
        <p className="mt-1 text-sm text-gray-text">
          Relatórios completos da operação, com filtros, exportação e impressão.
        </p>
      </div>

      <Tabs defaultValue={abasVisiveis[0]}>
        <div className="rounded-2xl border border-gray-light bg-white shadow-sm print:border-0 print:shadow-none">
          <TabsList className="print:hidden">
            {abasVisiveis.map((aba) => (
              <TabsTrigger key={aba} value={aba}>
                {relatorioTabLabels[aba]}
              </TabsTrigger>
            ))}
          </TabsList>

          {abasVisiveis.includes("hospedagens") && (
            <TabsContent value="hospedagens" className="px-6 py-6">
              {!loadingOpcoes && (
                <RelatorioHospedagens quartos={quartos} categorias={categoriasQuarto} />
              )}
            </TabsContent>
          )}

          {abasVisiveis.includes("quartos") && (
            <TabsContent value="quartos" className="px-6 py-6">
              {!loadingOpcoes && <RelatorioQuartos categorias={categoriasQuarto} />}
            </TabsContent>
          )}

          {abasVisiveis.includes("financeiro") && (
            <TabsContent value="financeiro" className="px-6 py-6">
              <RelatorioFinanceiro />
            </TabsContent>
          )}

          {abasVisiveis.includes("estoque") && (
            <TabsContent value="estoque" className="px-6 py-6">
              {!loadingOpcoes && <RelatorioEstoque categorias={categoriasProduto} />}
            </TabsContent>
          )}

          {abasVisiveis.includes("funcionarios") && (
            <TabsContent value="funcionarios" className="px-6 py-6">
              {!loadingOpcoes && <RelatorioFuncionarios funcionarios={funcionarios} />}
            </TabsContent>
          )}

          {abasVisiveis.includes("caixa") && (
            <TabsContent value="caixa" className="px-6 py-6">
              <RelatorioCaixa />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
