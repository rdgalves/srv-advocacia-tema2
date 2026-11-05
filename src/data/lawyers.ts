export type Professional = {
  name: string;
  slug: string;
  role: string;
  oab?: string;
  areas: string[];
  bio: string;
  education: string[];
  experience: string[];
  languages: string[];
  lattes?: string;
  linkedin?: string;
  image: string;
};

export const lawyers: Professional[] = [
  {
    name: "Salomão Rezende Veloso",
    slug: "salomao-rezende-veloso",
    role: "Advogado fundador",
    oab: "OAB/DF 72.358",
    areas: ["Direito Civil / Contencioso Cível", "Direito Tributário", "Direito Penal Econômico", "Direito Societário"],
    bio: "Fundador do escritório em 2022, atua com assessoria jurídica estratégica e individualizada, mantendo contato próximo com o cliente e atenção à demanda real de cada caso.",
    education: ["Mestrando em Direito Tributário pelo IDP", "Pós-graduado em Direito Eleitoral pela UFMA (2019–2020)", "Bacharel em Direito pela Universidade CEUMA (2013–2018)"],
    experience: ["Assessor Jurídico no Município de São José de Ribamar/MA (2021–2022)", "Advocacia autônoma em São Luís/MA (2018–2022)"],
    languages: ["Inglês — intermediário", "Espanhol — intermediário"],
    lattes: "https://lattes.cnpq.br/5772833388603328",
    linkedin: "https://linkedin.com/in/salom%C3%A3o-veloso-2192b2373",
    image: "/salomao-rezende-veloso.jpg",
  },
  {
    name: "Samuel Sales Freire Alves",
    slug: "samuel-sales-freire-alves",
    role: "Advogado",
    oab: "OAB/DF 83.869",
    areas: ["Direito Civil", "Processo Civil"],
    bio: "Advogado com formação pela Universidade de Brasília e experiência em representação institucional, associativismo empresarial e pesquisa científica premiada nacional e internacionalmente.",
    education: ["Pós-graduado em Direito Civil e Processo Civil", "Bacharel em Direito pela Universidade de Brasília (UnB)"],
    experience: [
      "Membro da Comissão de Assuntos Constitucionais da OAB-DF",
      "Ex-presidente da Associação dos Jovens Empresários do Distrito Federal (AJE-DF, 2022–2023)",
      "Ex-conselheiro da Confederação Nacional de Jovens Empresários (CONAJE, 2022–2023)",
      "Pesquisador de Iniciação Científica, com premiações nacionais e internacionais",
    ],
    languages: ["Inglês — intermediário", "Espanhol — avançado"],
    lattes: "http://lattes.cnpq.br/0751200665562418",
    linkedin: "https://www.linkedin.com/in/samuel-sales-a55125204",
    image: "/samuel-sales-freire-alves.jpg",
  },
  {
    name: "Maria Luiza Garcia Ataides",
    slug: "maria-luiza-garcia-ataides",
    role: "Estagiária",
    areas: [],
    bio: "Graduanda em Direito pela Universidade de Brasília (UnB), integra a equipe do escritório como estagiária.",
    education: ["Graduanda em Direito pela Universidade de Brasília (UnB)"],
    experience: [],
    languages: [],
    image: "/maria-luiza-garcia-ataides.jpg",
  },
];
