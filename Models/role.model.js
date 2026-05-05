import mongoose from "mongoose";

export const ROLE_CODE = { USER: 1, ADMIN: 2 };

/** Lookup only: what `code` 1 and 2 mean. `User.role` stores the same `code`. */
const roleSchema = new mongoose.Schema({
  code: {
    type: Number,
    required: true,
    unique: true,
    enum: [ROLE_CODE.USER, ROLE_CODE.ADMIN],
  },
  label: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Role", roleSchema);
