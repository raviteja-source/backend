export const authorize = (role) => {
  return (req, res, next) => {
    // console.log(req.user?.role)
    if (req.user?.role !== role) {
      return res.status(403).json({ message: "role is not matched" });
    }

    next();
  };
};
