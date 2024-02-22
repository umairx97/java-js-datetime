const { LocalDate, DateTimeFormatter } = require("@js-joda/core");

const formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
const date = LocalDate.parse("20181021", formatter);

console.log(date.toString());