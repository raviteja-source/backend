import Joi from "joi";
import { ROLE_CODE } from "../Models/role.model.js";

const email = Joi.string()
  .trim()
  .lowercase()
  .email({ minDomainSegments: 2 })
  .required()
  .messages({
    "string.email": "must be a valid email address",
    "any.required": "email is required",
    "string.empty": "email cannot be empty",
  });

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  email,
  password: Joi.string().min(1).required(),
  /** Must match `Role.code`. Omitted → default user (1). */
  role: Joi.number()
    .integer()
    .valid(ROLE_CODE.USER, ROLE_CODE.ADMIN)
    .default(ROLE_CODE.USER),
});

export const loginSchema = Joi.object({
  email,
  password: Joi.string().required(),
});

/** Body: `{ userId }` only. `/refresh` uses refresh JWT from `refreshToken` cookie. */
export const refreshSchema = Joi.object({
  userId: Joi.string()
    .trim()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "userId must be a valid Mongo ObjectId",
    }),
});

/** Same body as refresh — must match `protect` (Bearer) user. */
export const logoutUserIdSchema = refreshSchema;
