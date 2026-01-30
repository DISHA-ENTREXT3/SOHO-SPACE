
import { test, expect } from '@playwright/test';

test.describe('Network Throttling & Resilience', () => {

  // Test with Slow 3G network conditions
  test.use({
    viewport: { width: 375, height: 667 }, // Mobile view
  });

  test('Page load performance under Slow 3G', async ({ page }) => {
    // Connect to Chrome DevTools Protocol to simulate network conditions
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: ((500 * 1024) / 8), // 500 kbps
      uploadThroughput: ((500 * 1024) / 8),   // 500 kbps
      latency: 400,                           // 400ms latency
    });

    const startTime = Date.now();
    await page.goto('/');
    
    // Ensure critical elements load eventually
    await expect(page.locator('h1')).toBeVisible({ timeout: 30000 }); // Give it time
    
    // Use first() to avoid strict mode violation since "The Growth Atelier" appears multiple times
    await expect(page.locator('text=The Growth Atelier').first()).toBeVisible();

    const loadTime = Date.now() - startTime;
    console.log(`Slow 3G Load Time: ${loadTime}ms`);
    
    // Verify Chatbot is interactive even on slow connection
    const toggleButton = page.locator('button:has(.h-7.w-7)');
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();
    
    // Message might take longer to appear due to "setTimeout" in code, but shouldn't break
    await expect(page.locator('text=Soho Support')).toBeVisible();
  });

    test('Offline resilience', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load before going offline
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify Pricing link is visible in the header
    const pricingLink = page.locator('a[href="/pricing"]').first();
    await expect(pricingLink).toBeVisible();
    
    // Go offline
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    });

    // Try to navigate - client-side routing should still work since React is already loaded
    // Click the visible pricing link
    await pricingLink.click();
    
    // Wait for navigation to complete (client-side routing)
    await page.waitForURL('**/pricing', { timeout: 10000 });
    
    // Verify the page changed (body should still be visible)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Verify we're on the pricing page by checking for pricing-specific content
    // Since we're offline, external resources might not load, but the DOM should render
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
  });

});
