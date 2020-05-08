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
    if (queryResult.affectedRows === 1) {
      res.status(201).json({
        requestedTime: Date.now(),
        requestedBy: req.authData.sub,
        payload: {
          result: queryResult,
          enrollmentId: queryResult.insertId,
          message: "create enrollmentId success",
        },
      });
    } else {
      const enrollmentId = await pool.query(
        "SELECT enrollmentId FROM enrollment WHERE studentId = ? AND year=? AND semester=?",
        [req.authData.sub, globalConst.enrollYear, globalConst.enrollSemester]
      );
      res.status(200).json({
        requestedTime: Date.now(),
        requestedBy: req.authData.sub,
        payload: {
          result: queryResult,
          enrollmentId: enrollmentId[0].enrollmentId,
          message: "You have already enroll this semester",
        },
      });
    }
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
    const queryResult = await pool.query(
      "UPDATE enrollment\
      SET status = ?\
      WHERE studentId=? AND year=? AND semester=?",
      [
        "enrolled",
        req.authData.sub,
        globalConst.enrollYear,
        globalConst.enrollSemester,
      ]
    );
    res.status(200).json({
      requestedTime: Date.now(),
      requestedBy: req.authData.sub,
      payload: {
        result: queryResult,
        message: "update enrollment status success(enrolled)",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/**payment completed**/
router.post("/paying", hasRole([1]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "UPDATE enrollment\
      SET status = ?\
      WHERE studentId=? AND year=? AND semester=?",
      [
        "completed",
        req.authData.sub,
        globalConst.enrollYear,
        globalConst.enrollSemester,
      ]
    );
    res.status(200).json({
      requestedTime: Date.now(),
      requestedBy: req.authData.sub,
      payload: {
        result: queryResult,
        message: "update enrollment status success(completed)",
      },
    });
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
    const queryResult = await pool.query(
      "select sub.subjectId,sub.subjectName,sub.credit,sub.description,sec.sectionId,sec.seat,\
      sec.seat - case when e.year = ? and e.semester = ? then count(e.enrollmentId)\
      else 0 end as remainSeat\
      from subject sub\
      join section sec on sec.subjectId = sub.subjectId\
      left join enrollmentdetail ed on ed.subjectId = sec.subjectId and ed.sectionId = sec.sectionId\
      left join enrollment e on e.enrollmentId = ed.enrollmentId\
      group by sub.subjectId,sec.sectionId\
      having sub.subjectId = ?",
      [globalConst.enrollYear, globalConst.enrollSemester, req.params.subjectId]
    );

    res.json({
      requestedTime: Date.now(),
      requestedBy: req.authData.sub,
      payload: {
        result: queryResult,
      },
    });
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
    const queryResult = await pool.query(
      "select ed.enrollmentId,ed.subjectId,ed.sectionId,s.subjectName,s.description,s.credit\
    from enrollmentdetail ed\
    join subject s on s.subjectId = ed.subjectId\
    where ed.enrollmentId = ?",
      [req.params.enrollmentId]
    );
    res.json({
      requestedTime: Date.now(),
      requestedBy: req.authData.sub,
      payload: {
        result: queryResult,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

/**delete subject you enroll by subjectId and sectionId**/
router.get(
  "/:enrollmentId/:subjectId/delete",
  hasRole([1]),
  async (req, res) => {
    try {
      const queryResult = await pool.query(
        "DELETE FROM enrollmentdetail WHERE enrollmentId = ? AND subjectId=?",
        [req.params.enrollmentId, req.params.subjectId]
      );

      res.status(200).json({
        requestedTime: Date.now(),
        requestedBy: req.authData.sub,
        payload: {
          result: queryResult,
          message: "delete success",
        },
      });
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
      const queryResult = await pool.query(
        "INSERT INTO enrollmentdetail(enrollmentId,subjectId,sectionId)\
        SELECT * FROM (SELECT ? AS enrollmentId, ? AS subjectId, ? AS sectionId) AS tmp\
        WHERE NOT EXISTS(\
        SELECT enrollmentId,subjectId,sectionId FROM enrollmentdetail WHERE enrollmentId = ? AND subjectId=?) LIMIT 1;",
        [
          req.params.enrollmentId,
          req.params.subjectId,
          req.params.sectionId,
          req.params.enrollmentId,
          req.params.subjectId,
          req.params.sectionId,
        ]
      );
      if (queryResult.affectedRows === 1) {
        res.status(201).json({
          requestedTime: Date.now(),
          requestedBy: req.authData.sub,
          payload: {
            result: queryResult,
            enrollmentId: queryResult.insertId,
            message: "enroll success",
          },
        });
      } else {
        res.status(205).json({
          requestedTime: Date.now(),
          requestedBy: req.authData.sub,
          payload: {
            result: queryResult,
            message: "You have already enroll this subject",
          },
        });
      }
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
    const queryResult = await pool.query(
      'select e.enrollmentId, e.studentId, e.year, e.semester, e.status, ed.subjectId, ed.sectionId,s.subjectName,\
      s.description, s.credit,  CONCAT(em.firstName," ",em.lastName)AS lecturerFullname\
      from enrollment e\
      left join enrollmentdetail ed on ed.enrollmentId = e.enrollmentId\
      join subject s on s.subjectId = ed.subjectId\
      join section_lecturer sl on ed.subjectId = sl.subjectId and ed.sectionId = sl.sectionId\
      join employee em on em.employeeId = sl.lecturerId\
      WHERE e.studentId =? AND e.year=? AND e.semester=?',
      [req.authData.sub, globalConst.enrollYear, globalConst.enrollSemester]
    );

    res.json({
      requestedTime: Date.now(),
      requestedBy: req.authData.sub,
      payload: {
        result: queryResult,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

module.exports = router;
