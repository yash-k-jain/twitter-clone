import express from "express";
import dotenv from "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db.js";

const app = express();

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Listening on port ${process.env.PORT || 5000}`);
  connectMongoDB();
});
