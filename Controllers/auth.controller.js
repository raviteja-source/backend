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

export const signup = async (req, res) => {
  console.log("called signup")
  const { name, email, password } = req.body;
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
  const result = generateToken(user);
  user.refreshToken = result.refreshToken;
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

  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

  res.json({ accessToken });
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  const user = await User.findOne({ refreshToken: token });

  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }

  user.refreshToken = null;
  await user.save();
  res.clearCookie("refreshToken");
  res.json({ message: "user loged out" });
};
