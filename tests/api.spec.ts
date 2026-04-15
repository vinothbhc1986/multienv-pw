import { test, expect } from '@playwright/test';

test.describe('API Testing with Reqres.in', () => {
  const baseURL = 'https://reqres.in/api';

  test.use({
    extraHTTPHeaders: {
      'x-api-key': process.env.REQRES_API_KEY || ''
    }
  });

  test('GET - Fetch list of users', async ({ request }) => {
    const response = await request.get(`${baseURL}/users?page=2`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('page', 2);
    expect(responseBody.data).toBeInstanceOf(Array);
    expect(responseBody.data.length).toBeGreaterThan(0);
  });

  test('GET - Fetch a single user by ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/users/2`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.data).toHaveProperty('id', 2);
    expect(responseBody.data).toHaveProperty('email');
    expect(responseBody.data).toHaveProperty('first_name');
    expect(responseBody.data).toHaveProperty('last_name');
  });

  test('GET - Fetch a user that does not exist', async ({ request }) => {
    const response = await request.get(`${baseURL}/users/23`);
    expect(response.status()).toBe(404);
  });

  test('POST - Create a new user', async ({ request }) => {
    const newUser = {
      name: 'morpheus',
      job: 'leader'
    };

    const response = await request.post(`${baseURL}/users`, {
      data: newUser
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201); // 201 Created

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('name', newUser.name);
    expect(responseBody).toHaveProperty('job', newUser.job);
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('createdAt');
  });

  test('PUT - Update an existing user', async ({ request }) => {
    const updatedData = {
      name: 'morpheus',
      job: 'zion resident'
    };

    const response = await request.put(`${baseURL}/users/2`, {
      data: updatedData
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('name', updatedData.name);
    expect(responseBody).toHaveProperty('job', updatedData.job);
    expect(responseBody).toHaveProperty('updatedAt');
  });

  test('DELETE - Delete an existing user', async ({ request }) => {
    const response = await request.delete(`${baseURL}/users/2`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(204); // 204 No Content
  });

  // Additional comprehensive test cases

  test.describe('Pagination & Query Parameters', () => {
    test('GET - Users with different page sizes', async ({ request }) => {
      const response = await request.get(`${baseURL}/users?per_page=5`);
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      expect(responseBody.data).toHaveLength(5);
      expect(responseBody).toHaveProperty('per_page', 5);
    });

    test('GET - Users with invalid page number', async ({ request }) => {
      const response = await request.get(`${baseURL}/users?page=999`);
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      expect(responseBody.data).toHaveLength(0);
      expect(responseBody).toHaveProperty('page', 999);
    });

    test('GET - Users with negative page number', async ({ request }) => {
      const response = await request.get(`${baseURL}/users?page=-1`);
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      expect(responseBody.data).toBeInstanceOf(Array);
    });
  });

  test.describe('Response Headers & Content Types', () => {
    test('GET - Verify response headers', async ({ request }) => {
      const response = await request.get(`${baseURL}/users/2`);

      // Check common headers
      expect(response.headers()['content-type']).toContain('application/json');
      expect(response.headers()['access-control-allow-origin']).toBe('*');
    });

    test('POST - Send different content types', async ({ request }) => {
      const response = await request.post(`${baseURL}/users`, {
        data: JSON.stringify({ name: 'test', job: 'tester' }),
        headers: { 'Content-Type': 'application/json' }
      });
      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe('Data Validation & Edge Cases', () => {
    test('POST - Create user with empty data', async ({ request }) => {
      const response = await request.post(`${baseURL}/users`, {
        data: {}
      });
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('createdAt');
    });

    test('POST - Create user with special characters', async ({ request }) => {
      const specialUser = {
        name: 'Test@User#123',
        job: 'developer & tester'
      };

      const response = await request.post(`${baseURL}/users`, {
        data: specialUser
      });
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      expect(responseBody.name).toBe(specialUser.name);
      expect(responseBody.job).toBe(specialUser.job);
    });

    test('POST - Create user with very long data', async ({ request }) => {
      const longName = 'A'.repeat(1000);
      const longJob = 'B'.repeat(500);

      const response = await request.post(`${baseURL}/users`, {
        data: { name: longName, job: longJob }
      });
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      expect(responseBody.name).toBe(longName);
      expect(responseBody.job).toBe(longJob);
    });

    test('PUT - Update with partial data', async ({ request }) => {
      const response = await request.put(`${baseURL}/users/2`, {
        data: { name: 'Updated Name' } // Only updating name
      });
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      expect(responseBody.name).toBe('Updated Name');
      expect(responseBody).toHaveProperty('updatedAt');
    });
  });

  test.describe('Authentication Endpoints', () => {
    test('POST - User registration', async ({ request }) => {
      const registerData = {
        email: 'eve.holt@reqres.in',
        password: 'pistol'
      };

      const response = await request.post(`${baseURL}/register`, {
        data: registerData
      });
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('token');
    });

    test('POST - User login', async ({ request }) => {
      const loginData = {
        email: 'eve.holt@reqres.in',
        password: 'cityslicka'
      };

      const response = await request.post(`${baseURL}/login`, {
        data: loginData
      });
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('token');
    });

    test('POST - Register with missing password', async ({ request }) => {
      const response = await request.post(`${baseURL}/register`, {
        data: { email: 'test@example.com' }
      });
      expect(response.status()).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    });

    test('POST - Login with invalid credentials', async ({ request }) => {
      const response = await request.post(`${baseURL}/login`, {
        data: {
          email: 'invalid@example.com',
          password: 'wrongpassword'
        }
      });
      expect(response.status()).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    });
  });

  test.describe('Resource Endpoints', () => {
    test('GET - Fetch list of resources', async ({ request }) => {
      const response = await request.get(`${baseURL}/unknown`);
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('data');
      expect(responseBody.data).toBeInstanceOf(Array);
      expect(responseBody.data.length).toBeGreaterThan(0);
    });

    test('GET - Fetch single resource', async ({ request }) => {
      const response = await request.get(`${baseURL}/unknown/2`);
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      expect(responseBody.data).toHaveProperty('id', 2);
      expect(responseBody.data).toHaveProperty('name');
      expect(responseBody.data).toHaveProperty('year');
      expect(responseBody.data).toHaveProperty('color');
      expect(responseBody.data).toHaveProperty('pantone_value');
    });

    test('GET - Fetch non-existent resource', async ({ request }) => {
      const response = await request.get(`${baseURL}/unknown/999`);
      expect(response.status()).toBe(404);
    });
  });

  test.describe('Error Scenarios & Status Codes', () => {
    test('GET - Very high user ID should return 404', async ({ request }) => {
      const response = await request.get(`${baseURL}/users/999999`);
      expect(response.status()).toBe(404);
    });

    test('PUT - Update non-existent user', async ({ request }) => {
      const response = await request.put(`${baseURL}/users/999`, {
        data: { name: 'Test' }
      });
      expect(response.ok()).toBeTruthy(); // Reqres.in returns 200 even for non-existent users
    });

    test('DELETE - Delete non-existent user', async ({ request }) => {
      const response = await request.delete(`${baseURL}/users/999`);
      expect(response.ok()).toBeTruthy(); // Reqres.in returns 204 even for non-existent users
    });

    test('POST - Malformed JSON', async ({ request }) => {
      const response = await request.post(`${baseURL}/users`, {
        data: '{ invalid json }',
        headers: { 'Content-Type': 'application/json' }
      });
      // This might return 400 or be handled gracefully
      expect([200, 201, 400]).toContain(response.status());
    });
  });

  test.describe('Performance & Response Time', () => {
    test('GET - Response time should be reasonable', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(`${baseURL}/users`);
      const endTime = Date.now();

      expect(response.ok()).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    test('POST - Create user response time', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.post(`${baseURL}/users`, {
        data: { name: 'Performance Test', job: 'tester' }
      });
      const endTime = Date.now();

      expect(response.ok()).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(3000); // Should respond within 3 seconds
    });
  });

  test.describe('Concurrent Requests', () => {
    test('Multiple simultaneous GET requests', async ({ request }) => {
      const promises = Array(5).fill().map(() =>
        request.get(`${baseURL}/users/2`)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
      });
    });

    test('Mixed GET and POST requests', async ({ request }) => {
      const getPromise = request.get(`${baseURL}/users`);
      const postPromise = request.post(`${baseURL}/users`, {
        data: { name: 'Concurrent Test', job: 'tester' }
      });

      const [getResponse, postResponse] = await Promise.all([getPromise, postPromise]);

      expect(getResponse.ok()).toBeTruthy();
      expect(postResponse.ok()).toBeTruthy();
    });
  });

  test.describe('Data Structure Validation', () => {
    test('GET - Validate user data structure', async ({ request }) => {
      const response = await request.get(`${baseURL}/users/2`);
      const responseBody = await response.json();

      // Validate data structure
      expect(responseBody.data).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          email: expect.any(String),
          first_name: expect.any(String),
          last_name: expect.any(String),
          avatar: expect.any(String)
        })
      );

      // Validate email format
      expect(responseBody.data.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    test('POST - Validate created user structure', async ({ request }) => {
      const response = await request.post(`${baseURL}/users`, {
        data: { name: 'Structure Test', job: 'validator' }
      });
      const responseBody = await response.json();

      expect(responseBody).toEqual(
        expect.objectContaining({
          name: 'Structure Test',
          job: 'validator',
          id: expect.any(String),
          createdAt: expect.any(String)
        })
      );

      // Validate createdAt is a valid ISO date
      expect(new Date(responseBody.createdAt).toISOString()).toBe(responseBody.createdAt);
    });
  });
});
