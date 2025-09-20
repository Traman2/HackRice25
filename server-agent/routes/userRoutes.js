import { Router } from 'express';
import { createUser, getUser } from '../controllers/userController.js';

const router = Router();

app.post('/api/users', createUser);
app.get('/api/users/:uid', getUser);

export default router;