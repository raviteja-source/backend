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

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 120
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 1
 *               role:
 *                 type: number
 *                 default: 1
 *                 enum: [1, 2]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post("/signup", validate(signupSchema), signup);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jwtToken:
 *                   type: string
 *                 userId:
 *                   type: string
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=abc123; Path=/; HttpOnly; SameSite=Strict
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Device limit reached
 */
router.post("/login", validate(loginSchema), login);

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 pattern: '^[a-fA-F0-9]{24}$'
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: New access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: No refresh token cookie
 *       401:
 *         description: Invalid or expired refresh token
 *       403:
 *         description: User ID does not match or invalid token
 */
router.post("/refresh", validate(refreshSchema), refresh);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout from current device
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 pattern: '^[a-fA-F0-9]{24}$'
 *     responses:
 *       200:
 *         description: Logged out from this device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: User ID does not match authenticated user
 *       404:
 *         description: User not found
 */
router.post("/logout", protect, validate(logoutUserIdSchema), logout);

/**
 * @swagger
 * /logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 pattern: '^[a-fA-F0-9]{24}$'
 *     responses:
 *       200:
 *         description: Logged out from all devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: User ID does not match authenticated user
 *       404:
 *         description: User not found
 */
router.post("/logout-all", protect, validate(logoutUserIdSchema), logoutAll);

export default router;
