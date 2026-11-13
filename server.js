const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const recent = [
  { host: "shop-printer.club", status: "up", detail: "1 packet, 12 ms" },
  { host: "booth-cam.club", status: "down", detail: "no reply" }
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function page(error, result) {
  const rows = recent
    .map(
      (row) => `<tr><td>${escapeHtml(row.host)}</td><td>${escapeHtml(row.status)}</td><td>${escapeHtml(row.detail)}</td></tr>`
    )
    .join("");
  const card = result
    ? `<article class="card"><p class="status">${escapeHtml(result.status)}</p><h2>${escapeHtml(result.host)}</h2><pre>${escapeHtml(result.detail)}</pre></article>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reach</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="shell">
    <header class="top">
      <a class="brand" href="/"><span class="mark">Rh</span><span><strong>Reach</strong><em>Is the host up?</em></span></a>
    </header>
    <main>
      <section class="hero">
        <h1>One host. One reply.</h1>
        <p class="lede">Reach pings a club host and keeps the reply. No account.</p>
      </section>
      <form method="post" action="/" class="stack">
        <label><span>Host</span><input name="host" placeholder="shop-printer.club" required></label>
        <button type="submit">Check</button>
      </form>
      ${error ? `<p class="flash">${escapeHtml(error)}</p>` : ""}
      ${card}
      <h2 class="section">Recent checks</h2>
      <table>
        <thead><tr><th>Host</th><th>Status</th><th>Reply</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </main>
    <footer>Reach is unofficial. It only pings what you type.</footer>
  </div>
</body>
</html>`;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.type("html").send(page(null, null));
});

app.post("/", (req, res) => {
  const host = String(req.body.host || "").trim();
  if (!host) {
    return res.status(400).type("html").send(page("Host is required.", null));
  }
  exec(`ping -c 1 -W 2 ${host}`, { timeout: 4000 }, (err, stdout, stderr) => {
    const detail = (stdout || stderr || (err && err.message) || "no reply").slice(0, 800);
    const status = err ? "down" : "up";
    res.type("html").send(page(null, { host, status, detail }));
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`Reach listening on ${port}`);
});
