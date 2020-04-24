const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const bcrypt = require("bcrypt");
const authorization = require("../helpers/authorization");

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
      res.status(201).json({ message: "Register success" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: `Register fail (${error.code})` });
    }
  } else {
    res.sendStatus(403);
  }
});

router.get("/info", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM student WHERE studentId=?",
      req.authData.sub
    );
    res.json({
      requestedTime: Date.now(),
      requestedBy: req.authData.sub,
      payload: queryResult,
    });
  } catch (error) {
    res.status(500).json({ message: error.code });
  }
});

//get student information by studentId
router.get("/:studentId/info", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM student_info WHERE studentId=?",
      req.params.studentId
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({ error: { message: error.code } });
  }
});

//update student information by studentId
router.put("/:studentId/info", async (req, res) => {
  const payload = req.body.payload;
  try {
    //update to database
    const sql =
      " UPDATE student SET title=?, gender=?, firstName=?, \
      lastName=?, idCardNumber=? , email=?, dob=?, phoneNo = ?, bloodType=?,\
      address=?, parent1FirstName= ? , parent1LastName = ?, parent1Tel=?,\
      parent1Career=?,parent1Income=?, parent1Relation=?, parent2FirstName=?,\
      parent2LastName=?, parent2Tel=?, parent2Career=?, parent2Income=?, parent2Relation=?\
      WHERE studentId = ?";
    await pool.query(sql, [
      payload.title,
      payload.gender,
      payload.firstName,
      payload.lastName,
      payload.idCardNumber,
      payload.email,
      payload.dob,
      payload.phoneNo,
      payload.bloodType,
      payload.address,
      payload.parent1FirstName,
      payload.parent1LastName,
      payload.parent1Tel,
      payload.parent1Career,
      payload.parent1Income,
      payload.parent1Relation,
      payload.parent2FirstName,
      payload.parent2LastName,
      payload.parent2Tel,
      payload.parent2Career,
      payload.parent2Income,
      payload.parent2Relation,
      req.params.studentId,
    ]);
    res.status(201).json({ message: "Update successful" });
  } catch (error) {
    res.status(500).json({ error: { message: error.code } });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const queryResult1 = await pool.query(
      "SELECT * FROM student_info WHERE studentId=?",
      req.authData.sub
    );
    const queryResult2 = await pool.query(
      "SELECT * FROM student_scholarship WHERE studentId=? AND status = ? AND yearOfRequest =?",
      [req.authData.sub, "Approve", 2020]
    );
    const queryResult3 = await pool.query(
      "select enrollment.enrollmentId,enrollmentdetail.subjectId,subject.subjectName,enrollmentdetail.sectionId from enrollment\
      left join enrollmentdetail on enrollment.enrollmentId = enrollmentdetail.enrollmentId\
      left join subject on enrollmentdetail.subjectId=subject.subjectId\
      where studentId = ? and year = ? and semester = ?",
      [req.authData.sub, 2020, 2]
    );
    const queryResult4 = await pool.query(
      "select (sum( enrollmentdetail.grade * subject.credit) /\
      sum( case when enrollmentdetail.grade is not null then subject.credit end )\
          ) as gpa\
      from enrollment\
      left join enrollmentdetail on enrollment.enrollmentId = enrollmentdetail.enrollmentId\
      left join subject on enrollmentdetail.subjectId=subject.subjectId\
      where studentId = ? ",
      [req.authData.sub]
    );
    res.json({
      payload: {
        info: queryResult1,
        scholarship: queryResult2,
        enrollment: queryResult3,
        gpa: queryResult4,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.code } });
  }
});

module.exports = router;
