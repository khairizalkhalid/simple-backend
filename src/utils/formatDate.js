const formatDateTimeToDB = (date) => {
  const pad = (num) => String(num).padStart(2, "0");
  const padMilliseconds = (num) => String(num).padStart(3, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}.${padMilliseconds(date.getMilliseconds())}`;
};

const formatDateTimeFromDB = (dateStr) => {
  if (!dateStr) {
    return null;
  }
  const date = new Date(dateStr.replace(" ", "T"));
  const pad = (num) => String(num).padStart(2, "0");

  return `${pad(date.getDate())}-${pad(
    date.getMonth() + 1
  )}-${date.getFullYear()} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`;
};

module.exports = {
  formatDateTimeToDB,
  formatDateTimeFromDB,
};
