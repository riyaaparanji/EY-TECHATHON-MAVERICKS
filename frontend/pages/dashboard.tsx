import React, { useEffect, useState } from 'react'

interface Product {
  pid: string
  title: string
  desc: string
  price: number
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [inputValue, setInputValue] = useState('')
  const [response, setResponse] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts)
  }, [])

  async function sendToAgent(msg: string) {
    const res = await fetch('/api/agents/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    })
    const j = await res.json()
    setResponse(JSON.stringify(j, null, 2))
  }

  return (
    <div style={{ display: 'flex', gap: 24, padding: 24 }}>
      <div style={{ flex: 1 }}>
        <h2>Products</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {products.map(p => (
            <div key={p.pid} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
              <h4>{p.title}</h4>
              <p>{p.desc}</p>
              <strong>Rs{p.price}</strong>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => sendToAgent(`add ${p.pid} size M`)}>Add via agent</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <aside style={{ width: 380 }}>
        <h3>Assistant</h3>
        <div>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask the agent"
            style={{ width: '100%', padding: 8 }}
          />
          <button onClick={() => sendToAgent(inputValue)} style={{ marginTop: 8 }}>Send</button>
        </div>
        {response && (
          <pre style={{ background: '#f5f5f5', padding: 12, marginTop: 12, overflow: 'auto', maxHeight: 400 }}>
            {response}
          </pre>
        )}
      </aside>
    </div>
  )
}
