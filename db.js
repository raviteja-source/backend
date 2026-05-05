import mongoose from "mongoose";
import dotenv from "dotenv";
import Role, { ROLE_CODE } from "./Models/role.model.js";
import User from "./Models/user.model.js";

dotenv.config();

async function seedRoles() {
  await Role.updateOne(
    { code: ROLE_CODE.USER },
    { $set: { label: "user" } },
    { upsert: true },
  );
  await Role.updateOne(
    { code: ROLE_CODE.ADMIN },
    { $set: { label: "admin" } },
    { upsert: true },
  );
}

/** Old documents may still have `role: 1 | 2` (number). Map to Role `_id` without Mongoose query cast. */
async function migrateUserRoleRefs() {
  const userRole = await Role.findOne({ code: ROLE_CODE.USER }).lean();
  const adminRole = await Role.findOne({ code: ROLE_CODE.ADMIN }).lean();
  if (!userRole?._id || !adminRole?._id) return;

  const col = User.collection;
  await col.updateMany({ role: 1 }, { $set: { role: userRole._id } });
  await col.updateMany({ role: 2 }, { $set: { role: adminRole._id } });
}

export const connectDB = async () => {
  if (!process.env.mongoUrl) {
    throw new Error("Missing `mongoUrl` in .env");
  }
  await mongoose.connect(process.env.mongoUrl);
  await seedRoles();
  await migrateUserRoleRefs();
  console.log("mongo DB Connected");
};
