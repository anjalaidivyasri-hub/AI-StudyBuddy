const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./src/utils/db");

// Load Environment Variables
dotenv.config();

const app = express();

// Enable CORS and Request Parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// Register API Routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/materials", require("./src/routes/materials"));
app.use("/api/material", require("./src/routes/materials")); // Alias for single material spec endpoint
app.use("/api/ai", require("./src/routes/ai"));
app.use("/api/admin", require("./src/routes/admin"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", service: "LearnMate AI StudyBuddy API", timestamp: new Date() });
});

// Single Page Application Fallback
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API Endpoint Not Found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global express error:", err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

const PORT = process.env.PORT || 5000;

// Start database and server
const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`LearnMate Server running on http://localhost:${PORT}`);
    console.log(`=================================================`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n[ERROR] Port ${PORT} is already in use by another running Node process.`);
      console.error(`To free port ${PORT} in PowerShell, run:`);
      console.error(`Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
      process.exit(1);
    }
  });
};

if (process.env.NODE_ENV !== "test" && require.main === module) {
  startServer();
}

module.exports = app;
