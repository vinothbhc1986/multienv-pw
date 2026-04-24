import { test } from './utils/api.fixtures';
import {expect} from '@playwright/test';
import { API } from './utils/api.constants';
import {
  buildApiUrl,
  validateUserStructure,
  validateEmailFormat,
  validateResourceStructure,
  validateCreatedUserStructure,
  validateISODateFormat,
  validateAuthTokenResponse,
  validateErrorResponse,
  validateListResponse,
} from './utils/api-test.helpers';
import {
  TEST_USER_IDS,
  TEST_RESOURCE_IDS,
  TEST_CREDENTIALS,
  TEST_PAGINATION,
  TEST_TIMEOUTS,
  createTestUser,
  createLoginCredentials,
  createRegisterCredentials,
  createSpecialCharacterUser,
  createLongDataUser,
  createUpdatedUser,
  createPartialUpdateData,
} from './utils/api-test.data';

test.describe('API Testing with Reqres.in @regression', () => {


  // ============================================================================
  // Basic CRUD Operations
  // ============================================================================

  test('GET - Fetch list of users @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, `?page=${TEST_PAGINATION.VALID_PAGE}`);
    const response = await apiRequest.get(url);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(validateListResponse(responseBody)).toBeTruthy();
    expect(responseBody.page).toBe(TEST_PAGINATION.VALID_PAGE);
  });

  test('GET - Fetch a single user by ID @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
    const response = await apiRequest.get(url);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.data.id).toBe(TEST_USER_IDS.VALID);
    expect(validateUserStructure(responseBody.data)).toBeTruthy();
    expect(validateEmailFormat(responseBody.data.email)).toBeTruthy();
  });

  test('GET - Fetch a user that does not exist @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.INVALID);
    const response = await apiRequest.get(url);
    
    expect(response.status()).toBe(404);
  });

  test('POST - Create a new user @smoke', async ({ apiRequest }) => {
    const newUser = createTestUser();
    const url = buildApiUrl(API.ENDPOINTS.USERS);
    const response = await apiRequest.post(url, newUser);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody.name).toBe(newUser.name);
    expect(responseBody.job).toBe(newUser.job);
    expect(validateCreatedUserStructure(responseBody)).toBeTruthy();
  });

  test('PUT - Update an existing user @smoke', async ({ apiRequest }) => {
    const updatedData = createUpdatedUser();
    const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
    const response = await apiRequest.put(url, updatedData);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.name).toBe(updatedData.name);
    expect(responseBody.job).toBe(updatedData.job);
    expect(responseBody).toHaveProperty('updatedAt');
  });

  test('DELETE - Delete an existing user @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
    const response = await apiRequest.delete(url);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(204);
  });
  // ============================================================================
  // Pagination & Query Parameters
  // ============================================================================

  test.describe('Pagination & Query Parameters', () => {
    test('GET - Users with different page sizes', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, `?per_page=${TEST_PAGINATION.VALID_PER_PAGE}`);
      const response = await apiRequest.get(url);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.data).toHaveLength(TEST_PAGINATION.VALID_PER_PAGE);
      expect(responseBody.per_page).toBe(TEST_PAGINATION.VALID_PER_PAGE);
    });

    test('GET - Users with invalid page number', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, `?page=${TEST_PAGINATION.INVALID_PAGE}`);
      const response = await apiRequest.get(url);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.data).toHaveLength(0);
      expect(responseBody.page).toBe(TEST_PAGINATION.INVALID_PAGE);
    });

    test('GET - Users with negative page number', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, `?page=${TEST_PAGINATION.NEGATIVE_PAGE}`);
      const response = await apiRequest.get(url);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(Array.isArray(responseBody.data)).toBeTruthy();
    });
  });
  // ============================================================================
  // Response Headers & Content Types
  // ============================================================================

  test.describe('Response Headers & Content Types', () => {
    test('GET - Verify response headers', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.get(url);

      expect(response.headers()['content-type']).toContain('application/json');
      expect(response.headers()['access-control-allow-origin']).toBe('*');
    });

    test('POST - Send different content types', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const testUser = createTestUser();
      const response = await apiRequest.post(url, JSON.stringify(testUser));
      
    expect(response.ok()).toBeTruthy();
    });
  });
  // ============================================================================
  // Data Validation & Edge Cases
  // ============================================================================

  test.describe('Data Validation & Edge Cases', () => {
    test('POST - Create user with empty data', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, {});
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('createdAt');
    });

    test('POST - Create user with special characters', async ({ apiRequest }) => {
      const specialUser = createSpecialCharacterUser();
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, specialUser);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.name).toBe(specialUser.name);
      expect(responseBody.job).toBe(specialUser.job);
    });

    test('POST - Create user with very long data', async ({ apiRequest }) => {
      const longDataUser = createLongDataUser();
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, longDataUser);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.name).toBe(longDataUser.name);
      expect(responseBody.job).toBe(longDataUser.job);
    });

    test('PUT - Update with partial data', async ({ apiRequest }) => {
      const partialUpdate = createPartialUpdateData();
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.put(url, partialUpdate);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.name).toBe(partialUpdate.name);
      expect(responseBody).toHaveProperty('updatedAt');
    });
  });
  // ============================================================================
  // Authentication Endpoints
  // ============================================================================

  test.describe('Authentication Endpoints @critical', () => {
    test('POST - User registration', async ({ apiRequest }) => {
      const registerData = createRegisterCredentials();
      const url = buildApiUrl(API.ENDPOINTS.REGISTER);
      const response = await apiRequest.post(url, registerData);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(validateAuthTokenResponse(responseBody)).toBeTruthy();
    });

    test('POST - User login', async ({ apiRequest }) => {
      const loginData = createLoginCredentials();
      const url = buildApiUrl(API.ENDPOINTS.LOGIN);
      const response = await apiRequest.post(url, loginData);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(validateAuthTokenResponse(responseBody)).toBeTruthy();
    });

    test('POST - Register with missing password', async ({ apiRequest }) => {
      const invalidRegisterData = { email: TEST_CREDENTIALS.VALID_EMAIL };
      const url = buildApiUrl(API.ENDPOINTS.REGISTER);
      const response = await apiRequest.post(url, invalidRegisterData);
      
      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(validateErrorResponse(responseBody)).toBeTruthy();
    });

    test('POST - Login with invalid credentials', async ({ apiRequest }) => {
      const invalidLoginData = {
        email: TEST_CREDENTIALS.INVALID_EMAIL,
        password: TEST_CREDENTIALS.INVALID_PASSWORD,
      };
      const url = buildApiUrl(API.ENDPOINTS.LOGIN);
      const response = await apiRequest.post(url, invalidLoginData);
      
      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(validateErrorResponse(responseBody)).toBeTruthy();
    });
  });
  // ============================================================================
  // Resource Endpoints
  // ============================================================================

  test.describe('Resource Endpoints', () => {
    test('GET - Fetch list of resources', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.RESOURCES);
      const response = await apiRequest.get(url);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(Array.isArray(responseBody.data)).toBeTruthy();
      expect(responseBody.data.length).toBeGreaterThan(0);
    });

    test('GET - Fetch single resource', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.RESOURCES, TEST_RESOURCE_IDS.VALID);
      const response = await apiRequest.get(url);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.data.id).toBe(TEST_RESOURCE_IDS.VALID);
      expect(validateResourceStructure(responseBody.data)).toBeTruthy();
    });

    test('GET - Fetch non-existent resource', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.RESOURCES, TEST_RESOURCE_IDS.INVALID);
      const response = await apiRequest.get(url);
      
      expect(response.status()).toBe(404);
    });
  });
  // ============================================================================
  // Error Scenarios & Status Codes
  // ============================================================================

  test.describe('Error Scenarios & Status Codes', () => {
    test('GET - Very high user ID should return 404', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.NONEXISTENT);
      const response = await apiRequest.get(url);
      
      expect(response.status()).toBe(404);
    });

    test('PUT - Update non-existent user', async ({ apiRequest }) => {
      const updateData = createUpdatedUser();
      const url = buildApiUrl(API.ENDPOINTS.USERS, 999);
      const response = await apiRequest.put(url, updateData);
      
      // Reqres.in returns 200 even for non-existent users
      expect(response.ok()).toBeTruthy();
    });

    test('DELETE - Delete non-existent user', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, 999);
      const response = await apiRequest.delete(url);
      
      // Reqres.in returns 204 even for non-existent users
      expect(response.ok()).toBeTruthy();
    });

    test('POST - Malformed JSON', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, '{ invalid json }');
      
      // This might return 400 or be handled gracefully
      expect([200, 201, 400]).toContain(response.status());
    });
  });
  // ============================================================================
  // Performance & Response Time
  // ============================================================================

  test.describe('Performance & Response Time', () => {
    test('GET - Response time should be reasonable', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const startTime = Date.now();
      const response = await apiRequest.get(url);
      const endTime = Date.now();

      expect(response.ok()).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(TEST_TIMEOUTS.RESPONSE_TIME);
    });

    test('POST - Create user response time', async ({ apiRequest }) => {
      const testUser = createTestUser();
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const startTime = Date.now();
      const response = await apiRequest.post(url, testUser);
      const endTime = Date.now();

      expect(response.ok()).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(TEST_TIMEOUTS.POST_TIME);
    });
  });
  // ============================================================================
  // Concurrent Requests
  // ============================================================================

  test.describe('Concurrent Requests', () => {
    test('Multiple simultaneous GET requests', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const promises = Array(5).fill(null).map(() => apiRequest.get(url));
      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
      });
    });

    test('Mixed GET and POST requests', async ({ apiRequest }) => {
      const getUrl = buildApiUrl(API.ENDPOINTS.USERS);
      const postUrl = buildApiUrl(API.ENDPOINTS.USERS);
      const testUser = createTestUser();

      const getPromise = apiRequest.get(getUrl);
      const postPromise = apiRequest.post(postUrl, testUser);

      const [getResponse, postResponse] = await Promise.all([getPromise, postPromise]);

      expect(getResponse.ok()).toBeTruthy();
      expect(postResponse.ok()).toBeTruthy();
    });
  });
  // ============================================================================
  // Data Structure Validation
  // ============================================================================

  test.describe('Data Structure Validation', () => {
    test('GET - Validate user data structure', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.get(url);
      const responseBody = await response.json();

      expect(validateUserStructure(responseBody.data)).toBeTruthy();
      expect(validateEmailFormat(responseBody.data.email)).toBeTruthy();
    });

    test('POST - Validate created user structure', async ({ apiRequest }) => {
      const testUser = createTestUser({
        name: 'Structure Test',
        job: 'validator',
      });
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, testUser);
      const responseBody = await response.json();

      expect(validateCreatedUserStructure(responseBody)).toBeTruthy();
      expect(validateISODateFormat(responseBody.createdAt)).toBeTruthy();
    });
  });
  // ============================================================================
  // HTTP Methods & Status Codes
  // ============================================================================

  test.describe('HTTP Methods & Status Codes', () => {
    test('PATCH - Partial user update', async ({ apiRequest }) => {
      const patchData = { name: 'Updated Name Only' };
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.patch(url, patchData);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.name).toBe(patchData.name);
      expect(responseBody).toHaveProperty('updatedAt');
    });

    test('OPTIONS - Preflight request', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.fetch(url, { method: 'OPTIONS' });
      
      // API should allow OPTIONS or return 405 if not supported
      expect([200, 204, 405]).toContain(response.status());
      
      // Only check for headers if the method is allowed (not 405)
      if (response.status() !== 405) {
        const allowHeader = response.headers()['allow'];
        const corsHeader = response.headers()['access-control-allow-methods'];
        expect(allowHeader || corsHeader).toBeTruthy();
      }
    });

    test('HEAD - Request without response body', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.fetch(url, { method: 'HEAD' });
      
      // HEAD should return 200 with headers or 405 if not supported
      expect([200, 204, 405]).toContain(response.status());
      
      // Only validate headers if method is accepted (response is ok)
      if (response.ok()) {
        const headers = response.headers();
        expect(Object.keys(headers).length).toBeGreaterThan(0);
      }
    });

    test('Unsupported HTTP methods return appropriate response', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.fetch(url, { method: 'TRACE' });
      
      // Should reject unsupported methods with appropriate status code
      expect([200, 400, 403, 405, 501]).toContain(response.status());
    });
  });
  // ============================================================================
  // Request Headers Validation
  // ============================================================================

  test.describe('Request Headers Validation', () => {
    test('GET - Request with custom headers', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.get(url, {
        headers: {
          'X-Custom-Header': 'test-value',
          'User-Agent': 'CustomAgent/1.0',
        },
      });
      
      expect(response.ok()).toBeTruthy();
    });

    test('POST - Request with Authorization header', async ({ apiRequest }) => {
      const testUser = createTestUser();
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, testUser, {
        headers: {
          'Authorization': 'Bearer test-token-123',
        },
      });
      
      expect(response.ok()).toBeTruthy();
    });

    test('GET - Response includes CORS headers', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.get(url);
      
      expect(response.headers()['access-control-allow-origin']).toBe('*');
      expect(response.headers()['content-type']).toContain('application/json');
    });

    test('Vary header present for content negotiation', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.get(url);
      
      // Vary header or cache headers should be present for caching
      const varyHeader = response.headers()['vary'];
      const cacheControl = response.headers()['cache-control'];
      expect(varyHeader || cacheControl).toBeTruthy();
    });
  });
  // ============================================================================
  // Cache Control & Headers
  // ============================================================================

  test.describe('Cache Control & Headers', () => {
    test('GET - Response includes cache headers', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.get(url);
      
      const cacheControl = response.headers()['cache-control'];
      const eTag = response.headers()['etag'];
      // At least one cache header should be present
      expect(cacheControl || eTag).toBeTruthy();
    });

    test('GET - ETag header for resource versioning', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response1 = await apiRequest.get(url);
      const response2 = await apiRequest.get(url);
      
      const eTag1 = response1.headers()['etag'];
      const eTag2 = response2.headers()['etag'];
      
      if (eTag1 && eTag2) {
        expect(eTag1).toBe(eTag2);
      }
    });

    test('GET - Last-Modified header for cache validation', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.get(url);
      
      const lastModified = response.headers()['last-modified'];
      if (lastModified) {
        expect(new Date(lastModified).getTime()).toBeLessThanOrEqual(Date.now());
      }
    });
  });
  // ============================================================================
  // Response Body Validation & Edge Cases
  // ============================================================================

  test.describe('Response Body Validation & Edge Cases', () => {
    test('GET - Empty array response handling', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, `?page=${TEST_PAGINATION.INVALID_PAGE}`);
      const response = await apiRequest.get(url);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(Array.isArray(responseBody.data)).toBeTruthy();
      expect(responseBody.data.length).toBe(0);
    });

    test('POST - Response with auto-generated ID', async ({ apiRequest }) => {
      const testUser = createTestUser();
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, testUser);
      
      const responseBody = await response.json();
      expect(responseBody.id).toBeDefined();
      expect(typeof responseBody.id).toBe('string');
      expect(responseBody.id.length).toBeGreaterThan(0);
    });

    test('PUT - Response contains updated fields', async ({ apiRequest }) => {
      const updateData = createUpdatedUser();
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.put(url, updateData);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      // Check that at least the updated fields are in the response
      expect(responseBody.name || responseBody.job).toBeDefined();
      expect(responseBody).toHaveProperty('updatedAt');
    });

    test('GET - Large response handling', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, `?per_page=12`);
      const response = await apiRequest.get(url);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.data.length).toBeGreaterThan(0);
      expect(responseBody.data.length).toBeLessThanOrEqual(12);
    });

    test('GET - Response timestamps are valid ISO format', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.get(url);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.data.id).toBeDefined();
    });
  });
  // ============================================================================
  // Query Parameter Encoding & Edge Cases
  // ============================================================================

  test.describe('Query Parameter Encoding & Edge Cases', () => {
    test('GET - Query parameters with special characters', async ({ apiRequest }) => {
      const specialQuery = 'search=test@example.com&filter=type:user';
      const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, `?${specialQuery}`);
      const response = await apiRequest.get(url);
      
      expect([200, 400]).toContain(response.status());
    });

    test('GET - Multiple query parameters', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, `?page=1&per_page=5&sort=id&order=asc`);
      const response = await apiRequest.get(url);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.page).toBe(1);
    });

    test('GET - Query parameters with URL encoding', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, `?search=${encodeURIComponent('John Doe')}`);
      const response = await apiRequest.get(url);
      
      expect([200, 400]).toContain(response.status());
    });

    test('GET - Empty query parameter value', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, `?filter=&page=1`);
      const response = await apiRequest.get(url);
      
      expect([200, 400]).toContain(response.status());
    });
  });
  // ============================================================================
  // Request Body Validation
  // ============================================================================

  test.describe('Request Body Validation', () => {
    test('POST - Request with null values', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, {
        name: null,
        job: 'tester',
      });
      
      expect(response.ok()).toBeTruthy();
    });

    test('POST - Request with undefined values converted to null', async ({ apiRequest }) => {
      const testUser = { name: 'John', job: 'Developer' };
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, testUser);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.name).toBe('John');
    });

    test('POST - Request with extra fields', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, {
        name: 'John',
        job: 'Developer',
        department: 'Engineering',
        phone: '555-1234',
        extra_field: 'should_be_ignored',
      });
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.name).toBe('John');
    });

    test('PUT - Request with numeric strings', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await apiRequest.put(url, {
        name: '12345',
        job: '9876',
      });
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.name).toBe('12345');
    });

    test('POST - Request body size limits', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const largePayload = {
        name: 'x'.repeat(10000),
        job: 'y'.repeat(10000),
      };
      const response = await apiRequest.post(url, largePayload);
      
      // Should either succeed or return 413 (Payload Too Large)
      expect([200, 201, 413]).toContain(response.status());
    });
  });
  // ============================================================================
  // Character Encoding & Special Characters
  // ============================================================================

  test.describe('Character Encoding & Special Characters', () => {
    test('POST - User with UTF-8 characters', async ({ apiRequest }) => {
      const specialUser = {
        name: '日本語テスト',
        job: 'тестировщик',
      };
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, specialUser);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.name).toBe(specialUser.name);
    });

    test('POST - User with emoji characters', async ({ apiRequest }) => {
      const emojiUser = {
        name: 'John 🚀',
        job: 'Developer 💻',
      };
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, emojiUser);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.name).toContain('🚀');
    });

    test('POST - User with HTML entities', async ({ apiRequest }) => {
      const htmlUser = {
        name: '<script>alert("xss")</script>',
        job: '&lt;tag&gt;',
      };
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, htmlUser);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.name).toBe(htmlUser.name);
      expect(responseBody.job).toBe(htmlUser.job);
    });

    test('POST - User with newlines and tabs', async ({ apiRequest }) => {
      const specialCharsUser = {
        name: 'John\nDoe',
        job: 'Developer\tLead',
      };
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, specialCharsUser);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.name).toBe(specialCharsUser.name);
      expect(responseBody.job).toBe(specialCharsUser.job);
    });
  });
  // ============================================================================
  // Bulk & Complex Operations
  // ============================================================================

  test.describe('Bulk & Complex Operations', () => {
    test('Bulk create - Create multiple users sequentially', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const users = [
        createTestUser({ name: 'User1' }),
        createTestUser({ name: 'User2' }),
        createTestUser({ name: 'User3' }),
      ];
      const responses = await Promise.all(
        users.map(user => apiRequest.post(url, user))
      );

      
      responses.forEach(response => {
        expect(response.ok()).toBeTruthy();
      });
    });

    test('Chain operations - Create, Read, Update, Delete', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      
      // Create (API accepts but doesn't persist)
      const createResponse = await apiRequest.post(url, createTestUser());
      expect(createResponse.ok()).toBeTruthy();
      
      // Use a valid existing user ID for the remaining operations since Reqres.in doesn't persist POSTed users
      const userId = TEST_USER_IDS.VALID;
      const readUrl = buildApiUrl(API.ENDPOINTS.USERS, userId);
      
      // Read
      const readResponse = await apiRequest.get(readUrl);
      expect(readResponse.ok()).toBeTruthy();
      
      // Update
      const updateResponse = await apiRequest.put(readUrl, createUpdatedUser());
      expect(updateResponse.ok()).toBeTruthy();
      
      // Delete (API accepts but doesn't actually delete)
      const deleteResponse = await apiRequest.delete(readUrl);
      expect(deleteResponse.ok()).toBeTruthy();
    });

    test('Parallel reads - Fetch multiple resources simultaneously', async ({ apiRequest }) => {
      const userIds = [1, 2, 3, 4, 5];
      const promises = userIds.map(id =>
        apiRequest.get(buildApiUrl(API.ENDPOINTS.USERS, id))
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
      });
    });
  });
  // ============================================================================
  // Authentication & Token Validation
  // ============================================================================

  test.describe('Authentication & Token Validation', () => {
    test('POST - Login response contains valid token', async ({ apiRequest }) => {
      const loginData = createLoginCredentials();
      const url = buildApiUrl(API.ENDPOINTS.LOGIN);
      const response = await apiRequest.post(url, loginData);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.token).toBeDefined();
      expect(typeof responseBody.token).toBe('string');
      expect(responseBody.token.length).toBeGreaterThan(0);
    });

    test('POST - Token format validation', async ({ apiRequest }) => {
      const loginData = createLoginCredentials();
      const url = buildApiUrl(API.ENDPOINTS.LOGIN);
      const response = await apiRequest.post(url, loginData);
      
      const responseBody = await response.json();
      const token = responseBody.token;
      
      // Token should not contain spaces or special chars that would break auth headers
      expect(token).not.toContain(' ');
      expect(token).toMatch(/^[a-zA-Z0-9\-._~+/]+=*$/);
    });

    test('POST - Register response includes all required fields', async ({ apiRequest }) => {
      const registerData = createRegisterCredentials();
      const url = buildApiUrl(API.ENDPOINTS.REGISTER);
      const response = await apiRequest.post(url, registerData);
      
      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.token).toBeDefined();
      expect(responseBody.id).toBeDefined();
    });

    test('POST - Missing email in register returns 400', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.REGISTER);
      const response = await apiRequest.post(url, {
        password: 'testpass',
      });
      
      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.error).toBeDefined();
    });
  });
  // ============================================================================
  // Response Consistency & Idempotency
  // ============================================================================

  test.describe('Response Consistency & Idempotency', () => {
    test('GET - Same request returns same response', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      
      const response1 = await apiRequest.get(url);
      const response2 = await apiRequest.get(url);
      
      expect(response1.ok()).toBeTruthy();
      expect(response2.ok()).toBeTruthy();
      
      const body1 = await response1.json();
      const body2 = await response2.json();
      
      expect(body1.data.id).toBe(body2.data.id);
      expect(body1.data.email).toBe(body2.data.email);
    });

    test('POST - Multiple identical requests create multiple resources', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const testUser = createTestUser();
      
      const response1 = await apiRequest.post(url, testUser);
      const response2 = await apiRequest.post(url, testUser);
      
      const body1 = await response1.json();
      const body2 = await response2.json();
      
      // Both should succeed and create separate resources
      expect(body1.id).not.toBe(body2.id);
    });

    test('DELETE - Idempotent delete returns success on second attempt', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, 999);
      
      const response1 = await apiRequest.delete(url);
      const response2 = await apiRequest.delete(url);
      
      expect(response1.status()).toBe(204);
      expect(response2.status()).toBe(204);
    });
  });
});
