import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Health check — confirms the server is reachable from the frontend.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Register feature routes here ──────────────────────────────────────────
// import { wasteRouter } from './routes/waste.js';
// app.use('/api/waste', wasteRouter);

app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`);
});

export default app;
