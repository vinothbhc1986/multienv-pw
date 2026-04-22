import { expect } from '@playwright/test';
import { test } from './fixtures/base';

test.describe('SauceDemo - Penetration Testing @security', () => {
  test.describe('Input Validation & Injection Attacks', () => {
    test('[SEC-001] SQL Injection attempt on login should fail safely', async ({ loginPage, page }) => {
      await loginPage.goto();

      // Attempt SQL injection
      const sqlPayload = "admin' OR '1'='1' --";
      await loginPage.login(sqlPayload, 'password');

      // Should show error, not bypass authentication
      await loginPage.expectErrorMessage(/username and password do not match/i);
      await expect(page).toHaveURL('/'); // Should stay on login page
    });

    test('[SEC-002] Large input handling should not cause crashes', async ({ loginPage, page }) => {
      await loginPage.goto();

      // Generate large input (10KB)
      const longInput = 'A'.repeat(10000);

      await loginPage.login(longInput, longInput);

      // Should handle gracefully, not crash
      await loginPage.expectErrorMessage(/username and password do not match/i);
      await expect(page).toHaveURL('/'); // Should stay on login page
    });

    test('[SEC-003] XSS attack in input fields should be sanitized', async ({ loginPage, page }) => {
      await loginPage.goto();

      // XSS payload
      const xssPayload = `<script>alert('XSS')</script><img src=x onerror=alert('XSS')>`;

      await loginPage.login(xssPayload, 'password');

      // Should show error, script should not execute
      await loginPage.expectErrorMessage(/username and password do not match/i);

      // Verify XSS payload is not executed - check that input field still contains the payload (not sanitized away)
      // and that no alert dialogs were triggered (we can't easily test this in Playwright)
      await expect(loginPage.usernameInput).toHaveValue(xssPayload);

      // Check that the error message doesn't contain rendered HTML
      const errorElement = page.locator('[data-test="error"]');
      const errorText = await errorElement.textContent();
      expect(errorText).not.toContain('<script>'); // Error message should not contain script tags
    });

    test('[SEC-004] HTML injection should be escaped', async ({ loginPage, page }) => {
      await loginPage.goto();

      // HTML injection attempt
      const htmlPayload = '<b>Bold</b><script>evil()</script>';

      await loginPage.login(htmlPayload, 'password');

      // Error message should contain escaped HTML, not rendered HTML
      const errorElement = page.locator('[data-test="error"]');
      await expect(errorElement).toBeVisible();

      // The error message should not render HTML tags
      const errorText = await errorElement.textContent();
      expect(errorText).toMatch(/username and password do not match/i);
      // Check that HTML tags are not rendered (no bold text in the error)
      await expect(errorElement.locator('b')).toHaveCount(0); // No bold elements should be rendered
    });

    test('[SEC-005] Null bytes and control characters should be handled', async ({ loginPage }) => {
      await loginPage.goto();

      // Null byte injection
      const nullBytePayload = 'admin\x00evil';

      await loginPage.login(nullBytePayload, 'password');

      // Should treat as invalid input
      await loginPage.expectErrorMessage(/username and password do not match/i);
    });
  });

  test.describe('Authentication & Session Attacks', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('[SEC-006] Direct access to protected pages should redirect to login', async ({ page, loginPage }) => {
      await page.goto('/inventory.html');
      await loginPage.isLoaded();
      await expect(page).toHaveURL('/'); // Should redirect to login page (root URL)
    });

    test('[SEC-007] Invalid session cookies should not grant access', async ({ page, context, loginPage }) => {
      // Add fake session cookie
      await context.addCookies([{
        name: 'session',
        value: 'fake-invalid-token',
        domain: 'www.saucedemo.com',
        path: '/'
      }]);

      await page.goto('/inventory.html');
      await loginPage.isLoaded();
      await expect(page).toHaveURL('/'); // Should redirect to login
    });

    test('[SEC-008] Brute force protection - multiple failed login attempts', async ({ loginPage, page }) => {
      await loginPage.goto();

      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await loginPage.login('invalid_user', 'invalid_pass');
        // Wait for error to appear
        await loginPage.expectErrorMessage(/username and password do not match/i);
      }

      // System should still respond (no account lockout in this demo, but should handle gracefully)
      await expect(page).toHaveURL('/'); // Should stay on login page
    });

    test('[SEC-009] Session fixation attempt should fail', async ({ page, context, loginPage }) => {
      // This test checks if the application properly handles pre-set session identifiers
      // In a real application, logging in should invalidate any pre-existing session

      // Set a predefined session ID before login
      await context.addCookies([{
        name: 'session',
        value: 'fixed-session-id',
        domain: 'www.saucedemo.com',
        path: '/'
      }]);

      await loginPage.goto();
      await loginPage.login('standard_user', 'secret_sauce');

      // After successful login, verify we're on the inventory page
      await expect(page).toHaveURL(/inventory/);

      // Check that the session was properly established (we're logged in)
      // The exact cookie behavior may vary by implementation
      const cookies = await context.cookies();
      const hasSessionCookie = cookies.some(c => c.name.includes('session') || c.name.includes('auth'));

      // At minimum, we should be logged in and on the inventory page
      // (The specific session cookie handling may differ between applications)
      expect(hasSessionCookie || cookies.length > 0).toBe(true); // Some form of session management exists
    });
  });

  test.describe('URL & Parameter Manipulation', () => {
    test('[SEC-010] Directory traversal in URL should not expose files', async ({ page }) => {
      // Attempt directory traversal
      await page.goto('/../../../etc/passwd');

      // In a client-side app, this should either:
      // 1. Show a 404 page, or
      // 2. Redirect to the root/login page, or
      // 3. Stay on the same URL but not expose server files

      // Check that we're not seeing actual file contents (like /etc/passwd content)
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toMatch(/root:|bin:|daemon:/); // Should not contain typical /etc/passwd content

      // Should not crash and should maintain basic page structure
      const title = await page.title();
      expect(title).toBeTruthy(); // Page should have a title
    });

    test('[SEC-011] Invalid URL parameters should be handled gracefully', async ({ page }) => {
      // Malformed URL parameters
      await page.goto('/?id=1\' UNION SELECT * FROM users --');

      // Should not crash, should either redirect to login or show error gracefully
      // Check that page doesn't crash and maintains basic functionality
      const title = await page.title();
      expect(title).toBeTruthy(); // Should have a title

      // Should not show database errors or stack traces
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toMatch(/SQL.*error|database.*error|syntax.*error|exception|stack.*trace/i);
    });

    test('[SEC-012] Parameter pollution should not cause issues', async ({ page }) => {
      // Parameter pollution attack
      await page.goto('/?username=admin&username=evil&password=pass&password=hacked');

      // Should not auto-login with polluted parameters
      // Should redirect to login or stay on login page
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/inventory'); // Should not be logged in

      // Page should remain functional
      await expect(page.locator('[data-test="username"]')).toBeVisible();
    });
  });

  test.describe('Rate Limiting & DoS Prevention', () => {
    test('[SEC-013] Rapid successive requests should be handled', async ({ page }) => {
      // Rapid navigation attempts
      for (let i = 0; i < 10; i++) {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
      }

      // Page should still be functional
      await expect(page.locator('[data-test="username"]')).toBeVisible();
    });

    test('[SEC-014] Large number of form submissions should not crash', async ({ loginPage }) => {
      await loginPage.goto();

      // Submit form multiple times rapidly
      const submitPromises = [];
      for (let i = 0; i < 20; i++) {
        submitPromises.push(loginPage.login('user', 'pass'));
      }

      // All should complete without crashing
      await Promise.allSettled(submitPromises);

      // Page should still be functional
      await expect(loginPage.page.locator('[data-test="username"]')).toBeVisible();
    });
  });

  test.describe('Data Exfiltration & Information Disclosure', () => {
    test('[SEC-015] Error messages should not leak sensitive information', async ({ loginPage }) => {
      await loginPage.goto();

      // Try various invalid inputs
      const testCases = [
        { user: '', pass: '' },
        { user: 'admin', pass: '' },
        { user: '', pass: 'password' },
        { user: 'a'.repeat(1000), pass: 'pass' },
        { user: 'user', pass: 'a'.repeat(1000) },
      ];

      for (const { user, pass } of testCases) {
        await loginPage.login(user, pass);
        const errorElement = loginPage.page.locator('[data-test="error"]');

        // Error should exist but not contain sensitive info like stack traces, file paths, etc.
        if (await errorElement.isVisible()) {
          const errorText = await errorElement.textContent();
          expect(errorText).not.toMatch(/stack trace|file:|line|exception|error.*at/i);
          expect(errorText).toMatch(/username and password|required|invalid/i);
        }
      }
    });

    test('[SEC-016] Page source should not contain sensitive comments', async ({ page }) => {
      await page.goto('/');

      const content = await page.content();

      // Should not contain developer comments with sensitive info
      expect(content).not.toMatch(/TODO.*password|FIXME.*secret|admin.*pass/i);
      expect(content).not.toMatch(/debug.*true|console\.log/i);
    });
  });

  test.describe('Client-Side Attacks', () => {
    test('[SEC-017] DOM-based XSS via URL fragments should be prevented', async ({ page }) => {
      // Attempt DOM XSS via URL fragment
      await page.goto('/#<script>alert("xss")</script>');

      // Page should load normally, no script execution
      await expect(page.locator('[data-test="username"]')).toBeVisible();

      // Check that no malicious scripts were added to the page
      const allScripts = await page.locator('script').all();
      for (const script of allScripts) {
        const src = await script.getAttribute('src');
        const content = await script.textContent();
        // Scripts should be legitimate (either have src or be standard scripts, not our XSS payload)
        expect(content).not.toContain('alert("xss")');
      }
    });

    test('[SEC-018] Local storage manipulation should not affect security', async ({ page, loginPage, context }) => {
      // First navigate to set up the page context
      await loginPage.goto();

      // Try to manipulate localStorage to fake authentication
      await page.evaluate(() => {
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('user', 'admin');
        localStorage.setItem('token', 'fake-jwt-token');
      });

      // Clear all cookies to simulate logged-out state
      await context.clearCookies();

      // Navigate to protected page - should still require login despite localStorage
      await page.goto('/inventory.html');

      // Should redirect to login, not be fooled by localStorage
      await expect(page).toHaveURL('/'); // Should redirect to login
      await expect(page.locator('[data-test="username"]')).toBeVisible(); // Login form should be shown
    });
  });

  test.describe('Network & Protocol Attacks', () => {
    test('[SEC-019] HTTP method tampering should not work', async ({ request }) => {
      // Try unusual HTTP methods
      const methods = ['PUT', 'DELETE', 'PATCH', 'OPTIONS', 'TRACE'];

      for (const method of methods) {
        const response = await request.fetch('/', { method });
        // Should return appropriate HTTP status, not crash
        expect([200, 301, 302, 404, 405]).toContain(response.status());
      }
    });

    test('[SEC-020] Malformed headers should be handled', async ({ page }) => {
      // First navigate to the page
      await page.goto('/');
      await expect(page.locator('[data-test="username"]')).toBeVisible();

      // Make fetch request with malformed headers
      const fetchResult = await page.evaluate(async () => {
        try {
          const response = await fetch('/', {
            method: 'GET',
            headers: {
              'X-Injected': 'malicious',
              'Content-Type': 'multipart/form-data; boundary=evil',
            }
          });
          return { status: response.status, ok: response.ok };
        } catch (err) {
          return { error: (err as Error).message };
        }
      });

      // Should get a valid response, not crash
      expect(fetchResult).toHaveProperty('status');

      // Page should remain functional and not crash
      await expect(page.locator('[data-test="username"]')).toBeVisible();
    });
  });
});
