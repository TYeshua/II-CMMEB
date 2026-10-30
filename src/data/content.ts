// Todo o conteúdo editável do site.
// O que ainda não foi definido para 2027 aparece na página como [n] (ver PLACEHOLDERS no fim do arquivo).

export const SITE = 'cmmeb.com.br'

export type Lens = 'amb' | 'ind' | 'soc'
export const LENS: Record<Lens, string> = { amb: 'Ambiente', ind: 'Indústria', soc: 'Sociedade' }

/* ---------- Primeira órbita: a margem, da costa à bacia ---------- */
export type Zone = {
  id: string
  name: string
  depth: string
  text: string
  spots: { name: string; lens: Lens[]; text: string }[]
  crop: [number, number, number, number] // recorte do desenho do perfil (x0, x1, y0, y1)
}

export const zones: Zone[] = [
  {
    id: 'costa',
    name: 'Costa',
    depth: '0 m',
    text: 'Do Amapá ao Rio Grande do Norte, uma costa de baías e estuários que recebe a foz do Amazonas e algumas das maiores marés do país.',
    crop: [0, 1150, 0, 560],
    spots: [
      { name: 'Maré de até sete metros', lens: ['amb', 'ind'], text: 'No Golfão Maranhense o mar sobe e desce duas vezes por dia, o que condiciona portos, navegação e apoio offshore.' },
      { name: 'Cinco estados, cinco bacias', lens: ['ind', 'soc'], text: 'Amapá, Pará, Maranhão, Piauí, Ceará e Rio Grande do Norte dividem a mesma margem.' },
    ],
  },
  {
    id: 'plataforma',
    name: 'Plataforma',
    depth: 'até ~100 m',
    text: 'Larga e rasa diante do Pará e do Maranhão, sob a influência da pluma do Amazonas, e mais estreita a leste, até o Rio Grande do Norte.',
    crop: [950, 2250, 0, 600],
    spots: [
      { name: 'Pluma do Amazonas', lens: ['amb', 'ind'], text: 'A descarga do rio muda a salinidade, a turbidez e os sedimentos de toda a plataforma.' },
    ],
  },
  {
    id: 'talude',
    name: 'Talude',
    depth: '100 a 2000 m',
    text: 'A quebra da plataforma, onde a Corrente Norte do Brasil corre rumo ao noroeste. Cânions e deslizamentos são risco para dutos e poços e, ao mesmo tempo, habitat de profundidade.',
    crop: [2050, 3150, 160, 1000],
    spots: [
      { name: 'Corrente Norte do Brasil', lens: ['amb', 'ind'], text: 'Define o transporte de calor, de sedimentos e de uma eventual mancha de óleo.' },
      { name: 'Cânions submarinos', lens: ['amb', 'ind'], text: 'Riscos geológicos para a infraestrutura submarina.' },
    ],
  },
  {
    id: 'bacia',
    name: 'Bacia oceânica',
    depth: 'além de 2000 m',
    text: 'Os blocos exploratórios ficam além da quebra, em lâminas d’água de centenas a milhares de metros. É aqui que a fronteira energética encontra o oceano menos medido.',
    crop: [2900, 4000, 0, 1000],
    spots: [
      { name: 'Poços em águas profundas', lens: ['ind'], text: 'A perfuração exploratória acontece longe da costa, sobre o leito profundo.' },
    ],
  },
]

