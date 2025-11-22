const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", ".next");
console.log("Listing", p);
try {
  const entries = fs.readdirSync(p, { withFileTypes: true });
  for (const e of entries) {
    try {
      const stat = fs.statSync(path.join(p, e.name));
      console.log(
        e.name,
        e.isFile() ? "file" : e.isDirectory() ? "dir" : "other",
        "size",
        stat.size
      );
    } catch (err) {
      console.log(e.name, "stat-error", err && err.message);
    }
  }
} catch (err) {
  console.error("Failed to list:", err && err.message);
  process.exit(1);
}
