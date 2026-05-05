import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";

export const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ")
    ? auth.slice(7).trim()
    : auth?.split(/\s+/).filter(Boolean)[1];

  if (!token) {
    return res.status(401).json({ message: "no token recieved" });
  }

  try {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decode.id)
      .select("-password -refreshTokens")
      .populate("role")
      .lean();

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const tokenVersion = decode.accessTokenVersion ?? 0;
    const currentVersion = user.accessTokenVersion ?? 0;
    if (tokenVersion !== currentVersion) {
      return res
        .status(401)
        .json({ message: "Invalid or expired access token" });
    }

    const { accessTokenVersion: _v, role: rolePop, ...rest } = user;
    const roleCode =
      rolePop && typeof rolePop === "object" && "code" in rolePop
        ? rolePop.code
        : null;

    req.user = {
      ...rest,
      id: String(user._id),
      role: roleCode,
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};
