import { test, expect } from '@playwright/test';
import { API5 } from './utils/api5.constants';
import { validateAuthTokenResponse, validateResourceStructure } from './utils/api-test.helpers';
import { sampleBooking } from './api5-test-data';


let token = '';
let createdBookingId: number;

test.describe.serial('Restful Booker API – Authentication & Token handling', () => {
  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: API5.CREDENTIALS,
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    token = body.token as string;
    expect(validateAuthTokenResponse(body)).toBeTruthy();
    await request.dispose();
  });

  test('Login returns a token', async () => {
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});

test.describe.serial('Restful Booker API – Booking CRUD (Basic auth)', () => {
  test('Create a new booking', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: sampleBooking,
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    // The API returns { bookingid: number, booking: {...} }
    expect(body).toHaveProperty('bookingid');
    expect(body).toHaveProperty('booking');
    expect(validateResourceStructure(body.booking)).toBeTruthy();
    createdBookingId = body.bookingid as number;
  });

  test('Update the previously created booking using Basic auth', async ({ request }) => {
    const updatedPayload = { ...sampleBooking, firstname: 'Jane', totalprice: 200 };
    const resp = await request.put(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`,
      {
        data: updatedPayload,
        headers: {
          Cookie: `token=${token}`,
        },
      },
    );
    // Successful update returns 200 and the updated booking object.
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.firstname).toBe(updatedPayload.firstname);
    expect(body.totalprice).toBe(updatedPayload.totalprice);
  });

  test('Retrieve the updated booking and verify changes', async ({ request }) => {
    const resp = await request.get(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`,
    );
    expect(resp.ok()).toBeTruthy();
    const booking = await resp.json();
    expect(booking.firstname).toBe('Jane');
    expect(booking.totalprice).toBe(200);
  });
});

// Optional sanity check – ping endpoint (GET /ping) – not required but demonstrates a simple GET.
test('Health check – GET /ping returns OK', async ({ request }) => {
  const resp = await request.get(`${API5.BASE_URL}/ping`);
  expect(resp.ok()).toBeTruthy();
  const body = await resp.text();
  // The service returns a plain string "Created" when healthy.
  expect(body).toContain('Created');
});
