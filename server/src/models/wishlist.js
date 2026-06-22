"use strict";
module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define("Wishlist", {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Wishlist.associate = (models) => {
    Wishlist.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    Wishlist.belongsTo(models.Post, { foreignKey: "postId", as: "post" });
  };

  return Wishlist;
};
