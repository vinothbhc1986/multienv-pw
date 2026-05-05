// login-jwt.spec.ts
import { test, expect } from '@playwright/test';

/**
 * This spec demonstrates a login flow to a public testing API that returns a JWT token.
 * It uses two popular demo services:
 *   1. ReqRes (https://reqres.in) – simple login returning a token string.
 *   2. Platzi Fake Store API (https://api.escuelajs.co) – returns an object with access and refresh JWTs.
 *
 * The tests verify that:
 *   - The login request succeeds (status 200).
 *   - The response contains a token field.
 *   - The token matches the typical JWT pattern (three base64url parts separated by periods).
 */

// Helper to validate JWT format (xxx.yy.zz)
function isJwt(token: string): boolean {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
}

test.describe('Public API login returning JWT', () => {
  test('ReqRes login should return a token', async ({ request }) => {
    const loginResponse = await request.post('https://reqres.in/api/login', {
      data: {
        email: 'eve.holt@reqres.in',
        password: 'cityslicka',
      },
    });

    // Ensure request succeeded
    expect(loginResponse.ok()).toBeTruthy();
    const body = await loginResponse.json();
    // ReqRes returns { token: "QpwL..." } – not a full JWT, but we still check existence
    expect(body).toHaveProperty('token');
    const token = body.token as string;
    // Basic sanity: token is non‑empty string
    expect(token.length).toBeGreaterThan(0);
  });

  test('Platzi Fake Store API login should return JWT access and refresh tokens', async ({ request }) => {
    const loginResponse = await request.post('https://api.escuelajs.co/api/v1/auth/login', {
      data: {
        email: 'john@mail.com',
        password: 'changeme',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const body = await loginResponse.json();
    // Expected shape: { access_token: "...", refresh_token: "..." }
    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('refresh_token');
    const accessToken = body.access_token as string;
    const refreshToken = body.refresh_token as string;
    // Verify both tokens look like JWTs
    expect(isJwt(accessToken)).toBeTruthy();
    expect(isJwt(refreshToken)).toBeTruthy();
  });
});
