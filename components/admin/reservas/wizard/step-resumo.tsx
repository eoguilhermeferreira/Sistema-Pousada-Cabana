import { formatCpf } from "@/lib/cpf";
import { formatPhone } from "@/lib/phone";
import { calcularValores } from "@/lib/reserva-pricing";
import type { Hospede } from "@/types/hospede";
import type { QuartoDetalhado } from "@/types/quarto";
import type { CriancaWizard } from "@/components/admin/reservas/wizard/step-hospedes";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  if (!value) return "—";
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

interface StepResumoProps {
  hospede: Hospede;
  quarto: QuartoDetalhado;
  dataEntrada: string;
  dataSaida: string;
  noites: number;
  adultos: number;
  criancas: CriancaWizard[];
  observacoes: string;
  onChangeObservacoes: (value: string) => void;
}

const textareaClass =
  "flex min-h-20 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function StepResumo({
  hospede,
  quarto,
  dataEntrada,
  dataSaida,
  noites,
  adultos,
  criancas,
  observacoes,
  onChangeObservacoes,
}: StepResumoProps) {
  const criancasValidas = criancas
    .filter((c) => c.idade !== "" && !Number.isNaN(Number(c.idade)))
    .map((c) => ({ ...c, idadeNum: Number(c.idade) }));

  const valores = calcularValores({
    noites,
    valorDiaria: quarto.valor_diaria,
    valorCasal: quarto.valor_casal,
    valorPessoaAdicional: quarto.valor_pessoa_adicional,
    adultos,
    criancas: criancasValidas.map((c) => ({ idade: c.idadeNum })),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1 rounded-xl border border-gray-light p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
            Hóspede principal
          </p>
          <p className="text-sm font-medium text-primary-dark">{hospede.nome}</p>
          <p className="text-xs text-gray-text">
            {[
              hospede.cpf ? formatCpf(hospede.cpf) : null,
              hospede.telefone ? formatPhone(hospede.telefone) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {hospede.empresa && (
            <p className="text-xs text-gray-text">{hospede.empresa}</p>
          )}
        </div>

        <div className="space-y-1 rounded-xl border border-gray-light p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
            Quarto
          </p>
          <p className="text-sm font-medium text-primary-dark">
            Quarto {quarto.numero} · {quarto.categoria.nome}
          </p>
          <p className="text-xs text-gray-text">
            {formatDate(dataEntrada)} → {formatDate(dataSaida)} · {noites}{" "}
            {noites === 1 ? "noite" : "noites"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
          Demais hóspedes
        </p>
        <p className="text-sm text-primary-dark">
          {adultos} {adultos === 1 ? "adulto" : "adultos"}
          {criancasValidas.length > 0 &&
            ` · ${criancasValidas.length} ${criancasValidas.length === 1 ? "criança" : "crianças"}`}
        </p>
        {criancasValidas.length > 0 && (
          <ul className="space-y-1">
            {criancasValidas.map((crianca) => (
              <li key={crianca.id} className="text-xs text-gray-text">
                {crianca.nome || "Criança"} · {crianca.idadeNum} anos
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2 rounded-xl border border-gray-light p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
          Resumo financeiro
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-text">
            Hospedagem ({noites} ×{" "}
            {currency.format(noites > 0 ? valores.valorHospedagem / noites : quarto.valor_diaria)}
            {valores.adultosEquivalentes > 1 && ` · ${valores.adultosEquivalentes} adultos`})
          </span>
          <span className="font-medium text-primary-dark">
            {currency.format(valores.valorHospedagem)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-text">Acréscimo de crianças</span>
          <span className="font-medium text-primary-dark">
            {currency.format(valores.valorCriancas)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-light pt-2 text-sm">
          <span className="font-semibold text-primary-dark">Valor total</span>
          <span className="font-sans text-base font-semibold text-primary-dark">
            {currency.format(valores.valorTotal)}
          </span>
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-text">
          Observações
        </span>
        <textarea
          className={textareaClass}
          value={observacoes}
          onChange={(e) => onChangeObservacoes(e.target.value)}
          placeholder="Preferências, combinados, observações da reserva..."
        />
      </label>
    </div>
  );
}
