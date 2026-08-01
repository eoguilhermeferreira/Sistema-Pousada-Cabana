import { createClient } from "@/lib/supabase/client";
import { dateKey, MESES } from "@/lib/calendar-grid";
import { calcularComparativo } from "@/types/dashboard";
import type {
  AlertaInteligente,
  CategoriaGrafico,
  CentroFinanceiro,
  DashboardCards,
  DashboardGraficos,
  FuncionariosPresentesGrafico,
  MovimentacaoEstoqueGrafico,
  PontoGrafico,
} from "@/types/dashboard";

const MS_DIA = 86_400_000;

function subDias(data: Date, dias: number): Date {
  return new Date(data.getTime() - dias * MS_DIA);
}

function subHoras(data: Date, horas: number): Date {
  return new Date(data.getTime() - horas * 3_600_000);
}

function inicioMes(data: Date, offsetMeses = 0): Date {
  return new Date(data.getFullYear(), data.getMonth() + offsetMeses, 1);
}

/** Últimos N dias, do mais antigo para o mais recente, como chave YYYY-MM-DD. */
function ultimosDias(n: number): string[] {
  const dias: string[] = [];
  const hoje = new Date();
  for (let i = n - 1; i >= 0; i--) {
    dias.push(dateKey(subDias(hoje, i)));
  }
  return dias;
}

function labelDiaCurto(chave: string): string {
  const [, mes, dia] = chave.split("-");
  return `${dia}/${mes}`;
}

