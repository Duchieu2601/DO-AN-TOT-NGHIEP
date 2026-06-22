export const checkStatus = (expireString) => {
  if (!expireString) return "Đang hoạt động";

  const dateParts = expireString.split(" ");
  const dateOnly = dateParts[dateParts.length - 1];

  const [day, month, year] = dateOnly.split("/").map(Number);
  const expireDateTimestamp = new Date(year, month - 1, day).getTime();
  const todayTimestamp = new Date().getTime();

  return todayTimestamp <= expireDateTimestamp
    ? " đang hoạt động"
    : "Đã hết hạn";
};
