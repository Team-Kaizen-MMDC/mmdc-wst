const fs = require("fs");
const path = require("path");

try {
  const swaggerSpec = require("../src/config/swagger");
  const out = path.resolve(__dirname, "..", "api-docs.json");
  fs.writeFileSync(out, JSON.stringify(swaggerSpec, null, 2));
  console.log("✅ Wrote", out);
} catch (err) {
  console.error("❌ Failed to export swagger spec:", err.message);
  process.exit(1);
}
