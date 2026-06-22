"use strict";
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define("Comment", {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    star: { type: DataTypes.INTEGER, allowNull: true },
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    Comment.belongsTo(models.Post, { foreignKey: "postId", as: "post" });
  };

  return Comment;
};
