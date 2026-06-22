// migrations/YYYYMMDD-add-admin-fields.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable("Users");

    // Thêm cột role nếu chưa có
    if (!tableDesc.role) {
      await queryInterface.addColumn("Users", "role", {
        type: Sequelize.ENUM("user", "admin"),
        defaultValue: "user",
        allowNull: false,
      });
    }

    // Thêm cột banned nếu chưa có
    if (!tableDesc.banned) {
      await queryInterface.addColumn("Users", "banned", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }

    // Thêm cột hidden vào Posts nếu chưa có
    const postDesc = await queryInterface.describeTable("Posts");
    if (!postDesc.hidden) {
      await queryInterface.addColumn("Posts", "hidden", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }

    // Thêm cột status vào Posts nếu chưa có
    if (!postDesc.status) {
      await queryInterface.addColumn("Posts", "status", {
        type: Sequelize.ENUM("active", "pending", "expired"),
        defaultValue: "active",
        allowNull: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "role");
    await queryInterface.removeColumn("Users", "banned");
    await queryInterface.removeColumn("Posts", "hidden");
    await queryInterface.removeColumn("Posts", "status");
  },
};
