import { Router } from "express";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController";

import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticateToken, getCustomers);

router.get("/:id", authenticateToken, getCustomerById);

router.post("/", authenticateToken, createCustomer);

router.put("/:id", authenticateToken, updateCustomer);

router.delete("/:id", authenticateToken, deleteCustomer);

export default router;