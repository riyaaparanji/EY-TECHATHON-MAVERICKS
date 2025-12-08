import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>EY Shopping Assistant (Demo)</h1>
      <p><Link href="/dashboard">Open Dashboard</Link></p>
    </div>
  )
}
