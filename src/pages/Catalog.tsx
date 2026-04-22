/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, ArrowLeft, Package } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { CATALOG, type ProductCategory, type SubCategory } from '@/src/constants';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// ── Animations ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const CHAPA_FILTERS = [
  { id: 'chapa-preta', label: 'Chapa Preta', match: (sub: SubCategory) => sub.name.toLowerCase().includes('preta') },
  { id: 'chapas-galvanizadas', label: 'Galvanizadas', match: (sub: SubCategory) => sub.name.toLowerCase().includes('galvanizada') },
  { id: 'chapas-zinco-zincor', label: 'Zincor / Zinco', match: (sub: SubCategory) => {
    const name = sub.name.toLowerCase();
    return name.includes('zincor') || name.includes('zinco');
  } },
];

// ── Category overview card ────────────────────────────────────────────────────
function CategoryCard({ category, onClick }: { category: ProductCategory; onClick: () => void }) {
  return (
    <motion.button
      variants={fadeUp}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 text-left w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-jrs-green-start"
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={category.image}
          alt={category.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white text-xl font-display font-bold group-hover:text-jrs-green-start transition-colors duration-300">
          {category.name}
        </h3>
        <p className="text-white/70 text-xs mt-1 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
        <div className="mt-3 flex items-center gap-1 text-jrs-green-start text-xs font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          Ver produtos <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </motion.button>
  );
}

// ── Subcategory card – with photo ─────────────────────────────────────────────
function SubCategoryCard({ sub, showCategory }: { sub: SubCategory & { categoryName?: string; categoryId?: string }; showCategory?: boolean }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? sub.sizes : sub.sizes.slice(0, 6);
  const extra = sub.sizes.length - 6;

  if (sub.noPhoto) {
    return <SubCategoryCardCompact sub={sub} showCategory={showCategory} />;
  }

  return (
    <motion.div
      variants={fadeUp}
      layout
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
      onClick={() => navigate(sub.categoryId ? `/produtos/${sub.categoryId}/${sub.id}` : '/contactos')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(sub.categoryId ? `/produtos/${sub.categoryId}/${sub.id}` : '/contactos');
        }
      }}
      role="link"
      tabIndex={0}
    >
      {/* Image */}
      <div className="aspect-[16/9] overflow-hidden bg-slate-100 relative flex-shrink-0">
        <img
          src={sub.image}
          alt={sub.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[10px] font-bold text-slate-600 px-2.5 py-1 rounded-full shadow-sm">
          {sub.unit}
        </span>
        {showCategory && sub.categoryName && (
          <span className="absolute top-3 left-3 bg-jrs-green-start text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {sub.categoryName}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-display font-bold text-slate-900 group-hover:text-jrs-green-start transition-colors duration-300 mb-1.5 leading-snug">
          {sub.name}
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-1">{sub.description}</p>

        <SizeChips sizes={sub.sizes} visible={visible} extra={extra} expanded={expanded} onToggle={() => setExpanded(e => !e)} />

        <div className="mt-5 pt-4 border-t border-slate-100">
          <Button className="w-full bg-slate-900 hover:bg-jrs-green-start text-white rounded-xl h-10 text-sm font-medium transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" asChild>
            <Link to={sub.categoryId ? `/produtos/${sub.categoryId}/${sub.id}` : '/contactos'} onClick={(e) => e.stopPropagation()}>
              Ver Detalhes
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Compact card (no photo) ───────────────────────────────────────────────────
function SubCategoryCardCompact({ sub, showCategory }: { sub: SubCategory & { categoryName?: string; categoryId?: string }; showCategory?: boolean }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? sub.sizes : sub.sizes.slice(0, 8);
  const extra = sub.sizes.length - 8;

  return (
    <motion.div
      variants={fadeUp}
      layout
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group border border-slate-100 cursor-pointer"
      onClick={() => navigate(sub.categoryId ? `/produtos/${sub.categoryId}/${sub.id}` : '/contactos')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(sub.categoryId ? `/produtos/${sub.categoryId}/${sub.id}` : '/contactos');
        }
      }}
      role="link"
      tabIndex={0}
    >
      {/* Colored top bar */}
      <div className="h-1.5 bg-gradient-to-r from-jrs-green-start to-jrs-green-end" />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-display font-bold text-slate-900 group-hover:text-jrs-green-start transition-colors duration-300 leading-snug">
            {sub.name}
          </h3>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{sub.unit}</span>
            {showCategory && sub.categoryName && (
              <span className="text-[10px] bg-jrs-green-start/10 text-jrs-green-start font-semibold px-2 py-0.5 rounded-full">{sub.categoryName}</span>
            )}
          </div>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed mb-3 flex-1">{sub.description}</p>

        <SizeChips sizes={sub.sizes} visible={visible} extra={extra} expanded={expanded} onToggle={() => setExpanded(e => !e)} />

        <div className="mt-4 pt-3 border-t border-slate-100">
          <Button className="w-full bg-slate-900 hover:bg-jrs-green-start text-white rounded-xl h-9 text-xs font-medium transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" asChild>
            <Link to={sub.categoryId ? `/produtos/${sub.categoryId}/${sub.id}` : '/contactos'} onClick={(e) => e.stopPropagation()}>
              Ver Detalhes
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Size chips ────────────────────────────────────────────────────────────────
function SizeChips({ sizes, visible, extra, expanded, onToggle }: {
  sizes: string[];
  visible: string[];
  extra: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (sizes.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-2">
        Medidas Disponíveis
      </p>
      <div className="flex flex-wrap gap-1">
        {visible.map(size => (
          <span key={size} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/60 font-mono">
            {size}
          </span>
        ))}
        {!expanded && extra > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="cursor-pointer text-[10px] bg-jrs-green-start/5 text-jrs-green-start px-2 py-0.5 rounded border border-jrs-green-start/20 font-mono font-semibold hover:bg-jrs-green-start/10 transition-colors"
          >
            +{extra} mais
          </button>
        )}
        {expanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="cursor-pointer text-[10px] text-slate-400 px-2 py-0.5 rounded border border-slate-200/60 font-mono hover:bg-slate-50 transition-colors"
          >
            menos
          </button>
        )}
      </div>
    </div>
  );
}

// ── Grouped section renderer ──────────────────────────────────────────────────
function GroupedSubcategories({ subcategories, showCategory }: {
  subcategories: (SubCategory & { categoryName?: string; categoryId?: string })[];
  showCategory?: boolean;
}) {
  // Build ordered groups preserving original order
  const groupOrder: string[] = [];
  const grouped: Record<string, (SubCategory & { categoryName?: string })[]> = {};

  subcategories.forEach(sub => {
    const g = sub.group ?? '__ungrouped__';
    if (!grouped[g]) {
      grouped[g] = [];
      groupOrder.push(g);
    }
    grouped[g].push(sub);
  });

  const hasGroups = groupOrder.some(g => g !== '__ungrouped__') && groupOrder.length > 1;

  if (!hasGroups) {
    return (
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {subcategories.map(sub => <SubCategoryCard key={sub.id} sub={sub} showCategory={showCategory} />)}
      </motion.div>
    );
  }

  return (
    <div className="space-y-12">
      {groupOrder.map(group => {
        const subs = grouped[group];
        const label = group === '__ungrouped__' ? null : group;
        return (
          <motion.section
            key={group}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {label && (
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-display font-bold text-slate-800">{label}</h2>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">{subs.length} produto{subs.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {subs.map(sub => <SubCategoryCard key={sub.id} sub={sub} showCategory={showCategory} />)}
            </motion.div>
          </motion.section>
        );
      })}
    </div>
  );
}

// ── Main Catalog page ─────────────────────────────────────────────────────────
export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('categoria');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const nextCategoryId = CATALOG.some(category => category.id === categoryParam) ? categoryParam : null;
    setSelectedCategoryId(prev => {
      if (prev !== nextCategoryId) {
        setSelectedSubcategoryId(null);
      }
      return nextCategoryId;
    });
  }, [categoryParam]);

  const selectedCategory = CATALOG.find(c => c.id === selectedCategoryId) ?? null;
  const isSearching = searchTerm.trim().length > 0;

  const globalSearchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase();
    return CATALOG.flatMap(cat =>
      cat.subcategories
        .filter(sub =>
          sub.name.toLowerCase().includes(term) ||
          sub.description.toLowerCase().includes(term) ||
          cat.name.toLowerCase().includes(term)
        )
        .map(sub => ({ ...sub, categoryName: cat.name, categoryId: cat.id }))
    );
  }, [searchTerm]);

  const displayedSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const enrich = (s: SubCategory) => ({ ...s, categoryId: selectedCategory.id, categoryName: selectedCategory.name });
    if (selectedSubcategoryId) {
      if (selectedCategory.id === 'chapas') {
        const chapaFilter = CHAPA_FILTERS.find(filter => filter.id === selectedSubcategoryId);
        if (chapaFilter) {
          return selectedCategory.subcategories.filter(chapaFilter.match).map(enrich);
        }
      }
      return selectedCategory.subcategories.filter(s => s.id === selectedSubcategoryId).map(enrich);
    }
    return selectedCategory.subcategories.map(enrich);
  }, [selectedCategory, selectedSubcategoryId]);

  const handleCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
    setSearchTerm('');
    setSearchParams({ categoria: id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-jrs-cream py-12">
      <div className="container px-4 md:px-6">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 h-6">
            <AnimatePresence mode="wait">
              {selectedCategory && !isSearching ? (
                <motion.div key="bc" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="flex items-center gap-2">
                  <button onClick={handleBack} className="flex cursor-pointer items-center gap-1.5 text-jrs-green-start hover:text-jrs-green-end font-semibold transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Todos os Produtos
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-slate-700 font-semibold">{selectedCategory.name}</span>
                </motion.div>
              ) : (
                <motion.span key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 text-xs">
                  Catálogo de Produtos
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Title + search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight mb-2">
                {isSearching ? 'Resultados' : selectedCategory ? selectedCategory.name : 'Catálogo de Produtos'}
              </h1>
              <p className="text-slate-500 text-base leading-relaxed">
                {isSearching
                  ? `${globalSearchResults?.length ?? 0} resultado(s) para "${searchTerm}"`
                  : selectedCategory
                  ? selectedCategory.description
                  : 'Selecione uma categoria para explorar os nossos produtos ou pesquise directamente.'}
              </p>
            </div>
            <div className="relative w-full md:w-80 lg:w-96 flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Pesquisar produtos..."
                className="pl-11 h-12 bg-white border-none shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-jrs-green-start/40 rounded-full text-sm transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">✕</button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Search results ── */}
        {isSearching && (
          <AnimatePresence mode="wait">
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {globalSearchResults && globalSearchResults.length > 0 ? (
                <GroupedSubcategories subcategories={globalSearchResults} showCategory />
              ) : (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="text-center py-24 bg-white/60 rounded-3xl border border-dashed border-slate-300"
                >
                  <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-display font-bold text-slate-700 mb-2">Sem resultados</h3>
                  <p className="text-slate-400 text-sm mb-5 max-w-xs mx-auto">Não encontrámos produtos para "{searchTerm}". Tente outros termos.</p>
                  <Button onClick={() => setSearchTerm('')} className="bg-jrs-green-start hover:bg-jrs-green-end text-white rounded-full px-8">
                    Limpar pesquisa
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Category overview ── */}
        {!isSearching && !selectedCategory && (
          <AnimatePresence mode="wait">
            <motion.div key="overview" variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {CATALOG.map(cat => (
                <CategoryCard key={cat.id} category={cat} onClick={() => handleCategorySelect(cat.id)} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Category detail ── */}
        {!isSearching && selectedCategory && (
          <AnimatePresence mode="wait">
            <motion.div key={selectedCategory.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* Subcategory filter pills */}
              {selectedCategory.subcategories.length > 1 && (
                <div className="flex overflow-x-auto pb-3 gap-2 mb-8 -mx-4 px-4 scrollbar-hide">
                    <button
                      onClick={() => setSelectedSubcategoryId(null)}
                      className={`whitespace-nowrap flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm cursor-pointer ${selectedSubcategoryId === null ? 'bg-jrs-green-start text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      Todos ({selectedCategory.subcategories.length})
                    </button>
                  {(selectedCategory.id === 'chapas' ? CHAPA_FILTERS : selectedCategory.subcategories).map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategoryId(sub.id === selectedSubcategoryId ? null : sub.id)}
                      className={`whitespace-nowrap flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm cursor-pointer ${selectedSubcategoryId === sub.id ? 'bg-jrs-green-start text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      {'label' in sub ? sub.label : sub.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Grouped product cards */}
              <GroupedSubcategories subcategories={displayedSubcategories} />

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-16 bg-white rounded-3xl p-8 md:p-10 text-center shadow-sm"
              >
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Não encontrou o que procura?</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                  Temos um vasto stock. Contacte-nos para verificar disponibilidade ou solicitar medidas específicas.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-jrs-green-start hover:bg-jrs-green-end text-white rounded-full px-10 h-12 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" asChild>
                    <Link to="/contactos">Falar Connosco</Link>
                  </Button>
                  <Button onClick={handleBack} variant="outline" className="rounded-full px-10 h-12 font-semibold border-slate-200 hover:border-slate-300 transition-all">
                    Ver outras categorias
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </div>
  );
}
