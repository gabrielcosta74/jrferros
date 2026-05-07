import 'dotenv/config';
import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { CATALOG, SERVICES } from '../src/constants';
import { getProductMeta } from '../src/lib/productHelpers';
import type {
  CmsEntityType,
  CmsImageFitMode,
  CmsImagePlacement,
  CmsImageRole,
  CmsProductCategory,
  CmsServiceItem,
  CmsStatus,
  CmsSubCategory,
} from '../src/types/cms';

const app = express();
const port = Number(process.env.PORT || 8787);
const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'website-media';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const publicDir = path.resolve(__dirname, '../public');
const entityPlacementsList: CmsImagePlacement[] = [
  'category_card',
  'product_card',
  'product_detail',
  'service_card',
  'service_banner',
];

app.use(express.json({ limit: '25mb' }));

const {
  SUPABASE_URL,
  SUPABASE_PROJECT_ID,
  SUPABASE_SERVICE_ROLE,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  ADMIN_SESSION_SECRET,
} = process.env;

const supabaseUrl = SUPABASE_URL
  ? SUPABASE_URL.replace(/\/$/, '')
  : SUPABASE_PROJECT_ID
  ? `https://${SUPABASE_PROJECT_ID.replace(/^https?:\/\//, '').replace(/\.supabase\.co\/?$/, '')}.supabase.co`
  : null;

function requireEnv(value: string | undefined, label: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${label}`);
  }
  return value;
}

function createToken(username: string) {
  const secret = requireEnv(ADMIN_SESSION_SECRET, 'ADMIN_SESSION_SECRET');
  const payload = {
    u: username,
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

function verifyToken(token: string) {
  const secret = requireEnv(ADMIN_SESSION_SECRET, 'ADMIN_SESSION_SECRET');
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
    u: string;
    exp: number;
  };

  if (!payload.exp || payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

function readBearerToken(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice('Bearer '.length);
}

async function supabaseRequest(path: string, init?: RequestInit) {
  const serviceRole = requireEnv(SUPABASE_SERVICE_ROLE, 'SUPABASE_SERVICE_ROLE');
  const baseUrl = requireEnv(supabaseUrl ?? undefined, 'SUPABASE_URL or SUPABASE_PROJECT_ID');

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text);
}

function publicStorageUrl(storagePath: string) {
  const baseUrl = requireEnv(supabaseUrl ?? undefined, 'SUPABASE_URL or SUPABASE_PROJECT_ID');
  return `${baseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
}

function mimeTypeForPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  return 'image/jpeg';
}

function localPublicFileForUrl(url: string) {
  if (!url.startsWith('/')) return null;
  const filePath = path.resolve(publicDir, `.${url}`);
  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) return null;
  return filePath;
}

async function seedImageAsset(sourceUrl: string, storagePathBase: string, alt: string) {
  const localFile = localPublicFileForUrl(sourceUrl);
  const originalName = sourceUrl.split('/').pop() || `${safeSlug(alt) || 'image'}.jpg`;
  const ext = path.extname(originalName) || '.jpg';
  const storagePath = `${storagePathBase}${ext}`;
  const mimeType = localFile ? mimeTypeForPath(localFile) : mimeTypeForPath(originalName);
  let publicUrl = sourceUrl;

  if (localFile) {
    await supabaseStorageUpload(storagePath, readFileSync(localFile), mimeType);
    publicUrl = publicStorageUrl(storagePath);
  }

  const rows = await supabaseRequest('/rest/v1/media_assets?on_conflict=storage_bucket,storage_path', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      storage_bucket: MEDIA_BUCKET,
      storage_path: storagePath,
      public_url: publicUrl,
      file_name: originalName,
      mime_type: mimeType,
      alt,
      status: 'active',
      updated_at: new Date().toISOString(),
    }),
  }) as MediaRow[];

  return rows[0]?.id as number | undefined;
}

