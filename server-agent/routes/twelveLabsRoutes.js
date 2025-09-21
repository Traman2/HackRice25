import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

// Start a lightweight chat "session" (stateless for demo)
router.post('/session/init', async (req, res) => {
  const { tutorialId } = req.body || {};
  const sessionId = `${tutorialId}-${Date.now()}`;
  res.json({ sessionId, tutorialId });
});

// Ask Twelve Labs (or fallback keyword search later)
router.post('/ask', async (req, res) => {
  try {
    const { tutorialId, query, indexId: bodyIndexId, videoId: bodyVideoId, type = 'search' } = req.body || {};
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const tutorialsPath = path.join(__dirname, '..', 'database', 'tutorials.json');
    const tutorials = JSON.parse(fs.readFileSync(tutorialsPath, 'utf-8'));
    const t = tutorials.find((x) => x.tutorial_id === tutorialId);
    if (!t) return res.json({ answer: 'Tutorial not found', hits: [] });

    // Try Twelve Labs first if API key present
    const API_KEY = process.env.TL_API_KEY;
    const INDEX_ID = bodyIndexId || process.env.TL_INDEX_ID;
    const VIDEO_ID = bodyVideoId || process.env.TL_VIDEO_ID;

    if (API_KEY && INDEX_ID && VIDEO_ID) {
      try {
        let endpoint, body, resp, data;

        if (type === 'summarize') {
          // Use summarize endpoint
          endpoint = `https://api.twelvelabs.io/v1.3/summarize`;
          body = {
            video_id: VIDEO_ID,
            type: "summary"
          };
        } else if (type === 'gist') {
          // Use gist endpoint
          endpoint = `https://api.twelvelabs.io/v1.3/gist`;
          body = {
            video_id: VIDEO_ID,
            types: ["title", "topic", "hashtag"]
          };
        } else {
          // Search or highlighted moments → use v1.3 search (multipart/form-data)
          endpoint = `https://api.twelvelabs.io/v1.3/search`;
          body = 'form-data';
        }

        if (body === 'form-data') {
          const fd = new FormData();
          fd.append('index_id', INDEX_ID);
          fd.append('query_text', query);
          // Your index supports only 'visual' and 'audio'
          fd.append('search_options', 'visual');
          fd.append('search_options', 'audio');
          // Do NOT set Content-Type; fetch will add correct boundary
          resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'x-api-key': API_KEY },
            body: fd
          });
        } else {
          resp = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'x-api-key': API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });
        }
        
        data = await resp.json().catch(() => ({}));
        
        if (resp.ok) {
          if (type === 'summarize') {
            return res.json({
              answer: data.summary || data.data || 'Summary generated',
              summary: data.summary || data.data,
              sources: { provider: 'twelvelabs', type: 'summary', indexId: INDEX_ID, videoId: VIDEO_ID }
            });
          } else if (type === 'gist') {
            const gistText = data.title || data.data || 'Gist generated';
            const topics = data.topics || [];
            const hashtags = data.hashtags || [];
            let content = gistText;
            if (topics.length) content += '\n\nTopics: ' + topics.join(', ');
            if (hashtags.length) content += '\n\nHashtags: ' + hashtags.join(', ');
            
            return res.json({
              answer: content,
              gist: gistText,
              topics: topics,
              hashtags: hashtags,
              sources: { provider: 'twelvelabs', type: 'gist', indexId: INDEX_ID, videoId: VIDEO_ID }
            });
          } else if (type === 'highlight') {
            // Try dedicated highlights endpoint first
            try {
              const resp2 = await fetch(`https://api.twelvelabs.io/v1/indexes/${INDEX_ID}/videos/${VIDEO_ID}/highlights`, {
                method: 'POST',
                headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({})
              });
              const data2 = await resp2.json().catch(()=>({}));
              if (resp2.ok) {
                const items = data2.data || data2.highlights || [];
                const hits = (Array.isArray(items)?items:[]).map((h)=>({
                  timestamp: Math.round(h.start || h.start_time || 0),
                  endTime: Math.round(h.end || h.end_time || (h.start||0)+10),
                  label: h.text || h.title || 'highlight'
                }));
                if (hits.length) {
                  return res.json({
                    answer: `Found ${hits.length} highlighted moments`,
                    hits,
                    highlights: hits,
                    sources: { provider: 'twelvelabs', type: 'highlight', indexId: INDEX_ID, videoId: VIDEO_ID }
                  });
                }
              }
            } catch (_e) {
              // fall back to search handling below
            }

            // Fall through to treat as search below
          } else {
            // Handle search results
            const raw = data.data || data.results || [];
            const hits = (Array.isArray(raw) ? raw : []).map((it) => {
              const start = it.start || 0;
              const end = it.end || start + 10;
              const confidence = it.confidence || it.score || 0;
              const text = it.text || it.metadata?.text || it.query || '';
              const videoUrl = it.video_url || '';
              
              return { 
                timestamp: Math.round(start), 
                endTime: Math.round(end),
                label: text,
                confidence: confidence,
                videoUrl: videoUrl,
                thumbnail: it.thumbnail_url || '',
                video_id: it.video_id || VIDEO_ID
              };
            }).filter(h => h.timestamp >= 0);

            if (hits.length) {
              return res.json({
                answer: `Found ${hits.length} moments about "${query}"`,
                hits,
                highlights: hits,
                sources: { provider: 'twelvelabs', type: type, indexId: INDEX_ID, videoId: VIDEO_ID }
              });
            }
          }
        } else {
          console.error('TwelveLabs API error', resp.status, data);
          console.error('Request body:', JSON.stringify(body, null, 2));
          console.error('Endpoint:', endpoint);
        }
      } catch (err) {
        console.error('TwelveLabs request failed', err);
      }
    }

    // Fallback local keyword matcher across event descriptions and code
    const q = (query || '').toLowerCase();
    const hits = [];
    for (const ev of t.events) {
      const hay = JSON.stringify(ev).toLowerCase();
      if (q && hay.includes(q)) {
        hits.push({ timestamp: ev.timestamp, label: ev.type });
      }
    }
    const uniq = [];
    const seen = new Set();
    for (const h of hits.sort((a,b)=>a.timestamp-b.timestamp)) {
      if (!seen.has(h.timestamp)) { seen.add(h.timestamp); uniq.push(h); }
      if (uniq.length >= 5) break;
    }

    res.json({
      answer: uniq.length ? `Found ${uniq.length} relevant points` : 'No exact match; try different wording',
      hits: uniq,
      sources: { provider: API_KEY ? 'twelvelabs-fallback' : 'local-fallback' }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Highlight moments endpoint
router.post('/highlight', async (req, res) => {
  const { query, indexId, videoId } = req.body;
  try {
    const resp = await fetch('/api/tl/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, indexId, videoId, type: 'highlight' })
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Summarize endpoint
router.post('/summarize', async (req, res) => {
  const { indexId, videoId } = req.body;
  try {
    const resp = await fetch('/api/tl/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indexId, videoId, type: 'summarize' })
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gist endpoint
router.post('/gist', async (req, res) => {
  const { indexId, videoId } = req.body;
  try {
    const resp = await fetch('/api/tl/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indexId, videoId, type: 'gist' })
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


