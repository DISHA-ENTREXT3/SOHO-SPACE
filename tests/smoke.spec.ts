
import { test, expect } from '@playwright/test';

test.describe('Production Smoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Go to the home page before each test
        await page.goto('/');
    });

    test('should load the home page correctly', async ({ page }) => {
        // More robust title check
        await expect(page).toHaveTitle(/Soho Space/i);
        
        // Wait for the hero section text
        const heroText = page.locator('h1');
        await expect(heroText).toBeVisible({ timeout: 15000 });
        await expect(heroText).toContainText('Growth Potential', { ignoreCase: true });
    });

    test('should allow navigation to login', async ({ page }) => {
        // Use a more specific locator for the "I'm a Founder" link
        const founderLink = page.getByRole('link', { name: /I'm a Founder/i }).first();
        await expect(founderLink).toBeVisible();
        await founderLink.click();
        
        await expect(page).toHaveURL(/\/login/);
    });

    test('should enforce password length limit on signup', async ({ page }) => {
        await page.goto('/login?mode=signup');
        
        // Wait for the form to be ready
        const passwordInput = page.locator('input[name="password"]');
        await expect(passwordInput).toBeVisible({ timeout: 10000 });
        
        // Fill a very long password
        await passwordInput.fill('verylongpassword123');
        
        // The value should be truncated to 10 in the UI (checked via input value)
        const passwordValue = await passwordInput.inputValue();
        expect(passwordValue.length).toBeLessThanOrEqual(10);
    });
});
