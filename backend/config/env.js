const dotenv = require("dotenv");

dotenv.config();

const requiredVariables = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

if (
  process.env.JWT_ACCESS_SECRET.length < 32 ||
  process.env.JWT_REFRESH_SECRET.length < 32
) {
  throw new Error("JWT secrets must be at least 32 characters long");
}

if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
  throw new Error("Access and refresh JWT secrets must be different");
}

const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();

if (!["strict", "lax", "none"].includes(sameSite)) {
  throw new Error("Invalid COOKIE_SAME_SITE configuration");
}

if (sameSite === "none" && process.env.COOKIE_SECURE !== "true") {
  throw new Error("SameSite=None requires COOKIE_SECURE=true");
}

const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI,

  CLIENT_URL: (process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),

  API_VERSION: process.env.API_VERSION || "v1",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",

  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
  COOKIE_SAME_SITE: sameSite,
};

module.exports = env;
