import { Router } from "express";

import {
  getStockMovements,
  createStockMovement,
} from "../controllers/stockMovementController";

import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getStockMovements
);

router.post(
  "/",
  authenticateToken,
  createStockMovement
);

export default router;