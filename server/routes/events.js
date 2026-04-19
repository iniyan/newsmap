const express = require('express');
const { getEvents, getEventById, toggleLike, toggleBookmark } = require('../services/store');

const router = express.Router();

// GET /api/events?category=politics
router.get('/', (req, res) => {
  const { category, swLat, swLng, neLat, neLng } = req.query;
  let bounds;
  if (swLat && swLng && neLat && neLng) {
    bounds = {
      sw: { lat: parseFloat(swLat), lng: parseFloat(swLng) },
      ne: { lat: parseFloat(neLat), lng: parseFloat(neLng) },
    };
  }
  const events = getEvents({ category, bounds });
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
  res.json({ events, count: events.length });
});

// GET /api/events/:id
router.get('/:id', (req, res) => {
  const event = getEventById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.set('Cache-Control', 'public, max-age=30');
  res.json(event);
});

// POST /api/events/:id/like
router.post('/:id/like', (req, res) => {
  const eng = toggleLike(req.params.id);
  if (!eng) return res.status(404).json({ error: 'Event not found' });
  res.json(eng);
});

// POST /api/events/:id/bookmark
router.post('/:id/bookmark', (req, res) => {
  const eng = toggleBookmark(req.params.id);
  if (!eng) return res.status(404).json({ error: 'Event not found' });
  res.json(eng);
});

module.exports = router;
