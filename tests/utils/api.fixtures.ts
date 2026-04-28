/**
 * API Test Fixtures
 * Uses generic fixture factory with REQRES API configuration
 */

import { createApiFixture } from './api-generic.fixtures';

/**
 * Extended test fixture with pre-configured API request context for REQRES API
 * Includes authentication and request delays to prevent rate limiting
 */
export const test = createApiFixture({
  apiKeyEnvVar: 'REQRES_API_KEY',
  minRequestInterval: 500,
  apiName: 'REQRES',
  enableErrorLogging: true,
});

