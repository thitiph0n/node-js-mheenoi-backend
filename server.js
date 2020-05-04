//import frameworks
const express = require("express");
const app = express();
const authorization = require("./helpers/authorization");
const cors = require("cors");
const bcrypt = require("bcrypt");

//import modules
const students = require("./modules/students");

const employees = require("./modules/employees");

const lecturers = require("./modules/lecturers");

const staffs = require("./modules/staffs");

const scholarships = require("./modules/scholarships");

const activities = require("./modules/activities");

const subjects = require("./modules/subjects");

const analysis = require("./modules/analysis");

const enrollments = require("./modules/enrollments");

const grades = require("./modules/grades");

const login = require("./modules/login");

const setPassword = require("./modules/setPassword");

//using dotenv in development
if (process.env.NODE_ENV !== "production") require("dotenv").config();

//cross origin allow
app.use(cors());
app.options("*", cors());

//accept Json body
app.use(express.json());

app.use("/api/students", students);

app.use("/api/employees", employees);

app.use("/api/lecturers", lecturers);

app.use("/api/staffs", staffs);

app.use("/api/scholarships", scholarships);

app.use("/api/activities", activities);

app.use("/api/subjects", subjects);

app.use("/api/analysis", analysis);

app.use("/api/grades", grades);

app.use("/api/enrollments", enrollments);

app.use("/login", login);

app.use("/set-password", setPassword);

app.get("/", (req, res) =>
  res.send("Welcome to MHEENOI BACKEND By CHAI company")
);

app.get("/api", authorization, (req, res) =>
  res.json({ api: "MHEENOI BACKEND", version: 0.3, authData: req.authData })
);

//Test functions
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
