import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import userQuizFormRoutes from './routes/userQuizFormRoutes.js';
import tutorialRoutes from './routes/tutorialRoutes.js';
import twelveLabsRoutes from './routes/twelveLabsRoutes.js';
import videoCDNRoutes from './routes/videoCDNRoutes.js'
import twelveLabsRoutes from './routes/twelveLabsRoutes.js';
import { initializeVideoStream } from './controllers/videoStreamController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log('MongoDB connected successfully');
    initializeVideoStream(mongoose.connection.db);
  })
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/quiz', userQuizFormRoutes);
app.use('/api/videos', videoCDNRoutes);
app.use('/api/twelvelabs', twelveLabsRoutes);
app.use('/api/tutorials', tutorialRoutes);

app.get('/', (req, res) => {
  res.send('Hello from HackRice25 server!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
