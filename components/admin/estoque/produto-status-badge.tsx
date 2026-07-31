import { cn } from "@/lib/utils";
import {
  getStatusEstoqueProduto,
  statusEstoqueBadgeClass,
  statusEstoqueDotClass,
  statusEstoqueLabels,
  type Produto,
} from "@/types/produto";

export function ProdutoStatusBadge({
  produto,
  className,
}: {
  produto: Pick<Produto, "quantidade" | "estoque_minimo">;
  className?: string;
}) {
  const status = getStatusEstoqueProduto(produto);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        statusEstoqueBadgeClass(status),
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", statusEstoqueDotClass(status))} />
      {statusEstoqueLabels[status]}
    </span>
  );
}
