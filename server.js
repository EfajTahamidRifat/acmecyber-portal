// server.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

const DB_FILE = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(DB_FILE);
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session config (for local lab use). In production use secure store and HTTPS.
app.use(session({
  secret: 'replace_this_with_a_secure_random_value',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

// NOTE: This server contains endpoints for both demonstration of insecure patterns
// and a hardened login flow. Use instructor notes to decide which endpoints to demo.

// Hardened login endpoint: uses parameterized queries and bcrypt, sets server-side session
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing fields' });
  const sql = 'SELECT id,username,password,role FROM users WHERE username = ? LIMIT 1';
  db.get(sql, [username], async (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) return res.status(401).json({ error: 'invalid credentials' });
    const match = await bcrypt.compare(password, row.password);
    if (!match) return res.status(401).json({ error: 'invalid credentials' });
    // set safe session
    req.session.user = { id: row.id, username: row.username, role: row.role };
    res.json({ user: req.session.user });
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Public content listing (paginated)
app.get('/api/content', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || 1));
  const per = 20;
  const offset = (page - 1) * per;
  db.all('SELECT id,title,body FROM content LIMIT ? OFFSET ?', [per, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ content: rows });
  });
});

// Admin-only: add content (server-side role enforcement)
app.post('/api/admin/add-content', (req, res) => {
  const user = req.session.user;
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'forbidden - admin only' });
  const { title, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'missing fields' });
  db.run('INSERT INTO content (title,body) VALUES (?,?)', [title, body], function (err) {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ ok: true, id: this.lastID });
  });
});

// Admin: list users (server-side enforced)
app.get('/api/admin/users', (req, res) => {
  const user = req.session.user;
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'forbidden - admin only' });
  db.all('SELECT id,username,role FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ users: rows });
  });
});

// Insecure routes kept for demonstration in instructor materials (do not expose publicly):
//  - /insecure/search  (vulnerable to SQLi)
//  - /insecure/secret/:key (exposes secrets by key)

app.get('/insecure/search', (req, res) => {
  // intentionally insecure for classroom demo only
  const q = req.query.q || '';
  const sql = `SELECT id,title,body FROM content WHERE title LIKE '%${q}%' OR body LIKE '%${q}%'`;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ results: rows });
  });
});

app.get('/insecure/secret/:key', (req, res) => {
  const { key } = req.params;
  db.get(`SELECT * FROM secrets WHERE key='${key}'`, (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json({ secret: row });
  });
});

// Serve frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Acme Cyber Portal running on port', PORT));
