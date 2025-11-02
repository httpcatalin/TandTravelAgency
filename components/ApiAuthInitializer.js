'use client';

import { useEffect } from 'react';
import { externalApiAuth } from '@/lib/services/externalApiAuth';

export function ApiAuthInitializer() {
  useEffect(() => {
    externalApiAuth.verifyAndRefreshAuth();

    // Set up an interval to check token every hour
    const interval = setInterval(() => {
      externalApiAuth.verifyAndRefreshAuth();
    }, 1000 * 60 * 60); // Every hour

    return () => clearInterval(interval);
  }, []);

  return null;
}