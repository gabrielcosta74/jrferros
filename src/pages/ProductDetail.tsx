/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Phone,
  MessageSquare,
  Package2,
  Ruler,
  ShieldCheck,
  CheckCircle2,
  Info,
  Check,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { COMPANY_INFO, type SubCategory } from '@/src/constants';
import {
  getCategoryById,
  getSubcategoryById,
  getProductMeta,
  parseSizes,
  getRelatedProducts,
  type ParsedSizes,
} from '@/src/lib/productHelpers';

// ── Animations ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 18 } },
};

// ── Spec tile ─────────────────────────────────────────────────────────────────
function SpecTile({ label, value, icon }: { label: string; value: string | null; icon: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100/60 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-jrs-green-start/30 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-jrs-green-start">{icon}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800 leading-snug mt-1">{value}</p>
    </div>
  );
}

// ── Related product card ───────────────────────────────────────────────────────
function RelatedCard({ sub }: { sub: SubCategory & { categoryId: string; categoryName: string } }) {
  return (
    <Link to={`/produtos/${sub.categoryId}/${sub.id}`} className="flex-shrink-0 w-48 group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 hover:border-jrs-green-start/40">
        {sub.noPhoto ? (
          <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 20px)'}} />
            <Package2 className="h-8 w-8 text-slate-500 relative z-10" />
          </div>
        ) : (
          <div className="h-32 overflow-hidden relative">
            <img
              src={sub.image}
              alt={sub.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
             <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
          </div>
        )}
        <div className="p-4">
          <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">{sub.categoryName}</p>
          <p className="text-sm font-bold font-display text-slate-800 group-hover:text-jrs-green-start transition-colors leading-snug line-clamp-2">
            {sub.name}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Main ProductDetail page ───────────────────────────────────────────────────
export function ProductDetail() {
  const { categoryId = '', subcategoryId = '' } = useParams<{ categoryId: string; subcategoryId: string }>();
  
  // Interaction State
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const category = getCategoryById(categoryId);
  const sub = getSubcategoryById(categoryId, subcategoryId);

  // Reset selection when changing product
  useEffect(() => {
    setSelectedBase(null);
    setSelectedVariant(null);
  }, [subcategoryId]);

  if (!category || !sub) {
    return (
      <div className="min-h-screen bg-jrs-cream flex flex-col items-center justify-center gap-4 px-4">
        <Package2 className="h-16 w-16 text-slate-300" />
        <h1 className="text-2xl font-display font-bold text-slate-700">Produto não encontrado</h1>
        <p className="text-slate-500 text-center max-w-sm">
          O produto que procura não existe no nosso catálogo.
        </p>
        <Button asChild className="bg-jrs-green-start hover:bg-jrs-green-end text-white rounded-full px-8">
          <Link to="/produtos">Ver Catálogo</Link>
        </Button>
      </div>
    );
  }

  const meta = getProductMeta(categoryId, subcategoryId);
  const parsedSizes = parseSizes(sub.sizes);
  const related = getRelatedProducts(categoryId, subcategoryId, 6);

  // Derive final selected dimension text
  let selectedDimensionText = '';
  if (parsedSizes.mode === 'grouped' && selectedBase) {
    selectedDimensionText = selectedVariant ? `${selectedBase} × ${selectedVariant}` : `${selectedBase} (Medida Base)`;
  } else if (parsedSizes.mode === 'flat' && selectedBase) {
    selectedDimensionText = selectedBase;
  }

  // Generate URL for Contact pre-filling
  const getContactUrl = () => {
    let url = `/contactos?produto=${encodeURIComponent(sub.name)}`;
    if (selectedDimensionText && selectedDimensionText !== '') {
        url += `&medida=${encodeURIComponent(selectedDimensionText)}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24 lg:pb-0"> 
      {/* pb-24 prevents content from hiding behind floating action bar on mobile */}

      {/* ── Sticky breadcrumb ── */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-[72px] z-30">
        <div className="container px-4 md:px-6 py-3.5 flex items-center gap-2 text-sm text-slate-500 overflow-x-auto scrollbar-hide">
          <Link to="/produtos" className="hover:text-jrs-green-start transition-colors font-semibold whitespace-nowrap">
            Catálogo
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
          <Link
            to="/produtos"
            className="hover:text-jrs-green-start transition-colors font-semibold whitespace-nowrap"
            onClick={() => sessionStorage.setItem('catalog-category', categoryId)}
          >
            {category.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
          <span className="text-slate-900 font-bold truncate">{sub.name}</span>
        </div>
      </div>

      {/* ── Hero section (Premium Aesthetic) ── */}
      <div className="relative">
        <div className="absolute inset-0 bg-jrs-cream -z-10" />
        <div className="container px-4 md:px-6 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row gap-8 items-center bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 overflow-hidden relative">
                
                {/* Decorative background element */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-jrs-green-start/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex-1 z-10 w-full lg:max-w-xl">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                        <span className="inline-block text-xs font-bold text-jrs-green-start bg-jrs-green-start/10 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest border border-jrs-green-start/20">
                        {category.name}
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 leading-[1.1] mb-4">
                            {sub.name}
                        </h1>
                        <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-6">
                            {sub.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
                             <div className="flex items-center gap-2">
                                <span className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400">
                                    <Package2 className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Vendido ao</p>
                                    <p className="text-sm font-bold text-slate-800">{sub.unit}</p>
                                </div>
                             </div>
                             {meta.material && (
                                <div className="flex items-center gap-2 ml-4">
                                     <span className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400">
                                        <ShieldCheck className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Material base</p>
                                        <p className="text-sm font-bold text-slate-800">{meta.material.split('+')[0].split('/')[0]}</p>
                                    </div>
                                </div>
                             )}
                        </div>
                    </motion.div>
                </div>
                
                <div className="w-full lg:w-5/12 z-10 flex-shrink-0">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="rounded-2xl overflow-hidden shadow-xl border border-slate-100/50 relative group bg-slate-100">
                        {sub.noPhoto ? (
                             <div className="aspect-[4/3] bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center">
                                 <Package2 className="h-16 w-16 text-white/20" />
                                 <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 20px)'}} />
                             </div>
                        ) : (
                            <div className="aspect-[4/3] relative">
                                <img src={sub.image} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
      </div>

      {/* ── Main content (Matrix & Specs) ── */}
      <div className="container px-4 md:px-6 pb-20 pt-4">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left column: Dimension Matrix ── */}
          <div className="flex-1 min-w-0">
            {parsedSizes.groups.length > 0 && (
              <motion.section initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                <div className="flex items-start justify-between mb-8">
                     <div>
                        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">
                        Matriz de Medidas
                        </h2>
                        <p className="text-slate-500 text-sm">
                        {parsedSizes.mode === 'grouped' 
                            ? "Seleccione a dimensão base pretendida (largura/aba principal) para ver as variações disponíveis e solicitar orçamento." 
                            : "Seleccione a medida pretendida para incluir no seu pedido de orçamento."}
                        </p>
                    </div>
                    <span className="bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full text-xs shrink-0 mt-1">{sub.sizes.length} Opções</span>
                </div>

                {/* THE VAULT: Interactive Selection */}
                {parsedSizes.mode === 'grouped' ? (
                    <div className="space-y-6">
                        {/* Step 1: Base Dimensions */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500">1</span>
                                Seleccione a Medida Base (mm)
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {parsedSizes.groups.map(g => (
                                    <button
                                        key={g.base}
                                        onClick={() => {
                                            setSelectedBase(g.base);
                                            setSelectedVariant(null); // Reset variant on base change
                                        }}
                                        className={`px-4 py-2.5 rounded-xl font-mono text-sm font-semibold transition-all duration-200 border ${
                                            selectedBase === g.base 
                                            ? 'bg-jrs-green-start text-white border-jrs-green-start shadow-md shadow-jrs-green-start/20 scale-[1.02]' 
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                        }`}
                                    >
                                        {g.base}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Variants (Slides down when base is selected) */}
                        <AnimatePresence mode="popLayout">
                            {selectedBase && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, y: -10 }} 
                                    animate={{ opacity: 1, height: 'auto', y: 0 }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-6 border-t border-slate-100">
                                        <h3 className="text-xs font-bold text-jrs-green-start uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-jrs-green-start/10 text-jrs-green-start">2</span>
                                            Medidas exactas disponíveis (Largura × Espessura)
                                        </h3>
                                        <div className="flex flex-wrap gap-2 bg-jrs-green-start/5 p-4 rounded-2xl border border-jrs-green-start/10">
                                            {parsedSizes.groups.find(g => g.base === selectedBase)?.variants.map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setSelectedVariant(v)}
                                                    className={`px-4 py-2 rounded-lg font-mono text-sm font-medium transition-all flex items-center gap-2 border ${
                                                        selectedVariant === v 
                                                        ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-105' 
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900 shadow-sm'
                                                    }`}
                                                >
                                                    {selectedBase} × {v}
                                                    {selectedVariant === v && <Check className="w-3.5 h-3.5 text-jrs-green-start" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* Mode FLAT: Simple Grid of Pills */
                    <div className="flex flex-wrap gap-2">
                        {parsedSizes.groups.map(g => (
                            <button
                                key={g.base}
                                onClick={() => setSelectedBase(g.base === selectedBase ? null : g.base)}
                                className={`px-4 py-2.5 rounded-xl font-mono text-sm font-medium transition-all duration-200 border flex items-center gap-2 ${
                                    selectedBase === g.base 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                            >
                                {g.base}
                                {selectedBase === g.base && <Check className="w-4 h-4 text-jrs-green-start" />}
                            </button>
                        ))}
                    </div>
                )}
              </motion.section>
            )}

             {/* ── Applications Section ── */}
             {meta.applications.length > 0 && (
              <motion.section initial="hidden" animate="visible" variants={fadeUp} className="mt-8">
                <h2 className="text-xl font-display font-bold text-slate-900 mb-4 ml-1">Para que serve?</h2>
                <div className="flex flex-wrap gap-2">
                  {meta.applications.map(app => (
                    <div
                      key={app}
                      className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-slate-200 text-sm text-slate-600 shadow-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-jrs-green-start/60" />
                      {app}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

          </div>

          {/* ── Right column: Specs Bento Box ── */}
          <div className="lg:w-80 flex-shrink-0">
             <motion.div initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-3 lg:sticky lg:top-[140px]">
                <h2 className="col-span-2 text-xl font-display font-bold text-slate-900 mb-1 ml-1">Resumo Técnico</h2>
                <SpecTile label="Material" value={meta.material} icon={<ShieldCheck className="h-5 w-5" />} />
                <SpecTile label="Norma" value={meta.norm} icon={<CheckCircle2 className="h-5 w-5" />} />
                <SpecTile label="Acabamento" value={meta.finish} icon={<Info className="h-5 w-5" />} />
                <SpecTile label="Comprimento" value={meta.standardLength} icon={<Ruler className="h-5 w-5" />} />
             </motion.div>
          </div>

        </div>
      </div>

       {/* ── Related products ── */}
       {related.length > 0 && (
        <div className="bg-white border-t border-slate-200/60 py-16">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-8">Outros clientes também procuram</h2>
            <div className="flex gap-5 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x">
              {related.map(r => (
                <div className="snap-start" key={`${r.categoryId}-${r.id}`}>
                     <RelatedCard sub={r} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Dynamic Floating Action Bar (Pedir Orçamento) ── */}
      <AnimatePresence>
            <motion.div 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 150, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 flex justify-center right-0 z-50 p-4 md:p-6 pointer-events-none"
            >
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] rounded-2xl w-full max-w-4xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
                    
                    {/* Selected state info */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                            <Package2 className="h-6 w-6 text-white/50" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Selecção Actual</p>
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                                {sub.name} <span className="text-jrs-green-start font-mono ml-1">{selectedDimensionText}</span>
                            </p>
                            {(!selectedBase || (parsedSizes.mode === 'grouped' && !selectedVariant)) && (
                                <p className="text-xs text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                                    <Info className="h-3 w-3" /> Seleccione uma medida completa para orçamentar
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="outline"
                            className="h-12 px-6 rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-slate-600 hidden md:flex"
                            asChild
                        >
                            <a href={`tel:${COMPANY_INFO.phoneWarehouse}`}>
                                <Phone className="h-4 w-4 mr-2" />
                                Ligar
                            </a>
                        </Button>
                        <Button
                            className="flex-1 md:w-auto h-12 px-8 rounded-xl bg-jrs-green-start hover:bg-jrs-green-end text-white font-bold shadow-lg shadow-jrs-green-start/20 hover:scale-105 transition-all text-base"
                            asChild
                        >
                            <Link to={getContactUrl()}>
                                Pedir Orçamento Agora
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </div>

                </div>
            </motion.div>
      </AnimatePresence>

    </div>
  );
}
