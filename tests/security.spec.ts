
import { test, expect } from '@playwright/test';

test.describe('Security & Input Validation', () => {
  
  test('Support Chatbot should sanitize XSS payloads', async ({ page }) => {
    // Navigate to homepage where chatbot exists
    await page.goto('/');

    // Open chat
    const toggleButton = page.getByTestId('support-toggle');
    await toggleButton.click();
    await expect(page.locator('text=Soho Space Concierge')).toBeVisible();

    // Select a category first
    await page.click('button:has-text("Support")');

    // Inject XSS payload as Message
    const xssPayload = '<img src=x onerror=alert(1)>';
    const messageInput = page.locator('textarea[placeholder="Describe your issue or suggestion..."]');
    await messageInput.fill(xssPayload);
    
    // Fill email
    const emailInput = page.locator('input[placeholder="you@example.com"]');
    await emailInput.fill('test@example.com');

    // Wait for button to be enabled
    const submitButton = page.locator('button:has-text("Submit Ticket")');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    
    // Listen for dialog (alert) - if this fires, XSS failed (vulnerability exists)
    page.on('dialog', dialog => {
        throw new Error(`XSS Vulnerability Detected! Alert triggered: ${dialog.message()}`);
    });

    await submitButton.click();

    // Verify the message appears in the chat bubbling (the user message we just sent)
    await expect(page.locator(`text=${xssPayload}`)).toBeVisible();
    
    // Wait for bot response
    await expect(page.locator('text=Ticket submitted successfully')).toBeVisible({ timeout: 10000 });
  });

  test('Forms should resist SQL Injection characters', async ({ page }) => {
     await page.goto('/login?mode=signup');
     
     // SQL Injection payload in likely fields
     const sqlPayload = "' OR '1'='1";
     
     await page.fill('input[name="name"]', sqlPayload);
     await page.fill('input[name="email"]', 'test@example.com'); 
     await page.fill('input[name="password"]', 'password123');
     
     // Check if the input value is retained correctly
     expect(await page.inputValue('input[name="name"]')).toBe(sqlPayload);
  });
});
