const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Allow large Base64 images
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "",          // your MySQL username
  password: "",  // your MySQL password
  database: "employee_db"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

// API routes
const API = "/employees";

// CREATE
app.post(API, (req, res) => {
  const { id, name, gender, department, attendance, profile } = req.body;
  const sql = "INSERT INTO employees (id, name, gender, department, attendance, profile) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [id, name, gender, department, attendance, profile], err => {
    if (err) return res.status(500).send(err);
    res.send(req.body);
  });
});

// READ all
app.get(API, (req, res) => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

// UPDATE
app.put(`${API}/:id`, (req, res) => {
  const { id } = req.params;
  const { name, gender, department, attendance, profile } = req.body;
  const sql = "UPDATE employees SET name=?, gender=?, department=?, attendance=?, profile=? WHERE id=?";
  db.query(sql, [name, gender, department, attendance, profile, id], err => {
    if (err) return res.status(500).send(err);
    res.send(req.body);
  });
});

// DELETE
app.delete(`${API}/:id`, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM employees WHERE id=?", [id], err => {
    if (err) return res.status(500).send(err);
    res.send({ id });
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
