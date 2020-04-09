const util = require("util");
const mysql = require("mysql");
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "us-cdbr-iron-east-01.cleardb.net",
  user: "b1068afa3d8259",
  password: "abd3ac02",
  database: "heroku_f4d53bdd9351c62",
});

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
  }

  if (connection) connection.release();

  return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;
