-- ============================================
-- MINI ERP + CRM DATABASE SCHEMA
-- ============================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    business_name VARCHAR(150),
    gst_number VARCHAR(50),
    customer_type VARCHAR(20) NOT NULL
        CHECK (customer_type IN ('RETAIL', 'WHOLESALE', 'DISTRIBUTOR')),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'LEAD'
        CHECK (status IN ('LEAD', 'ACTIVE', 'INACTIVE')),
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    minimum_stock_alert_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (minimum_stock_alert_quantity >= 0),
    warehouse_location VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL
        REFERENCES products(id),
    quantity_changed INTEGER NOT NULL
        CHECK (quantity_changed > 0),
    movement_type VARCHAR(10) NOT NULL
        CHECK (movement_type IN ('IN', 'OUT')),
    reason TEXT NOT NULL,
    created_by INTEGER
        REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CHALLANS
CREATE TABLE IF NOT EXISTS challans (
    id SERIAL PRIMARY KEY,
    challan_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL
        REFERENCES customers(id),
    total_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (total_quantity >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
    created_by INTEGER NOT NULL
        REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. CHALLAN ITEMS
CREATE TABLE IF NOT EXISTS challan_items (
    id SERIAL PRIMARY KEY,
    challan_id INTEGER NOT NULL
        REFERENCES challans(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL
        REFERENCES products(id),

    -- Product snapshot
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,

    quantity INTEGER NOT NULL
        CHECK (quantity > 0),

    total_price NUMERIC(12, 2) NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_name
ON customers(customer_name);

CREATE INDEX IF NOT EXISTS idx_products_sku
ON products(sku);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product
ON stock_movements(product_id);

CREATE INDEX IF NOT EXISTS idx_challans_customer
ON challans(customer_id);

CREATE INDEX IF NOT EXISTS idx_challans_status
ON challans(status);

CREATE INDEX IF NOT EXISTS idx_challan_items_challan
ON challan_items(challan_id);
