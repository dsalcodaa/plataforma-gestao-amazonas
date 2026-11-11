"""Gera municipios.js (62 municípios do AM com contorno em SVG) a partir das APIs públicas do IBGE."""
import gzip, json, math, urllib.request
from pathlib import Path

MALHA = "https://servicodados.ibge.gov.br/api/v3/malhas/estados/13?formato=application/vnd.geo%2Bjson&qualidade=minima&intrarregiao=municipio"
NOMES = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/13/municipios"

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "plataforma-prototipo"}), timeout=60) as r:
        b = r.read()
        return json.loads((gzip.decompress(b) if b[:2] == b"\x1f\x8b" else b).decode("utf-8"))

geo, nomes = get(MALHA), {str(m["id"]): m["nome"] for m in get(NOMES)}
anel = lambda g: g["coordinates"] if g["type"] == "Polygon" else [r for p in g["coordinates"] for r in p]
pts = [c for f in geo["features"] for r in anel(f["geometry"]) for c in r]
x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
k = math.cos(math.radians((y0 + y1) / 2))  # equiretangular corrigida pela latitude média
W = 800
esc = W / ((x1 - x0) * k)
H = round((y1 - y0) * esc)
xy = lambda p: (round((p[0] - x0) * k * esc, 1), round((y1 - p[1]) * esc, 1))

mun = []
for f in geo["features"]:
    cod = str(f["properties"]["codarea"])
    d = "".join("M" + "L".join(f"{x},{y}" for x, y in map(xy, r)) + "Z" for r in anel(f["geometry"]))
    mun.append({"cod": cod, "nome": nomes[cod], "d": d})
mun.sort(key=lambda m: m["nome"])
assert len(mun) == 62, len(mun)

out = {"fonte": "IBGE — API de malhas e localidades", "w": W, "h": H, "municipios": mun}
Path(__file__).with_name("municipios.js").write_text("window.MUNICIPIOS = " + json.dumps(out, ensure_ascii=False) + ";\n", encoding="utf-8")
print(len(mun), "municípios", W, "x", H)
