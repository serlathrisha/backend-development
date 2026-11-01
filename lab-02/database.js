const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const DB_PATH = path.join(__dirname, "database.db");

async function initializeDB() {
  const SQL = await initSqlJs();

  const db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  db.run(`CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    price INTEGER,
    pages INTEGER
  )`);

  const count = db.exec("SELECT COUNT(*) FROM book")[0].values[0][0];

  if (count === 0) {
    const insert = db.prepare(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)"
    );

    const books = [
      ["Wings of Fire", "A. P. J. Abdul Kalam", 250, 180],
      ["The Alchemist", "Paulo Coelho", 300, 208],
      ["Atomic Habits", "James Clear", 450, 320],
      ["Ikigai", "Hector Garcia", 275, 194],
      ["Rich Dad Poor Dad", "Robert Kiyosaki", 350, 336],
      ["The Hobbit", "J. R. R. Tolkien", 400, 310],
      ["1984", "George Orwell", 220, 328],
      ["Pride and Prejudice", "Jane Austen", 280, 432],
      ["The Guide", "R. K. Narayan", 200, 220],
      ["Deep Work", "Cal Newport", 375, 296]
    ];

    books.forEach(book => insert.run(book));
    insert.free();
  }

  function save() {
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  }

  save();
  console.log("Database connected successfully");

  return { db, save };
}

module.exports = initializeDB;