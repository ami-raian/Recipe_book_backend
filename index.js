const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── 1. CORS SETUP ───────────────────────────────────────────────
app.use(
  cors({
    // origin: "http://localhost:5173", // Vite frontend
    origin: "https://recipe-book-front-end.vercel.app", // Vite production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// ─── 2. BODY PARSER ───────────────────────────────────────────────
app.use(express.json()); // built-in body parser

// ─── 3. CONNECT TO MONGODB ────────────────────────────────────────
const MONGODB_URI =
  "mongodb+srv://naimauddin23:1eHr4LwMKz9ne77t@cluster0.cow9yu9.mongodb.net/recipe-book-app?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ─── 4. DEFINE MODEL ───────────────────────────────────────────────
// Using schema-less model (flexible fields)
const RecipeSchema = new mongoose.Schema({}, { strict: false });
const Recipe = mongoose.model("Recipe", RecipeSchema, "recipes");

// ─── 5. ROUTES ─────────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.send("<h1>🍽️ Recipe Book API</h1><p>Welcome to the API</p>");
});

// Create
app.post("/recipes", async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all
app.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one
app.get("/recipes/:id", async (req, res) => {
  try {
    console.log(req.params.id, "read one");
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Not found" });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
app.put("/recipes/:id", async (req, res) => {
  try {
    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: false,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
app.delete("/recipes/:id", async (req, res) => {
  try {
    const deleted = await Recipe.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 6. START SERVER ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
