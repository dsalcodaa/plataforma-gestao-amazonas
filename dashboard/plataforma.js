// Plataforma de Gestão Governamental — protótipo (estado no localStorage)
// ---------- dados base ----------
const D = window.DADOS, O = window.ORGAOS.orgaos;
const ORG = Object.fromEntries(O.map(o => [o.id, o]));
const IND = Object.fromEntries(D.indicadores.map(i => [i.id, i]));
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const hoje = () => new Date().toISOString().slice(0, 10);
const agora = () => new Date().toISOString();
const fmt = iso => iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "";
const fmtD = d => d ? d.split("-").reverse().join("/") : "";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const num = v => { const n = parseFloat(String(v ?? "").replace(/\./g, "").replace(",", ".")); return isNaN(n) ? null : n; };
const numIn = v => { const n = parseFloat(String(v ?? "").replace(",", ".")); return isNaN(n) ? null : n; };
const nf = n => n == null ? "—" : n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const brl = n => n == null ? "—" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brlC = n => n == null ? "—" : n >= 1e6 ? "R$ " + (n / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mi" : brl(n);
const pct = x => x == null ? "—" : Math.round(x * 100) + "%";
const pbar = x => `<div class="pbar"><div class="bar"><i style="width:${x == null ? 0 : Math.min(100, x * 100)}%"></i></div><span>${pct(x)}</span></div>`;

// órgão "topo" = secretaria/órgão supervisor que responde ao governador
function topo(id) {
  let o = ORG[id], n = 0;
  while (o && o.vinculada_a && o.vinculada_a !== "GOV" && ORG[o.vinculada_a] && n++ < 5) o = ORG[o.vinculada_a];
  return o ? o.id : id;
}
const vinculadas = id => O.filter(o => o.id !== id && topo(o.id) === id);

// sugestão de órgão: 1º sigla citada como responsável no plano; senão, grupo; senão, área
const SUG_AREA = {
  "Política Fiscal": "SEFAZ", "Reforma Tributária": "SEFAZ", "Zoneamento Ecológico-Econômico — ZEE": "SEMA",
  "Regularização Fundiária": "SECT", "Infraestrutura e Logística": "SEINFRA", "Energia": "SEMIG",
  "Fruticultura": "SEPROR", "Aquicultura": "SEPA", "Produtos Florestais": "SEMA", "Indústria": "SEDECTI",
  "Comércio": "SEDECTI", "Mineração": "SEMIG", "Turismo": "AMAZONASTUR", "Fitofármacos e Bioativos": "SEDECTI",
  "Serviços Ambientais": "SEMA", "Ciência, Tecnologia e Inovação": "SEDECTI", "Inteligência Artificial": "SEAD",
  "Economia Criativa": "SEC", "Atração de Investimentos": "SEDECTI", "Segurança Pública": "SSP", "Saúde": "SES",
  "Assistência Social": "SEAS", "Educação": "SEDUC", "Meio Ambiente": "SEMA", "Cultura": "SEC", "FAPEAM": "FAPEAM",
  "CETAM": "CETAM", "Habitação": "SUHAB", "Governo Digital": "SEAD", "Política Indigenista": "FEPIAM",
};
const SUG_GRUPO = { "Rio Mais Seguro": "SSP", "Aquaviário": "SNPH", "Mineração": "SEMIG", "Saneamento": "COSAMA" };
const ALIAS = { "AMAZONASTU": "AMAZONASTUR", "CASA CIVIL": "CASACIVIL" };
function sugestao(i) {
  for (const t of (i.responsavel || "").split(/[,/;]| e |\s+—\s+/)) {
    const k = t.trim().toUpperCase().split(" ")[0];
    const id = ALIAS[k] || k;
    if (ORG[id]) return id;
  }
  return SUG_GRUPO[i.grupo] || SUG_AREA[i.area] || "";
}

// ---------- estado (localStorage) ----------
// shortcut: dados ficam só neste navegador; trocar por backend (ex.: Supabase) + login para uso multiusuário real.
const KEY = "plataforma_am_v1";
const S = Object.assign({ atrib: {}, val: {}, acoes: [], equipes: {}, msgs: [], projetos: [], perfil: { tipo: "gov" } },
  JSON.parse(localStorage.getItem(KEY) || "{}"));
S.projetos = S.projetos || [];
// devolve false se o navegador recusar (cota do localStorage ~5 MB, estourada por anexos grandes)
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; } };
const ehGov = () => S.perfil.tipo === "gov";
const meu = () => ehGov() ? null : topo(S.perfil.org);               // escopo do perfil (null = governo todo)
const visivel = org => ehGov() || topo(org) === meu();
const podeEditar = org => !ehGov() && topo(org) === meu();
const quem = () => ehGov() ? "Governador" :
  (S.perfil.membro ? `${S.perfil.membro} (${ORG[S.perfil.org].sigla})` : `${ORG[S.perfil.org].sigla} — titular`);
function registra(org, texto, ref) {
  S.msgs.push({ id: uid(), org: topo(org), de: quem(), lado: S.perfil.tipo, tipo: "log", texto, ref, em: agora() });
}

// ---------- derivados ----------
const STATUS_IND = { "": ["Sem dado", ""], ok: ["No rumo", "ok"], at: ["Atenção", "at"], cr: ["Crítico", "cr"] };
const STATUS_AC = ["Não iniciada", "Em andamento", "Paralisada", "Concluída"];
const STATUS_PJ = ["Planejamento", "Em execução", "Paralisado", "Concluído", "Cancelado"];
const TIPOS_PJ = ["Obra", "Reforma", "Aquisição", "Serviço", "Programa social", "Capacitação", "Sistema/Tecnologia", "Programa estruturante", "Campanha/mutirão", "Evento", "Operação", "Outro"];
const MODELOS = window.MODELOS, MOD = Object.fromEntries(MODELOS.map(m => [m.id, m]));
const atrasada = a => a.status !== "Concluída" && a.prazo && a.prazo < hoje();
const indsDe = org => D.indicadores.filter(i => S.atrib[i.id] && topo(S.atrib[i.id]) === org);
const acoesDe = org => S.acoes.filter(a => topo(a.org) === org);
// exemplos da v2 não tinham a marca "exemplo"; o título também identifica
const ehExemplo = p => p.exemplo || p.titulo.endsWith(" (exemplo)");
const projsDe = org => S.projetos.filter(p => !org || topo(p.org) === org);

// progresso de uma métrica: (último - base) / (meta - base), limitado a 0..1
function progMetrica(m) {
  const med = (m.medicoes || []).slice().sort((a, b) => a.data.localeCompare(b.data));
  const ult = med.length ? med[med.length - 1].valor : null;
  const base = m.base ?? 0, meta = m.meta;
  if (ult == null || meta == null || meta === base) return { ult, p: null };
  return { ult, p: Math.max(0, Math.min(1, (ult - base) / (meta - base))) };
}
function kpiProj(p) {
  const ms = (p.metricas || []).map(progMetrica).filter(x => x.p != null);
  const marcos = p.marcos || [];
  const fis = ms.length ? ms.reduce((s, x) => s + x.p, 0) / ms.length
    : marcos.length ? marcos.filter(m => m.ok).length / marcos.length : null;
  const o = p.orcamento || {};
  const fin = o.previsto ? (o.pago || 0) / o.previsto : null;
  const fechado = ["Concluído", "Cancelado"].includes(p.status);
  const atrasado = !fechado && p.fim && p.fim < hoje();
  const marcosAtr = marcos.filter(m => !m.ok && m.prazo && m.prazo < hoje()).length;
  // alerta: atrasado, paralisado, ou financeiro muito à frente do físico
  const descasado = fis != null && fin != null && fin - fis > 0.25;
  const riscosAltos = (p.riscos || []).filter(r => r.status !== "Encerrado" && r.prob === "Alta" && r.impacto === "Alto").length;
  return { fis, fin, atrasado, marcosAtr, descasado, riscosAltos,
    alerta: atrasado || p.status === "Paralisado" || marcosAtr > 0 || descasado || riscosAltos > 0 };
}
function stProj(p) {
  const k = kpiProj(p);
  if (k.atrasado) return `<span class="st cr"><i></i>Atrasado</span>`;
  const c = { "Em execução": "ok", "Paralisado": "ex", "Concluído": "ok", "Planejamento": "pl", "Cancelado": "" }[p.status];
  return `<span class="st ${c}"><i></i>${esc(p.status)}</span>`;
}
function resumo(org) {
  const inds = indsDe(org), ac = acoesDe(org), pj = projsDe(org);
  const v = inds.map(i => S.val[i.id] || {});
  const ult = [...v.map(x => x.em || ""), ...ac.map(a => a.em || ""), ...pj.map(p => p.em || "")].sort().pop() || "";
  const ativos = pj.filter(p => !["Concluído", "Cancelado"].includes(p.status));
  return {
    n: inds.length, alim: v.filter(x => x.valor).length, at: v.filter(x => x.status === "at").length,
    cr: v.filter(x => x.status === "cr").length, ab: ac.filter(a => a.status !== "Concluída").length,
    atr: ac.filter(atrasada).length, ult, pj: ativos.length, pjAlerta: ativos.filter(p => kpiProj(p).alerta).length,
    orc: pj.reduce((s, p) => s + ((p.orcamento || {}).previsto || 0), 0),
    pago: pj.reduce((s, p) => s + ((p.orcamento || {}).pago || 0), 0),
    naoLidas: S.msgs.filter(m => m.org === org && m.tipo !== "log" && m.lado === "org" && !m.lidaGov).length,
  };
}
const stInd = s => { const [l, c] = STATUS_IND[s || ""]; return `<span class="st ${c}"><i></i>${l}</span>`; };
const stAc = a => atrasada(a) ? `<span class="st cr"><i></i>Atrasada</span>` :
  `<span class="st ${{ "Concluída": "ok", "Paralisada": "ex", "Em andamento": "at" }[a.status] || ""}"><i></i>${esc(a.status)}</span>`;
const orgLabel = id => ORG[id] ? `<b>${esc(ORG[id].sigla)}</b><div class="muted">${esc(ORG[id].nome)}</div>` : '<span class="muted">—</span>';
function opcoesOrg(lista, sel) {
  const cats = [...new Set(lista.map(o => o.categoria))];
  return cats.map(c => `<optgroup label="${esc(c)}">` + lista.filter(o => o.categoria === c)
    .map(o => `<option value="${o.id}" ${o.id === sel ? "selected" : ""}>${esc(o.sigla)} — ${esc(o.nome)}</option>`).join("") + "</optgroup>").join("");
}
const OPCOES_ORG = opcoesOrg(O.filter(o => o.id !== "VICE"));
const orgsDoEscopo = () => ehGov() ? O.filter(o => o.id !== "VICE") : [ORG[meu()], ...vinculadas(meu())];
const nomesEquipe = org => (S.equipes[topo(org)] || []).map(m => m.nome);

