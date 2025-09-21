import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

const loadTutorials = () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.join(__dirname, '..', 'database', 'tutorials.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
};

router.get('/list', (req, res) => {
  try {
    const tutorials = loadTutorials();
    const minimal = tutorials.map(t => ({
      tutorial_id: t.tutorial_id,
      title: t.title,
      duration: t.duration,
      videoUrl: t.videoUrl
    }));
    res.json(minimal);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const tutorials = loadTutorials();
    const t = tutorials.find(x => x.tutorial_id === req.params.id);
    if (!t) return res.status(404).json({ message: 'Tutorial not found' });
    res.json(t);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;


