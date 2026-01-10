import { Router } from 'express';
import { body } from 'express-validator';
import * as itemsController from '../controllers/items.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Semua route items memerlukan autentikasi
router.use(authenticateToken);

// Get all items
router.get('/', itemsController.getAllItems);

// Get item by id
router.get('/:id', itemsController.getItemById);

// Search items
router.get('/search/:query', itemsController.searchItems);

// Create item
router.post(
  '/',
  [
    body('kode_barang').trim().notEmpty().withMessage('Kode barang harus diisi'),
    body('nama_barang').trim().notEmpty().withMessage('Nama barang harus diisi'),
    body('qty').isInt({ min: 0 }).withMessage('Qty harus berupa angka positif'),
  ],
  itemsController.createItem
);

// Update item
router.put(
  '/:id',
  [
    body('nama_barang').optional().trim().notEmpty(),
    body('qty').optional().isInt({ min: 0 }),
  ],
  itemsController.updateItem
);

// Delete item
router.delete('/:id', itemsController.deleteItem);

// Scan item
router.post('/scan/:kode_barang', itemsController.scanItem);

export default router;
