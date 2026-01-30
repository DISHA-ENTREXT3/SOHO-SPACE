import { createSupportClient } from "@entrext/support-client";

// @ts-ignore - Vite env variables
const supportEndpoint = import.meta.env?.VITE_SUPPORT_ENDPOINT;
// @ts-ignore - Vite env variables
const supportAnonKey = import.meta.env?.VITE_SUPPORT_ANON_KEY;

if (!supportEndpoint || !supportAnonKey) {
  console.warn('Support configuration missing. Support chat may not function correctly.');
}

export const supportClient = createSupportClient({
  endpoint: `${(supportEndpoint || '').replace(/\/$/, '')}/functions/v1/submit-support`,
  anonKey: supportAnonKey || 'placeholder'
});
