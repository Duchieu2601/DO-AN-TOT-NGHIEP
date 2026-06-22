import express from "express";
import * as userController from "../controllers/user";
import { verifyToken, isAdmin } from "../middlewares/verifyToken";

const router = express.Router();

router.use(verifyToken); // Tất cả user routes đều cần đăng nhập
router.get("/get-current", userController.getCurrent);
router.put("/update", userController.updateUser);

export default router;
