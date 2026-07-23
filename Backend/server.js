const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load Environment Variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Middleware: Enable CORS for cross-origin requests
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));

// Health Check Endpoint
app.get("/", (req, res) => {
  res.json({
    status: "GlobalAssign Backend Server API Running",
    auth: "JWT Enabled (Teacher & Student Models)",
    dbConnection: "MongoDB Atlas",
    version: "1.0.0"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[GlobalAssign Backend Running] Port: ${PORT}`);
});
