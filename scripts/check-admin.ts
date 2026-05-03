import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { AdminModel } from "../src/models/Admin";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri);
  console.log("[check] connected. db =", mongoose.connection.name);

  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026";

  const admin = await AdminModel.findOne({ email }).lean();
  if (!admin) {
    console.log("[check] admin NOT FOUND for email:", email);
    const all = await AdminModel.find({}).lean();
    console.log("[check] admins in DB:", all.map((a) => a.email));
  } else {
    console.log("[check] admin found. _id =", admin._id.toString());
    console.log("[check] passwordHash starts with:", admin.passwordHash.slice(0, 7));
    const ok = await bcrypt.compare(password, admin.passwordHash);
    console.log("[check] bcrypt.compare(password) =", ok);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
