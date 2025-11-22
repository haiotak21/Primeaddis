const fetch = global.fetch || require("node-fetch");
const servers = ["http://localhost:3000", "http://localhost:3001"];
(async () => {
  for (const s of servers) {
    try {
      console.log("Trying", s + "/admin/inquiries");
      const res = await fetch(s + "/admin/inquiries");
      console.log("Status", res.status);
      const txt = await res.text();
      console.log(txt.slice(0, 4000));
      break;
    } catch (e) {
      console.error("Failed", s, e.message || e);
    }
  }
})();
