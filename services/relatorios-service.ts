import { createClient } from "@/lib/supabase/client";
import { dateKey } from "@/lib/calendar-grid";
import { agruparPontosPorDia } from "@/types/ponto";
import type { Turno } from "@/types/funcionario";
import { cargoLabels } from "@/types/usuario";
import { formaPagamentoLabels } from "@/types/caixa";
import type {
  FiltrosRelatorioCaixa,
  FiltrosRelatorioEstoque,
  FiltrosRelatorioFinanceiro,
  FiltrosRelatorioFuncionarios,
  FiltrosRelatorioHospedagens,
  FiltrosRelatorioQuartos,
  LinhaRelatorioCaixa,
  LinhaRelatorioEstoque,
  LinhaRelatorioFinanceiro,
  LinhaRelatorioFuncionario,
  LinhaRelatorioHospedagem,
  LinhaRelatorioQuarto,
  RelatorioEstoqueResumo,
  RelatorioFinanceiroResumo,
} from "@/types/relatorio";

const MS_DIA = 86_400_000;

/** Horário de início esperado por turno — usado apenas para estimar atrasos
 * no Relatório de Funcionários (não existe horário individual cadastrado). */
const turnoInicioEsperado: Record<Turno, string> = {
  manha: "08:00",
  tarde: "14:00",
  noite: "20:00",
  integral: "08:00",
};
const TOLERANCIA_ATRASO_MIN = 15;

// ---------------------------------------------------------------------------
// Hospedagens
// ---------------------------------------------------------------------------
export async function getRelatorioHospedagens(
  filtros: FiltrosRelatorioHospedagens,
): Promise<LinhaRelatorioHospedagem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reservas")
    .select(
      "id, codigo, status, data_entrada, data_saida, valor_total, quarto_id, hospede_principal:hospedes!reservas_hospede_principal_id_fkey(nome, empresa), quarto:quartos(numero, categoria_id, categoria:categorias_quarto(nome))",
    )
    .gte("data_entrada", filtros.inicio)
    .lte("data_entrada", filtros.fim)
    .order("data_entrada", { ascending: false })
    .limit(2000);
  if (error) throw error;

  type Linha = {
    id: string;
    codigo: string;
    status: LinhaRelatorioHospedagem["status"];
    data_entrada: string;
    data_saida: string;
    valor_total: number;
    quarto_id: string;
    hospede_principal: { nome: string; empresa: string | null } | null;
    quarto: { numero: string; categoria_id: string; categoria: { nome: string } | null } | null;
  };

  return ((data ?? []) as unknown as Linha[])
    .filter((r) => !filtros.quartoId || r.quarto_id === filtros.quartoId)
    .filter((r) => !filtros.categoriaId || r.quarto?.categoria_id === filtros.categoriaId)
    .filter(
      (r) =>
        !filtros.empresa ||
        (r.hospede_principal?.empresa ?? "")
          .toLowerCase()
          .includes(filtros.empresa.toLowerCase()),
    )
    .filter((r) => !filtros.status || r.status === filtros.status)
    .map((r) => {
      const diarias = Math.round(
        (new Date(r.data_saida).getTime() - new Date(r.data_entrada).getTime()) / MS_DIA,
      );
      return {
        reservaId: r.id,
        codigo: r.codigo,
        hospede: r.hospede_principal?.nome ?? "—",
        empresa: r.hospede_principal?.empresa ?? null,
        categoria: r.quarto?.categoria?.nome ?? "—",
        quarto: r.quarto?.numero ?? "—",
        checkin: r.data_entrada,
        checkout: r.data_saida,
        diarias,
        valor: r.valor_total,
        status: r.status,
      };
    });
}