// ---------------------------------------------------------------------------
// Cards principais
// ---------------------------------------------------------------------------
export async function getDashboardCards(): Promise<DashboardCards> {
  const supabase = createClient();
  const agora = new Date();
  const hojeKey = dateKey(agora);
  const ontemKey = dateKey(subDias(agora, 1));
  const desde = subDias(agora, 400).toISOString();
  const inicioMesAtual = inicioMes(agora);
  const inicioMesAnterior = inicioMes(agora, -1);
  const diaDoMes = agora.getDate();
  const inicioAno = new Date(agora.getFullYear(), 0, 1);
  const inicioSemana = subDias(agora, agora.getDay());

  const [
    { data: pagamentos, error: pagErr },
    { data: quartos, error: quartosErr },
    { data: reservas, error: reservasErr },
    { data: consumos, error: consumosErr },
    { data: funcionarios, error: funcionariosErr },
    { data: pontosHoje, error: pontosErr },
    { data: caixaAberto, error: caixaErr },
  ] = await Promise.all([
    supabase
      .from("pagamentos")
      .select("valor_total, created_at")
      .gte("created_at", desde),
    supabase.from("quartos").select("status"),
    supabase
      .from("reservas")
      .select("status, data_entrada, data_saida, quantidade_adultos, quantidade_criancas"),
    supabase
      .from("quarto_consumos")
      .select("quantidade, created_at")
      .gte("created_at", desde),
    supabase.from("funcionarios").select("id, status"),
    supabase
      .from("pontos")
      .select("funcionario_id, tipo, registrado_em")
      .gte("registrado_em", `${hojeKey}T00:00:00`),
    supabase.from("caixa").select("id").eq("status", "aberto").maybeSingle(),
  ]);

  if (pagErr) throw pagErr;
  if (quartosErr) throw quartosErr;
  if (reservasErr) throw reservasErr;
  if (consumosErr) throw consumosErr;
  if (funcionariosErr) throw funcionariosErr;
  if (pontosErr) throw pontosErr;
  if (caixaErr) throw caixaErr;

  const somaPagamentos = (filtro: (created_at: string) => boolean) =>
    (pagamentos ?? [])
      .filter((p) => filtro(p.created_at))
      .reduce((total, p) => total + p.valor_total, 0);

  const receitaDiaAtual = somaPagamentos((c) => dateKey(new Date(c)) === hojeKey);
  const receitaDiaAnterior = somaPagamentos((c) => dateKey(new Date(c)) === ontemKey);
  const receitaSemana = somaPagamentos((c) => new Date(c) >= inicioSemana);
  const receitaMesAtual = somaPagamentos(
    (c) => new Date(c) >= inicioMesAtual && new Date(c).getDate() <= diaDoMes,
  );
  const receitaMesAnterior = somaPagamentos((c) => {
    const data = new Date(c);
    return data >= inicioMesAnterior && data < inicioMesAtual && data.getDate() <= diaDoMes;
  });
  const receitaAno = somaPagamentos((c) => new Date(c) >= inicioAno);

  const reservasAtivas = (reservas ?? []).filter(
    (r) => r.status !== "cancelada" && r.status !== "no_show",
  );
  const checkinsHoje = reservasAtivas.filter((r) => r.data_entrada === hojeKey).length;
  const checkoutsHoje = reservasAtivas.filter((r) => r.data_saida === hojeKey).length;
  const hospedesHospedados = (reservas ?? [])
    .filter((r) => r.status === "checkin_realizado")
    .reduce((total, r) => total + r.quantidade_adultos + r.quantidade_criancas, 0);

  const quartosOcupados = (quartos ?? []).filter((q) => q.status === "ocupado").length;
  const quartosDisponiveis = (quartos ?? []).filter((q) => q.status === "disponivel").length;
  const quartosLimpeza = (quartos ?? []).filter((q) => q.status === "limpeza").length;
  const quartosManutencao = (quartos ?? []).filter((q) => q.status === "manutencao").length;
  const totalQuartos = (quartos ?? []).length;

  // Taxa de ocupação: diárias efetivamente ocupadas (hospedagens com
  // check-in realizado) sobre o total de diárias-quarto disponíveis na
  // janela — comparada ao mesmo intervalo de dias do mês anterior.
  function noitesOcupadas(inicio: Date, fimExclusivo: Date): number {
    let noites = 0;
    for (const r of reservas ?? []) {
      if (r.status !== "checkin_realizado" && r.status !== "checkout_realizado") continue;
      const entrada = new Date(`${r.data_entrada}T00:00:00`);
      const saida = new Date(`${r.data_saida}T00:00:00`);
      const inicioOverlap = entrada > inicio ? entrada : inicio;
      const fimOverlap = saida < fimExclusivo ? saida : fimExclusivo;
      const dias = Math.round((fimOverlap.getTime() - inicioOverlap.getTime()) / MS_DIA);
      if (dias > 0) noites += dias;
    }
    return noites;
  }
  function taxaOcupacaoNoPeriodo(inicio: Date, fimExclusivo: Date): number {
    const diasJanela = Math.round((fimExclusivo.getTime() - inicio.getTime()) / MS_DIA);
    if (diasJanela <= 0 || totalQuartos === 0) return 0;
    return (noitesOcupadas(inicio, fimExclusivo) / (totalQuartos * diasJanela)) * 100;
  }
  const fimJanelaAtual = new Date(inicioMesAtual.getFullYear(), inicioMesAtual.getMonth(), diaDoMes + 1);
  const fimJanelaAnterior = new Date(inicioMesAnterior.getFullYear(), inicioMesAnterior.getMonth(), diaDoMes + 1);
  const taxaOcupacaoAtual = taxaOcupacaoNoPeriodo(inicioMesAtual, fimJanelaAtual);
  const taxaOcupacaoAnterior = taxaOcupacaoNoPeriodo(inicioMesAnterior, fimJanelaAnterior);

  const produtosVendidosHoje = (consumos ?? [])
    .filter((c) => dateKey(new Date(c.created_at)) === hojeKey)
    .reduce((total, c) => total + c.quantidade, 0);

  const funcionariosAtivos = (funcionarios ?? []).filter((f) => f.status === "ativo");
  const ultimoPontoPorFuncionario = new Map<string, string>();
  for (const ponto of pontosHoje ?? []) {
    const atual = ultimoPontoPorFuncionario.get(ponto.funcionario_id);
    if (!atual || ponto.registrado_em > atual) {
      ultimoPontoPorFuncionario.set(ponto.funcionario_id, ponto.registrado_em);
    }
  }
  const tipoPorFuncionario = new Map<string, string>();
  for (const ponto of pontosHoje ?? []) {
    if (ultimoPontoPorFuncionario.get(ponto.funcionario_id) === ponto.registrado_em) {
      tipoPorFuncionario.set(ponto.funcionario_id, ponto.tipo);
    }
  }
  const funcionariosPresentes = funcionariosAtivos.filter((f) => {
    const tipo = tipoPorFuncionario.get(f.id);
    return tipo === "entrada" || tipo === "retorno_almoco";
  }).length;

  return {
    receitaDia: calcularComparativo(receitaDiaAtual, receitaDiaAnterior),
    receitaSemana,
    receitaMes: calcularComparativo(receitaMesAtual, receitaMesAnterior),
    receitaAno,
    checkinsHoje,
    checkoutsHoje,
    quartosOcupados,
    quartosDisponiveis,
    quartosLimpeza,
    quartosManutencao,
    hospedesHospedados,
    produtosVendidosHoje,
    funcionariosPresentes,
    funcionariosAtivos: funcionariosAtivos.length,
    taxaOcupacao: calcularComparativo(taxaOcupacaoAtual, taxaOcupacaoAnterior),
    caixaAberto: Boolean(caixaAberto),
  };
}

