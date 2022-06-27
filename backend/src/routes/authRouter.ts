import express from 'express';
import { register, login, resetPassword, forgotPassword, me, requireLogin } from 'src/controllers/auth';

const router = express.Router();

router.route('/me').get(requireLogin, me);
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/reset_password/:token').post(resetPassword);
router.route('/forgot_password').post(forgotPassword);

export default router;
