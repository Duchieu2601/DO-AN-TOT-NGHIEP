"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Overview extends Model {
    static associate(models) {
      Overview.hasOne(models.Post, {
        foreignKey: "overviewId",
        as: "overview",
      });
    }
  }
  Overview.init(
    {
      district: DataTypes.STRING,
      city: DataTypes.STRING,
      address: DataTypes.STRING,
      type: DataTypes.STRING,
      created: DataTypes.STRING,
      expire: DataTypes.STRING,
      latitude: DataTypes.DOUBLE,
      longitude: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: "Overview",
    },
  );
  return Overview;
};
