import { Router } from 'express';
import { videoStreamGet } from '../controllers/videoStreamController.js';

const router = Router();

router.get('/:filename', videoStreamGet);

export default router;