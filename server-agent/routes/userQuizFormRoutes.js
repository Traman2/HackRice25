import { Router } from 'express';
import { createUserQuizForm, getUserQuizForm } from '../controllers/userQuizFormController.js';

const router = Router();

router.post('/', createUserQuizForm);
router.get('/:uid', getUserQuizForm);

export default router;