async function supabaseStorageUpload(storagePath: string, bytes: Buffer, mimeType: string) {
  const serviceRole = requireEnv(SUPABASE_SERVICE_ROLE, 'SUPABASE_SERVICE_ROLE');
  const baseUrl = requireEnv(supabaseUrl ?? undefined, 'SUPABASE_PROJECT_ID');

  const response = await fetch(`${baseUrl}/storage/v1/object/${MEDIA_BUCKET}/${storagePath}`, {
    method: 'POST',
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
    body: bytes,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase storage upload failed (${response.status}): ${text}`);
  }
}

function requireAdmin(req: express.Request, res: express.Response) {
  const token = readBearerToken(req);
  if (!token || !verifyToken(token)) {
    res.status(401).json({ error: 'Sessão inválida.' });
    return false;
  }
  return true;
}

function safeSlug(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function assertStatus(status: unknown): CmsStatus {
  return status === 'archived' ? 'archived' : 'active';
}

function decodeDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Imagem inválida.');
  }

  return {
    mimeType: match[1],
    bytes: Buffer.from(match[2], 'base64'),
  };
}

function withCacheBust(url: string) {
  return url.startsWith('/') ? url : `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
}

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  description: string;
  sort_order: number;
  status: CmsStatus;
}

interface ProductRow {
  id: string;
  category_id: string;
  name: string;
  description: string;
  unit: string;
  group_label: string | null;
  no_photo: boolean;
  sizes: string[];
  material: string | null;
  finish: string | null;
  norm: string | null;
  standard_length: string | null;
  applications: string[];
  sort_order: number;
  status: CmsStatus;
}

interface ServiceRow {
  id: string;
  name: string;
  description: string;
  price_note: string;
  highlight: string;
  sort_order: number;
  status: CmsStatus;
}

interface MediaRow {
  id: number;
  public_url: string;
  alt: string;
  status: CmsStatus;
}

interface EntityImageRow {
  id: number;
  entity_type: CmsEntityType;
  entity_id: string;
  media_asset_id: number;
  role: CmsImageRole;
  sort_order: number;
  status: CmsStatus;
}

interface ImageVariantRow {
  entity_image_id: number;
  placement: CmsImagePlacement;
  public_url: string;
  crop?: unknown;
  width?: number | null;
  height?: number | null;
}

function assertImageMode(value: unknown): CmsImageFitMode {
  return value === 'contain' || value === 'original' ? value : 'cover';
}

function assertObjectFit(value: unknown): 'cover' | 'contain' {
  return value === 'contain' ? 'contain' : 'cover';
}

function imageVariantMeta(variant: ImageVariantRow) {
  const crop = variant.crop && typeof variant.crop === 'object'
    ? variant.crop as Record<string, unknown>
    : {};
  const mode = assertImageMode(crop.mode);
  const objectFit = mode === 'cover' ? 'cover' : 'contain';

  return {
    url: withCacheBust(variant.public_url),
    mode,
    aspectRatio: typeof crop.aspectRatio === 'string' ? crop.aspectRatio : undefined,
    objectFit: assertObjectFit(crop.objectFit ?? objectFit),
    background: typeof crop.background === 'string' ? crop.background : '#f1f5f9',
    width: variant.width ?? null,
    height: variant.height ?? null,
  };
}

async function loadImages(_includeArchived = false) {
  const statusFilter = '&status=eq.active';
  const entityImages = await supabaseRequest(
    `/rest/v1/entity_images?select=*&order=sort_order.asc${statusFilter}`
  ) as EntityImageRow[];

  const mediaIds = [...new Set(entityImages.map((image) => image.media_asset_id))];
  const imageIds = entityImages.map((image) => image.id);

  const mediaRows = mediaIds.length
    ? await supabaseRequest(`/rest/v1/media_assets?select=*&id=in.(${mediaIds.join(',')})`) as MediaRow[]
    : [];
  const variantRows = imageIds.length
    ? await supabaseRequest(`/rest/v1/image_variants?select=*&entity_image_id=in.(${imageIds.join(',')})`) as ImageVariantRow[]
    : [];

  const mediaById = new Map(mediaRows.map((row) => [row.id, row]));
  const variantsByImage = new Map<number, Partial<Record<CmsImagePlacement, string>>>();
  const variantMetaByImage = new Map<number, Partial<Record<CmsImagePlacement, ReturnType<typeof imageVariantMeta>>>>();
  variantRows.forEach((variant) => {
    const variants = variantsByImage.get(variant.entity_image_id) ?? {};
    const meta = variantMetaByImage.get(variant.entity_image_id) ?? {};
    const nextMeta = imageVariantMeta(variant);
    variants[variant.placement] = nextMeta.url;
    meta[variant.placement] = nextMeta;
    variantsByImage.set(variant.entity_image_id, variants);
    variantMetaByImage.set(variant.entity_image_id, meta);
  });

  return entityImages
    .map((image) => {
      const media = mediaById.get(image.media_asset_id);
      if (!media) return null;
      return {
        id: image.id,
        entityType: image.entity_type,
        entityId: image.entity_id,
        assetId: image.media_asset_id,
        role: image.role,
        sortOrder: image.sort_order,
        url: withCacheBust(media.public_url),
        alt: media.alt,
        variants: variantsByImage.get(image.id) ?? {},
        variantMeta: variantMetaByImage.get(image.id) ?? {},
      };
    })
    .filter(Boolean) as Array<{
      id: number;
      entityType: CmsEntityType;
      entityId: string;
      assetId: number;
      role: CmsImageRole;
      sortOrder: number;
      url: string;
      alt: string;
      variants: Partial<Record<CmsImagePlacement, string>>;
      variantMeta: Partial<Record<CmsImagePlacement, ReturnType<typeof imageVariantMeta>>>;
    }>;
}

async function loadCatalog(includeArchived = false): Promise<CmsProductCategory[]> {
  const statusFilter = includeArchived ? '' : '&status=eq.active';
  const categories = await supabaseRequest(
    `/rest/v1/catalog_categories?select=*&order=sort_order.asc${statusFilter}`
  ) as CategoryRow[];
  const products = await supabaseRequest(
    `/rest/v1/catalog_products?select=*&order=sort_order.asc${statusFilter}`
  ) as ProductRow[];
  const images = await loadImages(includeArchived);

  const imageFor = (entityType: CmsEntityType, entityId: string, fallback: string, placement: CmsImagePlacement) => {
    const entityImages = images.filter((image) => image.entityType === entityType && image.entityId === entityId);
    const main = entityImages.find((image) => image.role === 'main') ?? entityImages[0];
    return {
      image: main?.variants[placement] ?? main?.url ?? fallback,
      imageAlt: main?.alt,
      mainImage: main
        ? {
            id: main.id,
            assetId: main.assetId,
            role: main.role,
            url: main.url,
            alt: main.alt,
            sortOrder: main.sortOrder,
            variants: main.variants,
            variantMeta: main.variantMeta,
          }
        : undefined,
      imageVariants: main?.variants,
      imageVariantMeta: main?.variantMeta,
      gallery: entityImages
        .filter((image) => image.role === 'gallery')
        .map((image) => ({
          id: image.id,
          assetId: image.assetId,
          role: image.role,
          url: image.url,
          alt: image.alt,
          sortOrder: image.sortOrder,
          variants: image.variants,
          variantMeta: image.variantMeta,
        })),
    };
  };

  return categories.map((category) => {
    const categoryImages = imageFor('category', category.id, '', 'category_card');
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      description: category.description,
      image: categoryImages.image,
      imageAlt: categoryImages.imageAlt,
      mainImage: categoryImages.mainImage,
      imageVariants: categoryImages.imageVariants,
      imageVariantMeta: categoryImages.imageVariantMeta,
      gallery: categoryImages.gallery,
      status: category.status,
      sortOrder: category.sort_order,
      subcategories: products
        .filter((product) => product.category_id === category.id)
        .map((product) => {
          const productImages = imageFor('product', product.id, '', 'product_card');
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            image: productImages.image,
            imageAlt: productImages.imageAlt,
            mainImage: productImages.mainImage,
            imageVariants: productImages.imageVariants,
            imageVariantMeta: productImages.imageVariantMeta,
            gallery: productImages.gallery,
            unit: product.unit,
            sizes: product.sizes ?? [],
            group: product.group_label ?? undefined,
            noPhoto: product.no_photo,
            material: product.material ?? undefined,
            finish: product.finish ?? undefined,
            norm: product.norm,
            standardLength: product.standard_length,
            applications: product.applications ?? [],
            status: product.status,
            sortOrder: product.sort_order,
          };
        }),
    };
  });
}

