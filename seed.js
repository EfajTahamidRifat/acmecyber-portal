// seed.js
// Creates database file (data.db) and seeds users, content and a secret token
// Passwords are hashed for realistic behavior. Use this script to (re)seed data between labs.

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const DB = 'data.db';
if (fs.existsSync(DB)) fs.unlinkSync(DB);
const db = new sqlite3.Database(DB);

const USERS_COUNT = 50;
const CONTENT_COUNT = 200;

function randomUsername(i) { return `user${i}` }
function randomPassword(i) { return `Pass!${1000 + i}` }
function randomTitle(i) { return `Security Bulletin ${i}` }
function randomBody(i) { return `This is an example advisory entry number ${i}. Keep systems patched.` }

(async () => {
  db.serialize(async () => {
    db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT)`);
    db.run(`CREATE TABLE content (id INTEGER PRIMARY KEY, title TEXT, body TEXT)`);
    db.run(`CREATE TABLE secrets (id INTEGER PRIMARY KEY, key TEXT, note TEXT)`);

    const insertUser = db.prepare('INSERT INTO users (username,password,role) VALUES (?,?,?)');

    // seed an admin and two staff users with known passwords (for labs)
    const adminPass = await bcrypt.hash('adminpass', 10);
    insertUser.run('carol', adminPass, 'admin');
    const alicePass = await bcrypt.hash('password123', 10);
    insertUser.run('alice', alicePass, 'user');
    const bobPass = await bcrypt.hash('letmein', 10);
    insertUser.run('bob', bobPass, 'user');

    // additional fake users
    for (let i = 1; i <= USERS_COUNT; i++) {
      const uname = randomUsername(i);
      const p = await bcrypt.hash(randomPassword(i), 10);
      const role = (i % 20 === 0) ? 'admin' : 'user';
      insertUser.run(uname, p, role);
    }
    insertUser.finalize();

    const insertContent = db.prepare('INSERT INTO content (title,body) VALUES (?,?)');
    for (let i = 1; i <= CONTENT_COUNT; i++) insertContent.run(randomTitle(i), randomBody(i));
    insertContent.finalize();

    // A secret artifact to discover during labs
    const insertSecret = db.prepare('INSERT INTO secrets (key,note) VALUES (?,?)');
    insertSecret.run('legacy_api_backdoor_2025', 'Legacy API key for internal migration (do not expose)');
    insertSecret.finalize();

    console.log('Database seeded: data.db (users:', USERS_COUNT + 3, ', content:', CONTENT_COUNT, ')');
  });
})();
