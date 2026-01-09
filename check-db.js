const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(process.cwd(), "dev.db");
const db = new Database(dbPath);

const members = db.prepare("SELECT * FROM Member").all();
console.table(members);
console.log(`Total Members: ${members.length}`);
