import { createSupportClient } from "@entrext/support-client";

// @ts-ignore - Vite env variables
const supportEndpoint = import.meta.env?.VITE_SUPPORT_ENDPOINT || "https://ldewwmfkymjmokopulys.supabase.co";
// @ts-ignore - Vite env variables
const supportAnonKey = import.meta.env?.VITE_SUPPORT_ANON_KEY || "sb_publishable_jgtstX7UhO85Bkf1qbFUMA_jkSWPo0Q";

export const supportClient = createSupportClient({
  endpoint: `${supportEndpoint.replace(/\/$/, '')}/functions/v1/submit-support`,
  anonKey: supportAnonKey
});
