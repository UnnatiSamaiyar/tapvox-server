const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const path = require("path");

const contactRoutes = require("./routes/contact");
const blogRoute = require('./routes/blogRoutes');


const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
// Middlewares
const corsOptions = {
  origin: ["https://tapvox.net", "https://www.tapvox.net", "http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "https://www.tapvox.net/admin"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Routes
app.use("/api/contact", contactRoutes);
app.use("/api", blogRoute);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Tapvox Server",
    status: "success",
    docs: "/api", // you can point to your API root or docs if you want
  });
});


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
