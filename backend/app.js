const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");

const healthRoutes = require("./routes/healthRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

//auth routes
const authRoutes = require("./routes/authRoutes");

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin, such as Postman
      if (!origin || env.CLIENT_URL.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Request body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Cookie parsing
app.use(cookieParser());

// HTTP request logging
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// API routes
app.use(`/api/${env.API_VERSION}/health`, healthRoutes);
app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to multi brand Two Wheeler ERP POS API",
    version: env.API_VERSION,
  });
});

// Handle undefined routes
app.use(notFound);

// Central error handler
app.use(errorHandler);

module.exports = app;
