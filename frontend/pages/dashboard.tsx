import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  ShoppingCart,
  User,
  Package,
  Tag,
  CreditCard,
  Truck,
  MessageSquare,
  LogOut,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  RefreshCw,
  Star,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Gift,
  Percent,
  Search,
  Filter,
  Bot,
  Send,
} from "lucide-react";

interface Product {
  id: number;
  pid: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: { S: number; M: number; L: number; XL: number };
}

interface CartItem {
  id: number;
  product: Product;
  size: string;
  quantity: number;
  subtotal: number;
}

interface Offer {
  id: number;
  bank_name: string;
  discount_percent: number;
  max_discount: number;
  min_order: number;
  description: string;
}

interface OrderType {
  id: number;
  order_number: string;
  total: number;
  status: string;
  date: string;
}

interface StoreSlot {
  id: string;
  date: string;
  time: string;
  store: string;
}

type ViewType =
  | "dashboard"
  | "catalog"
  | "cart"
  | "checkout"
  | "orders"
  | "support"
  | "chatbot";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ items: CartItem[]; total: number }>({
    items: [],
    total: 0,
  });
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderType, setOrderType] = useState<"online" | "store">("online");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [storeSlots, setStoreSlots] = useState<StoreSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [orderResult, setOrderResult] = useState<any>(null);
  const [paymentAttempts, setPaymentAttempts] = useState(0);
  const [aiMessage, setAiMessage] = useState("");
  const [feedbackOrder, setFeedbackOrder] = useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [returnOrder, setReturnOrder] = useState<number | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);

  const categories = [
    "all",
    "shirt",
    "pants",
    "belt",
    "ethnic",
    "innerwear",
    "athleisure",
  ];

  const getToken = () => localStorage.getItem("token");

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }
    loadInitialData();
  }, [router]);

  useEffect(() => {
    let filtered = products;
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const loadInitialData = async () => {
    try {
      const [dashRes, productsRes, cartRes, offersRes, ordersRes] =
        await Promise.all([
          authFetch("/api/dashboard"),
          fetch("/api/products"),
          authFetch("/api/cart"),
          fetch("/api/agents/offers"),
          authFetch("/api/orders"),
        ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setDashboardData(data);
        setUser(data.profile);
      }
      if (productsRes.ok) setProducts(await productsRes.json());
      if (cartRes.ok) setCart(await cartRes.json());
      if (offersRes.ok) setOffers(await offersRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, size: string = "M") => {
    const res = await authFetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, size, quantity: 1 }),
    });
    if (res.ok) {
      const cartRes = await authFetch("/api/cart");
      if (cartRes.ok) setCart(await cartRes.json());
    }
  };

  const removeFromCart = async (itemId: number) => {
    const res = await authFetch(`/api/cart/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      const cartRes = await authFetch("/api/cart");
      if (cartRes.ok) setCart(await cartRes.json());
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          order_type: orderType,
          payment_method: paymentMethod,
          offer_id: selectedOffer,
        }),
      });
      const data = await res.json();
      setPaymentResult(data);

      if (data.success) {
        setOrderResult(data.order);
        if (data.ai_message) setAiMessage(data.ai_message);
        if (data.store_slots) setStoreSlots(data.store_slots);
        setCheckoutStep(orderType === "store" ? 4 : 5);
        setCart({ items: [], total: 0 });
      } else {
        setPaymentAttempts((prev) => prev + 1);
        if (data.payment?.redirect_to_store) {
          setCheckoutStep(4);
          const slotsRes = await authFetch("/api/agents/fulfillment/slots");
          if (slotsRes.ok) setStoreSlots(await slotsRes.json());
        } else {
          setCheckoutStep(3);
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/checkout/retry", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderResult?.id || paymentResult?.order?.id,
          payment_method: paymentMethod,
        }),
      });
      const data = await res.json();
      setPaymentResult(data);

      if (data.success) {
        setCheckoutStep(5);
      } else {
        setPaymentAttempts((prev) => prev + 1);
        if (paymentAttempts >= 1) {
          setCheckoutStep(4);
        }
      }
    } catch (error) {
      console.error("Retry error:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmSlot = async () => {
    if (!selectedSlot) return;
    const res = await authFetch("/api/checkout/confirm-slot", {
      method: "POST",
      body: JSON.stringify({
        order_id: orderResult?.id,
        slot_id: selectedSlot,
      }),
    });
    if (res.ok) {
      setCheckoutStep(5);
    }
  };

  const trackOrder = async (orderId: number) => {
    const res = await authFetch(`/api/orders/${orderId}/track`);
    if (res.ok) {
      setTrackingData(await res.json());
    }
  };

  const submitFeedback = async () => {
    if (!feedbackOrder) return;
    await authFetch("/api/orders/feedback", {
      method: "POST",
      body: JSON.stringify({
        order_id: feedbackOrder,
        rating: feedbackRating,
        comment: feedbackComment,
      }),
    });
    setFeedbackOrder(null);
    setFeedbackComment("");
  };

  const submitReturn = async () => {
    if (!returnOrder) return;
    await authFetch("/api/orders/return", {
      method: "POST",
      body: JSON.stringify({
        order_id: returnOrder,
        reason: returnReason,
        request_type: "return",
      }),
    });
    setReturnOrder(null);
    setReturnReason("");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading && !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="skeleton"
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ color: "rgba(255,255,255,0.6)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  const renderSidebar = () => (
    <aside
      style={{
        width: 280,
        background: "rgba(255,255,255,0.02)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            background: "#fff",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          🛍️
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Dashboard</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            AI Assistant
          </p>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {[
          { id: "dashboard", icon: User, label: "Dashboard" },
          { id: "catalog", icon: Package, label: "Products" },
          {
            id: "cart",
            icon: ShoppingCart,
            label: `Cart (${cart.items.length})`,
          },
          { id: "orders", icon: Truck, label: "Orders" },
          { id: "chatbot", icon: Bot, label: "AI Assistant" },
          { id: "support", icon: MessageSquare, label: "Support" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id as ViewType);
              if (item.id === "checkout") setCheckoutStep(1);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              background:
                currentView === item.id
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
              border: "none",
              borderRadius: 12,
              color: currentView === item.id ? "#fff" : "rgba(255,255,255,0.6)",
              cursor: "pointer",
              marginBottom: 8,
              transition: "all 0.2s",
            }}
          >
            <item.icon size={20} />
            <span style={{ fontWeight: 500 }}>{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={logout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "rgba(255,68,68,0.1)",
          border: "1px solid rgba(255,68,68,0.2)",
          borderRadius: 12,
          color: "#ff4444",
          cursor: "pointer",
        }}
      >
        <LogOut size={20} />
        <span style={{ fontWeight: 500 }}>Logout</span>
      </button>
    </aside>
  );

  const renderDashboard = () => (
    <div style={{ padding: 32 }}>
      <h1 className="heading-lg" style={{ marginBottom: 8 }}>
        Welcome, {user?.full_name}!
      </h1>
      <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>
        Here's your shopping overview
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          marginBottom: 40,
        }}
      >
        <div className="glass-card-strong" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={22} color="#fff" />
            </div>
            <h3 style={{ fontWeight: 600 }}>Profile</h3>
          </div>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>
            {user?.email}
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            <MapPin size={14} style={{ display: "inline", marginRight: 4 }} />
            {user?.city}
          </p>
          {dashboardData?.profile?.nearest_store && (
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                marginTop: 4,
              }}
            >
              Store: {dashboardData.profile.nearest_store.name}
            </p>
          )}
        </div>

        <div className="glass-card-strong" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Package size={22} color="#fff" />
            </div>
            <h3 style={{ fontWeight: 600 }}>Last Purchase</h3>
          </div>
          {dashboardData?.last_purchase ? (
            <>
              <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>
                Order #{dashboardData.last_purchase.order_number}
              </p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                Rs. {dashboardData.last_purchase.total} -{" "}
                {dashboardData.last_purchase.date}
              </p>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  background: "rgba(81,207,102,0.2)",
                  color: "#51cf66",
                  borderRadius: 20,
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                {dashboardData.last_purchase.status}
              </span>
            </>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.5)" }}>No purchases yet</p>
          )}
        </div>

        <div className="glass-card-strong" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tag size={22} color="#fff" />
            </div>
            <h3 style={{ fontWeight: 600 }}>Preferences</h3>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(dashboardData?.preferences?.categories?.length > 0
              ? dashboardData.preferences.categories
              : ["shirt", "pants"]
            ).map((cat: string) => (
              <span
                key={cat}
                style={{
                  padding: "6px 14px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  fontSize: 13,
                  textTransform: "capitalize",
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2 className="heading-sm">Available Offers</h2>
          <Gift size={22} color="rgba(255,255,255,0.6)" />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {offers.slice(0, 3).map((offer) => (
            <div
              key={offer.id}
              className="glass-card"
              style={{ padding: 20, border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <Percent size={18} color="#fff" />
                <span style={{ fontWeight: 600 }}>{offer.bank_name}</span>
              </div>
              <p style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                {offer.discount_percent}% OFF
              </p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                {offer.description}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                Min order: Rs. {offer.min_order}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2 className="heading-sm">Recommended For You</h2>
          <button
            onClick={() => setCurrentView("catalog")}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            View All <ChevronRight size={18} />
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {dashboardData?.recommendations?.products
            ?.slice(0, 4)
            .map((product: Product) => (
              <div
                key={product.id}
                className="glass-card glass-card-hover"
                style={{ padding: 16 }}
              >
                <div
                  style={{
                    height: 140,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Package size={40} color="rgba(255,255,255,0.3)" />
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
                  {product.title}
                </h4>
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  {product.category}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Rs. {product.price}</span>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="btn-primary"
                    style={{ padding: "8px 14px", fontSize: 12 }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderCatalog = () => (
    <div style={{ padding: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <h1 className="heading-lg" style={{ marginBottom: 8 }}>
            Product Catalog
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>
            {filteredProducts.length} products available
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.4)",
              }}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "12px 12px 12px 44px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                width: 280,
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "10px 20px",
              background:
                selectedCategory === cat ? "#fff" : "rgba(255,255,255,0.05)",
              color: selectedCategory === cat ? "#000" : "#fff",
              border: "none",
              borderRadius: 20,
              cursor: "pointer",
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
        }}
      >
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="glass-card glass-card-hover"
            style={{ padding: 20 }}
          >
            <div
              style={{
                height: 160,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Package size={48} color="rgba(255,255,255,0.3)" />
            </div>
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: 12,
                fontSize: 11,
                textTransform: "capitalize",
                marginBottom: 8,
              }}
            >
              {product.category}
            </span>
            <h4 style={{ fontWeight: 600, marginBottom: 6 }}>
              {product.title}
            </h4>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                marginBottom: 12,
                height: 40,
                overflow: "hidden",
              }}
            >
              {product.description}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 700 }}>
                Rs. {product.price}
              </span>
              <button
                onClick={() => addToCart(product.id)}
                className="btn-primary"
                style={{ padding: "10px 16px" }}
              >
                <ShoppingCart size={16} style={{ marginRight: 6 }} /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCart = () => (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <h1 className="heading-lg" style={{ marginBottom: 32 }}>
        Shopping Cart
      </h1>

      {cart.items.length === 0 ? (
        <div
          className="glass-card-strong"
          style={{ padding: 60, textAlign: "center" }}
        >
          <ShoppingCart
            size={60}
            color="rgba(255,255,255,0.2)"
            style={{ marginBottom: 20 }}
          />
          <h3 style={{ marginBottom: 8 }}>Your cart is empty</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
            Add some products to get started
          </p>
          <button
            onClick={() => setCurrentView("catalog")}
            className="btn-primary"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Package size={32} color="rgba(255,255,255,0.3)" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 600, marginBottom: 4 }}>
                    {item.product.title}
                  </h4>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                    Size: {item.size} | Qty: {item.quantity}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 700, fontSize: 18 }}>
                    Rs. {item.subtotal}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4444",
                      cursor: "pointer",
                      marginTop: 8,
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card-strong" style={{ padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.6)" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>Rs. {cart.total}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 20 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 20 }}>
                Rs. {cart.total}
              </span>
            </div>
            <button
              onClick={() => {
                setCurrentView("checkout");
                setCheckoutStep(1);
              }}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderCheckout = () => (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <h1 className="heading-lg" style={{ marginBottom: 8 }}>
        Checkout
      </h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: 4,
              background:
                step <= checkoutStep ? "#fff" : "rgba(255,255,255,0.1)",
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      {checkoutStep === 1 && (
        <div className="glass-card-strong" style={{ padding: 32 }}>
          <h2 className="heading-sm" style={{ marginBottom: 24 }}>
            Choose Delivery Option
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button
              onClick={() => setOrderType("online")}
              style={{
                padding: 24,
                background:
                  orderType === "online"
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                border: `2px solid ${orderType === "online" ? "#fff" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 16,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Truck size={28} color="#fff" />
              <div>
                <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>
                  Online Delivery
                </h4>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                  Get it delivered to your doorstep
                </p>
              </div>
            </button>
            <button
              onClick={() => setOrderType("store")}
              style={{
                padding: 24,
                background:
                  orderType === "store"
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                border: `2px solid ${orderType === "store" ? "#fff" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 16,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <MapPin size={28} color="#fff" />
              <div>
                <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>
                  Buy from Store
                </h4>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                  Pick up from your nearest store
                </p>
              </div>
            </button>
          </div>
          <button
            onClick={() => setCheckoutStep(2)}
            className="btn-primary"
            style={{ width: "100%", marginTop: 24 }}
          >
            Continue
          </button>
        </div>
      )}

      {checkoutStep === 2 && (
        <div className="glass-card-strong" style={{ padding: 32 }}>
          <h2 className="heading-sm" style={{ marginBottom: 24 }}>
            Apply Bank Offers
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {offers.map((offer) => (
              <button
                key={offer.id}
                onClick={() =>
                  setSelectedOffer(selectedOffer === offer.id ? null : offer.id)
                }
                style={{
                  padding: 20,
                  background:
                    selectedOffer === offer.id
                      ? "rgba(81,207,102,0.1)"
                      : "transparent",
                  border: `2px solid ${selectedOffer === offer.id ? "#51cf66" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h4
                    style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}
                  >
                    {offer.bank_name} - {offer.discount_percent}% OFF
                  </h4>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                    {offer.description}
                  </p>
                </div>
                {selectedOffer === offer.id && (
                  <Check size={22} color="#51cf66" />
                )}
              </button>
            ))}
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: 20,
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.6)" }}>Cart Total</span>
              <span>Rs. {cart.total}</span>
            </div>
            {selectedOffer && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  color: "#51cf66",
                }}
              >
                <span>Discount</span>
                <span>
                  - Rs.{" "}
                  {Math.min(
                    (cart.total *
                      (offers.find((o) => o.id === selectedOffer)
                        ?.discount_percent || 0)) /
                      100,
                    offers.find((o) => o.id === selectedOffer)?.max_discount ||
                      0,
                  ).toFixed(0)}
                </span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                fontSize: 18,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span>Final Total</span>
              <span>
                Rs.{" "}
                {(
                  cart.total -
                  (selectedOffer
                    ? Math.min(
                        (cart.total *
                          (offers.find((o) => o.id === selectedOffer)
                            ?.discount_percent || 0)) /
                          100,
                        offers.find((o) => o.id === selectedOffer)
                          ?.max_discount || 0,
                      )
                    : 0)
                ).toFixed(0)}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setCheckoutStep(1)}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Back
            </button>
            <button
              onClick={() => setCheckoutStep(3)}
              className="btn-primary"
              style={{ flex: 2 }}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {checkoutStep === 3 && (
        <div className="glass-card-strong" style={{ padding: 32 }}>
          <h2 className="heading-sm" style={{ marginBottom: 24 }}>
            {paymentResult?.payment?.can_retry
              ? "Payment Failed - Try Again"
              : "Select Payment Method"}
          </h2>

          {paymentResult?.payment?.can_retry && (
            <div
              style={{
                background: "rgba(255,68,68,0.1)",
                border: "1px solid rgba(255,68,68,0.3)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <p style={{ color: "#ff4444" }}>
                {paymentResult.payment.message}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  marginTop: 8,
                }}
              >
                Attempt {paymentAttempts} of 2
              </p>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <button
              onClick={() => setPaymentMethod("upi")}
              style={{
                padding: 20,
                background:
                  paymentMethod === "upi"
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                border: `2px solid ${paymentMethod === "upi" ? "#fff" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <CreditCard size={24} color="#fff" />
              <div>
                <h4 style={{ color: "#fff", fontWeight: 600 }}>UPI Payment</h4>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  Pay using any UPI app
                </p>
              </div>
            </button>
            <button
              onClick={() => setPaymentMethod("cod")}
              style={{
                padding: 20,
                background:
                  paymentMethod === "cod"
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                border: `2px solid ${paymentMethod === "cod" ? "#fff" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Package size={24} color="#fff" />
              <div>
                <h4 style={{ color: "#fff", fontWeight: 600 }}>
                  Cash on Delivery
                </h4>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  Pay when you receive
                </p>
              </div>
            </button>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setCheckoutStep(2)}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Back
            </button>
            <button
              onClick={
                paymentResult?.payment?.can_retry
                  ? retryPayment
                  : handleCheckout
              }
              className="btn-primary"
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : paymentResult?.payment?.can_retry
                  ? "Retry Payment"
                  : "Pay Now"}
            </button>
          </div>
        </div>
      )}

      {checkoutStep === 4 && (
        <div className="glass-card-strong" style={{ padding: 32 }}>
          <h2 className="heading-sm" style={{ marginBottom: 8 }}>
            Select Store Pickup Slot
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
            Choose a convenient time to pick up your order
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {storeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot.id)}
                style={{
                  padding: 16,
                  background:
                    selectedSlot === slot.id
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                  border: `2px solid ${selectedSlot === slot.id ? "#fff" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <Calendar size={20} color="#fff" />
                <div>
                  <p style={{ color: "#fff", fontWeight: 600 }}>{slot.date}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                    <Clock
                      size={12}
                      style={{ display: "inline", marginRight: 4 }}
                    />
                    {slot.time}
                  </p>
                </div>
                {selectedSlot === slot.id && (
                  <Check
                    size={20}
                    color="#fff"
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={confirmSlot}
            className="btn-primary"
            style={{ width: "100%" }}
            disabled={!selectedSlot}
          >
            Confirm Slot
          </button>
        </div>
      )}

      {checkoutStep === 5 && (
        <div
          className="glass-card-strong"
          style={{ padding: 40, textAlign: "center" }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: "rgba(81,207,102,0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Check size={40} color="#51cf66" />
          </div>
          <h2 className="heading-md" style={{ marginBottom: 12 }}>
            Order Confirmed!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>
            {orderResult
              ? `Order #${orderResult.order_number}`
              : "Your order has been placed successfully"}
          </p>
          {aiMessage && (
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: 16,
                borderRadius: 12,
                marginBottom: 24,
              }}
            >
              <p
                style={{ color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}
              >
                {aiMessage}
              </p>
            </div>
          )}
          {paymentResult?.delivery?.estimated_date && (
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
              <Truck size={16} style={{ display: "inline", marginRight: 8 }} />
              Expected delivery: {paymentResult.delivery.estimated_date}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => setCurrentView("orders")}
              className="btn-secondary"
            >
              View Orders
            </button>
            <button
              onClick={() => {
                setCurrentView("catalog");
                setCheckoutStep(1);
              }}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div style={{ padding: 32 }}>
      <h1 className="heading-lg" style={{ marginBottom: 32 }}>
        Order History
      </h1>

      {orders.length === 0 ? (
        <div
          className="glass-card-strong"
          style={{ padding: 60, textAlign: "center" }}
        >
          <Package
            size={60}
            color="rgba(255,255,255,0.2)"
            style={{ marginBottom: 20 }}
          />
          <h3 style={{ marginBottom: 8 }}>No orders yet</h3>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>
            Start shopping to see your orders here
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-card" style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 4 }}>
                    Order #{order.order_number}
                  </h4>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                    {order.date}
                  </p>
                </div>
                <span
                  style={{
                    padding: "6px 14px",
                    background:
                      order.status === "delivered"
                        ? "rgba(81,207,102,0.2)"
                        : "rgba(255,255,255,0.1)",
                    color: order.status === "delivered" ? "#51cf66" : "#fff",
                    borderRadius: 20,
                    fontSize: 13,
                    textTransform: "capitalize",
                  }}
                >
                  {order.status}
                </span>
              </div>
              <p style={{ fontWeight: 600, marginBottom: 16 }}>
                Rs. {order.total}
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => trackOrder(order.id)}
                  className="btn-secondary"
                  style={{ padding: "10px 16px", fontSize: 13 }}
                >
                  <Truck size={14} style={{ marginRight: 6 }} /> Track
                </button>
                <button
                  onClick={() => setFeedbackOrder(order.id)}
                  className="btn-secondary"
                  style={{ padding: "10px 16px", fontSize: 13 }}
                >
                  <Star size={14} style={{ marginRight: 6 }} /> Feedback
                </button>
                <button
                  onClick={() => setReturnOrder(order.id)}
                  className="btn-secondary"
                  style={{ padding: "10px 16px", fontSize: 13 }}
                >
                  <RefreshCw size={14} style={{ marginRight: 6 }} /> Return
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {trackingData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="glass-card-strong"
            style={{ padding: 32, maxWidth: 500, width: "100%" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h3 className="heading-sm">Order Tracking</h3>
              <button
                onClick={() => setTrackingData(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>
            </div>
            <p style={{ marginBottom: 20 }}>
              Order #{trackingData.order_number}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {trackingData.timeline?.map((step: any, i: number) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 16 }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: step.completed
                        ? "#51cf66"
                        : "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {step.completed && <Check size={16} color="#fff" />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 500 }}>{step.status}</p>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                      {step.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {feedbackOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="glass-card-strong"
            style={{ padding: 32, maxWidth: 450, width: "100%" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h3 className="heading-sm">Leave Feedback</h3>
              <button
                onClick={() => setFeedbackOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Star
                    size={28}
                    fill={star <= feedbackRating ? "#ffd43b" : "transparent"}
                    color={
                      star <= feedbackRating
                        ? "#ffd43b"
                        : "rgba(255,255,255,0.3)"
                    }
                  />
                </button>
              ))}
            </div>
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Share your experience..."
              style={{
                width: "100%",
                height: 120,
                padding: 16,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                resize: "none",
                marginBottom: 20,
              }}
            />
            <button
              onClick={submitFeedback}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {returnOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="glass-card-strong"
            style={{ padding: 32, maxWidth: 450, width: "100%" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h3 className="heading-sm">Request Return</h3>
              <button
                onClick={() => setReturnOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>
            </div>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Reason for return..."
              style={{
                width: "100%",
                height: 120,
                padding: 16,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                resize: "none",
                marginBottom: 20,
              }}
            />
            <button
              onClick={submitReturn}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              Submit Request
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const startChatSession = async () => {
    try {
      setChatLoading(true);
      const res = await authFetch("/api/chat/start");
      const data = await res.json();
      setChatSessionId(data.session_id);
      setChatMessages([{ role: "assistant", content: data.response }]);
      setChatEnded(false);
    } catch (error) {
      console.error("Failed to start chat:", error);
    } finally {
      setChatLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatLoading(true);

    try {
      const res = await authFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, session_id: chatSessionId }),
      });
      const data = await res.json();
      setChatSessionId(data.session_id);
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      if (data.ended) {
        setChatEnded(true);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const resetChat = () => {
    setChatMessages([]);
    setChatSessionId(null);
    setChatEnded(false);
  };

  const renderChatbot = () => (
    <div style={{ padding: 32, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 className="heading-lg" style={{ marginBottom: 8 }}>
            AI Fashion Assistant
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>
            Shop with our intelligent shopping assistant
          </p>
        </div>
        {chatMessages.length > 0 && (
          <button
            onClick={resetChat}
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <RefreshCw size={16} />
            New Chat
          </button>
        )}
      </div>

      {chatMessages.length === 0 ? (
        <div
          className="glass-card"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 48,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Bot size={40} color="#fff" />
          </div>
          <h2 className="heading-md" style={{ marginBottom: 12 }}>
            Smart Fashion Store AI
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24, maxWidth: 400 }}>
            Get personalized shopping assistance. Browse products, get recommendations, and complete your purchase with our AI assistant.
          </p>
          <button onClick={startChatSession} className="btn-primary" disabled={chatLoading}>
            {chatLoading ? "Starting..." : "Start Shopping"}
          </button>
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.role === "assistant" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Bot size={16} color="rgba(255,255,255,0.7)" />
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Assistant</span>
                    </div>
                  )}
                  <p style={{ margin: 0, lineHeight: 1.5 }}>{msg.content}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ display: "flex", gap: 4 }}>
                    <span className="typing-dot" />
                    <span className="typing-dot" style={{ animationDelay: "0.2s" }} />
                    <span className="typing-dot" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {!chatEnded && (
            <div
              style={{
                padding: 16,
                borderTop: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                gap: 12,
              }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 14,
                }}
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !chatInput.trim()}
                style={{
                  padding: "12px 20px",
                  background: chatInput.trim() ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  cursor: chatInput.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Send size={18} />
              </button>
            </div>
          )}

          {chatEnded && (
            <div
              style={{
                padding: 16,
                borderTop: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
                Chat session ended
              </p>
              <button onClick={resetChat} className="btn-primary">
                Start New Chat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSupport = () => (
    <div style={{ padding: 32 }}>
      <h1 className="heading-lg" style={{ marginBottom: 8 }}>
        Customer Support
      </h1>
      <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>
        How can we help you today?
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        <div
          className="glass-card glass-card-hover"
          style={{ padding: 24, cursor: "pointer" }}
          onClick={() => setCurrentView("orders")}
        >
          <Truck size={32} color="#fff" style={{ marginBottom: 16 }} />
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Track Shipment</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            Check the status of your orders
          </p>
        </div>
        <div
          className="glass-card glass-card-hover"
          style={{ padding: 24, cursor: "pointer" }}
        >
          <RefreshCw size={32} color="#fff" style={{ marginBottom: 16 }} />
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>
            Returns & Exchange
          </h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            Initiate return or exchange requests
          </p>
        </div>
        <div
          className="glass-card glass-card-hover"
          style={{ padding: 24, cursor: "pointer" }}
        >
          <MessageSquare size={32} color="#fff" style={{ marginBottom: 16 }} />
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Give Feedback</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            Share your shopping experience
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {renderSidebar()}
      <main style={{ flex: 1, overflowY: "auto", maxHeight: "100vh" }}>
        {currentView === "dashboard" && renderDashboard()}
        {currentView === "catalog" && renderCatalog()}
        {currentView === "cart" && renderCart()}
        {currentView === "checkout" && renderCheckout()}
        {currentView === "orders" && renderOrders()}
        {currentView === "chatbot" && renderChatbot()}
        {currentView === "support" && renderSupport()}
      </main>
    </div>
  );
}
