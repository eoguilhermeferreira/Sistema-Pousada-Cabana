import { ArrowLeftRight, Boxes, PackageX, Wallet } from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import type { ResumoEstoque } from "@/types/produto";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function EstoqueResumoCards({ resumo }: { resumo: ResumoEstoque }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={Boxes}
        label="Produtos cadastrados"
        value={String(resumo.produtosCadastrados)}
        accent="primary"
      />
      <StatCard
        icon={PackageX}
        label="Sem estoque"
        value={String(resumo.semEstoque)}
        accent="ocupado"
      />
      <StatCard
        icon={ArrowLeftRight}
        label="Movimentações hoje"
        value={String(resumo.movimentacoesHoje)}
        accent="checkin"
      />
      <StatCard
        icon={Wallet}
        label="Valor total em estoque"
        value={currency.format(resumo.valorTotalEstoque)}
        accent="disponivel"
      />
    </div>
  );
}
