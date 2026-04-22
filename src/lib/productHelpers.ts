import { CATALOG, type SubCategory, type ProductCategory } from '@/src/constants';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProductMeta {
  material: string;
  finish: string;
  norm: string | null;
  standardLength: string | null;
  applications: string[];
}

export type SizeDisplayMode = 'flat' | 'grouped';

export interface SizeGroup {
  base: string;
  variants: string[];
}

export interface ParsedSizes {
  mode: SizeDisplayMode;
  groups: SizeGroup[]; // for grouped: [{base:"40×40", variants:["2","3","4"]}]
  // for flat: [{base:"HEA 100", variants:[]}]
}

// ── Category / product lookup ─────────────────────────────────────────────────

export function getCategoryById(categoryId: string): ProductCategory | undefined {
  return CATALOG.find(c => c.id === categoryId);
}

export function getSubcategoryById(categoryId: string, subcategoryId: string): SubCategory | undefined {
  return getCategoryById(categoryId)?.subcategories.find(s => s.id === subcategoryId);
}

// ── Product metadata (specs + applications) ───────────────────────────────────

export function getProductMeta(categoryId: string, subcategoryId: string): ProductMeta {
  // Barras
  if (categoryId === 'barras') {
    if (subcategoryId === 'barra-quadrada') return {
      material: 'Aço S235JR', norm: 'EN 10058', finish: 'Preto – laminado a quente',
      standardLength: '6 m',
      applications: ['Serralharia artística', 'Construção metálica', 'Peças mecânicas', 'Grades e vedações', 'Mobiliário industrial'],
    };
    if (subcategoryId === 'barra-rectangular') return {
      material: 'Aço S235JR', norm: 'EN 10058', finish: 'Preto – laminado a quente',
      standardLength: '6 m',
      applications: ['Serralharia', 'Suportes e cavaletes', 'Reforços estruturais', 'Mobiliário industrial', 'Construção metálica'],
    };
    if (subcategoryId === 'barra-t') return {
      material: 'Aço S235JR', norm: 'EN 10055', finish: 'Preto',
      standardLength: '6 m',
      applications: ['Reforço estrutural', 'Suportes em T', 'Construção naval', 'Serralharia industrial'],
    };
    if (subcategoryId === 'barra-u') return {
      material: 'Aço S235JR', norm: 'EN 10162', finish: 'Preto',
      standardLength: '6 m',
      applications: ['Caleiras e guias', 'Reforços em U', 'Construção metálica', 'Perfis de suporte'],
    };
    if (subcategoryId === 'varao-redondo-serralharia') return {
      material: 'Aço S235JR', norm: 'EN 10060', finish: 'Preto – laminado a quente',
      standardLength: '6 m',
      applications: ['Gradeamentos e vedações', 'Serralharia artística', 'Eixos e pinos', 'Barras de reforço decorativas'],
    };
    return { material: 'Aço S235JR', norm: 'EN 10058', finish: 'Preto', standardLength: '6 m', applications: ['Serralharia', 'Construção metálica'] };
  }

  // Perfis estruturais
  if (categoryId === 'perfis') {
    const base = { material: 'Aço S235JR / S355JR', norm: 'EN 10025 + EN 10034', finish: 'Preto – laminado a quente', standardLength: '12 m' };
    if (subcategoryId === 'hea') return { ...base, applications: ['Pilares e vigas', 'Estruturas metálicas', 'Naves industriais', 'Pontes e viadutos', 'Construção civil pesada'] };
    if (subcategoryId === 'heb') return { ...base, applications: ['Estruturas de grande carga', 'Pilares principais', 'Construção industrial pesada', 'Plataformas offshore'] };
    if (subcategoryId === 'ipe') return { ...base, applications: ['Vigas principais e secundárias', 'Coberturas metálicas', 'Pavimentos e mezanines', 'Passadiços', 'Construção metálica em geral'] };
    if (subcategoryId === 'ipn') return { ...base, applications: ['Vigas e travessas', 'Estruturas de suporte clássicas', 'Construção civil', 'Reforço em betão'] };
    if (subcategoryId === 'upn') return { ...base, applications: ['Calhas e guias', 'Vigas secundárias', 'Suportes de cobertura', 'Estruturas de painel', 'Bancadas industriais'] };
    return { ...base, applications: ['Estruturas metálicas', 'Construção civil'] };
  }

  // Cantoneiras
  if (categoryId === 'cantoneiras') {
    if (subcategoryId === 'cantoneira-igual') return {
      material: 'Aço S235JR', norm: 'EN 10056-1', finish: 'Preto – laminado a quente',
      standardLength: '6 m',
      applications: ['Reforço estrutural em ângulo', 'Suportes e esquadrias', 'Estruturas de armários e estantes', 'Serralharia', 'Construção civil'],
    };
    if (subcategoryId === 'cantoneira-desigual') return {
      material: 'Aço S235JR', norm: 'EN 10056-1', finish: 'Preto – laminado a quente',
      standardLength: '6 m',
      applications: ['Ligações assimétricas', 'Reforços de ângulo especial', 'Construção metálica', 'Suportes de cobertura com inclinação'],
    };
    return { material: 'Aço S235JR', norm: 'EN 10056-1', finish: 'Preto', standardLength: '6 m', applications: ['Serralharia', 'Construção metálica'] };
  }

  // Tubos
  if (categoryId === 'tubos') {
    if (subcategoryId === 'tubo-quadrado-preto') return {
      material: 'Aço S235JR', norm: 'EN 10219 / EN 10210', finish: 'Preto – sem tratamento',
      standardLength: '6 m',
      applications: ['Portões e vedações', 'Gradeamentos', 'Estruturas metálicas', 'Mobiliário industrial', 'Corrimãos e guardas', 'Suportes e cavaletes'],
    };
    if (subcategoryId === 'tubo-quadrado-galv') return {
      material: 'Aço S235JR + galvanização', norm: 'EN 10219 / EN ISO 1461', finish: 'Galvanizado a quente',
      standardLength: '6 m',
      applications: ['Vedações e cercas exteriores', 'Portões', 'Estruturas em ambiente húmido', 'Agricultura e espaços rurais', 'Obras públicas'],
    };
    if (subcategoryId === 'tubo-rectangular-preto') return {
      material: 'Aço S235JR', norm: 'EN 10219 / EN 10210', finish: 'Preto – sem tratamento',
      standardLength: '6 m',
      applications: ['Estruturas metálicas', 'Mobiliário metálico', 'Portões deslizantes', 'Suportes e travamentos', 'Vedações industriais'],
    };
    if (subcategoryId === 'tubo-rectangular-galv') return {
      material: 'Aço S235JR + galvanização', norm: 'EN 10219 / EN ISO 1461', finish: 'Galvanizado a quente',
      standardLength: '6 m',
      applications: ['Estruturas exteriores', 'Vedações rurais', 'Obras públicas', 'Construção modular'],
    };
    if (subcategoryId === 'tubo-redondo-preto') return {
      material: 'Aço S235JR', norm: 'EN 10210 / EN 10219', finish: 'Preto',
      standardLength: '6 m',
      applications: ['Corrimãos e guardas', 'Serralharia artística', 'Estruturas circulares', 'Eixos e veios', 'Decoração em ferro'],
    };
    if (subcategoryId === 'tubo-redondo-galv') return {
      material: 'Aço S235JR + galvanização', norm: 'EN 10219 / EN ISO 1461', finish: 'Galvanizado a quente',
      standardLength: '6 m',
      applications: ['Corrimãos exteriores', 'Estruturas de jardim', 'Postes e suportes', 'Obras públicas'],
    };
    if (subcategoryId === 'tubo-galv-ligeira' || subcategoryId === 'tubo-galv-media') return {
      material: 'Aço galvanizado com rosca', norm: 'EN 10255 / EN ISO 228', finish: 'Galvanizado',
      standardLength: '6 m',
      applications: ['Instalações de gás', 'Redes de água', 'Condutas industriais', 'AVAC', 'Redes de pressão'],
    };
    if (subcategoryId === 'tubo-preto-ligeira' || subcategoryId === 'tubo-preto-media') return {
      material: 'Aço preto com rosca', norm: 'EN 10255', finish: 'Preto',
      standardLength: '6 m',
      applications: ['Redes de gás e água', 'Condutas industriais', 'Sistemas hidráulicos'],
    };
    if (subcategoryId === 'tubo-ft') return {
      material: 'Aço com abas', norm: null, finish: 'Preto / Galvanizado',
      standardLength: '6 m',
      applications: ['Sistemas de vedação com painéis', 'Alambrado', 'Campos desportivos', 'Perímetros industriais'],
    };
    if (subcategoryId === 'tubo-calhe') return {
      material: 'Aço laminado', norm: null, finish: 'Preto / Galvanizado',
      standardLength: '6 m',
      applications: ['Portões deslizantes', 'Calhas de guia', 'Sistemas de automação de portões'],
    };
    if (subcategoryId === 'tubo-corrimao') return {
      material: 'Aço', norm: null, finish: 'Preto',
      standardLength: '6 m',
      applications: ['Corrimãos de escadas interiores e exteriores', 'Guardas de varanda'],
    };
    if (subcategoryId === 'curvas-tubo') return {
      material: 'Ferro fundido / Aço', norm: 'EN 10241', finish: 'Preto / Galvanizado',
      standardLength: null,
      applications: ['Redes de tubagem', 'Instalações de gás e água', 'Condutas industriais', 'Derivações'],
    };
    return { material: 'Aço', norm: null, finish: 'Conforme especificação', standardLength: '6 m', applications: ['Construção metálica', 'Serralharia'] };
  }

  // Chapas
  if (categoryId === 'chapas') {
    if (subcategoryId === 'chapa-preta') return {
      material: 'Aço S235JR / S355', norm: 'EN 10025 / EN 10051', finish: 'Laminado a quente',
      standardLength: null,
      applications: ['Estruturas e equipamentos pesados', 'Reservatórios e tanques', 'Maquinaria', 'Reforços estruturais', 'Pavimentos industriais', 'Construção naval'],
    };
    if (subcategoryId === 'chapa-galv-lisa') return {
      material: 'Aço DX51D galvanizado', norm: 'EN 10346', finish: 'Galvanizado por imersão a quente',
      standardLength: null,
      applications: ['Coberturas e fachadas', 'Canalizações e condutas', 'Construção em seco', 'Vedações', 'Electrodomésticos'],
    };
    if (subcategoryId === 'chapa-galv-ondulada') return {
      material: 'Aço galvanizado perfilado', norm: 'EN 13964', finish: 'Galvanizado',
      standardLength: null,
      applications: ['Coberturas de armazéns e naves', 'Alpendres e cocheiras', 'Vedações', 'Revestimentos de parede'],
    };
    if (subcategoryId === 'chapa-gotas') return {
      material: 'Aço S235JR', norm: 'EN 10025', finish: 'Laminado a quente – relevo em gota',
      standardLength: null,
      applications: ['Pisos e passadiços', 'Escadas e patamares', 'Plataformas industriais', 'Rampas de acesso'],
    };
    if (subcategoryId === 'chapa-xadrez') return {
      material: 'Aço S235JR', norm: 'EN 10025', finish: 'Relevo xadrez – anti-derrapante',
      standardLength: null,
      applications: ['Pisos e escadas', 'Rampas', 'Veículos e reboques', 'Maquinaria agrícola', 'Obras públicas'],
    };
    if (subcategoryId === 'chapa-zincor') return {
      material: 'Aço com revestimento Zn-Al (Zincor)', norm: 'EN 10346', finish: 'Revestimento Zincor',
      standardLength: null,
      applications: ['Coberturas em ambiente húmido', 'Fachadas ventiladas', 'Construção rural', 'Alta resistência à corrosão'],
    };
    if (subcategoryId === 'chapa-fibra-vidro') return {
      material: 'Fibra de vidro (GRP)', norm: null, finish: 'Translúcida',
      standardLength: null,
      applications: ['Coberturas translúcidas', 'Claraboias', 'Marquises e alpendres', 'Paredes e divisórias', 'Estufas'],
    };
    if (subcategoryId === 'chapa-polida') return {
      material: 'Aço laminado a frio', norm: 'EN 10130', finish: 'Polido – superfície lisa',
      standardLength: null,
      applications: ['Peças de precisão', 'Componentes de maquinaria', 'Indústria automóvel', 'Electrodomésticos'],
    };
    if (subcategoryId === 'chapa-zinco-vermelha') return {
      material: 'Zinco com pigmento vermelho', norm: null, finish: 'Vermelho',
      standardLength: null,
      applications: ['Coberturas decorativas', 'Revestimentos externos', 'Construção tradicional'],
    };
    if (subcategoryId === 'chapa-canelada') return {
      material: 'Aço galvanizado perfilado', norm: null, finish: 'Canelado galvanizado',
      standardLength: null,
      applications: ['Coberturas tradicionais', 'Revestimentos de parede', 'Alpendres'],
    };
    if (subcategoryId === 'chapa-antiderrapante-alum') return {
      material: 'Alumínio', norm: null, finish: 'Anti-derrapante',
      standardLength: null,
      applications: ['Escadas e pisos interiores', 'Veículos e barcos', 'Rampas leves', 'Plataformas'],
    };
    return { material: 'Aço', norm: 'EN 10025', finish: 'Conforme especificação', standardLength: null, applications: ['Construção metálica', 'Serralharia', 'Indústria'] };
  }

  // Construção Civil
  if (categoryId === 'construcao-civil') {
    if (subcategoryId === 'varao-betao-a400') return {
      material: 'Aço A400 NR', norm: 'NP EN 10080', finish: 'Nervurado',
      standardLength: '12 m',
      applications: ['Betão armado residencial', 'Fundações', 'Lajes e pilares', 'Muros de suporte', 'Obras correntes'],
    };
    if (subcategoryId === 'varao-betao-a500') return {
      material: 'Aço A500 NR', norm: 'NP EN 10080', finish: 'Nervurado',
      standardLength: '12 m',
      applications: ['Betão armado de alta resistência', 'Estruturas sísmicas', 'Grandes obras de engenharia civil'],
    };
    if (subcategoryId === 'malhasol') return {
      material: 'Aço electrossoldado', norm: 'NP EN 10080', finish: 'Electrossoldado',
      standardLength: null,
      applications: ['Lajes de pavimento', 'Muros de betão', 'Pré-fabricados', 'Pisos industriais', 'Pavimentos'],
    };
    if (subcategoryId === 'gradil-galv') return {
      material: 'Aço galvanizado', norm: 'EN 10223', finish: 'Galvanizado',
      standardLength: null,
      applications: ['Vedações de propriedades', 'Jardins e parques', 'Obras públicas', 'Perímetros industriais e escolares'],
    };
    if (subcategoryId === 'arame-recozido') return {
      material: 'Aço recozido', norm: null, finish: 'Recozido',
      standardLength: null,
      applications: ['Amarração de varão', 'Construção civil', 'Cofragens', 'Fixações temporárias'],
    };
    return { material: 'Conforme especificação', norm: null, finish: 'Conforme especificação', standardLength: null, applications: ['Construção civil'] };
  }

  // Vedação e grelhas
  if (categoryId === 'vedacao-grelhas') {
    return {
      material: 'Aço galvanizado', norm: 'EN 124', finish: 'Galvanizado',
      standardLength: null,
      applications: ['Sumidouros e caleiras de rua', 'Drenagem urbana', 'Indústria', 'Parques de estacionamento'],
    };
  }

  // Acessórios
  if (categoryId === 'acessorios') {
    if (subcategoryId === 'rodizios') return { material: 'Aço / Nylon', norm: null, finish: 'Conforme modelo', standardLength: null, applications: ['Portões deslizantes', 'Automação de portões', 'Estruturas móveis'] };
    if (subcategoryId === 'roldanas') return { material: 'Aço / Ferro fundido', norm: null, finish: 'Preto / Com aro', standardLength: null, applications: ['Sistemas de portão', 'Elevação e tração', 'Guias de cabo'] };
    if (subcategoryId === 'eletrodos') return { material: 'Eléctrodo revestido', norm: 'EN ISO 2560', finish: 'Revestido', standardLength: null, applications: ['Soldadura por arco', 'Serralharia', 'Construção metálica', 'Reparações'] };
    if (subcategoryId === 'grampos') return { material: 'Aço', norm: null, finish: 'Conforme produto', standardLength: null, applications: ['Fixações', 'Serralharia', 'Obras e reparações'] };
    if (subcategoryId === 'pregos') return { material: 'Aço', norm: null, finish: 'Conforme produto', standardLength: null, applications: ['Fixações', 'Construção civil', 'Carpintaria de apoio'] };
    if (subcategoryId === 'pas-de-bico-dkv') return { material: 'Aço / Cabo conforme modelo', norm: null, finish: 'Conforme produto', standardLength: null, applications: ['Trabalhos em obra', 'Movimentação de inertes', 'Apoio à construção'] };
    return { material: 'Conforme produto', norm: null, finish: 'Conforme produto', standardLength: null, applications: ['Serralharia', 'Construção metálica'] };
  }

  return { material: 'Aço', norm: null, finish: 'Conforme especificação', standardLength: null, applications: ['Construção metálica', 'Serralharia'] };
}

