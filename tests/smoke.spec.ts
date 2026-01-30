
import { test, expect } from '@playwright/test';

test.describe('Production Smoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Go to the home page before each test
        await page.goto('/');
    });

    test('should load the home page correctly', async ({ page }) => {
        await expect(page).toHaveTitle(/Soho Space/);
        // Wait for the text to appear to ensure app is mounted
        await page.waitForSelector('text=Unlock Your', { timeout: 10000 });
        await expect(page.locator('h1')).toContainText('Unlock Your');
    });

    test('should allow navigation to login', async ({ page }) => {
        await page.click('text="I\'m a Founder"'); 
        await expect(page).toHaveURL(/\/login/);
    });

    test('should enforce password length limit on signup', async ({ page }) => {
        await page.goto('/login?mode=signup');
        await page.waitForSelector('input[name="password"]');
        await page.fill('input[name="password"]', 'verylongpassword123');
        
        // The value should be truncated to 10
        const passwordValue = await page.inputValue('input[name="password"]');
        expect(passwordValue.length).toBeLessThanOrEqual(10);
    });
});
