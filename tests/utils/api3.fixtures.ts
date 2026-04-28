/**
 * API3 Test Fixtures for REST Countries API
 * Uses generic fixture factory with REST Countries configuration
 */

import { createApiFixture } from './api-generic.fixtures';

/**
 * Extended test fixture with pre-configured API request context for REST Countries
 * No authentication required - simple headers configuration
 */
export const test = createApiFixture({
  apiName: 'REST Countries',
});
