import { useEffect, useState } from 'react';
import { fetchCatalog, fetchServices } from '@/src/lib/api';
import type { CmsProductCategory, CmsServiceItem } from '@/src/types/cms';

interface AsyncData<T> {
  data: T;
  isLoading: boolean;
  error: string;
  reload: () => void;
}

export function useCatalogData(): AsyncData<CmsProductCategory[]> {
  const [data, setData] = useState<CmsProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    fetchCatalog()
      .then((response) => {
        if (!cancelled) setData(response.data);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setData([]);
          setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o catálogo.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    data,
    isLoading,
    error,
    reload: () => setReloadKey((key) => key + 1),
  };
}

export function useServicesData(): AsyncData<CmsServiceItem[]> {
  const [data, setData] = useState<CmsServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    fetchServices()
      .then((response) => {
        if (!cancelled) setData(response.data);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setData([]);
          setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os serviços.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    data,
    isLoading,
    error,
    reload: () => setReloadKey((key) => key + 1),
  };
}
