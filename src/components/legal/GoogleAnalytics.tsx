import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCookiePreferences } from '@/src/components/legal/CookieConsent';

const GA_MEASUREMENT_ID = 'G-NG7KJWDH68';
const GA_SCRIPT_ID = 'google-analytics-gtag';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

function initializeGoogleAnalytics() {
  if (typeof window === 'undefined' || document.getElementById(GA_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
}

export function GoogleAnalytics() {
  const preferences = useCookiePreferences();
  const location = useLocation();

  useEffect(() => {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = !preferences.externalMedia;

    if (!preferences.externalMedia) return;

    initializeGoogleAnalytics();
  }, [preferences.externalMedia]);

  useEffect(() => {
    if (!preferences.externalMedia || !window.gtag) return;

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: `${location.pathname}${location.search}`,
    });
  }, [location.pathname, location.search, preferences.externalMedia]);

  return null;
}
