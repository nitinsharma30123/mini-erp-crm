import { Request, Response } from "express";
import pool from "../db/database";

// Get stock movement history
export const getStockMovements = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(
      `SELECT
        sm.id,
        sm.product_id,
        p.product_name,
        p.sku,
        sm.quantity_changed,
        sm.movement_type,
        sm.reason,
        sm.created_by,
        sm.created_at
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.id
       ORDER BY sm.id DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get stock movements error:", error);

    return res.status(500).json({
      message: "Failed to fetch stock movements",
    });
  }
};

// Create stock movement
export const createStockMovement = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const {
      product_id,
      quantity_changed,
      movement_type,
      reason,
    } = req.body;

    const userId = (req as any).user?.id;

    if (
      !product_id ||
      !quantity_changed ||
      !movement_type ||
      !reason
    ) {
      return res.status(400).json({
        message:
          "Product, quantity, movement type and reason are required",
      });
    }

    if (!["IN", "OUT"].includes(movement_type)) {
      return res.status(400).json({
        message: "Movement type must be IN or OUT",
      });
    }

    if (quantity_changed <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    await client.query("BEGIN");

    const productResult = await client.query(
      "SELECT id, current_stock FROM products WHERE id = $1 FOR UPDATE",
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Product not found",
      });
    }

    const currentStock =
      productResult.rows[0].current_stock;

    let newStock = currentStock;

    if (movement_type === "IN") {
      newStock = currentStock + quantity_changed;
    } else {
      if (currentStock < quantity_changed) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "Insufficient stock",
          current_stock: currentStock,
        });
      }

      newStock = currentStock - quantity_changed;
    }

    await client.query(
      `UPDATE products
       SET current_stock = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newStock, product_id]
    );

    const movementResult = await client.query(
      `INSERT INTO stock_movements
       (
         product_id,
         quantity_changed,
         movement_type,
         reason,
         created_by
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        product_id,
        quantity_changed,
        movement_type,
        reason,
        userId || null,
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Stock movement created successfully",
      movement: movementResult.rows[0],
      new_stock: newStock,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create stock movement error:", error);

    return res.status(500).json({
      message: "Failed to create stock movement",
    });
  } finally {
    client.release();
  }
};
