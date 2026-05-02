import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import { config } from "./config";
import apiRouter from "./routes";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());

// Base route: /api/v1
app.use("/api/v1", apiRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const start = async () => {
  await connectDB();
  app.listen(config.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${config.PORT}`);
    console.log(`📍 API base: http://localhost:${config.PORT}/api/v1`);
  });
};

start();