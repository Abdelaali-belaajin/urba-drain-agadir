import { useState } from 'react'

export default function Login({ onLogin, dark }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const T = {
        bg: dark ? '#0f172a' : '#f1f5f9',
        surface: dark ? '#1e293b' : '#ffffff',
        border: dark ? '#334155' : '#e2e8f0',
        text: dark ? '#f1f5f9' : '#0f172a',
        textSub: dark ? '#94a3b8' : '#64748b',
        shadow: dark ? '0 8px 32px rgba(0,0,0,.5)' : '0 8px 32px rgba(0,0,0,.1)',
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Simulation login (remplacer par appel API Flask)
        await new Promise(r => setTimeout(r, 1000))

        const DEMO_USERS = [
            { email: 'admin@urba-drain.ma', password: 'admin123', role: 'ADMIN' },
            { email: 'operateur@urba-drain.ma', password: 'oper123', role: 'OPERATEUR' },
            { email: 'lecteur@urba-drain.ma', password: 'lecteur123', role: 'LECTEUR' },
        ]

        const user = DEMO_USERS.find(u => u.email === email && u.password === password)
        if (user) {
            localStorage.setItem('token', 'demo-jwt-token')
            localStorage.setItem('role', user.role)
            onLogin(user)
        } else {
            setError('Email ou mot de passe incorrect')
        }
        setLoading(false)
    }

    return (
        <div style={{
            minHeight: '100vh', background: T.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', system-ui, sans-serif",
            padding: '24px',
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '56px', height: '56px',
                        background: 'linear-gradient(135deg,#1d4ed8,#1e40af)',
                        borderRadius: '14px', margin: '0 auto 14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px', boxShadow: '0 4px 16px rgba(29,78,216,.4)',
                    }}>🌊</div>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', color: T.text, marginBottom: '4px' }}>
                        Urba-Drain Agadir
                    </h1>
                    <p style={{ fontSize: '13px', color: T.textSub }}>
                        Système de gestion réseau pluvial
                    </p>
                </div>

                {/* Carte */}
                <div style={{
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderRadius: '14px', padding: '32px', boxShadow: T.shadow,
                }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: T.text, marginBottom: '22px' }}>
                        Connexion
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: T.textSub, marginBottom: '6px' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@urba-drain.ma"
                                required
                                style={{
                                    width: '100%', padding: '9px 12px',
                                    borderRadius: '7px', border: `1px solid ${T.border}`,
                                    background: T.surface, color: T.text,
                                    fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                                    transition: 'border-color .15s ease',
                                }}
                                onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                                onBlur={e => e.target.style.borderColor = T.border}
                            />
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: T.textSub, marginBottom: '6px' }}>
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%', padding: '9px 12px',
                                    borderRadius: '7px', border: `1px solid ${T.border}`,
                                    background: T.surface, color: T.text,
                                    fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                                    transition: 'border-color .15s ease',
                                }}
                                onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                                onBlur={e => e.target.style.borderColor = T.border}
                            />
                        </div>

                        {/* Erreur */}
                        {error && (
                            <div style={{
                                padding: '10px 12px', borderRadius: '7px',
                                background: dark ? 'rgba(220,38,38,.1)' : '#fef2f2',
                                border: '1px solid #fca5a5',
                                fontSize: '13px', color: '#dc2626',
                            }}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading} style={{
                            padding: '10px', borderRadius: '8px', border: 'none',
                            background: loading ? '#94a3b8' : 'linear-gradient(135deg,#1d4ed8,#1e40af)',
                            color: 'white', fontSize: '13px', fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'all .2s ease',
                            marginTop: '4px',
                        }}>
                            {loading ? '⚙ Connexion en cours…' : 'Se connecter'}
                        </button>
                    </form>

                    {/* Comptes démo */}
                    <div style={{
                        marginTop: '22px', padding: '12px',
                        background: dark ? 'rgba(29,78,216,.08)' : '#eff6ff',
                        border: `1px solid ${dark ? 'rgba(29,78,216,.2)' : '#bfdbfe'}`,
                        borderRadius: '8px',
                    }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: '#1d4ed8', marginBottom: '7px' }}>
                            Comptes de démonstration
                        </p>
                        {[
                            ['admin@urba-drain.ma', 'admin123', 'ADMIN'],
                            ['operateur@urba-drain.ma', 'oper123', 'OPERATEUR'],
                            ['lecteur@urba-drain.ma', 'lecteur123', 'LECTEUR'],
                        ].map(([e, p, r]) => (
                            <div key={r} style={{ fontSize: '11px', color: T.textSub, marginBottom: '3px', display: 'flex', gap: '8px' }}>
                                <span style={{ color: '#1d4ed8', fontWeight: '500', minWidth: '76px' }}>{r}</span>
                                <span style={{ fontFamily: 'monospace' }}>{e}</span>
                                <span style={{ color: T.textSub }}>/ {p}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '11px', color: T.textSub, marginTop: '20px' }}>
                    ENSIASD Taroudant · Équipe Augmenteds · SIBD 2025-2026
                </p>
            </div>
        </div>
    )
}