// ---------------------------------------------------------------------------
// Centro financeiro
// ---------------------------------------------------------------------------
export async function getCentroFinanceiro(
  periodo: { inicio: string; fim: string },
): Promise<CentroFinanceiro> {
  const supabase = createClient();
  const { data: pagamentos, error } = await supabase
    .from("pagamentos")
    .select("valor_hospedagem, valor_consumo, valor_total, reserva:reservas(hospede_principal:hospedes!reservas_hospede_principal_id_fkey(empresa))")
    .gte("created_at", `${periodo.inicio}T00:00:00`)
    .lte("created_at", `${periodo.fim}T23:59:59`);
  if (error) throw error;

  type Linha = {
    valor_hospedagem: number;
    valor_consumo: number;
    valor_total: number;
    reserva: { hospede_principal: { empresa: string | null } | null } | null;
  };

  const linhas = (pagamentos ?? []) as unknown as Linha[];

  let receitaHospedagem = 0;
  let receitaConsumo = 0;
  let receitaTotal = 0;
  let receitaEmpresas = 0;
  let receitaParticulares = 0;

  for (const linha of linhas) {
    receitaHospedagem += linha.valor_hospedagem;
    receitaConsumo += linha.valor_consumo;
    receitaTotal += linha.valor_total;
    const empresa = linha.reserva?.hospede_principal?.empresa;
    if (empresa && empresa.trim()) receitaEmpresas += linha.valor_total;
    else receitaParticulares += linha.valor_total;
  }

  return {
    receitaHospedagem,
    receitaConsumo,
    receitaTotal,
    receitaEmpresas,
    receitaParticulares,
  };
}

