export const getNumberFromString = (string) => {
  let number = 0;
  if (!string || typeof string !== "string") return number;

  if (string.search("đồng/tháng") !== -1) {
    const match = string.match(/\d+/);
    number = match ? +match[0] / Math.pow(10, 3) : 0;
  } else if (string.search("triệu/tháng") !== -1) {
    const match = string.match(/\d+(\.\d+)?/);
    number = match ? +match[0] : 0;
  } else if (string.search("m") !== -1) {
    const match = string.match(/\d+/);
    number = match ? +match[0] : 0;
  }
  return number;
};

export const getNumberFromStringV2 = (string) => {
  let number = 0;
  if (!string || typeof string !== "string") return number;

  if (string.search("đồng/tháng") !== -1) {
    const match = string.match(/\d+/);
    number = match ? +match[0] / Math.pow(10, 3) : 0;
  } else if (string.search("triệu/tháng") !== -1) {
    number = +string.split(" ")[0] || 0;
  } else if (string.search("m") !== -1) {
    const match = string.match(/\d+/);
    number = match ? +match[0] : 0;
  }
  return +number;
};
