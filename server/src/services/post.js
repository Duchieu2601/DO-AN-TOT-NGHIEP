import db from "../models";
import { Op } from "sequelize";
import { v4 as generateId } from "uuid";
import generateCode from "../ultis/generateCode";
import moment from "moment";
import generateDate from "../ultis/generateDate";

export const getPostsService = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.Post.findAll({
        where: { hidden: false },
        raw: true,
        nest: true,
        include: [
          { model: db.Image, as: "images", attributes: ["image"] },
          {
            model: db.Attribute,
            as: "attributes",
            attributes: ["price", "acreage", "published"],
          },
          { model: db.User, as: "user", attributes: ["name", "zalo", "phone"] },
          {
            model: db.Overview,
            as: "overview",
            attributes: [
              "address",
              "city",
              "district",
              "type",
              "created",
              "expire",
              "latitude",
              "longitude",
            ],
          },
        ],
        attributes: ["id", "title", "star", "description"],
      });
      resolve({
        err: response ? 0 : 1,
        msg: response ? "OK" : "Getting posts is failed.",
        response,
      });
    } catch (error) {
      reject(error);
    }
  });
export const getPostsLimitService = (
  page,
  query,
  { priceNumber, areaNumber },
) =>
  new Promise(async (resolve, reject) => {
    try {
      const queries = {};

      const {
        limitPost,
        order: orderRaw,
        "order[]": orderArr,
        id,
        ...rawQuery
      } = query || {};

      const order = orderRaw || orderArr;
      const limit = Math.max(1, parseInt(limitPost || process.env.LIMIT || 10));
      const pageNumber = Math.max(1, parseInt(page || 1));
      const offset = (pageNumber - 1) * limit;
      if (id) queries.id = id;

      const finalPriceCode = rawQuery.priceCode ?? rawQuery["priceCode[]"];
      const finalAreaCode = rawQuery.areaCode ?? rawQuery["areaCode[]"];

      if (finalPriceCode) {
        queries.priceCode = Array.isArray(finalPriceCode)
          ? { [Op.in]: finalPriceCode }
          : finalPriceCode;
      }
      if (finalAreaCode) {
        queries.areaCode = Array.isArray(finalAreaCode)
          ? { [Op.in]: finalAreaCode }
          : finalAreaCode;
      }

      Object.keys(rawQuery).forEach((key) => {
        if (
          key !== "priceCode" &&
          key !== "priceCode[]" &&
          key !== "areaCode" &&
          key !== "areaCode[]"
        ) {
          queries[key] = rawQuery[key];
        }
      });

      const parseRange = (val) => {
        if (!val) return null;

        if (Array.isArray(val) && val.length === 2) return val.map(Number);

        if (typeof val === "string" && val.includes(",")) {
          return val.split(",").map(Number);
        }

        return null;
      };

      const priceRange = parseRange(priceNumber);
      const areaRange = parseRange(areaNumber);

      if (Array.isArray(priceRange) && priceRange.length === 2) {
        queries.priceNumber = {
          [Op.between]: priceRange.map(Number),
        };
      }

      if (Array.isArray(areaRange) && areaRange.length === 2) {
        queries.areaNumber = {
          [Op.between]: areaRange.map(Number),
        };
      }

      const response = await db.Post.findAndCountAll({
        where: { ...queries, hidden: false },
        raw: true,
        nest: true,
        offset: offset,
        limit: limit,
        order: Array.isArray(order) ? [order] : [["createdAt", "ASC"]],
        include: [
          { model: db.Image, as: "images", attributes: ["image"] },
          {
            model: db.Attribute,
            as: "attributes",
            attributes: [
              "price",
              "acreage",
              "published",
              "hasFurniture",
              "hasMezzanine",
              "hasKitchen",
              "hasAirConditioner",
              "hasWashingMachine",
              "hasFridge",
              "hasElevator",
              "isNoOwner",
              "isFreeTime",
              "hasSecurity",
              "hasParking",
            ],
          },
          {
            model: db.User,
            as: "user",
            attributes: ["name", "zalo", "phone", "avatar"],
          },
          {
            model: db.Overview,
            as: "overview",
            attributes: [
              "address",
              "city",
              "district",
              "type",
              "created",
              "expire",
              "latitude",
              "longitude",
            ],
          },
        ],
        attributes: [
          "id",
          "title",
          "star",
          "description",
          "priceNumber",
          "areaNumber",
        ],
      });

      resolve({
        err: response ? 0 : 1,
        msg: response ? "OK" : "Getting posts is failed.",
        response,
      });
    } catch (error) {
      reject(error);
    }
  });

