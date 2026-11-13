const mongoose = require("mongoose");

const getHealth = (req, res) => {
  const databaseStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const databaseStatus =
    databaseStates[mongoose.connection.readyState] || "unknown";

  const isDatabaseConnected = mongoose.connection.readyState === 1;

  return res.status(isDatabaseConnected ? 200 : 503).json({
    success: isDatabaseConnected,
    message: isDatabaseConnected
      ? "ERP POS API is running successfully"
      : "Database connection is unavailable",

    data: {
      application: "Multi Brand Two Wheeler ERP POS",
      environment: process.env.NODE_ENV || "development",
      database: databaseStatus,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = {
  getHealth,
};
