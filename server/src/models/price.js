"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Price extends Model {
    static associate(models) {
      Price.hasMany(models.Post, {
        foreignKey: "priceCode",
        sourceKey: "code",
        as: "posts",
      });
    }
  }
  Price.init(
    {
      code: DataTypes.STRING,
      order: DataTypes.INTEGER,
      value: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Price",
    },
  );
  return Price;
};