// ── Size parsing ──────────────────────────────────────────────────────────────

function countChar(str: string, char: string): number {
  return (str.match(new RegExp(char, 'g')) || []).length;
}

export function parseSizes(sizes: string[]): ParsedSizes {
  if (sizes.length === 0) return { mode: 'flat', groups: [] };

  // Count sizes with × separator
  const withCross = sizes.filter(s => s.includes('×'));
  const crossRatio = withCross.length / sizes.length;

  if (crossRatio < 0.5 || sizes.length <= 15) {
    // Flat: simple list (HEA/HEB/IPE, rebar NR, pipe threads, short lists)
    return {
      mode: 'flat',
      groups: sizes.map(s => ({ base: s, variants: [] })),
    };
  }

  // Determine if triple (W×H×T) or double (W×T)
  const tripleCount = withCross.filter(s => countChar(s, '×') === 2).length;
  const isTriple = tripleCount / withCross.length > 0.5;

  const groupMap = new Map<string, string[]>();
  const order: string[] = [];

  for (const size of sizes) {
    if (!size.includes('×')) {
      // flat fallback for mixed lists
      const k = size;
      if (!groupMap.has(k)) { groupMap.set(k, []); order.push(k); }
      continue;
    }

    const parts = size.split('×').map(p => p.trim());

    let base: string;
    let variant: string;

    if (isTriple && parts.length >= 3) {
      base = `${parts[0]}×${parts[1]}`;
      variant = parts[2];
    } else {
      base = parts[0];
      variant = parts.slice(1).join('×');
    }

    if (!groupMap.has(base)) { groupMap.set(base, []); order.push(base); }
    groupMap.get(base)!.push(variant);
  }

  return {
    mode: 'grouped',
    groups: order.map(base => ({ base, variants: groupMap.get(base)! })),
  };
}

