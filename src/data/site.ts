// Conteúdo central do site. Textos em rascunho: validar com a liderança antes de publicar.
// Fonte: vault aurion-vault (notas Aurion, Valores, Matriz de Responsabilidades),
// "Apresentação Conceito de Identidade Aurion" e "Manual de Marca" (Agência Ideia Brasil, 2026)
// e o modelo de "Proposta Comercial" do diagnóstico.

export const site = {
  nome: 'Aurion',
  assinatura: 'Tecnologia que movimenta valor',
  descricao:
    'A Aurion é uma software house que faz análise de negócio, engenharia de software, inteligência de dados e automação a partir dos processos de cada cliente.',
  // Preencher quando houver canais oficiais. Vazio = aparece como "a definir".
  email: '',
  whatsapp: '',
  linkedin: 'https://www.linkedin.com/company/labs-aurion/',
  instagram: 'https://www.instagram.com/labs.aurion/',
  // E-mail do encarregado de dados (DPO), exigido pela LGPD. Aparece em Segurança e deve constar na política de privacidade.
  encarregado: '',
};

export const nav = [
  { href: '/como-trabalhamos', label: 'Como trabalhamos' },
  { href: '/servicos', label: 'Serviços' },
  { href: '/sobre', label: 'Sobre' },
];

export const principio = {
  frase: 'Não tem como automatizar o que não é processo.',
  explicacao:
    'Qualquer automação, seja com IA, integração, bot ou script, depende de um fluxo mapeado e combinado com a equipe. Sem isso, ela só aumenta o retrabalho.',
  comparacao: {
    sem: {
      rotulo: 'O cenário comum',
      titulo: 'Automação em cima do improviso',
      itens: [
        'Cada pessoa faz de um jeito, e o sistema copia só um deles.',
        'Ninguém previu as exceções, então a automação trava no primeiro caso diferente.',
        'Quando algo dá errado, não fica claro quem resolve.',
        'O retrabalho continua, só que mais rápido.',
      ],
    },
    com: {
      rotulo: 'O jeito Aurion',
      titulo: 'Automação em cima de um fluxo acordado',
      itens: [
        'A equipe segue as mesmas etapas, e a automação segue junto.',
        'As exceções já têm um caminho definido.',
        'Cada etapa tem um responsável.',
        'A tecnologia tira trabalho da equipe em vez de criar mais.',
      ],
    },
  },
};

export const fases = {
  entender: 'Entender e organizar',
  construir: 'Construir e automatizar',
};

export const metodo = [
  {
    titulo: 'Diagnóstico',
    descricao: 'Antes de falar em tecnologia, conversamos sobre o negócio, os objetivos da empresa e onde o problema aparece.',
    entrega: 'Visão clara do problema e das prioridades',
  },
  {
    titulo: 'Mapeamento',
    descricao: 'Registramos o funcionamento atual com entrevistas, acesso aos sistemas e diagramas.',
    entrega: 'Mapa de como o trabalho acontece hoje',
  },
  {
    titulo: 'Fluxo acordado',
    descricao: 'Junto com a sua equipe, definimos as entradas, as saídas, os responsáveis e o que fazer nas exceções.',
    entrega: 'Fluxo validado por quem opera',
  },
  {
    titulo: 'Implementação',
    descricao: 'Desenvolvemos o software a partir do fluxo validado, com entregas que você consegue acompanhar.',
    entrega: 'Sistema rodando na operação real',
  },
  {
    titulo: 'Automação e dados',
    descricao: 'Com a rotina estável, aplicamos IA, integrações e indicadores nos pontos em que fazem diferença.',
    entrega: 'Automação confiável e dados para decidir',
  },
  {
    titulo: 'Acompanhamento',
    descricao: 'Mantemos e evoluímos a solução junto com a operação do cliente.',
    entrega: 'Evolução contínua e documentada',
  },
];

// Como acontece a primeira etapa do método, com base no modelo de proposta do diagnóstico.
// Prazo, número de encontros e investimento variam por cliente e ficam fora do site.
export const diagnostico = {
  etapas: [
    {
      titulo: 'Imersão',
      conduz: 'Conduzida pela sua equipe',
      descricao: 'Em alguns encontros, a sua equipe apresenta como a empresa funciona hoje, área por área.',
      temas: ['Estrutura e cultura', 'Sistemas e cadastros', 'Operação e financeiro', 'Marketing e comercial'],
    },
    {
      titulo: 'Alinhamento',
      conduz: 'Em conjunto',
      descricao: 'Fechamos a análise e confirmamos quais setores e pontos críticos precisam ser corrigidos ou desenvolvidos.',
      temas: ['Setores críticos', 'Prioridades'],
    },
    {
      titulo: 'Diagnóstico por setor',
      conduz: 'Conduzido pela Aurion',
      descricao: 'Apresentamos o diagnóstico de cada setor: o que está funcionando, o que trava e por quê.',
      temas: ['Pontos críticos', 'Causas', 'Oportunidades'],
    },
    {
      titulo: 'Plano de ação',
      conduz: 'Conduzido pela Aurion',
      descricao: 'Entregamos o plano com cronograma, as áreas de intervenção e o que vale desenvolver ou automatizar.',
      temas: ['Cronograma', 'Melhoria contínua', 'Automação'],
    },
  ],
  entregaveis: [
    'Diagnóstico dos pontos críticos encontrados',
    'Áreas prioritárias de intervenção',
    'Recomendações de correção, desenvolvimento e automação',
    'Plano de ação com cronograma',
    'Direção para a melhoria contínua',
  ],
  preparo: [
    'Organograma e quem decide em cada setor',
    'Cadastros e itens ativos',
    'Sistemas, infraestrutura e rotinas de backup',
    'Fluxo de pedido, faturamento e financeiro',
    'Planejamento comercial e de marketing',
    'Canais de venda e distribuição',
  ],
  presenca: 'Em cada encontro, precisamos de quem toma as decisões e do responsável técnico pela área em pauta.',
};

