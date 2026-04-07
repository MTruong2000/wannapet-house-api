import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import { authMiddleware } from "./middlewares/auth.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/routes.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://wannapet-house-ui.vercel.app/"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);

export default app;
