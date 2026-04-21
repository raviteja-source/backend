import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../Models/user.model.js";

const generateToken = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
};

const getActiveSessions = (refreshTokens = []) => {
  return refreshTokens.map((token, index) => {
    const decoded = jwt.decode(token);

    return {
      sessionNumber: index + 1,
      issuedAt: decoded?.iat ? new Date(decoded.iat * 1000) : null,
      expiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : null,
    };
  });
};

export const signup = async (req, res) => {
  console.log("called signup")
  const { name, email, password } = req.body;
  const user= await User.findOne({email})
  if(user){
    return res.status(400).json({message:"user already exist"})
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({ name, email, password: hashedPassword });

  res.status(200).json({ message: "user created sucessfully" });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    return res.status(400).json({ message: "password not matched" });
  }

  if (user.refreshTokens.length >= 10) {
    return res.status(403).json({
      message: "Device limit reached. Please logout from one device and try again.",
      activeSessionCount: user.refreshTokens.length,
      sessions: getActiveSessions(user.refreshTokens),
    });
  }

  const result = generateToken(user);
  user.refreshTokens.push(result.refreshToken);
  await user.save();

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
  });

  res.json({ jwtToken: result.accessToken });
};

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(400).json({ message: "no refresh token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(403).json({ msg: "Invalid token" });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: "invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  const user = await User.findOne({ refreshTokens: token });

  if (user) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save();
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: true
  });

  res.json({ message: "Logged out from this device" });
};

export const logoutAll = async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);

  user.refreshTokens = []; // remove all tokens
  await user.save();

  res.clearCookie("refreshToken");

  res.json({ message: "Logged out from all devices" });
};
