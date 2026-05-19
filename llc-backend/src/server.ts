import helmet from "helmet";
import express from "express";
import mongoose from "mongoose";

import { config } from "@/config";
import { errorHandlerMiddleware, corsHandlerMiddleware } from "@/middlewares";
import { router } from "@/routes";
import path from "path";

const app = express();
const port = config.port;
const dbUri = config.dbUri;

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(corsHandlerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use("/api/", router);
app.use(errorHandlerMiddleware);

mongoose
  .connect(dbUri)
  .then((_res: unknown) => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

process.on("SIGINT", () => {
  console.log("SIGINT: Server is shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM: Server is shutting down...");
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});
