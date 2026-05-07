import { useEffect, useMemo, useRef, useState, type ChangeEvent, type Dispatch, type FormEvent, type PointerEvent, type ReactNode, type SetStateAction } from 'react';
import {
  Archive,
  Check,
  Eye,
  ImagePlus,
  Images,
  LayoutGrid,
  LogOut,
  Mail,
  Maximize2,
  Move,
  Package,
  Phone,
  RefreshCw,
  RotateCcw,
  Save,
  Scissors,
  Search,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import {
  adminLogin,
  archiveAdminCategory,
  archiveAdminProduct,
  archiveAdminService,
  fetchAdminCms,
  fetchAdminContactRequests,
  saveAdminCategory,
  saveAdminCmsImageVariant,
  saveAdminProduct,
  saveAdminService,
  seedAdminCmsDefaults,
  updateAdminCmsImage,
  uploadAdminCmsImage,
} from '@/src/lib/api';
import { parseSizes } from '@/src/lib/productHelpers';
import type {
  CmsEntityType,
  CmsImageFitMode,
  CmsImage,
  CmsImagePlacement,
  CmsProductCategory,
  CmsServiceItem,
  CmsSubCategory,
} from '@/src/types/cms';

const ADMIN_TOKEN_KEY = 'jrs_admin_token';

interface ContactRequestItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  created_at: string;
}

type AdminTab = 'contacts' | 'categories' | 'products' | 'services';

const tabs: Array<{ id: AdminTab; label: string; icon: typeof Mail }> = [
  { id: 'contacts', label: 'Pedidos', icon: Mail },
  { id: 'categories', label: 'Categorias', icon: LayoutGrid },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'services', label: 'Serviços', icon: Scissors },
];

const placementLabels: Record<CmsImagePlacement, string> = {
  category_card: 'Categoria card',
  product_card: 'Produto card',
  product_detail: 'Produto detalhe',
  service_card: 'Serviço card',
  service_banner: 'Serviço hero',
};

const placementFrames: Record<CmsImagePlacement, {
  label: string;
  aspectClass: string;
  ratio: string;
  output: { width: number; height: number };
  note: string;
}> = {
  category_card: {
    label: 'Card de categoria',
    aspectClass: 'aspect-[4/3]',
    ratio: '4:3',
    output: { width: 1600, height: 1200 },
    note: 'Usado nos cards de categoria na home e no catálogo.',
  },
  product_card: {
    label: 'Card de produto',
    aspectClass: 'aspect-[16/9]',
    ratio: '16:9',
    output: { width: 1600, height: 900 },
    note: 'Usado na grelha de produtos e nos resultados de pesquisa.',
  },
  product_detail: {
    label: 'Imagem de detalhe',
    aspectClass: 'aspect-[4/3]',
    ratio: '4:3',
    output: { width: 1600, height: 1200 },
    note: 'Usado no topo da página individual do produto.',
  },
  service_card: {
    label: 'Card de serviço',
    aspectClass: 'aspect-[11/7]',
    ratio: '11:7',
    output: { width: 1760, height: 1120 },
    note: 'Usado no bloco visual de cada serviço.',
  },
  service_banner: {
    label: 'Hero de serviços',
    aspectClass: 'aspect-[21/9]',
    ratio: '21:9',
    output: { width: 2100, height: 900 },
    note: 'Usado para banners largos e zonas hero.',
  },
};

const entityPlacements: Record<CmsEntityType, CmsImagePlacement[]> = {
  category: ['category_card'],
  product: ['product_card', 'product_detail'],
  service: ['service_card', 'service_banner'],
};

const ratioPresets = [
  { id: 'site', label: 'Formato do site', ratio: null },
  { id: 'original', label: 'Original da foto', ratio: null },
  { id: '1:1', label: '1:1 quadrado', ratio: 1 },
  { id: '4:3', label: '4:3 paisagem', ratio: 4 / 3 },
  { id: '16:9', label: '16:9 paisagem', ratio: 16 / 9 },
  { id: '21:9', label: '21:9 panorâmico', ratio: 21 / 9 },
  { id: '3:4', label: '3:4 portrait', ratio: 3 / 4 },
  { id: '4:5', label: '4:5 portrait', ratio: 4 / 5 },
  { id: '2:3', label: '2:3 portrait', ratio: 2 / 3 },
];

const imageModeOptions: Array<{ id: CmsImageFitMode; label: string; description: string }> = [
  { id: 'cover', label: 'Preencher', description: 'Corta a imagem para ocupar todo o formato.' },
  { id: 'contain', label: 'Imagem inteira', description: 'Mostra a foto toda dentro do formato escolhido.' },
  { id: 'original', label: 'Original', description: 'Mantém a proporção real da foto.' },
];

function formatRatio(width: number, height: number) {
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const divisor = gcd(width, height);
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

function outputForRatio(baseOutput: { width: number; height: number }, ratio: number) {
  const longEdge = Math.max(baseOutput.width, baseOutput.height);
  if (ratio >= 1) {
    return { width: longEdge, height: Math.round(longEdge / ratio) };
  }
  return { width: Math.round(longEdge * ratio), height: longEdge };
}

function resolveFrame(
  placement: CmsImagePlacement,
  ratioPresetId: string,
  mode: CmsImageFitMode,
  imageSize: { width: number; height: number } | null
) {
  const baseFrame = placementFrames[placement];
  if (mode === 'original' && imageSize) {
    const output = outputForRatio(baseFrame.output, imageSize.width / imageSize.height);
    return {
      ...baseFrame,
      output,
      ratio: formatRatio(output.width, output.height),
      note: 'Mantém a proporção original da fotografia.',
    };
  }

  const preset = ratioPresets.find((item) => item.id === ratioPresetId) ?? ratioPresets[0];
  if (!preset.ratio) return baseFrame;

  const output = outputForRatio(baseFrame.output, preset.ratio);
  return {
    ...baseFrame,
    output,
    ratio: preset.id,
    note: `${baseFrame.note} Formato personalizado ${preset.id}.`,
  };
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function cropImageToDataUrl(
  source: string,
  crop: CropState,
  output: { width: number; height: number },
  options: { mode: CmsImageFitMode; background: string }
) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = source;
  });

  const canvas = document.createElement('canvas');
  canvas.width = output.width;
  canvas.height = output.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível preparar o recorte.');

  ctx.fillStyle = options.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sourceX = clamp(crop.x, 0, 1) * image.naturalWidth;
  const sourceY = clamp(crop.y, 0, 1) * image.naturalHeight;
  const sourceWidth = clamp(crop.width, 0.01, 1 - crop.x) * image.naturalWidth;
  const sourceHeight = clamp(crop.height, 0.01, 1 - crop.y) * image.naturalHeight;

  if (options.mode !== 'cover') {
    const scale = Math.min(output.width / sourceWidth, output.height / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      (output.width - drawWidth) / 2,
      (output.height - drawHeight) / 2,
      drawWidth,
      drawHeight
    );
    return canvas.toDataURL('image/jpeg', 0.88);
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    output.width,
    output.height
  );

  return canvas.toDataURL('image/jpeg', 0.88);
}