// ---------------------------------------------------------------------------
// Quartos
// ---------------------------------------------------------------------------
export async function getRelatorioQuartos(
  filtros: FiltrosRelatorioQuartos,
): Promise<LinhaRelatorioQuarto[]> {
  const supabase = createClient();
  const inicioISO = `${filtros.inicio}T00:00:00`;
  const fimISO = `${filtros.fim}T23:59:59`;

  const [{ data: quartos, error: quartosErr }, { data: reservas, error: reservasErr }, { data: historico, error: historicoErr }] =
    await Promise.all([
      supabase.from("quartos").select("id, numero, categoria_id, categoria:categorias_quarto(nome)"),
      supabase
        .from("reservas")
        .select("quarto_id, data_entrada, data_saida, status")
        .gte("data_entrada", filtros.inicio)
        .lte("data_entrada", filtros.fim)
        .in("status", ["checkin_realizado", "checkout_realizado"]),
      supabase
        .from("quarto_historico")
        .select("quarto_id, status_novo, alterado_em")
        .gte("alterado_em", inicioISO)
        .lte("alterado_em", fimISO)
        .order("alterado_em", { ascending: true }),
    ]);
  if (quartosErr) throw quartosErr;
  if (reservasErr) throw reservasErr;
  if (historicoErr) throw historicoErr;

  type QuartoRow = { id: string; numero: string; categoria_id: string; categoria: { nome: string } | null };
  const agora = new Date();

  return ((quartos ?? []) as unknown as QuartoRow[])
    .filter((q) => !filtros.categoriaId || q.categoria_id === filtros.categoriaId)
    .map((quarto) => {
      const reservasDoQuarto = (reservas ?? []).filter((r) => r.quarto_id === quarto.id);
      const quantidadeHospedagens = reservasDoQuarto.length;
      const tempoMedioOcupadoDias =
        quantidadeHospedagens > 0
          ? reservasDoQuarto.reduce(
              (total, r) =>
                total +
                (new Date(r.data_saida).getTime() - new Date(r.data_entrada).getTime()) / MS_DIA,
              0,
            ) / quantidadeHospedagens
          : null;

      const historicoDoQuarto = (historico ?? []).filter((h) => h.quarto_id === quarto.id);
      const quantidadeLimpezas = historicoDoQuarto.filter((h) => h.status_novo === "limpeza").length;
      const quantidadeManutencoes = historicoDoQuarto.filter(
        (h) => h.status_novo === "manutencao",
      ).length;

      const duracoesDisponivel: number[] = [];
      historicoDoQuarto.forEach((h, index) => {
        if (h.status_novo !== "disponivel") return;
        const inicio = new Date(h.alterado_em);
        const proximo = historicoDoQuarto[index + 1];
        const fim = proximo ? new Date(proximo.alterado_em) : agora;
        duracoesDisponivel.push((fim.getTime() - inicio.getTime()) / MS_DIA);
      });
      const tempoMedioDisponivelDias =
        duracoesDisponivel.length > 0
          ? duracoesDisponivel.reduce((a, b) => a + b, 0) / duracoesDisponivel.length
          : null;

      return {
        quartoId: quarto.id,
        numero: quarto.numero,
        categoria: quarto.categoria?.nome ?? "—",
        quantidadeHospedagens,
        tempoMedioOcupadoDias,
        tempoMedioDisponivelDias,
        quantidadeLimpezas,
        quantidadeManutencoes,
      };
    })
    .sort((a, b) => a.numero.localeCompare(b.numero, "pt-BR", { numeric: true }));
}

