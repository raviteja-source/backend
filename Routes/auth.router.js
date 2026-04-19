import express from "express"
import { protect  } from "../Middlewares/auth.middleware.js";  
import { login, signup, logout, refresh,logoutAll } from "../Controllers/auth.controller.js";
const router= express.Router()

router.post("/signup", signup);
router.post("/login", login);
router.get("/refresh", refresh);
router.get("/logout", logout);
router.post("/logout-all", protect, logoutAll);

export default router



