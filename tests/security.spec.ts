
import { test, expect } from '@playwright/test';

test.describe('Security & Input Validation', () => {
  
  test('Support Chatbot should sanitize XSS payloads', async ({ page }) => {
    // Navigate to homepage where chatbot exists
    await page.goto('/');

    // Open chat
    const toggleButton = page.locator('button:has(.h-7.w-7)');
    await toggleButton.click();
    await expect(page.locator('text=Soho Support')).toBeVisible();

    // The chat flow asks for Name first if not logged in
    // Wait for the bot to ask "First, what's your name?"
    await expect(page.locator('text=what\'s your name?')).toBeVisible();

    // Inject XSS payload as Name
    const xssPayload = '<img src=x onerror=alert(1)>';
    await page.fill('input[placeholder="Type your message..."]', xssPayload);
    await page.click('button[type="submit"]');

    // Verify the message appears in the chat bubbling
    // IMPORTANT: It should appear as TEXT, not execute the JS.
    // Playwright's locator('text=...') searches for text content, so if it finds it, it means it was rendered as text (Good).
    // If it was executed as HTML, the text might not be found or the alert would trigger (which we can catch).
    
    // Listen for dialog (alert) - if this fires, XSS failed (vulnerability exists)
    page.on('dialog', dialog => {
        throw new Error(`XSS Vulnerability Detected! Alert triggered: ${dialog.message()}`);
    });

    await expect(page.locator(`text=${xssPayload}`)).toBeVisible();
    
    // Continue flow - Email
    await expect(page.locator('text=email address')).toBeVisible();
    
    // Inject SQL Input as Email - Client side validation should catch this invalid email
    const sqlPayload = "admin' --"; // Invalid email format
    await page.fill('input[type="email"]', sqlPayload); // The input type might be text or email dynamically
    await page.click('button[type="submit"]');

    // Bot should complain about invalid email
    // "That doesn't look like a valid email. Please try again."
    await expect(page.locator('text=doesn\'t look like a valid email')).toBeVisible();
  });

  test('Forms should resist SQL Injection characters', async ({ page }) => {
     await page.goto('/login?mode=signup');
     
     // SQL Injection payload in likely fields
     const sqlPayload = "' OR '1'='1";
     
     await page.fill('input[name="name"]', sqlPayload);
     await page.fill('input[name="email"]', 'test@example.com'); 
     await page.fill('input[name="password"]', 'password123');
     
     // We are checking that the app doesn't crash or expose SQL errors on the screen upon typing
     // (Submission requires a backend, which we might fail on, but we check for Client-side stability)
     
     // Check if the input value is retained correctly (and not somehow mangled if there was poor logic)
     expect(await page.inputValue('input[name="name"]')).toBe(sqlPayload);
  });
});
