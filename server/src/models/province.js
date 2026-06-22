"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Province extends Model {
    static associate(models) {
      Province.hasMany(models.Post, {
        foreignKey: "provinceCode",
        sourceKey: "code",
        as: "posts",
      });
    }
  }
  Province.init(
    {
      code: DataTypes.STRING,
      value: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Province",
    },
  );
  return Province;
};
