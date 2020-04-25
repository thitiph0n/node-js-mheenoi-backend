const express = require("express");
const app = express();
const authorization = require("./helpers/authorization");
const cors = require("cors");
const bcrypt = require("bcrypt");

const students = require("./_students/students");

const employees = require("./_employees/employees");

const scholarships = require("./_scholarships/scholarships");

const login = require("./login");

if (process.env.NODE_ENV !== "production") require("dotenv").config();

//cross origin allow
app.use(cors());

//accept Json body
app.use(express.json());

app.use("/api/students", students);

app.use("/api/employees", employees);

app.use("/api/scholarships", scholarships);

app.use("/login", login);

app.get("/", (req, res) =>
  res.send("Welcome to MHEENOI BACKEND By CHAI company")
);

app.get("/api", authorization, (req, res) =>
  res.json({ api: "MHEENOI BACKEND", version: 0.2, authData: req.authData })
);

app.post("/hashing", async (req, res) => {
  const rawPassword = req.body.payload.password;
  try {
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    res.json({
      plaintext: rawPassword,
      hashedPassword: hashedPassword,
    });
  } catch (error) {
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
