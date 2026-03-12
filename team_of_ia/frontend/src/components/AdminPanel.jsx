import { useState } from 'react'

export default function AdminPanel({ dark }) {
    const T = {
        surface: dark ? '#1e293b' : '#ffffff',
        surface2: dark ? '#273449' : '#f8fafc',
        border: dark ? '#334155' : '#e2e8f0',
        text: dark ? '#f1f5f9' : '#0f172a',
        textSub: dark ? '#94a3b8' : '#64748b',
        textMut: dark ? '#475569' : '#94a3b8',
        shadow: dark ? '0 4px 6px -1px rgba(0,0,0,.3), 0 2px 4px -1px rgba(0,0,0,.15)' : '0 4px 6px -1px rgba(0,0,0,.05), 0 2px 4px -1px rgba(0,0,0,.03)',
    }

    // Helper pour générer les initiales
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    const INITIAL_USERS = [
        { id: 1, nom: 'BELAAJIN Abdelaali', email: 'admin@urba-drain.ma', role: 'ADMIN', actif: true },
        { id: 2, nom: 'BELHADJ Chadi', email: 'oper@urba-drain.ma', role: 'OPERATEUR', actif: true },
        { id: 3, nom: 'BENELMALIH Mohamed', email: 'tech@urba-drain.ma', role: 'TECHNICIEN', actif: true },
        { id: 4, nom: 'Lecteur Test', email: 'lecteur@urba-drain.ma', role: 'LECTEUR', actif: false },
    ]

    const [users, setUsers] = useState(INITIAL_USERS)
    const [showUserModal, setShowUserModal] = useState(false)
    const [editUserId, setEditUserId] = useState(null)
    const [newNom, setNewNom] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newRole, setNewRole] = useState('LECTEUR')
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const Panel = ({ children, style = {} }) => (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', boxShadow: T.shadow, overflow: 'hidden', ...style }}>
            {children}
        </div>
    )

    const ROLE_CFG = {
        ADMIN: { color: '#7c3aed', bg: dark ? 'rgba(124,58,237,.1)' : '#f5f3ff', border: dark ? 'rgba(124,58,237,.25)' : '#c4b5fd' },
        OPERATEUR: { color: '#1d4ed8', bg: dark ? 'rgba(29,78,216,.1)' : '#eff6ff', border: dark ? 'rgba(29,78,216,.25)' : '#bfdbfe' },
        TECHNICIEN: { color: '#0891b2', bg: dark ? 'rgba(8,145,178,.1)' : '#ecfeff', border: dark ? 'rgba(8,145,178,.25)' : '#a5f3fc' },
        LECTEUR: { color: '#64748b', bg: dark ? 'rgba(100,116,139,.1)' : '#f8fafc', border: dark ? 'rgba(100,116,139,.25)' : '#cbd5e1' },
    }

    const PERMS = {
        ADMIN: { zones: true, capteurs: true, pompes: true, alertes: true, users: true, logs: false },
        OPERATEUR: { zones: true, capteurs: true, pompes: true, alertes: true, users: false, logs: false },
        TECHNICIEN: { zones: true, capteurs: true, pompes: false, alertes: true, users: false, logs: false },
        LECTEUR: { zones: true, capteurs: false, pompes: false, alertes: false, users: false, logs: false },
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Gestion utilisateurs */}
            <Panel>
                <div style={{ padding: '13px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '13px', color: T.text }}>
                        Gestion des utilisateurs
                    </span>
                    <button className="action-btn" onClick={() => {
                        setEditUserId(null); setNewNom(''); setNewEmail(''); setNewRole('LECTEUR'); setShowUserModal(true);
                    }} style={{
                        padding: '6px 14px', borderRadius: '6px', border: 'none',
                        background: 'linear-gradient(135deg,#1d4ed8,#1e40af)',
                        color: 'white', fontSize: '12px', fontWeight: '600',
                        cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        + Nouvel utilisateur
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ background: T.surface2 }}>
                                {['Utilisateur', 'Rôle', 'Statut', 'Actions'].map(h => (
                                    <th key={h} style={{
                                        padding: '14px 20px', textAlign: 'left',
                                        fontSize: '11px', fontWeight: '700', color: T.textSub,
                                        letterSpacing: '.05em', textTransform: 'uppercase',
                                        borderBottom: `2px solid ${T.border}`,
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => {
                                const rc = ROLE_CFG[u.role] || ROLE_CFG.LECTEUR
                                return (
                                    <tr key={u.id} className="row-hover" style={{ borderBottom: i < users.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${rc.color}, ${rc.border})`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0,
                                                    boxShadow: dark ? 'none' : '0 2px 5px rgba(0,0,0,0.1)'
                                                }}>
                                                    {getInitials(u.nom)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: '600', color: T.text }}>{u.nom}</div>
                                                    <div style={{ fontSize: '12px', color: T.textSub, marginTop: '2px' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '6px',
                                                background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                                                fontSize: '11px', fontWeight: '700', letterSpacing: '0.03em'
                                            }}>{u.role}</span>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.actif ? '#16a34a' : '#94a3b8', boxShadow: u.actif ? '0 0 8px rgba(22,163,74,0.5)' : 'none' }} />
                                                <span style={{
                                                    fontSize: '13px', fontWeight: '500', color: u.actif ? T.text : T.textSub
                                                }}>{u.actif ? 'Actif' : 'Inactif'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="action-btn" onClick={() => {
                                                    setEditUserId(u.id); setNewNom(u.nom); setNewEmail(u.email); setNewRole(u.role); setShowUserModal(true);
                                                }} style={{ padding: '4px 10px', borderRadius: '5px', border: `1px solid ${T.border}`, background: 'transparent', color: T.textSub, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                    Modifier
                                                </button>
                                                {u.role !== 'ADMIN' && (
                                                    <>
                                                        <button className="action-btn" onClick={() => {
                                                            setUsers(prev => prev.map(user => user.id === u.id ? { ...user, actif: !user.actif } : user));
                                                            showToast(`Utilisateur ${u.actif ? 'désactivé' : 'activé'}`, 'info');
                                                        }} style={{ padding: '4px 10px', borderRadius: '5px', border: u.actif ? '1px solid #fca5a5' : '1px solid #86efac', background: 'transparent', color: u.actif ? '#dc2626' : '#16a34a', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                            {u.actif ? 'Désactiver' : 'Activer'}
                                                        </button>

                                                        <button className="action-btn" onClick={() => {
                                                            if (window.confirm(`Voulez-vous vraiment supprimer l'utilisateur ${u.nom} ?`)) {
                                                                setUsers(prev => prev.filter(user => user.id !== u.id));
                                                                showToast('Utilisateur supprimé', 'error');
                                                            }
                                                        }} style={{ padding: '4px 10px', borderRadius: '5px', border: 'none', background: 'transparent', color: '#dc2626', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
                                                            Supprimer
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Panel>

            {/* Matrice des permissions RBAC */}
            <Panel>
                <div style={{ padding: '13px 18px', borderBottom: `1px solid ${T.border}`, fontWeight: '600', fontSize: '13px', color: T.text }}>
                    Matrice des permissions RBAC
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.surface2 }}>
                                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: T.textSub, letterSpacing: '.04em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>
                                    Ressource
                                </th>
                                {Object.keys(PERMS).map(role => {
                                    const rc = ROLE_CFG[role]
                                    return (
                                        <th key={role} style={{ padding: '10px 16px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                                            <span style={{
                                                padding: '2px 9px', borderRadius: '99px',
                                                background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                                                fontSize: '11px', fontWeight: '600',
                                            }}>{role}</span>
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { key: 'zones', label: '🗺 Zones' },
                                { key: 'capteurs', label: '📡 Capteurs' },
                                { key: 'pompes', label: '⚙️ Pompes' },
                                { key: 'alertes', label: '⚠ Alertes' },
                                { key: 'users', label: '👤 Utilisateurs' },
                                { key: 'logs', label: '📋 Logs (lecture seule)' },
                            ].map(({ key, label }, i, arr) => (
                                <tr key={key} className="row-hover" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                                    <td style={{ padding: '11px 16px', fontSize: '12px', fontWeight: '500', color: T.text }}>{label}</td>
                                    {Object.entries(PERMS).map(([role, perms]) => (
                                        <td key={role} style={{ padding: '11px 16px', textAlign: 'center' }}>
                                            <span style={{ fontSize: '16px' }}>
                                                {perms[key] ? '✅' : '❌'}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>

            {/* Modal de création / modification d'utilisateur */}
            {showUserModal && (
                <div onClick={() => setShowUserModal(false)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px',
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: '14px', width: '100%', maxWidth: '420px',
                        boxShadow: '0 16px 48px rgba(0,0,0,.25)',
                        animation: 'fadeUp .2s ease',
                    }}>
                        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', fontSize: '15px', color: T.text }}>{editUserId ? '✏ Modifier l\'utilisateur' : '➕ Nouvel utilisateur'}</span>
                            <button className="action-btn" onClick={() => setShowUserModal(false)} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMut, cursor: 'pointer', fontSize: '20px' }}>×</button>
                        </div>
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: T.textSub, marginBottom: '5px' }}>Nom complet</label>
                                <input type="text" value={newNom} onChange={e => setNewNom(e.target.value)} placeholder="Ex: Ali Ahmed" style={{
                                    width: '100%', padding: '9px 12px', borderRadius: '7px',
                                    border: `1px solid ${T.border}`, background: T.surface, color: T.text,
                                    fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                                }}
                                    onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                                    onBlur={e => e.target.style.borderColor = T.border}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: T.textSub, marginBottom: '5px' }}>Email</label>
                                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Ex: ali@urba-drain.ma" style={{
                                    width: '100%', padding: '9px 12px', borderRadius: '7px',
                                    border: `1px solid ${T.border}`, background: T.surface, color: T.text,
                                    fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                                }}
                                    onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                                    onBlur={e => e.target.style.borderColor = T.border}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: T.textSub, marginBottom: '5px' }}>Rôle</label>
                                <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{
                                    width: '100%', padding: '9px 12px', borderRadius: '7px',
                                    border: `1px solid ${T.border}`, background: T.surface, color: T.text,
                                    fontSize: '13px', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                                }}
                                    onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                                    onBlur={e => e.target.style.borderColor = T.border}
                                >
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="OPERATEUR">OPERATEUR</option>
                                    <option value="TECHNICIEN">TECHNICIEN</option>
                                    <option value="LECTEUR">LECTEUR</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button className="action-btn" onClick={() => setShowUserModal(false)} style={{
                                    flex: 1, padding: '9px', borderRadius: '7px', border: `1px solid ${T.border}`,
                                    background: 'transparent', color: T.textSub, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                                }}>Annuler</button>
                                <button className={(!newNom || !newEmail) ? "" : "action-btn"}
                                    disabled={!newNom || !newEmail}
                                    onClick={() => {
                                        if (editUserId) {
                                            setUsers(prev => prev.map(u => u.id === editUserId ? { ...u, nom: newNom, email: newEmail, role: newRole } : u));
                                            showToast('Utilisateur modifié avec succès ✓');
                                        } else {
                                            setUsers(prev => [...prev, { id: Date.now(), nom: newNom, email: newEmail, role: newRole, actif: true }]);
                                            showToast('Utilisateur créé avec succès ✓');
                                        }
                                        setShowUserModal(false);
                                    }}
                                    style={{
                                        flex: 1, padding: '9px', borderRadius: '7px', border: 'none',
                                        background: (!newNom || !newEmail) ? '#94a3b8' : 'linear-gradient(135deg,#1d4ed8,#1e40af)',
                                        color: 'white', fontSize: '13px', fontWeight: '600',
                                        cursor: (!newNom || !newEmail) ? 'not-allowed' : 'pointer',
                                        fontFamily: 'inherit',
                                    }}>{editUserId ? 'Enregistrer' : 'Créer l\'utilisateur'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000,
                    padding: '12px 18px', borderRadius: '10px',
                    background: toast.type === 'error' ? '#dc2626' : toast.type === 'info' ? '#1d4ed8' : '#16a34a',
                    color: 'white', fontSize: '13px', fontWeight: '500',
                    boxShadow: '0 4px 16px rgba(0,0,0,.25)',
                    animation: 'fadeUp .2s ease',
                }}>
                    {toast.type === 'error' ? '⚠ ' : toast.type === 'info' ? 'ℹ ' : '✓ '}{toast.msg}
                </div>
            )}
        </div>
    )
}
