const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const hasRole = require("../helpers/hasRole");

//authorize before access
router.use(authorization);

//list all activities
router.get("/", async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM activity");
    res.json({
      requestedTime: Date.now(),
      requestedBy: req.authData.sub,
      payload: queryResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

//request activity
router.post("/", hasRole([1]), async (req, res) => {
  //insert activity
  const payload = req.body.payload;
  let queryResult;
  try {
    queryResult = await pool.query(
      "INSERT INTO activity \
        (name, startTime, endTime, detail, location)\
        VALUE(?,?,?,?,?)",
      [
        payload.name,
        payload.startTime,
        payload.endTime,
        payload.detail,
        payload.location,
      ]
    );
    let values = "";
    //loop all staffs in array
    const staffs = payload.staffs;
    for (staff in staffs) {
      values += `(${queryResult.insertId},"${staffs[staff].studentId}","${staffs[staff].duty}"),`;
    }
    values = values.slice(0, values.length - 1);
    //insert staff
    const queryResult2 = await pool.query(
      `INSERT INTO activity_staff\
        (activityId,studentId,duty)\
        VALUE ${values}`
    );
    res.status(201).json({
      status: "request successful",
      payload: [queryResult, queryResult2],
    });
  } catch (error) {
    if (queryResult) {
      try {
        await pool.query(
          "DELETE FROM activity\
            WHERE activityId=?",
          [queryResult.insertId]
        );
        console.log("Roll back complete");
      } catch (error) {
        console.log(error);
      }
    }
    res.status(500).json({
      error: {
        message: error.sqlMessage || error,
        code: error.code,
      },
    });
  }
});

//get activity by activityId
router.get("/:activityId", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM activity WHERE activityId=?",
      parseInt(req.params.activityId)
    );
    res.json({
      requestedTime: Date.now(),
      requestedBy: req.authData.sub,
      payload: queryResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

//delete activity by activityId
router.delete("/:activityId", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "DELETE FROM activity\
          WHERE activityId=?",
      [parseInt(req.params.activityId)]
    );
    res.status(201).json({
      status: `Delete activityId:${req.params.activityId} successful`,
      payload: queryResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

router.get("/:activityId/delete", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "DELETE FROM activity\
          WHERE activityId=?",
      [parseInt(req.params.activityId)]
    );
    res.status(201).json({
      status: `Delete activityId:${req.params.activityId} successful`,
      payload: queryResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

//get all staffs by activityId
router.get("/:activityId/staffs", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT a.studentId,s.firstName,s.lastName,a.duty FROM activity_staff a\
      LEFT JOIN student s ON s.studentId = a.studentId WHERE activityId=?",
      parseInt(req.params.activityId)
    );
    res.json({
      requestedTime: Date.now(),
      requestedBy: req.authData.sub,
      payload: queryResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

//delete staffs by activityId
router.delete("/:activityId/staffs/:studentId", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "DELETE FROM activity_staff\
              WHERE activityId=? AND studentId=?",
      [parseInt(req.params.activityId), parseInt(req.params.studentId)]
    );
    res.status(201).json({
      status: `Delete activityId:${req.params.activityId} successful`,
      payload: queryResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

router.get("/:activityId/staffs/:studentId/delete", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "DELETE FROM activity_staff\
              WHERE activityId=? AND studentId=?",
      [parseInt(req.params.activityId), parseInt(req.params.studentId)]
    );
    res.status(201).json({
      status: `Delete activityId:${req.params.activityId} successful`,
      payload: queryResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

module.exports = router;
