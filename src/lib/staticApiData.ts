import { CATALOG, SERVICES } from '../constants';
import type { CmsProductCategory, CmsServiceItem } from '../types/cms';

export function staticCatalog(): CmsProductCategory[] {
  return CATALOG.map((category, categoryIndex) => ({
    ...category,
    status: 'active',
    sortOrder: categoryIndex,
    gallery: [],
    subcategories: category.subcategories.map((product, productIndex) => ({
      ...product,
      status: 'active',
      sortOrder: productIndex,
      material: undefined,
      finish: undefined,
      norm: null,
      standardLength: null,
      applications: [],
      gallery: [],
    })),
  }));
}

export function staticServices(): CmsServiceItem[] {
  return SERVICES.map((service, serviceIndex) => ({
    ...service,
    status: 'active',
    sortOrder: serviceIndex,
    gallery: [],
  }));
}
