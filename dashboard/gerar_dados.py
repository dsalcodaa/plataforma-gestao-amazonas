"""Gera dados.js e indicadores.csv a partir de Indicadores_Monitoramento_Eixos_01_02_03.md.

Uso: python gerar_dados.py
"""
import csv, json, re, sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
MD = AQUI.parent / "Indicadores_Monitoramento_Eixos_01_02_03.md"

PRAZO = r"((?:[12]º sem|1º Semestre|2º Semestre)/\d{4}|\d{2}/\d{2}/\d{4}|\d{4})"


def limpa(s):
    return re.sub(r"\*\*", "", s).strip().rstrip(".").strip()


def dois_pontos(txt):
    """Posição do primeiro ': ' fora de parênteses, ou -1."""
    nivel = 0
    for i, c in enumerate(txt):
        nivel += (c == "(") - (c == ")")
        if nivel == 0 and txt.startswith(": ", i):
            return i
    return -1


def parse_item(txt):
    """Separa nome, base, meta, prazo e responsável de um item de texto."""
    d = {"indicador": "", "base": "", "meta": "", "prazo": "", "responsavel": ""}
    txt = limpa(txt)
    if " — " in txt:  # "Nome: prazo — responsáveis"
        txt, d["responsavel"] = [p.strip() for p in txt.split(" — ", 1)]
    m = re.search(r"\(meta:?\s*([^)]*)\)", txt)
    if m:
        d["meta"] = m.group(1).strip()
        txt = (txt[:m.start()] + txt[m.end():]).strip()
    m = re.search(r"\((\d{2}/\d{2}/\d{4})\)", txt)
    if m:
        d["prazo"] = m.group(1)
        txt = (txt[:m.start()] + txt[m.end():]).strip()
    m = re.search(r"\(base:?\s*([^)]*)\)", txt)
    if m:
        d["base"] = m.group(1).strip()
        txt = (txt[:m.start()] + txt[m.end():]).strip()
    pos = dois_pontos(txt)
    if pos >= 0:
        nome, valor = txt[:pos], txt[pos + 2:]
        if not re.search(r"[\d%<>≤≥+−]", valor):  # sub-métrica descritiva, não é meta
            nome, valor = f"{nome} — {valor}", ""
        if not valor:
            pass
        elif "→" in valor:
            b, mt = valor.split("→", 1)
            d["base"], d["meta"] = b.strip(), mt.strip()
        elif re.fullmatch(PRAZO, valor.strip()):
            d["prazo"] = valor.strip()
        else:
            d["meta"] = valor.strip()
        txt = nome
    # "meta X até Y" dentro da meta
    m = re.match(r"meta:?\s*(.+?)\s+(?:até|a partir de)\s+(.+)", d["meta"])
    if m:
        d["meta"] = m.group(1)
        d["prazo"] = d["prazo"] or m.group(2)
    elif d["meta"].startswith("meta "):
        d["meta"] = d["meta"][5:]
    m = re.match(r"(.+?)\s+até\s+(?:o\s+)?(" + PRAZO[1:-1] + r"|Ano \d+)$", d["meta"])
    if m and ";" not in d["meta"] and not d["prazo"]:
        d["meta"], d["prazo"] = m.group(1), m.group(2)
    d["indicador"] = txt.strip()
    return d


def divide(txt):
    return [p for p in (x.strip() for x in limpa(txt).split(";")) if p]


PDFS = {
    "E1": "EBOOK-LIVRO-OMAR-Plano-estrategico-de-desenvolvimento-Eixo01.pdf",
    "E2": "EBOOK-LIVRO-OMAR-Plano-estrategico-de-desenvolvimento-Eixo02.pdf",
    "E3": "EIXO_DE_DESENVOLVIMENTO-OMAR_AZIZ-EIXO3.pdf",
}
# páginas do PDF que formam o capítulo de cada área
CAPITULOS = {
    "Política Fiscal": (9, 41), "Reforma Tributária": (42, 63),
    "Zoneamento Ecológico-Econômico — ZEE": (64, 82), "Regularização Fundiária": (83, 114),
    "Infraestrutura e Logística": (115, 147), "Energia": (148, 164), "Fruticultura": (165, 209),
    "Aquicultura": (210, 232), "Produtos Florestais": (233, 290), "Indústria": (291, 339),
    "Comércio": (340, 357), "Mineração": (358, 376), "Turismo": (377, 399),
    "Fitofármacos e Bioativos": (400, 440), "Serviços Ambientais": (441, 469),
    "Ciência, Tecnologia e Inovação": (470, 516), "Inteligência Artificial": (517, 543),
    "Economia Criativa": (544, 581), "Atração de Investimentos": (582, 633),
    "Segurança Pública": (9, 271), "Saúde": (272, 411), "Assistência Social": (412, 501),
    "Educação": (9, 147), "Meio Ambiente": (148, 257), "Cultura": (258, 334), "FAPEAM": (335, 367),
    "CETAM": (368, 396), "Habitação": (397, 465), "Governo Digital": (466, 517),
    "Política Indigenista": (518, 568), "Outros órgãos": (569, 573),
}
STOP = set("para pelo pela pelos pelas como entre sobre numero total taxa indice anual com sem dos das "
           "nos nas que uma por de da do em e o a os as no na meta ano mes dia via sua seu".split())