export const servicos = [
  {
    titulo: 'Análise de negócio e transformação digital',
    descricao:
      'É por aqui que a maioria dos projetos começa. Fazemos o diagnóstico e o mapeamento dos processos para melhorar a operação a partir do que acontece no dia a dia.',
    itens: ['Diagnóstico de processos', 'Levantamento de requisitos', 'Desenho de fluxos'],
  },
  {
    titulo: 'Engenharia de software',
    descricao: 'Sistemas, aplicativos e e-commerce construídos sob medida para a rotina de cada cliente.',
    itens: ['Sistemas web', 'Aplicativos mobile', 'E-commerce', 'Integrações'],
  },
  {
    titulo: 'Inteligência de dados',
    descricao: 'Dados organizados para acompanhar a operação e apoiar decisões.',
    itens: ['Indicadores e dashboards', 'BI', 'Pipelines de dados'],
  },
  {
    titulo: 'IA, automação e chatbots',
    descricao: 'Agentes, bots e automações aplicados sobre fluxos que já foram mapeados e validados.',
    itens: ['Chatbots e atendimento', 'Agentes de IA', 'Automação de rotinas'],
  },
  {
    titulo: 'Infraestrutura e TI',
    descricao: 'Base técnica para a operação rodar com segurança.',
    itens: ['Redes', 'Servidores e backup', 'Segurança da informação'],
  },
];

// O site não expõe a equipe: nada de nomes, cargos, quantidade de pessoas ou uma lista que espelhe papéis individuais.
export const competencias = [
  { titulo: 'Processos e negócio', descricao: 'Diagnóstico, mapeamento e desenho de fluxos, feitos antes de começar o desenvolvimento.' },
  { titulo: 'Software e mobile', descricao: 'Desenvolvimento de sistemas web, aplicativos e integrações.' },
  {
    titulo: 'Dados, IA e novas tecnologias',
    descricao: 'Pipelines, indicadores, agentes e automações, além da exploração de tecnologias como blockchain.',
  },
  { titulo: 'Infraestrutura e segurança', descricao: 'Infraestrutura estável e proteção de dados e acessos pensada desde o início do projeto.' },
];

export const submarcas = [
  {
    nome: 'Aurion Lab',
    logo: '/brand/aurion-lab.svg',
    descricao: 'Pesquisa, inovação e produtos próprios: protótipos, IA e novas soluções.',
    itens: ['Pesquisa e inovação', 'Protótipos', 'IA aplicada', 'Produtos próprios'],
  },
  {
    nome: 'Aurion Cloud',
    logo: '/brand/aurion-cloud.svg',
    descricao: 'Infraestrutura, hospedagem, servidores e segurança na nuvem.',
    itens: ['Infraestrutura', 'Hospedagem', 'Servidores', 'Segurança na nuvem'],
  },
  {
    nome: 'Aurion Rebranding',
    logo: '/brand/aurion-rebranding.svg',
    descricao: '',
    itens: [],
    emBreve: true,
  },
];

// Frentes marcadas como emBreve ficam fora do site até serem lançadas.
export const submarcasPublicas = submarcas.filter((m) => !m.emBreve);

// Texto "Sobre a marca" do Manual de Marca, adaptado para o site.
export const historia = {
  paragrafos: [
    'A Aurion nasceu de uma convicção simples: antes de falar em tecnologia, é preciso entender como a empresa funciona, com seus processos, pessoas e decisões.',
    'Mais do que desenvolver sistemas, transformamos o conhecimento do negócio em informação centralizada, acessível e segura. Com software, dados e infraestrutura, ajudamos indústrias e empresas familiares e tradicionais a decidir melhor, preservar o que sabem e não perder mercado.',
    'O nome vem do ouro: aquilo que tem valor, resiste ao tempo e vira patrimônio. Para nós, o maior ativo de uma empresa é o conhecimento que ela construiu, e a Aurion existe para que ele não se perca e continue gerando valor.',
  ],
  fecho: ['Antes de crescer, é preciso preservar.', 'Antes de decidir, é preciso saber.', 'E antes de evoluir, é preciso conectar.'],
};

export const conceitoMarca = {
  palavras: ['Valor', 'Conexão', 'Segurança', 'Evolução', 'Continuidade', 'Conhecimento'],
  simbolo: [
    'O elemento inclinado representa uma barra de ouro, conectando a marca ao significado de Aurion.',
    'O elemento vertical representa estrutura, segurança e sustentação concreta, inclusive para o elemento de ouro.',
    'Juntos, formam uma representação abstrata do “A” de Aurion, unindo valor e movimento em uma forma simples e memorável.',
  ],
};

export const comoOperamos = [
  {
    titulo: 'Premium e alta performance',
    descricao: 'Entrega consistente e senso de dono em cada projeto.',
  },
  {
    titulo: 'Continuidade',
    descricao: 'Seu projeto não depende de uma única pessoa. As responsabilidades são divididas e cada troca de responsável é documentada.',
  },
  {
    titulo: 'Tudo rastreável',
    descricao: 'Dá para saber quem fez cada tarefa e por que cada decisão foi tomada.',
  },
  {
    titulo: 'Conhecimento documentado',
    descricao: 'Fluxos e decisões ficam registrados e acessíveis, sem depender da memória de quem atendeu.',
  },
];
