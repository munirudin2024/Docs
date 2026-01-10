import { Router } from 'express';
import * as auditController from '../controllers/audit.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Semua route audit memerlukan autentikasi
router.use(authenticateToken);

// Get all audit logs
router.get('/', auditController.getAllAuditLogs);

// Get audit logs by item
router.get('/item/:itemId', auditController.getAuditLogsByItem);

// Get audit logs by user
router.get('/user/:userId', auditController.getAuditLogsByUser);

export default router;