interface CropState {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getFrameRatio(frame: { output: { width: number; height: number } }) {
  return frame.output.width / frame.output.height;
}

function getDefaultCrop(naturalWidth: number, naturalHeight: number, targetRatio: number): CropState {
  const imageRatio = naturalWidth / naturalHeight;

  if (imageRatio > targetRatio) {
    const width = targetRatio / imageRatio;
    return { x: (1 - width) / 2, y: 0, width, height: 1 };
  }

  const height = imageRatio / targetRatio;
  return { x: 0, y: (1 - height) / 2, width: 1, height };
}

function getInitialCrop(naturalWidth: number, naturalHeight: number, targetRatio: number, mode: CmsImageFitMode): CropState {
  if (mode !== 'cover') {
    return { x: 0, y: 0, width: 1, height: 1 };
  }

  return getDefaultCrop(naturalWidth, naturalHeight, targetRatio);
}

function emptyCategory(sortOrder: number): CmsProductCategory {
  return {
    id: '',
    name: '',
    icon: '',
    description: '',
    image: '',
    sortOrder,
    status: 'active',
    subcategories: [],
  };
}

function emptyProduct(sortOrder: number): CmsSubCategory {
  return {
    id: '',
    name: '',
    description: '',
    image: '',
    unit: 'kg',
    sizes: [],
    applications: [],
    sortOrder,
    status: 'active',
  };
}

function emptyService(sortOrder: number): CmsServiceItem {
  return {
    id: '',
    name: '',
    description: '',
    image: '',
    priceNote: '',
    highlight: '',
    sortOrder,
    status: 'active',
  };
}

function byAdminOrder<T extends { status?: string; sortOrder?: number; name?: string; id: string }>(a: T, b: T) {
  if (a.status === 'archived' && b.status !== 'archived') return 1;
  if (a.status !== 'archived' && b.status === 'archived') return -1;
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.name ?? a.id).localeCompare(b.name ?? b.id, 'pt');
}

function normalizeAdminCategories(categories: CmsProductCategory[]) {
  return [...categories]
    .map((category) => ({
      ...category,
      subcategories: [...category.subcategories].sort(byAdminOrder),
    }))
    .sort(byAdminOrder);
}

