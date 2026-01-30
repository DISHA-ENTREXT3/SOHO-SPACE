
import { test, expect } from '@playwright/test';

test.describe('Network Throttling & Resilience', () => {

  // Test with Desktop network conditions (Default)
  test.use({
    viewport: { width: 1280, height: 720 },
  });

  test('Page load performance under Slow 3G', async ({ page }) => {
    // We simulate slow 3G manually via CDP if needed, or just test base functionality
    // Playwright's network throttling is best done via browser contexts
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (400 * 1024) / 8, // 400kbps 
      uploadThroughput: (400 * 1024) / 8,
      latency: 400, // 400ms
    });

    const start = Date.now();
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    const loadTime = Date.now() - start;
    console.log(`Slow 3G Load Time: ${loadTime}ms`);
    
    // Verify Chatbot is interactive even on slow connection
    const toggleButton = page.getByTestId('support-toggle');
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();
    
    // Message might take longer to appear due to "setTimeout" in code, but shouldn't break
    await expect(page.locator('text=Soho Space Concierge')).toBeVisible({ timeout: 10000 });
  });

  test('Offline resilience', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load before going offline
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify Pricing link is visible in the header
    const pricingLink = page.locator('header a[href="/pricing"]').first();
    await expect(pricingLink).toBeVisible();
    
    // Go offline
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0,
    });
    
    // Attempt to click Pricing while offline
    // Since it's a SPA (React Router), the pricing page should STILL load if it was already bundled (code split might be an issue, but let's check)
    await pricingLink.click();
    
    // The route should change
    await expect(page).toHaveURL(/.*pricing/);
    
    // Even if it shows a "No internet" message for dynamic data, the PAGE UI should render
    await expect(page.locator('h1, h2')).toBeVisible({ timeout: 5000 });
  });
});
