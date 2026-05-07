import { useState } from 'react';
import { staticCatalog, staticServices } from '@/src/lib/staticApiData';
import type { CmsProductCategory, CmsServiceItem } from '@/src/types/cms';

interface AsyncData<T> {
  data: T;
  isLoading: boolean;
  error: string;
  reload: () => void;
}

export function useCatalogData(): AsyncData<CmsProductCategory[]> {
  const [data, setData] = useState<CmsProductCategory[]>(() => staticCatalog());

  return {
    data,
    isLoading: false,
    error: '',
    reload: () => setData(staticCatalog()),
  };
}

export function useServicesData(): AsyncData<CmsServiceItem[]> {
  const [data, setData] = useState<CmsServiceItem[]>(() => staticServices());

  return {
    data,
    isLoading: false,
    error: '',
    reload: () => setData(staticServices()),
  };
}
