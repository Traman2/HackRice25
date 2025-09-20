import { Router } from 'express';
import { createUser, getUser, updateUser } from '../controllers/userController.js';

const router = Router();

router.post('/', createUser);
router.get('/:uid', getUser);
router.patch('/:uid', updateUser);

export default router;