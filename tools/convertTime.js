function convertToDateTime(weekday, time) {
  let dateTime = "2020-11-";
  switch (weekday.toLowerCase()) {
    case "sunday":
      dateTime += "01";
      break;
    case "monday":
      dateTime += "02";
      break;
    case "tuesday":
      dateTime += "03";
      break;
    case "wednesday":
      dateTime += "04";
      break;
    case "thursday":
      dateTime += "05";
      break;
    case "friday":
      dateTime += "06";
      break;
    case "saturday":
      dateTime += "07";
      break;
    default:
      dateTime = null;
      break;
  }
  if (dateTime !== null) {
    dateTime += " ";
    dateTime += time;
  }
  return dateTime;
}

module.exports = convertToDateTime;
