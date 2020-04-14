const express = require("express");
const app = express();
const pool = require("./database");
const authorization = require("./authorization");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//cross origin allow
app.use(cors());
//accept Json body
app.use(express.json());

app.get("/", (req, res) =>
  res.send("Welcome to MHEENOI BACKEND By CHAI company")
);

app.get("/api", authorization, (req, res) =>
  res.json({ api: "MHEENOI BACKEND", version: 0.1, authData: req.authData })
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
    const result = await pool.query(`SELECT * FROM user WHERE userid = ${id}`);
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
    console.log(error);
    res.status(500).json({ message: "Register fail" });
  }
});

app.post("/login", async (req, res) => {
  //get user and password from body
  const userId = req.body.userId;
  const rawPassword = req.body.password;
  let queryResult = null;
  try {
    //check user with database
    if (userId[0] === "1") {
      queryResult = await pool.query(
        `SELECT userId, password, firstName FROM student WHERE userId = "${userId}";`
      );
    } else if (userId[0] === "2" || userId[0] === "3") {
      queryResult = await pool.query(
        `SELECT userId, password, firstName, position FROM employee WHERE userId = "${userId};"`
      );
    } else {
      res.status(400).json({ message: "Validation failure" });
    }
    //check password
    if (await bcrypt.compare(rawPassword, queryResult[0].password)) {
      //generate jwt
      const payload = {
        sub: req.body.userId,
        iat: new Date().getTime(),
      };
      const webToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10 min",
      });
      res.json({ jwt: webToken, type: req.body.userId[0] });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Wrong userId or password" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
