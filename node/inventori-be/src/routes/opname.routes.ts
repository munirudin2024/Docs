import { Router } from 'express';
import { body } from 'express-validator';
import * as opnameController from '../controllers/opname.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Get all stock opname
router.get('/', opnameController.getAllStockOpname);

// Get stock opname audit by item code
router.get('/audit/:code', opnameController.getStockOpnameAudit);

// Get pallets
router.get('/pallets', opnameController.getPallets);

// Create stock opname
router.post(
  '/',
  [
    body('warehouse').trim().notEmpty().withMessage('Warehouse harus diisi'),
    body('code').trim().notEmpty().withMessage('Kode harus diisi'),
    body('counted_qty').isInt({ min: 0 }).withMessage('Counted qty harus >= 0'),
  ],
  opnameController.createStockOpname
);

export default router;
