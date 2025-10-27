import { Router } from 'express';
import { upload } from '../middlewares/upload';
import { uploadImage, uploadCsvFile, uploadCsvFromUrl } from '../controllers/upload.controller';
import { validate } from '../middlewares/validate';
import { uploadCsvFromUrlSchema } from '../validations/upload.validation';

const router = Router();

router.post('/images', upload.single('file'), uploadImage);
router.post('/csv', upload.single('file'), uploadCsvFile);
router.post('/csv-url', validate(uploadCsvFromUrlSchema), uploadCsvFromUrl);

export default router;
