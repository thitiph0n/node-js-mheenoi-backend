const express = require("express");
const app = express();
const pool = require("./_helper/database");
const authorization = require("./_helper/authorization");
const cors = require("cors");

const bcrypt = require("bcrypt");

const students = require("./_students/students");
const login = require("./login");

if (process.env.NODE_ENV !== "production") require("dotenv").config();

//cross origin allow
app.use(cors());
//accept Json body
app.use(express.json());

app.use("/api/students", students);

app.use("/login", login);

app.get("/", (req, res) =>
  res.send("Welcome to MHEENOI BACKEND By CHAI company")
);

app.get("/api", authorization, (req, res) =>
  res.json({ api: "MHEENOI BACKEND", version: 0.2, authData: req.authData })
);

app.get("/api/user", authorization, async (req, res) => {
  try {
    const table = req.authData.sub[0] === "1" ? "student" : "employee";
    const queryResult = await pool.query(
      `SELECT userId, firstName, lastName, email FROM ${table} WHERE userId = "${req.authData.sub}";`
    );
    res.json(queryResult[0]);
  } catch (error) {
    console.log(error);
    res.sendStatus(204);
  }
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM user");
    res.json(result);
  } catch (error) {
    res.json(error);
  }
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM user WHERE userid = ?`, id);
    res.json(result[0]);
  } catch (error) {
    res.status(400).end();
  }
});

app.post("/register", async (req, res) => {
  const user = req.body;
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    //insert to database
    await pool.query(
      `INSERT INTO student(userId,firstName,lastName,email,password)VALUE("${user.userId}","${user.firstName}","${user.lastName}","${user.email}","${hashedPassword}");`
    );
    res.status(201).json({ message: "Register success" });
  } catch (error) {
    console.log(error.code);
    res.status(500).json({ message: `Register fail (${error.code})` });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
