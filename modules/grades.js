const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const globalConst = require("../helpers/constants");
const hasRole = require("../helpers/hasRole");

//authorize before access
router.use(authorization);

//get grade by subject and section
router.get("/", hasRole([2]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT e.studentId, ed.subjectId, ed.sectionId, ed.grade FROM enrollment e\
    LEFT JOIN enrollmentdetail ed ON e.enrollmentId = ed.enrollmentId"
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
    //update to database
    const sql =
      " UPDATE employee SET title=?, gender=?, firstName=?, \
        lastName=?, idCardNumber=? , email=?, dob=?, phoneNo = ?, bloodType=?,\
        address=?,\
        WHERE employeeId = ?";
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
      req.params.employeeId,
    ]);
    res.status(201).json({ message: "Update successful" });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

module.exports = router;
