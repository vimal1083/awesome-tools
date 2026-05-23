// Google Analytics Event & User Engagement Telemetry Client
// Powered by standard GA4 tag and local interactive sandbox debugger.

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  category: 'User Engagement' | 'Product Settings' | 'Interactions' | 'Performance';
  name: string;
  parameters: Record<string, any>;
}

// Global analytics list that the UI can tap into with standard reactive listeners
let globalTelemetryQueue: TelemetryEvent[] = [];
const telemetryListeners = new Set<(logs: TelemetryEvent[]) => void>();

export function subscribeToTelemetry(listener: (logs: TelemetryEvent[]) => void) {
  telemetryListeners.add(listener);
  listener([...globalTelemetryQueue]);
  return () => {
    telemetryListeners.delete(listener);
  };
}

function notifyTelemetryUpdate() {
  const currentLogs = [...globalTelemetryQueue];
  telemetryListeners.forEach(listener => listener(currentLogs));
}

// Dynamic script loader for global site tracking (gtag.js)
let gaInitialized = false;
const TRACK_ID = (import.meta as any).env?.VITE_GA_TRACKING_ID || 'G-MOCKYTTP100'; // Default mock key for sandbox preview

export function initGoogleAnalytics() {
  if (gaInitialized) return;
  if (typeof window === 'undefined') return;

  try {
    // 1. Inject script tags
    const scriptTag = document.createElement('script');
    scriptTag.async = true;
    scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${TRACK_ID}`;
    document.head.appendChild(scriptTag);

    // 2. Initialize layer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', TRACK_ID, {
      send_page_view: true,
      cookie_flags: 'max-age=7200;Secure;SameSite=None',
    });

    gaInitialized = true;
    
    // Log system init telemetry
    logTelemetryEvent('User Engagement', 'analytics_ready', {
      trackingId: TRACK_ID,
      environment: (import.meta as any).env?.MODE || 'production',
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error('GA script injection ignored:', error);
  }
}

// Log generic tracking event
export function logTelemetryEvent(
  category: TelemetryEvent['category'],
  name: string,
  parameters: Record<string, any> = {}
) {
  const newEvent: TelemetryEvent = {
    id: `ev-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleTimeString(),
    category,
    name,
    parameters,
  };

  // Push to local debugger store (keep last 50 only)
  globalTelemetryQueue = [newEvent, ...globalTelemetryQueue].slice(0, 50);
  notifyTelemetryUpdate();

  // Push to actual Google Analytics if active
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', name, {
        event_category: category,
        ...parameters,
      });
    } catch (e) {
      console.warn('Real GA transmission call failed:', e);
    }
  }
}

// 1. Helper to track custom clicks easily
export function trackButtonClick(buttonId: string, buttonLabel: string) {
  logTelemetryEvent('Interactions', 'button_click', {
    button_id: buttonId,
    button_label: buttonLabel,
  });
}

// 2. Helper to track pre-render parameters edit actions with value summary
let parameterTweakDebounceTimers: Record<string, any> = {};
export function trackParameterTweak(parameterKey: string, newValue: any) {
  // Debounce the analytics log slighty so sliding sliders or rapid typing do not flood GA quota
  if (parameterTweakDebounceTimers[parameterKey]) {
    clearTimeout(parameterTweakDebounceTimers[parameterKey]);
  }

  parameterTweakDebounceTimers[parameterKey] = setTimeout(() => {
    logTelemetryEvent('Product Settings', 'parameter_configured', {
      parameter: parameterKey,
      value_length: typeof newValue === 'string' ? newValue.length : undefined,
      numeric_value: typeof newValue === 'number' ? newValue : undefined,
      boolean_value: typeof newValue === 'boolean' ? newValue : undefined,
    });
    delete parameterTweakDebounceTimers[parameterKey];
  }, 1000);
}

// 3. Keep track of continuous engagement seconds
let cumulativeTimeSecs = 0;
export function startEngagementTimer() {
  if (typeof window === 'undefined') return;

  const timer = setInterval(() => {
    cumulativeTimeSecs += 10;
    
    // Log to Google Analytics at regular intervals (10s, 30s, 60s, 120s, 240s etc.) to optimize quota
    if (cumulativeTimeSecs === 10 || cumulativeTimeSecs % 30 === 0) {
      logTelemetryEvent('User Engagement', 'user_engagement_duration', {
        cumulative_seconds: cumulativeTimeSecs,
        readable_duration: `${Math.floor(cumulativeTimeSecs / 60)}m ${cumulativeTimeSecs % 60}s`,
      });
    }
  }, 10000);

  return () => clearInterval(timer);
}

// Export cumulative timer getter for real-time telemetry component
export function getCumulativeTimeSeconds() {
  return cumulativeTimeSecs;
}

// Declare global types
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}
