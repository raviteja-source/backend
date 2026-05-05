import express from "express";
import { protect } from "../Middlewares/auth.middleware.js";
import { validate } from "../Middlewares/validate.middleware.js";
import {
  loginSchema,
  signupSchema,
  refreshSchema,
  logoutUserIdSchema,
} from "../Validators/auth.validators.js";
import {
  login,
  signup,
  logout,
  refresh,
  logoutAll,
} from "../Controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", protect, validate(logoutUserIdSchema), logout);
router.post("/logout-all", protect, logoutAll);

export default router;
