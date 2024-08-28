const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const authRoutes = require("./routes/authRoutes");
// const authRoutes = require("./routes/authRoutes");
const cors = require("cors");

dotenv.config();
connectDb();

const app = express();
app.use(cors());
app.use(express.json());

// use the auth routes here
app.use("/api", authRoutes);

// app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
