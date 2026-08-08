import { Router } from "express";

import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallanStatus,
} from "../controllers/challanController";

import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getChallans
);

router.get(
  "/:id",
  authenticateToken,
  getChallanById
);

router.post(
  "/",
  authenticateToken,
  createChallan
);

router.put(
  "/:id/status",
  authenticateToken,
  updateChallanStatus
);

export default router;