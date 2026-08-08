import { Router } from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticateToken, getProducts);

router.get("/:id", authenticateToken, getProductById);

router.post("/", authenticateToken, createProduct);

router.put("/:id", authenticateToken, updateProduct);

router.delete("/:id", authenticateToken, deleteProduct);

export default router;
