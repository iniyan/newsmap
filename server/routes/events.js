const express = require('express');
const { getEvents, getEventById } = require('../services/store');

const router = express.Router();

// GET /api/events?category=politics&swLat=&swLng=&neLat=&neLng=
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

  // Cache for 2 min, allow stale for 5 min while revalidating
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
  res.json({ events, count: events.length });
});

// GET /api/events/:id
router.get('/:id', (req, res) => {
  const event = getEventById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.set('Cache-Control', 'public, max-age=300');
  res.json(event);
});

module.exports = router;
