/**
 * API2 Test Fixtures for JSONPlaceholder
 * Uses generic fixture factory with JSONPlaceholder configuration
 */

import { createApiFixture } from './api-generic.fixtures';

/**
 * Extended test fixture with pre-configured API request context for JSONPlaceholder
 * No authentication required - simple headers configuration
 */
export const test = createApiFixture({
  apiName: 'JSONPlaceholder',
});