/* ---------- Segunda órbita: o ambiente ---------- */
export type Habitat = { name: string; text: string; link: string; photo?: { src: string; alt: string; caption: string; w: number; h: number } }
export const habitats: Habitat[] = [
  {
    name: 'Manguezais',
    text: 'A costa entre o Pará e o Maranhão abriga a maior faixa contínua de manguezais do mundo, berçário de peixes e crustáceos e base da economia local.',
    link: 'Estão entre os ambientes mais sensíveis a derramamentos de óleo.',
    photo: { src: import.meta.env.BASE_URL + 'assets/mangue.webp', alt: 'Raízes aéreas de mangue-vermelho sobre lama na maré baixa', caption: 'Raízes de mangue-vermelho, Rhizophora mangle', w: 1600, h: 1067 },
  },
  {
    name: 'Recifes amazônicos',
    text: 'Sob a pluma do Amazonas existe um sistema recifal de águas intermediárias, descrito há poucos anos e ainda pouco conhecido.',
    link: 'Fica na mesma região dos blocos da bacia da Foz do Amazonas.',
  },
  {
    name: 'Fauna marinha',
    text: 'Cetáceos, aves migratórias, tartarugas e o guará usam a costa e a plataforma. Redes de encalhe e centros de reabilitação acompanham esses animais.',
    link: 'O monitoramento da fauna faz parte do licenciamento das atividades no mar.',
    photo: { src: import.meta.env.BASE_URL + 'assets/guara.webp', alt: 'Bando de guarás vermelhos pousados na copa de um manguezal', caption: 'Guarás no manguezal', w: 1600, h: 1067 },
  },
  {
    name: 'Pesca artesanal e maretórios',
    text: 'Currais de pesca, extrativismo e maricultura sustentam comunidades inteiras ao longo da costa, que precisam estar na conversa sobre o uso do mar.',
    link: 'Dividem o espaço marinho com rotas de navegação e áreas de operação.',
    photo: { src: import.meta.env.BASE_URL + 'assets/maiau.webp', alt: 'Vista de satélite do mar verde-azulado sobre bancos de areia no arquipélago de Maiaú', caption: 'Reserva Extrativista Marinha de Cururupu, vista do espaço', w: 1600, h: 900 },
  },
]

/* ---------- No centro: a indústria, nas cinco bacias sedimentares ---------- */
export type Basin = { name: string; lens: Lens[]; text: string; cx: number; cy: number; rx: number; ry: number; states: string }
export const basins: Basin[] = [
  { name: 'Foz do Amazonas', states: 'AP · PA', lens: ['ind', 'amb'], text: 'Pluma do rio Amazonas, Grande Sistema Recifal Amazônico e os primeiros poços exploratórios em águas profundas da região, no bloco FZA-M-59.', cx: 120, cy: 88, rx: 78, ry: 30 },
  { name: 'Pará-Maranhão', states: 'PA · MA', lens: ['amb'], text: 'Plataforma continental larga e rasa, manguezais contínuos e marés de grande amplitude, com forte influência da descarga amazônica. É a bacia em frente a Salinópolis, sede do congresso.', cx: 300, cy: 140, rx: 74, ry: 27 },
  { name: 'Barreirinhas', states: 'MA', lens: ['amb', 'soc'], text: 'Em frente ao Golfão Maranhense e aos Lençóis Maranhenses, na costa do Maranhão.', cx: 490, cy: 168, rx: 66, ry: 24 },
  { name: 'Ceará', states: 'PI · CE', lens: ['amb'], text: 'Talude marcado por cânions submarinos, mapeado em alta resolução por cruzeiros científicos recentes.', cx: 680, cy: 160, rx: 58, ry: 24 },
  { name: 'Potiguar', states: 'RN', lens: ['ind'], text: 'Bacia já produtora em terra e no mar, vizinha aos polos de energia eólica do Rio Grande do Norte e do Ceará.', cx: 868, cy: 150, rx: 62, ry: 24 },
]