// ---------- menu e perfil ----------
function menu(r) {
  const itens = ehGov()
    ? [["gov", "Sala do Governador"], ["proj", "Projetos"], ["modelos", "Modelos de projeto"], ["dist", "Distribuição de indicadores"], ["org", "Secretarias"], ["estrutura", "Estrutura do Executivo"]]
    : [["org", `Minha secretaria (${ORG[meu()].sigla})`], ["proj", "Projetos"], ["modelos", "Modelos de projeto"]];
  $("#menu").innerHTML = itens.map(([k, n]) => `<a href="#${k}${k === "org" && !ehGov() ? "/" + meu() : ""}" ${r === k ? 'aria-current="page"' : ""}>${n}</a>`).join("")
    + (ehGov() ? `<a href="index.html" title="Painel e fichas dos indicadores do plano">Catálogo do plano ↗</a>` : "");
  $("#sub").textContent = ehGov() ? "Protótipo · visão de todo o governo" : `Protótipo · visão restrita a ${ORG[meu()].sigla} e órgãos vinculados`;
  const tops = O.filter(o => topo(o.id) === o.id && !["GOV", "VICE"].includes(o.id));
  let h = `<option value="gov">Governador</option><optgroup label="Titular da secretaria/órgão">`
    + tops.map(o => `<option value="org:${o.id}">${esc(o.sigla)} — titular</option>`).join("") + "</optgroup>";
  const membros = Object.entries(S.equipes).flatMap(([org, l]) => l.map(m => [org, m.nome]));
  if (membros.length) h += `<optgroup label="Membro de equipe">` + membros.map(([org, n]) => `<option value="mem:${org}:${esc(n)}">${esc(n)} (${esc(ORG[org].sigla)})</option>`).join("") + "</optgroup>";
  $("#perfil").innerHTML = h;
  $("#perfil").value = ehGov() ? "gov" : S.perfil.membro ? `mem:${S.perfil.org}:${S.perfil.membro}` : `org:${S.perfil.org}`;
}
$("#perfil").onchange = ev => {
  const [t, org, ...nome] = ev.target.value.split(":");
  S.perfil = t === "gov" ? { tipo: "gov" } : { tipo: "org", org, membro: t === "mem" ? nome.join(":") : "" };
  save();
  location.hash = t === "gov" ? "#gov" : `#org/${topo(org)}`;
  render();
};
function feed(lista, comOrg) {
  if (!lista.length) return `<p class="muted">Sem mensagens.</p>`;
  return `<div class="feed">` + lista.map(m => `<div class="msg ${m.tipo === "det" ? "det" : m.tipo === "log" ? "log" : ""}">
    <div class="cab"><b>${esc(m.de)}</b>${comOrg ? `<span>→ ${esc(ORG[m.org] ? ORG[m.org].sigla : m.org)}</span>` : ""}<span>${{ det: "Determinação", msg: "Mensagem", log: "Atualização", com: "Comentário" }[m.tipo]}</span><span>${fmt(m.em)}</span></div>
    <p>${esc(m.texto)}</p></div>`).join("") + `</div>`;
}

// ---------- tela: governador ----------
function telaGov() {
  const total = D.indicadores.length, atrib = Object.keys(S.atrib).filter(k => S.atrib[k]).length;
  const alim = Object.values(S.val).filter(v => v.valor).length;
  const pj = S.projetos.filter(p => !["Concluído", "Cancelado"].includes(p.status));
  const orcTot = S.projetos.reduce((s, p) => s + ((p.orcamento || {}).previsto || 0), 0);
  const pagoTot = S.projetos.reduce((s, p) => s + ((p.orcamento || {}).pago || 0), 0);
  const nl = S.msgs.filter(m => m.tipo !== "log" && m.lado === "org" && !m.lidaGov).length;
  const orgs = [...new Set([...Object.values(S.atrib).filter(Boolean).map(topo), ...S.acoes.map(a => topo(a.org)), ...S.projetos.map(p => topo(p.org))])]
    .map(id => ({ id, ...resumo(id) })).sort((a, b) => (b.cr + b.atr + b.pjAlerta) - (a.cr + a.atr + a.pjAlerta) || b.n - a.n);
  let h = `<div style="display:flex;gap:12px;align-items:flex-start"><h2 style="flex:1">Sala do Governador</h2><button class="btn noprint" onclick="print()" title="Abre a impressão; escolha “Salvar como PDF”">Relatório (PDF)</button></div>
  <p class="soprint muted">Relatório gerado em ${fmt(agora())} · Plataforma de Gestão Governamental — Amazonas (protótipo)</p><p class="lead">Visão consolidada de todas as secretarias: indicadores do plano, projetos, ações e conversas. Clique numa secretaria para abrir a tela dela.</p>
  <div class="tiles">
    <div class="tile"><div class="v">${pj.length}</div><div class="l">projetos ativos</div></div>
    <div class="tile"><div class="v">${brlC(orcTot)}</div><div class="l">orçamento em projetos · ${pct(orcTot ? pagoTot / orcTot : null)} pago</div></div>
    <div class="tile"><div class="v">${pj.filter(p => kpiProj(p).alerta).length}</div><div class="l">projetos com alerta</div></div>
    <div class="tile"><div class="v">${atrib} / ${total}</div><div class="l">indicadores do plano com órgão</div></div>
    <div class="tile"><div class="v">${alim}</div><div class="l">indicadores alimentados</div></div>
    <div class="tile"><div class="v">${nl}</div><div class="l">mensagens não lidas</div></div>
  </div>`;
  if (atrib < total) h += `<div class="banner">${total - atrib} indicadores do plano ainda sem órgão responsável. <a href="#dist">Ir para a distribuição →</a></div>`;
  h += `<div class="grid2"><div><div class="card"><h3>Secretarias e órgãos</h3>`;
  h += orgs.length ? `<table><thead><tr><th>Órgão</th><th class="num">Projetos ativos</th><th class="num">Com alerta</th><th class="num">Orçamento</th><th>Indicadores alimentados</th><th class="num">Críticos</th><th class="num">Ações atrasadas</th><th class="num">Msgs</th><th>Última atualização</th></tr></thead><tbody>`
    + orgs.map(r => `<tr class="click" data-go="#org/${r.id}"><td>${orgLabel(r.id)}</td>
      <td class="num">${r.pj}</td><td class="num">${r.pjAlerta ? `<span class="st cr"><i></i>${r.pjAlerta}</span>` : 0}</td><td class="num">${brlC(r.orc)}</td>
      <td>${pbar(r.n ? r.alim / r.n : null)}<span class="muted">${r.alim}/${r.n}</span></td><td class="num">${r.cr}</td>
      <td class="num">${r.atr ? `<span class="st cr"><i></i>${r.atr}</span>` : 0}</td><td class="num">${r.naoLidas || ""}</td><td class="muted">${fmt(r.ult)}</td></tr>`).join("") + "</tbody></table>"
    : `<p class="muted">Nada distribuído ou cadastrado ainda. Comece pela <a href="#dist">distribuição</a> ou por <a href="#proj">Projetos</a>.</p>`;
  h += `</div>`;
  const alertas = D.indicadores.filter(i => ["cr", "at"].includes((S.val[i.id] || {}).status));
  const pjAl = pj.filter(p => kpiProj(p).alerta), acAt = S.acoes.filter(atrasada);
  h += `<div class="card"><h3>Pontos de atenção</h3>` + (alertas.length || pjAl.length || acAt.length ? `<table><tbody>`
    + pjAl.map(p => { const k = kpiProj(p); return `<tr class="click" data-go="#proj/${p.id}"><td>${stProj(p)}</td><td><b>Projeto:</b> ${esc(p.titulo)}<div class="muted">${[k.atrasado && "prazo final vencido", p.status === "Paralisado" && "paralisado", k.marcosAtr && k.marcosAtr + " marco(s) atrasado(s)", k.descasado && `financeiro ${pct(k.fin)} × físico ${pct(k.fis)}`, k.riscosAltos && k.riscosAltos + " risco(s) alto(s)"].filter(Boolean).join(" · ")}</div></td><td>${orgLabel(p.org)}</td></tr>`; }).join("")
    + alertas.map(i => `<tr class="click" data-go="#org/${topo(S.atrib[i.id])}"><td>${stInd(S.val[i.id].status)}</td><td><b>Indicador:</b> ${esc(i.indicador)}<div class="muted">valor ${esc(S.val[i.id].valor || "—")} · meta ${esc(i.meta || "—")}</div></td><td>${orgLabel(S.atrib[i.id])}</td></tr>`).join("")
    + acAt.map(a => `<tr class="click" data-go="#org/${topo(a.org)}/acoes"><td>${stAc(a)}</td><td><b>Ação:</b> ${esc(a.titulo)}<div class="muted">prazo ${fmtD(a.prazo)} · ${a.perc || 0}% executado</div></td><td>${orgLabel(a.org)}</td></tr>`).join("")
    + "</tbody></table>" : `<p class="muted">Nenhum projeto com alerta, indicador crítico ou ação atrasada.</p>`) + `</div></div>`;
  h += `<div><div class="card"><h3>Enviar determinação</h3>
    <div class="form"><label class="full">Para<select id="detOrg"><option value="">Escolha o órgão…</option>${OPCOES_ORG}</select></label>
    <label class="full">Mensagem<textarea id="detTxt" placeholder="Ex.: apresentar plano de recuperação do projeto X até sexta."></textarea></label>
    <div><button class="btn pri" id="detEnviar">Enviar</button></div></div></div>
    <div class="card"><h3>Conversas e atualizações recentes</h3>${feed(S.msgs.slice().reverse().slice(0, 25), true)}</div></div></div>`;
  return h;
}
function posGov() {
  $("#detEnviar").onclick = () => {
    const org = $("#detOrg").value, txt = $("#detTxt").value.trim(); if (!org || !txt) return;
    S.msgs.push({ id: uid(), org: topo(org), de: quem(), lado: "gov", tipo: "det", texto: txt, em: agora(), lidaGov: true });
    save(); render();
  };
}

