import { Router } from 'express';
import { createUser, getUser, updateUser } from '../controllers/userController.js';
import { getAgenticDashboardData } from '../controllers/agenticDashboardDataController.js';

const router = Router();

router.post('/', createUser);
router.get('/:uid', getUser);
router.patch('/:uid', updateUser);
router.get('/dashboard/:uid', getAgenticDashboardData);

export default router;