/* ---------- Palestrantes ---------- */
export type Sector = 'aca' | 'ind' | 'gov' | 'ong'
export const SECTORS: Record<Sector, { label: string; color: string }> = {
  aca: { label: 'Academia', color: '#8fd3e8' },
  ind: { label: 'Setor produtivo', color: '#f5a524' },
  gov: { label: 'Órgãos públicos', color: '#cdeef5' },
  ong: { label: 'Sociedade civil', color: '#ff8a76' },
}
export type Speaker = { name: string; org: string; sector: Sector; talk: string }
export const speakers2024: Speaker[] = [
  { name: 'Ilson Carlos Almeida da Silveira', org: 'USP', sector: 'aca', talk: 'A Corrente Norte do Brasil na Margem Equatorial' },
  { name: 'Damià Barceló', org: 'IDAEA-CSIC', sector: 'aca', talk: 'Microplásticos no ambiente aquático global: análise, efeitos, remediação e políticas' },
  { name: 'Halesio Milton C. de Barros Neto', org: 'CENPES', sector: 'ind', talk: 'Ciências do Mar na eólica offshore e a Expedição Tucuju, que descreveu o primeiro recife amazônico' },
  { name: 'Ludmilla Valente Viana Silva', org: 'ANP', sector: 'gov', talk: 'Responsabilidade socioambiental na exploração e produção de óleo e gás na Margem Equatorial' },
  { name: 'Rodrigo Leão de Moura', org: 'UFRJ', sector: 'aca', talk: 'Recifes mesofóticos da Margem Equatorial: da caracterização ao manejo' },
  { name: 'Cláudia Chelala', org: 'UNIFAP', sector: 'aca', talk: 'Impactos e perspectivas socioeconômicas da exploração de petróleo na Margem Equatorial' },
  { name: 'Alberto Garcia de Figueiredo Júnior', org: 'UFF', sector: 'aca', talk: 'Geologia marinha da Margem Equatorial brasileira' },
  { name: 'Carlos Leandro da Silva Júnior', org: 'OceanPact', sector: 'ind', talk: 'Novas tecnologias para o monitoramento meteoceanográfico' },
  { name: 'Marcelo Rollnic', org: 'UFPA', sector: 'aca', talk: 'OCA, Observatório da Costa Amazônica: conectar, catalisar e comunicar' },
  { name: 'Gabriel Clauzet', org: 'Tetra Tech', sector: 'ind', talk: 'Desenvolvimento de uma base hidrodinâmica para a Margem Equatorial' },
  { name: 'Nãnashaira Medeiros', org: 'Petrobras', sector: 'ind', talk: 'Dados ambientais, do papel ao digital (com Carlos A. P. de Senna)' },
  { name: 'Carlos Augusto Portela de Senna', org: 'Petrobras', sector: 'ind', talk: 'Dados ambientais, do papel ao digital (com Nãnashaira Medeiros)' },
  { name: 'Alexandre Guerra', org: 'CENPES', sector: 'ind', talk: 'Medições oceanográficas no âmbito do Projeto REMObs' },
  { name: 'Antônio Henrique da Fontoura Klein', org: 'UFSC', sector: 'aca', talk: 'Plataforma CASSIE-CORE: inversão topo-batimétrica a partir de imagens de satélite' },
  { name: 'Arkley Marques Bandeira', org: 'UFMA', sector: 'aca', talk: 'Arqueologia e antropologia das ocupações humanas na Margem Equatorial' },
  { name: 'Uirá Cavalcante Oliveira', org: 'ANTAQ', sector: 'gov', talk: 'Panorama do transporte aquaviário: infraestrutura, estatísticas e sustentabilidade' },
  { name: 'Josivaldo Freire Reis', org: 'APEM', sector: 'ind', talk: 'A atividade de praticagem na Margem Equatorial' },
  { name: 'Daniela Ferro de Godoy', org: 'Mineral', sector: 'ind', talk: 'Monitoramento de tetrápodes marinhos na Foz do Amazonas' },
  { name: 'Cláudio de Souza Vieira Júnior', org: 'Mineral', sector: 'ind', talk: 'Desafios para estruturar centros de reabilitação de fauna' },
  { name: 'Natilene Brito', org: 'IFMA', sector: 'aca', talk: 'Contaminação por compostos orgânicos emergentes em água do mar' },
  { name: 'Denilson da Silva Bezerra', org: 'UFMA', sector: 'aca', talk: 'Geotecnologias e modelagem computacional para monitorar manguezais do litoral amazônico' },
  { name: 'Francisco C. A. Fonteles Holanda', org: 'UFPA', sector: 'aca', talk: 'Currais de pesca bragantinos, um modelo para os litorais da Margem Equatorial' },
  { name: 'Dioniso de Souza Sampaio', org: 'UFPA', sector: 'aca', talk: 'Extrativismo e maricultura nos maretórios da Margem Equatorial' },
  { name: 'Eduardo Tavares Paes', org: 'UFRA', sector: 'aca', talk: 'Processos biogeofísicos e a produção pesqueira no meta-ecossistema marinho amazônico' },
  { name: 'Ana Silvia Sardinha', org: 'UFRA', sector: 'aca', talk: 'O papel dos centros de reabilitação: estamos preparados?' },
  { name: 'Flávio José de Lima Silva', org: 'UERN', sector: 'aca', talk: 'Importância e resultados da atuação em rede de fauna' },
  { name: 'Cezar Augusto Freire Fernandes', org: 'UFDPar', sector: 'aca', talk: 'Estatística pesqueira do Piauí e coleta de dados de desembarque' },
  { name: 'Claudia Funi', org: 'IEPA', sector: 'gov', talk: 'Caracterização e monitoramento de cetáceos no Amapá' },
  { name: 'Walbert Tavares de Almeida', org: 'SBH', sector: 'ong', talk: 'Hidrografia no Golfão Maranhense: perspectivas e dificuldades' },
  { name: 'José Onofre Nascimento Monteiro', org: 'Aquasis', sector: 'ong', talk: 'Aves costeiras migratórias e suas conexões' },
  { name: 'Vitor Luz Carvalho', org: 'Aquasis', sector: 'ong', talk: 'Fortalecimento da Rede de Encalhes de Mamíferos Aquáticos do Nordeste (REMANE)' },
]
export const credits: { what: string; title: string; author: string; licence: string; url: string }[] = [
  { what: 'Praia do Atalaia', title: 'BrunaBrandao PraiadoAtalaia Salinopolis PA (39316644330)', author: 'Bruna Brandão/MTur', licence: 'domínio público', url: 'https://commons.wikimedia.org/wiki/File:BrunaBrandao_PraiadoAtalaia_Salinopolis_PA_(39316644330).jpg' },
  { what: 'Atalaia na maré baixa', title: 'Atalaia (4034044729)', author: 'Luiz Pantoja', licence: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Atalaia_(4034044729).jpg' },
  { what: 'Igreja Matriz', title: 'Igreja Matriz - panoramio - Guilherme J. Corrêa', author: 'Guilherme J. Corrêa', licence: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Igreja_Matriz_-_panoramio_-_Guilherme_J._Corr%C3%AAa.jpg' },
  { what: 'Guarás', title: 'Scarlet ibis (Eudocimus ruber) roosting', author: 'Charles J. Sharp', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Scarlet_ibis_(Eudocimus_ruber)_roosting.jpg' },
  { what: 'Mangue', title: 'Mangrove roots', author: 'Jonathan Wilkins', licence: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Mangrove_roots.jpg' },
  { what: 'Maiaú', title: 'Maiaú Islands, Maranhão', author: 'Coordenação-Geral de Observação da Terra/INPE', licence: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Maia%C3%BA_Islands,_Maranh%C3%A3o.jpg' },
]

/* ---------- Dúvidas: perguntas fixas, respostas a definir ---------- */
export const faq: [string, string][] = [
  ['Preciso ser da oceanografia para participar?', 'faq-1'],
  ['Posso participar sem apresentar trabalho?', 'faq-2'],
  ['Em qual eixo devo submeter meu resumo?', 'faq-3'],
  ['Haverá certificado?', 'faq-4'],
  ['Como uma empresa pode apoiar o evento?', 'faq-5'],
]

/* ---------- Espaços a preencher ----------
   A ordem desta lista é a numeração que aparece na página ([1], [2] ...).
   Para preencher um item, troque o <Ph id="..."/> correspondente pelo conteúdo final. */
export const PLACEHOLDERS: [string, string][] = [
  ['datas', 'Datas do congresso'],
  ['eixo-central', 'Ementa do eixo central: a indústria de óleo e gás na Margem Equatorial'],
  ...Array.from({ length: 7 }, (_, i): [string, string] => [`eixo-${i + 1}`, 'Eixo temático: título e ementa']),
  ...Array.from({ length: 6 }, (_, i): [string, string] => [`pal-${i + 1}`, 'Palestrante 2027: nome, instituição e tema']),
  ['prog-abertura', 'Conferência de abertura: palestrante e tema'],
  ['prog-sessoes', 'Sessões temáticas: dias, horários e eixos'],
  ['prog-mesas', 'Mesas-redondas: temas e participantes'],
  ['prog-posteres', 'Sessões de pôsteres: dias e local'],
  ['prog-encerramento', 'Encerramento e premiação'],
  ['prog-grade', 'Grade completa por dia, com horários e salas'],
  ['sub-normas', 'Normas de submissão, modelo de resumo e critérios de avaliação'],
  ['sub-prazo', 'Prazo de submissão'],
  ['insc-categorias', 'Categorias de inscrição e valores'],
  ['insc-abertura', 'Abertura das inscrições'],
  ['insc-link', 'Link do sistema de inscrição'],
  ['resultado', 'Resultado da avaliação dos trabalhos'],
  ['local', 'Espaço do evento: nome e endereço'],
  ['contato', 'E-mail e telefone da comissão organizadora'],
  ['realizacao-2027', 'Realização e apoio da edição 2027'],
  ['patrocinio', 'Cotas de patrocínio e contato comercial'],
  ...Array.from({ length: 5 }, (_, i): [string, string] => [`faq-${i + 1}`, 'Resposta da comissão organizadora']),
]
export const ph = (id: string) => {
  const i = PLACEHOLDERS.findIndex(p => p[0] === id)
  if (i < 0) throw new Error('placeholder desconhecido: ' + id)
  return { n: i + 1, label: PLACEHOLDERS[i][1] }
}