// ---------- tela: distribuição ----------
const F = { q: "", eixo: "", area: "", sit: "", lim: 100 };
function linhaDist(i) {
  const at = S.atrib[i.id] || "", sg = sugestao(i);
  return `<tr data-i="${i.id}"><td class="muted">${esc(i.id)}</td><td>${esc(i.indicador)}<div class="muted">${esc(i.area)}${i.grupo ? " · " + esc(i.grupo) : ""}${i.responsavel ? " · plano cita: " + esc(i.responsavel) : ""}</div></td>
    <td>${sg && sg !== at ? `<span class="chip sug" data-sug="${sg}" title="Aplicar sugestão">${esc(ORG[sg].sigla)}</span>` : ""}</td>
    <td><select class="atr"><option value="">— sem órgão —</option>${OPCOES_ORG}</select></td>
    <td class="muted">${at && topo(at) !== at ? "↳ " + esc(ORG[topo(at)].sigla) : ""}</td></tr>`;
}
function filtraDist() {
  const q = norm(F.q);
  return D.indicadores.filter(i => (!F.eixo || i.eixo === F.eixo) && (!F.area || i.area_id === F.area)
    && (!F.sit || (F.sit === "sem" ? !S.atrib[i.id] : !!S.atrib[i.id]))
    && (!q || norm([i.id, i.indicador, i.area, i.grupo, i.responsavel, (ORG[S.atrib[i.id]] || {}).sigla].join(" ")).includes(q)));
}
function telaDist() {
  const lista = filtraDist();
  return `<h2>Distribuição de indicadores do plano</h2><p class="lead">Defina qual órgão responde por cada indicador. A sugestão vem do responsável citado no plano ou da área do capítulo. Indicador atribuído a órgão vinculado (ex.: IDAM) sobe para a secretaria supervisora (SEPROR).</p>
  <div class="filters"><input type="search" id="fq" placeholder="Buscar indicador, área, sigla…" value="${esc(F.q)}">
    <select id="feixo"><option value="">Todos os eixos</option>${D.eixos.map(e => `<option value="${e.id}" ${F.eixo === e.id ? "selected" : ""}>${e.nome}</option>`).join("")}</select>
    <select id="farea"><option value="">Todas as áreas</option>${D.areas.filter(a => !F.eixo || a.eixo === F.eixo).map(a => `<option value="${a.id}" ${F.area === a.id ? "selected" : ""}>${esc(a.nome)}</option>`).join("")}</select>
    <select id="fsit"><option value="">Todos</option><option value="sem" ${F.sit === "sem" ? "selected" : ""}>Sem órgão</option><option value="com" ${F.sit === "com" ? "selected" : ""}>Com órgão</option></select>
    <span class="muted">${lista.length} indicadores</span></div>
  <div class="bulk"><b>Em lote (${lista.length} filtrados):</b>
    <button class="btn mini" id="bSug">Aplicar sugestão onde estiver sem órgão</button>
    <span>ou atribuir todos a</span><select id="bOrg"><option value="">escolha…</option>${OPCOES_ORG}</select>
    <button class="btn mini" id="bAtr">Atribuir</button> <button class="btn mini" id="bLimpa">Remover atribuição</button></div>
  <div class="card"><table id="tdist"><thead><tr><th>ID</th><th>Indicador</th><th>Sugestão</th><th>Órgão responsável</th><th>Responde a</th></tr></thead><tbody>
  ${lista.slice(0, F.lim).map(linhaDist).join("")}</tbody></table>
  ${lista.length > F.lim ? `<p><button class="btn" id="mais">Mostrar mais (${lista.length - F.lim} restantes)</button></p>` : ""}</div>`;
}
function posDist() {
  $$("#tdist tr[data-i]").forEach(tr => tr.querySelector("select").value = S.atrib[tr.dataset.i] || "");
  const re = () => { F.lim = 100; render(); };
  $("#fq").oninput = ev => { F.q = ev.target.value; clearTimeout(F.t); F.t = setTimeout(() => { render(); $("#fq").focus(); $("#fq").setSelectionRange(F.q.length, F.q.length); }, 250); };
  $("#feixo").onchange = ev => { F.eixo = ev.target.value; F.area = ""; re(); };
  $("#farea").onchange = ev => { F.area = ev.target.value; re(); };
  $("#fsit").onchange = ev => { F.sit = ev.target.value; re(); };
  if ($("#mais")) $("#mais").onclick = () => { F.lim += 200; render(); };
  const atribui = (ids, org) => {
    ids.forEach(id => { if (org) S.atrib[id] = org; else delete S.atrib[id]; });
    if (org) registra(org, `${ids.length} indicador(es) do plano atribuído(s) a ${ORG[org].sigla}`);
    save();
  };
  $("#tdist").onchange = ev => {
    const tr = ev.target.closest("tr[data-i]"); if (!tr) return;
    atribui([tr.dataset.i], ev.target.value);
    tr.outerHTML = linhaDist(IND[tr.dataset.i]); posDist();
  };
  $("#tdist").onclick = ev => {
    const c = ev.target.closest(".chip.sug"); if (!c) return;
    atribui([c.closest("tr").dataset.i], c.dataset.sug); render();
  };
  $("#bSug").onclick = () => {
    const por = {};
    filtraDist().filter(i => !S.atrib[i.id] && sugestao(i)).forEach(i => (por[sugestao(i)] = por[sugestao(i)] || []).push(i.id));
    Object.entries(por).forEach(([org, ids]) => atribui(ids, org)); render();
  };
  $("#bAtr").onclick = () => { const org = $("#bOrg").value; if (org) { atribui(filtraDist().map(i => i.id), org); render(); } };
  $("#bLimpa").onclick = () => { atribui(filtraDist().map(i => i.id), ""); render(); };
}

// ---------- tela: projetos (lista) ----------
const FP = { q: "", org: "", status: "", alerta: false, mun: "" };
// municípios citados no campo livre do projeto, casados com os nomes do IBGE
const MUN = window.MUNICIPIOS, MUN_N = Object.fromEntries(MUN.municipios.map(m => [norm(m.nome), m.nome]));
const munsDe = p => [...new Set(String(p.municipios || "").split(/[,;/]| e /).map(s => MUN_N[norm(s.trim())]).filter(Boolean))];
function mapa(projs) {
  const ag = {};
  projs.forEach(p => munsDe(p).forEach(n => { const a = ag[n] = ag[n] || { n: 0, orc: 0, al: 0 }; a.n++; a.orc += (p.orcamento || {}).previsto || 0; if (kpiProj(p).alerta) a.al++; }));
  const max = Math.max(1, ...Object.values(ag).map(a => a.n));
  const semMun = projs.filter(p => !munsDe(p).length).length;
  const svg = `<svg viewBox="0 0 ${MUN.w} ${MUN.h}" role="img" aria-label="Mapa de projetos por município" style="width:100%;height:auto">`
    + MUN.municipios.map(m => { const a = ag[m.nome];
      return `<path d="${m.d}" data-mun="${esc(m.nome)}" style="cursor:pointer;stroke:var(--surface);stroke-width:${FP.mun === m.nome ? 3 : 1};fill:${a ? "var(--accent)" : "var(--bar-empty)"};fill-opacity:${a ? (0.25 + 0.75 * a.n / max).toFixed(2) : 1}${FP.mun === m.nome ? ";stroke:var(--ink)" : ""}"><title>${esc(m.nome)}: ${a ? `${a.n} projeto(s) · ${brlC(a.orc)}${a.al ? ` · ${a.al} com alerta` : ""}` : "sem projetos"}</title></path>`; }).join("") + `</svg>`;
  const top = Object.entries(ag).sort((a, b) => b[1].n - a[1].n || b[1].orc - a[1].orc);
  return `<div class="card"><h3>Projetos por município${FP.mun ? ` — filtrando ${esc(FP.mun)} <button class="btn mini" data-mun="">limpar</button>` : ""}</h3>
    <div class="grid2"><div>${svg}<p class="aviso">Cor mais escura = mais projetos. Clique num município para filtrar a lista.${semMun ? ` ${semMun} projeto(s) sem município reconhecido.` : ""} Malha: IBGE.</p></div>
    <div>${top.length ? `<table><thead><tr><th>Município</th><th class="num">Projetos</th><th class="num">Orçamento</th><th class="num">Com alerta</th></tr></thead><tbody>`
      + top.map(([n, a]) => `<tr class="click" data-mun="${esc(n)}"><td>${esc(n)}</td><td class="num">${a.n}</td><td class="num">${brlC(a.orc)}</td><td class="num">${a.al || ""}</td></tr>`).join("") + `</tbody></table>`
      : `<p class="muted">Nenhum projeto com município reconhecido.</p>`}</div></div></div>`;
}
function telaProjetos() {
  const q = norm(FP.q);
  const base = projsDe(meu());
  const lista = base.filter(p => (!FP.org || topo(p.org) === FP.org) && (!FP.status || p.status === FP.status) && (!FP.mun || munsDe(p).includes(FP.mun))
    && (!FP.alerta || kpiProj(p).alerta) && (!q || norm([p.titulo, p.descricao, p.municipios, p.gerente, ORG[p.org].sigla].join(" ")).includes(q)))
    .sort((a, b) => (a.fim || "9").localeCompare(b.fim || "9"));
  const ativos = base.filter(p => !["Concluído", "Cancelado"].includes(p.status));
  const prev = base.reduce((s, p) => s + ((p.orcamento || {}).previsto || 0), 0), pago = base.reduce((s, p) => s + ((p.orcamento || {}).pago || 0), 0);
  const fisMed = ativos.map(p => kpiProj(p).fis).filter(x => x != null);
  const tops = [...new Set(base.map(p => topo(p.org)))];
  return `<h2>Projetos${meu() ? " — " + esc(ORG[meu()].sigla) : " do governo"}</h2>
  <p class="lead">Projetos ativos com responsáveis, orçamento, marcos e métricas próprias. Cada projeto tem o seu dashboard.</p>
  <div class="tiles"><div class="tile"><div class="v">${ativos.length}</div><div class="l">projetos ativos (${base.length} no total)</div></div>
    <div class="tile"><div class="v">${brlC(prev)}</div><div class="l">orçamento previsto</div></div>
    <div class="tile"><div class="v">${pct(prev ? pago / prev : null)}</div><div class="l">execução financeira (pago)</div></div>
    <div class="tile"><div class="v">${pct(fisMed.length ? fisMed.reduce((s, x) => s + x, 0) / fisMed.length : null)}</div><div class="l">execução física média</div></div>
    <div class="tile"><div class="v">${ativos.filter(p => kpiProj(p).alerta).length}</div><div class="l">com alerta</div></div></div>
  <div class="filters"><input type="search" id="pq" placeholder="Buscar projeto, município, gerente…" value="${esc(FP.q)}">
    ${ehGov() ? `<select id="porg"><option value="">Todas as secretarias</option>${tops.map(id => `<option value="${id}" ${FP.org === id ? "selected" : ""}>${esc(ORG[id].sigla)}</option>`).join("")}</select>` : ""}
    <select id="pst"><option value="">Todas as situações</option>${STATUS_PJ.map(s => `<option ${FP.status === s ? "selected" : ""}>${s}</option>`).join("")}</select>
    <label class="muted"><input type="checkbox" id="pal" ${FP.alerta ? "checked" : ""}> só com alerta</label>
    <span style="margin-left:auto"></span>
    ${S.projetos.some(ehExemplo) ? `<button class="btn" id="semExemplos">Remover projetos de exemplo</button>`
      : `<button class="btn" id="exemplos" title="Projetos fictícios de todas as secretarias, com medições, orçamento, riscos e alertas simulados">Carregar carteira de exemplo (${window.EXEMPLOS.length} projetos)</button>`}
    <a class="btn" href="#modelos">Modelos</a> <a class="btn pri" href="#proj/novo">+ Novo projeto</a></div>
  <div class="card">${lista.length ? `<table><thead><tr><th>Projeto</th><th>Executor</th><th>Situação</th><th>Execução física</th><th>Execução financeira</th><th class="num">Orçamento</th><th>Prazo final</th><th>Gerente</th></tr></thead><tbody>`
    + lista.map(p => { const k = kpiProj(p); return `<tr class="click" data-go="#proj/${p.id}"><td><b>${esc(p.titulo)}</b><div class="muted">${esc(p.tipo || "")}${p.municipios ? " · " + esc(p.municipios) : ""}</div></td>
      <td>${esc(ORG[p.org].sigla)}${topo(p.org) !== p.org ? `<div class="muted">↳ ${esc(ORG[topo(p.org)].sigla)}</div>` : ""}</td><td>${stProj(p)}${k.alerta && !k.atrasado ? `<div class="muted">${k.marcosAtr ? k.marcosAtr + " marco(s) atrasado(s)" : k.descasado ? "financeiro à frente do físico" : k.riscosAltos ? "risco alto aberto" : ""}</div>` : ""}</td>
      <td>${pbar(k.fis)}</td><td>${pbar(k.fin)}</td><td class="num">${brlC((p.orcamento || {}).previsto)}</td><td>${fmtD(p.fim) || "—"}</td><td>${esc(p.gerente || "—")}</td></tr>`; }).join("") + `</tbody></table>`
    : `<p class="muted">Nenhum projeto ${base.length ? "com esses filtros" : "cadastrado"}. Use “+ Novo projeto”.</p>`}</div>
  ${base.length ? carteira(base) + mapa(base) : ""}`;
}
// carteira por tipo de projeto (contagem, orçamento, execução média, alertas)
function carteira(base) {
  const tipos = [...new Set(base.map(p => p.tipo || "Outro"))].map(t => {
    const l = base.filter(p => (p.tipo || "Outro") === t), ks = l.map(kpiProj), fs = ks.map(k => k.fis).filter(x => x != null);
    const prev = l.reduce((s, p) => s + ((p.orcamento || {}).previsto || 0), 0), pago = l.reduce((s, p) => s + ((p.orcamento || {}).pago || 0), 0);
    return { t, n: l.length, prev, fin: prev ? pago / prev : null, fis: fs.length ? fs.reduce((s, x) => s + x, 0) / fs.length : null, al: ks.filter(k => k.alerta).length };
  }).sort((a, b) => b.prev - a.prev);
  return `<div class="card"><h3>Carteira por tipo de projeto</h3><table><thead><tr><th>Tipo</th><th class="num">Projetos</th><th class="num">Orçamento</th><th>Execução física média</th><th>Execução financeira</th><th class="num">Com alerta</th></tr></thead><tbody>`
    + tipos.map(r => `<tr><td>${esc(r.t)}</td><td class="num">${r.n}</td><td class="num">${brlC(r.prev)}</td><td>${pbar(r.fis)}</td><td>${pbar(r.fin)}</td><td class="num">${r.al ? `<span class="st cr"><i></i>${r.al}</span>` : ""}</td></tr>`).join("") + `</tbody></table></div>`;
}
function posProjetos() {
  $("#pq").oninput = ev => { FP.q = ev.target.value; clearTimeout(FP.t); FP.t = setTimeout(() => { render(); $("#pq").focus(); $("#pq").setSelectionRange(FP.q.length, FP.q.length); }, 250); };
  if ($("#porg")) $("#porg").onchange = ev => { FP.org = ev.target.value; render(); };
  $("#pst").onchange = ev => { FP.status = ev.target.value; render(); };
  $("#pal").onchange = ev => { FP.alerta = ev.target.checked; render(); };
  if ($("#exemplos")) $("#exemplos").onclick = carregaExemplos;
  if ($("#semExemplos")) $("#semExemplos").onclick = () => {
    if (!confirm("Remover todos os projetos de exemplo (e os comentários deles)? Seus projetos ficam.")) return;
    const ids = new Set(S.projetos.filter(ehExemplo).map(p => p.id));
    S.projetos = S.projetos.filter(p => !ids.has(p.id)); S.msgs = S.msgs.filter(m => !ids.has(m.ref)); save(); render();
  };
  $$("[data-mun]").forEach(e => e.onclick = () => { FP.mun = FP.mun === e.dataset.mun ? "" : e.dataset.mun; render(); });
}
function carregaExemplos() {
  // carteira simulada de todas as secretarias (exemplos.js); cada perfil vê só os do seu escopo
  window.gerarExemplos(uid, ORG).forEach(p => {
    const i = p.kw && D.indicadores.find(x => norm(x.indicador).includes(norm(p.kw)));
    if (i) p.indicadores = [i.id];
    p.coms.forEach(c => S.msgs.push({ id: uid(), org: topo(p.org), ref: p.id, de: c.lado === "gov" ? "Governador" : `${ORG[topo(p.org)].sigla} — titular`,
      lado: c.lado, tipo: "com", texto: `[${p.titulo}] ${c.texto}`, em: c.em, lidaGov: c.lado === "gov", lidaOrg: c.lado !== "gov" }));
    delete p.kw; delete p.coms;
    S.projetos.push(p);
  });
  if (!save()) { S.projetos = S.projetos.filter(p => !ehExemplo(p)); return; }
  render();
}

