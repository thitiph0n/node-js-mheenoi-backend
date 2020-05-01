const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const globalConst = require("../helpers/constants");
const hasRole = require("../helpers/hasRole");

//authorize before access
router.use(authorization);

/**Summary of students in each department**/
router.get("/student-in-dep", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT depCode,faculty,count(*) AS count\
    FROM student s, department d\
    WHERE d.departmentId = s.departmentId"
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/**Summary of students in each subject in this year**/
router.get("/student-in-subject", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "select s.subjectId,s.subjectName,count(*)AS count \
    from enrollment e, subject s,enrollmentdetail b\
    where b.enrollmentId = e.enrollmentId and s.subjectId= b.subjectId\
    group by b.subjectId,e.year having year = ?",
      globalConst.academicYear
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/**Summary of scholarship requests in this year**/
router.get("/scholarship", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "select scholarshipName,count(*) as count\
    from scholarship_list sl,scholarship_request sr\
    where sl.scholarshipId = sr.scholarshipId and yearOfRequest = ?\
    group by scholarshipName;"
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/**Summary of employees in each department**/
router.get("/employee-in-dep", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM student_in_dep");
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

module.exports = router;
