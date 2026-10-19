import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as c from './users.controller.js';
import * as v from './users.validation.js';

const router = Router();

// كل إدارة المستخدمين للـ Admin بس (enforced في الـ backend)
router.use(authenticate, authorize('ADMIN'));

router.get('/', validate({ query: v.listUsersQuery }), c.list);
router.post('/', validate({ body: v.createUserSchema }), c.create);
router.get('/:id', validate({ params: v.idParam }), c.getById);
router.patch('/:id', validate({ params: v.idParam, body: v.updateUserSchema }), c.update);

export default router;
