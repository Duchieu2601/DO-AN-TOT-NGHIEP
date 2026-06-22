"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Posts", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      star: {
        type: Sequelize.STRING,
        defaultValue: "0",
      },
      // FK → Labels.code
      labelCode: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: "Labels", key: "code" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // FK → Attributes.id
      attributesId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: "Attributes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // FK → Categories.code
      categoryCode: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: "Categories", key: "code" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // FK → Prices.code
      priceCode: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: "Prices", key: "code" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // FK → Areas.code
      areaCode: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: "Areas", key: "code" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // FK → Provinces.code
      provinceCode: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: "Provinces", key: "code" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // FK → Users.id
      userId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // FK → Overviews.id
      overviewId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: "Overviews", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // FK → Images.id
      imagesId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: "Images", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // Giá trị số để filter/sort (vd: 1.3 → 1300000)
      priceNumber: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      // Diện tích số để filter/sort (vd: 20.0)
      areaNumber: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      // hidden: {
      //   type: Sequelize.BOOLEAN,
      //   defaultValue: false,
      // },
      // status: {
      //   type: Sequelize.ENUM("active", "pending", "expired"),
      //   defaultValue: "active",
      // },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Posts");
  },
};
