import React, { useEffect, useState, useRef } from 'react'

interface Product {
  pid: string
  title: string
  desc: string
  price: number
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendToAgent(msg: string) {
    if (!msg.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])
    setInputValue('')
    setLoading(true)

    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      })
      const j = await res.json()
      
      let response = ''
      if (j.reply) response = j.reply
      else if (j.message) response = j.message
      else if (j.ui?.title) response = j.ui.title
      else if (j.products) response = `Found ${j.products.length} products: ${j.products.join(', ')}`
      else response = JSON.stringify(j, null, 2)

      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to assistant', timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendToAgent(inputValue)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px'
          }}>
            🛍️ Shopping Dashboard
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Browse products and chat with our AI assistant</p>
        </div>
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          color: '#10b981',
          fontWeight: 500
        }}>
          ● AI Online
        </div>
      </header>

      <div style={{ display: 'flex', gap: '32px' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '20px',
            color: '#f3f4f6'
          }}>
            Products
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {products.map(p => (
              <div key={p.pid} style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
              >
                <div style={{
                  width: '100%',
                  height: '120px',
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px'
                }}>
                  👔
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#f3f4f6'
                  }}>
                    {p.title}
                  </h3>
                  <span style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    ₹{p.price}
                  </span>
                </div>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {p.desc}
                </p>
                <button
                  onClick={() => sendToAgent(`add ${p.pid} size M`)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  Add to Cart via AI
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside style={{
          width: '400px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 180px)',
          position: 'sticky',
          top: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🤖
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6' }}>AI Shopping Assistant</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>Powered by intelligent agents</p>
            </div>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '16px',
            padding: '8px'
          }}>
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>Start a conversation!</p>
                <p style={{ fontSize: '12px', color: '#4b5563' }}>Try: "Show me shirts" or "Add p01 to cart"</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: '#f3f4f6',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  {msg.content}
                </div>
                <span style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  marginTop: '4px',
                  padding: '0 8px'
                }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {loading && (
              <div style={{
                display: 'flex',
                gap: '4px',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                width: 'fit-content'
              }}>
                <span style={{ animation: 'pulse 1s infinite', opacity: 0.5 }}>●</span>
                <span style={{ animation: 'pulse 1s infinite 0.2s', opacity: 0.5 }}>●</span>
                <span style={{ animation: 'pulse 1s infinite 0.4s', opacity: 0.5 }}>●</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '8px',
            borderRadius: '14px'
          }}>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask the assistant..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '12px 16px',
                color: '#f3f4f6',
                fontSize: '14px'
              }}
            />
            <button
              onClick={() => sendToAgent(inputValue)}
              disabled={loading || !inputValue.trim()}
              style={{
                background: inputValue.trim() 
                  ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: inputValue.trim() ? 'white' : '#6b7280',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              Send
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
