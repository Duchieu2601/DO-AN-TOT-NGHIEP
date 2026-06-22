// routes/comment.js
import express from "express";
import {
  createComment,
  getComments,
  deleteComment,
} from "../controllers/comment.js";
import { verifyToken, isAdmin } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/:postId", verifyToken, createComment);
router.get("/:postId", getComments); // khách vãng lai cũng xem được
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
