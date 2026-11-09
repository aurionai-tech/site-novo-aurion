// Conteúdo central do site. Textos em rascunho: validar com a liderança antes de publicar.
// Fonte: vault aurion-vault (notas Aurion, Valores, Matriz de Responsabilidades)
// e "Apresentação Conceito de Identidade Aurion" (Agência Ideia Brasil, 2026).

export const site = {
  nome: 'Aurion',
  assinatura: 'Tecnologia que movimenta valor',
  descricao:
    'Software house multidisciplinar: análise de negócio, engenharia de software, inteligência de dados e automação construídas sobre processos reais.',
  // Preencher quando houver canais oficiais. Vazio = aparece como "a definir".
  email: '',
  whatsapp: '',
  linkedin: '',
};

export const nav = [
  { href: '/como-trabalhamos', label: 'Como trabalhamos' },
  { href: '/servicos', label: 'Serviços' },
  { href: '/segmentos', label: 'Segmentos' },
  { href: '/sobre', label: 'Sobre' },
];

export const principio = {
  frase: 'Não tem como automatizar o que não é processo.',
  explicacao:
    'Automação — seja IA, integração, bot ou script — só funciona sobre um fluxo mapeado, repetível e acordado. Sem isso, o que se entrega é retrabalho, não escala.',
};

export const fases = {
  processo: 'Primeiro o processo',
  tecnologia: 'Depois a tecnologia',
};

export const metodo = [
  {
    titulo: 'Diagnóstico',
    descricao: 'Entendemos o negócio, os objetivos e onde está o problema real — antes de falar em tecnologia.',
    entrega: 'Visão clara do problema e das prioridades',
  },
  {
    titulo: 'Mapeamento',
    descricao: 'Documentamos o processo atual com entrevistas, acesso aos sistemas e diagramas.',
    entrega: 'Processo atual documentado',
  },
  {
    titulo: 'Fluxo acordado',
    descricao: 'Organizamos o processo com a sua equipe: entradas, saídas, responsáveis e exceções definidos.',
    entrega: 'Fluxo validado por quem opera',
  },
  {
    titulo: 'Implementação',
    descricao: 'Construímos o software sob medida em cima do fluxo validado, com entregas rastreáveis.',
    entrega: 'Sistema funcionando no processo real',
  },
  {
    titulo: 'Automação e dados',
    descricao: 'Com o processo estável, aplicamos IA, integrações e indicadores onde geram ganho de verdade.',
    entrega: 'Automação confiável e dados para decidir',
  },
  {
    titulo: 'Acompanhamento',
    descricao: 'Mantemos e evoluímos a solução junto com a operação do cliente.',
    entrega: 'Evolução contínua e documentada',
  },
];

export const servicos = [
  {
    titulo: 'Análise de negócio e transformação digital',
    descricao:
      'A porta de entrada. Diagnóstico e mapeamento de processos para transformar a operação real — não uma lista de desejos.',
    itens: ['Diagnóstico de processos', 'Levantamento de requisitos', 'Desenho de fluxos'],
  },
  {
    titulo: 'Engenharia de software',
    descricao: 'Sistemas, aplicativos e e-commerce construídos sob medida para o processo do cliente.',
    itens: ['Sistemas web', 'Aplicativos mobile', 'E-commerce', 'Integrações'],
  },
  {
    titulo: 'Inteligência de dados',
    descricao: 'Dados organizados para acompanhar a operação e apoiar decisões.',
    itens: ['Indicadores e dashboards', 'BI', 'Pipelines de dados'],
  },
  {
    titulo: 'IA, automação e chatbots',
    descricao: 'Agentes, bots e automações aplicados sobre processos já mapeados — consequência, não atalho.',
    itens: ['Chatbots e atendimento', 'Agentes de IA', 'Automação de rotinas'],
  },
  {
    titulo: 'Infraestrutura e TI',
    descricao: 'Base técnica para a operação rodar com segurança.',
    itens: ['Redes', 'Servidores e backup', 'Segurança da informação'],
  },
];

export const segmentos = [
  {
    titulo: 'Contabilidade',
    descricao: 'Rotinas intensas em processo e documentos, com muito espaço para organização e automação.',
  },
  {
    titulo: 'Agronegócio',
    descricao: 'Operações de campo, logística e dados que precisam chegar a quem decide.',
  },
  {
    titulo: 'Mobile',
    descricao: 'Aplicativos para equipes em campo e para o cliente final.',
  },
];

// O site não expõe membros da equipe: só áreas de competência, sem nomes, cargos ou quantidade de pessoas.
export const competencias = [
  { titulo: 'Engenharia de software', descricao: 'Sistemas, aplicativos e integrações construídos sob medida.' },
  { titulo: 'Engenharia e inteligência de dados', descricao: 'Dados organizados, pipelines e indicadores para decidir.' },
  { titulo: 'Mobile', descricao: 'Aplicativos para equipes em campo e para o cliente final.' },
  { titulo: 'Segurança da informação', descricao: 'Proteção de dados e acessos desde o desenho da solução.' },
  { titulo: 'IA, automação e conversação', descricao: 'Agentes, bots e automações sobre processos mapeados.' },
  { titulo: 'BI e novas tecnologias', descricao: 'Painéis de gestão e exploração de tecnologias como blockchain.' },
];

export const submarcas = [
  {
    nome: 'Aurion Lab',
    logo: '/brand/aurion-lab.svg',
    descricao: 'Pesquisa, inovação e produtos próprios: protótipos, IA e novas soluções.',
  },
  {
    nome: 'Aurion Cloud',
    logo: '/brand/aurion-cloud.svg',
    descricao: 'Infraestrutura, hospedagem, servidores e segurança na nuvem.',
  },
  {
    nome: 'Aurion Rebranding',
    logo: '/brand/aurion-rebranding.svg',
    descricao: '',
    emBreve: true,
  },
];

export const conceitoMarca = {
  palavras: ['Valor', 'Conexão', 'Segurança', 'Evolução', 'Continuidade', 'Conhecimento'],
  simbolo: [
    'O elemento inclinado representa uma barra de ouro, conectando a marca ao significado de Aurion.',
    'O elemento vertical representa estrutura, segurança e sustentação concreta — inclusive do elemento de ouro.',
    'Juntos, formam uma representação abstrata do “A” de Aurion, unindo valor e movimento em uma forma simples e memorável.',
  ],
  cores: [
    { nome: 'Preto', hex: '#0a0a0a', significado: 'Solidez, segurança e autoridade.' },
    { nome: 'Dourado', hex: '#c6b272', significado: 'Valor, excelência e transformação.' },
    { nome: 'Branco', hex: '#ffffff', significado: 'Clareza, organização e transparência.' },
  ],
};

export const comoOperamos = [
  {
    titulo: 'Premium e alta performance',
    descricao: 'Entrega consistente e senso de dono em cada projeto.',
  },
  {
    titulo: 'Horizontal e descentralizada',
    descricao: 'Uma equipe com papéis claros, que opera sem depender de uma única pessoa.',
  },
  {
    titulo: 'Processos auditáveis',
    descricao: 'Tarefas, responsabilidades e decisões rastreáveis do início ao fim.',
  },
  {
    titulo: 'Conhecimento documentado',
    descricao: 'Fluxos e decisões ficam registrados — não só na cabeça de quem atendeu.',
  },
];
