const express = require("express");
const initializeDB = require("./database");

const app = express();
app.use(express.json());

const PORT = 3001;

let db;
let save;

// GET all books
app.get("/books/", (req, res) => {
  const result = db.exec("SELECT * FROM book");

  const books = result.length
    ? result[0].values.map((row) => ({
        id: row[0],
        title: row[1],
        author: row[2],
        price: row[3],
        pages: row[4],
      }))
    : [];

  res.send(books);
});

// GET one book
app.get("/books/:bookId/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM book WHERE id = ?");
  stmt.bind([req.params.bookId]);

  if (stmt.step()) {
    res.send(stmt.getAsObject());
  } else {
    res.status(404).send("Book not found");
  }

  stmt.free();
});

// POST a book
app.post("/books/", (req, res) => {
  const { title, author, price, pages } = req.body;

  db.run(
    "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
    [title, author, price, pages]
  );

  save();
  res.send("Book added successfully");
});

// PUT a book
app.put("/books/:bookId/", (req, res) => {
  const { title, author, price, pages } = req.body;

  db.run(
    "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
    [title, author, price, pages, req.params.bookId]
  );

  save();
  res.send("Book updated successfully");
});

// DELETE a book
app.delete("/books/:bookId/", (req, res) => {
  db.run("DELETE FROM book WHERE id = ?", [req.params.bookId]);

  save();
  res.send("Book deleted successfully");
});

// Start server after database initialization
const initializeDBAndServer = async () => {
  try {
    const database = await initializeDB();

    db = database.db;
    save = database.save;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
  }
};

initializeDBAndServer();