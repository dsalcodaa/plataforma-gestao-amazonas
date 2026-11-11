"""Gera orgaos.js a partir da captura da Estrutura Organizacional do Portal da Transparência do AM.

Fonte: https://www.transparencia.am.gov.br/estrutura-organizacional/ (capturada via Playwright;
HTML bruto em fonte/estrutura_organizacional_*.json).
Uso: python gerar_orgaos.py
"""
import html, json, re, sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
FONTE = sorted((AQUI / "fonte").glob("estrutura_organizacional_*.json"))[-1]

# órgãos sem sigla no portal
SIGLA_FIXA = {
    "VICE-GOVERNADOR": "VICE", "GOVERNADOR DO ESTADO": "GOV", "CASA CIVIL": "CASA CIVIL",
    "CASA MILITAR": "CASA MILITAR", "DEFESA CIVIL": "DEFESA CIVIL",
    "CONSÓRCIO INTERESTADUAL": "CONSÓRCIO AML",
}
CARGO = re.compile(r"^(Secret[áa]ri[oa]|Governador|Vice|Diret[oa]r|Presidente|Procurador|Controlador|"
                   r"Comandante|Delegad|Superintendente|Chefe|Coordenador|Reitor)[^:]{0,80}:\s*(.+)$")


def txt(h):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h))).strip()


def main():
    dados = json.loads(FONTE.read_text(encoding="utf-8"))
    dados = json.loads(dados) if isinstance(dados, str) else dados
    orgaos = []
    for cat in dados:
        atual = None
        for p in re.findall(r"<p[^>]*>(.*?)</p>", cat["html"], re.S):
            if re.match(r"\s*<strong>", p):
                cab = txt("".join(re.findall(r"<strong>(.*?)</strong>", p, re.S)))
                resto = txt(re.sub(r"<strong>.*?</strong>", "", p, flags=re.S))
                if cab.lower().startswith("endereço"):  # sub-endereços da SERFI
                    atual = None
                    continue
                atual = {"categoria": cat["categoria"], "cabecalho": cab, "descricao": "", "cargo": "",
                         "titular": "", "site": ""}
                if resto:  # governador/vice: nome na mesma linha
                    atual["cargo"], atual["titular"] = cab.rstrip(": ").title(), resto
                orgaos.append(atual)
                continue
            if atual is None:
                continue
            t = txt(p)
            m = CARGO.match(t)
            if m and not atual["titular"]:
                atual["cargo"], atual["titular"] = t.split(":", 1)[0].strip(), m.group(2).strip()
            elif t.lower().startswith("site"):
                a = re.search(r'href="([^"]+)"', p)
                atual["site"] = a.group(1) if a else t.split(":", 1)[-1].strip()
            elif len(t) > 80 and not atual["descricao"]:
                atual["descricao"] = t

    for o in orgaos:
        cab = o.pop("cabecalho").rstrip(": ")
        m = re.search(r"\((Vinculad[oa] (?:à|ao|a) [^)]*)\)", cab)
        o["vinculo_texto"] = m.group(1) if m else ""
        cab = re.sub(r"\s*\(Vinculad[^)]*\)", "", cab).strip()
        m = re.search(r"\s*[–-]\s*([A-ZÁÉÍÓÚÂÊÔÃÕÇ/]{2,}(?:-AM)?)\s*$", cab) or re.search(r"\s*\(([A-Z]{2,}(?:-[A-Z]+)?)\)\s*$", cab)
        sigla = m.group(1) if m else next((v for k, v in SIGLA_FIXA.items() if k in cab.upper()), cab[:12])
        o["sigla"] = sigla.split("/")[0] if sigla != "FVS/RCP" else "FVS"
        o["nome"] = (cab[:m.start()] if m else cab).strip().title().replace(" Do ", " do ").replace(
            " Da ", " da ").replace(" De ", " de ").replace(" Dos ", " dos ").replace(" Das ", " das ").replace(
            " E ", " e ").replace(" À ", " à ")

    por_sigla = {o["sigla"]: o for o in orgaos}
    for o in orgaos:
        v = o["vinculo_texto"]
        sup = ""
        if v:
            alvo = re.sub(r"Vinculad[oa] (?:à|ao|a) ", "", v).strip()
            alvo_n = alvo.split("/")[0].upper()
            if alvo_n in por_sigla:
                sup = alvo_n
            elif "GABINETE DO GOVERNADOR" in alvo.upper():
                sup = "GOV"
            else:
                sup = next((x["sigla"] for x in orgaos if x["nome"].upper() == alvo.upper()
                            or (len(alvo) > 12 and alvo.upper() in x["nome"].upper())), "")
        o["vinculada_a"] = sup
        import unicodedata
        o["id"] = re.sub(r"[^A-Z0-9]", "", unicodedata.normalize("NFKD", o["sigla"].upper()).encode("ascii", "ignore").decode())
        if o["sigla"] in ("GOV", "VICE"):
            o["cargo"] = "Governador" if o["sigla"] == "GOV" else "Vice-Governador"
    # vínculo usa id
    ids = {o["sigla"]: o["id"] for o in orgaos}
    for o in orgaos:
        o["vinculada_a"] = ids.get(o["vinculada_a"], "")

    import collections; rep = [k for k, n in collections.Counter(o["id"] for o in orgaos).items() if n > 1]
    assert not rep, f"ids repetidos: {rep}"
    assert all(o["titular"] for o in orgaos), [o["sigla"] for o in orgaos if not o["titular"]]
    sem = [o["sigla"] for o in orgaos if o["vinculo_texto"] and not o["vinculada_a"]]
    assert not sem, f"vínculo não resolvido: {sem}"

    (AQUI / "orgaos.js").write_text(
        "window.ORGAOS = " + json.dumps({"fonte": "https://www.transparencia.am.gov.br/estrutura-organizacional/",
                                         "capturado_em": FONTE.stem.split("_")[-1], "orgaos": orgaos},
                                        ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    for o in orgaos:
        print(f'{o["id"]:14} {o["categoria"][:14]:14} vinc={o["vinculada_a"]:10} {o["nome"][:60]} | {o["cargo"]}: {o["titular"]}')
    print(len(orgaos), "órgãos")


if __name__ == "__main__":
    main()
