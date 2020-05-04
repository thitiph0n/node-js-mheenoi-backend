const pool = require("../helpers/database");

function zeroFill(number, width) {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join("0") + number;
  }
  return number + ""; // return string
}

async function generateId(info) {
  let id = "";
  switch (info.role) {
    case 1:
      try {
        //role[1]
        id += 1;
        //academicYear[3]
        id += info.academicYear.toString().slice(1);
        //departmentId[3]
        id += zeroFill(info.departmentId, 3);
        //program[1]
        if (info.program === "Thai") id += 1;
        else if (info.program === "Inter") id += 2;
        //running number
        const queryResult = await pool.query(`SELECT count(studentId) as count \
                                            FROM student WHERE studentId like "${id}%"`);
        id += zeroFill(queryResult[0].count + 1, 3);

        return id;
      } catch (error) {
        console.error(error);
        return null;
      }
    case 2:
      try {
        //role[1]
        if (info.position === "Lecturer") {
          id += 2;
        } else {
          id += 3;
        }
        //academicYear[3]
        id += "000";
        //departmentId[3]
        id += zeroFill(info.departmentId, 3);
        //program[1]
        if (info.program === "Thai") id += 1;
        else if (info.program === "Inter") id += 2;
        //running number
        const queryResult = await pool.query(`SELECT count(employeeId) as count \
                                            FROM employee WHERE employeeId like "${id}%"`);
        id += zeroFill(queryResult[0].count + 1, 4);

        return id;
      } catch (error) {
        console.error(error);
        return null;
      }
    default:
      return null;
  }
}

module.exports = generateId;