async function loadServices(includeArchived = false): Promise<CmsServiceItem[]> {
  const statusFilter = includeArchived ? '' : '&status=eq.active';
  const services = await supabaseRequest(
    `/rest/v1/services?select=*&order=sort_order.asc${statusFilter}`
  ) as ServiceRow[];
  const images = await loadImages(includeArchived);

  return services.map((service) => {
    const entityImages = images.filter((image) => image.entityType === 'service' && image.entityId === service.id);
    const main = entityImages.find((image) => image.role === 'main') ?? entityImages[0];
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      image: main?.variants.service_card ?? main?.url ?? '',
      imageAlt: main?.alt,
      mainImage: main
        ? {
            id: main.id,
            assetId: main.assetId,
            role: main.role,
            url: main.url,
            alt: main.alt,
            sortOrder: main.sortOrder,
            variants: main.variants,
            variantMeta: main.variantMeta,
          }
        : undefined,
      imageVariants: main?.variants,
      imageVariantMeta: main?.variantMeta,
      gallery: entityImages
        .filter((image) => image.role === 'gallery')
        .map((image) => ({
          id: image.id,
          assetId: image.assetId,
          role: image.role,
          url: image.url,
          alt: image.alt,
          sortOrder: image.sortOrder,
          variants: image.variants,
          variantMeta: image.variantMeta,
        })),
      priceNote: service.price_note,
      highlight: service.highlight,
      status: service.status,
      sortOrder: service.sort_order,
    };
  });
}