// ---------- tela: projeto (formulário) ----------
function telaProjForm(p, modelo) {
  const novo = !p, md = novo && MOD[modelo];
  p = p || { org: meu() || "", status: "Planejamento", tipo: md ? md.tipo : "Obra", orcamento: {}, indicadores: [] };
  const orgs = orgsDoEscopo();
  const blocoModelo = novo ? `<label class="full">Modelo de projeto (traz métricas, marcos e riscos prontos)<select id="selModelo"><option value="">Sem modelo — cadastrar tudo à mão</option>${MODELOS.map(m => `<option value="${m.id}" ${m.id === modelo ? "selected" : ""}>${esc(m.nome)}</option>`).join("")}</select></label>
    ${md ? `<label>Unidade principal<input name="m_u" placeholder="${esc(md.u)}"></label><label>Meta da 1ª métrica<input name="m_q" inputmode="decimal" value="${md.metricas[0].meta}"></label>
    <p class="aviso dois">Métricas: ${md.metricas.map(m => esc(m.nome.replace("{u}", "unidade"))).join(" · ")}. ${md.marcos.length} marcos com prazos distribuídos entre início e prazo final. ${md.riscos.length} riscos típicos.</p>` : ""}` : "";
  const indsPossiveis = D.indicadores.filter(i => S.atrib[i.id] && (ehGov() ? true : topo(S.atrib[i.id]) === meu()));
  const o = p.orcamento || {};
  return `<p><a href="${novo ? "#proj" : "#proj/" + p.id}">← voltar</a></p><h2>${novo ? "Novo projeto" : "Editar projeto"}</h2>
  <p class="lead">As métricas do projeto (ex.: casas concluídas, leitos reformados) e os marcos são cadastrados no dashboard, depois de salvar.</p>
  <div class="card"><div class="form" id="fproj">${blocoModelo}
    <label class="full">Nome do projeto *<input name="titulo" value="${esc(p.titulo)}" placeholder="Ex.: Construção de 20 casas no município X"></label>
    <label class="dois">Órgão executor *<select name="org">${orgs.length > 1 ? `<option value="">escolha…</option>` : ""}${opcoesOrg(orgs, p.org)}</select></label>
    <label>Tipo<select name="tipo">${TIPOS_PJ.map(t => `<option ${p.tipo === t ? "selected" : ""}>${t}</option>`).join("")}</select></label>
    <label>Situação<select name="status">${STATUS_PJ.map(t => `<option ${p.status === t ? "selected" : ""}>${t}</option>`).join("")}</select></label>
    <label class="full">Descrição / objetivo<textarea name="descricao">${esc(p.descricao)}</textarea></label>
    <label>Município(s) — separe por vírgula<input name="municipios" list="munlist" value="${esc(p.municipios)}"></label>
    <datalist id="munlist">${MUN.municipios.map(m => `<option value="${esc(m.nome)}">`).join("")}</datalist>
    <label>Início<input type="date" name="inicio" value="${esc(p.inicio)}"></label>
    <label>Prazo final<input type="date" name="fim" value="${esc(p.fim)}"></label>
    <label>Gerente do projeto<input name="gerente" list="eqlist" value="${esc(p.gerente)}"></label>
    <label class="dois">Outros responsáveis (separe por vírgula)<input name="responsaveis" list="eqlist" value="${esc(p.responsaveis)}"></label>
    <label>Orçamento previsto (R$)<input name="previsto" inputmode="decimal" value="${o.previsto ?? ""}"></label>
    <label>Empenhado (R$)<input name="empenhado" inputmode="decimal" value="${o.empenhado ?? ""}"></label>
    <label>Pago (R$)<input name="pago" inputmode="decimal" value="${o.pago ?? ""}"></label>
    <label>Fonte de recurso<input name="fonte" value="${esc(p.fonte)}" placeholder="Tesouro, convênio, emenda…"></label>
    <label class="full">Indicadores do plano relacionados (Ctrl+clique para vários)<select name="indicadores" multiple>${indsPossiveis.map(i => `<option value="${i.id}" ${(p.indicadores || []).includes(i.id) ? "selected" : ""}>${esc(ORG[S.atrib[i.id]].sigla)} · ${esc(i.indicador.slice(0, 90))}</option>`).join("")}</select></label>
    <datalist id="eqlist">${[...new Set(orgs.flatMap(x => nomesEquipe(x.id)))].map(n => `<option value="${esc(n)}">`).join("")}</datalist>
    <div class="full"><button class="btn pri" id="salvaProj">${novo ? "Criar projeto" : "Salvar alterações"}</button> <span class="muted" id="erroProj"></span></div>
  </div></div>`;
}
// métricas, marcos e riscos do modelo; prazos dos marcos proporcionais entre início e fim (se informados)
function aplicaModelo(p, md, u, q) {
  const t0 = p.inicio && +new Date(p.inicio), t1 = p.fim && +new Date(p.fim), nome = s => s.replace("{u}", u || md.u);
  p.modelo = md.id;
  p.metricas = md.metricas.map((m, i) => ({ id: uid(), nome: nome(m.nome), unidade: nome(m.unidade), base: m.base, meta: i === 0 && q != null ? q : m.meta, medicoes: [] }));
  p.marcos = md.marcos.map(([n, f]) => ({ id: uid(), nome: n, prazo: t0 && t1 ? new Date(t0 + f * (t1 - t0)).toISOString().slice(0, 10) : "", ok: false }));
  p.riscos = md.riscos.map(([desc, prob, impacto, mitig]) => ({ id: uid(), desc, prob, impacto, mitig, resp: p.gerente || "", status: "Aberto" }));
  if (!p.responsaveis) p.responsaveis = md.equipe;
}
function posProjForm(p) {
  if ($("#selModelo")) $("#selModelo").onchange = ev => location.hash = "#proj/novo" + (ev.target.value ? "/" + ev.target.value : "");
  $("#salvaProj").onclick = () => {
    const f = {}; $$("#fproj [name]").forEach(e => f[e.name] = e.multiple ? [...e.selectedOptions].map(x => x.value) : e.value.trim());
    if (!f.titulo || !f.org) { $("#erroProj").textContent = "Preencha nome e órgão executor."; return; }
    if (!ehGov() && topo(f.org) !== meu()) return;
    const dados = { titulo: f.titulo, org: f.org, tipo: f.tipo, status: f.status, descricao: f.descricao, municipios: f.municipios,
      inicio: f.inicio, fim: f.fim, gerente: f.gerente, responsaveis: f.responsaveis, fonte: f.fonte, indicadores: f.indicadores,
      orcamento: { previsto: numIn(f.previsto), empenhado: numIn(f.empenhado), pago: numIn(f.pago) }, em: agora() };
    if (munsDe(dados).length < String(f.municipios).split(/[,;/]| e /).filter(s => s.trim()).length) {
      $("#erroProj").textContent = "Algum município não foi reconhecido; use os nomes da lista (IBGE)."; return;
    }
    const o0 = (p && p.orcamento) || {}, o1 = dados.orcamento;
    if (!p || o0.previsto !== o1.previsto || o0.empenhado !== o1.empenhado || o0.pago !== o1.pago)
      dados.orcHist = [...((p && p.orcHist) || []), { data: hoje(), ...o1, por: quem() }];
    if (p) { Object.assign(p, dados); registra(p.org, `Projeto atualizado: ${p.titulo} (${p.status})`, p.id); }
    else {
      p = { id: uid(), metricas: [], marcos: [], por: quem(), ...dados };
      const md = $("#selModelo") && MOD[$("#selModelo").value];
      if (md) aplicaModelo(p, md, f.m_u, numIn(f.m_q));
      S.projetos.push(p); registra(p.org, `Novo projeto: ${p.titulo}`, p.id); }
    save(); location.hash = "#proj/" + p.id;
  };
}

