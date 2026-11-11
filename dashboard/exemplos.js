// Modelos de projeto e carteira de exemplos SIMULADOS (dados fictícios, títulos marcados "(exemplo)").
// Métricas: "{u}" é trocado pela unidade do projeto. Marcos: [nome, fração do avanço físico em que ocorre].
// Riscos: [descrição, probabilidade, impacto, mitigação].
window.MODELOS = [
  { id: "obra-edif", nome: "Obra — construção de edificações", tipo: "Obra", u: "unidades",
    desc: "Escolas, UBS, hospitais, casas, delegacias, bases, centros de referência.",
    gerente: "Gerência de obras — {S}", equipe: "Fiscal do contrato, Engenheiro residente, Comissão de recebimento",
    metricas: [{ nome: "Quantidade entregue ({u})", unidade: "{u}", base: 0, meta: 10 }, { nome: "Avanço físico (boletim de medição)", unidade: "%", base: 0, meta: 100 }],
    marcos: [["Projeto executivo aprovado", 0], ["Licitação homologada", 0.04], ["Ordem de serviço", 0.06], ["Fundações concluídas", 0.25], ["Estrutura concluída", 0.55], ["Instalações e acabamento", 0.85], ["Entrega e inauguração", 1]],
    riscos: [["Cheia/vazante dos rios atrasar a chegada de material", "Média", "Alto", "Antecipar compras e estocar material no canteiro"],
      ["Aditivo de valor por revisão de projeto", "Média", "Médio", "Revisão do projeto executivo antes da OS"],
      ["Pendência de titularidade do terreno", "Baixa", "Alto", "Certidão de matrícula e cessão antes da licitação"]] },
  { id: "obra-linear", nome: "Obra linear — rodovia, ramal, rede de água/energia", tipo: "Obra", u: "km",
    desc: "Pavimentação, recuperação de ramais, redes de abastecimento, eletrificação.",
    gerente: "Gerência de obras viárias — {S}", equipe: "Fiscal do contrato, Supervisora técnica, Topografia",
    metricas: [{ nome: "Quantidade executada ({u})", unidade: "{u}", base: 0, meta: 50 }, { nome: "Avanço físico (boletim de medição)", unidade: "%", base: 0, meta: 100 }],
    marcos: [["Licença de instalação (LI)", 0], ["Licitação homologada", 0.03], ["Ordem de serviço", 0.05], ["Terraplenagem/escavação concluída", 0.4], ["Pavimento/rede concluída", 0.85], ["Sinalização e ligações", 0.95], ["Entrega", 1]],
    riscos: [["Período chuvoso paralisar frentes de serviço", "Alta", "Médio", "Concentrar terraplenagem no verão amazônico"],
      ["Atraso na licença ambiental", "Média", "Alto", "Protocolo antecipado no IPAAM e estudo ambiental pronto"],
      ["Interferência com comunidades e posse da faixa de domínio", "Baixa", "Médio", "Cadastro socioeconômico e reuniões com moradores"]] },
  { id: "reforma", nome: "Reforma / requalificação", tipo: "Reforma", u: "unidades",
    desc: "Leitos, escolas, prédios históricos, pontes, unidades em funcionamento.",
    gerente: "Coordenação de manutenção — {S}", equipe: "Fiscal do contrato, Direção da unidade",
    metricas: [{ nome: "Quantidade reformada e entregue ({u})", unidade: "{u}", base: 0, meta: 10 }, { nome: "Avanço físico (boletim de medição)", unidade: "%", base: 0, meta: 100 }],
    marcos: [["Diagnóstico e levantamento", 0], ["Projeto e orçamento", 0.05], ["Contratação", 0.1], ["Metade das unidades entregues", 0.5], ["Entrega final", 1]],
    riscos: [["Unidade precisar seguir funcionando durante a obra", "Alta", "Médio", "Execução por etapas e remanejamento temporário"],
      ["Vícios ocultos na estrutura", "Média", "Médio", "Reserva técnica de 10% e sondagens prévias"]] },
  { id: "aquisicao", nome: "Aquisição de bens e equipamentos", tipo: "Aquisição", u: "itens",
    desc: "Viaturas, ambulâncias, embarcações, notebooks, equipamentos médicos, kits.",
    gerente: "Departamento de compras — {S}", equipe: "Comissão de recebimento, Almoxarifado, Logística",
    metricas: [{ nome: "Quantidade recebida ({u})", unidade: "{u}", base: 0, meta: 100 }, { nome: "Quantidade distribuída / em operação ({u})", unidade: "{u}", base: 0, meta: 100 }],
    marcos: [["Termo de referência", 0], ["Pesquisa de preços", 0.02], ["Licitação ou adesão a ata", 0.05], ["Contrato assinado", 0.08], ["Entrega da 1ª parcela", 0.4], ["Entrega final", 0.85], ["Distribuição concluída", 1]],
    riscos: [["Licitação deserta ou fracassada", "Média", "Alto", "Pesquisa de mercado ampla e lotes regionais"],
      ["Atraso do fornecedor", "Média", "Médio", "Multa contratual e entregas parceladas"],
      ["Logística de distribuição até o interior", "Alta", "Médio", "Calendário fluvial e frete contratado"]] },
  { id: "servico", nome: "Serviço continuado", tipo: "Serviço", u: "atendimentos",
    desc: "Transporte escolar, telessaúde, ATER, emissão de documentos, manutenção.",
    gerente: "Gestão de contratos — {S}", equipe: "Fiscal do contrato, Gestor do serviço",
    metricas: [{ nome: "Atendimentos realizados — acumulado ({u})", unidade: "{u}", base: 0, meta: 10000 }, { nome: "Cumprimento do nível de serviço (SLA)", unidade: "%", base: 0, meta: 95 }],
    marcos: [["Termo de referência", 0], ["Contrato assinado", 0.03], ["Início da operação", 0.06], ["1ª avaliação de desempenho", 0.3], ["Avaliação semestral", 0.6], ["Renovação ou encerramento", 1]],
    riscos: [["Pedido de reequilíbrio econômico", "Média", "Médio", "Cláusula de reajuste por índice e planilha aberta"],
      ["Fiscalização insuficiente no interior", "Alta", "Médio", "Fiscais regionais e comprovação por foto/GPS"]] },
  { id: "social", nome: "Programa social / transferência", tipo: "Programa social", u: "famílias",
    desc: "Transferência de renda, cestas, segurança alimentar, microcrédito, compras da agricultura familiar.",
    gerente: "Coordenação do programa — {S}", equipe: "Assistentes sociais, Equipe de cadastro, Ouvidoria",
    metricas: [{ nome: "Beneficiários atendidos ({u})", unidade: "{u}", base: 0, meta: 10000 }, { nome: "Municípios com o programa ativo", unidade: "municípios", base: 0, meta: 62 }, { nome: "Cadastros validados", unidade: "%", base: 0, meta: 100 }],
    marcos: [["Lei/decreto do programa", 0], ["Regulamentação e critérios", 0.03], ["Cadastramento", 0.15], ["1º pagamento/entrega", 0.2], ["Avaliação semestral", 0.55], ["Avaliação de impacto", 1]],
    riscos: [["Cadastros desatualizados ou duplicados", "Alta", "Médio", "Cruzamento com CadÚnico e bases estaduais"],
      ["Acesso a comunidades isoladas", "Alta", "Médio", "Busca ativa com barco e parceria com prefeituras"],
      ["Descontinuidade orçamentária", "Média", "Alto", "Fonte vinculada e previsão na LOA"]] },
  { id: "capacitacao", nome: "Capacitação / formação", tipo: "Capacitação", u: "pessoas",
    desc: "Cursos técnicos, formação de professores, bolsas, escola de governo, ressocialização.",
    gerente: "Coordenação pedagógica — {S}", equipe: "Coordenação de turmas, Secretaria acadêmica",
    metricas: [{ nome: "Concluintes ({u})", unidade: "{u}", base: 0, meta: 1000 }, { nome: "Turmas concluídas", unidade: "turmas", base: 0, meta: 40 }, { nome: "Taxa de conclusão", unidade: "%", base: 0, meta: 85 }],
    marcos: [["Plano pedagógico", 0], ["Edital de inscrição", 0.03], ["Início das turmas", 0.08], ["Metade das turmas concluídas", 0.5], ["Certificação final", 1]],
    riscos: [["Evasão acima do previsto", "Média", "Médio", "Bolsa-auxílio e acompanhamento de frequência"],
      ["Conectividade insuficiente para aulas remotas", "Alta", "Médio", "Material offline e polos com satélite"]] },
  { id: "sistema", nome: "Sistema / transformação digital", tipo: "Sistema/Tecnologia", u: "usuários",
    desc: "Serviços digitais, integrações, painéis, conectividade.",
    gerente: "Escritório de projetos de TI — {S}", equipe: "Product owner, Equipe PRODAM, Segurança da informação",
    metricas: [{ nome: "Módulos/serviços entregues", unidade: "entregas", base: 0, meta: 10 }, { nome: "Usuários ativos ({u})", unidade: "{u}", base: 0, meta: 10000 }],
    marcos: [["Levantamento de requisitos", 0], ["Contratação/alocação da equipe", 0.05], ["MVP em produção", 0.3], ["Integrações concluídas", 0.7], ["Implantação total e treinamento", 1]],
    riscos: [["Integração com sistemas legados", "Média", "Alto", "API intermediária e testes com dados reais"],
      ["Baixa adesão dos usuários", "Média", "Médio", "Treinamento, suporte e comunicação"],
      ["Vazamento de dados pessoais (LGPD)", "Baixa", "Alto", "Avaliação de impacto e controle de acesso"]] },
  { id: "programa", nome: "Programa estruturante (multicomponente, financiamento externo)", tipo: "Programa estruturante", u: "beneficiários",
    desc: "Programas com BID, Banco Mundial, BNDES: vários componentes, UGP própria, salvaguardas.",
    gerente: "Unidade gestora do programa (UGP) — {S}", equipe: "Coord. técnica, Coord. financeira, Salvaguardas socioambientais, Aquisições",
    metricas: [{ nome: "Componentes concluídos", unidade: "componentes", base: 0, meta: 4 }, { nome: "Avanço físico ponderado", unidade: "%", base: 0, meta: 100 },
      { nome: "Desembolso do financiador", unidade: "%", base: 0, meta: 100 }, { nome: "Beneficiários ({u})", unidade: "{u}", base: 0, meta: 10000 }],
    marcos: [["Carta-consulta aprovada (COFIEX)", 0], ["Contrato de empréstimo assinado", 0.02], ["Condições prévias cumpridas", 0.06], ["Licitação do lote 1", 0.12], ["Obras do lote 1 concluídas", 0.4], ["Avaliação de meio-termo", 0.5], ["Lote 2 concluído", 0.8], ["Encerramento e avaliação final", 1]],
    riscos: [["Variação cambial e contrapartida insuficiente", "Média", "Alto", "Hedge natural e contrapartida na LOA"],
      ["Capacidade da UGP para aquisições", "Média", "Alto", "Reforço de equipe e consultoria de aquisições"],
      ["Salvaguardas socioambientais (reassentamento)", "Média", "Médio", "Plano de reassentamento aprovado pelo financiador"],
      ["Prazo de desembolso do financiador", "Média", "Alto", "Prorrogação negociada com antecedência"]] },
  { id: "campanha", nome: "Campanha / mutirão", tipo: "Campanha/mutirão", u: "atendimentos",
    desc: "Vacinação, mutirões de cirurgia, vistorias, ações itinerantes.",
    gerente: "Coordenação da campanha — {S}", equipe: "Equipes volantes, Logística, Vigilância",
    metricas: [{ nome: "Realizado ({u})", unidade: "{u}", base: 0, meta: 10000 }, { nome: "Cobertura da população-alvo", unidade: "%", base: 60, meta: 95 }],
    marcos: [["Plano operacional", 0], ["Insumos e logística", 0.05], ["Início da campanha", 0.1], ["Balanço intermediário", 0.5], ["Encerramento", 1]],
    riscos: [["Falta de insumos", "Média", "Alto", "Estoque de segurança e remanejamento entre polos"],
      ["Baixa adesão da população", "Média", "Médio", "Agentes comunitários e rádio local"]] },
  { id: "regularizacao", nome: "Regularização / licenciamento / passivo", tipo: "Serviço", u: "processos",
    desc: "Títulos fundiários, licenças ambientais, dívida ativa, passivos de processos.",
    gerente: "Força-tarefa — {S}", equipe: "Analistas, Procuradoria, Atendimento",
    metricas: [{ nome: "Processos analisados", unidade: "processos", base: 0, meta: 5000 }, { nome: "Títulos/licenças/acordos emitidos", unidade: "documentos", base: 0, meta: 3000 }],
    marcos: [["Força-tarefa instituída", 0], ["Fluxo e sistema ajustados", 0.05], ["1º mutirão", 0.15], ["Metade do passivo", 0.5], ["Passivo zerado", 1]],
    riscos: [["Documentação incompleta dos requerentes", "Alta", "Médio", "Atendimento itinerante e checklist"],
      ["Conflitos de posse", "Média", "Alto", "Mediação com Defensoria e Ministério Público"]] },
  { id: "evento", nome: "Evento / circuito cultural e turístico", tipo: "Evento", u: "pessoas",
    desc: "Festivais, circuitos culturais, jogos, feiras.",
    gerente: "Produção executiva — {S}", equipe: "Produção, Comunicação, Prestação de contas",
    metricas: [{ nome: "Eventos realizados", unidade: "eventos", base: 0, meta: 20 }, { nome: "Público estimado ({u})", unidade: "{u}", base: 0, meta: 50000 }],
    marcos: [["Programação definida", 0], ["Contratação de estrutura e artistas", 0.1], ["Divulgação", 0.2], ["Metade dos eventos realizados", 0.5], ["Prestação de contas", 1]],
    riscos: [["Patrocínio abaixo do previsto", "Média", "Médio", "Cotas escalonadas e lei de incentivo"],
      ["Chuva e logística de palco", "Média", "Médio", "Estrutura coberta e plano B"]] },
  { id: "operacao", nome: "Operação / ação integrada de fiscalização", tipo: "Operação", u: "operações",
    desc: "Segurança pública, combate a queimadas, fiscalização integrada.",
    gerente: "Comando da operação — {S}", equipe: "Inteligência, Equipes de campo, Comunicação",
    metricas: [{ nome: "Operações realizadas", unidade: "{u}", base: 0, meta: 100 }, { nome: "Ocorrências por mês na área-alvo", unidade: "ocorrências", base: 40, meta: 28 }],
    marcos: [["Diagnóstico e área-alvo", 0], ["Plano operacional integrado", 0.05], ["Início das operações", 0.1], ["Avaliação trimestral", 0.35], ["Avaliação semestral", 0.6], ["Relatório final", 1]],
    riscos: [["Efetivo insuficiente", "Média", "Alto", "Diárias operacionais e escala integrada"],
      ["Deslocamento do problema para áreas vizinhas", "Média", "Médio", "Monitoramento do entorno"]] },
];

