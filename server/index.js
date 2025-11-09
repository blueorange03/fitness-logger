import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log("MONGO_URI:", process.env.MONGO_URI);


const app = express();
const PORT = process.env.PORT || 4000;
let db;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));

async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db();
  console.log("✅ MongoDB connected");
}
connectDB().catch(console.error);

async function auth(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.get("/api/test", (req, res) => {
  res.json({ message: "Server working fine 🚀" });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const resp = await axios.post(`${process.env.PESU_AUTH_URL}/authenticate`, {
      username,
      password,
      profile: true,
    });
    const data = resp.data;
    if (!data.status) return res.status(401).json({ message: "Invalid credentials" });

    const profile = data.profile;
    const existing = await db.collection("users").findOne({ srn: profile.srn });
    let user;
    if (existing) {
      await db.collection("users").updateOne({ srn: profile.srn }, { $set: { name: profile.name } });
      user = existing;
    } else {
      const newUser = await db.collection("users").insertOne({
        name: profile.name,
        srn: profile.srn,
        branch: profile.branch,
        createdAt: new Date(),
      });
      user = { _id: newUser.insertedId, name: profile.name, srn: profile.srn };
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Auth failed" });
  }
});

app.get("/api/auth/me", auth, async (req, res) => {
  res.json({ user: req.user });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// --- Workout routes ---
// --- Get all workouts for the logged-in user ---
app.get("/api/workouts", auth, async (req, res) => {
  try {
    const workouts = await db
      .collection("workouts")
      .find({ userId: req.user._id })
      .sort({ date: -1 })
      .toArray();

    res.json({ workouts });
  } catch (err) {
    console.error("Error fetching workouts:", err);
    res.status(500).json({ message: "Failed to fetch workouts" });
  }
});

app.post("/api/workouts", auth, async (req, res) => {
  try {
    const { category, exercises, date, duration } = req.body;
    console.log("📥 Received workout data:", req.body);

    if (!category || !exercises || !date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const workout = {
      userId: req.user._id,
      category,
      exercises,
      date: new Date(date),     
      duration: duration || "60 min",
      createdAt: new Date(),
    };

    const result = await db.collection("workouts").insertOne(workout);
    console.log("Workout inserted with ID:", result.insertedId);

    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("Error saving workout:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
