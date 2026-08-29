'use client';

import { useEffect } from 'react';
import { captureAttribution, trackSiteEnterOnce } from '../lib/analytics';

export function AnalyticsBootstrap() {
  useEffect(() => {
    captureAttribution();
    trackSiteEnterOnce();
  }, []);

  return null;
}
