import express from "express"
import { login, signup, logout, refresh } from "../Controllers/auth.controller.js";
const router= express.Router()

router.post("/signup", signup);
router.post("/login", login);
router.get("/refresh", refresh);
router.get("/logout", logout);

export default router



