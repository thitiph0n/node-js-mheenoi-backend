const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");
const authorization = require("../helpers/authorization");
const globalConst = require("../helpers/constants");
const hasRole = require("../helpers/hasRole");

//authorize before access
router.use(authorization);

//list all activities
router.get("/", async (req, res) => {});

//request activity
router.post("/", async (req, res) => {});

//get activity by Id
router.get("/:activityId", async (req, res) => {});

//edit activity by Id
router.put("/:activityId", async (req, res) => {});

//delete activity by Id
router.delete("/:activityId", async (req, res) => {});

//get staffs by Id
router.get("/:activityId/staffs", async (req, res) => {});

//edit staffs by Id
router.put("/:activityId/staffs/:studentId", async (req, res) => {});

//delete staffs by Id
router.delete("/:activityId/staffs/:studentId", async (req, res) => {});

module.exports = router;