// ── Related products ──────────────────────────────────────────────────────────

const CROSS_AFFINITY: Record<string, string[]> = {
  tubos: ['perfis', 'chapas', 'barras'],
  perfis: ['tubos', 'barras', 'cantoneiras'],
  barras: ['cantoneiras', 'perfis', 'tubos'],
  cantoneiras: ['barras', 'perfis'],
  chapas: ['tubos', 'barras'],
  'construcao-civil': ['barras', 'vedacao-grelhas'],
  'vedacao-grelhas': ['tubos', 'construcao-civil'],
  acessorios: ['tubos', 'vedacao-grelhas'],
};

export function getRelatedProducts(
  categoryId: string,
  subcategoryId: string,
  maxItems = 4
): (SubCategory & { categoryId: string; categoryName: string })[] {
  const scored: { sub: SubCategory & { categoryId: string; categoryName: string }; score: number }[] = [];

  const currentCat = getCategoryById(categoryId);
  const currentSub = getSubcategoryById(categoryId, subcategoryId);
  if (!currentCat || !currentSub) return [];

  const relatedCategoryIds = CROSS_AFFINITY[categoryId] ?? [];

  for (const cat of CATALOG) {
    for (const sub of cat.subcategories) {
      if (sub.id === subcategoryId) continue; // skip self

      let score = 0;

      if (cat.id === categoryId) {
        // Same category
        if (sub.group && sub.group === currentSub.group) score += 3; // same group
        else score += 2; // same category
      } else if (relatedCategoryIds.includes(cat.id)) {
        score += 1; // cross-category affinity
      } else {
        continue; // no relevance
      }

      // Same unit bonus
      if (sub.unit === currentSub.unit) score += 1;

      scored.push({ sub: { ...sub, categoryId: cat.id, categoryName: cat.name }, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map(s => s.sub);
}
