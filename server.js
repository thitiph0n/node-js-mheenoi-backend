const express = require("express");
const app = express();
const authorization = require("./helpers/authorization");
const cors = require("cors");
const bcrypt = require("bcrypt");

const generateId = require("./tools/generateId");

const students = require("./modules/students");

const employees = require("./modules/employees");

const lecturers = require("./modules/lecturers");

const staffs = require("./modules/staffs");

const scholarships = require("./modules/scholarships");

const activities = require("./modules/activities");

const login = require("./modules/login");

const setPassword = require("./modules/setPassword");

if (process.env.NODE_ENV !== "production") require("dotenv").config();

//cross origin allow
app.use(cors());

//accept Json body
app.use(express.json());

app.use("/api/students", students);

app.use("/api/employees", employees);

app.use("/api/lecturers", lecturers);

app.use("/api/staffs", staffs);

app.use("/api/scholarships", scholarships);

app.use("/api/activities", activities);

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

app.post("/testing/id", async (req, res) => {
  const payload = req.body.payload;
  console.log(payload);
  try {
    const studentId = await generateId({
      role: 2,
      academicYear: 2020,
      program: payload.program,
      departmentId: payload.departmentId,
      position: payload.position,
    });
    res.json({ studentId: studentId });
  } catch (error) {
    console.log(error);

    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
