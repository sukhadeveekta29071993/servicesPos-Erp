const dotenv = require("dotenv");

dotenv.config();

const requiredVariables = ["MONGODB_URI"];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
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
};

module.exports = env;
