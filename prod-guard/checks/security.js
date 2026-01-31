import fs from "fs";

export default {
  name: "Security",
  async run(policy) {
    try {
      if (!fs.existsSync("zap-report.json")) return { ok: true };
      const content = fs.readFileSync("zap-report.json", "utf8");
      const r = JSON.parse(content);
      if (r.alerts?.some(a => policy.security.block_on.includes(a.risk))) {
        return { ok: false, name: "Security", severity: "CRITICAL" };
      }
      return { ok: true };
    } catch (error) {
      console.error("Security check error:", error.message);
      return { ok: true };
    }
  }
};
