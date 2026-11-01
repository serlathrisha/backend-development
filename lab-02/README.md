# Lab 2: SQLite Database and CRUD Operations

## Overview

This project implements a REST API using Node.js, Express.js, and SQLite. It performs CRUD operations on a Book database.

## Technologies Used

* Node.js
* Express.js
* SQLite
* JavaScript
* Postman

## Database Structure

Table Name: `book`

| Column | Data Type           |
| ------ | ------------------- |
| id     | INTEGER PRIMARY KEY |
| title  | TEXT                |
| author | TEXT                |
| price  | INTEGER             |
| pages  | INTEGER             |

## Installation

1. Install the dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Server URL:

```text
http://localhost:3001
```

## API Endpoints

| Method | Endpoint        | Description         |
| ------ | --------------- | ------------------- |
| GET    | /books/         | Get all books       |
| GET    | /books/:bookId/ | Get a specific book |
| POST   | /books/         | Add a new book      |
| PUT    | /books/:bookId/ | Update a book       |
| DELETE | /books/:bookId/ | Delete a book       |

## Sample POST Request

```json
{
  "title": "New Book",
  "author": "Author Name",
  "price": 250,
  "pages": 200
}
```

## Screenshots

All API testing screenshots are available in the `screenshots` folder.

## Conclusion

Successfully created a SQLite database and implemented CRUD operations using Express.js. Tested all API endpoints using Postman.
