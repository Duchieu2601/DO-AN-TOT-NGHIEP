import * as postService from "../services/post";

export const getPosts = async (req, res) => {
  try {
    const response = await postService.getPostsService();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: "Failed at post controller: " + error,
    });
  }
};
export const getPostsLimit = async (req, res) => {
  const { page, priceNumber, areaNumber, ...query } = req.query;
  try {
    const response = await postService.getPostsLimitService(page, query, {
      priceNumber,
      areaNumber,
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: "Failed at post controller: " + error,
    });
  }
};
export const getNewPosts = async (req, res) => {
  try {
    const response = await postService.getNewPostService();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: "Failed at post controller: " + error,
    });
  }
};

export const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await postService.getPostByIdService(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ err: -1, msg: "Failed: " + error });
  }
};

export const createNewPost = async (req, res) => {
  try {
    const { categoryCode, title, priceNumber, areaNumber, label, province } =
      req.body;

    // Kiểm tra sơ bộ đầu vào tối thiểu cần thiết
    if (!categoryCode || !title || !province) {
      return res.status(400).json({
        err: 1,
        msg: "Thiếu thông tin đầu vào bắt buộc (Danh mục, Tiêu đề hoặc Tỉnh thành).",
      });
    }

    const response = await postService.createNewPostService(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: "Lỗi hệ thống tại Post Controller: " + error.message,
    });
  }
};

export const getPostsLimitAdmin = async (req, res) => {
  const { page, ...query } = req.query;
  const { id } = req.user;

  try {
    if (!id)
      return res.status(400).json({
        err: 1,
        msg: "Missing input",
      });
    const response = await postService.getPostsLimitAdminService(
      page,
      id,
      query,
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: "Failed at post controller: " + error,
    });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.user; // lấy userId từ token
  try {
    const response = await postService.updatePostService({
      ...req.body,
      userId: id,
    });
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ err: -1, msg: "Failed at post controller: " + error });
  }
};

export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { id } = req.user;
  try {
    const response = await postService.deletePostService(postId, id);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ err: -1, msg: "Failed at post controller: " + error });
  }
};
