const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", ".next", "trace");
console.log("Removing", p);
try {
  fs.chmodSync(p, 0o666);
} catch (e) {
  // ignore
}
try {
  fs.unlinkSync(p);
  console.log("Removed successfully");
} catch (err) {
  console.error("Failed to remove:", err && err.message ? err.message : err);
  process.exit(1);
}