// ---------- tela: projeto (dashboard) ----------
function grafico(m) {
  const med = (m.medicoes || []).slice().sort((a, b) => a.data.localeCompare(b.data));
  if (!med.length) return `<p class="muted" style="margin:10px 0 0">Sem medições ainda.</p>`;
  const ts = med.map(x => +new Date(x.data)), t0 = Math.min(...ts), t1 = Math.max(...ts);
  const ymax = Math.max(m.meta ?? 0, m.base ?? 0, ...med.map(x => x.valor), 1) * 1.08, ymin = Math.min(0, m.base ?? 0, ...med.map(x => x.valor));
  const W = 520, H = 170, P = { l: 14 + 7 * nf(Math.round(ymax)).length, r: 14, t: 14, b: 24 }; // margem cabe o maior rótulo
  const X = t => t1 === t0 ? (P.l + W - P.r) / 2 : P.l + (t - t0) / (t1 - t0) * (W - P.l - P.r);
  const Y = v => H - P.b - (v - ymin) / (ymax - ymin) * (H - P.t - P.b);
  const pts = med.map((x, k) => [X(ts[k]), Y(x.valor), x]);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução de ${esc(m.nome)}">`;
  [ymin, (ymin + ymax) / 2, ymax].forEach(v => s += `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${P.l - 6}" y="${Y(v) + 4}" text-anchor="end">${nf(Math.round(v))}</text>`);
  if (m.meta != null) s += `<line class="meta" x1="${P.l}" x2="${W - P.r}" y1="${Y(m.meta)}" y2="${Y(m.meta)}"/><text x="${W - P.r}" y="${Y(m.meta) - 5}" text-anchor="end">meta ${nf(m.meta)}</text>`;
  if (pts.length > 1) s += `<polyline class="serie" points="${pts.map(p => p[0] + "," + p[1]).join(" ")}"/>`;
  pts.forEach(([x, y, d]) => s += `<circle class="pt" cx="${x}" cy="${y}" r="5"><title>${fmtD(d.data)}: ${nf(d.valor)} ${esc(m.unidade || "")}${d.obs ? " — " + esc(d.obs) : ""}</title></circle><circle cx="${x}" cy="${y}" r="12" fill="transparent"><title>${fmtD(d.data)}: ${nf(d.valor)} ${esc(m.unidade || "")}</title></circle>`);
  s += `<text x="${P.l}" y="${H - 6}">${fmtD(med[0].data)}</text>`;
  if (med.length > 1) s += `<text x="${W - P.r}" y="${H - 6}" text-anchor="end">${fmtD(med[med.length - 1].data)}</text>`;
  return s + `</svg>`;
}
function telaProj(p, aba) {
  const ed = podeEditar(p.org), k = kpiProj(p), o = p.orcamento || {};
  const marcos = (p.marcos || []).slice().sort((a, b) => (a.prazo || "9").localeCompare(b.prazo || "9"));
  const dias = p.fim ? Math.round((new Date(p.fim) - new Date(hoje())) / 864e5) : null;
  const coms = S.msgs.filter(m => m.ref === p.id).slice().reverse();
  aba = aba || "painel";
  let h = `<p class="noprint"><a href="#proj">← projetos</a></p>
  <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap"><div style="flex:1;min-width:280px"><h2>${esc(p.titulo)}</h2>
    <p class="lead">${stProj(p)} · ${esc(p.tipo || "")} · executor <b>${esc(ORG[p.org].sigla)}</b>${topo(p.org) !== p.org ? ` (↳ ${esc(ORG[topo(p.org)].sigla)})` : ""} · gerente ${esc(p.gerente || "—")}${p.responsaveis ? " · equipe: " + esc(p.responsaveis) : ""}${p.municipios ? " · " + esc(p.municipios) : ""}</p></div>
    <span class="noprint"><button class="btn" id="imprimir" title="Abre a impressão; escolha “Salvar como PDF”">Relatório (PDF)</button>
    ${ed ? `<a class="btn" href="#proj/${p.id}/editar">Editar projeto</a>` : ""}</span></div>
  <p class="soprint muted">Relatório gerado em ${fmt(agora())} por ${esc(quem())} · Plataforma de Gestão Governamental — Amazonas (protótipo)</p>
  ${p.descricao ? `<p style="margin:0 0 6px">${esc(p.descricao)}</p>` : ""}
  ${ed ? "" : `<div class="banner">Modo leitura${ehGov() ? ": o Governador pode comentar na aba Comentários" : ""}.</div>`}
  <div class="tiles">
    <div class="tile"><div class="v">${pct(k.fis)}</div><div class="l">execução física</div></div>
    <div class="tile"><div class="v">${pct(k.fin)}</div><div class="l">execução financeira (pago/previsto)</div></div>
    <div class="tile"><div class="v">${brlC(o.previsto)}</div><div class="l">orçamento previsto${p.fonte ? " · " + esc(p.fonte) : ""}</div></div>
    <div class="tile"><div class="v">${marcos.filter(m => m.ok).length}/${marcos.length}</div><div class="l">marcos concluídos${k.marcosAtr ? ` · <b style="color:var(--critical)">${k.marcosAtr} atrasado(s)</b>` : ""}</div></div>
    <div class="tile"><div class="v">${dias == null ? "—" : dias >= 0 ? dias + " dias" : Math.abs(dias) + " dias"}</div><div class="l">${dias == null ? "sem prazo final" : dias >= 0 ? "até o prazo final (" + fmtD(p.fim) + ")" : "de atraso (prazo " + fmtD(p.fim) + ")"}</div></div>
  </div>
  ${k.descasado ? `<div class="banner">Atenção: execução financeira (${pct(k.fin)}) está mais de 25 pontos à frente da física (${pct(k.fis)}).</div>` : ""}
  <div class="subtabs">${[["painel", "Dashboard"], ["anexos", `Anexos (${(p.anexos || []).length})`], ["comentarios", `Comentários (${coms.filter(m => m.tipo !== "log").length})`], ["historico", "Histórico"]].map(([a, n]) => `<a href="#proj/${p.id}/${a}" ${aba === a ? 'aria-current="page"' : ""}>${n}</a>`).join("")}</div>`;
  if (aba === "comentarios") {
    return h + `<div class="grid2"><div class="card">${feed(coms.filter(m => m.tipo !== "log"))}</div>
      <div class="card"><h3>Novo comentário</h3><textarea id="comTxt" ${ehGov() || ed ? "" : "disabled"}></textarea><p><button class="btn pri" id="comEnviar" ${ehGov() || ed ? "" : "disabled"}>Enviar</button></p></div></div>`;
  }
  if (aba === "historico") return h + `<div class="card">${feed(coms.filter(m => m.tipo === "log"))}</div>`;
  if (aba === "anexos") {
    const ax = (p.anexos || []).slice().reverse();
    return h + (ed ? `<div class="card noprint"><h3>Novo anexo</h3><div class="form" id="fanexo">
      <label>Tipo<select name="tipo">${["Foto da obra", "Contrato", "Medição/nota fiscal", "Ofício", "Outro"].map(t => `<option>${t}</option>`).join("")}</select></label>
      <label class="dois">Descrição<input name="desc" placeholder="Ex.: fachada bloco A, 10/11"></label>
      <label>Arquivo (até 1 MB)<input type="file" name="arq" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"></label>
      <label class="dois">ou link (SEI, Drive, site)<input name="url" placeholder="https://…"></label>
      <div><button class="btn pri" id="addAnexo">Anexar</button> <span class="muted" id="erroAnexo"></span></div></div>
      <p class="aviso">Protótipo: arquivos ficam no navegador, que guarda no máximo uns 5 MB no total. Para documentos grandes, use link.</p></div>` : "")
      + `<div class="card">${ax.length ? `<div class="grid-m">${ax.map(a => `<div class="metric"><div class="top"><b>${esc(a.tipo)}</b>${ed ? `<button class="btn mini noprint" data-delanexo="${a.id}">remover</button>` : ""}</div>
        ${a.dados && a.dados.startsWith("data:image") ? `<a href="${a.dados}" target="_blank"><img src="${a.dados}" alt="${esc(a.desc || a.nome)}" style="width:100%;max-height:220px;object-fit:cover;border-radius:6px;margin:6px 0"></a>` : ""}
        <div>${esc(a.desc || "")}</div><div class="muted">${a.dados ? `<a href="${a.dados}" download="${esc(a.nome)}">${esc(a.nome)}</a>` : `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.url)}</a>`} · ${fmt(a.em)} · ${esc(a.por)}</div></div>`).join("")}</div>`
        : `<p class="muted">Nenhum anexo.</p>`}</div>`;
  }
  // dashboard
  h += `<h3>Métricas do projeto</h3><div class="grid-m">`;
  h += (p.metricas || []).map(m => {
    const pm = progMetrica(m);
    return `<div class="metric" data-m="${m.id}"><div class="top"><b>${esc(m.nome)}</b>${ed ? `<button class="btn mini" data-delmet="${m.id}">remover</button>` : ""}</div>
      <div class="big">${nf(pm.ult)} <small>de ${nf(m.meta)} ${esc(m.unidade || "")}${m.base ? " · base " + nf(m.base) : ""}</small></div>${pbar(pm.p)}
      ${grafico(m)}
      ${ed ? `<form class="noprint" data-med="${m.id}"><input type="date" name="data" value="${hoje()}" aria-label="Data"><input name="valor" inputmode="decimal" placeholder="valor medido" aria-label="Valor"><input name="obs" placeholder="observação" aria-label="Observação"><button class="btn mini pri">Registrar medição</button></form>` : ""}</div>`;
  }).join("");
  if (ed) h += `<div class="metric noprint"><b>Nova métrica</b><p class="muted" style="margin:4px 0 8px">Ex.: “Casas concluídas” · unidade “casas” · meta 20.</p>
    <div class="form" id="fmet"><label class="full">Nome<input name="nome"></label><label>Unidade<input name="unidade"></label><label>Linha de base<input name="base" inputmode="decimal" value="0"></label><label>Meta<input name="meta" inputmode="decimal"></label>
    <div><button class="btn pri" id="addMet">Adicionar métrica</button></div></div></div>`;
  if (!(p.metricas || []).length && !ed) h += `<p class="muted">Nenhuma métrica cadastrada.</p>`;
  h += `</div><div class="grid-m" style="margin-top:16px"><div class="card budget"><h3>Orçamento</h3>
    ${[["prev", "Previsto", o.previsto], ["emp", "Empenhado", o.empenhado], ["pag", "Pago", o.pago]].map(([c, n, v]) => `<div class="row ${c}"><span>${n}</span><div class="track"><i style="width:${o.previsto ? Math.min(100, (v || 0) / o.previsto * 100) : 0}%"></i></div><span class="num" style="text-align:right">${brl(v)}</span></div>`).join("")}
    ${ed ? `<div class="form noprint" id="forc" style="margin-top:10px"><label>Data<input type="date" name="data" value="${hoje()}"></label><label>Empenhado (R$)<input name="empenhado" inputmode="decimal" value="${o.empenhado ?? ""}"></label><label>Pago (R$)<input name="pago" inputmode="decimal" value="${o.pago ?? ""}"></label><div><button class="btn mini pri" id="salvaOrc">Atualizar orçamento</button></div></div>` : ""}
    ${(p.orcHist || []).length ? `<h3>Histórico do orçamento</h3><table><thead><tr><th>Data</th><th class="num">Previsto</th><th class="num">Empenhado</th><th class="num">Pago</th><th class="num">% pago</th><th>Por</th></tr></thead><tbody>`
      + p.orcHist.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 6).map(x => `<tr><td>${fmtD(x.data)}</td><td class="num">${brl(x.previsto)}</td><td class="num">${brl(x.empenhado)}</td><td class="num">${brl(x.pago)}</td><td class="num">${pct(x.previsto ? (x.pago || 0) / x.previsto : null)}</td><td class="muted">${esc(x.por)}</td></tr>`).join("") + `</tbody></table>${p.orcHist.length > 6 ? `<p class="aviso">Mostrando os 6 registros mais recentes de ${p.orcHist.length}.</p>` : ""}` : ""}</div>
    <div class="card marcos"><h3>Marcos</h3>${marcos.length ? `<ul>${marcos.map(m => `<li><input type="checkbox" data-marco="${m.id}" ${m.ok ? "checked" : ""} ${ed ? "" : "disabled"} aria-label="Concluído">
      <span class="${m.ok ? "feito" : ""}" style="flex:1">${esc(m.nome)}</span><span class="${!m.ok && m.prazo && m.prazo < hoje() ? "st cr" : "muted"}">${!m.ok && m.prazo && m.prazo < hoje() ? "<i></i>" : ""}${fmtD(m.prazo)}</span>${ed ? `<button class="btn mini" data-delmarco="${m.id}">×</button>` : ""}</li>`).join("")}</ul>` : `<p class="muted">Nenhum marco.</p>`}
    ${ed ? `<div class="form noprint" id="fmarco" style="margin-top:10px"><label class="dois">Novo marco<input name="nome" placeholder="Ex.: Ordem de serviço"></label><label>Prazo<input type="date" name="prazo"></label><div><button class="btn mini pri" id="addMarco">Adicionar</button></div></div>` : ""}</div></div>`;
  // riscos: probabilidade × impacto; Alta × Alto aberto gera alerta no projeto
  const riscos = p.riscos || [], nivel = r => ({ Baixa: 1, Média: 2, Alta: 3 }[r.prob] || 1) * ({ Baixo: 1, Médio: 2, Alto: 3 }[r.impacto] || 1);
  const stR = r => r.status === "Encerrado" ? `<span class="st"><i></i>Encerrado</span>` : nivel(r) >= 9 ? `<span class="st cr"><i></i>Alto</span>` : nivel(r) >= 4 ? `<span class="st at"><i></i>Médio</span>` : `<span class="st ok"><i></i>Baixo</span>`;
  h += `<div class="card"><h3>Riscos${k.riscosAltos ? ` · <span class="st cr"><i></i>${k.riscosAltos} alto(s) aberto(s)</span>` : ""}</h3>`
    + (riscos.length ? `<table id="trisco"><thead><tr><th>Risco</th><th>Probabilidade</th><th>Impacto</th><th>Nível</th><th>Mitigação</th><th>Responsável</th><th>Situação</th><th></th></tr></thead><tbody>`
      + riscos.slice().sort((a, b) => (a.status === "Encerrado") - (b.status === "Encerrado") || nivel(b) - nivel(a)).map(r => `<tr data-r="${r.id}"><td>${esc(r.desc)}</td><td>${esc(r.prob)}</td><td>${esc(r.impacto)}</td><td>${stR(r)}</td><td>${esc(r.mitig || "—")}</td><td>${esc(r.resp || "—")}</td>
        <td>${ed ? `<select data-k="status">${["Aberto", "Em tratamento", "Encerrado"].map(s => `<option ${r.status === s ? "selected" : ""}>${s}</option>`).join("")}</select>` : esc(r.status)}</td><td>${ed ? `<button class="btn mini noprint" data-delrisco="${r.id}">×</button>` : ""}</td></tr>`).join("") + `</tbody></table>`
      : `<p class="muted">Nenhum risco cadastrado.</p>`)
    + (ed ? `<div class="form noprint" id="frisco" style="margin-top:10px"><label class="dois">Novo risco<input name="desc" placeholder="Ex.: atraso na licença ambiental"></label>
      <label>Probabilidade<select name="prob"><option>Baixa</option><option selected>Média</option><option>Alta</option></select></label>
      <label>Impacto<select name="impacto"><option>Baixo</option><option selected>Médio</option><option>Alto</option></select></label>
      <label class="dois">Mitigação<input name="mitig"></label><label>Responsável<input name="resp" list="eqlist2"></label>
      <datalist id="eqlist2">${nomesEquipe(p.org).map(n => `<option value="${esc(n)}">`).join("")}</datalist>
      <div><button class="btn mini pri" id="addRisco">Adicionar risco</button></div></div>` : "") + `</div>`;
  if ((p.indicadores || []).length) h += `<div class="card"><h3>Indicadores do plano relacionados</h3><table><tbody>${p.indicadores.filter(id => IND[id]).map(id => { const i = IND[id], v = S.val[id] || {}; return `<tr><td>${esc(i.indicador)}<div class="muted">${esc(i.area)}</div></td><td>meta ${esc(i.meta || "—")}</td><td>valor ${esc(v.valor || "—")}</td><td>${stInd(v.status)}</td></tr>`; }).join("")}</tbody></table></div>`;
  return h;
}
function posProj(p) {
  const muda = txt => { p.em = agora(); registra(p.org, `${p.titulo}: ${txt}`, p.id); save(); render(); };
  if ($("#comEnviar")) $("#comEnviar").onclick = () => {
    const t = $("#comTxt").value.trim(); if (!t) return;
    S.msgs.push({ id: uid(), org: topo(p.org), ref: p.id, de: quem(), lado: S.perfil.tipo, tipo: "com", texto: `[${p.titulo}] ${t}`, em: agora(), lidaGov: ehGov(), lidaOrg: !ehGov() });
    save(); render();
  };
  $("#imprimir").onclick = () => window.print();
  if (!podeEditar(p.org)) return;
  if ($("#addRisco")) $("#addRisco").onclick = () => {
    const f = Object.fromEntries($$("#frisco [name]").map(e => [e.name, e.value.trim()]));
    if (!f.desc) { $("#frisco [name=desc]").focus(); return; }
    (p.riscos = p.riscos || []).push({ id: uid(), ...f, status: "Aberto" });
    muda(`novo risco: ${f.desc} (${f.prob} × ${f.impacto})`);
  };
  if ($("#trisco")) $("#trisco").onchange = ev => { const r = p.riscos.find(x => x.id === ev.target.closest("tr").dataset.r); r.status = ev.target.value; muda(`risco "${r.desc}": ${r.status}`); };
  $$("[data-delrisco]").forEach(b => b.onclick = () => { const r = p.riscos.find(x => x.id === b.dataset.delrisco); p.riscos = p.riscos.filter(x => x !== r); muda(`risco removido: ${r.desc}`); });
  if ($("#addAnexo")) $("#addAnexo").onclick = async () => {
    const g = n => $(`#fanexo [name=${n}]`), arq = g("arq").files[0], url = g("url").value.trim(), erro = t => $("#erroAnexo").textContent = t;
    if (!arq && !/^https?:\/\//.test(url)) return erro("Escolha um arquivo ou cole um link https://.");
    if (arq && arq.size > 1048576) return erro("Arquivo acima de 1 MB: use um link.");
    const a = { id: uid(), tipo: g("tipo").value, desc: g("desc").value.trim(), em: agora(), por: quem() };
    if (arq) Object.assign(a, { nome: arq.name, dados: await new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(arq); }) });
    else a.url = url;
    (p.anexos = p.anexos || []).push(a);
    if (!save()) { p.anexos.pop(); return erro("Sem espaço no navegador: remova anexos ou use link."); }
    muda(`anexo: ${a.tipo}${a.desc ? " — " + a.desc : ""}`);
  };
  $$("[data-delanexo]").forEach(b => b.onclick = () => { const a = p.anexos.find(x => x.id === b.dataset.delanexo); p.anexos = p.anexos.filter(x => x !== a); muda(`anexo removido: ${a.tipo}${a.desc ? " — " + a.desc : ""}`); });
  $$("form[data-med]").forEach(f => f.onsubmit = ev => {
    ev.preventDefault();
    const m = p.metricas.find(x => x.id === f.dataset.med), v = numIn(f.valor.value);
    if (v == null || !f.data.value) { f.valor.focus(); return; }
    m.medicoes.push({ data: f.data.value, valor: v, obs: f.obs.value.trim(), por: quem() });
    muda(`${m.nome} = ${nf(v)} ${m.unidade || ""} em ${fmtD(f.data.value)}`);
  });
  $$("[data-delmet]").forEach(b => b.onclick = () => { if (confirm("Remover esta métrica e suas medições?")) { const m = p.metricas.find(x => x.id === b.dataset.delmet); p.metricas = p.metricas.filter(x => x !== m); muda(`métrica removida: ${m.nome}`); } });
  if ($("#addMet")) $("#addMet").onclick = () => {
    const g = n => $(`#fmet [name=${n}]`).value.trim();
    if (!g("nome") || numIn(g("meta")) == null) { $("#fmet [name=" + (g("nome") ? "meta" : "nome") + "]").focus(); return; }
    p.metricas.push({ id: uid(), nome: g("nome"), unidade: g("unidade"), base: numIn(g("base")) ?? 0, meta: numIn(g("meta")), medicoes: [] });
    muda(`nova métrica: ${g("nome")} (meta ${g("meta")} ${g("unidade")})`);
  };
  if ($("#salvaOrc")) $("#salvaOrc").onclick = () => {
    p.orcamento.empenhado = numIn($("#forc [name=empenhado]").value); p.orcamento.pago = numIn($("#forc [name=pago]").value);
    (p.orcHist = p.orcHist || []).push({ data: $("#forc [name=data]").value || hoje(), ...p.orcamento, por: quem() });
    muda(`orçamento: empenhado ${brl(p.orcamento.empenhado)}, pago ${brl(p.orcamento.pago)}`);
  };
  $$("[data-marco]").forEach(c => c.onchange = () => { const m = p.marcos.find(x => x.id === c.dataset.marco); m.ok = c.checked; m.data_ok = c.checked ? hoje() : ""; muda(`marco "${m.nome}" ${m.ok ? "concluído" : "reaberto"}`); });
  $$("[data-delmarco]").forEach(b => b.onclick = () => { const m = p.marcos.find(x => x.id === b.dataset.delmarco); p.marcos = p.marcos.filter(x => x !== m); muda(`marco removido: ${m.nome}`); });
  if ($("#addMarco")) $("#addMarco").onclick = () => {
    const n = $("#fmarco [name=nome]").value.trim(), pr = $("#fmarco [name=prazo]").value; if (!n) return;
    p.marcos.push({ id: uid(), nome: n, prazo: pr, ok: false }); muda(`novo marco: ${n}${pr ? " (" + fmtD(pr) + ")" : ""}`);
  };
}

