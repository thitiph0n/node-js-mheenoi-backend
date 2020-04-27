const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const hasRole = require("../helpers/hasRole");
const globalConst = require("../helpers/constants");

router.use(authorization);

//get all employees list
router.get("/", hasRole([3]), (req, res) => {
  res.json({ message: "this is employees list", authData: req.authData });
});

module.exports = router;
