import express from "express";
import dotenv from "dotenv/config";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Listening on port ${process.env.PORT || 5000}`);
  connectMongoDB();
});
