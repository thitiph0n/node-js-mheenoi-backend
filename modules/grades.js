const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const globalConst = require("../helpers/constants");
const hasRole = require("../helpers/hasRole");

//authorize before access
router.use(authorization);

//get grade by subject

//get grade by student

//get grade by subject and section

//get gpa of students in department

//edit grade

module.exports = router;
