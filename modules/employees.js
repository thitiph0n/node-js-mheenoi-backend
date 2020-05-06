const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const hasRole = require("../helpers/hasRole");
const generateId = require("../tools/generateId");

router.use(authorization);

//get all employees list
router.get("/", hasRole([3]), async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM employee_info");
    res.json({ payload: queryResult });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

router.get("/dashboard", hasRole([2, 3]), async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM employee_info WHERE employeeId=?",
      req.authData.sub
    );
    res.json({
      payload: queryResult,
    });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

//register employee
router.post("/", hasRole([3]), async (req, res) => {
  const payload = req.body.payload;
  try {
    //generate Id
    const employeeId = await generateId({
      role: 2,
      position: payload.position,
      departmentId: payload.departmentId,
    });
    console.log(employeeId);
    //set default password
    const defaultPassword = payload.dob.toString();
    //insert to database
    const sql =
      "INSERT INTO employee(employeeId, idCardNumber, title, firstName, lastName,\
      departmentId, dob, gender, bloodType, email, phoneNo, address, position, \
      picturePath, password) VALUE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    await pool.query(sql, [
      employeeId,
      payload.idCardNumber,
      payload.title,
      payload.firstName,
      payload.lastName,
      payload.departmentId,
      payload.dob,
      payload.gender,
      payload.bloodType,
      payload.email,
      payload.phoneNo,
      payload.address,
      payload.position,
      `/profile/${payload.position.toLowerCase()}.png`,
      defaultPassword,
    ]);
    res.status(201).json({ message: "register successful" });
  } catch (error) {
    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

//get employee information by employeeId
router.get("/:employeeId/info", async (req, res) => {
  try {
    const queryResult = await pool.query(
      "SELECT * FROM employee_info WHERE employeeId=?",
      req.params.employeeId
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

//update employee information by employeeId
router.put("/:employeeId/info", hasRole([2, 3]), async (req, res) => {
  const payload = req.body.payload;
  try {
    //update to database
    const sql =
      " UPDATE employee SET title=?, gender=?, firstName=?,\
      lastName=?, idCardNumber=? , email=?, dob=?, phoneNo = ?, bloodType=?,\
      address=?\
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
    console.log(error);

    res.status(500).json({
      error: { message: error.sqlMessage || error, code: error.code },
    });
  }
});

module.exports = router;