async function upsertEntityImageSlot(payload: {
  entityType: CmsEntityType;
  entityId: string;
  mediaAssetId: number;
  role: CmsImageRole;
  sortOrder: number;
}) {
  const existing = await supabaseRequest(
    `/rest/v1/entity_images?select=id&entity_type=eq.${payload.entityType}&entity_id=eq.${encodeURIComponent(payload.entityId)}&role=eq.${payload.role}&sort_order=eq.${payload.sortOrder}`
  ) as Array<{ id: number }>;

  if (existing[0]?.id) {
    await supabaseRequest(`/rest/v1/entity_images?id=eq.${existing[0].id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        media_asset_id: payload.mediaAssetId,
        status: 'active',
        updated_at: new Date().toISOString(),
      }),
    });
    return;
  }

  await supabaseRequest('/rest/v1/entity_images', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      media_asset_id: payload.mediaAssetId,
      role: payload.role,
      sort_order: payload.sortOrder,
      status: 'active',
      updated_at: new Date().toISOString(),
    }),
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/catalog', async (_req, res) => {
  try {
    const data = await loadCatalog(false);
    return res.json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Não foi possível carregar o catálogo.',
      details: error instanceof Error ? error.message : 'unknown_error',
    });
  }
});

app.get('/api/services', async (_req, res) => {
  try {
    const data = await loadServices(false);
    return res.json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Não foi possível carregar os serviços.',
      details: error instanceof Error ? error.message : 'unknown_error',
    });
  }
});

app.get('/api/admin/cms', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [categories, services] = await Promise.all([loadCatalog(true), loadServices(true)]);
    return res.json({ categories, services });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Não foi possível carregar o CMS.',
      details: error instanceof Error ? error.message : 'unknown_error',
    });
  }
});

app.post('/api/admin/cms/seed-defaults', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    for (const [categoryIndex, category] of CATALOG.entries()) {
      await supabaseRequest('/rest/v1/catalog_categories?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          id: category.id,
          name: category.name,
          icon: category.icon,
          description: category.description,
          sort_order: categoryIndex,
          status: 'active',
          updated_at: new Date().toISOString(),
        }),
      });

      const mediaId = await seedImageAsset(
        category.image,
        `defaults/category/${category.id}/main`,
        category.name
      );
      if (mediaId) {
        await upsertEntityImageSlot({
          entityType: 'category',
          entityId: category.id,
          mediaAssetId: mediaId,
          role: 'main',
          sortOrder: 0,
        });
      }

      for (const [productIndex, product] of category.subcategories.entries()) {
        const meta = getProductMeta(category.id, product.id);
        await supabaseRequest('/rest/v1/catalog_products?on_conflict=id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({
            id: product.id,
            category_id: category.id,
            name: product.name,
            description: product.description,
            unit: product.unit,
            group_label: product.group ?? null,
            no_photo: Boolean(product.noPhoto),
            sizes: product.sizes,
            material: meta.material,
            finish: meta.finish,
            norm: meta.norm,
            standard_length: meta.standardLength,
            applications: meta.applications,
            sort_order: productIndex,
            status: 'active',
            updated_at: new Date().toISOString(),
          }),
        });

        const productMediaId = await seedImageAsset(
          product.image,
          `defaults/product/${product.id}/main`,
          product.name
        );
        if (productMediaId) {
          await upsertEntityImageSlot({
            entityType: 'product',
            entityId: product.id,
            mediaAssetId: productMediaId,
            role: 'main',
            sortOrder: 0,
          });
        }
      }
    }

    for (const [serviceIndex, service] of SERVICES.entries()) {
      await supabaseRequest('/rest/v1/services?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          id: service.id,
          name: service.name,
          description: service.description,
          price_note: service.priceNote,
          highlight: service.highlight,
          sort_order: serviceIndex,
          status: 'active',
          updated_at: new Date().toISOString(),
        }),
      });

      const serviceMediaId = await seedImageAsset(
        service.image,
        `defaults/service/${service.id}/main`,
        service.name
      );
      if (serviceMediaId) {
        await upsertEntityImageSlot({
          entityType: 'service',
          entityId: service.id,
          mediaAssetId: serviceMediaId,
          role: 'main',
          sortOrder: 0,
        });
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error instanceof Error
        ? `Não foi possível criar os dados iniciais: ${error.message}`
        : 'Não foi possível criar os dados iniciais.',
      details: error instanceof Error ? error.message : 'unknown_error',
    });
  }
});

app.put('/api/admin/cms/categories', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const category = req.body as Partial<CmsProductCategory>;
    const id = category.id?.trim() || safeSlug(category.name);
    const name = String(category.name ?? '').trim();
    if (!id || !name) {
      return res.status(400).json({ error: 'Categoria inválida.' });
    }

    await supabaseRequest('/rest/v1/catalog_categories?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        id,
        name,
        icon: category.icon ?? '',
        description: category.description ?? '',
        sort_order: category.sortOrder ?? 0,
        status: assertStatus(category.status),
        updated_at: new Date().toISOString(),
      }),
    });

    return res.json({ data: { ...category, id } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível guardar a categoria.' });
  }
});

app.patch('/api/admin/cms/categories/:id/status', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    await supabaseRequest(`/rest/v1/catalog_categories?id=eq.${encodeURIComponent(req.params.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: assertStatus(req.body?.status), updated_at: new Date().toISOString() }),
    });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível atualizar a categoria.' });
  }
});

