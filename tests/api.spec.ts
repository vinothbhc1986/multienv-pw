import { test, expect } from './utils/api.fixtures';
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
});
