import dotenv from "dotenv";
dotenv.config();

export const config = {
  JWT_SECRET: process.env.JWT_SECRET || "your_super_secret_jwt_key_change_in_production",
  MONGODB_URI: process.env.MONGODB_URI || "",
  PORT: parseInt(process.env.PORT || "3001", 10),
};