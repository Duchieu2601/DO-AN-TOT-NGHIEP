"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, { foreignKey: "userId", as: "posts" });
      User.hasMany(models.Wishlist, { foreignKey: "userId", as: "wishlists" });
      User.hasMany(models.Comment, { foreignKey: "userId", as: "comments" });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      password: DataTypes.STRING,
      phone: DataTypes.STRING,
      zalo: DataTypes.STRING,
      fbUrl: DataTypes.STRING,

      avatar: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
      },

      banned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
