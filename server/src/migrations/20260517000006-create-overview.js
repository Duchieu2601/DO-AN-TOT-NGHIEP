"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Overviews", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      district: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      latitude: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },

      longitude: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },

      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      expire: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable("Overviews");
  },
};
