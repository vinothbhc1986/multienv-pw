/**
 * API2 Test Fixtures for JSONPlaceholder
 * Contains Playwright fixtures for common test setup and teardown
 */

import { test as base } from '@playwright/test';

/**
 * Extended test fixture with pre-configured API request context for JSONPlaceholder
 * No authentication required - simple headers configuration
 */
export const test = base.extend({
  /**
   * request fixture with pre-configured headers
   */
  apiRequest: async ({ request }, use) => {
    // No API key needed for JSONPlaceholder - it's a public API
    console.log('✓ JSONPlaceholder API - No authentication required');
    
    // Common headers for all requests
    const headers = {
      'Content-Type': 'application/json',
    };

    // Create a wrapper around the request fixture with pre-configured headers
    const apiRequest = {
      get: async (url: string) => {
        const response = await request.get(url, { headers });
        return response;
      },

      post: async (url: string, data: any) => {
        const response = await request.post(url, { data, headers });
        return response;
      },

      put: async (url: string, data: any) => {
        const response = await request.put(url, { data, headers });
        return response;
      },

      patch: async (url: string, data: any) => {
        const response = await request.patch(url, { data, headers });
        return response;
      },

      delete: async (url: string) => {
        const response = await request.delete(url, { headers });
        return response;
      },
    };

    await use(apiRequest);
  },
});
