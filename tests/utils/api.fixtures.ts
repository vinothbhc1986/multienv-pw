/**
 * API Test Fixtures
 * Contains Playwright fixtures for common test setup and teardown
 */

import { test as base } from '@playwright/test';
import { API } from './api.constants';

/**
 * Delay utility to add wait time between requests
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extended test fixture with pre-configured API request context
 * Includes delays to prevent rate limiting
 */
export const test = base.extend({
  /**
   * request fixture with pre-configured headers and request delays
   */
  apiRequest: async ({ request }, use) => {
    // Track requests to add delays between them (prevent rate limiting)
    let lastRequestTime = 0;
    const MIN_REQUEST_INTERVAL = 500; // 500ms between requests
    
    const ensureMinInterval = async () => {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
      }
      
      lastRequestTime = Date.now();
    };
    
    // Log API key status for debugging
    const apiKey = process.env.REQRES_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ REQRES_API_KEY is not set in environment variables');
    } else {
      console.log(`✓ API key loaded (${apiKey.substring(0, 10)}...)`);
    }
    
    // Create a wrapper around the request fixture with pre-configured headers
    const apiRequest = {
      get: async (url: string) => {
        await ensureMinInterval();
        const response = await request.get(url, {
          headers: { 'x-api-key': apiKey || '' },
        });
        if (!response.ok()) {
          const body = await response.text();
          console.log(`[GET] ${url}\n  Status: ${response.status()}\n  Body: ${body.substring(0, 200)}`);
        }
        return response;
      },
      post: async (url: string, data: any) => {
        await ensureMinInterval();
        const response = await request.post(url, { 
          data,
          headers: { 'x-api-key': apiKey || '' },
        });
        if (!response.ok()) {
          const body = await response.text();
          console.log(`[POST] ${url}\n  Status: ${response.status()}\n  Body: ${body.substring(0, 200)}`);
        }
        return response;
      },
      put: async (url: string, data: any) => {
        await ensureMinInterval();
        const response = await request.put(url, { 
          data,
          headers: { 'x-api-key': apiKey || '' },
        });
        if (!response.ok()) {
          const body = await response.text();
          console.log(`[PUT] ${url}\n  Status: ${response.status()}\n  Body: ${body.substring(0, 200)}`);
        }
        return response;
      },
      delete: async (url: string) => {
        await ensureMinInterval();
        const response = await request.delete(url, {
          headers: { 'x-api-key': apiKey || '' },
        });
        if (!response.ok()) {
          const body = await response.text();
          console.log(`[DELETE] ${url}\n  Status: ${response.status()}\n  Body: ${body.substring(0, 200)}`);
        }
        return response;
      },
      patch: async (url: string, data: any) => {
        await ensureMinInterval();
        const response = await request.patch(url, { 
          data,
          headers: { 'x-api-key': apiKey || '' },
        });
        if (!response.ok()) {
          const body = await response.text();
          console.log(`[PATCH] ${url}\n  Status: ${response.status()}\n  Body: ${body.substring(0, 200)}`);
        }
        return response;
      },
      fetch: async (url: string, options?: any) => {
        await ensureMinInterval();
        const response = await request.fetch(url, { 
          ...options,
          headers: { 
            'x-api-key': apiKey || '',
            ...options?.headers 
          },
        });
        const method = options?.method || 'GET';
        if (!response.ok()) {
          const body = await response.text();
          console.log(`[${method}] ${url}\n  Status: ${response.status()}\n  Body: ${body.substring(0, 200)}`);
        }
        return response;
      },
    };

    await use(apiRequest);
  },
});

export { expect } from '@playwright/test';
