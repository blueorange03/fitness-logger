const { connect } = require('../db');
const { ObjectId } = require('mongodb');

async function createWorkout(req, res) {
  try {
    const db = await connect();
    const payload = req.body;
    if (!payload || !payload.exercises) return res.status(400).json({ message: 'Invalid workout' });

    const doc = {
      userId: new ObjectId(req.user._id),
      date: payload.date ? new Date(payload.date) : new Date(),
      type: payload.type || 'General',
      exercises: payload.exercises,
      durationMin: payload.durationMin || 0,
      calories: payload.calories || 0,
      createdAt: new Date()
    };
    const r = await db.collection('workouts').insertOne(doc);
    res.json({ status: true, workoutId: r.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Create workout failed' });
  }
}

async function getWorkouts(req, res) {
  try {
    const db = await connect();
    const userId = new ObjectId(req.user._id);
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(100, parseInt(req.query.limit || '20'));
    const skip = (page - 1) * limit;

    const cursor = db.collection('workouts').find({ userId }).sort({ date: -1 }).skip(skip).limit(limit);
    const items = await cursor.toArray();
    res.json({ items, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fetch workouts failed' });
  }
}

async function getWorkoutById(req, res) {
  try {
    const db = await connect();
    const id = req.params.id;
    const doc = await db.collection('workouts').findOne({ _id: new ObjectId(id) , userId: new ObjectId(req.user._id)});
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fetch workout failed' });
  }
}

async function deleteWorkout(req, res) {
  try {
    const db = await connect();
    const id = req.params.id;
    await db.collection('workouts').deleteOne({ _id: new ObjectId(id), userId: new ObjectId(req.user._id) });
    res.json({ status: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete workout failed' });
  }
}

module.exports = { createWorkout, getWorkouts, getWorkoutById, deleteWorkout };
