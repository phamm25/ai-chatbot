import { Router } from 'express';
import sessionRoute from './session.route';
import chatRoute from './chat.route';
import uploadRoute from './upload.route';

const router = Router();

router.use('/sessions', sessionRoute);
router.use('/sessions/:sessionId/messages', chatRoute);
router.use('/uploads', uploadRoute);

export default router;
