import db from "../models";
import bcrypt from "bcryptjs";

export const getCurrentService = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findOne({
        where: { id },
        raw: true,
        attributes: { exclude: ["password"] },
      });

      // Nếu bị banned → trả lỗi để frontend tự logout
      if (response && response.banned) {
        return resolve({
          err: 3,
          msg: "Tài khoản của bạn đã bị khóa.",
          response: null,
        });
      }

      resolve({
        err: response ? 0 : 1,
        msg: response ? "OK" : "User not found.",
        response,
      });
    } catch (error) {
      reject(error);
    }
  });

export const updateUserService = (id, payload) =>
  new Promise(async (resolve, reject) => {
    try {
      // Nếu có đổi mật khẩu → kiểm tra mật khẩu cũ trước
      if (payload.password) {
        const user = await db.User.findOne({ where: { id }, raw: true });
        if (!user) return resolve({ err: 1, msg: "Không tìm thấy tài khoản." });

        if (payload.oldPassword) {
          const isMatch = bcrypt.compareSync(
            payload.oldPassword,
            user.password,
          );
          if (!isMatch)
            return resolve({ err: 1, msg: "Mật khẩu cũ không đúng." });
        }
        // Hash mật khẩu mới
        const salt = bcrypt.genSaltSync(10);
        payload.password = bcrypt.hashSync(payload.password, salt);
      }

      // Xóa oldPassword khỏi payload trước khi update (không lưu vào DB)
      delete payload.oldPassword;

      const [rowsUpdated] = await db.User.update(payload, { where: { id } });
      resolve({
        err: rowsUpdated > 0 ? 0 : 1,
        msg: rowsUpdated > 0 ? "Cập nhật thành công." : "Không tìm thấy user.",
      });
    } catch (error) {
      reject(error);
    }
  });
