import { expect } from '@playwright/test';
import { API2 } from './utils/api2.constants';
import { buildApiUrl } from './utils/api-test.helpers';
import {
  TEST_DATA,
  CREATE_POST_DATA,
  UPDATE_POST_DATA,
  CREATE_TODO_DATA,
} from './utils/api2-test.data';


import { createApiFixture } from './utils/api-generic.fixtures';

const test = createApiFixture({
  apiName: 'JSONPlaceholder',
});
test.describe('API Testing with JSONPlaceholder @regression', () => {
  // ============================================================================
  // Posts Endpoints
  // ============================================================================

  test('GET - Fetch all posts @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
    expect(responseBody[0]).toHaveProperty('id');
    expect(responseBody[0]).toHaveProperty('title');
    expect(responseBody[0]).toHaveProperty('body');
  });

  test('GET - Fetch a single post by ID @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, TEST_DATA.VALID_POST_ID, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.id).toBe(TEST_DATA.VALID_POST_ID);
    expect(responseBody).toHaveProperty('title');
    expect(responseBody).toHaveProperty('body');
    expect(responseBody).toHaveProperty('userId');
    expect(typeof responseBody.title).toBe('string');
    expect(typeof responseBody.body).toBe('string');
  });

  test('GET - Fetch posts with query parameters (limit) @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, '?_limit=5', API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeLessThanOrEqual(5);
  });

  test('GET - Fetch posts by user ID @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, '?userId=1', API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    responseBody.forEach((post: any) => {
      expect(post.userId).toBe(1);
    });
  });

  test('POST - Create a new post @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.post(url, CREATE_POST_DATA);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody.title).toBe(CREATE_POST_DATA.title);
    expect(responseBody.body).toBe(CREATE_POST_DATA.body);
    expect(responseBody.userId).toBe(CREATE_POST_DATA.userId);
  });

  test('PUT - Update an existing post @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, TEST_DATA.VALID_POST_ID, undefined, API2.BASE_URL);
    const response = await apiRequest.put(url, UPDATE_POST_DATA);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.id).toBe(TEST_DATA.VALID_POST_ID);
    expect(responseBody.title).toBe(UPDATE_POST_DATA.title);
    expect(responseBody.body).toBe(UPDATE_POST_DATA.body);
  });

  test('PATCH - Partially update a post @smoke', async ({ apiRequest }) => {
    const partialData = { title: 'Patched Title' };
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, TEST_DATA.VALID_POST_ID, undefined, API2.BASE_URL);
    const response = await apiRequest.patch(url, partialData);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.title).toBe(partialData.title);
  });

  test('DELETE - Delete a post @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, TEST_DATA.VALID_POST_ID, undefined, API2.BASE_URL);
    const response = await apiRequest.delete(url);

    expect(response.status()).toBe(200);
  });

  // ============================================================================
  // Comments Endpoints
  // ============================================================================

  test('GET - Fetch all comments @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.COMMENTS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
  });

  test('GET - Fetch a single comment by ID @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.COMMENTS, TEST_DATA.VALID_COMMENT_ID, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.id).toBe(TEST_DATA.VALID_COMMENT_ID);
    expect(responseBody).toHaveProperty('postId');
    expect(responseBody).toHaveProperty('name');
    expect(responseBody).toHaveProperty('email');
    expect(responseBody).toHaveProperty('body');
  });

  test('GET - Fetch comments for a specific post @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.COMMENTS, undefined, '?postId=1', API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    responseBody.forEach((comment: any) => {
      expect(comment.postId).toBe(1);
    });
  });

  // ============================================================================
  // Users Endpoints
  // ============================================================================

  test('GET - Fetch all users @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.USERS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
  });

  test('GET - Fetch a single user by ID @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.USERS, TEST_DATA.VALID_USER_ID, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.id).toBe(TEST_DATA.VALID_USER_ID);
    expect(responseBody).toHaveProperty('name');
    expect(responseBody).toHaveProperty('username');
    expect(responseBody).toHaveProperty('email');
    expect(responseBody).toHaveProperty('address');
    expect(responseBody.address).toHaveProperty('geo');
    expect(typeof responseBody.name).toBe('string');
    expect(typeof responseBody.username).toBe('string');
  });

  // ============================================================================
  // Todos Endpoints
  // ============================================================================

  test('GET - Fetch all todos @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.TODOS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
  });

  test('GET - Fetch a single todo by ID @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.TODOS, TEST_DATA.VALID_TODO_ID, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.id).toBe(TEST_DATA.VALID_TODO_ID);
    expect(responseBody).toHaveProperty('userId');
    expect(responseBody).toHaveProperty('title');
    expect(responseBody).toHaveProperty('completed');
    expect(typeof responseBody.completed).toBe('boolean');
  });

  test('GET - Fetch incomplete todos for a user @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.TODOS, undefined, '?userId=1&completed=false', API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    responseBody.forEach((todo: any) => {
      expect(todo.userId).toBe(1);
      expect(todo.completed).toBe(false);
    });
  });

  test('POST - Create a new todo @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.TODOS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.post(url, CREATE_TODO_DATA);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody.title).toBe(CREATE_TODO_DATA.title);
    expect(responseBody.completed).toBe(CREATE_TODO_DATA.completed);
    expect(responseBody.userId).toBe(CREATE_TODO_DATA.userId);
  });

  test('PUT - Complete a todo @smoke', async ({ apiRequest }) => {
    const updateData = { completed: true };
    const url = buildApiUrl(API2.ENDPOINTS.TODOS, TEST_DATA.VALID_TODO_ID, undefined, API2.BASE_URL);
    const response = await apiRequest.put(url, updateData);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.completed).toBe(true);
  });

  // ============================================================================
  // Albums Endpoints
  // ============================================================================

  test('GET - Fetch all albums @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.ALBUMS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
  });

  test('GET - Fetch albums for a specific user @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.ALBUMS, undefined, '?userId=1', API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    responseBody.forEach((album: any) => {
      expect(album.userId).toBe(1);
    });
  });

  // ============================================================================
  // Error Handling
  // ============================================================================

  test('GET - Handle 404 for non-existent resource @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, TEST_DATA.INVALID_POST_ID, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    // Note: JSONPlaceholder returns 404 for non-existent resources
    expect(response.status()).toBe(404);
  });

  test('GET - Verify response headers @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, TEST_DATA.VALID_POST_ID, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  // ============================================================================
  // Photos Endpoints
  // ============================================================================

  test('GET - Fetch all photos @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.PHOTOS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
    expect(responseBody[0]).toHaveProperty('id');
    expect(responseBody[0]).toHaveProperty('albumId');
    expect(responseBody[0]).toHaveProperty('title');
    expect(responseBody[0]).toHaveProperty('url');
  });

  test('GET - Fetch photos by album ID @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.PHOTOS, undefined, '?albumId=1', API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    responseBody.forEach((photo: any) => {
      expect(photo.albumId).toBe(1);
    });
  });

  test('GET - Fetch single photo by ID @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.PHOTOS, 1, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('albumId');
    expect(responseBody).toHaveProperty('title');
    expect(responseBody).toHaveProperty('url');
    expect(responseBody).toHaveProperty('thumbnailUrl');
  });

  // ============================================================================
  // Pagination & Query Parameter Tests
  // ============================================================================

  test('GET - Fetch paginated posts with start and limit @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, '?_start=0&_limit=3', API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeLessThanOrEqual(3);
  });

  test('GET - Fetch todos sorted by completion status @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.TODOS, undefined, '?_sort=completed&_order=asc', API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
  });

  test('GET - Fetch comments with multiple filters @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API2.ENDPOINTS.COMMENTS, 
      undefined, 
      '?postId=1&_sort=id&_order=desc&_limit=5', 
      API2.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    responseBody.forEach((comment: any) => {
      expect(comment.postId).toBe(1);
    });
  });

  // ============================================================================
  // Edge Cases & Validation
  // ============================================================================

  test('POST - Create todo with minimal data @smoke', async ({ apiRequest }) => {
    const minimalData = {
      title: 'Minimal Todo',
      userId: 1,
    };
    const url = buildApiUrl(API2.ENDPOINTS.TODOS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.post(url, minimalData);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody.title).toBe(minimalData.title);
    expect(responseBody.userId).toBe(minimalData.userId);
  });

  test('GET - Fetch resource with invalid query parameter (should ignore) @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, '?invalidParam=true', API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
  });

  test('GET - Fetch multiple users sequentially @smoke', async ({ apiRequest }) => {
    const userIds = [1, 2, 3];
    
    for (const userId of userIds) {
      const url = buildApiUrl(API2.ENDPOINTS.USERS, userId, undefined, API2.BASE_URL);
      const response = await apiRequest.get(url);
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody.id).toBe(userId);
    }
  });

  test('GET - Fetch large dataset (all posts) @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    // JSONPlaceholder typically has 100 posts
    expect(responseBody.length).toBeGreaterThan(50);
  });

  test('PUT - Update post with partial fields should work @smoke', async ({ apiRequest }) => {
    const partialUpdate = {
      title: 'New Title Only',
    };
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, 1, undefined, API2.BASE_URL);
    const response = await apiRequest.put(url, partialUpdate);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.title).toBe(partialUpdate.title);
  });

  test('GET - Fetch posts and validate all required fields @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, 1, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    // Check that essential fields exist and have correct types
    expect(typeof responseBody.id).toBe('number');
    expect(typeof responseBody.userId).toBe('number');
    expect(typeof responseBody.title).toBe('string');
    expect(typeof responseBody.body).toBe('string');
    expect(responseBody.title.length).toBeGreaterThan(0);
    expect(responseBody.body.length).toBeGreaterThan(0);
  });

  test('GET - Verify response consistency (same request twice) @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, 1, undefined, API2.BASE_URL);
    
    const response1 = await apiRequest.get(url);
    const data1 = await response1.json();
    
    const response2 = await apiRequest.get(url);
    const data2 = await response2.json();

    // Data should be consistent
    expect(data1.id).toBe(data2.id);
    expect(data1.title).toBe(data2.title);
    expect(data1.body).toBe(data2.body);
  });

  test('GET - Fetch resource with string ID should work @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.USERS, '1', undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.id).toBe(1);
  });

  test('POST - Create post and verify ID is returned @smoke', async ({ apiRequest }) => {
    const newPost = {
      title: 'Brand New Post',
      body: 'This is a brand new post for validation.',
      userId: 5,
    };
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.post(url, newPost);

    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    
    // JSONPlaceholder returns an incremental ID
    expect(responseBody.id).toBeDefined();
    expect(typeof responseBody.id).toBe('number');
  });

  test('DELETE - Return empty response body on success @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, 5, undefined, API2.BASE_URL);
    const response = await apiRequest.delete(url);

    expect(response.status()).toBe(200);
  });

  test('GET - Empty array for non-existent filter should return 200 @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, '?userId=99999', API2.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBe(0);
  });
});
