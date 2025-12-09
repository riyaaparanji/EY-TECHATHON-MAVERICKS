import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      background: '#000000'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '24px',
        padding: '60px 80px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(10px)',
        maxWidth: '600px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#FFFFFF',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '36px'
        }}>
          <span style={{ filter: 'grayscale(100%)' }}>🛍️</span>
        </div>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: '16px',
          letterSpacing: '-1px'
        }}>
          EY Shopping Assistant
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#888888',
          marginBottom: '40px',
          lineHeight: 1.7
        }}>
          AI-powered shopping experience with intelligent product recommendations and seamless checkout
        </p>
        <Link href="/dashboard" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: '#FFFFFF',
          color: '#000000',
          padding: '16px 40px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 40px rgba(255, 255, 255, 0.15)'
        }}>
          Open Dashboard
          <span style={{ fontSize: '20px' }}>→</span>
        </Link>
      </div>
      <p style={{
        marginTop: '40px',
        color: '#555555',
        fontSize: '14px'
      }}>
        Built with FastAPI + Next.js
      </p>
    </div>
  )
}
