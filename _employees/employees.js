const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");

router.use(authorization);

//get all employees list
router.get("/", (req, res) => {
  res.json({ message: "this is employees list", authData: req.authData });
});

router.get("/dashboard", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM employee WHERE employeeId=?",
      req.authData.sub
    );
    res.json({ payload: queryResult });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.code });
  }
});
//register employee
router.post("/", (req, res) => {});
//get employee information by employeeId
router.get("/:employeeId", (req, res) => {});
//update employee information by employeeId
router.put("/:employeeId", (req, res) => {});

module.exports = router;
