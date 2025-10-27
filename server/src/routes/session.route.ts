import { Router } from 'express';
import { createSession, getSession } from '../controllers/session.controller';
import { validate } from '../middlewares/validate';
import { createSessionSchema } from '../validations/session.validation';

const router = Router();

router.post('/', validate(createSessionSchema), createSession);
router.get('/:sessionId', getSession);

export default router;