// ---------- tela: secretaria ----------
function telaOrgLista() {
  const tops = O.filter(o => topo(o.id) === o.id && !["GOV", "VICE"].includes(o.id))
    .map(o => ({ o, r: resumo(o.id) })).sort((a, b) => (b.r.n + b.r.pj) - (a.r.n + a.r.pj) || a.o.sigla.localeCompare(b.o.sigla));
  return `<h2>Secretarias e órgãos</h2><p class="lead">Cada secretaria comanda seus projetos, indicadores do plano, ações, equipe e conversa com o governador. Órgãos vinculados aparecem dentro da secretaria supervisora.</p>
  <div class="orgsel">${tops.map(({ o, r }) => `<a href="#org/${o.id}"><b>${esc(o.sigla)}</b> <small>${esc(o.nome)}</small>
    <small>${r.pj} projetos ativos · ${r.n} indicadores${r.pjAlerta || r.atr ? ` · <span style="color:var(--critical)">${r.pjAlerta + r.atr} alertas</span>` : ""}</small></a>`).join("")}</div>`;
}
function telaOrg(id, aba) {
  const o = ORG[id];
  if (ehGov()) S.msgs.forEach(m => { if (m.org === id && m.lado === "org") m.lidaGov = true; });
  else S.msgs.forEach(m => { if (m.org === id && m.lado === "gov") m.lidaOrg = true; });
  save();
  const r = resumo(id), vin = vinculadas(id), ed = podeEditar(id);
  const abas = [["projetos", `Projetos (${projsDe(id).length})`], ["indicadores", `Indicadores do plano (${r.n})`], ["acoes", `Ações (${acoesDe(id).length})`], ["equipe", `Equipe (${(S.equipes[id] || []).length})`], ["mensagens", "Conversa com o governador"]];
  aba = aba || "projetos";
  let h = `${ehGov() ? `<p><a href="#org">← todas as secretarias</a></p>` : ""}<h2>${esc(o.sigla)} — ${esc(o.nome)}</h2>
    <p class="lead">${esc(o.cargo)}: <b>${esc(o.titular)}</b>${vin.length ? ` · vinculados: ${vin.map(v => esc(v.sigla)).join(", ")}` : ""}${o.site ? ` · <a href="${esc(o.site)}" target="_blank" rel="noopener">site ↗</a>` : ""}</p>
    ${ed ? "" : `<div class="banner">Modo leitura (Governador): você pode comentar e enviar mensagens. A edição é feita pelo titular ou equipe de ${esc(o.sigla)}.</div>`}
    <div class="tiles"><div class="tile"><div class="v">${r.pj}</div><div class="l">projetos ativos${r.pjAlerta ? ` · <b style="color:var(--critical)">${r.pjAlerta} com alerta</b>` : ""}</div></div>
    <div class="tile"><div class="v">${brlC(r.orc)}</div><div class="l">orçamento em projetos · ${pct(r.orc ? r.pago / r.orc : null)} pago</div></div>
    <div class="tile"><div class="v">${r.alim}/${r.n}</div><div class="l">indicadores do plano alimentados</div></div>
    <div class="tile"><div class="v">${r.at} / ${r.cr}</div><div class="l">indicadores em atenção / críticos</div></div>
    <div class="tile"><div class="v">${r.atr}</div><div class="l">ações atrasadas</div></div></div>
    <div class="subtabs">${abas.map(([k, n]) => `<a href="#org/${id}/${k}" ${aba === k ? 'aria-current="page"' : ""}>${n}</a>`).join("")}</div>`;
  const equipe = S.equipes[id] || [];
  const optEq = sel => `<option value="">—</option>` + equipe.map(m => `<option ${m.nome === sel ? "selected" : ""}>${esc(m.nome)}</option>`).join("");
  if (aba === "projetos") {
    const pj = projsDe(id);
    h += `<div class="filters"><span class="muted">${pj.length} projeto(s)</span><span style="margin-left:auto"></span>${ed ? `<a class="btn pri" href="#proj/novo">+ Novo projeto</a>` : ""}</div><div class="card">`
      + (pj.length ? `<table><thead><tr><th>Projeto</th><th>Executor</th><th>Situação</th><th>Física</th><th>Financeira</th><th class="num">Orçamento</th><th>Prazo</th></tr></thead><tbody>`
        + pj.map(p => { const k = kpiProj(p); return `<tr class="click" data-go="#proj/${p.id}"><td><b>${esc(p.titulo)}</b><div class="muted">${esc(p.gerente || "")}</div></td><td>${esc(ORG[p.org].sigla)}</td><td>${stProj(p)}</td><td>${pbar(k.fis)}</td><td>${pbar(k.fin)}</td><td class="num">${brlC((p.orcamento || {}).previsto)}</td><td>${fmtD(p.fim) || "—"}</td></tr>`; }).join("") + `</tbody></table>`
        : `<p class="muted">Nenhum projeto cadastrado.</p>`) + `</div>`;
  }
  if (aba === "indicadores") {
    const inds = indsDe(id);
    h += inds.length ? `<div class="card"><table id="tind"><thead><tr><th>Indicador</th><th>Órgão</th><th>Meta / prazo</th><th>Valor atual</th><th>Data ref.</th><th>Fonte do dado</th><th>Situação</th><th>Responsável</th></tr></thead><tbody>`
      + inds.map(i => { const v = S.val[i.id] || {}; const dis = ed ? "" : "disabled"; return `<tr data-i="${i.id}"><td>${esc(i.indicador)}<div class="muted">${esc(i.id)} · ${esc(i.area)}${v.em ? " · atualizado " + fmt(v.em) + " por " + esc(v.por) : ""}</div></td>
        <td>${esc(ORG[S.atrib[i.id]].sigla)}</td><td>${esc(i.meta || "—")}${i.prazo ? `<div class="muted">${esc(i.prazo)}</div>` : ""}${i.base ? `<div class="muted">base ${esc(i.base)}</div>` : ""}</td>
        <td><input class="val" data-k="valor" value="${esc(v.valor)}" ${dis}></td><td><input type="date" data-k="data" value="${esc(v.data)}" ${dis}></td>
        <td><input class="fonte" data-k="fonte" value="${esc(v.fonte)}" placeholder="sistema, relatório…" ${dis}></td>
        <td><select data-k="status" ${dis}>${Object.entries(STATUS_IND).map(([k, [l]]) => `<option value="${k}" ${(v.status || "") === k ? "selected" : ""}>${l}</option>`).join("")}</select></td>
        <td><select data-k="resp" ${dis}>${optEq(v.resp)}</select></td></tr>`; }).join("") + `</tbody></table></div>`
      : `<div class="card muted">Nenhum indicador do plano atribuído a ${esc(o.sigla)} ainda. A atribuição é feita pelo Governador na Distribuição de indicadores.</div>`;
  }
  if (aba === "acoes") {
    const ac = acoesDe(id).slice().sort((a, b) => (a.prazo || "9").localeCompare(b.prazo || "9"));
    if (ed) h += `<div class="card"><h3>Nova ação</h3><div class="form" id="facao">
      <label class="full">Título<input name="titulo" placeholder="Ex.: Publicar edital de capacitação"></label>
      <label>Indicador vinculado<select name="ind"><option value="">—</option>${indsDe(id).map(i => `<option value="${i.id}">${esc(i.indicador.slice(0, 70))}</option>`).join("")}</select></label>
      <label>Órgão executor<select name="org">${[o, ...vin].map(x => `<option value="${x.id}">${esc(x.sigla)}</option>`).join("")}</select></label>
      <label>Responsável<select name="resp">${optEq("")}</select></label>
      <label>Prazo<input type="date" name="prazo"></label>
      <label class="full">Descrição<textarea name="desc"></textarea></label>
      <div><button class="btn pri" id="addAcao">Adicionar ação</button></div></div></div>`;
    h += `<div class="card">` + (ac.length ? `<table id="tac"><thead><tr><th>Ação</th><th>Executor</th><th>Responsável</th><th>Prazo</th><th>Situação</th><th>% exec.</th><th></th></tr></thead><tbody>`
      + ac.map(a => `<tr data-a="${a.id}"><td><b>${esc(a.titulo)}</b>${a.ind && IND[a.ind] ? `<div class="muted">↳ ${esc(IND[a.ind].indicador)}</div>` : ""}${a.desc ? `<div class="muted">${esc(a.desc)}</div>` : ""}</td>
        <td>${esc(ORG[a.org].sigla)}</td><td>${esc(a.resp || "—")}</td><td>${fmtD(a.prazo) || "—"}<div>${stAc(a)}</div></td>
        <td><select data-k="status" ${ed ? "" : "disabled"}>${STATUS_AC.map(s => `<option ${a.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></td>
        <td><input type="number" min="0" max="100" step="5" data-k="perc" value="${a.perc || 0}" style="width:70px" ${ed ? "" : "disabled"}></td>
        <td>${ed ? `<button class="btn mini" data-del="${a.id}">excluir</button>` : ""}</td></tr>`).join("") + `</tbody></table>`
      : `<p class="muted">Nenhuma ação cadastrada.</p>`) + `</div>`;
  }
  if (aba === "equipe") {
    h += `<div class="card">` + (equipe.length ? `<table><thead><tr><th>Nome</th><th>Função</th><th class="num">Indicadores</th><th class="num">Ações</th><th class="num">Projetos</th><th></th></tr></thead><tbody>`
      + equipe.map((m, k) => `<tr><td>${esc(m.nome)}</td><td>${esc(m.funcao)}</td>
        <td class="num">${indsDe(id).filter(i => (S.val[i.id] || {}).resp === m.nome).length}</td><td class="num">${acoesDe(id).filter(a => a.resp === m.nome).length}</td>
        <td class="num">${projsDe(id).filter(p => p.gerente === m.nome || (p.responsaveis || "").split(",").map(s => s.trim()).includes(m.nome)).length}</td>
        <td>${ed ? `<button class="btn mini" data-delm="${k}">remover</button>` : ""}</td></tr>`).join("") + `</tbody></table>` : `<p class="muted">Equipe não cadastrada.</p>`)
      + (ed ? `<h3>Adicionar membro</h3><div class="form" id="fmem"><label>Nome<input name="nome"></label><label>Função<input name="funcao" placeholder="Ex.: Gerente de projetos"></label><div><button class="btn pri" id="addMem">Adicionar</button></div></div>
        <p class="aviso">Membros aparecem no seletor de perfil do topo e podem ser gerentes de projeto e responsáveis por indicadores e ações.</p>` : "") + `</div>`;
  }
  if (aba === "mensagens") {
    const ms = S.msgs.filter(m => m.org === id).slice().reverse();
    h += `<div class="grid2"><div class="card"><h3>Conversa ${esc(o.sigla)} ↔ Governador</h3>${feed(ms.filter(m => m.tipo !== "log"))}</div>
      <div><div class="card"><h3>${ehGov() ? "Enviar determinação" : "Mensagem ao governador"}</h3>
      <textarea id="msgTxt"></textarea><p><button class="btn pri" id="msgEnviar">Enviar</button></p></div>
      <div class="card"><h3>Histórico de atualizações</h3>${feed(ms.filter(m => m.tipo === "log").slice(0, 30))}</div></div></div>`;
  }
  return h;
}
function posOrg(id) {
  const ed = podeEditar(id);
  if ($("#msgEnviar")) $("#msgEnviar").onclick = () => {
    const txt = $("#msgTxt").value.trim(); if (!txt) return;
    S.msgs.push({ id: uid(), org: id, de: quem(), lado: S.perfil.tipo, tipo: ehGov() ? "det" : "msg", texto: txt, em: agora(), lidaGov: ehGov(), lidaOrg: !ehGov() });
    save(); render();
  };
  if (!ed) return;
  if ($("#tind")) $("#tind").onchange = ev => {
    const tr = ev.target.closest("tr[data-i]"), k = ev.target.dataset.k; if (!tr || !k) return;
    const v = S.val[tr.dataset.i] = S.val[tr.dataset.i] || {};
    v[k] = ev.target.value; v.em = agora(); v.por = quem();
    const i = IND[tr.dataset.i];
    registra(S.atrib[i.id], `${i.indicador}: ${k === "valor" ? "valor " + v.valor : k === "status" ? "situação " + STATUS_IND[v.status][0] : k + " " + ev.target.value}`, i.id);
    save();
  };
  if ($("#addAcao")) $("#addAcao").onclick = () => {
    const f = Object.fromEntries($$("#facao [name]").map(e => [e.name, e.value.trim()]));
    if (!f.titulo) { $("#facao [name=titulo]").focus(); return; }
    S.acoes.push({ id: uid(), ...f, status: "Não iniciada", perc: 0, em: agora(), por: quem() });
    registra(f.org, `Nova ação: ${f.titulo}${f.prazo ? " (prazo " + fmtD(f.prazo) + ")" : ""}`);
    save(); render();
  };
  if ($("#tac")) {
    $("#tac").onchange = ev => {
      const tr = ev.target.closest("tr[data-a]"), a = S.acoes.find(x => x.id === tr.dataset.a), k = ev.target.dataset.k;
      a[k] = k === "perc" ? Math.max(0, Math.min(100, +ev.target.value || 0)) : ev.target.value;
      if (k === "status" && a.status === "Concluída") a.perc = 100;
      a.em = agora(); registra(a.org, `Ação "${a.titulo}": ${k === "perc" ? a.perc + "% executado" : a.status}`); save(); render();
    };
    $("#tac").onclick = ev => { const b = ev.target.closest("[data-del]"); if (b && confirm("Excluir esta ação?")) { S.acoes = S.acoes.filter(a => a.id !== b.dataset.del); save(); render(); } };
  }
  if ($("#addMem")) $("#addMem").onclick = () => {
    const nome = $("#fmem [name=nome]").value.trim(), funcao = $("#fmem [name=funcao]").value.trim();
    if (!nome) return;
    (S.equipes[id] = S.equipes[id] || []).push({ nome, funcao }); save(); render();
  };
  $$("[data-delm]").forEach(b => b.onclick = () => { S.equipes[id].splice(+b.dataset.delm, 1); save(); render(); });
}

// ---------- tela: modelos de projeto ----------
function telaModelos() {
  const meus = projsDe(meu());
  return `<h2>Modelos de projeto</h2><p class="lead">Cada modelo já traz as métricas, os marcos e os riscos típicos daquele tipo de projeto. Ao criar um projeto a partir do modelo, basta informar a unidade, a meta e as datas; tudo pode ser ajustado depois.</p>
  ${S.projetos.some(ehExemplo) ? "" : `<div class="banner">Para ver os modelos em uso, carregue a carteira de exemplo na tela <a href="#proj">Projetos</a> (${window.EXEMPLOS.length} projetos simulados de todas as secretarias).</div>`}
  <div class="grid-m">${MODELOS.map(m => {
    const ex = meus.filter(p => p.modelo === m.id);
    return `<div class="card"><h3>${esc(m.nome)}</h3><p class="muted" style="margin:0 0 8px">${esc(m.tipo)} · ${esc(m.desc)}</p>
      <b>Métricas</b><ul style="margin:4px 0 8px">${m.metricas.map(x => `<li>${esc(x.nome.replace("{u}", m.u))} — meta padrão ${nf(x.meta)} ${esc(x.unidade.replace("{u}", m.u))}${x.base ? `, base ${nf(x.base)}` : ""}</li>`).join("")}</ul>
      <b>Marcos</b><ol style="margin:4px 0 8px">${m.marcos.map(([n]) => `<li>${esc(n)}</li>`).join("")}</ol>
      <b>Riscos típicos</b><ul style="margin:4px 0 10px">${m.riscos.map(([d, pr, im]) => `<li>${esc(d)} <span class="muted">(${pr} × ${im})</span></li>`).join("")}</ul>
      <p style="margin:0"><a class="btn pri" href="#proj/novo/${m.id}">Usar este modelo</a>
      ${ex.length ? ` <span class="muted">Exemplos: ${ex.slice(0, 3).map(p => `<a href="#proj/${p.id}">${esc(p.titulo.replace(" (exemplo)", ""))}</a>`).join(" · ")}${ex.length > 3 ? ` e mais ${ex.length - 3}` : ""}</span>` : ""}</p></div>`;
  }).join("")}</div>`;
}

// ---------- tela: estrutura ----------
function telaEstrutura() {
  const tops = O.filter(o => topo(o.id) === o.id);
  const cats = [...new Set(tops.map(o => o.categoria))];
  const linha = (o, vin) => `<tr class="${vin ? "vinc" : ""}"><td>${vin ? "↳ " : ""}<b>${esc(o.sigla)}</b> ${esc(o.nome)}<div class="muted">${esc(o.categoria)}</div></td>
    <td>${esc(o.cargo)}<div>${esc(o.titular)}</div></td><td class="num">${D.indicadores.filter(i => S.atrib[i.id] === o.id).length}</td>
    <td class="num">${S.projetos.filter(p => p.org === o.id).length}</td><td>${o.site ? `<a href="${esc(o.site)}" target="_blank" rel="noopener">site ↗</a>` : ""}</td></tr>`;
  return `<h2>Estrutura do Poder Executivo</h2><p class="lead">${O.length} órgãos, conforme a Estrutura Organizacional do Portal da Transparência (Leis Delegadas nº 122 e 123/2019), capturada em ${fmtD(window.ORGAOS.capturado_em)}. Órgãos vinculados aparecem abaixo da secretaria supervisora.</p>`
    + cats.map(c => `<div class="card"><h3>${esc(c)}</h3><table class="tree"><thead><tr><th>Órgão</th><th>Titular</th><th class="num">Indicadores</th><th class="num">Projetos</th><th></th></tr></thead><tbody>`
      + tops.filter(o => o.categoria === c).map(o => linha(o) + vinculadas(o.id).map(v => linha(v, true)).join("")).join("") + `</tbody></table></div>`).join("")
    + `<p class="aviso">Fonte: <a href="${esc(window.ORGAOS.fonte)}" target="_blank" rel="noopener">${esc(window.ORGAOS.fonte)}</a></p>`;
}

// ---------- roteador (com restrição de escopo) ----------
function render() {
  let [r, id, aba] = (location.hash.slice(1) || "").split("/");
  if (!ehGov()) {  // secretaria só acessa o que é dela
    const pj = r === "proj" && id && id !== "novo" ? S.projetos.find(p => p.id === id) : null;
    const ok = r === "modelos" || (r === "org" && id === meu()) || (r === "proj" && (!id || id === "novo" || (pj && visivel(pj.org))));
    if (!ok) { r = "org"; id = meu(); aba = ""; history.replaceState(null, "", `#org/${meu()}`); }
  } else if (!r) r = "gov";
  menu(r);
  const app = $("#app");
  if (r === "dist") { app.innerHTML = telaDist(); posDist(); }
  else if (r === "org") { if (id && ORG[id]) { app.innerHTML = telaOrg(id, aba); posOrg(id); } else app.innerHTML = telaOrgLista(); }
  else if (r === "proj") {
    const p = S.projetos.find(x => x.id === id);
    if (id === "novo") { app.innerHTML = telaProjForm(null, aba); posProjForm(null); }
    else if (p && aba === "editar" && podeEditar(p.org)) { app.innerHTML = telaProjForm(p); posProjForm(p); }
    else if (p) { app.innerHTML = telaProj(p, aba); posProj(p); }
    else { app.innerHTML = telaProjetos(); posProjetos(); }
  }
  else if (r === "estrutura") app.innerHTML = telaEstrutura();
  else if (r === "modelos") app.innerHTML = telaModelos();
  else { app.innerHTML = telaGov(); posGov(); }
  app.querySelectorAll("tr[data-go]").forEach(tr => tr.onclick = () => location.hash = tr.dataset.go);
  app.insertAdjacentHTML("beforeend", `<p class="aviso noprint" style="margin-top:28px">Protótipo: os dados ficam salvos só neste navegador.
    <button class="btn mini" id="exp">Exportar dados</button> <label class="btn mini">Importar<input type="file" id="imp" accept=".json" hidden></label>
    <button class="btn mini" id="zera">Apagar dados do protótipo</button></p>`);
  $("#exp").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: "application/json" })); a.download = `plataforma_am_${hoje()}.json`; a.click(); };
  $("#imp").onchange = ev => ev.target.files[0].text().then(t => { Object.assign(S, JSON.parse(t)); save(); render(); });
  $("#zera").onclick = () => { if (confirm("Apagar todas as atribuições, valores, projetos, ações, equipes e mensagens deste navegador?")) { localStorage.removeItem(KEY); location.hash = "#gov"; location.reload(); } };
}
window.onhashchange = render;
render();
