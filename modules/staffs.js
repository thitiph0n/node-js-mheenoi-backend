const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const hasRole = require("../helpers/hasRole");
const globalConst = require("../helpers/constants");

//authorize before access
router.use(authorization);

//list all staffs
router.get("/", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM employee_info WHERE position = Staff"
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

module.exports = router;