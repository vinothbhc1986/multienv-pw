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

  // ============================================================================
  // COMPLEX: Nested Resources & Relationships
  // ============================================================================

  test('Fetch post and validate its comments relationship @complex', async ({ apiRequest }) => {
    const postId = 1;
    
    // Fetch post
    const postUrl = buildApiUrl(API2.ENDPOINTS.POSTS, postId, undefined, API2.BASE_URL);
    const postResponse = await apiRequest.get(postUrl);
    expect(postResponse.ok()).toBeTruthy();
    const post = await postResponse.json();
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
    
    // Fetch comments for this post
    const commentsUrl = buildApiUrl(API2.ENDPOINTS.COMMENTS, undefined, `?postId=${postId}`, API2.BASE_URL);
    const commentsResponse = await apiRequest.get(commentsUrl);
    expect(commentsResponse.ok()).toBeTruthy();
    const comments = await commentsResponse.json();
    
    expect(comments.length).toBeGreaterThan(0);
    comments.forEach((comment: any) => {
      expect(comment.postId).toBe(postId);
      expect(comment).toHaveProperty('name');
      expect(comment).toHaveProperty('email');
    });
  });

  test('Cross-resource relationship validation: users -> todos -> posts @complex', async ({ apiRequest }) => {
    const userId = 1;
    
    // Fetch user
    const userUrl = buildApiUrl(API2.ENDPOINTS.USERS, userId, undefined, API2.BASE_URL);
    const userResponse = await apiRequest.get(userUrl);
    expect(userResponse.ok()).toBeTruthy();
    const user = await userResponse.json();
    expect(user.id).toBe(userId);
    expect(user).toHaveProperty('name');
    
    // Fetch user's todos
    const todosUrl = buildApiUrl(API2.ENDPOINTS.TODOS, undefined, `?userId=${userId}`, API2.BASE_URL);
    const todosResponse = await apiRequest.get(todosUrl);
    const todos = await todosResponse.json();
    expect(todos.length).toBeGreaterThan(0);
    
    // Fetch user's posts
    const postsUrl = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, `?userId=${userId}`, API2.BASE_URL);
    const postsResponse = await apiRequest.get(postsUrl);
    const posts = await postsResponse.json();
    expect(posts.length).toBeGreaterThan(0);
    
    // Verify all resources belong to same user
    todos.forEach((todo: any) => expect(todo.userId).toBe(userId));
    posts.forEach((post: any) => expect(post.userId).toBe(userId));
  });

  test('Fetch albums and photos relationship @complex', async ({ apiRequest }) => {
    const albumId = 1;
    
    // Fetch album
    const albumUrl = buildApiUrl(API2.ENDPOINTS.ALBUMS, albumId, undefined, API2.BASE_URL);
    const albumResponse = await apiRequest.get(albumUrl);
    const album = await albumResponse.json();
    expect(album.id).toBe(albumId);
    expect(album).toHaveProperty('title');
    
    // Fetch photos in album
    const photosUrl = buildApiUrl(API2.ENDPOINTS.PHOTOS, undefined, `?albumId=${albumId}`, API2.BASE_URL);
    const photosResponse = await apiRequest.get(photosUrl);
    const photos = await photosResponse.json();
    
    expect(photos.length).toBeGreaterThan(0);
    photos.forEach((photo: any) => {
      expect(photo.albumId).toBe(albumId);
      expect(typeof photo.url).toBe('string');
      expect(typeof photo.thumbnailUrl).toBe('string');
    });
  });

  // ============================================================================
  // COMPLEX: Data Integrity & Consistency
  // ============================================================================

  test('Verify user data consistency across multiple requests @complex', async ({ apiRequest }) => {
    const userId = 1;
    const userUrl = buildApiUrl(API2.ENDPOINTS.USERS, userId, undefined, API2.BASE_URL);
    
    // Fetch user twice and verify identical response
    const response1 = await apiRequest.get(userUrl);
    const user1 = await response1.json();
    
    const response2 = await apiRequest.get(userUrl);
    const user2 = await response2.json();
    
    expect(JSON.stringify(user1)).toBe(JSON.stringify(user2));
  });

  test('Validate all required fields present in resources @complex', async ({ apiRequest }) => {
    const endpoints = [
      API2.ENDPOINTS.POSTS,
      API2.ENDPOINTS.COMMENTS,
      API2.ENDPOINTS.USERS,
      API2.ENDPOINTS.TODOS,
      API2.ENDPOINTS.ALBUMS,
    ];
    
    for (const endpoint of endpoints) {
      const url = buildApiUrl(endpoint, undefined, '?_limit=5', API2.BASE_URL);
      const response = await apiRequest.get(url);
      expect(response.ok()).toBeTruthy();
      
      const resources = await response.json();
      resources.forEach((resource: any) => {
        expect(resource).toHaveProperty('id');
        expect(typeof resource.id).toBe('number');
      });
    }
  });

  test('Verify no duplicate IDs in resource lists @complex', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, '?_limit=50', API2.BASE_URL);
    
    const response = await apiRequest.get(url);
    const posts = await response.json();
    
    const ids = posts.map((p: any) => p.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(ids.length);
  });

  // ============================================================================
  // COMPLEX: Performance & Response Validation
  // ============================================================================

  test('Compare response times across multiple endpoints @complex @performance', async ({ apiRequest }) => {
    const endpoints = [
      API2.ENDPOINTS.POSTS,
      API2.ENDPOINTS.COMMENTS,
      API2.ENDPOINTS.TODOS,
      API2.ENDPOINTS.USERS,
      API2.ENDPOINTS.ALBUMS,
    ];
    
    const responseTimes: Record<string, number> = {};
    
    for (const endpoint of endpoints) {
      const url = buildApiUrl(endpoint, undefined, undefined, API2.BASE_URL);
      const startTime = Date.now();
      const response = await apiRequest.get(url);
      const endTime = Date.now();
      
      expect(response.ok()).toBeTruthy();
      responseTimes[endpoint] = endTime - startTime;
    }
    
    const avgTime = Object.values(responseTimes).reduce((a, b) => a + b, 0) / Object.values(responseTimes).length;
    console.log('Endpoint Response Times:', responseTimes);
    console.log(`Average response time: ${avgTime.toFixed(2)}ms`);
    
    expect(avgTime).toBeLessThan(2000);
  });

  test('Measure pagination performance impact @complex @performance', async ({ apiRequest }) => {
    const limits = [5, 10, 50];
    const times: number[] = [];
    
    for (const limit of limits) {
      const url = buildApiUrl(API2.ENDPOINTS.POSTS, undefined, `?_limit=${limit}`, API2.BASE_URL);
      
      const startTime = Date.now();
      const response = await apiRequest.get(url);
      const endTime = Date.now();
      
      expect(response.ok()).toBeTruthy();
      times.push(endTime - startTime);
    }
    
    console.log(`Pagination performance (5, 10, 50 items): ${times}ms`);
  });

  // ============================================================================
  // COMPLEX: Advanced Query Scenarios
  // ============================================================================

  test('Chain multiple API calls to build complete data model @complex', async ({ apiRequest }) => {
    const userId = 1;
    
    // Fetch user details
    const userResponse = await apiRequest.get(
      buildApiUrl(API2.ENDPOINTS.USERS, userId, undefined, API2.BASE_URL)
    );
    const user = await userResponse.json();
    
    // Fetch user's posts
    const postsResponse = await apiRequest.get(
      buildApiUrl(API2.ENDPOINTS.POSTS, undefined, `?userId=${userId}&_limit=5`, API2.BASE_URL)
    );
    const posts = await postsResponse.json();
    
    // For each post, fetch comments
    const postsWithComments = [];
    for (const post of posts) {
      const commentsResponse = await apiRequest.get(
        buildApiUrl(API2.ENDPOINTS.COMMENTS, undefined, `?postId=${post.id}`, API2.BASE_URL)
      );
      const comments = await commentsResponse.json();
      postsWithComments.push({ ...post, comments });
    }
    
    // Validate complete data model
    expect(user.id).toBe(userId);
    expect(postsWithComments.length).toBeGreaterThan(0);
    postsWithComments.forEach(post => {
      expect(post.userId).toBe(userId);
      expect(Array.isArray(post.comments)).toBeTruthy();
    });
  });

  test('Fetch and aggregate data across multiple users @complex', async ({ apiRequest }) => {
    const userIds = [1, 2, 3];
    const aggregatedData: any = {};
    
    for (const userId of userIds) {
      const postsResponse = await apiRequest.get(
        buildApiUrl(API2.ENDPOINTS.POSTS, undefined, `?userId=${userId}`, API2.BASE_URL)
      );
      const posts = await postsResponse.json();
      
      const todosResponse = await apiRequest.get(
        buildApiUrl(API2.ENDPOINTS.TODOS, undefined, `?userId=${userId}`, API2.BASE_URL)
      );
      const todos = await todosResponse.json();
      
      aggregatedData[userId] = {
        postCount: posts.length,
        todoCount: todos.length,
        completedTodoCount: todos.filter((t: any) => t.completed).length,
      };
    }
    
    // Verify aggregated data
    Object.values(aggregatedData).forEach((data: any) => {
      expect(data.postCount).toBeGreaterThan(0);
      expect(data.todoCount).toBeGreaterThan(0);
      expect(data.completedTodoCount).toBeLessThanOrEqual(data.todoCount);
    });
  });

  // ============================================================================
  // COMPLEX: Bulk Data Operations
  // ============================================================================

  test('Fetch and validate all resources of a type @complex', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.USERS, undefined, undefined, API2.BASE_URL);
    const response = await apiRequest.get(url);
    expect(response.ok()).toBeTruthy();
    
    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
    
    // Validate all users
    users.forEach((user: any) => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('username');
    });
    
    console.log(`Validated ${users.length} users`);
  });

  test('Handle large response payload efficiently @complex @performance', async ({ apiRequest }) => {
    const url = buildApiUrl(API2.ENDPOINTS.COMMENTS, undefined, '?_limit=100', API2.BASE_URL);
    
    const startTime = Date.now();
    const response = await apiRequest.get(url);
    const endTime = Date.now();
    
    expect(response.ok()).toBeTruthy();
    const comments = await response.json();
    expect(comments.length).toBeGreaterThan(0);
    
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(5000);
    console.log(`Large payload (${comments.length} comments) fetched in ${responseTime}ms`);
  });

  test('Batch fetch multiple resources in parallel @complex @performance', async ({ apiRequest }) => {
    const userIds = [1, 2, 3, 4, 5];
    const requests = [];
    
    for (let userId of userIds) {
      requests.push(
        apiRequest.get(buildApiUrl(API2.ENDPOINTS.USERS, userId, undefined, API2.BASE_URL))
      );
    }
    
    const responses = await Promise.all(requests);
    const users = await Promise.all(responses.map(r => r.json()));
    
    expect(users.length).toBe(userIds.length);
    users.forEach((user: any) => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
    });
  });

  test('Verify sorting and filtering with complex queries @complex', async ({ apiRequest }) => {
    // Test multiple filter combinations
    const url = buildApiUrl(
      API2.ENDPOINTS.COMMENTS,
      undefined,
      '?postId=1&_sort=id&_order=desc&_limit=5',
      API2.BASE_URL
    );
    
    const response = await apiRequest.get(url);
    expect(response.ok()).toBeTruthy();
    
    const comments = await response.json();
    expect(Array.isArray(comments)).toBeTruthy();
    
    // Verify all comments belong to post 1
    comments.forEach((comment: any) => {
      expect(comment.postId).toBe(1);
    });
    
    // Verify sorted in descending order by checking first few IDs
    if (comments.length > 1) {
      expect(comments[0].id).toBeGreaterThanOrEqual(comments[1].id);
    }
  });
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