// ---------------------------------------------------------------------------
// Financeiro
// ---------------------------------------------------------------------------
export async function getRelatorioFinanceiro(
  filtros: FiltrosRelatorioFinanceiro,
): Promise<{ resumo: RelatorioFinanceiroResumo; linhas: LinhaRelatorioFinanceiro[] }> {
  const supabase = createClient();
  const agora = new Date();
  const hojeKey = dateKey(agora);
  const inicioSemana = new Date(agora.getTime() - agora.getDay() * MS_DIA);
  const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioAno = new Date(agora.getFullYear(), 0, 1);
  const desde400 = new Date(agora.getTime() - 400 * MS_DIA).toISOString();

  const [
    { data: pagamentosPeriodo, error: pagErr },
    { data: pagamentosSnapshot, error: snapshotErr },
    { data: movimentacoesCaixa, error: caixaErr },
    { data: vendasBalcao, error: vendasErr },
  ] = await Promise.all([
    supabase
      .from("pagamentos")
      .select(
        "id, created_at, valor_hospedagem, valor_consumo, valor_total, reserva:reservas(codigo), pagamento_formas(forma, valor)",
      )
      .gte("created_at", `${filtros.inicio}T00:00:00`)
      .lte("created_at", `${filtros.fim}T23:59:59`)
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase.from("pagamentos").select("valor_total, created_at").gte("created_at", desde400),
    supabase
      .from("caixa_movimentacoes")
      .select("tipo, valor, created_at")
      .gte("created_at", `${filtros.inicio}T00:00:00`)
      .lte("created_at", `${filtros.fim}T23:59:59`),
    supabase
      .from("vendas_balcao")
      .select("valor_total, status")
      .eq("status", "finalizada")
      .gte("created_at", `${filtros.inicio}T00:00:00`)
      .lte("created_at", `${filtros.fim}T23:59:59`),
  ]);
  if (pagErr) throw pagErr;
  if (snapshotErr) throw snapshotErr;
  if (caixaErr) throw caixaErr;
  if (vendasErr) throw vendasErr;

  const somaSnapshot = (filtro: (data: Date) => boolean) =>
    (pagamentosSnapshot ?? [])
      .filter((p) => filtro(new Date(p.created_at)))
      .reduce((total, p) => total + p.valor_total, 0);

  const resumo: RelatorioFinanceiroResumo = {
    receitaDiaria: somaSnapshot((d) => dateKey(d) === hojeKey),
    receitaSemanal: somaSnapshot((d) => d >= inicioSemana),
    receitaMensal: somaSnapshot((d) => d >= inicioMesAtual),
    receitaAnual: somaSnapshot((d) => d >= inicioAno),
    entradas: (movimentacoesCaixa ?? [])
      .filter((m) => m.tipo === "entrada")
      .reduce((total, m) => total + m.valor, 0),
    saidas: (movimentacoesCaixa ?? [])
      .filter((m) => m.tipo === "saida")
      .reduce((total, m) => total + m.valor, 0),
    lucroBruto: 0,
    receitaHospedagem: (pagamentosPeriodo ?? []).reduce((t, p) => t + p.valor_hospedagem, 0),
    receitaConsumo: (pagamentosPeriodo ?? []).reduce((t, p) => t + p.valor_consumo, 0),
    receitaVendaBalcao: (vendasBalcao ?? []).reduce((t, v) => t + v.valor_total, 0),
  };
  resumo.lucroBruto = resumo.entradas - resumo.saidas;

  type PagamentoRow = {
    id: string;
    created_at: string;
    valor_hospedagem: number;
    valor_consumo: number;
    valor_total: number;
    reserva: { codigo: string } | null;
    pagamento_formas: { forma: string; valor: number }[];
  };

  const linhas: LinhaRelatorioFinanceiro[] = ((pagamentosPeriodo ?? []) as unknown as PagamentoRow[])
    .filter(
      (p) =>
        !filtros.formaPagamento ||
        p.pagamento_formas.some((f) => f.forma === filtros.formaPagamento),
    )
    .map((p) => ({
      pagamentoId: p.id,
      data: p.created_at,
      reservaCodigo: p.reserva?.codigo ?? "—",
      descricao:
        p.valor_hospedagem > 0 && p.valor_consumo > 0
          ? "Hospedagem + consumo"
          : p.valor_hospedagem > 0
            ? "Hospedagem"
            : "Consumo",
      formaPagamento: p.pagamento_formas
        .map((f) => formaPagamentoLabels[f.forma as keyof typeof formaPagamentoLabels] ?? f.forma)
        .join(" + "),
      valorHospedagem: p.valor_hospedagem,
      valorConsumo: p.valor_consumo,
      valorTotal: p.valor_total,
    }));

  return { resumo, linhas };
}

