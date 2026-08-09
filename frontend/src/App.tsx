import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Login from "./Login";
import "./App.css";

type Page =
  | "dashboard"
  | "customers"
  | "products"
  | "inventory"
  | "challans";

type Customer = {
  id: number;
  customer_name: string;
  mobile: string;
  email?: string;
  business_name?: string;
  customer_type?: string;
  address?: string;
  status?: string;
};

type Product = {
  id: number;
  product_name: string;
  sku: string;
  category?: string;
  unit_price: number | string;
  current_stock: number;
  minimum_stock_alert_quantity: number;
  warehouse_location?: string;
};

type StockMovement = {
  id: number;
  product_id: number;
  product_name: string;
  sku?: string;
  quantity_changed: number;
  movement_type: "IN" | "OUT";
  reason: string;
  created_by?: number;
  created_at?: string;
};

type Challan = {
  id: number;
  challan_number: string;
  customer_id: number;
  customer_name?: string;
  total_quantity: number;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  created_by?: number;
  created_at?: string;
};

/* =====================================================
   APP
===================================================== */

function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const handleLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const menu = [
    {
      id: "dashboard" as Page,
      label: "Dashboard",
      icon: "▦",
    },
    {
      id: "customers" as Page,
      label: "Customers",
      icon: "👥",
    },
    {
      id: "products" as Page,
      label: "Products",
      icon: "📦",
    },
    {
      id: "inventory" as Page,
      label: "Inventory",
      icon: "↕",
    },
    {
      id: "challans" as Page,
      label: "Challans",
      icon: "📄",
    },
  ];

  const currentPage =
    menu.find((item) => item.id === page)?.label || "Dashboard";

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            M
          </div>

          <div>
            <h2>Mini ERP</h2>
            <span>CRM System</span>
          </div>

        </div>

        <nav>

          {menu.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                page === item.id ? "active" : ""
              }`}
              onClick={() => setPage(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <div className="user-card">

            <div className="avatar">
              A
            </div>

            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main">

        <header className="topbar">

          <div>

            <h1>
              {currentPage}
            </h1>

            <p>
              Manage your business from one place
            </p>

          </div>

          <div className="topbar-right">

            <div className="notification">
              🔔
            </div>

            <div className="profile">
              Admin
            </div>

          </div>

        </header>

        {page === "dashboard" && (
          <Dashboard />
        )}

        {page === "customers" && (
          <Customers />
        )}

        {page === "products" && (
          <Products />
        )}

        {page === "inventory" && (
          <Inventory />
        )}

        {page === "challans" && (
          <Challans />
        )}

      </main>

    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  icon,
  text,
}: {
  title: string;
  value: string;
  icon: string;
  text: string;
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <span>{title}</span>

        <strong>{value}</strong>

        <small>{text}</small>

      </div>

    </div>
  );
}

/* =====================================================
   DASHBOARD - REAL API
===================================================== */

function Dashboard() {

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [challans, setChallans] =
    useState<Challan[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchDashboardData = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        customersResponse,
        productsResponse,
        challansResponse,
      ] = await Promise.all([

       fetch(
  "https://mini-erp-crm-api-0zu8.onrender.com/api/customers",
  {
            method: "GET",
            headers,
          }
        ),

        fetch(
          "https://mini-erp-crm-api-0zu8.onrender.com/api/products",
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          "https://mini-erp-crm-api-0zu8.onrender.com/api/challans",
          {
            method: "GET",
            headers,
          }
        ),

      ]);

      const customersData =
        await customersResponse.json();

      const productsData =
        await productsResponse.json();

      const challansData =
        await challansResponse.json();

      if (!customersResponse.ok) {
        throw new Error(
          customersData.message ||
            "Failed to load customers"
        );
      }

      if (!productsResponse.ok) {
        throw new Error(
          productsData.message ||
            "Failed to load products"
        );
      }

      if (!challansResponse.ok) {
        throw new Error(
          challansData.message ||
            "Failed to load challans"
        );
      }

      setCustomers(
        Array.isArray(customersData)
          ? customersData
          : []
      );

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : []
      );

      setChallans(
        Array.isArray(challansData)
          ? challansData
          : []
      );

    } catch (err: any) {

      setError(
        err.message ||
          "Unable to load dashboard"
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalCustomers =
    customers.length;

  const totalProducts =
    products.length;

  const currentStock =
    products.reduce(
      (total, product) =>
        total +
        Number(product.current_stock || 0),
      0
    );

  const confirmedChallans =
    challans.filter(
      (challan) =>
        challan.status === "CONFIRMED"
    );

  const lowStockProducts =
    products.filter(
      (product) =>
        Number(product.current_stock || 0) <=
        Number(
          product.minimum_stock_alert_quantity || 0
        )
    );

  const recentChallans =
    [...challans]
      .sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ).getTime() -
          new Date(
            a.created_at || 0
          ).getTime()
      )
      .slice(0, 5);

  return (
    <div className="content">

      {/* WELCOME */}

      <div className="welcome">

        <div>

          <h2>
            Welcome back, Admin 👋
          </h2>

          <p>
            Here is what's happening with
            your business today.
          </p>

        </div>

        <div className="date-box">
          August 9, 2026
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            padding: "15px 20px",
            marginBottom: "20px",
            color: "#dc2626",
            background: "#fee2e2",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      {/* STATS */}

      <div className="stats-grid">

        <StatCard
          title="Total Customers"
          value={
            loading
              ? "..."
              : String(totalCustomers)
          }
          icon="👥"
          text="Active CRM records"
        />

        <StatCard
          title="Total Products"
          value={
            loading
              ? "..."
              : String(totalProducts)
          }
          icon="📦"
          text="Products in inventory"
        />

        <StatCard
          title="Current Stock"
          value={
            loading
              ? "..."
              : String(currentStock)
          }
          icon="📊"
          text="Total available units"
        />

        <StatCard
          title="Challans"
          value={
            loading
              ? "..."
              : String(
                  confirmedChallans.length
                )
          }
          icon="📄"
          text="Confirmed challans"
        />

      </div>

      {/* LOWER DASHBOARD */}

      <div className="dashboard-grid">

        {/* RECENT CHALLANS */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Recent Challans
              </h3>

              <p>
                Latest sales activity
              </p>

            </div>

            <button
              className="view-btn"
              onClick={fetchDashboardData}
            >
              ↻ Refresh
            </button>

          </div>

          {loading && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >
              Loading dashboard...
            </div>
          )}

          {!loading &&
            recentChallans.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                No challans found.
              </div>
            )}

          {!loading &&
            recentChallans.length > 0 && (

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>
                      <th>Challan</th>
                      <th>Customer</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {recentChallans.map(
                      (challan) => (

                        <tr
                          key={challan.id}
                        >

                          <td>
                            {
                              challan.challan_number
                            }
                          </td>

                          <td>
                            {
                              challan.customer_name ||
                              `Customer #${challan.customer_id}`
                            }
                          </td>

                          <td>
                            {
                              challan.total_quantity
                            }
                          </td>

                          <td>

                            <span
                              className={
                                challan.status ===
                                "CONFIRMED"
                                  ? "badge success"
                                  : challan.status ===
                                    "DRAFT"
                                  ? "badge warning"
                                  : "badge danger-badge"
                              }
                            >
                              {
                                challan.status
                              }
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </div>

        {/* LOW STOCK */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Low Stock Alert
              </h3>

              <p>
                Products needing attention
              </p>

            </div>

          </div>

          {loading && (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
              }}
            >
              Loading...
            </div>
          )}

          {!loading &&
            lowStockProducts.length === 0 && (

              <div className="empty-alert">
                ✓ No critical stock alerts
              </div>

            )}

          {!loading &&
            lowStockProducts.length > 0 && (

              <>
                {lowStockProducts
                  .slice(0, 5)
                  .map((product) => (

                    <div
                      className="alert-item"
                      key={product.id}
                    >

                      <div className="product-icon">
                        📦
                      </div>

                      <div>

                        <strong>
                          {
                            product.product_name
                          }
                        </strong>

                        <span>
                          Current stock:{" "}
                          {
                            product.current_stock
                          }
                        </span>

                      </div>

                      <span className="badge warning">
                        {
                          product.current_stock
                        }{" "}
                        units
                      </span>

                    </div>

                  ))}
              </>

            )}

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   CUSTOMERS
===================================================== */

