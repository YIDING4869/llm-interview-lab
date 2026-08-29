export type AnalyticsEventName = 'site_enter' | 'practice_start' | 'practice_complete' | 'lab_open';

export type CampaignAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

type EventProperties = Record<string, string | number | boolean | undefined>;

const attributionKey = 'llm-interview-lab-attribution-v1';
const eventKey = 'llm-interview-lab-events-v1';
const sessionKey = 'llm-interview-lab-session-v1';
const siteEnterKey = 'llm-interview-lab-site-enter-v1';
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

function readJson<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export function captureAttribution(): CampaignAttribution {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const incoming = campaignKeys.reduce<CampaignAttribution>((result, key) => {
    const value = params.get(key);
    if (value) result[key] = value;
    return result;
  }, {});

  if (Object.keys(incoming).length > 0) {
    window.sessionStorage.setItem(attributionKey, JSON.stringify(incoming));
    return incoming;
  }

  return readJson(window.sessionStorage, attributionKey, {});
}

function sessionId() {
  const existing = window.sessionStorage.getItem(sessionKey);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.sessionStorage.setItem(sessionKey, created);
  return created;
}

export function trackEvent(name: AnalyticsEventName, properties: EventProperties = {}) {
  if (typeof window === 'undefined') return;

  const attribution = captureAttribution();
  const payload = {
    event: name,
    occurred_at: new Date().toISOString(),
    session_id: sessionId(),
    path: `${window.location.pathname}${window.location.search}`,
    referrer_host: document.referrer ? new URL(document.referrer).host : '',
    ...attribution,
    ...properties,
  };

  const events = readJson<Array<typeof payload>>(window.localStorage, eventKey, []);
  window.localStorage.setItem(eventKey, JSON.stringify([...events, payload].slice(-100)));

  const analyticsWindow = window as typeof window & {
    gtag?: (command: string, eventName: string, parameters: Record<string, unknown>) => void;
    dataLayer?: Array<Record<string, unknown>>;
  };

  if (analyticsWindow.gtag) {
    analyticsWindow.gtag('event', name, payload);
  } else if (analyticsWindow.dataLayer) {
    analyticsWindow.dataLayer.push(payload);
  }

  window.dispatchEvent(new CustomEvent('llm-lab:analytics', { detail: payload }));
}

export function trackSiteEnterOnce() {
  if (typeof window === 'undefined' || window.sessionStorage.getItem(siteEnterKey)) return;
  window.sessionStorage.setItem(siteEnterKey, '1');
  trackEvent('site_enter');
}