// [órgão, modelo, título, municípios, orçamento (R$ mi), duração (meses), início (meses atrás; negativo = futuro),
//  perfil, fonte, unidade, metas por métrica (número = meta; [base, meta]), extras {nm: nomes, kw: termo do indicador do plano}]
// Perfis: R no rumo · A atrasado · P paralisado · C concluído · L planejamento · F financeiro adiantado · V prazo vencido
window.EXEMPLOS = [
  ["SEINFRA", "obra-linear", "Pavimentação da AM-010 — trecho Manaus–Rio Preto da Eva", "Manaus, Rio Preto da Eva", 180, 24, 14, "R", "BNDES + contrapartida", "km", [62]],
  ["SEINFRA", "obra-linear", "Recuperação de ramais rurais", "Careiro, Careiro da Várzea, Autazes", 45, 18, 16, "A", "Tesouro estadual", "km", [120]],
  ["SEINFRA", "reforma", "Recuperação de 8 pontes na AM-070", "Manacapuru, Iranduba", 12, 10, 13, "V", "Tesouro estadual", "pontes", [8]],
  ["SNPH", "obra-edif", "Construção de 6 terminais hidroviários no interior", "Parintins, Itacoatiara, Tefé, Coari, Manicoré, Eirunepé", 96, 30, 10, "R", "Convênio federal", "terminais", [6]],
  ["SUHAB", "obra-edif", "Conjunto habitacional com 500 unidades — zona norte", "Manaus", 85, 30, 18, "F", "FGTS + Tesouro estadual", "unidades habitacionais", [500], { kw: "habitacionais" }],
  ["SUHAB", "obra-edif", "Construção de 20 casas populares", "Manacapuru", 3.2, 14, 6, "A", "Tesouro estadual", "casas", [20]],
  ["COSAMA", "obra-linear", "Ampliação da rede de abastecimento de água", "Coari", 28, 20, 8, "R", "Tesouro + Funasa", "km de rede", [45]],
  ["UGPE", "programa", "Programa de urbanização de igarapés — nova etapa", "Manaus", 650, 60, 26, "R", "BID + contrapartida", "famílias", [5, 100, 100, 2400]],
  ["SEDURB", "obra-linear", "Drenagem e pavimentação urbana em sedes municipais", "Maués, Borba, Nova Olinda do Norte", 38, 16, 20, "V", "Tesouro estadual", "km", [22]],

  ["SES", "reforma", "Reforma de 20 leitos de UTI", "Tefé", 4.8, 8, 4, "F", "Emenda parlamentar", "leitos", [20], { kw: "leitos de uti" }],
  ["SES", "aquisicao", "Aquisição de 30 ambulâncias para o interior", "Humaitá, Lábrea, Manicoré, Maués, Parintins, Itacoatiara", 12, 10, 7, "R", "Tesouro + emenda", "ambulâncias", [30, 30]],
  ["SES", "aquisicao", "Aquisição de 12 ambulanchas", "Barcelos, Santa Isabel do Rio Negro, São Gabriel da Cachoeira, Japurá, Maraã, Fonte Boa", 9, 12, 13, "A", "Tesouro estadual", "ambulanchas", [12, 12]],
  ["SES", "obra-edif", "Construção de hospital regional com 100 leitos", "Parintins", 140, 36, 20, "P", "Tesouro + financiamento", "leitos", [100]],
  ["SES", "servico", "Telessaúde — teleconsultas especializadas no interior", "Tabatinga, Benjamin Constant, Eirunepé, Carauari, Lábrea, São Gabriel da Cachoeira", 18, 24, 11, "R", "Tesouro + SUS", "teleconsultas", [60000, 95], { kw: "teleconsulta" }],
  ["FVS", "campanha", "Vacinação nas calhas dos rios (DTP3 e sarampo)", "Jutaí, Fonte Boa, Tonantins, Santo Antônio do Içá, Amaturá, São Paulo de Olivença", 6, 6, 4, "R", "SUS fundo a fundo", "doses aplicadas", [180000, [66, 95]], { kw: "vacina" }],
  ["SES", "campanha", "Mutirão de cirurgias eletivas", "Manaus, Itacoatiara, Parintins", 25, 8, 9, "C", "Programa federal de redução de filas", "cirurgias", [12000, [40, 90]], { nm: [null, "Fila reduzida"] }],
  ["FCECON", "aquisicao", "Aquisição de acelerador linear para radioterapia", "Manaus", 18, 18, 20, "V", "Tesouro + Ministério da Saúde", "equipamentos", [1, 1]],
  ["FHEMOAM", "obra-edif", "Construção de 3 hemonúcleos regionais", "Tefé, Tabatinga, Humaitá", 15, 18, -2, "L", "Tesouro estadual", "hemonúcleos", [3]],

  ["SEDUC", "obra-edif", "Construção de 10 escolas de tempo integral", "Manaus, Itacoatiara, Manacapuru, Coari, Tefé, Parintins", 160, 30, 12, "R", "Tesouro + FUNDEB", "escolas", [10]],
  ["SEDUC", "reforma", "Reforma de 120 escolas (climatização e elétrica)", "Manaus, Iranduba, Presidente Figueiredo, Manacapuru", 72, 14, 9, "A", "Tesouro estadual", "escolas", [120]],
  ["SEDUC", "aquisicao", "Aquisição de 25 mil notebooks para o ensino médio", "Manaus, Parintins, Itacoatiara, Manacapuru, Coari, Tefé", 95, 10, 5, "R", "Tesouro + FUNDEB", "notebooks", [25000, 25000]],
  ["SEDUC", "servico", "Transporte escolar fluvial — 900 rotas", "Barcelos, Novo Airão, Autazes, Careiro da Várzea, Beruri, Anori, Codajás", 210, 12, 8, "R", "Tesouro + PNATE", "alunos transportados", [38000, 95]],
  ["CETAM", "capacitacao", "Qualificação profissional — 15 mil vagas em cursos técnicos", "Manaus, Itacoatiara, Parintins, Manacapuru, Tefé, Humaitá", 22, 12, 6, "R", "Tesouro estadual", "alunos", [15000, 500, 85]],
  ["UEA", "capacitacao", "Licenciatura intercultural indígena — 600 professores", "São Gabriel da Cachoeira, Tabatinga, Benjamin Constant", 14, 48, 30, "R", "Tesouro estadual", "professores", [600, 20, 85]],
  ["UGPPADEAM", "programa", "Programa de melhoria da educação básica (financiamento externo)", "Manaus, Parintins, Itacoatiara, Tefé", 420, 60, 36, "A", "Banco Mundial + contrapartida", "estudantes", [4, 100, 100, 200000]],

  ["SEAS", "social", "Transferência de renda estadual a 100 mil famílias", "Manaus, Parintins, Itacoatiara, Manacapuru, Coari, Tefé, Tabatinga, Maués", 360, 12, 10, "R", "Tesouro (FPS)", "famílias", [100000, 62, 100]],
  ["SEAS", "social", "Cestas básicas a famílias atingidas pela estiagem", "Tefé, Coari, Codajás, Anori, Beruri, Manicoré, Borba", 40, 4, 3, "R", "Crédito extraordinário", "famílias", [60000, 40, 100]],
  ["SEAS", "obra-edif", "Construção de 5 Centros de Referência de Assistência Social", "Iranduba, Autazes, Careiro, Manaquiri, Rio Preto da Eva", 15, 18, 9, "A", "Tesouro + cofinanciamento federal", "CRAS", [5]],
  ["DEFESACIVIL", "social", "Resposta à estiagem — água potável e purificadores", "Tefé, Uarini, Alvarães, Fonte Boa, Jutaí, Coari", 30, 5, 4, "R", "Recurso federal de resposta", "famílias", [45000, 30, 100]],

  ["SEJUSC", "servico", "Cidadania itinerante — emissão de documentos no interior", "Lábrea, Pauini, Canutama, Tapauá, Envira, Ipixuna, Guajará", 7, 12, 7, "R", "Tesouro estadual", "atendimentos", [90000, 95]],
  ["FEPIAM", "social", "Segurança alimentar em aldeias indígenas", "São Gabriel da Cachoeira, Atalaia do Norte, Tabatinga, Santo Antônio do Içá", 12, 12, -2, "L", "Tesouro estadual", "famílias indígenas", [8000, 12, 100]],
  ["PROCON", "sistema", "Atendimento e reclamação 100% online", "Manaus", 3.5, 10, 14, "C", "Fundo de defesa do consumidor", "usuários", [8, 60000]],
  ["SEPCD", "aquisicao", "Entrega de 1.500 cadeiras de rodas e órteses", "Manaus, Parintins, Itacoatiara, Manacapuru, Tefé", 6, 10, 6, "R", "Tesouro + convênio federal", "equipamentos", [1500, 1500]],

  ["SSP", "operacao", "Operação integrada contra homicídios — zona leste", "Manaus", 8, 12, 7, "R", "Tesouro + FNSP", "operações", [240, [38, 27]], { nm: [null, "Homicídios por mês na área-alvo"] }],
  ["SSP", "obra-edif", "Construção de 2 bases fluviais de segurança", "Coari, Tabatinga", 60, 24, 14, "R", "Tesouro + FNSP", "bases", [2]],
  ["PMAM", "aquisicao", "Aquisição de 300 viaturas", "Manaus, Itacoatiara, Parintins, Manacapuru, Tefé, Humaitá", 75, 9, 6, "F", "Tesouro + FNSP", "viaturas", [300, 300]],
  ["PC", "sistema", "Delegacia virtual integrada ao Judiciário", "Manaus", 6, 14, 10, "A", "Tesouro estadual", "usuários", [8, 25000]],
  ["CBMAM", "aquisicao", "Aquisição de 6 embarcações de resgate e combate a incêndio", "Manaus, Parintins, Tefé", 14, 12, 4, "R", "Tesouro estadual", "embarcações", [6, 6]],
  ["SEAP", "obra-edif", "Construção de unidade prisional com 600 vagas", "Itacoatiara", 70, 28, 31, "V", "Tesouro + FUNPEN", "vagas", [600]],
  ["SEAP", "capacitacao", "Ressocialização — 2 mil internos em cursos e trabalho", "Manaus, Itacoatiara, Parintins", 4, 12, 13, "C", "FUNPEN", "internos", [2000, 80, 85]],

  ["SEMA", "programa", "Pagamento por serviços ambientais (REDD+ jurisdicional)", "Apuí, Lábrea, Boca do Acre, Manicoré, Novo Aripuanã, Humaitá", 120, 48, 18, "R", "Fundos internacionais", "famílias", [3, 100, 100, 8000], { kw: "desmatamento" }],
  ["SEMA", "operacao", "Combate a queimadas no sul do estado", "Lábrea, Apuí, Humaitá, Boca do Acre, Manicoré", 18, 6, 2, "R", "Tesouro + Fundo Amazônia", "operações", [120, [2100, 1200]], { nm: [null, "Focos de calor por mês"] }],
  ["IPAAM", "regularizacao", "Força-tarefa de licenciamento ambiental (passivo de 4 mil processos)", "Manaus", 5, 12, 9, "A", "Tesouro estadual", "processos", [4000, 2500]],
  ["SECT", "regularizacao", "Regularização fundiária — 10 mil títulos", "Manaus, Iranduba, Manacapuru, Itacoatiara, Parintins, Humaitá", 25, 24, 12, "R", "Tesouro estadual", "títulos", [14000, 10000], { kw: "títulos" }],

  ["IDAM", "servico", "Assistência técnica rural a 20 mil produtores", "Parintins, Maués, Itacoatiara, Manacapuru, Tefé, Humaitá, Apuí", 32, 12, 7, "R", "Tesouro estadual", "produtores atendidos", [20000, 90]],
  ["SEPROR", "aquisicao", "Aquisição de 40 patrulhas mecanizadas para municípios", "Parintins, Maués, Barreirinha, Boa Vista do Ramos, Urucará, Nhamundá", 32, 12, 9, "A", "Tesouro + emenda", "patrulhas", [40, 40]],
  ["ADAF", "campanha", "Mutirão de vistoria sanitária de rebanhos", "Parintins, Autazes, Careiro da Várzea, Boca do Acre, Apuí", 3, 6, 5, "R", "Tesouro estadual", "propriedades vistoriadas", [8000, [55, 90]]],
  ["ADS", "social", "Compra institucional da agricultura familiar", "Manacapuru, Iranduba, Careiro, Rio Preto da Eva, Presidente Figueiredo", 20, 12, 8, "R", "Tesouro estadual", "agricultores", [3500, 40, 100], { nm: ["Agricultores fornecedores", "Municípios atendidos", "Entregas com nota fiscal"] }],
  ["SEPA", "obra-edif", "Construção de 3 entrepostos de pescado", "Manacapuru, Parintins, Tefé", 21, 20, 13, "P", "Convênio federal", "entrepostos", [3]],
  ["SEPA", "aquisicao", "Distribuição de 200 kits de piscicultura", "Rio Preto da Eva, Presidente Figueiredo, Itacoatiara, Silves, Itapiranga", 5, 8, 6, "R", "Tesouro estadual", "kits", [200, 200]],

  ["AFEAM", "social", "Microcrédito para 8 mil empreendedores", "Manaus, Parintins, Itacoatiara, Manacapuru, Tefé, Coari", 60, 12, 9, "R", "Fundo de fomento", "empreendedores", [8000, 50, 95], { nm: [null, null, "Adimplência da carteira"] }],
  ["FAPEAM", "capacitacao", "Bolsas de mestrado e doutorado no interior", "Tefé, Parintins, Itacoatiara, Humaitá, Benjamin Constant", 16, 36, 20, "R", "FAPEAM", "bolsistas", [400, 20, 85]],
  ["JUCEA", "sistema", "Abertura de empresas 100% digital", "Manaus", 2.5, 8, 12, "C", "Tesouro estadual", "empresas abertas", [6, 15000]],
  ["AMAZONASTUR", "evento", "Calendário de festivais regionais", "Parintins, Maués, Itacoatiara, Manacapuru, Barcelos, Tefé", 25, 8, 5, "R", "Tesouro + patrocínio", "pessoas", [12, 150000]],
  ["SEDECTI", "programa", "Polo de bioeconomia e centro de bionegócios", "Manaus, Tefé, Parintins", 90, 42, 16, "A", "BNDES + Tesouro", "empresas apoiadas", [4, 100, 100, 300]],

  ["SEC", "evento", "Circuito cultural nos municípios — 60 apresentações", "Parintins, Maués, Tefé, Coari, Humaitá, Tabatinga, Itacoatiara", 9, 10, 6, "R", "Tesouro + lei de incentivo", "pessoas", [60, 90000]],
  ["SEC", "reforma", "Restauro de 3 prédios históricos", "Manaus", 9, 14, 17, "V", "Tesouro + IPHAN", "edificações", [3]],
  ["SEDEL", "obra-edif", "Construção de 15 arenas esportivas no interior", "Manicoré, Humaitá, Borba, Autazes, Coari, Tefé, Tabatinga, Eirunepé", 45, 24, 10, "A", "Tesouro estadual", "arenas", [15]],

  ["SEAD", "sistema", "Governo digital — 300 serviços no portal único", "Manaus", 28, 24, 12, "R", "Tesouro estadual", "usuários", [300, 400000], { kw: "serviços digitais" }],
  ["SEAD", "capacitacao", "Escola de governo — capacitação de 6 mil servidores", "Manaus, Parintins, Tefé", 3, 12, 15, "C", "Tesouro estadual", "servidores", [6000, 200, 85]],
  ["PRODAM", "aquisicao", "Internet via satélite em 400 escolas e unidades de saúde", "Japurá, Juruá, Itamarati, Pauini, Envira, Atalaia do Norte, Santa Isabel do Rio Negro", 20, 12, 7, "F", "Tesouro + programa federal", "pontos", [400, 400], { kw: "conectividade" }],
  ["SEFAZ", "sistema", "Malha fiscal com inteligência artificial", "Manaus", 12, 18, 9, "R", "Tesouro estadual (PROFISCO)", "contribuintes monitorados", [6, 12000]],
  ["PGE", "regularizacao", "Mutirão de recuperação da dívida ativa", "Manaus", 1.5, 8, 5, "R", "Tesouro estadual", "processos", [20000, 6000], { nm: [null, "Acordos firmados"] }],
  ["CGE", "sistema", "Painel público de acompanhamento de obras", "Manaus", 1.2, 6, -1, "L", "Tesouro estadual", "acessos/mês", [5, 3000]],
  ["DETRAN", "capacitacao", "Habilitação social — 10 mil CNHs gratuitas", "Manaus, Parintins, Itacoatiara, Manacapuru, Tefé, Coari", 15, 12, 8, "R", "Fundo de trânsito", "condutores habilitados", [10000, 400, 85]],
  ["SEMIG", "obra-linear", "Eletrificação rural — 2 mil ligações", "Autazes, Careiro, Manaquiri, Iranduba", 26, 18, 10, "P", "Programa federal + Tesouro", "ligações", [2000]],
  ["SEMIG", "programa", "Gás natural para o interior (GNL)", "Coari, Codajás, Anori, Anamã, Caapiranga, Manacapuru", 300, 48, -3, "L", "Parceria público-privada", "domicílios", [3, 100, 100, 50000]],
];

