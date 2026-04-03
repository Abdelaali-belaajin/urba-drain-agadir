import { useState } from 'react';
import { login } from '../api/client';
import { Droplets, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await login(email, password);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.user.role);
            onLogin(data.user);
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur de connexion. Veuillez vérifier vos identifiants.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            background: '#060d1a',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Ambient Animated Gradients */}
            <div style={{
                position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vw',
                background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(6,13,26,0) 70%)',
                filter: 'blur(80px)', zIndex: 0, borderRadius: '50%',
                animation: 'pulse 8s infinite alternate'
            }} />
            <div style={{
                position: 'fixed', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw',
                background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(6,13,26,0) 70%)',
                filter: 'blur(80px)', zIndex: 0, borderRadius: '50%',
                animation: 'pulse 6s infinite alternate-reverse'
            }} />

            <style>
                {`
                @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.1); opacity: 1; } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .input-field:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important; }
                `}
            </style>

            <div style={{
                width: '100%',
                maxWidth: '440px',
                padding: '48px 40px',
                position: 'relative',
                zIndex: 10,
                background: 'rgba(12, 20, 38, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59,130,246,0.1)',
                animation: 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '40px' }}>
                    <div style={{
                        width: '72px', height: '72px', margin: '0 auto 24px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 25px rgba(59,130,246,0.4)', transform: 'rotate(-4deg)'
                    }}>
                        <Droplets size={36} color="white" />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '8px', color: '#f1f5f9' }}>
                        Urba-Drain <span style={{ color: '#3b82f6' }}>Agadir</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500' }}>
                        Plateforme de gestion résiliente
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && (
                        <div style={{
                            padding: '14px 16px', borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444', fontSize: '14px', fontWeight: '500', 
                            display: 'flex', alignItems: 'center', gap: '10px',
                            animation: 'slide-up 0.3s ease', textAlign: 'left'
                        }}>
                            <div style={{width:'4px', height:'20px', background:'#ef4444', borderRadius:'2px', flexShrink: 0}} />
                            {error}
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <Mail size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email institutionnel"
                            className="input-field"
                            required
                            style={{
                                width: '100%', padding: '16px 16px 16px 48px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '14px', color: '#f1f5f9', fontSize: '15px',
                                outline: 'none', transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            className="input-field"
                            required
                            style={{
                                width: '100%', padding: '16px 16px 16px 48px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '14px', color: '#f1f5f9', fontSize: '15px',
                                outline: 'none', transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        marginTop: '12px', padding: '16px', fontSize: '16px', fontWeight: '600',
                        background: loading ? '#475569' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white', border: 'none', borderRadius: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: loading ? 'none' : '0 8px 16px rgba(59,130,246,0.3)',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit'
                    }}>
                        {loading ? <Loader2 size={22} style={{ animation: 'spin 1.5s linear infinite' }} /> : (
                            <>Connexion <ArrowRight size={20} /></>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '32px', fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'center' }}>
                    admin@urba-drain-agadir.ma / admin123
                </div>
            </div>

            {/* Footer */}
            <div style={{
                position: 'fixed', bottom: '24px', left: 0, right: 0,
                textAlign: 'center', color: '#475569', fontSize: '13px',
                fontWeight: '500', zIndex: 10
            }}>
                ENSIASD Taroudant · SIBD 2025-2026
            </div>
        </div>
    );
}
