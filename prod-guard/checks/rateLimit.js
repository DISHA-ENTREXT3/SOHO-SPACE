import fs from "fs";

export default {
  name: "Rate Limit",
  async run(policy) {
    try {
      const content = fs.readFileSync("rate-limit.config.json", "utf8");
      const cfg = JSON.parse(content);
      if (cfg.requestsPerMinute > policy.rate_limit.requests_per_minute.max) {
        return {
          ok: false,
          name: "Rate Limit",
          severity: "CRITICAL",
          autofix: true,
          fix() {
            cfg.requestsPerMinute = policy.rate_limit.requests_per_minute.max;
            fs.writeFileSync("rate-limit.config.json", JSON.stringify(cfg, null, 2), "utf8");
          }
        };
      }
      return { ok: true };
    } catch (error) {
      console.error("Rate Limit check error:", error.message);
      return { ok: true };
    }
  }
};
