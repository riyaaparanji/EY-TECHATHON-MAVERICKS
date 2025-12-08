import React, { useEffect, useState } from 'react'

export default function Dashboard() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts)
  }, [])

  async function sendToAgent(msg) {
    const res = await fetch('/api/agents/chat', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ message: msg }) })
    const j = await res.json()
    alert(JSON.stringify(j))
  }

  return (
    <div style={{ display:'flex', gap:24, padding:24 }}>
      <div style={{ flex:1 }}>
        <h2>Products</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {products.map(p => (
            <div key={p.pid} style={{ border:'1px solid #ddd', padding:12 }}>
              <h4>{p.title}</h4>
              <p>{p.desc}</p>
              <strong>Rs{p.price}</strong>
              <div><button onClick={()=>sendToAgent(`add ${p.pid} size M`)}>Add via agent</button></div>
            </div>
          ))}
        </div>
      </div>
      <aside style={{ width:380 }}>
        <h3>Assistant</h3>
        <div>
          <input id="agentInput" placeholder="Ask the agent" style={{ width:'100%', padding:8 }} />
          <button onClick={async()=>{ const v = document.getElementById('agentInput').value; await sendToAgent(v)}}>Send</button>
        </div>
      </aside>
    </div>
  )
}
