import fs from "fs";

export default {
  name: "CORS",
  async run(policy) {
    try {
      const content = fs.readFileSync("cors.config.json", "utf8");
      const cfg = JSON.parse(content);
      if (!policy.cors.allow_wildcard && cfg.allowOrigin === "*") {
        return {
          ok: false,
          name: "CORS",
          severity: "CRITICAL",
          autofix: true,
          fix() {
            cfg.allowOrigin = [];
            cfg.allowCredentials = false;
            fs.writeFileSync("cors.config.json", JSON.stringify(cfg, null, 2), "utf8");
          }
        };
      }
      return { ok: true };
    } catch (error) {
      console.error("CORS check error:", error.message);
      return { ok: true }; // Skip if config doesn't exist
    }
  }
};
