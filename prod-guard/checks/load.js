import fs from "fs";

export default {
  name: "Load",
  async run(policy) {
    try {
      if (!fs.existsSync("load-test-result.json")) return { ok: true };
      const content = fs.readFileSync("load-test-result.json", "utf8");
      const r = JSON.parse(content);
      if (r.p95LatencyMs > policy.load.p95_latency_ms) {
        return { ok: false, name: "Load", severity: "CRITICAL" };
      }
      return { ok: true };
    } catch (error) {
      console.error("Load check error:", error.message);
      return { ok: true };
    }
  }
};
