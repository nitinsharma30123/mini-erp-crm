import { Request, Response } from "express";
import pool from "../db/database";

// Get all challans
export const getChallans = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(
      `SELECT
        c.id,
        c.challan_number,
        c.customer_id,
        cu.customer_name,
        c.total_quantity,
        c.status,
        c.created_by,
        c.created_at
       FROM challans c
       JOIN customers cu ON c.customer_id = cu.id
       ORDER BY c.id DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get challans error:", error);

    return res.status(500).json({
      message: "Failed to fetch challans",
    });
  }
};

// Get challan by ID
export const getChallanById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const challanResult = await pool.query(
      `SELECT
        c.id,
        c.challan_number,
        c.customer_id,
        cu.customer_name,
        c.total_quantity,
        c.status,
        c.created_by,
        c.created_at
       FROM challans c
       JOIN customers cu ON c.customer_id = cu.id
       WHERE c.id = $1`,
      [id]
    );

    if (challanResult.rows.length === 0) {
      return res.status(404).json({
        message: "Challan not found",
      });
    }

    const itemsResult = await pool.query(
      `SELECT *
       FROM challan_items
       WHERE challan_id = $1
       ORDER BY id`,
      [id]
    );

    return res.status(200).json({
      challan: challanResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error("Get challan error:", error);

    return res.status(500).json({
      message: "Failed to fetch challan",
    });
  }
};

// Create challan
export const createChallan = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const {
      challan_number,
      customer_id,
      items,
    } = req.body;

    const userId = (req as any).user?.id;

    if (
      !challan_number ||
      !customer_id ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Challan number, customer and at least one item are required",
      });
    }

    await client.query("BEGIN");

    // Check customer
    const customerResult = await client.query(
      "SELECT id FROM customers WHERE id = $1",
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Customer not found",
      });
    }

    let totalQuantity = 0;
    const processedItems = [];

    // Check every product and its stock
    for (const item of items) {
      const productResult = await client.query(
        `SELECT
          id,
          product_name,
          sku,
          unit_price,
          current_stock
         FROM products
         WHERE id = $1
         FOR UPDATE`,
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: `Product ${item.product_id} not found`,
        });
      }

      const product = productResult.rows[0];
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "Item quantity must be a positive integer",
        });
      }

      if (product.current_stock < quantity) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: `Insufficient stock for ${product.product_name}`,
          current_stock: product.current_stock,
          requested_quantity: quantity,
        });
      }

      const totalPrice =
        Number(product.unit_price) * quantity;

      totalQuantity += quantity;

      processedItems.push({
        product_id: product.id,
        product_name: product.product_name,
        sku: product.sku,
        unit_price: product.unit_price,
        quantity,
        total_price: totalPrice,
      });
    }

    // Create challan
    const challanResult = await client.query(
      `INSERT INTO challans
       (
         challan_number,
         customer_id,
         total_quantity,
         status,
         created_by
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        challan_number,
        customer_id,
        totalQuantity,
        "DRAFT",
        userId,
      ]
    );

    const challan = challanResult.rows[0];

    // Create challan items and reduce stock
    for (const item of processedItems) {
      await client.query(
        `INSERT INTO challan_items
         (
           challan_id,
           product_id,
           product_name,
           sku,
           unit_price,
           quantity,
           total_price
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          challan.id,
          item.product_id,
          item.product_name,
          item.sku,
          item.unit_price,
          item.quantity,
          item.total_price,
        ]
      );

      await client.query(
        `UPDATE products
         SET current_stock = current_stock - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Challan created successfully",
      challan,
      items: processedItems,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");

    console.error("Create challan error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Challan number already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create challan",
    });
  } finally {
    client.release();
  }
};

// Update challan status
export const updateChallanStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "DRAFT",
      "CONFIRMED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Status must be DRAFT, CONFIRMED or CANCELLED",
      });
    }

    const result = await pool.query(
      `UPDATE challans
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Challan not found",
      });
    }

    return res.status(200).json({
      message: "Challan status updated successfully",
      challan: result.rows[0],
    });
  } catch (error) {
    console.error("Update challan status error:", error);

    return res.status(500).json({
      message: "Failed to update challan status",
    });
  }
};