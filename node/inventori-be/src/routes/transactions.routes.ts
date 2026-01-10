import { Router } from 'express';
import { body } from 'express-validator';
import * as transactionsController from '../controllers/transactions.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Get all transactions with filters
router.get('/', transactionsController.getAllTransactions);

// Get transactions by item code
router.get('/item/:code', transactionsController.getTransactionsByItem);

// Get statistics
router.get('/statistics', transactionsController.getStatistics);

// Create transaction
router.post(
  '/',
  [
    body('code').trim().notEmpty().withMessage('Kode harus diisi'),
    body('item_name').trim().notEmpty().withMessage('Nama item harus diisi'),
    body('type').isIn(['IN', 'OUT']).withMessage('Type harus IN atau OUT'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity harus > 0'),
    body('requester').trim().notEmpty().withMessage('Requester harus diisi'),
  ],
  transactionsController.createTransaction
);

export default router;
