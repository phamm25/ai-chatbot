import { Router } from 'express';
import { postMessage } from '../controllers/chat.controller';
import { validate } from '../middlewares/validate';
import { postMessageSchema } from '../validations/chat.validation';

const router = Router({ mergeParams: true });

router.post('/', validate(postMessageSchema), postMessage);

export default router;