export const getNewPostService = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.Post.findAll({
        where: { hidden: false },
        raw: true,
        nest: true,
        offset: 0,
        order: [["createdAt", "DESC"]],
        limit: +process.env.LIMIT,
        include: [
          { model: db.Image, as: "images", attributes: ["image"] },
          {
            model: db.Attribute,
            as: "attributes",
            attributes: ["price", "acreage", "published"],
          },
        ],
        attributes: ["id", "title", "star", "createdAt"],
      });
      resolve({
        err: response ? 0 : 1,
        msg: response ? "OK" : "Getting posts is failed.",
        response,
      });
    } catch (error) {
      reject(error);
    }
  });

export const getPostByIdService = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.Post.findOne({
        where: { id },
        raw: true,
        nest: true,
        include: [
          { model: db.Image, as: "images", attributes: ["image"] },
          {
            model: db.Attribute,
            as: "attributes",
            attributes: [
              "price",
              "acreage",
              "published",
              "hasFurniture",
              "hasMezzanine",
              "hasKitchen",
              "hasAirConditioner",
              "hasWashingMachine",
              "hasFridge",
              "hasElevator",
              "isNoOwner",
              "isFreeTime",
              "hasSecurity",
              "hasParking",
            ],
          },
          { model: db.User, as: "user", attributes: ["name", "zalo", "phone"] },
          {
            model: db.Overview,
            as: "overview",
            attributes: [
              "address",
              "city",
              "district",
              "type",
              "created",
              "expire",
              "latitude",
              "longitude",
            ],
          },
          { model: db.Category, as: "category", attributes: ["value"] },
          { model: db.Province, as: "province", attributes: ["value"] },
          { model: db.Label, as: "label", attributes: ["value"] },
        ],
        attributes: [
          "id",
          "title",
          "star",
          "description",
          "priceNumber",
          "areaNumber",
          "categoryCode",
          "provinceCode",
        ],
      });
      resolve({
        err: response ? 0 : 1,
        msg: response ? "OK" : "Post not found.",
        response,
      });
    } catch (error) {
      reject(error);
    }
  });

