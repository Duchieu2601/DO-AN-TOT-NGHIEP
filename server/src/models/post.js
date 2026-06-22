"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
        as: "user",
      });

      Post.belongsTo(models.Attribute, {
        foreignKey: "attributesId",
        targetKey: "id",
        as: "attributes",
      });

      Post.belongsTo(models.Overview, {
        foreignKey: "overviewId",
        targetKey: "id",
        as: "overview",
      });

      Post.belongsTo(models.Image, {
        foreignKey: "imagesId",
        targetKey: "id",
        as: "images",
      });

      Post.belongsTo(models.Label, {
        foreignKey: "labelCode",
        targetKey: "code",
        as: "label",
      });

      Post.belongsTo(models.Category, {
        foreignKey: "categoryCode",
        targetKey: "code",
        as: "category",
      });

      Post.belongsTo(models.Price, {
        foreignKey: "priceCode",
        targetKey: "code",
        as: "price",
      });

      Post.belongsTo(models.Area, {
        foreignKey: "areaCode",
        targetKey: "code",
        as: "area",
      });

      Post.belongsTo(models.Province, {
        foreignKey: "provinceCode",
        targetKey: "code",
        as: "province",
      });
      Post.hasMany(models.Wishlist, { foreignKey: "postId", as: "wishlists" });
      Post.hasMany(models.Comment, { foreignKey: "postId", as: "comments" });
    }
  }
  Post.init(
    {
      title: DataTypes.STRING,
      star: DataTypes.STRING,
      labelCode: DataTypes.STRING,
      attributesId: DataTypes.STRING,
      categoryCode: DataTypes.STRING,
      priceCode: DataTypes.STRING,
      areaCode: DataTypes.STRING,
      provinceCode: DataTypes.STRING,
      description: DataTypes.TEXT,
      userId: DataTypes.STRING,
      overviewId: DataTypes.STRING,
      imagesId: DataTypes.STRING,
      priceNumber: DataTypes.FLOAT,
      areaNumber: DataTypes.FLOAT,
      hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("active", "pending", "expired"),
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "Post",
    },
  );
  return Post;
};
