import db from "../models";
import bcrypt from "bcryptjs";
import { v4 } from "uuid";
import canhochungcu from "../../data/canho_chungcu.json";
import canhomini from "../../data/canho_mini.json";
import nhanguyencan from "../../data/nha_nguyen_can.json";
import phongtro from "../../data/phongtro.json";
import generateCode from "../ultis/generateCode";
import { dataPrice, dataArea } from "../ultis/data";
import { getNumberFromString, getNumberFromStringV2 } from "../ultis/common";
require("dotenv").config();

const dataBody = [
  { body: phongtro, code: "PTRO" },
  { body: nhanguyencan, code: "NNN" },
  { body: canhochungcu, code: "CHCC" },
  { body: canhomini, code: "CHMINI" },
];

const hashPassword = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(12));

export const insertService = () =>
  new Promise(async (resolve, reject) => {
    try {
      // =================================================================
      // BƯỚC 0: ĐỒNG BỘ DỮ LIỆU MẶC ĐỊNH CHO BẢNG PRICE VÀ AREA TRƯỚC
      // =================================================================
      for (let [index, item] of dataPrice.entries()) {
        await db.Price.findOrCreate({
          where: { code: item.code },
          defaults: {
            code: item.code,
            value: item.value,
            order: index + 1,
          },
        });
      }
      for (let [index, item] of dataArea.entries()) {
        await db.Area.findOrCreate({
          where: { code: item.code },
          defaults: {
            code: item.code,
            value: item.value,
            order: index + 1,
          },
        });
      }

      // =================================================================
      // BƯỚC 1: GOM VÀ KHỞI TẠO TRƯỚC LABEL & PROVINCE TỪ DATA JSON
      // =================================================================
      const labelCodesSet = new Set();
      const provinceCodesSet = new Set();

      const labelsToInsert = [];
      const provincesToInsert = [];

      for (let cate of dataBody) {
        const postsList = cate.body?.details || [];
        for (let item of postsList) {
          // Xử lý Label chuỗi an toàn
          let rawLabel = item?.header?.label?.content || "TIN THƯỜNG";
          let labelCode = generateCode(rawLabel).trim();
          if (!labelCodesSet.has(labelCode)) {
            labelCodesSet.add(labelCode);
            labelsToInsert.push({ code: labelCode, value: rawLabel });
          }

          // Xử lý Province chuỗi an toàn
          const overviewContent = item?.header?.overview?.content;
          let provinceString = "Chưa xác định";
          if (Array.isArray(overviewContent)) {
            let provinceObj = overviewContent.find(
              (i) => i.name === "Tỉnh thành:",
            );
            if (provinceObj && provinceObj.content) {
              provinceString = provinceObj.content;
            }
          }
          let provinceCode = generateCode(provinceString).trim();
          if (!provinceCodesSet.has(provinceCode)) {
            provinceCodesSet.add(provinceCode);
            provincesToInsert.push({
              code: provinceCode,
              value: provinceString,
            });
          }
        }
      }

      // Khởi tạo các bảng danh mục cha để loại bỏ hoàn toàn Foreign Key Error
      await db.Label.bulkCreate(labelsToInsert, { ignoreDuplicates: true });
      await db.Province.bulkCreate(provincesToInsert, {
        ignoreDuplicates: true,
      });

      // =================================================================
      // BƯỚC 2: DUYỆT VÀ CHÈN TOÀN BỘ BÀI ĐĂNG (POSTS)
      // =================================================================
      for (let cate of dataBody) {
        const postsList = cate.body?.details || [];

        for (let item of postsList) {
          let PostId = v4();
          let attributesId = v4();
          let userId = v4();
          let overviewId = v4();
          let imagesId = v4();

          let rawLabel = item?.header?.label?.content || "TIN THƯỜNG";
          let labelCode = generateCode(rawLabel).trim();

          const overviewContent = item?.header?.overview?.content;
          let provinceString = "Chưa xác định";
          if (Array.isArray(overviewContent)) {
            let provinceObj = overviewContent.find(
              (i) => i.name === "Tỉnh thành:",
            );
            if (provinceObj && provinceObj.content) {
              provinceString = provinceObj.content;
            }
          }
          let provinceCode = generateCode(provinceString).trim();

          let desc = JSON.stringify(item?.mainContent?.content || "");
          let currentArea = getNumberFromString(
            item?.header?.attributes?.acreage,
          );
          let currentPrice = getNumberFromString(
            item?.header?.attributes?.price,
          );

          // Định biên khoảng giá/diện tích chuẩn mã Code tương ứng
          let areaCodeFound = dataArea.find(
            (area) => area.max > currentArea && area.min <= currentArea,
          )?.code;
          let priceCodeFound = dataPrice.find(
            (price) => price.max > currentPrice && price.min <= currentPrice,
          )?.code;

          // 1. Tạo bảng liên kết Attributes (Tiện ích) trước
          let attributeData = {
            id: attributesId,
            price: item?.header?.attributes?.price || "",
            published: item?.header?.attributes?.published || "",
            acreage: item?.header?.attributes?.acreage || "",
            hasFurniture: false,
            hasMezzanine: false,
            hasKitchen: false,
            hasAirConditioner: false,
            hasWashingMachine: false,
            hasFridge: false,
            hasElevator: false,
            isNoOwner: false,
            isFreeTime: false,
            hasSecurity: false,
            hasParking: false,
          };

          const featuredList = item?.featured?.content || [];
          if (Array.isArray(featuredList)) {
            featuredList.forEach((featItem) => {
              const name = featItem?.name || "";
              const isAvailable = featItem?.available === true;
              if (name.includes("nội thất"))
                attributeData.hasFurniture = isAvailable;
              if (name.includes("gác"))
                attributeData.hasMezzanine = isAvailable;
              if (name.includes("bếp")) attributeData.hasKitchen = isAvailable;
              if (name.includes("máy lạnh") || name.includes("Điều hòa"))
                attributeData.hasAirConditioner = isAvailable;
              if (name.includes("máy giặt"))
                attributeData.hasWashingMachine = isAvailable;
              if (name.includes("tủ lạnh"))
                attributeData.hasFridge = isAvailable;
              if (name.includes("thang máy"))
                attributeData.hasElevator = isAvailable;
              if (name.includes("Không chung chủ"))
                attributeData.isNoOwner = isAvailable;
              if (name.includes("Tự do") || name.includes("giờ giấc tự do"))
                attributeData.isFreeTime = isAvailable;
              if (name.includes("bảo vệ") || name.includes("An ninh"))
                attributeData.hasSecurity = isAvailable;
              if (name.includes("bãi đỗ xe") || name.includes("để xe"))
                attributeData.hasParking = isAvailable;
            });
          }
          await db.Attribute.create(attributeData);

          // 2. Tạo bảng Images trước
          await db.Image.create({
            id: imagesId,
            image: JSON.stringify(item?.images || []),
          });

          // 3. Tạo bảng Overviews trước
          await db.Overview.create({
            id: overviewId,
            district:
              item?.header?.overview?.content?.find(
                (i) => i.name === "Quận huyện:",
              )?.content || "",
            city: provinceString,
            address:
              item?.header?.overview?.content?.find(
                (i) => i.name === "Địa chỉ:",
              )?.content || "",
            type:
              item?.header?.overview?.content?.find((i) => i.name === "Mã tin:")
                ?.content || "",
            created:
              item?.header?.overview?.content?.find(
                (i) => i.name === "Ngày đăng:",
              )?.content || "",
            expire:
              item?.header?.overview?.content?.find(
                (i) => i.name === "Ngày hết hạn:",
              )?.content || "",
          });

          // 4. Tạo bảng Users trước
          await db.User.create({
            id: userId,
            name:
              item?.contact?.content?.find((i) => i.name === "Liên hệ:")
                ?.content || "Ẩn danh",
            password: hashPassword("123456"),
            phone:
              item?.contact?.content?.find((i) => i.name === "Điện thoại:")
                ?.content || "",
            zalo: (() => {
              const zaloUrl = item?.contact?.content?.find(
                (i) => i.name === "Zalo:",
              )?.content;
              if (!zaloUrl) return "";
              const match = zaloUrl.match(/\d+$/);
              return match ? match[0] : "";
            })(),
          });

          // 5. CUỐI CÙNG: Tạo thực thể Post chính thức kết nối các bảng
          await db.Post.create({
            id: PostId,
            title: item?.header?.title || "",
            star: item?.header?.star || "0",
            labelCode: labelCode,
            attributesId,
            categoryCode: cate.code,
            description: desc,
            userId,
            overviewId,
            imagesId,
            areaCode: areaCodeFound || null,
            priceCode: priceCodeFound || null,
            provinceCode: provinceCode,
            priceNumber: getNumberFromStringV2(item?.header?.attributes?.price),
            areaNumber: getNumberFromStringV2(
              item?.header?.attributes?.acreage,
            ),
          });
        }
      }

      resolve("OK.");
    } catch (error) {
      reject(error);
    }
  });
