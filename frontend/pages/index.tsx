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
      textAlign: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
        borderRadius: '24px',
        padding: '60px 80px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        maxWidth: '600px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          🛍️
        </div>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
          letterSpacing: '-1px'
        }}>
          EY Shopping Assistant
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#9ca3af',
          marginBottom: '40px',
          lineHeight: 1.7
        }}>
          AI-powered shopping experience with intelligent product recommendations and seamless checkout
        </p>
        <Link href="/dashboard" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: 'white',
          padding: '16px 40px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)'
        }}>
          Open Dashboard
          <span style={{ fontSize: '20px' }}>→</span>
        </Link>
      </div>
      <p style={{
        marginTop: '40px',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        Built with FastAPI + Next.js
      </p>
    </div>
  )
}
