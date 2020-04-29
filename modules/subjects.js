const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const globalConst = require("../helpers/constants");
const hasRole = require("../helpers/hasRole");

/****add new subject****/
//insert subject
//insert section
//insert section_lecturer
//insert section_time

/****list all subjects****/

/****list subjects by employeeId(lecturer)****/

/****get subject info by subjectId****/

/****get sections by subjectId****/

/****get section detail by subjectId and section****/

module.exports = router;