MONIT = re.compile(r"metricas a monitorar|como medir|metodo de coleta|indicadores de (monitoramento|desempenho|resultado)|plano de monitoramento|monitoramento e avaliacao|kpi|linha de base")


def nz(s):
    import unicodedata
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()


def raizes(s):
    return [w[:6] for w in re.findall(r"[a-z0-9]+", nz(s))]


def termos(s):
    return list(dict.fromkeys(w for w in raizes(s) if (len(w) >= 3 or w.isdigit()) and w not in STOP))


def janela(txt, tk, tam=480):
    """Recorta ~tam caracteres de txt em torno da maior concentração de termos."""
    if len(txt) <= tam:
        return txt
    n = nz(txt)
    pos = [m.start() for t in tk for m in re.finditer(r"\b" + re.escape(t), n)] or [0]
    ini = max(range(len(pos)), key=lambda i: sum(pos[i] <= p < pos[i] + tam * 0.7 for p in pos))
    a = max(0, min(pos[ini] - 80, len(txt) - tam))
    a = txt.rfind(" ", 0, a) + 1 if a else 0
    b = txt.find(" ", a + tam)
    b = len(txt) if b < 0 else b
    return ("… " if a else "") + txt[a:b].strip() + (" …" if b < len(txt) else "")


def localizar(eixos, areas, inds):
    """Acha nos PDFs os trechos que explicam cada indicador (até 2, em páginas diferentes)."""
    import pymupdf
    frases = {}
    for e in eixos:
        doc = pymupdf.open(AQUI.parent / PDFS[e["id"]])
        for a in (x for x in areas if x["eixo"] == e["id"]):
            ini, fim = CAPITULOS[a["nome"]]
            lst = []
            for p in range(ini, min(fim, len(doc)) + 1):
                t = re.sub(r"-\s*\n\s*", "", doc[p - 1].get_text())
                t = re.sub(r"\s+", " ", t)
                t = re.sub(r"^\s*\d+\s+Parte 0\d\.[^A-Z]*?desenvolvimento\s*", "", t, flags=re.I)
                t = re.sub(r"^\s*\d*\s*Plano Estratégico de Desenvolvimento\s*", "", t, flags=re.I)
                mon = bool(MONIT.search(nz(t)))
                sents = re.split(r"(?<=[.;!?•])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9•])", t)
                for i, s in enumerate(sents):
                    if len(s) < 25:
                        continue
                    ctx = " ".join(sents[max(0, i - 1):i + 2]) if len(s) < 160 else s
                    lst.append((p, s, ctx, nz(s), set(raizes(s)), mon))
            frases[a["id"]] = lst
    ancora = {a["id"]: [int(x) for x in re.findall(r"\d+", a["paginas"])[:2]] for a in areas}
    for ind in inds:
        anc = ancora[ind["area_id"]]
        perto = (lambda p: anc[0] - 3 <= p <= anc[-1] + 8) if anc else (lambda p: False)
        tk = termos(ind["indicador"])
        tg = termos(ind["grupo"])
        frase = nz(re.sub(r"\(.*?\)", "", ind["indicador"])).strip()
        res = []
        for p, s, ctx, sn, ws, mon in frases[ind["area_id"]]:
            m = sum(t in ws for t in tk)
            if not m:
                continue
            sc = m / len(tk) + 0.4 * (len(frase) > 6 and frase in sn) + 0.15 * (
                sum(t in ws for t in tg) / len(tg) if tg else 0) + 0.2 * mon + 0.3 * perto(p) - 0.1 * (len(s) > 900)
            res.append((sc, p, ctx, mon or perto(p)))
        res.sort(key=lambda r: -r[0])
        res = [r for r in res if r[0] >= 0.6]
        # 1º: trecho do quadro/seção de monitoramento; 2º: contexto no texto do plano (outra página)
        escolha = [r for r in res if r[3]][:1]
        escolha += [r for r in res if not r[3] and all(r[1] != e[1] for e in escolha)][:2 - len(escolha)]
        ind["fontes"] = [{"pagina": p, "trecho": janela(ctx, tk), "monitoramento": mon,
                          "exato": sc >= 1.3} for sc, p, ctx, mon in escolha]


