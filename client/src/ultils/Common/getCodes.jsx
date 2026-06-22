import { getNumbersArea, getNumbersPrice } from "./getNumbers";

const buildPriceItem = (item) => {
  const nums = getNumbersPrice(item.value);
  const isDuoi = item.value.toLowerCase().includes("dưới");
  const isTren = item.value.toLowerCase().includes("trên");
  if (isDuoi) return { ...item, min: 0, max: nums[0] };
  if (isTren) return { ...item, min: nums[0], max: 9999999 };
  return { ...item, min: Math.min(...nums), max: Math.max(...nums) };
};

const buildAreaItem = (item) => {
  const nums = getNumbersArea(item.value);
  const isDuoi = item.value.toLowerCase().includes("dưới");
  const isTren = item.value.toLowerCase().includes("trên");
  if (isDuoi) return { ...item, min: 0, max: nums[0] };
  if (isTren) return { ...item, min: nums[0], max: 9999999 };
  return { ...item, min: Math.min(...nums), max: Math.max(...nums) };
};

export const getCodePrice = (totals) => totals?.map(buildPriceItem);
export const getCodeArea = (totals) => totals?.map(buildAreaItem);

const filterByRange = (built, arrMinMax) => {
  if (!Array.isArray(arrMinMax) || !built) return [];
  const uMin = Math.min(...arrMinMax);
  const uMax = Math.max(...arrMinMax);
  return built.filter((item) => {
    if (item.max === 9999999) {
      // "Trên X": match khi khoảng user chạm tới min của item
      return uMax >= item.min;
    }
    if (item.min === 0) {
      // "Dưới X": match khi khoảng user bắt đầu dưới max của item
      return uMin < item.max;
    }
    // Khoảng thường: hai đoạn giao nhau
    return item.max > uMin && item.min < uMax;
  });
};

export const getCodes = (arrMinMax, prices) =>
  filterByRange(getCodePrice(prices), arrMinMax);
export const getCodesArea = (arrMinMax, areas) =>
  filterByRange(getCodeArea(areas), arrMinMax);
