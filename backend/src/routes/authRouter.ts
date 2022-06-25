import express from 'express';
import { register } from 'src/controllers/auth';

const router = express.Router();

router.route('/register').post(register);

export default router;
