import { useState } from "react";

type LoginProps = {
  onLogin: (token: string) => void;
};

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://mini-erp-crm-api-0zu8.onrender.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      localStorage.setItem("token", data.token);

      onLogin(data.token);
    } catch (error: any) {
      setError(
        error.message || "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          M
        </div>

        <h1>Mini ERP</h1>

        <p className="login-subtitle">
          Sign in to your CRM dashboard
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            placeholder="admin@minierp.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        <p className="login-footer">
          Mini ERP CRM Management System
        </p>
      </div>
    </div>
  );
}

export default Login;
