# Sessão — Plano Estratégico de Desenvolvimento do Amazonas (Eixos 01, 02, 03)

Data: 10/11/2026. Arquivo para retomar o trabalho em outra conversa.

## Contexto
Análise dos e-books públicos "Plano Estratégico de Desenvolvimento do Amazonas" (site omargovernador.com.br, coordenação Omar Aziz, PSD, distribuição gratuita, 2026), divididos em Eixo 01, 02 e 03.

## Pedidos feitos e status
1. Baixar os PDFs dos eixos 01, 02 e 03 via Playwright — **concluído**.
2. Ler cada PDF e gerar um MD por livro — **concluído**.
3. Listar todos os indicadores de monitoramento dos 3 eixos por área — **concluído**.
4. Salvar MD da conversa — este arquivo.

## Arquivos (pasta `C:\Users\pedro.paiva\Downloads\Omar_Eixos\`)
| Arquivo | Conteúdo |
|---|---|
| `EBOOK-LIVRO-OMAR-Plano-estrategico-de-desenvolvimento-Eixo01.pdf` | Eixo 01, 633 p., 112 MB |
| `EBOOK-LIVRO-OMAR-Plano-estrategico-de-desenvolvimento-Eixo02.pdf` | Eixo 02, 501 p., 68 MB |
| `EIXO_DE_DESENVOLVIMENTO-OMAR_AZIZ-EIXO3.pdf` | Eixo 03, 609 p., 26 MB |
| `Eixo01_Plano_Estrategico_Desenvolvimento.md` | Resumo do Eixo 01 |
| `Eixo02_Seguranca_Saude_Assistencia_Social.md` | Resumo do Eixo 02 |
| `Eixo03_Educacao_MeioAmbiente_Cultura_e_outros.md` | Resumo do Eixo 03 |
| `Indicadores_Monitoramento_Eixos_01_02_03.md` | Indicadores de monitoramento por eixo e área |
| `Sessao_Continuacao.md` | Este arquivo |

## Áreas por eixo
- **Eixo 01:** Fiscal, Reforma Tributária, ZEE, Regularização Fundiária, Infraestrutura/Logística, Energia, Fruticultura, Aquicultura, Florestais, Indústria, Comércio, Mineração, Turismo, Fitofármacos, Serviços Ambientais, CT&I, IA, Economia Criativa, Atração de Investimentos.
- **Eixo 02:** Segurança Pública, Saúde, Assistência Social.
- **Eixo 03 (páginas do PDF):** Educação 9–147, Meio Ambiente 148–257, Cultura 258–334, FAPEAM 335–367, CETAM 368–396, Habitação 397–465, Governo Digital 466–517, Indigenista 518–568, Outros órgãos 569–573, Final/Anexo 574–598.

## Pendências e ressalvas
- Fruticultura (p. 205) e Aquicultura (p. 225) do Eixo 01: quadros de indicadores em imagem; exigiriam OCR ou leitura manual.
- Fiscal, Reforma Tributária e Indústria: o livro não traz indicadores.
- Saúde (Eixo 02): o livro diverge consigo mesmo. A vacinação tem base de 79% num trecho e 66,6% (DTP3) em outro. A meta de mortalidade materna aparece como <50, <40 e 35.
- Meio Ambiente (Eixo 03): os títulos dos objetivos 1–13 no MD de indicadores são resumos meus; só o objetivo 14 é texto fiel.
- FAPEAM: o original diz "tempo de resposta <50%", interpretado como redução >50%.

## Método técnico (para refazer extrações)
- Texto extraído com PyMuPDF (pymupdf) e pdftotext.
- Hierarquia por tamanho de fonte: capítulo ≥ 27,5 pt; seção ≥ 21,5 pt; subtítulo ≥ 13 pt; texto de tabela < 8,5 pt.
- Os JSONs intermediários ficaram na pasta temporária da sessão anterior e podem ter sido apagados; regenerar a partir dos PDFs se necessário.

