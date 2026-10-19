import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/users.routes.js';

const router = Router();

router.get('/health', (_req, res) =>
  res.json({ success: true, status: 'ok', uptime: process.uptime() }),
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Sprint 2: clients, brands, teams, requirements ...
// Sprint 3: briefs, strategies, plans ...
// Sprint 4: tasks, content, reviews, approvals ...

export default router;
