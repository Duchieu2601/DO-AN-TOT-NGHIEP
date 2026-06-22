import express from "express";
import { verifyToken, isAdmin } from "../middlewares/verifyToken.js";
import db from "../models/index.js";
import { Op } from "sequelize";

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get("/check-admin", (req, res) => {
  return res.json({ err: 0, msg: "Admin OK", user: req.user });
});

// ════════════════════════════════════════════
//  STATS
// ════════════════════════════════════════════

router.get("/stats/users", async (req, res) => {
  try {
    const total = await db.User.count();
    const active = await db.User.count({ where: { banned: false } });
    const banned = await db.User.count({ where: { banned: true } });
    return res.json({ err: 0, total, active, banned });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

router.get("/stats/posts", async (req, res) => {
  try {
    const total = await db.Post.count();
    const hidden = await db.Post.count({ where: { hidden: true } });
    const visible = total - hidden;
    return res.json({ err: 0, total, visible, hidden });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

// ✅ MỚI: stats comments
router.get("/stats/comments", async (req, res) => {
  try {
    const total = await db.Comment.count();
    return res.json({ err: 0, total });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

// ✅ MỚI: charts data
router.get("/stats/charts", async (req, res) => {
  try {
    const { Sequelize } = db;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // 1. Bài đăng theo tháng
    const monthlyPosts = await db.Post.findAll({
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("Post.createdAt"), "%m/%Y"),
          "month",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("Post.id")), "posts"],
      ],
      where: { createdAt: { [Op.gte]: oneYearAgo } },
      group: [
        Sequelize.fn("DATE_FORMAT", Sequelize.col("Post.createdAt"), "%m/%Y"),
      ],
      order: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("Post.createdAt"), "%m/%Y"),
          "ASC",
        ],
      ],
      raw: true,
    });

    // 2. Người dùng mới theo tháng
    const monthlyUsers = await db.User.findAll({
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%m/%Y"),
          "month",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "users"],
      ],
      where: { createdAt: { [Op.gte]: oneYearAgo } },
      group: [Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%m/%Y")],
      order: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%m/%Y"),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Merge theo tháng
    const monthMap = {};
    monthlyPosts.forEach((r) => {
      monthMap[r.month] = {
        month: r.month,
        posts: parseInt(r.posts),
        users: 0,
      };
    });
    monthlyUsers.forEach((r) => {
      if (monthMap[r.month]) monthMap[r.month].users = parseInt(r.users);
      else
        monthMap[r.month] = {
          month: r.month,
          posts: 0,
          users: parseInt(r.users),
        };
    });
    const monthly = Object.values(monthMap).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    // 3. Top 8 tỉnh thành
    const byProvinceRaw = await db.Post.findAll({
      attributes: [
        "provinceCode",
        [Sequelize.fn("COUNT", Sequelize.col("Post.id")), "count"],
      ],
      include: [{ model: db.Province, as: "province", attributes: ["value"] }],
      group: ["Post.provinceCode", "province.code"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("Post.id")), "DESC"]],
      limit: 8,
      raw: true,
      nest: true,
    });

    const byProvince = byProvinceRaw.map((r) => ({
      name: (r.province?.value || r.provinceCode)
        .replace("Tỉnh ", "")
        .replace("Thành phố ", ""),
      count: parseInt(r.count),
    }));

    // 4. Theo danh mục
    const byCategoryRaw = await db.Post.findAll({
      attributes: [
        "categoryCode",
        [Sequelize.fn("COUNT", Sequelize.col("Post.id")), "count"],
      ],
      include: [{ model: db.Category, as: "category", attributes: ["value"] }],
      group: ["Post.categoryCode", "category.code"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("Post.id")), "DESC"]],
      raw: true,
      nest: true,
    });

    const byCategory = byCategoryRaw.map((r) => ({
      name: r.category?.value || r.categoryCode,
      count: parseInt(r.count),
    }));

    return res.json({ err: 0, data: { monthly, byProvince, byCategory } });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

// ════════════════════════════════════════════
//  USERS
// ════════════════════════════════════════════

router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const offset = (page - 1) * limit;

    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes: [
        "id",
        "name",
        "phone",
        "zalo",
        "fbUrl",
        "avatar",
        "role",
        "banned",
        "createdAt",
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    return res.json({ err: 0, count, rows });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ err: 1, msg: "Không tìm thấy người dùng" });
    await db.Post.destroy({ where: { userId: req.params.id } });
    await user.destroy();
    return res.json({ err: 0, msg: "Đã xóa người dùng" });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

router.patch("/users/:id/ban", async (req, res) => {
  try {
    const { banned } = req.body;
    const user = await db.User.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ err: 1, msg: "Không tìm thấy người dùng" });
    await user.update({ banned: !!banned });
    return res.json({
      err: 0,
      msg: banned ? "Đã cấm người dùng" : "Đã gỡ cấm",
    });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

// ════════════════════════════════════════════
//  POSTS
// ════════════════════════════════════════════

router.get("/posts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const status = req.query.status || "all";
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }];
    if (status === "hidden") where.hidden = true;
    if (status === "visible") where.hidden = false;

    const { count, rows } = await db.Post.findAndCountAll({
      where,
      include: [
        { model: db.User, as: "user", attributes: ["id", "name", "phone"] },
        {
          model: db.Overview,
          as: "overview",
          attributes: ["created", "expire", "type"],
        },
        {
          model: db.Attribute,
          as: "attributes",
          attributes: ["price", "acreage", "published"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    return res.json({ err: 0, count, rows });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    const post = await db.Post.findByPk(req.params.id);
    if (!post)
      return res.status(404).json({ err: 1, msg: "Không tìm thấy bài đăng" });
    await post.destroy();
    return res.json({ err: 0, msg: "Đã xóa bài đăng" });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

router.patch("/posts/:id/hide", async (req, res) => {
  try {
    const { hidden } = req.body;
    const post = await db.Post.findByPk(req.params.id);
    if (!post)
      return res.status(404).json({ err: 1, msg: "Không tìm thấy bài đăng" });
    await post.update({ hidden: !!hidden });
    return res.json({
      err: 0,
      msg: hidden ? "Đã ẩn bài đăng" : "Đã hiện bài đăng",
    });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

// ════════════════════════════════════════════
//  COMMENTS
// ════════════════════════════════════════════

router.get("/comments", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9999;
    const search = req.query.search?.trim() || "";
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where.content = { [Op.like]: `%${search}%` };

    const { count, rows } = await db.Comment.findAndCountAll({
      where,
      include: [
        { model: db.User, as: "user", attributes: ["id", "name", "phone"] },
        { model: db.Post, as: "post", attributes: ["id", "title"] },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    return res.json({ err: 0, count, rows });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

router.delete("/comments/:id", async (req, res) => {
  try {
    const comment = await db.Comment.findByPk(req.params.id);
    if (!comment)
      return res.status(404).json({ err: 1, msg: "Không tìm thấy bình luận" });
    await comment.destroy();
    return res.json({ err: 0, msg: "Đã xóa bình luận" });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

router.delete("/comments", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length)
      return res.status(400).json({ err: 1, msg: "Không có ID nào được chọn" });
    const deleted = await db.Comment.destroy({
      where: { id: { [Op.in]: ids } },
    });
    return res.json({ err: 0, msg: `Đã xóa ${deleted} bình luận` });
  } catch (err) {
    return res.status(500).json({ err: 1, msg: err.message });
  }
});

export default router;
