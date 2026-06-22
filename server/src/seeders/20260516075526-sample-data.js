"use strict";
const fs = require("fs");
const path = require("path");

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 1. Đọc dữ liệu từ file phongtro.json (sửa lại đường dẫn cho đúng vị trí file của bạn)
      const rawData = fs.readFileSync(
        path.resolve(__dirname, "../../data/phongtro.json"),
        "utf-8",
      );
      const dataJson = JSON.parse(rawData);
      const postsData = dataJson.details; // Lấy mảng danh sách phòng trọ

      if (!postsData || postsData.length === 0) return;

      // Chuẩn bị mảng để lưu hàng loạt dữ liệu vào DB
      let usersToInsert = [];
      let imagesToInsert = [];
      let overviewsToInsert = [];
      let attributesToInsert = [];
      let postsToInsert = [];

      // Giả lập ID tự tăng bắt đầu từ 1 để tạo mối liên kết
      let currentId = 1;

      for (let item of postsData) {
        // --- XỬ LÝ USER (CONTACT) ---
        const contactName =
          item.contact?.content?.find((i) => i.name === "Liên hệ:")?.value ||
          "Chủ trọ";
        const contactPhone =
          item.contact?.content?.find((i) => i.name === "Điện thoại:")?.value ||
          "";
        const contactZalo =
          item.contact?.content?.find((i) => i.name === "Zalo:")?.value || "";

        usersToInsert.push({
          id: currentId,
          name: contactName,
          phone: contactPhone,
          zalo: contactZalo,
          password: "db_password_hash_123", // Mật khẩu giả lập mẫu
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // --- XỬ LÝ IMAGES ---
        // Gom mảng ảnh thành chuỗi string JSON để lưu vào cột TEXT của bạn
        const imgUrls = item.images ? item.images.map((img) => img.src) : [];
        imagesToInsert.push({
          id: currentId,
          image: JSON.stringify(imgUrls),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // --- XỬ LÝ OVERVIEW ---
        const overviewData = item.overview?.content || [];
        overviewsToInsert.push({
          id: currentId,
          address: item.overview?.header || "",
          type:
            overviewData.find((i) => i.name === "Loại tin rao:")?.value ||
            "Phòng trọ",
          district: item.overview?.district || "",
          city: item.overview?.city || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // --- XỬ LÝ ATTRIBUTE & TIỆN ÍCH (FEATURED) ---
        const featuredList = item.featured?.content || [];

        // Hàm phụ kiểm tra xem phòng này có tiện ích đó không
        const checkFeature = (featureName) => {
          const found = featuredList.find((f) =>
            f.name.toLowerCase().includes(featureName.toLowerCase()),
          );
          return found ? found.available : false;
        };

        attributesToInsert.push({
          id: currentId,
          price: item.mainContent?.price || "",
          acreage: item.mainContent?.acreage || "",
          published: new Date().toLocaleDateString("vi-VN"),
          // Tự động map dữ liệu tiện ích từ JSON sang cột BOOLEAN trong DB
          hasFurniture: checkFeature("nội thất"),
          hasMezzanine: checkFeature("gác"),
          hasKitchen: checkFeature("bếp"),
          hasAirConditioner:
            checkFeature("máy lạnh") || checkFeature("điều hòa"),
          hasWashingMachine: checkFeature("máy giặt"),
          hasFridge: checkFeature("tủ lạnh"),
          hasElevator: checkFeature("thang máy"),
          isNoOwner: checkFeature("chung chủ"),
          isFreeTime: checkFeature("tự do"),
          hasSecurity: checkFeature("bảo vệ"),
          hasParking: checkFeature("xe"),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // --- XỬ LÝ BẢNG CHÍNH POSTS ---
        postsToInsert.push({
          title: item.header?.title || "",
          description: Array.isArray(item.mainContent?.content)
            ? item.mainContent.content.join("\n")
            : "",
          userId: currentId, // Nối đầu ID bảng User
          imagesId: currentId, // Nối đầu ID bảng Image
          overviewId: currentId, // Nối đầu ID bảng Overview
          attributesId: currentId, // Nối đầu ID bảng Attribute
          categoryCode: item.header?.categoryCode || "KT", // Mã danh mục mặc định
          provinceCode: item.header?.provinceCode || "HN", // Mã tỉnh mặc định
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        currentId++;
      }

      // 2. Tiến hành đẩy dữ liệu đồng loạt xuống MySQL theo đúng thứ tự liên kết khóa ngoại
      await queryInterface.bulkInsert("Users", usersToInsert);
      await queryInterface.bulkInsert("Images", imagesToInsert);
      await queryInterface.bulkInsert("Overviews", overviewsToInsert);
      await queryInterface.bulkInsert("Attributes", attributesToInsert);
      await queryInterface.bulkInsert("Posts", postsToInsert);

      console.log(">>> Đã đổ dữ liệu mẫu từ JSON vào MySQL thành công!");
    } catch (error) {
      console.error("Lỗi khi chạy Seeder:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    // Logic dùng để xóa sạch dữ liệu mẫu khi cần reset DB
    await queryInterface.bulkDelete("Posts", null, {});
    await queryInterface.bulkDelete("Attributes", null, {});
    await queryInterface.bulkDelete("Overviews", null, {});
    await queryInterface.bulkDelete("Images", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
