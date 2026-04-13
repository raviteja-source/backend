import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "no token recieved" });
  }

  const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  req.user = decode;

  next();
};


