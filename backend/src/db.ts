import mongoose from "mongoose";
import { config } from "./config";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Account Schema
const accountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const transactionSchema = new mongoose.Schema(
  {
    senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount:   { type: Number, required: true },
    note:   { type: String, default: "" },
    status:   { type: String, enum: ["success", "failed"], default: "success" }
  },
  { timestamps: true }
)

export const User = mongoose.model("User", userSchema);
export const Transaction = mongoose.model("Transaction", transactionSchema);
export const Account = mongoose.model("Account", accountSchema);