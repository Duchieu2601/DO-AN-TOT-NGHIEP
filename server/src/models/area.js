"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Area extends Model {
    static associate(models) {
      Area.hasMany(models.Post, {
        foreignKey: "areaCode",
        sourceKey: "code",
        as: "posts",
      });
    }
  }
  Area.init(
    {
      code: DataTypes.STRING,
      order: DataTypes.INTEGER,
      value: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Area",
    },
  );
  return Area;
};
