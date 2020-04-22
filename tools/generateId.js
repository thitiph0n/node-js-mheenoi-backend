const pool = require("../helpers/database");

async function generateId(type, info) {
  const id = "";
  const academicYears = new Date().getFullYear().toString().slice(1);
  try {
    //update runningNumber
    await pool.query(
      "UPDATE department SET runningNumber=?",
      runningNumber[0].runningNumber + 1
    );
    //query running number
    const runningNumber = await pool.query(
      "SELECT runningNumber FROM department WHERE departmentId = ?",
      info.departmentId
    );
    //generate id
    id.concat(
      type.toString(),
      type === 1 ? academicYears : "00",
      info.departmentId,
      info.program === "Thai" ? "1" : "2",
      runningNumber[0].runningNumber.toString()
    );
    return id;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

module.exports = generateId;
