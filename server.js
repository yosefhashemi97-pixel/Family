const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database(process.env.DB_FILE || "family.sqlite");
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "family.sid",
  secret: process.env.SESSION_SECRET || "CHANGE_THIS_SECRET_BEFORE_DEPLOYING",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24
  }
}));
app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

function cleanUser(row) {
  return row ? { id: row.id, username: row.username, createdAt: row.created_at } : null;
}
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "ابتدا وارد حساب شوید." });
  next();
}
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

app.post("/api/register", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!/^[\p{L}\p{N}_-]{3,20}$/u.test(username))
    return res.status(400).json({ error: "نام کاربری باید ۳ تا ۲۰ حرف، عدد یا _ و - باشد." });
  if (!validEmail(email)) return res.status(400).json({ error: "ایمیل معتبر وارد کنید." });
  if (password.length < 8) return res.status(400).json({ error: "رمز عبور باید حداقل ۸ کاراکتر باشد." });

  try {
    const hash = await bcrypt.hash(password, 12);
    const result = db.prepare(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)"
    ).run(username, email, hash);
    req.session.userId = Number(result.lastInsertRowid);
    res.json({ user: { id: Number(result.lastInsertRowid), username } });
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) return res.status(409).json({ error: "این نام کاربری یا ایمیل قبلاً ثبت شده است." });
    res.status(500).json({ error: "خطای سرور. دوباره تلاش کنید." });
  }
});

app.post("/api/login", async (req, res) => {
  const identity = String(req.body.identity || "").trim();
  const password = String(req.body.password || "");
  const user = db.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE OR email = ?").get(identity, identity.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: "نام کاربری/ایمیل یا رمز عبور اشتباه است." });
  req.session.userId = user.id;
  res.json({ user: cleanUser(user) });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/me", (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = db.prepare("SELECT id, username, created_at FROM users WHERE id = ?").get(req.session.userId);
  res.json({ user: cleanUser(user) });
});

app.get("/api/members", (req, res) => {
  const members = db.prepare("SELECT id, username, created_at FROM users ORDER BY id DESC").all();
  res.json({ members: members.map(cleanUser) });
});

app.get("/api/admin/members", requireLogin, (req, res) => {
  if (!ADMIN_USERNAME) return res.status(503).json({ error: "مدیر سایت هنوز در تنظیمات سرور تعیین نشده است." });
  const current = db.prepare("SELECT username FROM users WHERE id = ?").get(req.session.userId);
  if (!current || current.username.toLowerCase() !== ADMIN_USERNAME.toLowerCase())
    return res.status(403).json({ error: "دسترسی مدیر لازم است." });
  const members = db.prepare("SELECT id, username, email, created_at FROM users ORDER BY id DESC").all();
  res.json({ members });
});

app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, () => console.log(`Family is running on http://localhost:${PORT}`));
