# Plataforma de Gestão Governamental — Amazonas (protótipo)

Protótipo de monitoramento dos indicadores do *Plano Estratégico de Desenvolvimento do Amazonas* (e-books Eixos 01–03) e de projetos das secretarias de estado.

## Como abrir
Abra `dashboard/plataforma.html` no navegador (não precisa de servidor). O catálogo dos indicadores está em `dashboard/index.html`.

## O que tem
- **Catálogo do plano**: 610 indicadores em 31 áreas, com fichas e trechos dos PDFs.
- **Sala do Governador**: consolidado por secretaria, pontos de atenção, determinações.
- **Secretarias**: indicadores, projetos, ações, equipe e conversa com o governador; cada perfil vê só o próprio escopo.
- **Projetos**: métricas próprias com medições, orçamento e histórico, marcos, riscos, anexos, mapa por município, relatório em PDF.
- **Modelos de projeto** (13) e **carteira de exemplo** com 67 projetos simulados.

## Dados
- Indicadores: `Indicadores_Monitoramento_Eixos_01_02_03.md` → `python gerar_dados.py` gera `dados.js` e `indicadores.csv`.
- Estrutura do Executivo: Portal da Transparência AM → `gerar_orgaos.py` gera `orgaos.js`.
- Municípios: APIs públicas do IBGE → `gerar_municipios.py` gera `municipios.js`.
- Os PDFs não estão no repositório (tamanho); os links "ver no PDF" esperam os arquivos na pasta raiz.

## Limitações
Protótipo: dados salvos só no navegador (localStorage), perfis simulados sem login. Projetos de exemplo são fictícios e marcados "(exemplo)".
