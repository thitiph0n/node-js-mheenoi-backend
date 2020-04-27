const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const hasRole = require("../helpers/hasRole");

router.use(authorization);

//get all employees list
router.get("/", hasRole([3]), async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM employee");
    res.json({ payload: queryResult });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
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
    //set default password
    const defaultPassword = payload.dob.toString();
    //insert to database
    const sql =
      "INSERT INTO student(employeeId, idCardNumber, title, firstName, lastName,\
      departmentId, dob, gender, bloodType, email, phoneNo, address, position, \
      picturePath, password) VALUE()";
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
      `/profile/${payload.position.toLowerCase()}.jpg`,
      defaultPassword,
    ]);
    res.status(201).json({ message: "register successful" });
  } catch (error) {
    res
      .status(500)
      .json({ error: { message: error.sqlMessage, code: error.code } });
  }
});

module.exports = router;
