import db from "../models/index.js";

// Thêm/bỏ yêu thích (toggle)
export const toggleWishlist = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const existing = await db.Wishlist.findOne({ where: { userId, postId } });

    if (existing) {
      await existing.destroy();
      return res.json({ err: 0, msg: "Đã bỏ yêu thích", isWishlisted: false });
    }

    await db.Wishlist.create({ userId, postId });
    return res.json({ err: 0, msg: "Đã thêm yêu thích", isWishlisted: true });
  } catch (error) {
    return res.status(500).json({ err: 1, msg: "Lỗi server" });
  }
};

// Lấy danh sách yêu thích của user
export const getWishlists = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlists = await db.Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: db.Post,
          as: "post",
          include: [
            { model: db.Image, as: "images", attributes: ["image"] },
            {
              model: db.Attribute,
              as: "attributes",
              attributes: ["price", "acreage"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ err: 0, msg: "OK", response: wishlists });
  } catch (error) {
    return res.status(500).json({ err: 1, msg: "Lỗi server" });
  }
};

// Lấy danh sách postId đã lưu (để check nút tim)
export const getWishlistIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlists = await db.Wishlist.findAll({
      where: { userId },
      attributes: ["postId"],
    });
    const ids = wishlists.map((w) => w.postId);
    return res.json({ err: 0, msg: "OK", response: ids });
  } catch (error) {
    return res.status(500).json({ err: 1, msg: "Lỗi server" });
  }
};
