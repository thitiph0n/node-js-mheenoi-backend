const express = require("express");
const router = express.Router();

const pool = require("../helpers/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  //get user and password from body
  const userId = req.body.userId;
  const rawPassword = req.body.password;
  let queryResult = null;
  try {
    //check user with database
    if (userId[0] === "1") {
      queryResult = await pool.query(
        `SELECT studentId, password, firstName FROM student WHERE studentId = ?`,
        userId
      );
    } else if (userId[0] === "2" || userId[0] === "3") {
      queryResult = await pool.query(
        `SELECT employeeId, password, firstName, position FROM employee WHERE employeeId = ?`,
        userId
      );
    } else {
      res.status(400).json({ message: "Validation failure" });
    }
    //check password
    if (await bcrypt.compare(rawPassword, queryResult[0].password)) {
      //generate jwt
      const payload = {
        sub: req.body.userId,
        type: req.body.userId[0],
        role: req.body.userId[0],
        iat: Date.now(),
      };
      const webToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30min",
      });
      res.json({ jwt: webToken, type: req.body.userId[0] });
    } else {
      if (rawPassword === queryResult[0].password) {
        res.status(426).json({
          error: { message: "Using not secure password", errorCode: 200 },
        });
      } else {
        console.log(error);
        res.status(400).json({
          error: { message: "Wrong userId or password", errorCode: 100 },
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: { message: "Wrong userId or password", errorCode: 100 },
    });
  }
});

module.exports = router;
