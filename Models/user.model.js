import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    refreshTokens: { type: [String], default: [] },
    password: String,
    /** `Role` document `_id` — signup sends `1`/`2` (code); API maps to this ref. */
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    accessTokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("userSchema", userSchema);