app.put('/api/admin/cms/products', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const product = req.body as Partial<CmsSubCategory> & { categoryId?: string };
    const id = product.id?.trim() || safeSlug(product.name);
    const name = String(product.name ?? '').trim();
    if (!id || !name || !product.categoryId) {
      return res.status(400).json({ error: 'Produto inválido.' });
    }

    await supabaseRequest('/rest/v1/catalog_products?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        id,
        category_id: product.categoryId,
        name,
        description: product.description ?? '',
        unit: product.unit ?? 'un',
        group_label: product.group || null,
        no_photo: Boolean(product.noPhoto),
        sizes: product.sizes ?? [],
        material: product.material || null,
        finish: product.finish || null,
        norm: product.norm || null,
        standard_length: product.standardLength || null,
        applications: product.applications ?? [],
        sort_order: product.sortOrder ?? 0,
        status: assertStatus(product.status),
        updated_at: new Date().toISOString(),
      }),
    });

    return res.json({ data: { ...product, id } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível guardar o produto.' });
  }
});

app.patch('/api/admin/cms/products/:id/status', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    await supabaseRequest(`/rest/v1/catalog_products?id=eq.${encodeURIComponent(req.params.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: assertStatus(req.body?.status), updated_at: new Date().toISOString() }),
    });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível atualizar o produto.' });
  }
});

app.put('/api/admin/cms/services', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const service = req.body as Partial<CmsServiceItem>;
    const id = service.id?.trim() || safeSlug(service.name);
    const name = String(service.name ?? '').trim();
    if (!id || !name) {
      return res.status(400).json({ error: 'Serviço inválido.' });
    }

    await supabaseRequest('/rest/v1/services?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        id,
        name,
        description: service.description ?? '',
        price_note: service.priceNote ?? '',
        highlight: service.highlight ?? '',
        sort_order: service.sortOrder ?? 0,
        status: assertStatus(service.status),
        updated_at: new Date().toISOString(),
      }),
    });

    return res.json({ data: { ...service, id } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível guardar o serviço.' });
  }
});

app.patch('/api/admin/cms/services/:id/status', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    await supabaseRequest(`/rest/v1/services?id=eq.${encodeURIComponent(req.params.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: assertStatus(req.body?.status), updated_at: new Date().toISOString() }),
    });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível atualizar o serviço.' });
  }
});