export function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [activeTab, setActiveTab] = useState<AdminTab>('contacts');
  const [items, setItems] = useState<ContactRequestItem[]>([]);
  const [selected, setSelected] = useState<ContactRequestItem | null>(null);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<CmsProductCategory[]>([]);
  const [services, setServices] = useState<CmsServiceItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [categoryDraft, setCategoryDraft] = useState<CmsProductCategory>(() => emptyCategory(0));
  const [productDraft, setProductDraft] = useState<CmsSubCategory>(() => emptyProduct(0));
  const [serviceDraft, setServiceDraft] = useState<CmsServiceItem>(() => emptyService(0));
  const categoryDraftRef = useRef(categoryDraft);
  const productDraftRef = useRef(productDraft);
  const serviceDraftRef = useRef(serviceDraft);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const updateCategoryDraft: Dispatch<SetStateAction<CmsProductCategory>> = (nextValue) => {
    const next = typeof nextValue === 'function'
      ? (nextValue as (current: CmsProductCategory) => CmsProductCategory)(categoryDraftRef.current)
      : nextValue;
    categoryDraftRef.current = next;
    setCategoryDraft(next);
  };

  const updateProductDraft: Dispatch<SetStateAction<CmsSubCategory>> = (nextValue) => {
    const next = typeof nextValue === 'function'
      ? (nextValue as (current: CmsSubCategory) => CmsSubCategory)(productDraftRef.current)
      : nextValue;
    productDraftRef.current = next;
    setProductDraft(next);
  };

  const updateServiceDraft: Dispatch<SetStateAction<CmsServiceItem>> = (nextValue) => {
    const next = typeof nextValue === 'function'
      ? (nextValue as (current: CmsServiceItem) => CmsServiceItem)(serviceDraftRef.current)
      : nextValue;
    serviceDraftRef.current = next;
    setServiceDraft(next);
  };

  const loadAdminData = async (
    adminToken: string,
    preserveSelection = false,
    selectionOverride?: { categoryId?: string; productId?: string; serviceId?: string }
  ) => {
    setIsLoading(true);
    setError('');
    try {
      const [contactResponse, cmsResponse] = await Promise.all([
        fetchAdminContactRequests(adminToken),
        fetchAdminCms(adminToken),
      ]);
      setItems(contactResponse.data);
      setSelected((current) => {
        if (!preserveSelection || !current) return contactResponse.data[0] ?? null;
        return contactResponse.data.find((item) => item.id === current.id) ?? contactResponse.data[0] ?? null;
      });
      const adminCategories = normalizeAdminCategories(cmsResponse.categories);
      const adminServices = [...cmsResponse.services].sort(byAdminOrder);
      setCategories(adminCategories);
      setServices(adminServices);

      const categoryIdToKeep = selectionOverride?.categoryId ?? selectedCategoryId;
      const productIdToKeep = selectionOverride?.productId ?? selectedProductId;
      const serviceIdToKeep = selectionOverride?.serviceId ?? selectedServiceId;

      const nextCategory = preserveSelection
        ? adminCategories.find((category) => category.id === categoryIdToKeep) ?? adminCategories.find((category) => category.status !== 'archived') ?? adminCategories[0]
        : adminCategories.find((category) => category.status !== 'archived') ?? adminCategories[0];
      const nextProduct = preserveSelection
        ? nextCategory?.subcategories.find((product) => product.id === productIdToKeep) ?? nextCategory?.subcategories[0]
        : nextCategory?.subcategories[0];
      const nextService = preserveSelection
        ? adminServices.find((service) => service.id === serviceIdToKeep) ?? adminServices.find((service) => service.status !== 'archived') ?? adminServices[0]
        : adminServices.find((service) => service.status !== 'archived') ?? adminServices[0];

      setSelectedCategoryId(nextCategory?.id ?? '');
      setSelectedProductId(nextProduct?.id ?? '');
      setSelectedServiceId(nextService?.id ?? '');
      const nextCategoryDraft = nextCategory ?? emptyCategory(0);
      const nextProductDraft = nextProduct ?? emptyProduct(0);
      const nextServiceDraft = nextService ?? emptyService(0);
      categoryDraftRef.current = nextCategoryDraft;
      productDraftRef.current = nextProductDraft;
      serviceDraftRef.current = nextServiceDraft;
      setCategoryDraft(nextCategoryDraft);
      setProductDraft(nextProductDraft);
      setServiceDraft(nextServiceDraft);
    } catch (loadError) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setToken(null);
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o admin.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    void loadAdminData(token);
  }, [token]);

  const flatProducts = useMemo(
    () => categories.flatMap((category) => category.subcategories.map((product) => ({ ...product, categoryId: category.id, categoryName: category.name }))),
    [categories]
  );

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      [item.name, item.email, item.phone, item.message].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [items, query]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await adminLogin(username, password);
      localStorage.setItem(ADMIN_TOKEN_KEY, response.token);
      setToken(response.token);
      setUsername('');
      setPassword('');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Falha no login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setItems([]);
    setSelected(null);
    setCategories([]);
    setServices([]);
    setQuery('');
  };

  const refreshCms = async () => {
    if (!token) return;
    await loadAdminData(token, true);
  };

  const saveCategory = async () => {
    if (!token) return;
    setIsSubmitting(true);
    setStatus('');
    setError('');
    try {
      const response = await saveAdminCategory(token, categoryDraftRef.current);
      setSelectedCategoryId(response.data.id);
      setStatus('Categoria guardada.');
      await loadAdminData(token, true, { categoryId: response.data.id });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível guardar a categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProduct = async () => {
    if (!token || !selectedCategoryId) return;
    setIsSubmitting(true);
    setStatus('');
    setError('');
    try {
      const response = await saveAdminProduct(token, selectedCategoryId, productDraftRef.current);
      setSelectedProductId(response.data.id);
      setStatus('Produto guardado.');
      await loadAdminData(token, true, { categoryId: selectedCategoryId, productId: response.data.id });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível guardar o produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveService = async () => {
    if (!token) return;
    setIsSubmitting(true);
    setStatus('');
    setError('');
    try {
      const response = await saveAdminService(token, serviceDraftRef.current);
      setSelectedServiceId(response.data.id);
      setStatus('Serviço guardado.');
      await loadAdminData(token, true, { serviceId: response.data.id });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível guardar o serviço.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-jrs-green-start/10 text-jrs-green-start">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Admin</h1>
            <p className="mt-2 text-sm text-slate-500">Acesso reservado para gestão do site.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Field label="Utilizador">
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required className="h-11 rounded-xl bg-slate-50" />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-xl bg-slate-50" />
            </Field>
            {error && <Notice tone="error">{error}</Notice>}
            <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? 'A validar...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="container flex flex-col gap-4 px-4 py-6 md:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Admin JRS Ferros</h1>
            <p className="mt-1 text-sm text-slate-500">Pedidos, catálogo, serviços e imagens do site.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-slate-300"
              onClick={async () => {
                if (!token) return;
                setIsSubmitting(true);
                try {
                  await seedAdminCmsDefaults(token);
                  setStatus('Dados iniciais importados/atualizados.');
                  await refreshCms();
                } catch (seedError) {
                  setError(seedError instanceof Error ? seedError.message : 'Não foi possível importar os dados.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Seed catálogo
            </Button>
            <Button variant="outline" className="h-11 rounded-xl border-slate-300" onClick={() => void refreshCms()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" className="h-11 rounded-xl border-slate-300" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
        <div className="container flex gap-2 overflow-x-auto px-4 pb-4 md:px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${
                  activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="container px-4 py-8 md:px-6">
        {isLoading && <Notice>A carregar dados...</Notice>}
        {status && <Notice tone="success">{status}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}

        {activeTab === 'contacts' && (
          <ContactsPanel
            filteredItems={filteredItems}
            selected={selected}
            setSelected={setSelected}
            query={query}
            setQuery={setQuery}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'categories' && (
          <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <ListPanel
              title="Categorias"
              onAdd={() => {
                const next = emptyCategory(categories.length);
                setSelectedCategoryId('');
                updateCategoryDraft(next);
              }}
              items={categories.map((category) => ({
                id: category.id,
                label: category.name || 'Nova categoria',
                meta: `${category.id} · ${category.subcategories.length} produto(s)`,
                active: category.id === selectedCategoryId,
                archived: category.status === 'archived',
                onClick: () => {
                  setSelectedCategoryId(category.id);
                  updateCategoryDraft(category);
                },
              }))}
            />
            <EditorShell title="Editar categoria" onSave={() => void saveCategory()} isSubmitting={isSubmitting}>
              <CategoryForm value={categoryDraft} onChange={updateCategoryDraft} lockId={Boolean(selectedCategoryId)} />
              <ImageManager
                token={token}
                entityType="category"
                entityId={categoryDraft.id}
                title={categoryDraft.name}
                mainImage={categoryDraft.mainImage}
                gallery={categoryDraft.gallery ?? []}
                onChanged={refreshCms}
                onStatus={setStatus}
              />
              {categoryDraft.id && (
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-700"
                  onClick={async () => {
                    await archiveAdminCategory(token, categoryDraft.id, categoryDraft.status === 'archived' ? 'active' : 'archived');
                    await refreshCms();
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {categoryDraft.status === 'archived' ? 'Reativar' : 'Arquivar'}
                </Button>
              )}
            </EditorShell>
          </section>
        )}

        {activeTab === 'products' && (
          <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-4">
              <Panel>
                <Field label="Categoria">
                  <select
                    value={selectedCategoryId}
                    onChange={(event) => {
                      const nextCategory = categories.find((category) => category.id === event.target.value);
                      const nextProduct = nextCategory?.subcategories[0];
                      setSelectedCategoryId(event.target.value);
                      setSelectedProductId(nextProduct?.id ?? '');
                      updateProductDraft(nextProduct ?? emptyProduct(0));
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </Field>
              </Panel>
              <ListPanel
                title="Produtos"
                onAdd={() => {
                  const category = categories.find((item) => item.id === selectedCategoryId);
                  const next = emptyProduct(category?.subcategories.length ?? 0);
                  setSelectedProductId('');
                  updateProductDraft(next);
                }}
                items={flatProducts
                  .filter((product) => product.categoryId === selectedCategoryId)
                  .map((product) => ({
                    id: product.id,
                    label: product.name || 'Novo produto',
                    meta: `${product.id} · ${product.group || product.categoryName}`,
                    active: product.id === selectedProductId,
                    archived: product.status === 'archived',
                    onClick: () => {
                      setSelectedProductId(product.id);
                      setSelectedCategoryId(product.categoryId);
                      updateProductDraft(product);
                    },
                  }))}
              />
            </div>
            <EditorShell title="Editar produto" onSave={() => void saveProduct()} isSubmitting={isSubmitting}>
              <ProductForm value={productDraft} onChange={updateProductDraft} lockId={Boolean(selectedProductId)} />
              <SizePreview sizes={productDraft.sizes} />
              <ImageManager
                token={token}
                entityType="product"
                entityId={productDraft.id}
                title={productDraft.name}
                mainImage={productDraft.mainImage}
                gallery={productDraft.gallery ?? []}
                onChanged={refreshCms}
                onStatus={setStatus}
              />
              {productDraft.id && (
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-700"
                  onClick={async () => {
                    await archiveAdminProduct(token, productDraft.id, productDraft.status === 'archived' ? 'active' : 'archived');
                    await refreshCms();
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {productDraft.status === 'archived' ? 'Reativar' : 'Arquivar'}
                </Button>
              )}
            </EditorShell>
          </section>
        )}

        {activeTab === 'services' && (
          <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <ListPanel
              title="Serviços"
              onAdd={() => {
                const next = emptyService(services.length);
                setSelectedServiceId('');
                updateServiceDraft(next);
              }}
              items={services.map((service) => ({
                id: service.id,
                label: service.name || 'Novo serviço',
                meta: `${service.id}${service.highlight ? ` · ${service.highlight}` : ''}`,
                active: service.id === selectedServiceId,
                archived: service.status === 'archived',
                onClick: () => {
                  setSelectedServiceId(service.id);
                  updateServiceDraft(service);
                },
              }))}
            />
            <EditorShell title="Editar serviço" onSave={() => void saveService()} isSubmitting={isSubmitting}>
              <ServiceForm value={serviceDraft} onChange={updateServiceDraft} lockId={Boolean(selectedServiceId)} />
              <ImageManager
                token={token}
                entityType="service"
                entityId={serviceDraft.id}
                title={serviceDraft.name}
                mainImage={serviceDraft.mainImage}
                gallery={serviceDraft.gallery ?? []}
                onChanged={refreshCms}
                onStatus={setStatus}
              />
              {serviceDraft.id && (
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-700"
                  onClick={async () => {
                    await archiveAdminService(token, serviceDraft.id, serviceDraft.status === 'archived' ? 'active' : 'archived');
                    await refreshCms();
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {serviceDraft.status === 'archived' ? 'Reativar' : 'Arquivar'}
                </Button>
              )}
            </EditorShell>
          </section>
        )}
      </main>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">{children}</div>;
}

function Notice({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'success' | 'error' }) {
  const classes = {
    default: 'border-slate-200 bg-white text-slate-600',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    error: 'border-red-200 bg-red-50 text-red-700',
  };
  return <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${classes[tone]}`}>{children}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function ListPanel({ title, items, onAdd }: {
  title: string;
  items: Array<{ id: string; label: string; meta?: string; active: boolean; archived?: boolean; onClick: () => void }>;
  onAdd: () => void;
}) {
  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-slate-900">{title}</h2>
        <Button size="sm" className="rounded-xl" onClick={onAdd}>
          <ImagePlus className="mr-2 h-4 w-4" />
          Novo
        </Button>
      </div>
      <div className="max-h-[70vh] space-y-2 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id || item.label}
            onClick={item.onClick}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
              item.active ? 'border-jrs-green-start bg-jrs-green-start/5' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-bold text-slate-900">{item.label}</p>
              {item.archived && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Arquivo</span>}
            </div>
            {item.meta && <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.meta}</p>}
          </button>
        ))}
        {items.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Sem itens.</p>}
      </div>
    </Panel>
  );
}

function EditorShell({ title, children, onSave, isSubmitting }: {
  title: string;
  children: ReactNode;
  onSave: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Panel>
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
        <h2 className="font-display text-2xl font-bold text-slate-900">{title}</h2>
        <Button className="rounded-xl" onClick={onSave} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'A guardar...' : 'Guardar'}
        </Button>
      </div>
      <div className="space-y-6">{children}</div>
    </Panel>
  );
}

function CategoryForm({ value, onChange, lockId }: { value: CmsProductCategory; onChange: Dispatch<SetStateAction<CmsProductCategory>>; lockId: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="ID / slug">
        <Input
          value={value.id}
          onChange={(e) => onChange((current) => ({ ...current, id: e.target.value }))}
          disabled={lockId}
          className="rounded-xl disabled:bg-slate-100 disabled:text-slate-500"
        />
      </Field>
      <Field label="Ordem">
        <Input type="number" value={value.sortOrder ?? 0} onChange={(e) => onChange((current) => ({ ...current, sortOrder: Number(e.target.value) }))} className="rounded-xl" />
      </Field>
      <Field label="Nome">
        <Input value={value.name} onChange={(e) => onChange((current) => ({ ...current, name: e.target.value }))} className="rounded-xl" />
      </Field>
      <Field label="Ícone">
        <Input value={value.icon} onChange={(e) => onChange((current) => ({ ...current, icon: e.target.value }))} className="rounded-xl" />
      </Field>
      <div className="md:col-span-2">
        <Field label="Descrição">
          <Textarea value={value.description} onChange={(e) => onChange((current) => ({ ...current, description: e.target.value }))} className="min-h-28 rounded-xl" />
        </Field>
      </div>
    </div>
  );
}

function ProductForm({ value, onChange, lockId }: { value: CmsSubCategory; onChange: Dispatch<SetStateAction<CmsSubCategory>>; lockId: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="ID / slug">
        <Input
          value={value.id}
          onChange={(e) => onChange((current) => ({ ...current, id: e.target.value }))}
          disabled={lockId}
          className="rounded-xl disabled:bg-slate-100 disabled:text-slate-500"
        />
      </Field>
      <Field label="Ordem">
        <Input type="number" value={value.sortOrder ?? 0} onChange={(e) => onChange((current) => ({ ...current, sortOrder: Number(e.target.value) }))} className="rounded-xl" />
      </Field>
      <Field label="Nome">
        <Input value={value.name} onChange={(e) => onChange((current) => ({ ...current, name: e.target.value }))} className="rounded-xl" />
      </Field>
      <Field label="Unidade">
        <Input value={value.unit} onChange={(e) => onChange((current) => ({ ...current, unit: e.target.value }))} className="rounded-xl" />
      </Field>
      <Field label="Grupo visual">
        <Input value={value.group ?? ''} onChange={(e) => onChange((current) => ({ ...current, group: e.target.value }))} className="rounded-xl" />
      </Field>
      <Field label="Comprimento standard">
        <Input value={value.standardLength ?? ''} onChange={(e) => onChange((current) => ({ ...current, standardLength: e.target.value }))} className="rounded-xl" />
      </Field>
      <div className="md:col-span-2">
        <Field label="Descrição">
          <Textarea value={value.description} onChange={(e) => onChange((current) => ({ ...current, description: e.target.value }))} className="min-h-28 rounded-xl" />
        </Field>
      </div>
      <Field label="Material">
        <Input value={value.material ?? ''} onChange={(e) => onChange((current) => ({ ...current, material: e.target.value }))} className="rounded-xl" />
      </Field>
      <Field label="Acabamento">
        <Input value={value.finish ?? ''} onChange={(e) => onChange((current) => ({ ...current, finish: e.target.value }))} className="rounded-xl" />
      </Field>
      <Field label="Norma">
        <Input value={value.norm ?? ''} onChange={(e) => onChange((current) => ({ ...current, norm: e.target.value }))} className="rounded-xl" />
      </Field>
      <Field label="Sem fotografia">
        <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3">
          <input type="checkbox" checked={Boolean(value.noPhoto)} onChange={(e) => onChange((current) => ({ ...current, noPhoto: e.target.checked }))} />
          <span className="text-sm text-slate-600">Mostrar cartão compacto</span>
        </div>
      </Field>
      <div className="md:col-span-2">
        <Field label="Medidas, uma por linha">
          <Textarea
            value={(value.sizes ?? []).join('\n')}
            onChange={(e) => onChange((current) => ({ ...current, sizes: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean) }))}
            className="min-h-40 rounded-xl font-mono text-sm"
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Aplicações, uma por linha">
          <Textarea
            value={(value.applications ?? []).join('\n')}
            onChange={(e) => onChange((current) => ({ ...current, applications: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean) }))}
            className="min-h-32 rounded-xl"
          />
        </Field>
      </div>
    </div>
  );
}

function ServiceForm({ value, onChange, lockId }: { value: CmsServiceItem; onChange: Dispatch<SetStateAction<CmsServiceItem>>; lockId: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="ID / slug">
        <Input
          value={value.id}
          onChange={(e) => onChange((current) => ({ ...current, id: e.target.value }))}
          disabled={lockId}
          className="rounded-xl disabled:bg-slate-100 disabled:text-slate-500"
        />
      </Field>
      <Field label="Ordem">
        <Input type="number" value={value.sortOrder ?? 0} onChange={(e) => onChange((current) => ({ ...current, sortOrder: Number(e.target.value) }))} className="rounded-xl" />
      </Field>
      <Field label="Nome">
        <Input value={value.name} onChange={(e) => onChange((current) => ({ ...current, name: e.target.value }))} className="rounded-xl" />
      </Field>
      <Field label="Condições">
        <Input value={value.priceNote} onChange={(e) => onChange((current) => ({ ...current, priceNote: e.target.value }))} className="rounded-xl" />
      </Field>
      <div className="md:col-span-2">
        <Field label="Destaque">
          <Input value={value.highlight} onChange={(e) => onChange((current) => ({ ...current, highlight: e.target.value }))} className="rounded-xl" />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Descrição">
          <Textarea value={value.description} onChange={(e) => onChange((current) => ({ ...current, description: e.target.value }))} className="min-h-36 rounded-xl" />
        </Field>
      </div>
    </div>
  );
}

function SizePreview({ sizes }: { sizes: string[] }) {
  const parsed = parseSizes(sizes);
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
        Pré-visualização das medidas: {parsed.mode === 'grouped' ? 'agrupadas' : 'lista simples'}
      </p>
      <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
        {parsed.groups.slice(0, 80).map((group) => (
          <span key={group.base} className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-600">
            {group.variants.length ? `${group.base}: ${group.variants.join(', ')}` : group.base}
          </span>
        ))}
      </div>
    </div>
  );
}

function ImageManager({ token, entityType, entityId, title, mainImage, gallery, onChanged, onStatus }: {
  token: string;
  entityType: CmsEntityType;
  entityId: string;
  title: string;
  mainImage?: CmsImage;
  gallery: CmsImage[];
  onChanged: () => Promise<void>;
  onStatus?: (message: string) => void;
}) {
  const [alt, setAlt] = useState(mainImage?.alt ?? title);
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, width: 1, height: 1 });
  const [placement, setPlacement] = useState<CmsImagePlacement>(entityPlacements[entityType][0]);
  const [imageMode, setImageMode] = useState<CmsImageFitMode>('cover');
  const [ratioPresetId, setRatioPresetId] = useState('site');
  const [background, setBackground] = useState('#f1f5f9');
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localStatus, setLocalStatus] = useState('');
  const [mainPreviewUrl, setMainPreviewUrl] = useState<string | null>(null);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<Record<string, string>>({});
  const [variantPreviewUrls, setVariantPreviewUrls] = useState<Partial<Record<CmsImagePlacement, string>>>({});

  useEffect(() => {
    setAlt(mainImage?.alt ?? title);
    setImageSize(null);
    setCrop({ x: 0, y: 0, width: 1, height: 1 });
    setLocalError('');
    setLocalStatus('');
    setMainPreviewUrl(null);
    setGalleryPreviewUrls({});
    setVariantPreviewUrls({});
  }, [entityId, mainImage?.id, mainImage?.url, mainImage?.alt]);

  useEffect(() => {
    if (!mainImage?.id) {
      setAlt(title);
    }
  }, [mainImage?.id, title]);

  useEffect(() => {
    const meta = mainImage?.variantMeta?.[placement];
    const nextMode = meta?.mode ?? 'cover';
    setImageMode(nextMode);
    setRatioPresetId(nextMode === 'original' ? 'original' : meta?.aspectRatio ?? 'site');
    setBackground(meta?.background ?? '#f1f5f9');
  }, [mainImage?.id, placement]);

  const frame = useMemo(
    () => resolveFrame(placement, ratioPresetId, imageMode, imageSize),
    [placement, ratioPresetId, imageMode, imageSize?.width, imageSize?.height]
  );
  const canUpload = Boolean(entityId) && !isWorking;
  const displayMainImage = mainImage
    ? {
        ...mainImage,
        url: mainPreviewUrl ?? mainImage.url,
        variants: {
          ...(mainImage.variants ?? {}),
          ...variantPreviewUrls,
        },
      }
    : undefined;
  const displayGallery = gallery.map((image) => ({
    ...image,
    url: galleryPreviewUrls[String(image.id)] ?? image.url,
  }));

  const resetCrop = () => {
    if (!imageSize) {
      setCrop({ x: 0, y: 0, width: 1, height: 1 });
      return;
    }

    setCrop(getInitialCrop(imageSize.width, imageSize.height, getFrameRatio(frame), imageMode));
  };

  const handleUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    role: 'main' | 'gallery',
    options: { replaceImageId?: number | string; alt?: string } = {}
  ) => {
    const file = event.target.files?.[0];
    if (!file || !entityId) return;
    setIsWorking(true);
    setLocalError('');
    setLocalStatus('');
    onStatus?.('');
    try {
      const dataUrl = await fileToDataUrl(file);
      await uploadAdminCmsImage(token, {
        entityType,
        entityId,
        role,
        replaceImageId: options.replaceImageId,
        fileName: file.name,
        mimeType: file.type,
        dataUrl,
        alt: options.alt ?? (role === 'main' ? alt : title),
      });
      if (role === 'main') {
        setMainPreviewUrl(dataUrl);
        setVariantPreviewUrls({});
        setImageSize(null);
        setCrop({ x: 0, y: 0, width: 1, height: 1 });
      } else if (options.replaceImageId) {
        setGalleryPreviewUrls((current) => ({
          ...current,
          [String(options.replaceImageId)]: dataUrl,
        }));
      }
      const message = options.replaceImageId
        ? (role === 'main' ? 'Foto principal substituída.' : 'Foto da galeria substituída.')
        : (role === 'main' ? 'Foto principal adicionada.' : 'Foto adicionada à galeria.');
      setLocalStatus(message);
      onStatus?.(message);
      await onChanged();
    } catch (uploadError) {
      setLocalError(uploadError instanceof Error ? uploadError.message : 'Falha no upload.');
    } finally {
      event.target.value = '';
      setIsWorking(false);
    }
  };

  const handleSaveCrop = async () => {
    if (!displayMainImage?.id) return;
    setIsWorking(true);
    setLocalError('');
    setLocalStatus('');
    onStatus?.('');
    try {
      const dataUrl = await cropImageToDataUrl(displayMainImage.url, crop, frame.output, {
        mode: imageMode,
        background,
      });
      const response = await saveAdminCmsImageVariant(token, {
        entityImageId: displayMainImage.id,
        placement,
        fileName: `${entityId}-${placement}.jpg`,
        mimeType: 'image/jpeg',
        dataUrl,
        crop: {
          x: crop.x,
          y: crop.y,
          zoom: crop.width,
          rotate: 0,
          sourceX: crop.x,
          sourceY: crop.y,
          sourceWidth: crop.width,
          sourceHeight: crop.height,
          width: frame.output.width,
          height: frame.output.height,
          mode: imageMode,
          aspectRatio: imageMode === 'original' ? 'original' : ratioPresetId,
          objectFit: imageMode === 'cover' ? 'cover' : 'contain',
          background,
        },
      });
      setVariantPreviewUrls((current) => ({
        ...current,
        [placement]: response.data.publicUrl,
      }));
      setLocalStatus('Recorte guardado.');
      onStatus?.('Recorte guardado.');
      await onChanged();
    } catch (cropError) {
      setLocalError(cropError instanceof Error ? cropError.message : 'Não foi possível guardar o recorte.');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-slate-900">Imagens</h3>
          <p className="text-sm text-slate-500">Troque a foto principal, organize a galeria e ajuste os recortes por formato.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className={`inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-white ${
            canUpload ? 'cursor-pointer bg-slate-900 hover:bg-slate-800' : 'cursor-not-allowed bg-slate-400'
          }`}>
            <Upload className="mr-2 h-4 w-4" />
            {displayMainImage ? 'Trocar foto principal' : 'Adicionar foto principal'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!canUpload}
              onChange={(event) => void handleUpload(event, 'main', displayMainImage ? { replaceImageId: displayMainImage.id } : {})}
            />
          </label>
          <label className={`inline-flex h-10 items-center rounded-xl border px-4 text-sm font-semibold ${
            canUpload ? 'cursor-pointer border-slate-300 bg-white text-slate-700 hover:bg-slate-50' : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
          }`}>
            <Images className="mr-2 h-4 w-4" />
            Adicionar galeria
            <input type="file" accept="image/*" className="hidden" disabled={!canUpload} onChange={(event) => void handleUpload(event, 'gallery')} />
          </label>
        </div>
      </div>

      {!entityId && <Notice tone="error">Guarde o item antes de adicionar imagens.</Notice>}
      {localError && <Notice tone="error">{localError}</Notice>}
      {localStatus && <Notice tone="success">{localStatus}</Notice>}

      {displayMainImage ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">{frame.label}</p>
                <p className="text-xs text-slate-500">{frame.note}</p>
              </div>
              <span className="w-fit rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">{frame.ratio}</span>
            </div>
            <VisualCropEditor
              src={displayMainImage.url}
              alt={displayMainImage.alt}
              frame={frame}
              crop={crop}
              mode={imageMode}
              background={background}
              onCropChange={setCrop}
              onImageReady={setImageSize}
            />
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_0.72fr_1fr]">
              <CropPreviewCard label="Pré-visualização deste recorte" src={displayMainImage.url} crop={crop} frame={frame} mode={imageMode} background={background} />
              <CropPreviewCard label="Mobile" src={displayMainImage.url} crop={crop} frame={frame} mode={imageMode} background={background} />
              <PreviewCard label="Guardado atualmente" src={displayMainImage.variants?.[placement] ?? displayMainImage.url} frame={frame} mode={imageMode} background={background} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img src={displayMainImage.url} alt={displayMainImage.alt} className="aspect-[16/9] w-full object-cover" />
              <div className="space-y-3 p-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Foto principal atual</p>
                  <p className="text-xs text-slate-500">Ao trocar a foto, os recortes antigos são limpos para não aparecer a imagem anterior.</p>
                </div>
                <label className={`inline-flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold text-white ${
                  canUpload ? 'cursor-pointer bg-slate-900 hover:bg-slate-800' : 'cursor-not-allowed bg-slate-400'
                }`}>
                  <Upload className="mr-2 h-4 w-4" />
                  Escolher outra foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!canUpload}
                    onChange={(event) => void handleUpload(event, 'main', { replaceImageId: displayMainImage.id })}
                  />
                </label>
              </div>
            </div>
            <Field label="Alt text">
              <Input value={alt} onChange={(e) => setAlt(e.target.value)} className="rounded-xl" />
            </Field>
            <Button
              variant="outline"
              className="w-full rounded-xl"
              disabled={isWorking}
              onClick={async () => {
                await updateAdminCmsImage(token, displayMainImage.id, { alt });
                await onChanged();
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Guardar alt text
            </Button>
            <Field label="Modo de imagem">
              <div className="grid gap-2">
                {imageModeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setImageMode(option.id);
                      if (imageSize) {
                        const nextRatioPreset = option.id === 'original'
                          ? 'original'
                          : ratioPresetId === 'original'
                          ? 'site'
                          : ratioPresetId;
                        const nextFrame = resolveFrame(placement, nextRatioPreset, option.id, imageSize);
                        setCrop(getInitialCrop(imageSize.width, imageSize.height, getFrameRatio(nextFrame), option.id));
                      }
                      if (option.id === 'original') {
                        setRatioPresetId('original');
                      } else if (ratioPresetId === 'original') {
                        setRatioPresetId('site');
                      }
                    }}
                    className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                      imageMode === option.id
                        ? 'border-jrs-green-start bg-jrs-green-start/10 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-sm font-bold">{option.label}</span>
                    <span className="block text-xs">{option.description}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Formato de recorte">
              <select value={placement} onChange={(e) => {
                const nextPlacement = e.target.value as CmsImagePlacement;
                setPlacement(nextPlacement);
                if (imageSize) {
                  const nextFrame = resolveFrame(nextPlacement, ratioPresetId, imageMode, imageSize);
                  setCrop(getInitialCrop(imageSize.width, imageSize.height, getFrameRatio(nextFrame), imageMode));
                }
              }} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
                {entityPlacements[entityType].map((item) => (
                  <option key={item} value={item}>{placementLabels[item]} ({placementFrames[item].ratio})</option>
                ))}
              </select>
            </Field>
            <Field label="Proporção">
              <select
                value={imageMode === 'original' ? 'original' : ratioPresetId}
                disabled={imageMode === 'original'}
                onChange={(e) => {
                  const nextPreset = e.target.value;
                  setRatioPresetId(nextPreset);
                  if (imageSize) {
                    const nextFrame = resolveFrame(placement, nextPreset, imageMode, imageSize);
                    setCrop(getInitialCrop(imageSize.width, imageSize.height, getFrameRatio(nextFrame), imageMode));
                  }
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-100 disabled:text-slate-500"
              >
                {ratioPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.label}</option>
                ))}
              </select>
            </Field>
            {imageMode !== 'cover' && (
              <Field label="Fundo para imagem inteira">
                <div className="flex items-center gap-2">
                  <Input value={background} onChange={(e) => setBackground(e.target.value)} className="rounded-xl font-mono text-xs" />
                  <input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="h-11 w-12 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                    aria-label="Escolher cor de fundo"
                  />
                </div>
              </Field>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-xl" onClick={resetCrop}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button className="rounded-xl" disabled={isWorking} onClick={() => void handleSaveCrop()}>
                <Save className="mr-2 h-4 w-4" />
                Guardar recorte
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <label className={`block rounded-2xl border border-dashed bg-white p-8 text-center ${
          canUpload ? 'cursor-pointer border-slate-300 hover:border-jrs-green-start hover:bg-jrs-green-start/5' : 'cursor-not-allowed border-slate-200 opacity-70'
        }`}>
          <Upload className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <span className="block text-sm font-bold text-slate-800">Adicionar foto principal</span>
          <span className="mt-1 block text-xs text-slate-500">Escolha uma imagem para este item. Depois pode ajustar o recorte.</span>
          <input type="file" accept="image/*" className="hidden" disabled={!canUpload} onChange={(event) => void handleUpload(event, 'main')} />
        </label>
      )}

      {gallery.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {displayGallery.map((image, index) => (
            <div key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img src={image.url} alt={image.alt} className="aspect-[4/3] w-full object-cover" />
              <div className="space-y-2 p-3">
                <Input
                  defaultValue={image.alt}
                  className="h-9 rounded-xl text-xs"
                  onBlur={(event) => void updateAdminCmsImage(token, image.id, { alt: event.target.value })}
                />
                <label className={`inline-flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold ${
                  canUpload ? 'cursor-pointer bg-slate-900 text-white hover:bg-slate-800' : 'cursor-not-allowed bg-slate-200 text-slate-400'
                }`}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Substituir foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!canUpload}
                    onChange={(event) => void handleUpload(event, 'gallery', { replaceImageId: image.id, alt: image.alt })}
                  />
                </label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 flex-1 rounded-lg" onClick={async () => {
                    await updateAdminCmsImage(token, image.id, { sortOrder: Math.max(0, index - 1) });
                    await onChanged();
                  }}>
                    ↑
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 flex-1 rounded-lg" onClick={async () => {
                    await updateAdminCmsImage(token, image.id, { sortOrder: index + 1 });
                    await onChanged();
                  }}>
                    ↓
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg border-amber-300 text-amber-700" onClick={async () => {
                    await updateAdminCmsImage(token, image.id, { status: 'archived' });
                    await onChanged();
                  }}>
                    <Archive className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type CropInteractionMode = 'move' | 'nw' | 'ne' | 'sw' | 'se';

function VisualCropEditor({ src, alt, frame, crop, mode, background, onCropChange, onImageReady }: {
  src: string;
  alt: string;
  frame: ReturnType<typeof resolveFrame>;
  crop: CropState;
  mode: CmsImageFitMode;
  background: string;
  onCropChange: (crop: CropState) => void;
  onImageReady: (size: { width: number; height: number }) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const interaction = useRef<{
    mode: CropInteractionMode;
    pointerId: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
    crop: CropState;
  } | null>(null);

  useEffect(() => {
    if (!naturalSize) return;
    onCropChange(getInitialCrop(naturalSize.width, naturalSize.height, getFrameRatio(frame), mode));
  }, [src, frame, mode, naturalSize?.width, naturalSize?.height]);

  const normalizedRatio = naturalSize
    ? getFrameRatio(frame) / (naturalSize.width / naturalSize.height)
    : 1;

  const scaleCrop = (factor: number) => {
    if (!naturalSize) return;

    const frameRatio = getFrameRatio(frame);
    const minWidth = Math.max(0.05, 80 / naturalSize.width);
    const minHeight = Math.max(0.05, 80 / naturalSize.height);
    const imageRatio = naturalSize.width / naturalSize.height;
    const currentCenterX = crop.x + crop.width / 2;
    const currentCenterY = crop.y + crop.height / 2;
    const nextWidth = clamp(crop.width * factor, minWidth, 1);
    const nextHeight = clamp(nextWidth / (frameRatio / imageRatio), minHeight, 1);
    const constrainedWidth = nextHeight === 1 ? clamp(nextHeight * (frameRatio / imageRatio), minWidth, 1) : nextWidth;

    onCropChange({
      x: clamp(currentCenterX - constrainedWidth / 2, 0, 1 - constrainedWidth),
      y: clamp(currentCenterY - nextHeight / 2, 0, 1 - nextHeight),
      width: constrainedWidth,
      height: nextHeight,
    });
  };

  const startInteraction = (mode: CropInteractionMode, event: PointerEvent<HTMLButtonElement | HTMLDivElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    interaction.current = {
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
      crop,
    };
  };

  const updateInteraction = (event: PointerEvent<HTMLDivElement>) => {
    const active = interaction.current;
    if (!active || active.pointerId !== event.pointerId) return;

    const dx = (event.clientX - active.startX) / active.width;
    const dy = (event.clientY - active.startY) / active.height;
    const start = active.crop;

    if (active.mode === 'move') {
      onCropChange({
        ...start,
        x: clamp(start.x + dx, 0, 1 - start.width),
        y: clamp(start.y + dy, 0, 1 - start.height),
      });
      return;
    }

    const growsRight = active.mode.includes('e');
    const growsDown = active.mode.includes('s');
    const anchorX = growsRight ? start.x : start.x + start.width;
    const anchorY = growsDown ? start.y : start.y + start.height;
    const horizontalDelta = growsRight ? dx : -dx;
    const verticalDeltaAsWidth = (growsDown ? dy : -dy) * normalizedRatio;
    const sizeDelta = Math.abs(verticalDeltaAsWidth) > Math.abs(horizontalDelta) ? verticalDeltaAsWidth : horizontalDelta;

    const minWidth = Math.max(56 / active.width, (56 / active.height) * normalizedRatio);
    const maxWidthX = growsRight ? 1 - anchorX : anchorX;
    const maxWidthY = (growsDown ? 1 - anchorY : anchorY) * normalizedRatio;
    const nextWidth = clamp(start.width + sizeDelta, minWidth, Math.max(minWidth, Math.min(maxWidthX, maxWidthY)));
    const nextHeight = nextWidth / normalizedRatio;

    onCropChange({
      x: growsRight ? anchorX : anchorX - nextWidth,
      y: growsDown ? anchorY : anchorY - nextHeight,
      width: nextWidth,
      height: nextHeight,
    });
  };

  const endInteraction = (event: PointerEvent<HTMLDivElement>) => {
    if (interaction.current?.pointerId === event.pointerId) {
      interaction.current = null;
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950 p-3 shadow-inner ring-1 ring-slate-300">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-white/80">
        <span className="inline-flex items-center gap-2">
          <Move className="h-3.5 w-3.5" />
          Arraste a moldura para escolher a zona da foto
        </span>
        <span className="inline-flex items-center gap-2">
          <Maximize2 className="h-3.5 w-3.5" />
          Mantém a proporção {frame.ratio}
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" className="h-8 rounded-lg bg-white/95 text-xs" onClick={() => scaleCrop(0.86)}>
          Aproximar
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-8 rounded-lg bg-white/95 text-xs" onClick={() => scaleCrop(1.16)}>
          Afastar
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-8 rounded-lg bg-white/95 text-xs" onClick={() => {
          if (naturalSize) {
            onCropChange(getInitialCrop(naturalSize.width, naturalSize.height, getFrameRatio(frame), mode));
          }
        }}>
          Centrar
        </Button>
      </div>
      <div className="overflow-auto rounded-xl bg-slate-900 p-2">
        <div
          ref={stageRef}
          className="relative mx-auto w-fit max-w-full touch-none overflow-hidden rounded-lg"
          style={{ backgroundColor: mode === 'cover' ? undefined : background }}
          onPointerMove={updateInteraction}
          onPointerUp={endInteraction}
          onPointerCancel={endInteraction}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="block max-h-[68vh] max-w-full select-none"
            onLoad={(event) => {
              const nextSize = {
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              };
              setNaturalSize(nextSize);
              onImageReady(nextSize);
            }}
          />
          <div
            className="absolute cursor-move rounded-lg border-2 border-white shadow-[0_0_0_9999px_rgba(2,6,23,0.62)]"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.width * 100}%`,
              height: `${crop.height * 100}%`,
            }}
            onPointerDown={(event) => startInteraction('move', event)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.42)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.42)_1px,transparent_1px)] bg-[size:33.333%_33.333%]" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/70" />
            <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/70" />
            {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
              <button
                key={corner}
                type="button"
                aria-label={`Ajustar canto ${corner}`}
                className={`absolute h-5 w-5 rounded-full border-2 border-slate-950 bg-white shadow-md ring-1 ring-white/70 ${
                  corner === 'nw' ? 'left-1 top-1 cursor-nwse-resize' :
                  corner === 'ne' ? 'right-1 top-1 cursor-nesw-resize' :
                  corner === 'sw' ? 'bottom-1 left-1 cursor-nesw-resize' :
                  'bottom-1 right-1 cursor-nwse-resize'
                }`}
                onPointerDown={(event) => startInteraction(corner, event)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FitPreviewEditor({ src, alt, frame, mode, background, onImageReady }: {
  src: string;
  alt: string;
  frame: ReturnType<typeof resolveFrame>;
  mode: CmsImageFitMode;
  background: string;
  onImageReady: (size: { width: number; height: number }) => void;
}) {
  return (
    <div className="rounded-2xl bg-slate-950 p-3 shadow-inner ring-1 ring-slate-300">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-white/80">
        <span>{mode === 'original' ? 'Proporção original da imagem' : 'Imagem inteira dentro do formato'}</span>
        <span>{frame.ratio}</span>
      </div>
      <div className="overflow-auto rounded-xl bg-slate-900 p-2">
        <div
          className="relative mx-auto flex max-h-[68vh] max-w-full items-center justify-center overflow-hidden rounded-lg"
          style={{
            aspectRatio: `${frame.output.width} / ${frame.output.height}`,
            backgroundColor: background,
            width: 'min(100%, 860px)',
          }}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="h-full w-full select-none object-contain"
            onLoad={(event) => onImageReady({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })}
          />
        </div>
      </div>
    </div>
  );
}

function CropPreviewCard({ label, src, crop, frame, mode, background }: {
  label: string;
  src: string;
  crop: CropState;
  frame: ReturnType<typeof resolveFrame>;
  mode: CmsImageFitMode;
  background: string;
}) {
  const isContain = mode !== 'cover';
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2">
      <div
        className="relative overflow-hidden rounded-xl bg-slate-100"
        style={{ aspectRatio: `${frame.output.width} / ${frame.output.height}`, backgroundColor: isContain ? background : undefined }}
      >
        <img
          src={src}
          alt=""
          className={isContain ? 'h-full w-full object-contain' : 'absolute max-w-none'}
          style={isContain ? undefined : {
            left: `${-(crop.x / crop.width) * 100}%`,
            top: `${-(crop.y / crop.height) * 100}%`,
            width: `${100 / crop.width}%`,
            height: `${100 / crop.height}%`,
          }}
        />
      </div>
      <p className="mt-2 truncate px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}

function PreviewCard({ label, src, frame, mode, background }: {
  label: string;
  src: string;
  frame: ReturnType<typeof resolveFrame>;
  mode: CmsImageFitMode;
  background: string;
}) {
  const objectFit = mode === 'cover' ? 'object-cover' : 'object-contain';
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2">
      <div
        className="overflow-hidden rounded-xl bg-slate-100"
        style={{ aspectRatio: `${frame.output.width} / ${frame.output.height}`, backgroundColor: mode === 'cover' ? undefined : background }}
      >
        <img src={src} alt="" className={`h-full w-full ${objectFit}`} />
      </div>
      <p className="mt-2 truncate px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}

function ContactsPanel({ filteredItems, selected, setSelected, query, setQuery, isLoading }: {
  filteredItems: ContactRequestItem[];
  selected: ContactRequestItem | null;
  setSelected: (item: ContactRequestItem) => void;
  query: string;
  setQuery: (query: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar pedidos..." className="h-11 rounded-xl bg-slate-50 pl-10" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            {isLoading ? 'A carregar...' : `${filteredItems.length} pedido(s)`}
          </p>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className={`w-full cursor-pointer border-b border-slate-100 px-6 py-4 text-left transition-colors hover:bg-slate-50 ${
                selected?.id === item.id ? 'bg-jrs-green-start/5' : 'bg-white'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="truncate text-sm font-bold text-slate-900">{item.name}</h2>
                <span className="shrink-0 text-xs text-slate-400">{new Date(item.created_at).toLocaleString('pt-PT')}</span>
              </div>
              <p className="truncate text-sm text-slate-500">{item.email}</p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.message}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {selected ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-slate-900">{selected.name}</h2>
                <p className="mt-1 text-sm text-slate-500">Recebido em {new Date(selected.created_at).toLocaleString('pt-PT')}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-jrs-green-start/10 px-4 py-2 text-sm font-medium text-jrs-green-start">
                <Eye className="h-4 w-4" />
                {selected.source}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <a href={`mailto:${selected.email}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-jrs-green-start/40">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Mail className="h-4 w-4 text-jrs-green-start" />
                  {selected.email}
                </div>
              </a>
              <a href={`tel:${selected.phone}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-jrs-green-start/40">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Telefone</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Phone className="h-4 w-4 text-jrs-green-start" />
                  {selected.phone}
                </div>
              </a>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Mensagem</p>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{selected.message}</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[320px] items-center justify-center text-slate-400">Selecione um pedido.</div>
        )}
      </section>
    </div>
  );
}
