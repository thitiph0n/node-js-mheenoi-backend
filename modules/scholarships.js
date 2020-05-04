const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const hasRole = require("../helpers/hasRole");
const globalConst = require("../helpers/constants");

//authorize before access
router.use(authorization);

//list all scholarships
router.get("/", async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM scholarship_list");
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

//add scholarship
router.post("/", hasRole([3]), async (req, res) => {
  const payload = req.body.payload;
  try {
    const queryResult = await pool.query(
      "INSERT INTO scholarship_list(scholarshipName,donator,details) VALUE(?,?,?)",
      [payload.scholarshipName, payload.donator, payload.details]
    );
    res.status(201).json({
      status: "add successful",
      payload: queryResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
    console.error(error);
  }
});

//list all requests
router.get("/requests", hasRole([3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM scholarship_request_info"
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

//request a scholarship
router.post("/requests", hasRole([1]), async (req, res) => {
  const payload = req.body.payload;
  try {
    const queryResult = await pool.query(
      "INSERT INTO scholarship_request \
        (studentId,scholarshipId,reasonOfRequest,yearOfRequest)\
        VALUE(?,?,?,?)",
      [
        payload.studentId,
        payload.scholarshipId,
        payload.reasonOfRequest,
        globalConst.academicYear,
      ]
    );
    let values = "";
    //loop all activities in array
    const activities = payload.activities;
    for (activity in activities) {
      values += `("${payload.studentId}",${payload.scholarshipId},${activities[activity].index},"${activities[activity].name}","${activities[activity].type}"),`;
    }
    values = values.slice(0, values.length - 1);
    const queryResult2 = await pool.query(
      `INSERT INTO scholarship_request_activity\
        (studentId,scholarshipId,no,activityName,activityType)\
        VALUE ${values}`
    );
    res.status(201).json({
      status: "request successful",
      payload: [queryResult, queryResult2],
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.sqlMessage || "unknown error",
        code: error.code,
      },
    });
  }
});

//update status of scholarship request
router.put("/requests/status", hasRole([3]), async (req, res) => {
  const payload = req.body.payload;
  try {
    const queryResult = await pool.query(
      "UPDATE scholarship_request SET status = ?\
      WHERE studentId=? and scholarshipId=?",
      [payload.status, payload.studentId, payload.scholarshipId]
    );
    res.status(201).json({
      status: "update successful",
      payload: queryResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

//get scholarship info by id
router.get("/:scholarshipId", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM scholarship_list\
        WHERE scholarshipId=?",
      req.params.scholarshipId
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

//DANGER ZONE !!
//delete scholarship
router.delete("/:scholarshipId", hasRole([3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "DELETE FROM scholarship_list\
      WHERE scholarshipId=?",
      [parseInt(req.params.scholarshipId)]
    );
    res.status(201).json({
      status: `Delete scholarshipId:${req.params.scholarshipId} successful`,
      payload: queryResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

router.get("/:scholarshipId/delete", hasRole([3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "DELETE FROM scholarship_list\
      WHERE scholarshipId=?",
      [parseInt(req.params.scholarshipId)]
    );
    res.status(201).json({
      status: `Delete scholarshipId:${req.params.scholarshipId} successful`,
      payload: queryResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

module.exports = router;
