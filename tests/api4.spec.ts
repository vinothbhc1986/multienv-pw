import { test, expect } from '@playwright/test';
import { isJwt, BEARER_TOKEN_PREFIX } from './utils/api-test.helpers';
import { createLoginCredentials } from './utils/api-test.data';
import { API4_TEST_USERS } from './utils/api4-test-data';
import { API4 } from './utils/api4.constants';

/**
 * Test suite for the public EscuelaJS demo API.
 * Covers authentication, and CRUD operations on categories.
 */

test.describe.serial('EscuelaJS API - Authentication', () => {
  let token: string = '';
  let refreshToken: string = '';

  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();    
    const resp = await request.post(`${API4.BASE_URL}${API4.ENDPOINTS.AUTH_LOGIN}`, {
      data: API4_TEST_USERS,
    });
    const body = await resp.json();
    token = body.access_token as string;
    refreshToken = body.refresh_token as string;
    await request.dispose();
  });

  test('Login returns access JWT', async ({ request }) => {
    expect(token.length).toBeGreaterThan(0);
    expect(isJwt(token)).toBeTruthy();
    expect(refreshToken.length).toBeGreaterThan(0);
    expect(isJwt(refreshToken)).toBeTruthy();
  });

  test('GET profile with stored access token', async ({ request }) => {
    const profileResp = await request.get(`${API4.BASE_URL}${API4.ENDPOINTS.PROFILE}`, {
      headers: { Authorization: `${BEARER_TOKEN_PREFIX} ${token}` },
    });
    expect(profileResp.ok()).toBeTruthy();
    const profile = await profileResp.json();
    expect(profile).toHaveProperty('email');
    expect(profile.email).toBe(API4_TEST_USERS.email);
  });
});

test.describe('EscuelaJS API - Auth negative cases', () => {
  test('GET profile fails without token', async ({ request }) => {
    const resp = await request.get(`${API4.BASE_URL}${API4.ENDPOINTS.PROFILE}`);
    expect([401, 403]).toContain(resp.status());
  });
});

test.describe.serial('EscuelaJS API - Category CRUD', () => {
  let createdId: number;

  test('GET all categories returns array', async ({ request }) => {
    const resp = await request.get(`${API4.BASE_URL}${API4.ENDPOINTS.CATEGORIES}`);
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('POST create new category', async ({ request }) => {
    const newCat = {
      name: `Test Category ${Date.now()}`,
      image: 'https://placeimg.com/640/480/any?t=' + Date.now(),
    };
    const resp = await request.post(`${API4.BASE_URL}${API4.ENDPOINTS.CATEGORIES}`, {
      data: newCat,
    });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body).toHaveProperty('id');
    expect(body.name).toBe(newCat.name);
    createdId = body.id as number;
  });

  test('GET single category by ID', async ({ request }) => {
    const categoryId = createdId;
    const resp = await request.get(`${API4.BASE_URL}${API4.ENDPOINTS.CATEGORIES}/${categoryId}`);
    expect(resp.ok()).toBeTruthy();
    const cat = await resp.json();
    expect(cat.id).toBe(categoryId);
    expect(cat).toHaveProperty('name');
  });
  test('PUT update category fully', async ({ request }) => {
    const updated = {
      name: `Updated Category Name ${Date.now()}`,
      image: `https://placeimg.com/640/480/tech/any?t=${Date.now()}`,
    };
    const resp = await request.put(`${API4.BASE_URL}${API4.ENDPOINTS.CATEGORIES}/${createdId}`, {
      data: updated,
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.name).toBe(updated.name);
    expect(body.image).toBe(updated.image);
  });

  test('PUT partially update category', async ({ request }) => {
    const patchData = { name: `Partially Updated Name ${Date.now()}` };
    const resp = await request.put(`${API4.BASE_URL}${API4.ENDPOINTS.CATEGORIES}/${createdId}`, {
      data: patchData,
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.name).toBe(patchData.name);
  });

  test('DELETE category', async ({ request }) => {
    const resp = await request.delete(`${API4.BASE_URL}${API4.ENDPOINTS.CATEGORIES}/${createdId}`, {});
    // EscuelaJS returns 200 with deleted object
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body).toBe(true);
  });
});

// Additional endpoint examples (products)

test.describe('EscuelaJS API - Product endpoints (sanity checks)', () => {
  test('GET list of products', async ({ request }) => {
    const resp = await request.get(`${API4.BASE_URL}${API4.ENDPOINTS.PRODUCTS}`);
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET single product (id 1)', async ({ request }) => {
    const resp = await request.get(`${API4.BASE_URL}${API4.ENDPOINTS.PRODUCTS}/1`);
    // Some IDs may not exist; accept 200, 400, or 404
    expect([200, 400, 404]).toContain(resp.status());
  });
});
