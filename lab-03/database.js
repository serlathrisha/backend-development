const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const dbPath = path.join(__dirname, "database.db");

async function initializeDatabase() {
    const SQL = await initSqlJs();

    let db;

    if (fs.existsSync(dbPath)) {
        db = new SQL.Database(fs.readFileSync(dbPath));
    } else {
        db = new SQL.Database();
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS book (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            price REAL NOT NULL,
            pages INTEGER
        )
    `);

    function saveDatabase() {
        fs.writeFileSync(dbPath, Buffer.from(db.export()));
    }

    saveDatabase();

    return { db, saveDatabase };
}

module.exports = { initializeDatabase };