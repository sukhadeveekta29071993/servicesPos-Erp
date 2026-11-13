const http = require("http");

const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");

const server = http.createServer(app);

let isShuttingDown = false;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(env.PORT, () => {
      console.log("-----------------------------------");
      console.log("TWO WHEELER ERP POS BACKEND");
      console.log("-----------------------------------");
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`Port: ${env.PORT}`);
      console.log(`API: http://localhost:${env.PORT}`);
      console.log(
        `Health: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`,
      );
      console.log("-----------------------------------");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`${signal} received. Shutting down server...`);

  server.close(async () => {
    try {
      const mongoose = require("mongoose");
      await mongoose.disconnect();

      console.log("MongoDB disconnected.");
      console.log("Server shutdown completed.");

      process.exit(0);
    } catch (error) {
      console.error("Shutdown error:", error.message);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Forced shutdown due to timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  gracefulShutdown("UNHANDLED_REJECTION");
});

startServer();