// ---------------------------------------------------------------------------
// Gráficos
// ---------------------------------------------------------------------------
export async function getDashboardGraficos(): Promise<DashboardGraficos> {
  const supabase = createClient();
  const agora = new Date();
  const desde14 = subDias(agora, 13);
  const desde30 = subDias(agora, 29);
  const desde12Meses = inicioMes(agora, -11);
  const desde5Anos = new Date(agora.getFullYear() - 4, 0, 1);

  const [
    { data: pagamentos, error: pagErr },
    { data: reservas, error: reservasErr },
    { data: quartos, error: quartosErr },
    { data: consumos, error: consumosErr },
    { data: estoque, error: estoqueErr },
    { data: pontos, error: pontosErr },
    { data: funcionarios, error: funcionariosErr },
  ] = await Promise.all([
    supabase
      .from("pagamentos")
      .select("valor_total, created_at")
      .gte("created_at", desde5Anos.toISOString()),
    supabase
      .from("reservas")
      .select("status, data_entrada, data_saida, quarto_id")
      .gte("data_entrada", dateKey(desde30))
      .not("status", "in", "(cancelada,no_show)"),
    supabase.from("quartos").select("id, categoria:categorias_quarto(nome, cor)"),
    supabase
      .from("quarto_consumos")
      .select("quantidade, valor_total, created_at, produto:produtos(nome)")
      .gte("created_at", desde30.toISOString()),
    supabase
      .from("estoque")
      .select("tipo, quantidade, created_at")
      .gte("created_at", desde30.toISOString()),
    supabase
      .from("pontos")
      .select("funcionario_id, tipo, registrado_em")
      .gte("registrado_em", desde14.toISOString()),
    supabase.from("funcionarios").select("id, status").eq("status", "ativo"),
  ]);

  if (pagErr) throw pagErr;
  if (reservasErr) throw reservasErr;
  if (quartosErr) throw quartosErr;
  if (consumosErr) throw consumosErr;
  if (estoqueErr) throw estoqueErr;
  if (pontosErr) throw pontosErr;
  if (funcionariosErr) throw funcionariosErr;

  // Receita diária (14 dias)
  const dias14 = ultimosDias(14);
  const receitaPorDia = new Map<string, number>();
  for (const p of pagamentos ?? []) {
    const chave = dateKey(new Date(p.created_at));
    receitaPorDia.set(chave, (receitaPorDia.get(chave) ?? 0) + p.valor_total);
  }
  const receitaDiaria: PontoGrafico[] = dias14.map((chave) => ({
    label: labelDiaCurto(chave),
    valor: receitaPorDia.get(chave) ?? 0,
  }));

  // Receita mensal (12 meses)
  const receitaMensalMap = new Map<string, number>();
  for (const p of pagamentos ?? []) {
    const data = new Date(p.created_at);
    if (data < desde12Meses) continue;
    const chave = `${data.getFullYear()}-${data.getMonth()}`;
    receitaMensalMap.set(chave, (receitaMensalMap.get(chave) ?? 0) + p.valor_total);
  }
  const receitaMensal: PontoGrafico[] = [];
  for (let i = 11; i >= 0; i--) {
    const data = inicioMes(agora, -i);
    const chave = `${data.getFullYear()}-${data.getMonth()}`;
    receitaMensal.push({
      label: `${MESES[data.getMonth()].slice(0, 3)}/${String(data.getFullYear()).slice(2)}`,
      valor: receitaMensalMap.get(chave) ?? 0,
    });
  }

  // Receita anual (5 anos)
  const receitaAnualMap = new Map<number, number>();
  for (const p of pagamentos ?? []) {
    const ano = new Date(p.created_at).getFullYear();
    receitaAnualMap.set(ano, (receitaAnualMap.get(ano) ?? 0) + p.valor_total);
  }
  const receitaAnual: PontoGrafico[] = [];
  for (let i = 4; i >= 0; i--) {
    const ano = agora.getFullYear() - i;
    receitaAnual.push({ label: String(ano), valor: receitaAnualMap.get(ano) ?? 0 });
  }

  // Taxa de ocupação (14 dias) — % de quartos com alguma reserva ativa tocando o dia.
  const totalQuartos = (quartos ?? []).length;
  const ocupacao: PontoGrafico[] = dias14.map((chave) => {
    if (totalQuartos === 0) return { label: labelDiaCurto(chave), valor: 0 };
    const quartosNoDia = new Set(
      (reservas ?? [])
        .filter((r) => r.data_entrada <= chave && r.data_saida > chave)
        .map((r) => r.quarto_id),
    );
    return {
      label: labelDiaCurto(chave),
      valor: Math.round((quartosNoDia.size / totalQuartos) * 1000) / 10,
    };
  });

  // Categorias de quarto mais utilizadas (por reservas ativas nos últimos 30 dias)
  type QuartoComCategoria = { id: string; categoria: { nome: string; cor: string } | null };
  const categoriaPorQuarto = new Map<string, { nome: string; cor: string }>();
  for (const q of (quartos ?? []) as unknown as QuartoComCategoria[]) {
    if (q.categoria) categoriaPorQuarto.set(q.id, q.categoria);
  }
  const contagemCategoria = new Map<string, CategoriaGrafico>();
  for (const r of reservas ?? []) {
    const categoria = categoriaPorQuarto.get(r.quarto_id);
    if (!categoria) continue;
    const atual = contagemCategoria.get(categoria.nome);
    if (atual) atual.valor += 1;
    else contagemCategoria.set(categoria.nome, { nome: categoria.nome, cor: categoria.cor, valor: 1 });
  }
  const categoriasQuarto = Array.from(contagemCategoria.values()).sort(
    (a, b) => b.valor - a.valor,
  );

  // Produtos mais vendidos (consumo dos últimos 30 dias)
  type ConsumoComProduto = { quantidade: number; produto: { nome: string } | null };
  const produtosMap = new Map<string, number>();
  for (const c of (consumos ?? []) as unknown as ConsumoComProduto[]) {
    const nome = c.produto?.nome ?? "Produto removido";
    produtosMap.set(nome, (produtosMap.get(nome) ?? 0) + c.quantidade);
  }
  const produtosMaisVendidos: PontoGrafico[] = Array.from(produtosMap.entries())
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);

  // Check-ins / check-outs por dia (14 dias)
  const checkins: PontoGrafico[] = dias14.map((chave) => ({
    label: labelDiaCurto(chave),
    valor: (reservas ?? []).filter((r) => r.data_entrada === chave).length,
  }));
  const checkouts: PontoGrafico[] = dias14.map((chave) => ({
    label: labelDiaCurto(chave),
    valor: (reservas ?? []).filter((r) => r.data_saida === chave).length,
  }));

  // Movimentação de estoque (14 dias) — entradas x saídas (inclui consumo/devolução/ajuste/perda)
  const movimentacaoEstoque: MovimentacaoEstoqueGrafico[] = dias14.map((chave) => {
    const doDia = (estoque ?? []).filter((m) => dateKey(new Date(m.created_at)) === chave);
    const entradas = doDia
      .filter((m) => m.tipo === "entrada" || m.tipo === "devolucao_quarto")
      .reduce((total, m) => total + m.quantidade, 0);
    const saidas = doDia
      .filter((m) => m.tipo === "saida" || m.tipo === "consumo_quarto" || m.tipo === "perda")
      .reduce((total, m) => total + m.quantidade, 0);
    return { label: labelDiaCurto(chave), entradas, saidas };
  });

  // Funcionários presentes por dia (14 dias) — nº de funcionários com "entrada" registrada no dia.
  const totalFuncionariosAtivos = (funcionarios ?? []).length;
  const funcionariosPresentes: FuncionariosPresentesGrafico[] = dias14.map((chave) => {
    const presentes = new Set(
      (pontos ?? [])
        .filter((p) => p.tipo === "entrada" && dateKey(new Date(p.registrado_em)) === chave)
        .map((p) => p.funcionario_id),
    );
    return { label: labelDiaCurto(chave), presentes: presentes.size, total: totalFuncionariosAtivos };
  });

  return {
    receitaDiaria,
    receitaMensal,
    receitaAnual,
    ocupacao,
    categoriasQuarto,
    produtosMaisVendidos,
    checkins,
    checkouts,
    movimentacaoEstoque,
    funcionariosPresentes,
  };
}

