const express = require("express");
const { initializeDatabase } = require("./database");

const app = express();
app.use(express.json());

let db;
let saveDatabase;

// Validate book details
function isValidBook(book) {
    if (!book || typeof book !== "object" || Array.isArray(book)) {
        return false;
    }

    const title = typeof book.title === "string" ? book.title.trim() : "";
    const author = typeof book.author === "string" ? book.author.trim() : "";
    const price = book.price;

    if (!title || !author || price === "" ||
        price === null || price === undefined ||
        !Number.isFinite(Number(price)) || Number(price) < 0) {
        return false;
    }

    if (book.pages !== undefined && book.pages !== null) {
        if (book.pages === "" ||
            !Number.isInteger(Number(book.pages)) ||
            Number(book.pages) < 0) {
            return false;
        }
    }

    return true;
}

// GET ALL BOOKS WITH SEARCH, SORT, FILTER AND PAGINATION
app.get("/books", (req, res) => {
    let sql = "SELECT * FROM book WHERE 1=1";
    let values = [];

    const search = req.query.search_q;

    if (search !== undefined) {
        if (typeof search !== "string") {
            return res.status(400).json({ message: "Invalid search value" });
        }

        sql += " AND title LIKE ?";
        values.push("%" + search + "%");
    }

    const minPrice = req.query.min_price;
    const maxPrice = req.query.max_price;

    if (minPrice !== undefined) {
        if (minPrice.trim() === "" || !Number.isFinite(Number(minPrice)) ||
            Number(minPrice) < 0) {
            return res.status(400).json({ message: "Invalid minimum price" });
        }

        sql += " AND price >= ?";
        values.push(Number(minPrice));
    }

    if (maxPrice !== undefined) {
        if (maxPrice.trim() === "" || !Number.isFinite(Number(maxPrice)) ||
            Number(maxPrice) < 0) {
            return res.status(400).json({ message: "Invalid maximum price" });
        }

        sql += " AND price <= ?";
        values.push(Number(maxPrice));
    }

    if (minPrice !== undefined && maxPrice !== undefined &&
        Number(minPrice) > Number(maxPrice)) {
        return res.status(400).json({ message: "Invalid price range" });
    }

    const orderBy = req.query.order_by || "id";
    const order = (req.query.order || "ASC").toUpperCase();

    const allowedColumns = ["id", "title", "author", "price", "pages"];

    if (!allowedColumns.includes(orderBy)) {
        return res.status(400).json({ message: "Invalid order_by value" });
    }

    if (order !== "ASC" && order !== "DESC") {
        return res.status(400).json({ message: "Invalid order value" });
    }

    let limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
    let offset = req.query.offset === undefined ? 0 : Number(req.query.offset);

    if (!Number.isInteger(limit) || limit < 1 ||
        !Number.isInteger(offset) || offset < 0) {
        return res.status(400).json({ message: "Invalid limit or offset" });
    }

    sql += " ORDER BY " + orderBy + " " + order;
    sql += " LIMIT ? OFFSET ?";

    values.push(limit, offset);

    const statement = db.prepare(sql);
    statement.bind(values);

    let books = [];

    while (statement.step()) {
        books.push(statement.getAsObject());
    }

    statement.free();

    res.status(200).json(books);
});

// GET BOOK BY ID
app.get("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid book ID" });
    }

    const statement = db.prepare("SELECT * FROM book WHERE id = ?");
    statement.bind([id]);

    if (statement.step()) {
        const book = statement.getAsObject();
        statement.free();
        return res.status(200).json(book);
    }

    statement.free();

    res.status(404).json({ message: "Book not found" });
});

// ADD NEW BOOK
app.post("/books", (req, res) => {
    if (!isValidBook(req.body)) {
        return res.status(400).json({
            message: "Title, author and valid price are required"
        });
    }

    const statement = db.prepare(
        "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)"
    );

    statement.bind([
        req.body.title.trim(),
        req.body.author.trim(),
        Number(req.body.price),
        req.body.pages === undefined || req.body.pages === null
            ? null
            : Number(req.body.pages)
    ]);

    statement.step();
    statement.free();

    saveDatabase();

    res.status(201).json({
        message: "Book added successfully"
    });
});

// UPDATE BOOK
app.put("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid book ID" });
    }

    if (!isValidBook(req.body)) {
        return res.status(400).json({
            message: "Title, author and valid price are required"
        });
    }

    const check = db.prepare("SELECT id FROM book WHERE id = ?");
    check.bind([id]);

    if (!check.step()) {
        check.free();
        return res.status(404).json({ message: "Book not found" });
    }

    check.free();

    const statement = db.prepare(
        "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?"
    );

    statement.bind([
        req.body.title.trim(),
        req.body.author.trim(),
        Number(req.body.price),
        req.body.pages === undefined || req.body.pages === null
            ? null
            : Number(req.body.pages),
        id
    ]);

    statement.step();
    statement.free();

    saveDatabase();

    res.status(200).json({
        message: "Book updated successfully"
    });
});

// DELETE BOOK
app.delete("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid book ID" });
    }

    const check = db.prepare("SELECT id FROM book WHERE id = ?");
    check.bind([id]);

    if (!check.step()) {
        check.free();
        return res.status(404).json({ message: "Book not found" });
    }

    check.free();

    const statement = db.prepare("DELETE FROM book WHERE id = ?");
    statement.bind([id]);

    statement.step();
    statement.free();

    saveDatabase();

    res.status(200).json({
        message: "Book deleted successfully"
    });
});

// HANDLE ERRORS
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "Invalid JSON format"
        });
    }

    res.status(500).json({
        message: "Internal server error"
    });
});

// START SERVER
async function startServer() {
    const result = await initializeDatabase();

    db = result.db;
    saveDatabase = result.saveDatabase;

    const PORT = process.env.PORT || 3002;

    app.listen(PORT, () => {
        console.log("Database connected successfully");
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

startServer().catch((error) => {
    console.error("Server error:", error.message);
});