export const createNewPostService = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      const postId = generateId();
      const attributesId = generateId();
      const imagesId = generateId();
      const overviewId = generateId();
      const rawProvince = body?.province || "";
      const cleanProvince = rawProvince.includes("Thành phố")
        ? rawProvince.replace("Thành phố ", "").trim()
        : rawProvince.includes("Tỉnh")
          ? rawProvince.replace("Tỉnh ", "").trim()
          : rawProvince.trim();

      const provinceCode = generateCode(cleanProvince).trim();

      await db.Province.findOrCreate({
        where: {
          [Op.or]: [{ value: cleanProvince }, { code: provinceCode }],
        },
        defaults: {
          code: provinceCode,
          value: cleanProvince,
        },
      });

      // 3. Khởi tạo bảng dữ liệu liên kết Attributes (Tiện ích giá và diện tích)
      // Format chuỗi hiển thị giá tương tự logic gốc: Dưới 1 triệu hiển thị đồng, trên hiển thị triệu
      const validPrice = Number(body?.priceNumber) || 0;

      const formatPriceStr =
        validPrice < 1
          ? `${validPrice * 1000000} đồng/tháng`
          : `${validPrice} triệu/tháng`;

      await db.Attribute.create({
        id: attributesId,
        price: formatPriceStr,
        acreage: `${body.areaNumber} m2`,
        published: moment(new Date()).format("DD/MM/YYYY"),
        // Đặt mặc định false hoặc bổ sung trường check từ client nếu giao diện có chọn tiện ích
        hasFurniture: body.hasFurniture || false,
        hasMezzanine: body.hasMezzanine || false,
        hasKitchen: body.hasKitchen || false,
        hasAirConditioner: body.hasAirConditioner || false,
        hasWashingMachine: body.hasWashingMachine || false,
        hasFridge: body.hasFridge || false,
        hasElevator: body.hasElevator || false,
        isNoOwner: body.isNoOwner || false,
        isFreeTime: body.isFreeTime || false,
        hasSecurity: body.hasSecurity || false,
        hasParking: body.hasParking || false,
      });

      // 4. Khởi tạo bảng dữ liệu Images
      let finalImagesData = [];

      if (Array.isArray(body.images)) {
        finalImagesData = body.images;
      } else if (typeof body.images === "string") {
        try {
          const parsed = JSON.parse(body.images);
          finalImagesData = Array.isArray(parsed) ? parsed : [];
        } catch {
          finalImagesData = [];
        }
      }

      finalImagesData = finalImagesData
        .filter(Boolean)
        .map((img) => ({
          type: img.type || "image",
          src: img.src || img.image || "",
        }))
        .filter((img) => img.src);

      await db.Image.create({
        id: imagesId,
        image: JSON.stringify(finalImagesData),
      });

      // // 5. Khởi tạo bảng dữ liệu Overviews (Thông tin tổng quan bài đăng)
      const currentDate = generateDate();
      const hashtag = Math.floor(100000 + Math.random() * 900000);

      await db.Overview.create({
        id: overviewId,
        district: body.district || "",
        city: cleanProvince || "",
        address: body.address || "",

        latitude: body.latitude || null,
        longitude: body.longitude || null,

        type: `#${hashtag}`,
        created: currentDate.today,
        expire: currentDate.expireDay,
      });

      // 6. CUỐI CÙNG: Tạo bản ghi chính thức bảng Post kết nối toàn bộ dữ liệu lại với nhau
      await db.Post.create({
        id: postId,
        title: body.title,
        star: "0", // Mặc định bài đăng mới khởi tạo có số sao bằng 0
        //labelCode: labelCode,
        attributesId,
        categoryCode: body.categoryCode,
        description: JSON.stringify(body.description || ""),
        userId: body.userId,
        overviewId,
        imagesId,
        areaCode: body.areaCode || null,
        priceCode: body.priceCode || null,
        provinceCode: provinceCode,
        priceNumber: Number(body.priceNumber),
        areaNumber: Number(body.areaNumber),
      });

      resolve({
        err: 0,
        msg: "Tạo bài đăng mới hoàn tất thành công!",
      });
    } catch (error) {
      reject(error);
    }
  });

export const getPostsLimitAdminService = (page, id, query) =>
  new Promise(async (resolve, reject) => {
    try {
      const limit = Math.max(1, parseInt(process.env.LIMIT || 10));
      const pageNumber = Math.max(1, parseInt(page || 1));
      const offset = (pageNumber - 1) * limit;
      const queries = { ...query, userId: id };
      const response = await db.Post.findAndCountAll({
        where: queries,
        raw: true,
        nest: true,
        offset,
        limit,
        order: [["createdAt", "DESC"]],
        include: [
          { model: db.Image, as: "images", attributes: ["image"] },
          {
            model: db.Attribute,
            as: "attributes",
            attributes: [
              "price",
              "acreage",
              "published",
              "hasFurniture",
              "hasMezzanine",
              "hasKitchen",
              "hasAirConditioner",
              "hasWashingMachine",
              "hasFridge",
              "hasElevator",
              "isNoOwner",
              "isFreeTime",
              "hasSecurity",
              "hasParking",
            ],
          },
          { model: db.User, as: "user", attributes: ["name", "zalo", "phone"] },
          {
            model: db.Overview,
            as: "overview",
            attributes: [
              "address",
              "city",
              "district",
              "type",
              "created",
              "expire",
              "latitude",
              "longitude",
            ],
          },
        ],
      });
      resolve({
        err: response ? 0 : 1,
        msg: response ? "OK" : "Getting posts is failed.",
        response,
      });
    } catch (error) {
      reject(error);
    }
  });

