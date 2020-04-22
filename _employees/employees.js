const express = require("express");
const router = express.Router();

const authorization = require("../helpers/authorization");

router.use(authorization);

//get all employees list
router.get("/", (req, res) => {
  res.json({ message: "this is employees list" });
});
//register employee
router.post("/", (req, res) => {});
//get employee information by employeeId
router.get("/:employeeId", (req, res) => {});
//update employee information by employeeId
router.put("/:employeeId", (req, res) => {});

module.exports = router;
