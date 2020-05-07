const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const hasRole = require("../helpers/hasRole");
const convertToDateTime = require("../tools/convertTime");
const globalConst = require("../helpers/constants");

//authorize before access
router.use(authorization);

/****add new subject****/
router.post("/", hasRole([2, 3]), async (req, res) => {
  const payload = req.body.payload;
  let queryResult = [],
    sectionValues,
    lecturerValues,
    timeValues;
  //prepare to insert
  sectionValues = "";
  lecturerValues = "";
  timeValues = "";
  const sections = payload.sections;
  for (section in sections) {
    sectionValues += `("${payload.subjectId}",${sections[section].sectionId},${sections[section].seat}),`;
    const lecturers = sections[section].employeeId;
    for (lecturer in lecturers) {
      lecturerValues += `("${payload.subjectId}",${sections[section].sectionId},"${lecturers[lecturer]}"),`;
    }
    const times = sections[section].class;
    for (time in times) {
      timeValues += `("${payload.subjectId}",${sections[section].sectionId},${
        times[time].no
      },"${convertToDateTime(
        times[time].weekday,
        times[time].startTime
      )}","${convertToDateTime(times[time].weekday, times[time].endTime)}"),`;
    }
  }
  //remove , at the last value
  sectionValues = sectionValues.slice(0, sectionValues.length - 1);
  lecturerValues = lecturerValues.slice(0, lecturerValues.length - 1);
  timeValues = timeValues.slice(0, timeValues.length - 1);
  //insert subject
  try {
    const result = await pool.query(
      "INSERT INTO subject(subjectId, subjectName, description,credit)\
      VALUE (?,?,?,?)",
      [
        payload.subjectId,
        payload.subjectName,
        payload.description,
        payload.credit,
      ]
    );
    queryResult.push(result);
  } catch (error) {
    queryResult.push({ error: error });
  }
  if (queryResult[0].error) {
    res.status(500).json({
      error: {
        message: queryResult[0].error.sqlMessage || error,
        code: queryResult[0].error.code,
      },
    });
  } else {
    //insert section
    try {
      const result = await pool.query(
        `INSERT INTO section(subjectId, sectionId, seat)\
    VALUE ${sectionValues}`
      );
      queryResult.push(result);
    } catch (error) {
      queryResult.push({ error: error });
    }
    //insert section_lecturer
    try {
      const result = await pool.query(
        `INSERT INTO section_lecturer(subjectId, sectionId, lecturerId)\
    VALUE ${lecturerValues}`
      );
      queryResult.push(result);
    } catch (error) {
      queryResult.push({ error: error });
    }
    //insert section_time
    try {
      const result = await pool.query(
        `INSERT INTO section_time(subjectId, sectionId, class, startTime, endTime)\
    VALUE ${timeValues}`
      );
      queryResult.push(result);
    } catch (error) {
      queryResult.push({ error: error });
    }
    let hasError;
    queryResult.forEach(async (el) => {
      if (el.error) {
        hasError = el.error;
        try {
          await pool.query(
            "DELETE FROM subject\
                WHERE subjectId=?",
            [payload.subjectId]
          );
          console.log("Roll back complete");
        } catch (error) {
          console.log(error);
          hasError = el.error;
        }
      }
    });
    console.log(hasError);
    if (!hasError) {
      res.status(201).json({
        status: "add subject successful",
        payload: queryResult,
      });
    } else {
      res.status(500).json({
        error: {
          message: hasError.sqlMessage || hasError,
          code: hasError.code,
        },
      });
    }
  }
});

/****list all subjects****/
router.get("/", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM subject");
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.sqlMessage || error,
        code: error.code,
        result: queryResult,
      },
    });
  }
});

/****list subjects by employeeId(lecturer)****/
router.get("/:employeeId", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT DISTINCT subjectId,subjectName,description,credit\
     FROM subject_all_join WHERE lecturerId=?",
      req.params.employeeId
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/****list subjects by employeeId(lecturer)****/
router.get(
  "/:employeeId/:subjectId/details",
  hasRole([2, 3]),
  async (req, res) => {
    try {
      const queryResult = await pool.query(
        "SELECT DISTINCT *\
     FROM subject_all_join WHERE lecturerId=? AND subjectId=?",
        [req.params.employeeId, req.params.subjectId]
      );
      res.json({ payload: queryResult });
    } catch (error) {
      res.status(500).json({
        error: { message: error.sqlMessage || error, code: error.code },
      });
    }
  }
);

/****list all students in subject****/
router.get("/:subjectId/students", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      'select subject.subjectId,subject.subjectName,enrollment.studentId,CONCAT(student.firstName," ",student.lastName)AS fullName,enrollmentdetail.sectionId\
    from subject join section on subject.subjectId = section.subjectId\
    left join enrollmentdetail on section.subjectId = enrollmentdetail.subjectId and section.sectionId = enrollmentdetail.sectionId\
    join enrollment on enrollment.enrollmentId = enrollmentdetail.enrollmentId\
    join student on student.studentId = enrollment.studentId\
    where subject.subjectId = ? and enrollment.year = ? and enrollment.semester = ? and enrollment.status="completed"',
      [req.params.subjectId, globalConst.academicYear, globalConst.semester]
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/****get subject info and section by subjectId****/
router.get("/:subjectId/details", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM subject_all_join WHERE subjectId=?",
      req.params.subjectId
    );
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

module.exports = router;
