const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const globalConst = require("../helpers/constants");
const hasRole = require("../helpers/hasRole");

//authorize before access
router.use(authorization);

/**create enrollmentId**/
router.post("/create", hasRole([1]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "INSERT INTO enrollment(studentId,year,semester)\
      SELECT * FROM (SELECT ? AS studentId, ? AS year, ? AS semester) AS tmp\
      WHERE NOT EXISTS(\
      SELECT studentId,year,semester FROM enrollment WHERE studentId = ? AND year=? AND semester=?) LIMIT 1;",
      [
        req.authData.sub,
        globalConst.enrollYear,
        globalConst.enrollSemester,
        req.authData.sub,
        globalConst.enrollYear,
        globalConst.enrollSemester,
      ]
    );
    res.status(201).json({
      requestedTime: Date.now(),
      requestedBy: req.authData.sub,
      payload: {
        result: queryResult,
        message:
          queryResult.affectedRows === 1
            ? "create enrollmentId success"
            : "You have already enroll this semester",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/**confirm that enrollment**/
router.post("/confirm", hasRole([1]), async (req, res) => {
  try {
    res.json({ message: "Enrollment" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/**search subject to enroll**/
router.get("/subjects/:subjectId", hasRole([1]), async (req, res) => {
  try {
    res.json({ message: "Enrollment" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/**get subject you enroll by enrollmentId**/
router.get("/:enrollmentId", hasRole([1]), async (req, res) => {
  try {
    res.json({ message: "Enrollment" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/**delete subject you enroll by subjectId and sectionId**/
router.get(
  "/:enrollmentId/:subjectId/:sectionId/delete",
  hasRole([1]),
  async (req, res) => {
    try {
      res.json({ message: "Enrollment" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: { message: error.sqlMessage || error, code: error.code },
      });
    }
  }
);

/**reserve the seat**/
router.post(
  "/:enrollmentId/:subjectId/:sectionId",
  hasRole([1]),
  async (req, res) => {
    try {
      res.json({ message: "Enrollment" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: { message: error.sqlMessage || error, code: error.code },
      });
    }
  }
);

/**get enrollment of this student**/
router.get("/", hasRole([1]), async (req, res) => {
  try {
    res.json({ message: "Enrollment" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

module.exports = router;
