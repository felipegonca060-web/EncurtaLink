const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function makeCode(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  do {
    code = "";
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) code += chars[bytes[i] % chars.length];
  } while (loadData().some(item => item.code === code));
  return code;
}

app.post("/api/links", (req, res) => {
  const { url } = req.body || {};

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Informe um link." });
  }

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return res.status(400).json({ error: "Digite uma URL válida." });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return res.status(400).json({ error: "Apenas links HTTP e HTTPS são permitidos." });
  }

  const data = loadData();
  const existing = data.find(item => item.originalUrl === parsed.toString());

  if (existing) {
    return res.json({
      ...existing,
      shortUrl: `${req.protocol}://${req.get("host")}/${existing.code}`
    });
  }

  const item = {
    code: makeCode(),
    originalUrl: parsed.toString(),
    clicks: 0,
    createdAt: new Date().toISOString()
  };

  data.push(item);
  saveData(data);

  res.status(201).json({
    ...item,
    shortUrl: `${req.protocol}://${req.get("host")}/${item.code}`
  });
});

app.get("/api/links", (req, res) => {
  const data = loadData()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(item => ({
      ...item,
      shortUrl: `${req.protocol}://${req.get("host")}/${item.code}`
    }));

  res.json(data);
});

app.get("/:code", (req, res) => {
  const { code } = req.params;
  if (code === "favicon.ico") return res.status(404).end();

  const data = loadData();
  const item = data.find(link => link.code === code);

  if (!item) {
    return res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
  }

  item.clicks += 1;
  item.lastClickedAt = new Date().toISOString();
  saveData(data);

  res.redirect(item.originalUrl);
});

app.listen(PORT, () => {
  console.log(`Encurtador rodando em http://localhost:${PORT}`);
});