// gera os projetos simulados (determinístico: mesma carteira a cada carga, datas relativas a hoje)
window.gerarExemplos = function (uid, ORG) {
  const M = Object.fromEntries(window.MODELOS.map(m => [m.id, m]));
  const DIA = 864e5, hoje = new Date(new Date().toISOString().slice(0, 10));
  const iso = d => new Date(d).toISOString().slice(0, 10);
  const addM = (d, m) => new Date(+d + m * 30.44 * DIA);
  const smooth = x => x <= 0 ? 0 : x >= 1 ? 1 : 0.5 * x + 0.5 * (3 * x * x - 2 * x * x * x); // curva S suavizada
  const inv = y => { let a = 0, b = 1; for (let k = 0; k < 30; k++) { const c = (a + b) / 2; smooth(c) < y ? a = c : b = c; } return a; };
  const COBRA = { A: "Execução física abaixo do cronograma. Apresentar plano de recuperação com novas datas em 10 dias.",
    P: "Projeto paralisado. Informar causa, situação do contrato e data de retomada.",
    F: "Pagamento à frente da execução física. Verificar medições e retenções.",
    V: "Prazo final vencido. Justificar e informar previsão de conclusão e aditivo." };
  const RESP = { A: "Plano de recuperação em elaboração: reforço da equipe de campo e novo cronograma até o fim do mês.",
    P: "Contrato em rescisão por inexecução. Nova contratação prevista em 60 dias.",
    F: "Diferença refere-se a adiantamento de materiais e equipamentos. Medição de campo será apresentada na próxima semana.",
    V: "Aditivo de prazo de 90 dias em análise na PGE; execução está na fase final." };
  return window.EXEMPLOS.map((e, k) => {
    const [org, mid, titulo, municipios, mi, dur, ini, perfil, fonte, u, q = [], x = {}] = e;
    const md = M[mid];
    let s = k * 7919 + 13; const R = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; const j = (a, b) => a + (b - a) * R();
    const inicio = addM(hoje, -ini), fim = addM(inicio, dur), el = Math.min(1, Math.max(0, (hoje - inicio) / (fim - inicio)));
    const fis = Math.min(1, { R: smooth(el) * j(0.95, 1.04), A: smooth(el) * j(0.45, 0.65), F: smooth(el) * j(0.6, 0.8),
      P: smooth(el * 0.55) * j(0.8, 1), C: 1, V: j(0.8, 0.9), L: 0 }[perfil]);
    const fin = Math.min(1, { R: fis * j(0.85, 1), A: fis * j(0.95, 1.08), F: fis + j(0.3, 0.42), P: fis * j(1.05, 1.2), C: j(0.96, 1), V: fis * j(0.95, 1.05), L: 0 }[perfil]);
    const tFim = perfil === "P" ? +inicio + (hoje - inicio) * 0.55 : perfil === "C" ? +fim : +hoje - Math.round(j(2, 15)) * DIA;
    const datas = [];
    if (perfil !== "L") { for (let t = +inicio + 30 * DIA; t < tFim - 10 * DIA; t += 30.44 * DIA) datas.push(t); datas.push(tFim); }
    const curva = t => fis * smooth((t - inicio) / (tFim - inicio));
    const nome = n => n.replace("{u}", u);
    const metricas = md.metricas.map((m, i) => {
      const alvo = q[i] ?? m.meta, [base, meta] = Array.isArray(alvo) ? alvo : [m.base, alvo];
      const fm = perfil === "C" || i === 0 ? 1 : j(0.88, 1.06), dec = m.unidade === "%";
      let acc = 0;
      const medicoes = datas.map(t => {
        acc = Math.max(acc, Math.min(1, curva(t) * fm * j(0.97, 1.03)));
        const v = base + (meta - base) * acc;
        return { data: iso(t), valor: dec ? Math.round(v * 10) / 10 : Math.round(v), por: "simulação" };
      });
      return { id: uid(), nome: (x.nm && x.nm[i]) || nome(m.nome), unidade: nome(m.unidade), base, meta, medicoes };
    });
    const marcos = md.marcos.map(([n, f]) => {
      const prazo = +inicio + inv(f) * (fim - inicio), ok = perfil === "C" || (perfil !== "L" && fis >= f * 0.93);
      return { id: uid(), nome: n, prazo: iso(prazo), ok, data_ok: ok ? iso(Math.min(prazo, tFim)) : "" };
    });
    const riscos = md.riscos.map(([desc, prob, impacto, mitig], i) => ({ id: uid(), desc, prob, impacto, mitig, resp: md.gerente.replace("{S}", ORG[org].sigla),
      status: perfil === "C" ? "Encerrado" : i === 1 && perfil === "R" ? "Em tratamento" : "Aberto" }));
    if ("AP".includes(perfil)) Object.assign(riscos[0], { prob: "Alta", impacto: "Alto", status: "Em tratamento" });
    const previsto = Math.round(mi * 1e6), pago = Math.round(previsto * fin), emp = perfil === "L" ? 0 : Math.round(Math.min(previsto, previsto * Math.max(fin, Math.min(1, 0.35 + el))));
    const orcHist = datas.filter((t, i) => i % 2 === 1 || i === datas.length - 1).map(t => {
      const r = fis ? curva(t) / fis : 0;
      return { data: iso(t), previsto, empenhado: Math.round(Math.max(emp * Math.min(1, 0.4 + r), Math.round(pago * r))), pago: Math.round(pago * r), por: "simulação" };
    });
    if (orcHist.length) Object.assign(orcHist[orcHist.length - 1], { empenhado: emp, pago });
    const coms = COBRA[perfil] ? [{ lado: "gov", texto: COBRA[perfil], em: new Date(+hoje - 6 * DIA).toISOString() },
      { lado: "org", texto: RESP[perfil], em: new Date(+hoje - 2 * DIA).toISOString() }] : [];
    return {
      id: uid(), exemplo: true, org, titulo: titulo + " (exemplo)", tipo: md.tipo, modelo: mid,
      status: { R: "Em execução", A: "Em execução", F: "Em execução", V: "Em execução", P: "Paralisado", C: "Concluído", L: "Planejamento" }[perfil],
      descricao: `${md.nome}. Projeto simulado para demonstração da plataforma.`, municipios, inicio: iso(inicio), fim: iso(fim),
      gerente: md.gerente.replace("{S}", ORG[org].sigla), responsaveis: md.equipe, fonte,
      orcamento: { previsto, empenhado: emp, pago }, orcHist, indicadores: [], kw: x.kw, coms,
      metricas, marcos, riscos, anexos: [], em: new Date(perfil === "L" ? +hoje - 3 * DIA : tFim).toISOString(), por: "simulação",
    };
  });
};
