import React, { useEffect, useState, useRef } from "react";
import {
  ShoppingCart,
  Send,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Heart,
  Search,
} from "lucide-react";

interface Product {
  pid: string;
  title: string;
  desc: string;
  price: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendToAgent(msg: string) {
    if (!msg.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg, timestamp: new Date() },
    ]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const j = await res.json();

      let response = "";
      if (j.reply) response = j.reply;
      else if (j.message) response = j.message;
      else if (j.ui?.title) response = j.ui.title;
      else if (j.products)
        response = `Found ${j.products.length} products: ${j.products.join(", ")}`;
      else response = JSON.stringify(j, null, 2);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response, timestamp: new Date() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error connecting to assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendToAgent(inputValue);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        maxWidth: "1600px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Background Decorative Elements */}
      <div
        style={{
          position: "fixed",
          top: "10%",
          right: "10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(21, 96, 189, 0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "10%",
          left: "5%",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(70, 102, 255, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "40px",
          paddingBottom: "24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "linear-gradient(135deg, #1560BD 0%, #4666FF 100%)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(21, 96, 189, 0.4)",
            }}
          >
            <ShoppingBag size={28} color="white" />
          </div>
          <div>
            <h1
              className="heading-md gradient-text"
              style={{ marginBottom: "4px" }}
            >
              AI Shopping Hub
            </h1>
            <p className="body-sm" style={{ color: "var(--gray-400)" }}>
              Discover products with intelligent assistance
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-full)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--gray-300)",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--glass-hover)";
              e.currentTarget.style.borderColor = "var(--primary-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--glass-bg)";
              e.currentTarget.style.borderColor = "var(--glass-border)";
            }}
          >
            <Search size={16} />
            <span>Search</span>
          </button>

          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: "#10b981",
              fontWeight: 600,
            }}
          >
            <Sparkles size={16} />
            <span>AI Active</span>
          </div>
        </div>
      </header>

      <div
        style={{
          display: "flex",
          gap: "32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Products Section */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h2 className="heading-sm" style={{ color: "var(--gray-100)" }}>
              Featured Products
            </h2>
            <span className="body-sm" style={{ color: "var(--gray-400)" }}>
              {products.length} items
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {products.map((p, idx) => (
              <div
                key={p.pid}
                className="glass-card glass-card-hover"
                style={{
                  padding: "24px",
                  cursor: "pointer",
                  animation: `slideUp 0.5s ease-out ${idx * 0.1}s both`,
                }}
              >
                {/* Product Image Placeholder */}
                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    background:
                      "linear-gradient(135deg, rgba(21, 96, 189, 0.2) 0%, rgba(70, 102, 255, 0.2) 100%)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "64px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "rgba(0, 0, 0, 0.5)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "var(--radius-full)",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(239, 68, 68, 0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
                    }}
                  >
                    <Heart size={18} color="white" />
                  </div>
                  👔
                </div>

                {/* Product Info */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <h3
                    className="body-lg"
                    style={{
                      fontWeight: 600,
                      color: "var(--gray-100)",
                      flex: 1,
                    }}
                  >
                    {p.title}
                  </h3>
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      padding: "6px 14px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "white",
                      whiteSpace: "nowrap",
                      marginLeft: "12px",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    ₹{p.price}
                  </span>
                </div>

                <p
                  className="body-sm"
                  style={{
                    color: "var(--gray-400)",
                    marginBottom: "20px",
                    lineHeight: 1.6,
                  }}
                >
                  {p.desc}
                </p>

                {/* Action Button */}
                <button
                  onClick={() => sendToAgent(`add ${p.pid} size M`)}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Assistant Sidebar */}
        <aside
          className="glass-card"
          style={{
            width: "420px",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 180px)",
            position: "sticky",
            top: "24px",
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "1px solid var(--glass-border)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "linear-gradient(135deg, #1560BD 0%, #4666FF 100%)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(21, 96, 189, 0.4)",
              }}
            >
              <Sparkles size={24} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <h3
                className="body-lg"
                style={{
                  fontWeight: 600,
                  color: "var(--gray-100)",
                  marginBottom: "2px",
                }}
              >
                AI Assistant
              </h3>
              <p className="body-xs" style={{ color: "var(--gray-400)" }}>
                Powered by intelligent agents
              </p>
            </div>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              marginBottom: "20px",
              paddingRight: "8px",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "var(--gray-500)",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "var(--glass-bg)",
                    borderRadius: "var(--radius-full)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <MessageCircle size={36} color="var(--gray-500)" />
                </div>
                <p
                  className="body-md"
                  style={{
                    marginBottom: "12px",
                    fontWeight: 500,
                    color: "var(--gray-400)",
                  }}
                >
                  Start a conversation
                </p>
                <p className="body-sm" style={{ color: "var(--gray-500)" }}>
                  Try: "Show me shirts" or "Add p01 to cart"
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  animation: "fadeIn 0.3s ease-in",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "14px 18px",
                    borderRadius:
                      msg.role === "user"
                        ? "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)"
                        : "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #1560BD 0%, #0059CF 100%)"
                        : "var(--glass-bg)",
                    border:
                      msg.role === "assistant"
                        ? "1px solid var(--glass-border)"
                        : "none",
                    color: "var(--gray-100)",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    boxShadow:
                      msg.role === "user"
                        ? "0 4px 12px rgba(21, 96, 189, 0.3)"
                        : "none",
                  }}
                >
                  {msg.content}
                </div>
                <span
                  className="body-xs"
                  style={{
                    color: "var(--gray-500)",
                    marginTop: "6px",
                    padding: "0 8px",
                  }}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  padding: "14px 18px",
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-lg)",
                  width: "fit-content",
                }}
              >
                <span className="animate-pulse" style={{ fontSize: "8px" }}>
                  ●
                </span>
                <span
                  className="animate-pulse"
                  style={{ fontSize: "8px", animationDelay: "0.2s" }}
                >
                  ●
                </span>
                <span
                  className="animate-pulse"
                  style={{ fontSize: "8px", animationDelay: "0.4s" }}
                >
                  ●
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              background: "rgba(0, 0, 0, 0.3)",
              padding: "10px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask the assistant..."
              className="body-sm"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                padding: "12px 16px",
                color: "var(--gray-100)",
              }}
            />
            <button
              onClick={() => sendToAgent(inputValue)}
              disabled={loading || !inputValue.trim()}
              style={{
                background: inputValue.trim()
                  ? "linear-gradient(135deg, #1560BD 0%, #0059CF 100%)"
                  : "var(--glass-bg)",
                color: inputValue.trim() ? "white" : "var(--gray-500)",
                border: "none",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                cursor: inputValue.trim() ? "pointer" : "not-allowed",
                boxShadow: inputValue.trim()
                  ? "0 4px 12px rgba(21, 96, 189, 0.3)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (inputValue.trim()) {
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