app.post('/api/admin/cms/images/upload', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { entityType, entityId, role, replaceImageId, fileName, mimeType, dataUrl, alt } = req.body ?? {};
    if (!['category', 'product', 'service'].includes(entityType) || !entityId || !['main', 'gallery'].includes(role)) {
      return res.status(400).json({ error: 'Destino da imagem inválido.' });
    }

    const replaceId = replaceImageId ? Number(replaceImageId) : null;
    if (replaceImageId && (!Number.isInteger(replaceId) || replaceId <= 0)) {
      return res.status(400).json({ error: 'Imagem a substituir inválida.' });
    }

    const decoded = decodeDataUrl(String(dataUrl));
    const finalMime = String(mimeType || decoded.mimeType);
    const ext = String(fileName || 'image').split('.').pop() || 'jpg';
    const storagePath = `catalog/${entityType}s/${entityId}/${role}-${Date.now()}.${ext}`;
    await supabaseStorageUpload(storagePath, decoded.bytes, finalMime);

    const publicUrl = publicStorageUrl(storagePath);
    const mediaRows = await supabaseRequest('/rest/v1/media_assets', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        storage_bucket: MEDIA_BUCKET,
        storage_path: storagePath,
        public_url: publicUrl,
        file_name: fileName || storagePath.split('/').pop(),
        mime_type: finalMime,
        alt: alt || '',
        status: 'active',
      }),
    }) as MediaRow[];

    if (replaceId) {
      const imageRows = await supabaseRequest(
        `/rest/v1/entity_images?select=*&id=eq.${replaceId}`
      ) as EntityImageRow[];
      const imageToReplace = imageRows[0];

      if (
        !imageToReplace ||
        imageToReplace.entity_type !== entityType ||
        imageToReplace.entity_id !== String(entityId) ||
        imageToReplace.role !== role
      ) {
        return res.status(400).json({ error: 'A imagem escolhida não pertence a este item.' });
      }

      await supabaseRequest(`/rest/v1/entity_images?id=eq.${replaceId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          media_asset_id: mediaRows[0].id,
          status: 'active',
          updated_at: new Date().toISOString(),
        }),
      });

      await supabaseRequest(`/rest/v1/image_variants?entity_image_id=eq.${replaceId}`, {
        method: 'DELETE',
      });

      return res.json({ success: true });
    }

    const existingImages = await supabaseRequest(
      `/rest/v1/entity_images?select=sort_order&entity_type=eq.${entityType}&entity_id=eq.${encodeURIComponent(String(entityId))}&role=eq.${role}`
    ) as Array<{ sort_order: number }>;

    if (role === 'main') {
      await supabaseRequest(`/rest/v1/entity_images?entity_type=eq.${entityType}&entity_id=eq.${encodeURIComponent(String(entityId))}&role=eq.main`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'archived', updated_at: new Date().toISOString() }),
      });
    }

    await supabaseRequest('/rest/v1/entity_images', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        entity_type: entityType,
        entity_id: entityId,
        media_asset_id: mediaRows[0].id,
        role,
        sort_order: role === 'main' ? 0 : existingImages.length,
        status: 'active',
      }),
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Não foi possível carregar a imagem.',
      details: error instanceof Error ? error.message : 'unknown_error',
    });
  }
});

app.post('/api/admin/cms/images/variant', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { entityImageId, placement, fileName, mimeType, dataUrl, crop } = req.body ?? {};
    if (!entityImageId || !entityPlacementsList.includes(placement)) {
      return res.status(400).json({ error: 'Variante de imagem inválida.' });
    }

    const decoded = decodeDataUrl(String(dataUrl));
    const finalMime = String(mimeType || decoded.mimeType);
    const ext = String(fileName || 'image').split('.').pop() || 'jpg';
    const storagePath = `catalog/variants/${entityImageId}/${placement}-${Date.now()}.${ext}`;
    const publicUrl = publicStorageUrl(storagePath);
    await supabaseStorageUpload(storagePath, decoded.bytes, finalMime);

    const rows = await supabaseRequest('/rest/v1/image_variants?on_conflict=entity_image_id,placement', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        entity_image_id: entityImageId,
        placement,
        storage_bucket: MEDIA_BUCKET,
        storage_path: storagePath,
        public_url: publicUrl,
        crop: crop ?? {},
        width: crop?.width ?? null,
        height: crop?.height ?? null,
        updated_at: new Date().toISOString(),
      }),
    }) as ImageVariantRow[];

    const savedVariant = rows[0];
    if (!savedVariant?.public_url) {
      throw new Error('A variante foi enviada, mas não foi confirmada pela base de dados.');
    }

    return res.json({
      success: true,
      data: {
        placement: savedVariant.placement,
        publicUrl: withCacheBust(savedVariant.public_url),
        width: savedVariant.width ?? null,
        height: savedVariant.height ?? null,
        mode: assertImageMode(crop?.mode),
        aspectRatio: typeof crop?.aspectRatio === 'string' ? crop.aspectRatio : undefined,
        objectFit: assertObjectFit(crop?.objectFit ?? (crop?.mode === 'cover' ? 'cover' : 'contain')),
        background: typeof crop?.background === 'string' ? crop.background : '#f1f5f9',
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Não foi possível guardar o recorte.',
      details: error instanceof Error ? error.message : 'unknown_error',
    });
  }
});

app.patch('/api/admin/cms/images/:id', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const imageRows = await supabaseRequest(`/rest/v1/entity_images?select=media_asset_id&id=eq.${encodeURIComponent(req.params.id)}`) as Array<{ media_asset_id: number }>;
    const mediaId = imageRows[0]?.media_asset_id;

    if (typeof req.body?.sortOrder === 'number' || req.body?.status) {
      await supabaseRequest(`/rest/v1/entity_images?id=eq.${encodeURIComponent(req.params.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          sort_order: typeof req.body.sortOrder === 'number' ? req.body.sortOrder : undefined,
          status: req.body.status ? assertStatus(req.body.status) : undefined,
          updated_at: new Date().toISOString(),
        }),
      });
    }

    if (mediaId && typeof req.body?.alt === 'string') {
      await supabaseRequest(`/rest/v1/media_assets?id=eq.${mediaId}`, {
        method: 'PATCH',
        body: JSON.stringify({ alt: req.body.alt, updated_at: new Date().toISOString() }),
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível atualizar a imagem.' });
  }
});

