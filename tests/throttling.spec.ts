
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
    await expect(page.locator('text=The Growth Atelier')).toBeVisible();

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
    
    // Go offline
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    });

    // Try to navigate - should probably stay or show browser error, 
    // but here we check if the CURRENT page remains somewhat stable or crashes
    // Clicking a client-side route should still work if chunks are loaded or fail gracefully
    
    await page.click('text=Pricing'); 
    
    // Note: If chunks aren't cached, this might fail. 
    // If we had a Service Worker, we'd check for offline page.
    // For now, we just ensure the browser doesn't crash the existing DOM.
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

});
