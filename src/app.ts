import express, { Request, Response } from "express";
import logger from "morgan";
import cors, { CorsOptions } from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import apicache from "apicache";
import rateLimit from "express-rate-limit";
import { config } from "./data/config.js";
import apiRoutes from "./lib/routes.js";
import { closeConnections } from "./lib/db.connection.js";
import { readFilesFromS3 } from "./utils/ReadFilesFromS3.controller.js";

const app = express();

const cache = apicache.middleware;

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (config.CORS_ORIGIN?.includes(origin) || !origin) {
      callback(null, true);
    } else {
      const error = new Error("Not allowed by CORS");
      error["statusCode"] = "CORS";
      callback(error);
    }
  },
};

const publicApiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  handler: (_req: Request, res: Response) => {
    res.status(429).send("Too many requests, please try again later.");
  },
  standardHeaders: true,
  legacyHeaders: true,
});

app.set("trust proxy", 1);
app.use("/public-feed", publicApiLimiter);
app.use("/public-feed", cache("10 minutes"));

app.use(logger("dev"));
app.use(express.json());
app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);
app.get("/api/changelog/:fileKey", readFilesFromS3)

app.use("", apiRoutes);

// app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDoc, { explorer: true }));

// Error handling middleware
app.use(
  (
    error: { errors; code: number; error: string; statusCode: string | number },
    _req: Request,
    res: Response,
    _next: Function
  ) => {
    console.error(error);
    if (error?.errors) {
      const errors = {};
      for (const key in error.errors) {
        errors[key] =
          error.errors[key].message ||
          error.errors[key].kind ||
          error.errors[key];
      }
      return res.status(400).json({ message: "Validation Errors", errors });
    }
    if (error.code === 11000) {
      return res
        .status(409)
        .json({
          message: "Record already exists",
          error: error?.error || error,
        });
    }
    if (error.statusCode === 400) {
      return res
        .status(400)
        .json({ message: "Bad request", error: error?.error || error });
    }
    if (error.statusCode === "CORS") {
      return res
        .status(400)
        .json({ message: "Not allowed by CORS", error: error?.error || error });
    }
    return res.status(500).send({ message: "Internal server error" });
  }
);

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on("SIGINT", async () => {
  try {
    // Disconnect Mongoose
    await closeConnections();
    console.log("Mongoose disconnected through app termination");
    process.exit(0); // Exit Node.js process
  } catch (error) {
    console.error("Error disconnecting Mongoose:", error);
    process.exit(1); // Exit with error
  }
});

export default app;
