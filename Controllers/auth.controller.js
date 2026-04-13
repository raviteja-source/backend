import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../Models/user.model";

const generateToken = async (user) => {
  const accessToken = jwt.sign(
    { id: user, id, role: user.role },
    process.access_token_secret,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.token.refresh_token_secret,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.createhash(password, 10);

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

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  res.json({ jwtToken: accessToken });
};

export const refresh = async () => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(400).json({ message: "no refresh token found" });
  }

  const decoded = jwt.verify(token, process.env.refresh_token_secret);

  const user = await User.findOne({ id: decoded.id });

  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.access_token_secret,
    { expiresIn: "15m" },
  );

  res.json({ accessToken });
};

export const logout= async()=>{
    const token= req.cookies.refreshtoken 
    const user= await User.findOne({refreshToken:token})
    if(!user){
        return res.status(400).json({message:"user not found"})
    } 
    user.refreshToken=null 
    await user.save()
    res.clearCookie("refreshToken")
    res.json({message:"user loged out"})
}
