const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const hasRole = require("../helpers/hasRole");
const convertToDateTime = require("../tools/convertTime");

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
    let hasError = false;
    queryResult.forEach(async (el) => {
      if (el.error) {
        if (!hasError) {
          try {
            await pool.query(
              "DELETE FROM subject\
                WHERE subjectId=?",
              [payload.subjectId]
            );
            console.log("Roll back complete");
          } catch (error) {
            console.log(error);
          }
          res.status(500).json({
            error: {
              message: el.error.sqlMessage || el.error,
              code: el.error.code,
            },
          });
          hasError = true;
        }
      }
    });
    if (!hasError) {
      res.status(201).json({
        status: "add subject successful",
        payload: queryResult,
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
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/****list subjects by employeeId(lecturer)****/
router.get("/:employeeId", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM subject");
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/****list all students in subject****/
router.get("/:subjectId/students", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM subject");
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/****get subject info by subjectId****/

/****get sections by subjectId****/

/****get section detail by subjectId and section****/

module.exports = router;
