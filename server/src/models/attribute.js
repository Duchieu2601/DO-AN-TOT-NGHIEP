"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Attribute extends Model {
    static associate(models) {
      Attribute.hasOne(models.Post, {
        foreignKey: "attributesId",
        as: "attributes",
      });
    }
  }
  Attribute.init(
    {
      price: DataTypes.STRING,
      published: DataTypes.STRING,
      acreage: DataTypes.STRING,

      hasFurniture: { type: DataTypes.BOOLEAN, defaultValue: false },
      hasMezzanine: { type: DataTypes.BOOLEAN, defaultValue: false },
      hasKitchen: { type: DataTypes.BOOLEAN, defaultValue: false },
      hasAirConditioner: { type: DataTypes.BOOLEAN, defaultValue: false },
      hasWashingMachine: { type: DataTypes.BOOLEAN, defaultValue: false },
      hasFridge: { type: DataTypes.BOOLEAN, defaultValue: false },
      hasElevator: { type: DataTypes.BOOLEAN, defaultValue: false },
      isNoOwner: { type: DataTypes.BOOLEAN, defaultValue: false },
      isFreeTime: { type: DataTypes.BOOLEAN, defaultValue: false },
      hasSecurity: { type: DataTypes.BOOLEAN, defaultValue: false },
      hasParking: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "Attribute",
    },
  );
  return Attribute;
};