function Customers() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    mobile: "",
    email: "",
    business_name: "",
    gst_number: "",
    customer_type: "RETAIL",
    address: "",
    status: "LEAD",
    follow_up_date: "",
    notes: "",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "https://mini-erp-crm-api-0zu8.onrender.com/api/customers",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch customers"
        );
      }

      setCustomers(
        Array.isArray(data) ? data : []
      );
    } catch (err: any) {
      setError(
        err.message ||
          "Unable to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "https://mini-erp-crm-api-0zu8.onrender.com/api/customers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            follow_up_date:
              form.follow_up_date || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create customer"
        );
      }

      setForm({
        customer_name: "",
        mobile: "",
        email: "",
        business_name: "",
        gst_number: "",
        customer_type: "RETAIL",
        address: "",
        status: "LEAD",
        follow_up_date: "",
        notes: "",
      });

      setShowAddForm(false);
      await fetchCustomers();
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to create customer"
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers =
    customers.filter((customer) => {
      const text = search.toLowerCase();

      return (
        customer.customer_name
          ?.toLowerCase()
          .includes(text) ||
        customer.mobile
          ?.toString()
          .includes(text) ||
        customer.email
          ?.toLowerCase()
          .includes(text) ||
        customer.business_name
          ?.toLowerCase()
          .includes(text)
      );
    });

  return (
    <div className="content">
      <div className="page-actions">
        <div>
          <h2>Customers</h2>
          <p>
            Manage your customer relationships
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            className="primary-btn"
            onClick={() =>
              setShowAddForm(true)
            }
          >
            + Add Customer
          </button>

          <button
            className="primary-btn"
            onClick={fetchCustomers}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="panel">
        {showAddForm && (
          <div
            style={{
              padding: "20px",
              marginBottom: "20px",
              borderBottom:
                "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                marginBottom: "16px",
              }}
            >
              Add Customer
            </h3>

            <form
              onSubmit={handleAddCustomer}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "14px",
                }}
              >
                <input
                  className="search"
                  placeholder="Customer Name *"
                  value={form.customer_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      customer_name:
                        e.target.value,
                    })
                  }
                  required
                />

                <input
                  className="search"
                  placeholder="Mobile *"
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mobile: e.target.value,
                    })
                  }
                  required
                />

                <input
                  className="search"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />

                <input
                  className="search"
                  placeholder="Business Name"
                  value={form.business_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      business_name:
                        e.target.value,
                    })
                  }
                />

                <input
                  className="search"
                  placeholder="GST Number"
                  value={form.gst_number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gst_number:
                        e.target.value,
                    })
                  }
                />

                <select
                  className="search"
                  value={form.customer_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      customer_type:
                        e.target.value,
                    })
                  }
                  required
                >
                  <option value="RETAIL">
                    Retail
                  </option>
                  <option value="WHOLESALE">
                    Wholesale
                  </option>
                  <option value="DISTRIBUTOR">
                    Distributor
                  </option>
                </select>

                <select
                  className="search"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="LEAD">
                    Lead
                  </option>
                  <option value="ACTIVE">
                    Active
                  </option>
                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>

                <input
                  className="search"
                  type="date"
                  value={form.follow_up_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      follow_up_date:
                        e.target.value,
                    })
                  }
                />

                <input
                  className="search"
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: e.target.value,
                    })
                  }
                />

                <input
                  className="search"
                  placeholder="Notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes: e.target.value,
                    })
                  }
                />
              </div>

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Customer"}
                </button>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() =>
                    setShowAddForm(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="search-row">
          <input
            className="search"
            placeholder="Search customers..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {loading && (
          <div className="loading">
            Loading customers...
          </div>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          filteredCustomers.length === 0 && (
            <div className="empty">
              No customers found.
            </div>
          )}

        {!loading &&
          !error &&
          filteredCustomers.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Business</th>
                    <th>Mobile</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Address</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map(
                    (customer) => (
                      <tr key={customer.id}>
                        <td>
                          <strong>
                            {customer.customer_name}
                          </strong>

                          <span className="table-sub">
                            {customer.email ||
                              "No email"}
                          </span>
                        </td>

                        <td>
                          {customer.business_name ||
                            "-"}
                        </td>

                        <td>
                          {customer.mobile}
                        </td>

                        <td>
                          {customer.customer_type ||
                            "-"}
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              customer.status ===
                              "ACTIVE"
                                ? "success"
                                : customer.status ===
                                  "LEAD"
                                ? "warning"
                                : "danger-badge"
                            }`}
                          >
                            {customer.status ||
                              "-"}
                          </span>
                        </td>

                        <td>
                          {customer.address ||
                            "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}

/* =====================================================
   PRODUCTS
===================================================== */

function Products() {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const fetchProducts = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "https://mini-erp-crm-api-0zu8.onrender.com/api/products",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to fetch products"
        );

      }

      setProducts(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err: any) {

      setError(
        err.message ||
          "Unable to load products"
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts =
    products.filter((product) => {

      const text =
        search.toLowerCase();

      return (
        product.product_name
          ?.toLowerCase()
          .includes(text) ||
        product.sku
          ?.toLowerCase()
          .includes(text) ||
        product.category
          ?.toLowerCase()
          .includes(text)
      );

    });

  return (
    <div className="content">

      <div className="page-actions">

        <div>

          <h2>
            Products
          </h2>

          <p>
            Manage products and pricing
          </p>

        </div>

        <button
          className="primary-btn"
          onClick={fetchProducts}
        >
          ↻ Refresh
        </button>

      </div>

      <div className="panel">

        <div className="search-row">

          <input
            className="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {loading && (
          <div className="loading">
            Loading products...
          </div>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="empty">
              No products found.
            </div>
          )}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Min Alert</th>
                    <th>Location</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredProducts.map(
                    (product) => (

                      <tr key={product.id}>

                        <td>
                          <strong>
                            {
                              product.product_name
                            }
                          </strong>
                        </td>

                        <td>
                          {product.sku}
                        </td>

                        <td>
                          {
                            product.category ||
                            "-"
                          }
                        </td>

                        <td>
                          ₹
                          {Number(
                            product.unit_price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td>

                          {product.current_stock <=
                          product.minimum_stock_alert_quantity ? (

                            <span className="badge warning">
                              {
                                product.current_stock
                              }{" "}
                              units
                            </span>

                          ) : (

                            <span className="stock-good">
                              {
                                product.current_stock
                              }{" "}
                              units
                            </span>

                          )}

                        </td>

                        <td>
                          {
                            product.minimum_stock_alert_quantity
                          }
                        </td>

                        <td>
                          {
                            product.warehouse_location ||
                            "-"
                          }
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>

    </div>
  );
}

/* =====================================================
   INVENTORY
===================================================== */

function Inventory() {

  const [movements, setMovements] =
    useState<StockMovement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchMovements = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "https://mini-erp-crm-api-0zu8.onrender.com/api/stock-movements",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to fetch stock movements"
        );

      }

      setMovements(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err: any) {

      setError(
        err.message ||
          "Unable to load stock movements"
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const totalIn =
    movements
      .filter(
        (movement) =>
          movement.movement_type === "IN"
      )
      .reduce(
        (total, movement) =>
          total +
          Number(
            movement.quantity_changed || 0
          ),
        0
      );

  const totalOut =
    movements
      .filter(
        (movement) =>
          movement.movement_type === "OUT"
      )
      .reduce(
        (total, movement) =>
          total +
          Number(
            movement.quantity_changed || 0
          ),
        0
      );

  return (
    <div className="content">

      <div className="page-actions">

        <div>

          <h2>
            Inventory
          </h2>

          <p>
            Track stock movements
          </p>

        </div>

        <button
          className="primary-btn"
          onClick={fetchMovements}
        >
          ↻ Refresh
        </button>

      </div>

      <div className="stats-grid">

        <StatCard
          title="Total Movements"
          value={String(
            movements.length
          )}
          icon="📦"
          text="Inventory transactions"
        />

        <StatCard
          title="Stock IN"
          value={String(totalIn)}
          icon="↗"
          text="Units received"
        />

        <StatCard
          title="Stock OUT"
          value={String(totalOut)}
          icon="↘"
          text="Units sold"
        />

      </div>

      <div className="panel">

        <div className="panel-header">

          <div>

            <h3>
              Stock Movement History
            </h3>

            <p>
              Recent inventory transactions
            </p>

          </div>

        </div>

        {loading && (
          <div className="loading">
            Loading stock movements...
          </div>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          movements.length === 0 && (
            <div className="empty">
              No stock movements found.
            </div>
          )}

        {!loading &&
          !error &&
          movements.length > 0 && (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                    <th>Created By</th>
                    <th>Date</th>
                  </tr>

                </thead>

                <tbody>

                  {movements.map(
                    (movement) => (

                      <tr
                        key={movement.id}
                      >

                        <td>
                          <strong>
                            {
                              movement.product_name
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            movement.sku ||
                            "-"
                          }
                        </td>

                        <td>

                          <span
                            className={
                              movement.movement_type ===
                              "IN"
                                ? "badge success"
                                : "badge danger-badge"
                            }
                          >
                            {
                              movement.movement_type
                            }
                          </span>

                        </td>

                        <td>
                          {
                            movement.quantity_changed
                          }
                        </td>

                        <td>
                          {movement.reason}
                        </td>

                        <td>
                          {
                            movement.created_by ||
                            "-"
                          }
                        </td>

                        <td>

                          {
                            movement.created_at
                              ? new Date(
                                  movement.created_at
                                ).toLocaleString(
                                  "en-IN"
                                )
                              : "-"
                          }

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>

    </div>
  );
}

/* =====================================================
   CHALLANS
===================================================== */

function Challans() {

  const [challans, setChallans] =
    useState<Challan[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const fetchChallans = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "https://mini-erp-crm-api-0zu8.onrender.com/api/challans",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to fetch challans"
        );

      }

      setChallans(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err: any) {

      setError(
        err.message ||
          "Unable to load challans"
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  const filteredChallans =
    challans.filter((challan) => {

      const text =
        search.toLowerCase();

      const matchesSearch =
        challan.challan_number
          ?.toLowerCase()
          .includes(text) ||
        challan.customer_name
          ?.toLowerCase()
          .includes(text);

      const matchesStatus =
        statusFilter === "ALL" ||
        challan.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );

    });

  return (
    <div className="content">

      <div className="page-actions">

        <div>

          <h2>
            Challans
          </h2>

          <p>
            Manage sales challans
          </p>

        </div>

        <button
          className="primary-btn"
          onClick={fetchChallans}
        >
          ↻ Refresh
        </button>

      </div>

      <div className="panel">

        <div className="search-row">

          <input
            className="search"
            placeholder="Search challans..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >

            <option value="ALL">
              All Status
            </option>

            <option value="DRAFT">
              DRAFT
            </option>

            <option value="CONFIRMED">
              CONFIRMED
            </option>

            <option value="CANCELLED">
              CANCELLED
            </option>

          </select>

        </div>

        {loading && (
          <div className="loading">
            Loading challans...
          </div>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          filteredChallans.length === 0 && (
            <div className="empty">
              No challans found.
            </div>
          )}

        {!loading &&
          !error &&
          filteredChallans.length > 0 && (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      Challan Number
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Total Quantity
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Created By
                    </th>

                    <th>
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredChallans.map(
                    (challan) => (

                      <tr
                        key={challan.id}
                      >

                        <td>

                          <strong>
                            {
                              challan.challan_number
                            }
                          </strong>

                        </td>

                        <td>
                          {
                            challan.customer_name ||
                            `Customer #${challan.customer_id}`
                          }
                        </td>

                        <td>
                          {
                            challan.total_quantity
                          }
                        </td>

                        <td>

                          <span
                            className={
                              challan.status ===
                              "CONFIRMED"
                                ? "badge success"
                                : challan.status ===
                                  "DRAFT"
                                ? "badge warning"
                                : "badge danger-badge"
                            }
                          >
                            {
                              challan.status
                            }
                          </span>

                        </td>

                        <td>
                          {
                            challan.created_by ||
                            "-"
                          }
                        </td>

                        <td>

                          {
                            challan.created_at
                              ? new Date(
                                  challan.created_at
                                ).toLocaleString(
                                  "en-IN"
                                )
                              : "-"
                          }

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>

    </div>
  );
}

export default App;
