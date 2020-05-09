const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const globalConst = require("../helpers/constants");
const hasRole = require("../helpers/hasRole");

//authorize before access
router.use(authorization);

/**Summary everything**/
router.get("/", hasRole([2, 3]), async (req, res) => {
  try {
    let queryResult = [];
    queryResult.push(
      await pool.query(
        "select d.departmentId,d.depCode,d.depName,d.faculty,count(s.studentId) AS numberOfStudents\
      from department d\
      left join student s on d.departmentId = s.departmentId\
      group by d.departmentId"
      ),
      await pool.query(
        'select subject.subjectId,subject.subjectName,count(year) AS numberOfStudents\
        from subject join section on subject.subjectId = section.subjectId\
        left join enrollmentdetail on section.subjectId = enrollmentdetail.subjectId and section.sectionId = enrollmentdetail.sectionId\
        left join enrollment on enrollment.enrollmentId = enrollmentdetail.enrollmentId\
        WHERE (year=? and enrollment.status = "completed") or year is null\
        group by subject.subjectId',
        globalConst.enrollYear
      ),
      await pool.query(
        "select l.scholarshipId,l.scholarshipName,\
        case when yearOfRequest = 2020 then count(yearOfRequest)\
        else 0\
        end\
        as numberOfRequests\
        from scholarship_list l\
        left join scholarship_request r on r.scholarshipId =l.scholarshipId\
        group by scholarshipId,yearOfRequest"
      ),
      await pool.query(
        "select d.departmentId,d.depCode,d.depName,d.faculty,count(e.employeeId) AS numberOfEmployees\
      from department d\
      left join employee e on d.departmentId = e.departmentId\
      group by d.departmentId"
      )
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/**Summary of students in each department**/
router.get("/student-in-dep", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "select d.departmentId,d.depCode,d.depName,d.faculty,count(s.studentId) AS numberOfStudents\
      from department d\
      left join student s on d.departmentId = s.departmentId\
      group by d.departmentId"
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
      'select subject.subjectId,subject.subjectName,count(year) AS numberOfStudents\
      from subject join section on subject.subjectId = section.subjectId\
      left join enrollmentdetail on section.subjectId = enrollmentdetail.subjectId and section.sectionId = enrollmentdetail.sectionId\
      left join enrollment on enrollment.enrollmentId = enrollmentdetail.enrollmentId\
      (year=? and enrollment.status = "completed") or year is null\
      group by subject.subjectId',
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
      "select l.scholarshipId,l.scholarshipName,\
      case when yearOfRequest = 2020 then count(yearOfRequest)\
      else 0\
      end\
      as numberOfRequests\
      from scholarship_list l\
      left join scholarship_request r on r.scholarshipId =l.scholarshipId\
      group by scholarshipId,yearOfRequest"
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
    const queryResult = await pool.query(
      "select d.departmentId,d.depCode,d.depName,d.faculty,count(e.employeeId) AS numberOfEmployees\
    from department d\
    left join employee e on d.departmentId = e.departmentId\
    group by d.departmentId"
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

module.exports = router;