def main():
    linhas = MD.read_text(encoding="utf-8").splitlines()
    eixos, areas, inds = [], [], []
    eixo = area = None
    grupo = ""
    tabela = None

    def add(item_txt, g=None, extra=None):
        d = parse_item(item_txt) if extra is None else extra
        if not d["indicador"]:
            return
        n = sum(1 for i in inds if i["area_id"] == area["id"]) + 1
        d.update(id=f"{area['id']}-{n:03d}", eixo=eixo["id"], area_id=area["id"],
                 area=area["nome"], grupo=g if g is not None else grupo,
                 valor_atual="", data_referencia="", fonte_dado="", observacao="")
        inds.append(d)

    for ln in linhas:
        s = ln.strip()
        if s.startswith("## "):
            m = re.match(r"## EIXO (\d+) — (.+)", s)
            eixo = None
            if m:
                eixo = {"id": f"E{int(m.group(1))}", "nome": f"Eixo {m.group(1)}", "titulo": m.group(2)}
                eixos.append(eixo)
            area = None
            continue
        if eixo is None:
            continue
        if s.startswith("### "):
            m = re.match(r"### \d+\.\s*(.+?)(?:\s*\(([^)]*p\. [^)]*)\))?$", s)
            nome, pag = m.group(1).strip(), (m.group(2) or "")
            area = {"id": f"{eixo['id']}-A{len(areas) + 1:02d}", "eixo": eixo["id"],
                    "nome": nome, "paginas": pag, "notas": []}
            areas.append(area)
            grupo, tabela = "", None
            continue
        if area is None or not s or s == "---":
            continue
        if s.startswith("|"):
            cels = [c.strip() for c in s.strip("|").split("|")]
            if set("".join(cels)) <= set("-: "):
                continue
            if tabela is None:
                tabela = cels
                continue
            d = {"indicador": limpa(cels[0]), "base": "", "meta": "", "prazo": "", "responsavel": ""}
            metas = []
            for h, v in zip(tabela[1:], cels[1:]):
                if v in ("—", ""):
                    continue
                if h.lower().startswith("base"):
                    d["base"] = v
                else:
                    metas.append(f"{h.replace('Meta ', '')}: {v}")
            d["meta"] = " · ".join(metas)
            add(None, extra=d)
            continue
        tabela = None
        if s.startswith(">"):
            area["notas"].append(limpa(s.lstrip("> ")))
            continue
        m = re.match(r"(?:-|\d+\.)\s+\*\*(.+?)\*\*:?\s*(.*)$", s)  # "- **A1** itens" / "1. **Tema:** itens"
        if m:
            g = m.group(1).rstrip(":")
            for it in divide(m.group(2)):
                add(it, g)
            continue
        m = re.match(r"\*\*(.+?)\*\*\s*(.*)$", s)  # "**Grupo (freq):** itens" ou "**Grupo**"
        if m:
            grupo = m.group(1).rstrip(":")
            for it in divide(m.group(2)):
                add(it)
            continue
        if s.startswith("- "):
            corpo = s[2:]
            itens = divide(corpo) if ":" not in corpo else [corpo]
            for it in itens:
                add(it)
            continue
        m = re.match(r"(Indicadores [^:]*):\s*(.+;.+)$", s)  # "Indicadores para N ações: a; b; c"
        if m:
            for it in divide(m.group(2)):
                add(it, m.group(1))
            continue
        if s.endswith(":") and len(s) < 60:
            grupo = s.rstrip(":")
            continue
        area["notas"].append(limpa(s))

    # autoverificação mínima
    assert len(eixos) == 3, eixos
    assert all(i["indicador"] for i in inds)
    assert len({i["id"] for i in inds}) == len(inds)
    assert all(a["nome"] in CAPITULOS for a in areas), [a["nome"] for a in areas if a["nome"] not in CAPITULOS]

    for e in eixos:
        e["pdf"] = PDFS[e["id"]]
    for a in areas:
        a["capitulo"] = list(CAPITULOS[a["nome"]])
    localizar(eixos, areas, inds)

    (AQUI / "dados.js").write_text(
        "window.DADOS = " + json.dumps({"eixos": eixos, "areas": areas, "indicadores": inds},
                                      ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    campos = ["id", "eixo", "area", "grupo", "indicador", "base", "meta", "prazo", "responsavel",
              "valor_atual", "data_referencia", "fonte_dado", "observacao"]
    with open(AQUI / "indicadores.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=campos, delimiter=";", extrasaction="ignore")
        w.writeheader()
        w.writerows(inds)

    sys.stdout.reconfigure(encoding="utf-8")
    for e in eixos:
        print(e["nome"], sum(i["eixo"] == e["id"] for i in inds))
    for a in areas:
        print(f"  {a['id']} {a['nome']}: {sum(i['area_id'] == a['id'] for i in inds)}")
    print("total", len(inds))


if __name__ == "__main__":
    main()
