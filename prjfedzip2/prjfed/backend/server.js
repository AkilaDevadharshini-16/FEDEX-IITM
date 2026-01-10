const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const caseRoutes = require("./routes/case");

const app = express();

/* ======================
   CONNECT DATABASE
====================== */
connectDB();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json());

// ✅ VERY IMPORTANT: Serve uploaded files
app.use("/uploads", express.static("uploads"));

/* ======================
   ROUTES
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);

/* ======================
   TEST ROUTE
====================== */
app.get("/", (req, res) => {
  res.send("Backend server is running 🚀");
});

/* ======================
   START SERVER
====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
