import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../Models/user.model.js";
import Role from "../Models/role.model.js";

const roleCodeFromUser = (user) => {
  if (typeof user.role === "number") {
    return user.role;
  }
  if (user.role && typeof user.role === "object" && "code" in user.role) {
    return user.role.code;
  }
  throw new Error("Invalid user.role");
};

const accessTokenPayload = (user) => ({
  id: user._id,
  role: roleCodeFromUser(user),
  accessTokenVersion: user.accessTokenVersion ?? 0,
});

/** Refresh JWT carries only the owning user id (string). */
const signRefreshToken = (userId) =>
  jwt.sign({ userId: String(userId) }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

const cookieOpts = {
  httpOnly: true,
  secure: false,
  sameSite: "Strict",
};

const generateToken = (user) => {
  const accessToken = jwt.sign(
    accessTokenPayload(user),
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = signRefreshToken(user._id);

  return { accessToken, refreshToken };
};

const getActiveSessions = (refreshTokens = []) => {
  return refreshTokens.map((token, index) => {
    const decoded = jwt.decode(token);

    return {
      sessionNumber: index + 1,
      userId: decoded?.userId ?? decoded?.id ?? null,
      issuedAt: decoded?.iat ? new Date(decoded.iat * 1000) : null,
      expiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : null,
    };
  });
};

export const signup = async (req, res) => {
  console.log("called signup");
  const { name, email, password, role: roleCode } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({ message: "user already exist" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const roleDoc = await Role.findOne({ code: roleCode });
  if (!roleDoc) {
    return res.status(500).json({ message: "Role not found for code" });
  }

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: roleDoc._id,
  });

  res.status(201).json({ message: "user created sucessfully" });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate("role");
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    return res.status(401).json({ message: "password not matched" });
  }

  if ((user.refreshTokens ?? []).length >= 10) {
    return res.status(403).json({
      message:
        "Device limit reached. Please logout from one device and try again.",
      activeSessionCount: user.refreshTokens.length,
      sessions: getActiveSessions(user.refreshTokens),
    });
  }

  const result = generateToken(user);
  user.refreshTokens.push(result.refreshToken);
  await user.save();

  res.cookie("refreshToken", result.refreshToken, cookieOpts);

  res.json({
    jwtToken: result.accessToken,
    userId: String(user._id),
  });
};

export const refresh = async (req, res) => {
  const { userId } = req.body;
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(400).json({ message: "no refresh token cookie" });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const tokenUserId = String(decoded.userId ?? decoded.id);
    if (String(userId) !== tokenUserId) {
      return res
        .status(403)
        .json({ message: "userId does not match refresh token" });
    }

    const user = await User.findById(userId).populate("role");

    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const newRefreshToken = signRefreshToken(user._id);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.cookie("refreshToken", newRefreshToken, cookieOpts);

    const accessToken = jwt.sign(
      accessTokenPayload(user),
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  const { userId } = req.body;

  if (String(userId) !== String(req.user.id)) {
    return res
      .status(403)
      .json({ message: "userId does not match authenticated user" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const cookieToken = req.cookies.refreshToken;
  if (cookieToken && user.refreshTokens.includes(cookieToken)) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== cookieToken);
  } else {
    user.refreshTokens = [];
  }

  user.accessTokenVersion = (user.accessTokenVersion ?? 0) + 1;
  await user.save();

  res.clearCookie("refreshToken", cookieOpts);
  res.status(200).json({ message: "Logged out from this device" });
};

export const logoutAll = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.refreshTokens = [];
  user.accessTokenVersion = (user.accessTokenVersion ?? 0) + 1;
  await user.save();

  res.clearCookie("refreshToken", cookieOpts);

  res.status(200).json({ message: "Logged out from all devices" });
};
