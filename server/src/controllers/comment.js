import db from "../models/index.js";

// Thêm bình luận
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const { content, star } = req.body;

    if (!content || content.trim() === "") {
      return res.json({ err: 1, msg: "Nội dung không được để trống" });
    }
    if (star && (star < 1 || star > 5)) {
      return res.json({ err: 1, msg: "Số sao không hợp lệ" });
    }

    const comment = await db.Comment.create({
      userId,
      postId,
      content: content.trim(),
      star: star || null,
    });

    // Trả về kèm thông tin user để hiển thị luôn
    const result = await db.Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "name", "avatar"],
        },
      ],
    });

    return res.json({ err: 0, msg: "Đã thêm bình luận", response: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: 1, msg: "Lỗi server" });
  }
};

// Lấy danh sách bình luận của 1 bài đăng
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await db.Comment.findAll({
      where: { postId },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "name", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ err: 0, msg: "OK", response: comments });
  } catch (error) {
    return res.status(500).json({ err: 1, msg: "Lỗi server" });
  }
};

// Xóa bình luận (chỉ xóa của mình)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await db.Comment.findOne({
      where: { id: commentId, userId },
    });
    if (!comment) {
      return res.json({
        err: 1,
        msg: "Không tìm thấy bình luận hoặc không có quyền xóa",
      });
    }

    await comment.destroy();
    return res.json({ err: 0, msg: "Đã xóa bình luận" });
  } catch (error) {
    return res.status(500).json({ err: 1, msg: "Lỗi server" });
  }
};
