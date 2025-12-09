import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { User, Mail, Phone, MapPin, Store, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

interface StoreType {
  id: number;
  name: string;
  city: string;
  address: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreType[]>([]);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    nearest_store_id: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
    
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => setCities(data))
      .catch(console.error);

    fetch("/api/stores")
      .then((res) => res.json())
      .then((data) => setStores(data))
      .catch(console.error);
  }, [router]);

  useEffect(() => {
    if (formData.city) {
      setFilteredStores(stores.filter((s) => s.city === formData.city));
      setFormData((prev) => ({ ...prev, nearest_store_id: "" }));
    }
  }, [formData.city, stores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            ...formData,
            nearest_store_id: parseInt(formData.nearest_store_id),
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div
        className="glass-card-strong animate-scale-in"
        style={{
          width: "100%",
          maxWidth: isLogin ? "420px" : "500px",
          padding: "48px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "70px", height: "70px", background: "#FFFFFF", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "32px" }}>
            <span style={{ filter: "grayscale(100%)" }}>🛍️</span>
          </div>
          <h1 className="heading-lg gradient-text-primary" style={{ marginBottom: "12px" }}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="body-md" style={{ color: "rgba(255,255,255,0.6)" }}>
            {isLogin ? "Sign in to continue shopping" : "Join us for exclusive offers"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 500 }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required={!isLogin}
                    style={{
                      width: "100%",
                      padding: "14px 14px 14px 44px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "white",
                      fontSize: "16px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 500 }}>
                  Phone Number
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required={!isLogin}
                    style={{
                      width: "100%",
                      padding: "14px 14px 14px 44px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "white",
                      fontSize: "16px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 500 }}>
                    City
                  </label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", zIndex: 1 }} />
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required={!isLogin}
                      style={{
                        width: "100%",
                        padding: "14px 14px 14px 44px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: formData.city ? "white" : "rgba(255,255,255,0.4)",
                        fontSize: "16px",
                        appearance: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city} value={city} style={{ background: "#1a1a1a", color: "white" }}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 500 }}>
                    Nearest Store
                  </label>
                  <div style={{ position: "relative" }}>
                    <Store size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", zIndex: 1 }} />
                    <select
                      name="nearest_store_id"
                      value={formData.nearest_store_id}
                      onChange={handleChange}
                      required={!isLogin}
                      disabled={!formData.city}
                      style={{
                        width: "100%",
                        padding: "14px 14px 14px 44px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: formData.nearest_store_id ? "white" : "rgba(255,255,255,0.4)",
                        fontSize: "16px",
                        appearance: "none",
                        cursor: formData.city ? "pointer" : "not-allowed",
                        opacity: formData.city ? 1 : 0.5,
                      }}
                    >
                      <option value="">Select Store</option>
                      {filteredStores.map((store) => (
                        <option key={store.id} value={store.id} style={{ background: "#1a1a1a", color: "white" }}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 500 }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 44px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "16px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "16px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: "12px", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "8px", marginBottom: "20px", color: "#ff4444", fontSize: "14px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              "Please wait..."
            ) : isLogin ? (
              <>
                <LogIn size={18} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} /> Create Account
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
