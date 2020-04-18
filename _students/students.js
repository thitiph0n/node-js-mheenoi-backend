const express = require("express");
const router = express.Router();

const authorization = require("../_helper/authorization");

router.use(authorization);

//get all students list
router.get("/", (req, res) => {
  res.json({ message: "this is students list" });
});
//register student
router.post("/", (req, res) => {});
//get student information by studentId
router.get("/:studentId", (req, res) => {});
//update student information by studentId
router.put("/:studentId", (req, res) => {});

module.exports = router;
