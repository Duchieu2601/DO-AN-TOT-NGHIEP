import express from "express";
import * as postController from "../controllers/post";
import { verifyToken, isAdmin } from "../middlewares/verifyToken";

const router = express.Router();

// Public routes
router.get("/all", postController.getPosts);
router.get("/limit", postController.getPostsLimit);
router.get("/new-post", postController.getNewPosts);

// Protected routes (cần đăng nhập)
router.get("/admin-limit", verifyToken, postController.getPostsLimitAdmin);
router.post("/create", verifyToken, postController.createNewPost);
router.put("/update", verifyToken, postController.updatePost);
router.delete("/delete/:postId", verifyToken, postController.deletePost);

// Phải để /:id CUỐI CÙNG để tránh conflict với các route trên
router.get("/:id", postController.getPostById);

export default router;
