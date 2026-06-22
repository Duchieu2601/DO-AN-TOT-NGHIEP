export const getNumbersPrice = (string) =>
  string
    .replace(/triệu/gi, "")
    .split(" ")
    .map((item) => +item)
    .filter((item) => !isNaN(item) && item !== 0);

export const getNumbersArea = (string) =>
  string
    .replace(/m\b/gi, "")
    .split(" ")
    .map((item) => +item)
    .filter((item) => !isNaN(item) && item !== 0);
