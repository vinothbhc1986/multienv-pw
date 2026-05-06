import { test, expect } from '@playwright/test';

// Helper to validate JWT format
function isJwt(token: string): boolean {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
}

const BASE_URL = 'https://api.escuelajs.co/api/v1';

/**
 * Test suite for the public EscuelaJS demo API.
 * Covers authentication, and CRUD operations on categories.
 */

test.describe.serial('EscuelaJS API - Authentication', () => {
  let token: string = '';
  let refreshToken: string = '';

  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();
    const resp = await request.post(`${BASE_URL}/auth/login`, {
      data: { email: 'john@mail.com', password: 'changeme' },
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
    const profileResp = await request.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(profileResp.ok()).toBeTruthy();
    const profile = await profileResp.json();
    expect(profile).toHaveProperty('email');
    expect(profile.email).toBe('john@mail.com');
  });
});

test.describe('EscuelaJS API - Auth negative cases', () => {
  test('GET profile fails without token', async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/auth/profile`);
    expect([401, 403]).toContain(resp.status());
  });
});

test.describe.serial('EscuelaJS API - Category CRUD', () => {
  let createdId: number;

  test('GET all categories returns array', async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/categories`);
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('POST create new category', async ({ request }) => {
    const newCat = {
      name: `Test Category ${Date.now()}`,
      image: 'https://placeimg.com/640/480/any?t=' + Date.now(),
    };
    const resp = await request.post(`${BASE_URL}/categories`, {
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
    const resp = await request.get(`${BASE_URL}/categories/${categoryId}`);
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
    const resp = await request.put(`${BASE_URL}/categories/${createdId}`, {
      data: updated,
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.name).toBe(updated.name);
    expect(body.image).toBe(updated.image);
  });

  test('PUT partially update category', async ({ request }) => {
    const patchData = { name: `Partially Updated Name ${Date.now()}` };
    const resp = await request.put(`${BASE_URL}/categories/${createdId}`, {
      data: patchData,
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.name).toBe(patchData.name);
  });

  test('DELETE category', async ({ request }) => {
    const resp = await request.delete(`${BASE_URL}/categories/${createdId}`, {});
    // EscuelaJS returns 200 with deleted object
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body).toBe(true);
  });
});

// Additional endpoint examples (products)

test.describe('EscuelaJS API - Product endpoints (sanity checks)', () => {
  test('GET list of products', async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/products`);
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET single product (id 1)', async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/products/1`);
    // Some IDs may not exist; accept 200, 400, or 404
    expect([200, 400, 404]).toContain(resp.status());
  });
});
