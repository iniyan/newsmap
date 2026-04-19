require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ingestAllFeeds } = require('./services/ingestion');
const eventsRouter = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — allow Vercel domains + localhost in dev
const allowedOrigins = [
  'http://localhost:3000',
  /^https:\/\/.*\.vercel\.app$/,
];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow server-to-server / curl
    const allowed = allowedOrigins.some((o) =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    cb(allowed ? null : new Error('Not allowed by CORS'), allowed);
  },
}));

// Rate limiting — 100 req/min per IP
app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
}));

app.use(express.json());

app.use('/api/events', eventsRouter);

app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  env: process.env.NODE_ENV || 'development',
  uptime: Math.floor(process.uptime()),
}));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  const status = err.status || 500;
  res.status(status).json({ error: isProd ? 'Internal server error' : err.message });
});

// Initial ingest on startup, then every 10 minutes
ingestAllFeeds();
setInterval(ingestAllFeeds, 10 * 60 * 1000);

app.listen(PORT, () => console.log(`NewsMap server running on :${PORT} (${process.env.NODE_ENV || 'development'})`));
