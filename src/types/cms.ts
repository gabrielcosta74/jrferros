export type CmsStatus = 'active' | 'archived';

export type CmsEntityType = 'category' | 'product' | 'service';

export type CmsImageRole = 'main' | 'gallery';

export type CmsImagePlacement =
  | 'category_card'
  | 'product_card'
  | 'product_detail'
  | 'service_card'
  | 'service_banner';

export type CmsImageFitMode = 'cover' | 'contain' | 'original';

export interface CmsImageVariantMeta {
  url: string;
  mode?: CmsImageFitMode;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain';
  background?: string;
  width?: number | null;
  height?: number | null;
}

export interface CmsCropSettings {
  x: number;
  y: number;
  zoom: number;
  rotate: number;
  mode?: CmsImageFitMode;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain';
  background?: string;
  width: number;
  height: number;
}

export interface CmsImage {
  id: number | string;
  assetId?: number | string;
  role: CmsImageRole;
  url: string;
  alt: string;
  sortOrder: number;
  variants?: Partial<Record<CmsImagePlacement, string>>;
  variantMeta?: Partial<Record<CmsImagePlacement, CmsImageVariantMeta>>;
}

export interface CmsSubCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  imageAlt?: string;
  mainImage?: CmsImage;
  imageVariants?: Partial<Record<CmsImagePlacement, string>>;
  imageVariantMeta?: Partial<Record<CmsImagePlacement, CmsImageVariantMeta>>;
  gallery?: CmsImage[];
  unit: string;
  sizes: string[];
  group?: string;
  noPhoto?: boolean;
  material?: string;
  finish?: string;
  norm?: string | null;
  standardLength?: string | null;
  applications?: string[];
  status?: CmsStatus;
  sortOrder?: number;
}

export interface CmsProductCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  image: string;
  imageAlt?: string;
  mainImage?: CmsImage;
  imageVariants?: Partial<Record<CmsImagePlacement, string>>;
  imageVariantMeta?: Partial<Record<CmsImagePlacement, CmsImageVariantMeta>>;
  gallery?: CmsImage[];
  subcategories: CmsSubCategory[];
  status?: CmsStatus;
  sortOrder?: number;
}

export interface CmsServiceItem {
  id: string;
  name: string;
  description: string;
  image: string;
  imageAlt?: string;
  mainImage?: CmsImage;
  imageVariants?: Partial<Record<CmsImagePlacement, string>>;
  imageVariantMeta?: Partial<Record<CmsImagePlacement, CmsImageVariantMeta>>;
  gallery?: CmsImage[];
  priceNote: string;
  highlight: string;
  status?: CmsStatus;
  sortOrder?: number;
}

export interface CmsCatalogResponse {
  data: CmsProductCategory[];
}

export interface CmsServicesResponse {
  data: CmsServiceItem[];
}

export interface CmsAdminPayload {
  categories: CmsProductCategory[];
  services: CmsServiceItem[];
}
