'use client';

import { useEffect } from 'react';
import { captureAttribution, trackEvent } from '../lib/analytics';

export function AnalyticsBootstrap() {
  useEffect(() => {
    captureAttribution();
    trackEvent('site_enter');
  }, []);

  return null;
}
