# fitness-logger
Fitness Logger is a full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js) that helps users track workouts, monitor progress, and stay motivated on their fitness journey.

2. Backend Setup
cd server
npm init -y
npm install express cors dotenv cookie-parser jsonwebtoken mongodb axios nodemon


Create a .env file in the server/ directory:

PORT=4000
MONGO_URI=mongodb://localhost:27017/fitness_logger
JWT_SECRET=replace_with_a_strong_secret
PESU_AUTH_URL=https://pesu-auth.onrender.com
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development


✅ Start backend:

npm run dev
