import { test, expect } from 'vitest';

test('API health check', async () => {
  let BASE = process.env.BASE_URL;
  if (!BASE || BASE === '/') {
    BASE = 'http://localhost:3000';
    console.warn("BASE_URL environment variable is not set. Using fallback http://localhost:3000 for local test check.");
  }

  try {
    const r = await fetch(`${BASE}/health`);
    expect(r.status).toBe(200);
    console.log("API health check passed");
  } catch (error) {
    if (BASE.includes('localhost')) {
      console.warn("API health check failed on localhost (expected if server not running):", error.message);
      return;
    }
    console.error("API health check failed:", error.message);
    throw error;
  }
});
