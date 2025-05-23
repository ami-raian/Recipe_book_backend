const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// Schema-less
const Recipe = mongoose.model(
  "Recipe",
  new mongoose.Schema({}, { strict: false }),
  "recipes"
);

// Routes
app.get("/api", (req, res) => res.send("🍽️ Recipe Book API Ready"));

app.get("/api/recipes", async (req, res) => res.json(await Recipe.find()));
app.get("/api/recipes/:id", async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ error: "Not found" });
  res.json(recipe);
});
app.post("/api/recipes", async (req, res) =>
  res.status(201).json(await Recipe.create(req.body))
);
app.put("/api/recipes/:id", async (req, res) => {
  const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});
app.delete("/api/recipes/:id", async (req, res) => {
  const deleted = await Recipe.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted", deleted });
});

// Export for serverless
module.exports = app;
module.exports.handler = serverless(app);
