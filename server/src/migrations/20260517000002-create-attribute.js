"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Attributes", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        unique: true,
      },
      price: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      published: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      acreage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // --- Tiện ích / Nổi bật ---
      hasFurniture: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hasMezzanine: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hasKitchen: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hasAirConditioner: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hasWashingMachine: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hasFridge: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hasElevator: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isNoOwner: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isFreeTime: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hasSecurity: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hasParking: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
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
    await queryInterface.dropTable("Attributes");
  },
};