## Dashboard (11/11/2026)
Pasta `dashboard\`: `index.html` (abre direto no navegador), `dados.js` (gerado), `indicadores.csv` (gerado, separador `;`), `gerar_dados.py` (lê o MD de indicadores e gera os dois).
- 610 indicadores em 31 áreas (28 com indicadores). Campos: id, eixo, área, grupo, indicador, base, meta, prazo, responsável, valor_atual, data_referencia, fonte_dado, observacao.
- Fruticultura e Aquicultura: confirmado que não há quadro de indicadores (as páginas eram fotos); entraram as entregas do plano de ação.
- Para mudar indicadores: editar o MD e rodar `python gerar_dados.py`. Os IDs dependem da ordem no MD.
- Aba "Fichas dos indicadores": clicar num indicador mostra base/meta/prazo/responsável e até 2 trechos do PDF que o explicam, com link para a página. Os trechos são localizados automaticamente por `gerar_dados.py` (busca pelos termos do indicador no capítulo da área; tabela `CAPITULOS` no script). 4 indicadores ficaram sem trecho (tCO₂e x2, P&D, Editais PPBIO e FAPEAM).
- Saúde corrigida pelo Quadro 15 (p. 367): mortalidade materna 94 → 68 → < 50; desertos críticos 29 → 15 → ≤ 5; IDH-H 2028 = 62.
- Próximo passo: definir como alimentar `valor_atual` (planilha, Supabase ou coletores de fontes oficiais).

## Plataforma de monitoramento — versão inicial (11/11/2026)
`dashboard\plataforma.html` (abre direto no navegador). Usa `dados.js` (indicadores) e `orgaos.js` (estrutura do Executivo).
- Estrutura: capturada via Playwright de https://www.transparencia.am.gov.br/estrutura-organizacional/ (atualizada no portal em 31/10/2026). HTML bruto em `dashboard\fonte\`; `gerar_orgaos.py` gera `orgaos.js` (76 órgãos, titular, categoria, vínculo).
- Telas: Sala do Governador (consolidado por secretaria, pontos de atenção, determinações, feed); Distribuição de indicadores (sugestão automática + atribuição individual/lote); Secretarias (indicadores com valor/data/fonte/situação/responsável, ações, equipe, conversa com o governador); Estrutura do Executivo.
- Órgão vinculado (ex.: IDAM) sobe para a secretaria supervisora (SEPROR).
- Perfis simulados no seletor "Atuando como" (Governador, titular, membro de equipe) — sem login real.
- Dados salvos só no navegador (localStorage), com exportar/importar JSON. Para uso multiusuário real: backend (Supabase) + login.
- Sugestões de órgão por área são minhas (tabela `SUG_AREA` em `plataforma.js`) — precisam ser validadas.

### Versão 2 (11/11/2026) — escopo por perfil + projetos
- Código em `plataforma.js` (HTML só tem CSS e estrutura).
- Perfil de secretaria (titular ou membro) vê só a própria secretaria e os vinculados: menu reduzido a "Minha secretaria" e "Projetos"; rotas de outras secretarias/Sala do Governador redirecionam.
- Módulo **Projetos**: cadastro (nome, executor, tipo, situação, descrição, municípios, início/prazo, gerente, responsáveis, orçamento previsto/empenhado/pago, fonte, indicadores do plano relacionados); dashboard por projeto com execução física (média do progresso das métricas, ou marcos), execução financeira (pago/previsto), métricas próprias com meta, base e medições datadas + gráfico, orçamento em barras, marcos com prazo, comentários (secretaria ↔ governador) e histórico.
- Alertas de projeto: prazo final vencido, paralisado, marco atrasado, financeiro >25 pontos à frente do físico.
- Sala do Governador consolida projetos por secretaria (ativos, com alerta, orçamento).
- Botão "Carregar 2 projetos de exemplo" (20 casas/SUHAB e 20 leitos de UTI/SES), marcados "(exemplo)".

### Versão 3 (11/11/2026) — mapa, riscos, anexos, histórico do orçamento, relatório
- **Mapa por município**: `municipios.js` (62 municípios do AM, contorno em SVG) gerado por `gerar_municipios.py` a partir das APIs públicas do IBGE. Na tela Projetos: mapa colorido pelo número de projetos, tabela por município (projetos, orçamento, com alerta) e clique para filtrar. O campo Município(s) do projeto sugere os nomes do IBGE e recusa nomes não reconhecidos (aceita sem acento/minúscula).
- **Histórico do orçamento**: cada atualização (no dashboard, com data, ou na edição do projeto) grava um registro em `orcHist`; tabela no card Orçamento.
- **Riscos**: probabilidade × impacto, mitigação, responsável, situação (Aberto/Em tratamento/Encerrado). Risco Alta × Alto aberto gera alerta no projeto e na Sala do Governador.
- **Anexos**: aba no projeto; arquivo até 1 MB (foto aparece em miniatura) ou link (SEI, Drive). Arquivos ficam no localStorage (limite ~5 MB no total; o sistema avisa se faltar espaço).
- **Relatório (PDF)**: botão no projeto e na Sala do Governador; abre a impressão do navegador (escolher "Salvar como PDF"), sem menus nem formulários.

### Versão 4 (11/11/2026) — modelos de projeto e carteira simulada
- `dashboard\exemplos.js`: 13 **modelos** (obra de edificação, obra linear, reforma, aquisição, serviço continuado, programa social, capacitação, sistema/TI, programa estruturante com financiamento externo, campanha/mutirão, regularização/licenciamento, evento, operação integrada). Cada um tem métricas, marcos e riscos típicos.
- **Carteira de exemplo**: 67 projetos fictícios em 47 órgãos, gerados de forma determinística com datas relativas ao dia da carga. Perfis: no rumo, atrasado, paralisado, concluído, planejamento, financeiro adiantado e prazo vencido. Incluem medições mensais (curva S), histórico do orçamento, marcos, riscos e comentários governador ↔ secretaria nos projetos com problema. Alguns estão ligados a indicadores do plano.
- Projetos → "Carregar carteira de exemplo" / "Remover projetos de exemplo" (remove também os 2 exemplos da v2).
- Nova tela **Modelos de projeto**; "+ Novo projeto" permite escolher o modelo, a unidade e a meta, e cria o projeto já com métricas, marcos (prazos proporcionais entre início e fim) e riscos.
- Tela Projetos ganhou "Carteira por tipo de projeto". Novos tipos: Capacitação, Programa estruturante, Campanha/mutirão, Evento, Operação.

## Possíveis próximos passos
- OCR dos quadros de Fruticultura e Aquicultura.
- Converter os indicadores em planilha (xlsx) ou painel.
- Cruzar metas entre eixos (ex.: conectividade, telessaúde, desmatamento aparecem em mais de um eixo).
