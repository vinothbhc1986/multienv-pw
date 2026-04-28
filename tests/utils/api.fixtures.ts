/**
 * API Test Fixtures
 * Uses generic fixture factory with REQRES API configuration
 * 
 * Rate Limiting:
 * - Auto-managed by global-setup.ts based on worker count
 * - Single worker: Rate limiting disabled (sequential execution prevents rate limiting)
 * - Multiple workers: Rate limiting enabled to throttle parallel requests
 * 
 * Override: Set RATE_LIMITING=true/false in terminal to force enable/disable
 */
import { createApiFixture } from './api-generic.fixtures';

/**
 * Extended test fixture with pre-configured API request context for REQRES API
 * Rate limiting is auto-enabled when workers > 1
 */
export const test = createApiFixture({
  apiKeyEnvVar: 'REQRES_API_KEY',
  minRequestInterval: 500,
  apiName: 'REQRES',
  enableErrorLogging: true,
  enableRateLimiting: process.env.RATE_LIMITING === 'true',
});