// ---------------------------------------------------------------------------
// Estoque
// ---------------------------------------------------------------------------
export async function getRelatorioEstoque(
  filtros: FiltrosRelatorioEstoque,
): Promise<{ resumo: RelatorioEstoqueResumo; linhas: LinhaRelatorioEstoque[] }> {
  const supabase = createClient();
  const [{ data: movimentacoes, error: movErr }, { data: produtos, error: produtosErr }] =
    await Promise.all([
      supabase
        .from("estoque")
        .select(
          "id, tipo, quantidade, valor_total, created_at, produto:produtos(nome, categoria_id, categoria:categorias_produto(nome))",
        )
        .gte("created_at", `${filtros.inicio}T00:00:00`)
        .lte("created_at", `${filtros.fim}T23:59:59`)
        .order("created_at", { ascending: false })
        .limit(3000),
      supabase.from("produtos").select("id, quantidade, ativo").eq("ativo", true),
    ]);
  if (movErr) throw movErr;
  if (produtosErr) throw produtosErr;

  type MovimentacaoRow = {
    id: string;
    tipo: LinhaRelatorioEstoque["tipo"];
    quantidade: number;
    valor_total: number | null;
    created_at: string;
    produto: { nome: string; categoria_id: string; categoria: { nome: string } | null } | null;
  };

  const movimentacoesFiltradas = ((movimentacoes ?? []) as unknown as MovimentacaoRow[]).filter(
    (m) => !filtros.categoriaId || m.produto?.categoria_id === filtros.categoriaId,
  );

  const resumo: RelatorioEstoqueResumo = {
    produtosVendidos: movimentacoesFiltradas
      .filter((m) => m.tipo === "consumo_quarto")
      .reduce((total, m) => total + m.quantidade, 0),
    produtosSemEstoque: (produtos ?? []).filter((p) => p.quantidade <= 0).length,
    entradas: movimentacoesFiltradas
      .filter((m) => m.tipo === "entrada")
      .reduce((total, m) => total + m.quantidade, 0),
    saidas: movimentacoesFiltradas
      .filter((m) => m.tipo === "saida")
      .reduce((total, m) => total + m.quantidade, 0),
    perdas: movimentacoesFiltradas
      .filter((m) => m.tipo === "perda")
      .reduce((total, m) => total + m.quantidade, 0),
    ajustes: movimentacoesFiltradas.filter((m) => m.tipo === "ajuste").length,
    vendidosBalcao: movimentacoesFiltradas
      .filter((m) => m.tipo === "venda_balcao")
      .reduce((total, m) => total + Math.abs(m.quantidade), 0),
    consumidosFuncionarios: movimentacoesFiltradas
      .filter((m) => m.tipo === "consumo_funcionario")
      .reduce((total, m) => total + Math.abs(m.quantidade), 0),
  };

  const linhas: LinhaRelatorioEstoque[] = movimentacoesFiltradas.map((m) => ({
    movimentacaoId: m.id,
    data: m.created_at,
    produto: m.produto?.nome ?? "—",
    categoria: m.produto?.categoria?.nome ?? "—",
    tipo: m.tipo,
    quantidade: m.quantidade,
    valorTotal: m.valor_total,
  }));

  return { resumo, linhas };
}

