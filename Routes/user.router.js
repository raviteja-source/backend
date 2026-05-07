import express from "express";
import { authorize } from "../Middlewares/role.middleware.js";
import { protect } from "../Middlewares/auth.middleware.js";
import { ROLE_CODE } from "../Models/role.model.js";

const router = express.Router();

/**
 * @swagger
 * /userProfile:
 *   post:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         description: JWT access token
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: User object
 */
router.post("/userProfile", protect, (req, res) => {
  res.status(200).json({ user: req.user });
});

/**
 * @swagger
 * /adminProfile:
 *   post:
 *     summary: Get admin profile (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         description: JWT access token
 *     responses:
 *       200:
 *         description: Admin profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: User object
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  "/adminProfile",
  protect,
  authorize(ROLE_CODE.ADMIN),
  (req, res) => {
    res.status(200).json({ message: "Admin only", data: req.user });
  },
);
export default router;
