import type {
  CmsAdminPayload,
  CmsCatalogResponse,
  CmsEntityType,
  CmsImageFitMode,
  CmsImagePlacement,
  CmsProductCategory,
  CmsServiceItem,
  CmsServicesResponse,
  CmsSubCategory,
} from '@/src/types/cms';

export interface ContactRequestPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Pedido falhou.');
  }

  return data as T;
}

export async function submitContactRequest(payload: ContactRequestPayload) {
  return apiRequest<{ success: boolean }>('/api/contact-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminLogin(username: string, password: string) {
  return apiRequest<{ token: string; user: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchAdminContactRequests(token: string) {
  return apiRequest<{ data: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    message: string;
    source: string;
    created_at: string;
  }> }>('/api/admin/contact-requests', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchCatalog() {
  return apiRequest<CmsCatalogResponse>('/api/catalog');
}

export async function fetchServices() {
  return apiRequest<CmsServicesResponse>('/api/services');
}

function adminHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchAdminCms(token: string) {
  return apiRequest<CmsAdminPayload>('/api/admin/cms', {
    headers: adminHeaders(token),
  });
}

export async function seedAdminCmsDefaults(token: string) {
  return apiRequest<{ success: boolean }>('/api/admin/cms/seed-defaults', {
    method: 'POST',
    headers: adminHeaders(token),
  });
}

export async function saveAdminCategory(token: string, category: CmsProductCategory) {
  return apiRequest<{ data: CmsProductCategory }>('/api/admin/cms/categories', {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify(category),
  });
}

export async function archiveAdminCategory(token: string, id: string, status: 'active' | 'archived') {
  return apiRequest<{ success: boolean }>(`/api/admin/cms/categories/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: adminHeaders(token),
    body: JSON.stringify({ status }),
  });
}

export async function saveAdminProduct(token: string, categoryId: string, product: CmsSubCategory) {
  return apiRequest<{ data: CmsSubCategory }>('/api/admin/cms/products', {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify({ ...product, categoryId }),
  });
}

export async function archiveAdminProduct(token: string, id: string, status: 'active' | 'archived') {
  return apiRequest<{ success: boolean }>(`/api/admin/cms/products/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: adminHeaders(token),
    body: JSON.stringify({ status }),
  });
}

export async function saveAdminService(token: string, service: CmsServiceItem) {
  return apiRequest<{ data: CmsServiceItem }>('/api/admin/cms/services', {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify(service),
  });
}

export async function archiveAdminService(token: string, id: string, status: 'active' | 'archived') {
  return apiRequest<{ success: boolean }>(`/api/admin/cms/services/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: adminHeaders(token),
    body: JSON.stringify({ status }),
  });
}

export interface UploadCmsImagePayload {
  entityType: CmsEntityType;
  entityId: string;
  role: 'main' | 'gallery';
  replaceImageId?: number | string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  alt: string;
}

export async function uploadAdminCmsImage(token: string, payload: UploadCmsImagePayload) {
  return apiRequest<{ success: boolean }>('/api/admin/cms/images/upload', {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(payload),
  });
}

export interface SaveCmsImageVariantPayload {
  entityImageId: number | string;
  placement: CmsImagePlacement;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  crop: {
    x: number;
    y: number;
    zoom: number;
    rotate: number;
    sourceX?: number;
    sourceY?: number;
    sourceWidth?: number;
    sourceHeight?: number;
    width: number;
    height: number;
    mode?: CmsImageFitMode;
    aspectRatio?: string;
    objectFit?: 'cover' | 'contain';
    background?: string;
  };
}

export async function saveAdminCmsImageVariant(token: string, payload: SaveCmsImageVariantPayload) {
  return apiRequest<{
    success: boolean;
    data: {
      placement: CmsImagePlacement;
      publicUrl: string;
      width: number | null;
      height: number | null;
      mode?: CmsImageFitMode;
      aspectRatio?: string;
      objectFit?: 'cover' | 'contain';
      background?: string;
    };
  }>('/api/admin/cms/images/variant', {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCmsImage(token: string, imageId: number | string, payload: { alt?: string; status?: 'active' | 'archived'; sortOrder?: number }) {
  return apiRequest<{ success: boolean }>(`/api/admin/cms/images/${encodeURIComponent(String(imageId))}`, {
    method: 'PATCH',
    headers: adminHeaders(token),
    body: JSON.stringify(payload),
  });
}
