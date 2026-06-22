import jwt from "jsonwebtoken";

// ─── Middleware xác thực Access Token ──────────────────────────────
const verifyToken = (req, res, next) => {
  let accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken)
    return res.status(401).json({
      err: 1,
      msg: "Missing access token",
    });

  jwt.verify(accessToken, process.env.SECRET_KEY, (err, user) => {
    if (err)
      return res.status(401).json({
        err: 1,
        msg: "Access token expired",
      });

    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }

  return res.status(403).json({
    err: 1,
    msg: "Bạn không có quyền truy cập trang này.",
  });
};

export { verifyToken, isAdmin };
