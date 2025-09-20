import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;
dotenv.config();

mongoose.connect(process.env.DB_URL)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from HackRice25 server!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
