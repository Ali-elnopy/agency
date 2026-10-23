import app from '../src/app.js';

// Vercel serverless entry point. Requests to /api/* are routed to this
// catch-all function, and Express receives the original path (/api/...).
export default app;
