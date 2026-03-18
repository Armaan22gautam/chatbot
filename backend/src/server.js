import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import hpp from "hpp";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";
import { errorHandler } from "./middleware/error.middleware.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(morgan("dev")); // HTTP request logger
app.use(express.json({ limit: "100kb" })); // Stricter JSON limit

// Added Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Prevents Helmet from overriding our CORS middleware
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5173", "ws://localhost:3000", "ws://localhost:5173"],
    },
  },
}));
app.use(mongoSanitize());
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
