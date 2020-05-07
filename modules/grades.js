const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const globalConst = require("../helpers/constants");
const hasRole = require("../helpers/hasRole");

//authorize before access
router.use(authorization);

//get grade by subject
router.get("/:subjectId", hasRole([2]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      'SELECT e.studentId,CONCAT(s.firstName," ",s.lastName)AS fullName, ed.subjectId, ed.sectionId, ed.grade FROM enrollment e\
    LEFT JOIN enrollmentdetail ed ON e.enrollmentId = ed.enrollmentId\
    JOIN student s ON e.studentId = s.studentId\
    WHERE ed.subjectId = ? AND e.year=? AND e.semester=?',
      [req.params.subjectId, globalConst.academicYear, globalConst.semester]
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

//get grade by subject and section
router.get("/:subjectId/:sectionId", hasRole([2]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      'SELECT e.studentId,CONCAT(s.firstName," ",s.lastName)AS fullName, ed.subjectId, ed.sectionId, ed.grade,ed.enrollmentId FROM enrollment e\
    LEFT JOIN enrollmentdetail ed ON e.enrollmentId = ed.enrollmentId\
    JOIN student s ON e.studentId = s.studentId\
    WHERE ed.subjectId = ? AND ed.sectionId = ? AND e.year=? AND e.semester=? AND e.status ="completed"',
      [
        req.params.subjectId,
        req.params.sectionId,
        globalConst.academicYear,
        globalConst.semester,
      ]
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

//update grade
router.put("/", hasRole([2]), async (req, res) => {
  const payload = req.body.payload;
  try {
    let values = "";
    //loop all student in array
    for (i in payload) {
      values += `(${payload[i].enrollmentId},"${payload[i].subjectId}",${payload[i].grade}),`;
    }
    values = values.slice(0, values.length - 1);
    //update to database
    await pool.query(`INSERT INTO enrollmentdetail(enrollmentId,subjectId,grade)\
    VALUES ${values} ON DUPLICATE KEY UPDATE grade=VALUES(grade);`);
    res.status(201).json({ message: "Update successful" });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

module.exports = router;