// ---------------------------------------------------------------------------
// Funcionários
// ---------------------------------------------------------------------------
export async function getRelatorioFuncionarios(
  filtros: FiltrosRelatorioFuncionarios,
): Promise<LinhaRelatorioFuncionario[]> {
  const supabase = createClient();
  const hojeKey = dateKey(new Date());

  let query = supabase
    .from("funcionarios")
    .select("id, nome, cargo, turno, status, data_admissao")
    .order("nome", { ascending: true });
  if (filtros.funcionarioId) query = query.eq("id", filtros.funcionarioId);
  if (filtros.cargo) query = query.eq("cargo", filtros.cargo);

  const { data: funcionarios, error: funcErr } = await query;
  if (funcErr) throw funcErr;
  if (!funcionarios || funcionarios.length === 0) return [];

  const ids = funcionarios.map((f) => f.id);
  const [{ data: pontos, error: pontosErr }, { data: consumos, error: consumosErr }] =
    await Promise.all([
      supabase
        .from("pontos")
        .select("funcionario_id, tipo, registrado_em")
        .in("funcionario_id", ids)
        .gte("registrado_em", `${filtros.inicio}T00:00:00`)
        .lte("registrado_em", `${filtros.fim}T23:59:59`)
        .order("registrado_em", { ascending: true }),
      supabase
        .from("funcionario_consumos")
        .select("funcionario_id, quantidade, valor_total, created_at")
        .in("funcionario_id", ids)
        .gte("created_at", `${filtros.inicio}T00:00:00`)
        .lte("created_at", `${filtros.fim}T23:59:59`),
    ]);
  if (pontosErr) throw pontosErr;
  if (consumosErr) throw consumosErr;

  return funcionarios.map((f) => {
    const pontosDoFuncionario = (pontos ?? []).filter((p) => p.funcionario_id === f.id);
    const entradas = pontosDoFuncionario.filter((p) => p.tipo === "entrada");
    const saidas = pontosDoFuncionario.filter((p) => p.tipo === "saida").length;
    const intervalos = pontosDoFuncionario.filter((p) => p.tipo === "saida_almoco").length;

    const dias = agruparPontosPorDia(
      pontosDoFuncionario.map((p) => ({
        id: "",
        created_at: p.registrado_em,
        updated_at: p.registrado_em,
        funcionario_id: f.id,
        tipo: p.tipo,
        registrado_em: p.registrado_em,
        metodo: "reconhecimento_facial",
        confianca: null,
        observacoes: null,
        registrado_por: null,
        minutos_diferenca: null,
        atrasado: false,
      })),
    );
    const horasTrabalhadas = dias.reduce((total, dia) => total + (dia.horasTrabalhadas ?? 0), 0);

    const horarioEsperado = turnoInicioEsperado[f.turno as Turno] ?? "08:00";
    const [horaEsperada, minutoEsperado] = horarioEsperado.split(":").map(Number);
    const limiteMinutos = horaEsperada * 60 + minutoEsperado + TOLERANCIA_ATRASO_MIN;
    const atrasos = dias.filter((dia) => {
      if (!dia.entrada) return false;
      const entrada = new Date(dia.entrada.registrado_em);
      const minutosNoDia = entrada.getHours() * 60 + entrada.getMinutes();
      return minutosNoDia > limiteMinutos;
    }).length;

    const inicio = filtros.inicio > f.data_admissao ? filtros.inicio : f.data_admissao;
    const fim = filtros.fim < hojeKey ? filtros.fim : hojeKey;
    let faltas = 0;
    if (f.status === "ativo" && inicio <= fim) {
      const diasComPonto = new Set(dias.map((dia) => dia.data));
      let cursor = new Date(`${inicio}T00:00:00`);
      const limite = new Date(`${fim}T00:00:00`);
      while (cursor <= limite) {
        const chave = dateKey(cursor);
        if (!diasComPonto.has(chave)) faltas++;
        cursor = new Date(cursor.getTime() + MS_DIA);
      }
    }

    const consumosDoFuncionario = (consumos ?? []).filter((c) => c.funcionario_id === f.id);

    return {
      funcionarioId: f.id,
      nome: f.nome,
      cargo: cargoLabels[f.cargo] ?? f.cargo,
      entradas: entradas.length,
      saidas,
      horasTrabalhadas: Math.round(horasTrabalhadas * 10) / 10,
      intervalos,
      faltas,
      atrasos,
      produtosConsumidos: consumosDoFuncionario.reduce((total, c) => total + c.quantidade, 0),
      valorConsumido: consumosDoFuncionario.reduce((total, c) => total + c.valor_total, 0),
    };
  });
}

// ---------------------------------------------------------------------------
// Caixa
// ---------------------------------------------------------------------------
export async function getRelatorioCaixa(
  filtros: FiltrosRelatorioCaixa,
): Promise<LinhaRelatorioCaixa[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("caixa")
    .select(
      "id, funcionario_nome, aberto_em, fechado_em, valor_inicial, valor_contado, diferenca, observacao_abertura, observacao_fechamento, fechado_por_usuario:usuarios!caixa_fechado_por_fkey(nome)",
    )
    .gte("aberto_em", `${filtros.inicio}T00:00:00`)
    .lte("aberto_em", `${filtros.fim}T23:59:59`)
    .order("aberto_em", { ascending: false })
    .limit(500);
  if (error) throw error;

  type CaixaRow = {
    id: string;
    funcionario_nome: string;
    aberto_em: string;
    fechado_em: string | null;
    valor_inicial: number;
    valor_contado: number | null;
    diferenca: number | null;
    observacao_abertura: string | null;
    observacao_fechamento: string | null;
    fechado_por_usuario: { nome: string } | null;
  };

  const termo = filtros.funcionario.trim().toLowerCase();

  return ((data ?? []) as unknown as CaixaRow[])
    .filter(
      (c) =>
        !termo ||
        c.funcionario_nome.toLowerCase().includes(termo) ||
        (c.fechado_por_usuario?.nome ?? "").toLowerCase().includes(termo),
    )
    .map((c) => ({
      caixaId: c.id,
      abertoPor: c.funcionario_nome,
      fechadoPor: c.fechado_por_usuario?.nome ?? null,
      abertoEm: c.aberto_em,
      fechadoEm: c.fechado_em,
      saldoInicial: c.valor_inicial,
      saldoFinal: c.valor_contado,
      diferenca: c.diferenca,
      observacoes:
        [c.observacao_abertura, c.observacao_fechamento].filter(Boolean).join(" | ") || null,
    }));
}

