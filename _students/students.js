const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const bcrypt = require("bcrypt");
const authorization = require("../helpers/authorization");
const generateId = require("../tools/generateId");

router.use(authorization);

//get all students list
router.get("/", async (req, res) => {
  //Check permission (unsafe)
  if (req.authData.type === "2" || req.authData.type === "3") {
    try {
      const queryResult = await pool.query("SELECT * FROM student");
      res.json({ payload: queryResult });
    } catch (error) {
      res.status(500).json({ message: error.code });
    }
  } else {
    res.sendStatus(403);
  }
});
//register student
router.post("/", async (req, res) => {
  if (req.authData.type === "2" || req.authData.type === "3") {
    const payload = req.body.payload;

    try {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      //insert to database
      await pool.query(
        "INSERT INTO student(studentId,title,gender,firstName,lastName,idCardNumber,degree,departmentId,program,year,picturePath,email,dob,phoneNo,bloodType,address,password) VALUE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",
        [
          payload.studentId,
          payload.title,
          payload.gender,
          payload.firstName,
          payload.lastName,
          payload.idCardNumber,
          payload.degree,
          payload.departmentId,
          payload.program,
          payload.year,
          payload.picturePath,
          payload.email,
          payload.dob,
          payload.phoneNo,
          payload.bloodType,
          payload.address,
          hashedPassword,
        ]
      );
      res.status(201).json({ message: "Register success", payload: payload });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: `Register fail (${error.code})` });
    }
  } else {
    res.sendStatus(403);
  }
});

//get student information by studentId
router.get("/:studentId/info", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM student WHERE studentId=?",
      req.params.studentId
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({ message: error.code });
  }
});

//update student information by studentId
router.put("/:studentId/info", (req, res) => {
  res.json({ message: "student information by studentId" });
});

router.get("/dashboard", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM student WHERE studentId=?",
      req.authData.sub
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({ message: error.code });
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "you are right" });
});

router.post("/hashing", async (req, res) => {
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

module.exports = router;
