import { test, expect } from '@playwright/test';
import { API5 } from './utils/api5.constants';
import { tokenPrefix } from './utils/api-test.helpers';
import { sampleBooking } from './api5-test-data';

test.describe.serial('Restful Booker API - Authentication negative tests', () => {
  test('Auth fails with invalid credentials', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: { username: 'invalid-user', password: 'invalid-pass' },
    });

    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('reason');
    expect(typeof body.reason).toBe('string');
    expect(body.reason.toLowerCase()).toContain('bad');
  });

  test('Auth fails with empty credentials object', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: {},
    });

    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('reason');
    expect(typeof body.reason).toBe('string');
  });

  test('Update booking fails without auth token cookie', async ({ request }) => {
    const createResp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: sampleBooking,
    });
    expect(createResp.ok()).toBeTruthy();
    const createBody = await createResp.json();
    const bookingId = createBody.bookingid as number;

    const updateResp = await request.put(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${bookingId}`, {
      data: { ...sampleBooking, firstname: 'NoAuth' },
    });

    expect(updateResp.status()).toBe(403);
  });

  test('Update booking fails with invalid auth token cookie', async ({ request }) => {
    const createResp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: sampleBooking,
    });
    expect(createResp.ok()).toBeTruthy();
    const createBody = await createResp.json();
    const bookingId = createBody.bookingid as number;

    const updateResp = await request.put(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${bookingId}`, {
      data: { ...sampleBooking, firstname: 'InvalidToken' },
      headers: {
        Cookie: `${tokenPrefix}not-a-valid-token`,
      },
    });

    expect(updateResp.status()).toBe(403);
  });

  test('Delete booking fails with tampered token', async ({ request }) => {
    const createResp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: sampleBooking,
    });
    expect(createResp.ok()).toBeTruthy();
    const createBody = await createResp.json();
    const bookingId = createBody.bookingid as number;

    const authResp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: API5.CREDENTIALS,
    });
    expect(authResp.ok()).toBeTruthy();
    const authBody = await authResp.json();
    const realToken = authBody.token as string;

    const tamperedToken = `${realToken}tampered`;
    const deleteResp = await request.delete(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${bookingId}`, {
      headers: {
        Cookie: `${tokenPrefix}${tamperedToken}`,
      },
    });

    expect(deleteResp.status()).toBe(403);
  });

  test('Auth endpoint rejects malformed JSON body (400 or 401)', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: 'not-json-object',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect([400, 401]).toContain(resp.status());
  });

  test('Create booking rejects invalid payload (400/500)', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: {
        firstname: 123,
        lastname: true,
        totalprice: 'not-a-number',
      },
    });
    expect(500).toBe(resp.status());
  });

  test('Non-existing endpoint returns 404', async ({ request }) => {
    const resp = await request.get(`${API5.BASE_URL}/booking-not-found`);
    expect(resp.status()).toBe(404);
  });

});
