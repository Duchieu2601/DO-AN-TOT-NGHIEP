// routes/wishlist.js
import express from "express";
import {
  toggleWishlist,
  getWishlists,
  getWishlistIds,
} from "../controllers/wishlist.js";
import { verifyToken, isAdmin } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/toggle/:postId", verifyToken, toggleWishlist);
router.get("/", verifyToken, getWishlists);
router.get("/ids", verifyToken, getWishlistIds);

export default router;