app.post('/api/contact-requests', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body ?? {};

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Dados incompletos.' });
    }

    const payload = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      message: String(message).trim(),
      source: 'website',
    };

    const data = await supabaseRequest('/rest/v1/contact_requests', {
      method: 'POST',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    return res.status(201).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Não foi possível guardar o pedido.',
      details: error instanceof Error ? error.message : 'unknown_error',
    });
  }
});

app.post('/api/admin/login', (req, res) => {
  try {
    const username = requireEnv(ADMIN_USERNAME, 'ADMIN_USERNAME');
    const password = requireEnv(ADMIN_PASSWORD, 'ADMIN_PASSWORD');
    const submittedUsername = String(req.body?.username ?? '');
    const submittedPassword = String(req.body?.password ?? '');

    if (submittedUsername !== username || submittedPassword !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    return res.json({
      token: createToken(username),
      user: username,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'login_failed',
    });
  }
});

app.get('/api/admin/contact-requests', async (req, res) => {
  try {
    const token = readBearerToken(req);
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Sessão inválida.' });
    }

    const data = await supabaseRequest('/rest/v1/contact_requests?select=*&order=created_at.desc');
    return res.json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Não foi possível carregar os pedidos.',
      details: error instanceof Error ? error.message : 'unknown_error',
    });
  }
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    return res.sendFile(path.join(distDir, 'index.html'));
  });
}

if (!process.env.VERCEL) {
  app.listen(port, () => {
    const mode = existsSync(distDir) ? 'API + frontend' : 'API only';
    console.log(`${mode} server listening on http://localhost:${port}`);
  });
}

export default app;