// ---------------------------------------------------------------------------
// Alertas inteligentes
// ---------------------------------------------------------------------------
export async function getAlertasInteligentes(): Promise<AlertaInteligente[]> {
  const supabase = createClient();
  const agora = new Date();
  const hojeKey = dateKey(agora);
  const limiarLimpeza = subHoras(agora, 3).toISOString();
  const limiteReservasProximas = dateKey(subDias(agora, -7));

  const [
    { data: produtos, error: produtosErr },
    { data: historicoLimpeza, error: limpezaErr },
    { data: quartosManutencao, error: manutencaoErr },
    { data: funcionariosAtivos, error: funcionariosErr },
    { data: pontosHoje, error: pontosErr },
    { data: caixaAberto, error: caixaErr },
    { data: checkinsHoje, error: checkinsErr },
    { data: checkoutsHoje, error: checkoutsErr },
    { data: reservasProximas, error: reservasErr },
  ] = await Promise.all([
    supabase.from("produtos").select("id, nome, quantidade").eq("ativo", true),
    supabase
      .from("quarto_historico")
      .select("quarto_id, alterado_em, quarto:quartos!inner(numero, status)")
      .eq("status_novo", "limpeza")
      .eq("quarto.status", "limpeza")
      .order("alterado_em", { ascending: false }),
    supabase.from("quartos").select("numero").eq("status", "manutencao"),
    supabase.from("funcionarios").select("id, nome").eq("status", "ativo"),
    supabase
      .from("pontos")
      .select("funcionario_id, tipo")
      .gte("registrado_em", `${hojeKey}T00:00:00`),
    supabase.from("caixa").select("aberto_em").eq("status", "aberto").maybeSingle(),
    supabase
      .from("reservas")
      .select("id")
      .eq("data_entrada", hojeKey)
      .not("status", "in", "(cancelada,no_show)"),
    supabase
      .from("reservas")
      .select("id")
      .eq("data_saida", hojeKey)
      .eq("status", "checkin_realizado"),
    supabase
      .from("reservas")
      .select("codigo, data_entrada")
      .gt("data_entrada", hojeKey)
      .lte("data_entrada", limiteReservasProximas)
      .not("status", "in", "(cancelada,no_show)")
      .order("data_entrada", { ascending: true })
      .limit(5),
  ]);

  if (produtosErr) throw produtosErr;
  if (limpezaErr) throw limpezaErr;
  if (manutencaoErr) throw manutencaoErr;
  if (funcionariosErr) throw funcionariosErr;
  if (pontosErr) throw pontosErr;
  if (caixaErr) throw caixaErr;
  if (checkinsErr) throw checkinsErr;
  if (checkoutsErr) throw checkoutsErr;
  if (reservasErr) throw reservasErr;

  const alertas: AlertaInteligente[] = [];

  const semEstoque = (produtos ?? []).filter((p) => p.quantidade <= 0);
  if (semEstoque.length > 0) {
    alertas.push({
      id: "estoque-zerado",
      titulo: "Produtos sem estoque",
      descricao:
        semEstoque.length === 1
          ? `${semEstoque[0].nome} está sem estoque.`
          : `${semEstoque.length} produtos estão sem estoque.`,
      severidade: "critico",
      href: "/admin/estoque",
    });
  }

  // Quartos aguardando limpeza há mais de 3 horas — considera apenas a
  // transição mais recente para "limpeza" de cada quarto que ainda está
  // com esse status (evita reaproveitar um ciclo de limpeza antigo).
  type LimpezaRow = { quarto_id: string; alterado_em: string; quarto: { numero: string } | null };
  const historicoOrdenado = (historicoLimpeza ?? []) as unknown as LimpezaRow[];
  const ultimaLimpezaPorQuarto = new Map<string, LimpezaRow>();
  for (const registro of historicoOrdenado) {
    if (!ultimaLimpezaPorQuarto.has(registro.quarto_id)) {
      ultimaLimpezaPorQuarto.set(registro.quarto_id, registro);
    }
  }
  const limpezaAntiga = Array.from(ultimaLimpezaPorQuarto.values()).filter(
    (registro) => registro.alterado_em <= limiarLimpeza,
  );
  if (limpezaAntiga.length > 0) {
    const numeros = limpezaAntiga
      .map((l) => l.quarto?.numero)
      .filter((n): n is string => Boolean(n));
    if (numeros.length > 0) {
      alertas.push({
        id: "limpeza-atrasada",
        titulo: "Quartos aguardando limpeza há muito tempo",
        descricao: `Quarto${numeros.length > 1 ? "s" : ""} ${numeros.join(", ")} aguardando limpeza há mais de 3 horas.`,
        severidade: "atencao",
        href: "/admin/quartos",
      });
    }
  }

  if ((quartosManutencao ?? []).length > 0) {
    const numeros = (quartosManutencao ?? []).map((q) => q.numero);
    alertas.push({
      id: "quartos-manutencao",
      titulo: "Quartos em manutenção",
      descricao: `Quarto${numeros.length > 1 ? "s" : ""} ${numeros.join(", ")} em manutenção.`,
      severidade: "atencao",
      href: "/admin/quartos",
    });
  }

  const registraramEntrada = new Set(
    (pontosHoje ?? []).filter((p) => p.tipo === "entrada").map((p) => p.funcionario_id),
  );
  const semRegistro = (funcionariosAtivos ?? []).filter((f) => !registraramEntrada.has(f.id));
  if (semRegistro.length > 0) {
    alertas.push({
      id: "ponto-nao-registrado",
      titulo: "Funcionários sem registro de entrada",
      descricao:
        semRegistro.length === 1
          ? `${semRegistro[0].nome} ainda não registrou entrada hoje.`
          : `${semRegistro.length} funcionários ainda não registraram entrada hoje.`,
      severidade: "info",
      href: "/admin/funcionarios",
    });
  }

  if (caixaAberto) {
    alertas.push({
      id: "caixa-aberto",
      titulo: "Caixa ainda aberto",
      descricao: "Há um caixa em aberto no momento.",
      severidade: "info",
      href: "/admin/caixa",
    });
  }

  if ((checkinsHoje ?? []).length > 0) {
    alertas.push({
      id: "checkins-hoje",
      titulo: "Check-ins previstos para hoje",
      descricao: `${(checkinsHoje ?? []).length} check-in${(checkinsHoje ?? []).length > 1 ? "s" : ""} previsto${(checkinsHoje ?? []).length > 1 ? "s" : ""} para hoje.`,
      severidade: "info",
      href: "/admin/checkin-checkout",
    });
  }

  if ((checkoutsHoje ?? []).length > 0) {
    alertas.push({
      id: "checkouts-hoje",
      titulo: "Check-outs previstos para hoje",
      descricao: `${(checkoutsHoje ?? []).length} check-out${(checkoutsHoje ?? []).length > 1 ? "s" : ""} previsto${(checkoutsHoje ?? []).length > 1 ? "s" : ""} para hoje.`,
      severidade: "info",
      href: "/admin/checkin-checkout",
    });
  }

  if ((reservasProximas ?? []).length > 0) {
    alertas.push({
      id: "reservas-proximas",
      titulo: "Reservas futuras próximas",
      descricao: `${(reservasProximas ?? []).length} reserva${(reservasProximas ?? []).length > 1 ? "s" : ""} com chegada nos próximos dias.`,
      severidade: "info",
      href: "/admin/reservas",
    });
  }

  return alertas;
}
