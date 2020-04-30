const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const bcrypt = require("bcrypt");

//set password
router.put("/", async (req, res) => {
  const payload = req.body.payload;
  const table = payload.userId[0] === "1" ? "student" : "employee";
  const col = payload.userId[0] === "1" ? "studentId" : "employeeId";
  try {
    //check old password
    const queryResult = await pool.query(
      `SELECT password FROM ${table}\
          WHERE ${col}=? `,
      [payload.userId]
    );
    if (queryResult[0].password === payload.oldPassword) {
      //hash new password
      const hashedPassword = await bcrypt.hash(payload.newPassword, 10);
      //update to database
      const queryResult = await pool.query(
        `UPDATE ${table} SET password = ?\
        WHERE ${col}=?`,
        [hashedPassword, payload.userId]
      );
      res.status(201).json({
        status: "Set password successful",
        payload: queryResult,
      });
    } else {
      res
        .status(400)
        .json({ error: { message: "Wrong old password", code: 400 } });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        error: { message: error.sqlMessage || error, code: error.code },
      });
  }
});

module.exports = router;
