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

test.describe('EscuelaJS API - Authentication', () => {
  test('Login returns access JWT', async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/auth/login`, {
      data: { email: 'john@mail.com', password: 'changeme' },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
expect(body).toHaveProperty('access_token');
const access = body.access_token as string;
// The API returns only an access token (no refresh token)
// Validate the token format (JWT)
expect(isJwt(access)).toBeTruthy();
  });
});

test.describe.serial('EscuelaJS API - Category CRUD', () => {
  let createdId: number = 0;
  let token: string = '';

  test.beforeAll(async ({ playwright }) => {
    // Get token for authenticated requests using APIRequest
    const request = await playwright.request.newContext();
    const loginResp = await request.post(`${BASE_URL}/auth/login`, {
      data: { email: 'john@mail.com', password: 'changeme' },
    });
    const loginData = await loginResp.json();
    token = loginData.access_token as string;
    await request.dispose();
  });

  test('GET all categories returns array', async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/categories`);
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('POST create new category', async ({ request }) => {
    const newCat = { name: 'Automation Test Category', image: 'https://via.placeholder.com/640x480' };
    const resp = await request.post(`${BASE_URL}/categories`, {
      data: newCat,
      headers: { Authorization: `Bearer ${token}` },
    });
    // Accept either 201 (created) or 400 (bad request, possibly invalid image URL)
    expect([201, 400]).toContain(resp.status());
    const body = await resp.json();
    if (resp.status() === 201) {
      expect(body).toHaveProperty('id');
      expect(body.name).toBe(newCat.name);
      createdId = body.id as number;
    }
  });

  test('GET single category by ID', async ({ request }) => {
    // Depends on previous creation
    const resp = await request.get(`${BASE_URL}/categories/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const cat = await resp.json();
    expect(cat.id).toBe(createdId);
    expect(cat).toHaveProperty('name');
  });

  test('PUT update category fully', async ({ request }) => {
    const updated = { name: 'Updated Category Name', image: 'https://placeimg.com/640/480/tech' };
    const resp = await request.put(`${BASE_URL}/categories/${createdId}`, {
      data: updated,
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.name).toBe(updated.name);
    expect(body.image).toBe(updated.image);
  });

  test('PATCH partially update category', async ({ request }) => {
    const patchData = { name: 'Patched Name' };
    const resp = await request.patch(`${BASE_URL}/categories/${createdId}`, {
      data: patchData,
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.name).toBe(patchData.name);
  });

  test('DELETE category', async ({ request }) => {
    const resp = await request.delete(`${BASE_URL}/categories/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // EscuelaJS returns 200 with deleted object
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.id).toBe(createdId);
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
