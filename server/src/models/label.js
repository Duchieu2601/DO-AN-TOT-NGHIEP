"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Label extends Model {
    static associate(models) {
      Label.hasMany(models.Post, {
        foreignKey: "labelCode",
        sourceKey: "code",
        as: "posts",
      });
    }
  }
  Label.init(
    {
      code: DataTypes.STRING,
      value: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Label",
    },
  );
  return Label;
};
