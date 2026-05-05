import express from "express";
import { authorize } from "../Middlewares/role.middleware.js";
import { protect } from "../Middlewares/auth.middleware.js";
import { ROLE_CODE } from "../Models/role.model.js";

const router = express.Router();

router.post("/userProfile", protect, (req, res) => {
  res.status(200).json({ user: req.user });
});

router.post(
  "/adminProfile",
  protect,
  authorize(ROLE_CODE.ADMIN),
  (req, res) => {
    res.status(200).json({ message: "Admin only", data: req.user });
  },
);
export default router;
