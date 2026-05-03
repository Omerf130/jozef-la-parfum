import mongoose, { Schema, model, models, type Model } from "mongoose";

export interface AdminDoc {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<AdminDoc>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true },
);

export const AdminModel: Model<AdminDoc> =
  (models.Admin as Model<AdminDoc>) || model<AdminDoc>("Admin", AdminSchema);
