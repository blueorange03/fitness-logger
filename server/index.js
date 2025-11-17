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
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db();
  console.log("✅ MongoDB connected");
}
connectDB().catch(console.error);

async function auth(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.id) });

    next();
  } catch (err) {
    console.log("❌ Auth error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
}

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const resp = await axios.post(
      `${process.env.PESU_AUTH_URL}/authenticate`,
      {
        username,
        password,
        profile: true,
      }
    );

    const data = resp.data;
    if (!data.status)
      return res.status(401).json({ message: "Invalid credentials" });

    const profile = data.profile;

    let user = await db.collection("users").findOne({ srn: profile.srn });

    if (user) {
      await db
        .collection("users")
        .updateOne(
          { srn: profile.srn },
          { $set: { name: profile.name, branch: profile.branch } }
        );
      user = await db.collection("users").findOne({ srn: profile.srn });
    } else {
      const inserted = await db.collection("users").insertOne({
        name: profile.name,
        srn: profile.srn,
        branch: profile.branch,
        createdAt: new Date(),
      });
      user = await db
        .collection("users")
        .findOne({ _id: inserted.insertedId });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800000,
    });

    res.json({ user });
  } catch (err) {
    console.log("❌ Login error:", err.message);
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


app.post("/api/weights", auth, async (req, res) => {
  try {
    const { weight, date } = req.body;

    if (!weight)
      return res.status(400).json({ message: "Missing weight" });

    await db.collection("weights").insertOne({
      userId: req.user._id,
      weight,
      date: new Date(date),
    });

    res.json({ success: true });
  } catch (err) {
    console.log("❌ Weight save error:", err.message);
    res.status(500).json({ message: "Failed to save weight" });
  }
});

app.get("/api/weights", auth, async (req, res) => {
  const weights = await db
    .collection("weights")
    .find({ userId: req.user._id })
    .sort({ date: 1 })
    .toArray();

  res.json({ weights });
});

app.get("/api/weights/latest", auth, async (req, res) => {
  const latest = await db
    .collection("weights")
    .find({ userId: req.user._id })
    .sort({ date: -1 })
    .limit(1)
    .toArray();

  res.json({ weight: latest[0] || null });
});

app.get("/api/workouts", auth, async (req, res) => {
  const workouts = await db
    .collection("workouts")
    .find({ userId: req.user._id })
    .sort({ startTime: -1 })
    .toArray();

  res.json({ workouts });
});

app.post("/api/workouts", auth, async (req, res) => {
  try {
    const {
      category,
      exercises,
      startTime,
      endTime,
      duration,
      bodyWeight,
    } = req.body;

    if (!category || !exercises || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const workout = {
      userId: req.user._id,
      category,
      exercises,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      bodyWeight: bodyWeight || null,
      createdAt: new Date(),
    };

    const result = await db.collection("workouts").insertOne(workout);

    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.log("❌ Save workout error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
