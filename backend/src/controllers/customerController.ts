import { Request, Response } from "express";
import pool from "../db/database";

// Get all customers
export const getCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(
      "SELECT * FROM customers ORDER BY id DESC"
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      message: "Failed to fetch customers",
    });
  }
};

// Get customer by ID
export const getCustomerById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM customers WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      message: "Failed to fetch customer",
    });
  }
};

// Create customer
export const createCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      customer_name,
      mobile,
      email,
      business_name,
      gst_number,
      customer_type,
      address,
      status,
      follow_up_date,
      notes,
    } = req.body;

    if (!customer_name || !mobile || !customer_type) {
      return res.status(400).json({
        message:
          "Customer name, mobile and customer type are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO customers
      (
        customer_name,
        mobile,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        customer_name,
        mobile,
        email || null,
        business_name || null,
        gst_number || null,
        customer_type,
        address || null,
        status || "LEAD",
        follow_up_date || null,
        notes || null,
      ]
    );

    return res.status(201).json({
      message: "Customer created successfully",
      customer: result.rows[0],
    });
  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      message: "Failed to create customer",
    });
  }
};

// Update customer
export const updateCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      customer_name,
      mobile,
      email,
      business_name,
      gst_number,
      customer_type,
      address,
      status,
      follow_up_date,
      notes,
    } = req.body;

    const result = await pool.query(
      `UPDATE customers
       SET customer_name = $1,
           mobile = $2,
           email = $3,
           business_name = $4,
           gst_number = $5,
           customer_type = $6,
           address = $7,
           status = $8,
           follow_up_date = $9,
           notes = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        customer_name,
        mobile,
        email || null,
        business_name || null,
        gst_number || null,
        customer_type,
        address || null,
        status || "LEAD",
        follow_up_date || null,
        notes || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      message: "Customer updated successfully",
      customer: result.rows[0],
    });
  } catch (error) {
    console.error("Update customer error:", error);

    return res.status(500).json({
      message: "Failed to update customer",
    });
  }
};

// Delete customer
export const deleteCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM customers WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    return res.status(500).json({
      message: "Failed to delete customer",
    });
  }
};