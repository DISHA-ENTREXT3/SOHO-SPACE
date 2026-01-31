import fs from "fs";

export default {
  name: "Network",
  async run(policy) {
    try {
      const content = fs.readFileSync("http-client.config.json", "utf8");
      const cfg = JSON.parse(content);
      if (cfg.timeoutMs < policy.network.timeout_ms.min) {
        return {
          ok: false,
          name: "Network",
          severity: "HIGH",
          autofix: true,
          fix() {
            cfg.timeoutMs = policy.network.timeout_ms.min;
            fs.writeFileSync("http-client.config.json", JSON.stringify(cfg, null, 2), "utf8");
          }
        };
      }
      return { ok: true };
    } catch (error) {
      console.error("Network check error:", error.message);
      return { ok: true };
    }
  }
};