export const updatePostService = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      const {
        postId,
        imagesId,
        userId,
        // Các trường cập nhật
        title,
        description,
        categoryCode,
        priceCode,
        areaCode,
        priceNumber,
        areaNumber,
        address,
        province,
        district,
        images,
        // Amenities
        hasFurniture,
        hasMezzanine,
        hasKitchen,
        hasAirConditioner,
        hasWashingMachine,
        hasFridge,
        hasElevator,
        isNoOwner,
        isFreeTime,
        hasSecurity,
        hasParking,
      } = body;

      // 1. Tìm Post để lấy attributesId và overviewId
      const post = await db.Post.findOne({
        where: { id: postId, userId }, // Đảm bảo chỉ owner mới sửa được
        raw: true,
      });

      if (!post) {
        return resolve({
          err: 1,
          msg: "Không tìm thấy bài đăng hoặc bạn không có quyền sửa.",
        });
      }

      // 2. Cập nhật bảng Attribute (amenities + giá + diện tích hiển thị)
      const formatPriceStr =
        priceNumber < 1
          ? `${priceNumber * 1_000_000} đồng/tháng`
          : `${priceNumber} triệu/tháng`;

      await db.Attribute.update(
        {
          price: formatPriceStr,
          acreage: `${areaNumber} m2`,
          hasFurniture: !!hasFurniture,
          hasMezzanine: !!hasMezzanine,
          hasKitchen: !!hasKitchen,
          hasAirConditioner: !!hasAirConditioner,
          hasWashingMachine: !!hasWashingMachine,
          hasFridge: !!hasFridge,
          hasElevator: !!hasElevator,
          isNoOwner: !!isNoOwner,
          isFreeTime: !!isFreeTime,
          hasSecurity: !!hasSecurity,
          hasParking: !!hasParking,
        },
        { where: { id: post.attributesId } },
      );

      // 3. Cập nhật bảng Image
      let finalImages = [];

      try {
        const raw = images;

        if (Array.isArray(raw)) {
          finalImages = raw;
        } else if (typeof raw === "string") {
          try {
            finalImages = JSON.parse(raw);
          } catch {
            finalImages = [];
          }
        }

        finalImages = finalImages
          .map((img) => ({
            type: img?.type || "image",
            src: img?.src || img?.image || "",
          }))
          .filter((img) => img.src);
      } catch {
        finalImages = [];
      }

      await db.Image.update(
        { image: JSON.stringify(finalImages) },
        { where: { id: post.imagesId } },
      );

      // 4. Cập nhật bảng Overview (địa chỉ)
      const overviewData = await db.Overview.findOne({
        where: { id: post.overviewId },
        raw: true,
      });

      await db.Overview.update(
        {
          address: address || "",
          city: province || overviewData?.city || "",
          district: district || overviewData?.district || "",

          latitude: body.latitude ?? overviewData?.latitude ?? null,
          longitude: body.longitude ?? overviewData?.longitude ?? null,
        },
        { where: { id: post.overviewId } },
      );

      // 5. Cập nhật bảng Post chính
      await db.Post.update(
        {
          title: title,
          description: JSON.stringify(description || ""),
          categoryCode: categoryCode,
          priceCode: priceCode || null,
          areaCode: areaCode || null,
          priceNumber: Number(priceNumber) || 0,
          areaNumber: Number(areaNumber) || 0,
        },
        { where: { id: postId, userId } },
      );

      resolve({ err: 0, msg: "Cập nhật bài đăng thành công!" });
    } catch (error) {
      reject(error);
    }
  });

export const deletePostService = (postId, userId) =>
  new Promise(async (resolve, reject) => {
    const t = await db.sequelize.transaction();

    try {
      const post = await db.Post.findOne({
        where: { id: postId, userId },
        raw: true,
      });

      if (!post) {
        return resolve({ err: 1, msg: "Không tìm thấy bài đăng." });
      }

      if (post?.overviewId) {
        await db.Overview.destroy({
          where: { id: post.overviewId },
          transaction: t,
        });
      }

      if (post?.imagesId) {
        await db.Image.destroy({
          where: { id: post.imagesId },
          transaction: t,
        });
      }

      if (post?.attributesId) {
        await db.Attribute.destroy({
          where: { id: post.attributesId },
          transaction: t,
        });
      }

      await db.Post.destroy({
        where: { id: postId, userId },
        transaction: t,
      });

      await t.commit();

      resolve({
        err: 0,
        msg: "Xóa bài đăng thành công!",
      });
    } catch (error) {
      await t.rollback();
      reject(error);
    }
  });
