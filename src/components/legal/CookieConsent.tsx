import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/src/components/ui/button';

const STORAGE_KEY = 'jrs_cookie_preferences';
const EVENT_NAME = 'jrs-cookie-preferences-changed';

export interface CookiePreferences {
  externalMedia: boolean;
  decidedAt: string | null;
}

const defaultPreferences: CookiePreferences = {
  externalMedia: false,
  decidedAt: null,
};

function readPreferences(): CookiePreferences {
  if (typeof window === 'undefined') return defaultPreferences;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

export function saveCookiePreferences(preferences: Omit<CookiePreferences, 'decidedAt'>) {
  if (typeof window === 'undefined') return;

  const nextPreferences: CookiePreferences = {
    ...preferences,
    decidedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPreferences));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: nextPreferences }));
}

export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    setPreferences(readPreferences());

    const handleChange = () => setPreferences(readPreferences());
    window.addEventListener(EVENT_NAME, handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      window.removeEventListener(EVENT_NAME, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  return preferences;
}

export function CookieConsentBanner() {
  const preferences = useCookiePreferences();

  if (preferences.decidedAt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-lg font-bold text-jrs-black">Privacidade e cookies</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Usamos apenas armazenamento técnico necessário. Serviços externos, como o Google Maps, só são carregados com a sua autorização.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="rounded-full border-slate-300 px-6"
            onClick={() => saveCookiePreferences({ externalMedia: false })}
          >
            Recusar externos
          </Button>
          <Button
            className="rounded-full px-6"
            onClick={() => saveCookiePreferences({ externalMedia: true })}
          >
            Aceitar externos
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ExternalMediaGate({ children, serviceName }: { children: ReactNode; serviceName: string }) {
  const preferences = useCookiePreferences();

  if (preferences.externalMedia) {
    return <>{children}</>;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-8 text-center text-white">
      <p className="mb-3 text-sm font-bold uppercase tracking-widest text-jrs-green-start">Conteúdo externo bloqueado</p>
      <h3 className="mb-3 font-display text-2xl font-bold">{serviceName}</h3>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-300">
        Para proteger a sua privacidade, este conteúdo só é carregado depois de permitir serviços externos.
      </p>
      <Button className="rounded-full px-6" onClick={() => saveCookiePreferences({ externalMedia: true })}>
        Permitir e carregar mapa
      </Button>
    </div>
  );
}

export function CookiePreferenceControls() {
  const preferences = useCookiePreferences();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="mb-4 text-sm text-slate-600">
        Estado atual: {preferences.externalMedia ? 'serviços externos permitidos' : 'serviços externos bloqueados'}.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="rounded-full px-6" onClick={() => saveCookiePreferences({ externalMedia: true })}>
          Permitir serviços externos
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-slate-300 px-6"
          onClick={() => saveCookiePreferences({ externalMedia: false })}
        >
          Bloquear serviços externos
        </Button>
      </div>
    </div>
  );
}
