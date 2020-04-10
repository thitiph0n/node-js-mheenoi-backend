const express = require("express");
const app = express();
const pool = require("./database");
const cors = require("cors");

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => res.json("simple API"));

const loginMiddleware = async (req, res, next) => {
  //query
  try {
    const result = await pool.query(
      `SELECT * FROM user WHERE userid = ${req.body.id}`
    );
    if (
      req.body.id === result[0].userId &&
      req.body.password === result[0].password
    ) {
      req.email = result[0].email;
      next();
    } else {
      res.json("Wrong username and password");
      res.status(400);
    }
  } catch (error) {
    res.status(400).end();
  }
};

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
    const result = await pool.query(`SELECT * FROM user WHERE userid = ${id}`);
    res.json(result[0]);
  } catch (error) {
    res.status(400).end();
  }
});

app.post("/login", loginMiddleware, (req, res) => {
  res.json(req.email);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
