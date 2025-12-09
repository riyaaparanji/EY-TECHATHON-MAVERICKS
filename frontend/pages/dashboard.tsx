import React, { useEffect, useState, useRef } from "react";
import {
  ShoppingCart,
  Send,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Heart,
  Search,
  TrendingUp,
  Zap,
  Star,
  Filter,
  Grid,
  List,
  X,
  ChevronDown,
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

const getProductImage = (title: string, desc: string): string => {
  const text = `${title} ${desc}`.toLowerCase();
  
  if (text.includes('shoe') || text.includes('sneaker') || text.includes('footwear')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop';
  }
  if (text.includes('watch') || text.includes('smartwatch')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';
  }
  if (text.includes('headphone') || text.includes('earphone') || text.includes('audio')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';
  }
  if (text.includes('laptop') || text.includes('computer') || text.includes('macbook')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop';
  }
  if (text.includes('phone') || text.includes('smartphone') || text.includes('iphone')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop';
  }
  if (text.includes('camera') || text.includes('photography')) {
    return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop';
  }
  if (text.includes('bag') || text.includes('backpack') || text.includes('luggage')) {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop';
  }
  if (text.includes('jacket') || text.includes('coat') || text.includes('clothing')) {
    return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop';
  }
  if (text.includes('sunglasses') || text.includes('glasses') || text.includes('eyewear')) {
    return 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop';
  }
  if (text.includes('perfume') || text.includes('fragrance') || text.includes('cologne')) {
    return 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop';
  }
  if (text.includes('jewelry') || text.includes('necklace') || text.includes('ring')) {
    return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop';
  }
  if (text.includes('chair') || text.includes('furniture') || text.includes('desk')) {
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop';
  }
  if (text.includes('book') || text.includes('reading')) {
    return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop';
  }
  if (text.includes('speaker') || text.includes('bluetooth')) {
    return 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop';
  }
  if (text.includes('keyboard') || text.includes('mouse') || text.includes('gaming')) {
    return 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop';
  }
  
  const fallbackImages = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
  ];
  
  const hash = title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return fallbackImages[hash % fallbackImages.length];
};

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high" | "name">("default");
  const [priceRange, setPriceRange] = useState<"all" | "under500" | "500-1000" | "over1000">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      });
  }, []);

  useEffect(() => {
    let result = [...products];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.desc.toLowerCase().includes(query)
      );
    }
    
    if (priceRange !== "all") {
      result = result.filter((p) => {
        if (priceRange === "under500") return p.price < 500;
        if (priceRange === "500-1000") return p.price >= 500 && p.price <= 1000;
        if (priceRange === "over1000") return p.price > 1000;
        return true;
      });
    }
    
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredProducts(result);
  }, [products, searchQuery, sortBy, priceRange]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (showSearchModal && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchModal]);

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

  const toggleFavorite = (pid: string) => {
    setFavorites((prev) => {
      const newFavs = new Set(prev);
      if (newFavs.has(pid)) newFavs.delete(pid);
      else newFavs.add(pid);
      return newFavs;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("default");
    setPriceRange("all");
    setShowFilterModal(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 24px",
        maxWidth: "1800px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
        background: "#000000",
      }}
    >
      {/* Search Modal */}
      {showSearchModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            zIndex: 100,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "120px",
          }}
          onClick={() => setShowSearchModal(false)}
        >
          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "600px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Search size={24} color="#888888" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setShowSearchModal(false);
                  }
                }}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "20px",
                  color: "#FFFFFF",
                }}
              />
              <button
                onClick={() => setShowSearchModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                }}
              >
                <X size={24} color="#888888" />
              </button>
            </div>
            {searchQuery && (
              <div style={{ marginTop: "16px", color: "#888888", fontSize: "14px" }}>
                Found {filteredProducts.length} products
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowFilterModal(false)}
        >
          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "400px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#FFFFFF" }}>Filters</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                }}
              >
                <X size={24} color="#888888" />
              </button>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "#888888", fontSize: "14px", marginBottom: "8px" }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#1A1A1A",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ display: "block", color: "#888888", fontSize: "14px", marginBottom: "8px" }}>
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#1A1A1A",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Prices</option>
                <option value="under500">Under 500</option>
                <option value="500-1000">500 - 1000</option>
                <option value="over1000">Over 1000</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={clearFilters}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  color: "#000000",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "48px",
          paddingBottom: "32px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          animation: "slideUp 0.6s ease-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "#FFFFFF",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(255, 255, 255, 0.15)",
            }}
          >
            <ShoppingBag size={32} color="#000000" strokeWidth={2.5} />
          </div>
          <div>
            <h1
              className="heading-md"
              style={{ marginBottom: "6px", fontWeight: 800, color: "#FFFFFF" }}
            >
              Luxe Market
            </h1>
            <p
              className="body-sm"
              style={{ color: "#666666", fontWeight: 500 }}
            >
              Premium shopping powered by AI
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button
            onClick={() => setShowSearchModal(true)}
            className="btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 20px",
            }}
          >
            <Search size={18} />
            <span>Search</span>
          </button>

          <button
            onClick={() => setShowFilterModal(true)}
            className="btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 20px",
              borderColor: (sortBy !== "default" || priceRange !== "all") ? "rgba(255, 255, 255, 0.4)" : undefined,
            }}
          >
            <Filter size={18} />
            <span>Filters</span>
            {(sortBy !== "default" || priceRange !== "all") && (
              <span style={{
                background: "#FFFFFF",
                color: "#000000",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                fontSize: "12px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {(sortBy !== "default" ? 1 : 0) + (priceRange !== "all" ? 1 : 0)}
              </span>
            )}
          </button>

          {searchQuery && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#888888",
            }}>
              <span>"{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                }}
              >
                <X size={14} color="#888888" />
              </button>
            </div>
          )}

          <div
            className="badge badge-success"
            style={{
              padding: "12px 24px",
              fontSize: "14px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#FFFFFF",
                animation: "pulse 2s infinite",
              }}
            />
            <Sparkles size={16} />
            <span>AI Active</span>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", gap: "40px" }}>
        {/* Products Section */}
        <div style={{ flex: 1 }}>
          {/* Section Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
              animation: "slideUp 0.6s ease-out 0.1s both",
            }}
          >
            <div>
              <h2
                className="heading-sm"
                style={{ color: "#FFFFFF", marginBottom: "8px" }}
              >
                Featured Collection
              </h2>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span className="body-sm" style={{ color: "#666666" }}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                  {searchQuery && ` matching "${searchQuery}"`}
                </span>
                {(sortBy !== "default" || priceRange !== "all" || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#888888",
                      fontSize: "14px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "10px",
                  background: viewMode === "grid" ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  color: viewMode === "grid" ? "#FFFFFF" : "#666666",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                style={{
                  padding: "10px",
                  background: viewMode === "list" ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  color: viewMode === "list" ? "#FFFFFF" : "#666666",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                viewMode === "grid"
                  ? "repeat(auto-fill, minmax(320px, 1fr))"
                  : "1fr",
              gap: "28px",
            }}
          >
            {filteredProducts.length === 0 ? (
              <div style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "80px 20px",
                color: "#666666",
              }}>
                <Search size={48} color="#333333" style={{ marginBottom: "16px" }} />
                <p style={{ fontSize: "18px", marginBottom: "8px" }}>No products found</p>
                <p style={{ fontSize: "14px" }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredProducts.map((p, idx) => (
                <div
                  key={p.pid}
                  className="glass-card-strong glass-card-hover"
                  style={{
                    padding: "0",
                    cursor: "pointer",
                    overflow: "hidden",
                    animation: `scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.08}s both`,
                  }}
                >
                  {/* Product Image */}
                  <div
                    style={{
                      width: "100%",
                      height: viewMode === "grid" ? "280px" : "200px",
                      background: "#0A0A0A",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={getProductImage(p.title, p.desc)}
                      alt={p.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                        filter: "grayscale(20%)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                        e.currentTarget.style.filter = "grayscale(0%)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.filter = "grayscale(20%)";
                      }}
                    />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(p.pid);
                      }}
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        width: "44px",
                        height: "44px",
                        background: "rgba(0, 0, 0, 0.7)",
                        backdropFilter: "blur(12px)",
                        border: favorites.has(p.pid)
                          ? "2px solid #FFFFFF"
                          : "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        zIndex: 2,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <Heart
                        size={20}
                        color="#FFFFFF"
                        fill={favorites.has(p.pid) ? "#FFFFFF" : "none"}
                      />
                    </button>

                    {/* Trending Badge */}
                    {idx < 3 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "16px",
                          left: "16px",
                          background: "#FFFFFF",
                          padding: "8px 14px",
                          borderRadius: "9999px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#000000",
                          zIndex: 2,
                        }}
                      >
                        <Zap size={14} fill="#000000" />
                        <span>HOT</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                        gap: "12px",
                      }}
                    >
                      <h3
                        className="body-lg"
                        style={{
                          fontWeight: 700,
                          color: "#FFFFFF",
                          flex: 1,
                          lineHeight: 1.4,
                        }}
                      >
                        {p.title}
                      </h3>
                      <div
                        style={{
                          background: "#FFFFFF",
                          padding: "8px 16px",
                          borderRadius: "9999px",
                          fontSize: "16px",
                          fontWeight: 800,
                          color: "#000000",
                          whiteSpace: "nowrap",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        ₹{p.price}
                      </div>
                    </div>

                    <p
                      className="body-sm"
                      style={{
                        color: "#888888",
                        marginBottom: "20px",
                        lineHeight: 1.6,
                      }}
                    >
                      {p.desc}
                    </p>

                    {/* Rating */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "20px",
                      }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < 4 ? "#FFFFFF" : "none"}
                          color={i < 4 ? "#FFFFFF" : "#333333"}
                        />
                      ))}
                      <span
                        className="body-xs"
                        style={{ color: "#666666", marginLeft: "4px" }}
                      >
                        4.8 (124)
                      </span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => sendToAgent(`add ${p.pid} size M`)}
                      className="btn-primary"
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "16px",
                      }}
                    >
                      <ShoppingCart size={20} strokeWidth={2.5} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Chat Assistant */}
        <aside
          className="glass-card-strong"
          style={{
            width: "460px",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 200px)",
            position: "sticky",
            top: "32px",
            animation: "slideUp 0.6s ease-out 0.2s both",
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "28px",
              paddingBottom: "24px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "#FFFFFF",
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={28} color="#000000" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <h3
                className="body-lg"
                style={{
                  fontWeight: 700,
                  color: "#FFFFFF",
                  marginBottom: "4px",
                  letterSpacing: "-0.01em",
                }}
              >
                AI Shopping Assistant
              </h3>
              <p
                className="body-xs"
                style={{ color: "#666666", fontWeight: 500 }}
              >
                Intelligent • Instant • Personalized
              </p>
            </div>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              marginBottom: "24px",
              paddingRight: "12px",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 24px",
                  animation: "fadeIn 0.6s ease-in",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                  }}
                >
                  <MessageCircle size={36} color="#666666" />
                </div>
                <h4
                  style={{
                    color: "#FFFFFF",
                    fontSize: "18px",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                >
                  Start a Conversation
                </h4>
                <p style={{ color: "#666666", fontSize: "14px", lineHeight: 1.6 }}>
                  Ask about products, get recommendations, or add items to your cart
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "16px",
                  animation: "slideUp 0.3s ease-out",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "16px 20px",
                    borderRadius:
                      msg.role === "user"
                        ? "20px 20px 4px 20px"
                        : "20px 20px 20px 4px",
                    background:
                      msg.role === "user" ? "#FFFFFF" : "rgba(255, 255, 255, 0.05)",
                    color: msg.role === "user" ? "#000000" : "#FFFFFF",
                    fontSize: "15px",
                    lineHeight: 1.5,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
                <div
                  style={{
                    padding: "16px 20px",
                    borderRadius: "20px 20px 20px 4px",
                    background: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#666666",
                          animation: `pulse 1.4s ease-in-out ${i * 0.16}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "8px 8px 8px 20px",
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "15px",
                color: "#FFFFFF",
              }}
            />
            <button
              onClick={() => sendToAgent(inputValue)}
              disabled={!inputValue.trim() || loading}
              style={{
                width: "48px",
                height: "48px",
                background: inputValue.trim() ? "#FFFFFF" : "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: inputValue.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
              }}
            >
              <Send
                size={20}
                color={inputValue.trim() ? "#000000" : "#666666"}
              />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
