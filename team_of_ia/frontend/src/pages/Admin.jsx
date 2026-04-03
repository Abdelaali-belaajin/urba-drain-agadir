import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'

const ROLE_CFG = {
    ADMIN: { color: '#7c3aed', bg: 'rgba(124,58,237,.1)', border: 'rgba(124,58,237,.3)' },
    OPERATEUR: { color: '#1d4ed8', bg: 'rgba(29,78,216,.1)', border: 'rgba(29,78,216,.3)' },
    TECHNICIEN: { color: '#0891b2', bg: 'rgba(8,145,178,.1)', border: 'rgba(8,145,178,.3)' },
    LECTEUR: { color: '#64748b', bg: 'rgba(100,116,139,.1)', border: 'rgba(100,116,139,.3)' },
}

const PERMS = {
    ADMIN: { zones: true, capteurs: true, pompes: true, alertes: true, users: true, logs: false },
    OPERATEUR: { zones: true, capteurs: true, pompes: true, alertes: true, users: false, logs: false },
    TECHNICIEN: { zones: true, capteurs: true, pompes: false, alertes: true, users: false, logs: false },
    LECTEUR: { zones: true, capteurs: false, pompes: false, alertes: false, users: false, logs: false },
}

export default function Admin({ dark }) {
    const [users, setUsers] = useState([])
    const [modal, setModal] = useState(null)
    const [target, setTarget] = useState(null)
    const [toast, setToast] = useState(null)
    const [form, setForm] = useState({ nom: '', email: '', role: 'LECTEUR', password: '' })

    const T = {
        surface: dark ? '#1e293b' : '#ffffff', surface2: dark ? '#273449' : '#f8fafc',
        border: dark ? '#334155' : '#e2e8f0', text: dark ? '#f1f5f9' : '#0f172a',
        textSub: dark ? '#94a3b8' : '#64748b', textMut: dark ? '#475569' : '#94a3b8',
        shadow: dark ? '0 1px 3px rgba(0,0,0,.5)' : '0 1px 3px rgba(0,0,0,.08)',
    }

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
    }

    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await client.get('/users');
            setUsers(data);
        } catch (err) {
            console.error(err);
            showToast('Erreur lors du chargement des utilisateurs', 'error');
        }
    }, [])

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers])

    const openAdd = () => {
        setForm({ nom: '', email: '', role: 'LECTEUR', password: '' }); setTarget(null); setModal('add')
    }
    const openEdit = (u) => {
        // Le backend utilise user_id, non id
        setForm({ nom: u.nom, email: u.email, role: u.role, password: '' }); setTarget(u); setModal('edit')
    }

    const saveAdd = async () => {
        if (!form.nom || !form.email || !form.password) return showToast('Tous les champs sont requis', 'error')
        try {
            const { data } = await client.post('/users', form);
            setUsers(prev => [...prev, data]);
            setModal(null); showToast(`Utilisateur ${data.nom} créé ✓`);
        } catch (err) {
            showToast(err.response?.data?.error || 'Erreur', 'error');
        }
    }
    const saveEdit = async () => {
        try {
            const { data } = await client.put(`/users/${target.user_id}`, { nom: form.nom, email: form.email, role: form.role });
            setUsers(prev => prev.map(u => u.user_id !== target.user_id ? u : data));
            setModal(null); showToast(`Profil mis à jour ✓`);
        } catch (err) {
            showToast(err.response?.data?.error || 'Erreur', 'error');
        }
    }
    const toggleActif = async (u) => {
        try {
            const { data } = await client.patch(`/users/${u.user_id}/toggle`);
            setUsers(prev => prev.map(x => x.user_id !== u.user_id ? x : data));
            showToast(`${data.nom} ${data.actif ? 'réactivé' : 'désactivé'} ✓`, data.actif ? 'success' : 'error');
        } catch (err) {
            showToast(err.response?.data?.error || 'Erreur', 'error');
        }
    }
    const deleteUser = async () => {
        try {
            await client.delete(`/users/${target.user_id}`);
            setUsers(prev => prev.filter(u => u.user_id !== target.user_id));
            setModal(null); showToast(`Compte supprimé`, 'error');
        } catch (err) {
            showToast(err.response?.data?.error || 'Erreur', 'error');
        }
    }

    const inputStyle = {
        width: '100%', padding: '9px 12px', borderRadius: '7px',
        border: `1px solid ${T.border}`, background: T.surface, color: T.text,
        fontSize: '13px', fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s',
    }
    const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '500', color: T.textSub, marginBottom: '5px' }

    const ModalWrap = ({ title, children }) => (
        <div onClick={() => setModal(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px',
                width: '100%', maxWidth: '420px', boxShadow: '0 16px 48px rgba(0,0,0,.25)',
                animation: 'fadeUp .2s ease',
            }}>
                <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: T.text }}>{title}</span>
                    <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: T.textMut, cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>×</button>
                </div>
                {children}
            </div>
        </div>
    )

    return (
        <>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* ── Tableau ─────────────────────────────────────────────── */}
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', boxShadow: T.shadow, overflow: 'hidden' }}>
                    <div style={{ padding: '13px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', fontSize: '13px', color: T.text }}>
                            Gestion des utilisateurs ({users.length})
                        </span>
                        <button onClick={openAdd} style={{
                            padding: '7px 16px', borderRadius: '7px', border: 'none',
                            background: 'linear-gradient(135deg,#1d4ed8,#1e40af)',
                            color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                            boxShadow: '0 2px 8px rgba(29,78,216,.35)',
                        }}>+ Nouvel utilisateur</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.surface2 }}>
                                {['Nom', 'Email', 'Rôle', 'Statut', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: T.textSub, letterSpacing: '.04em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => {
                                const rc = ROLE_CFG[u.role] || ROLE_CFG.LECTEUR
                                return (
                                    <tr key={u.user_id} style={{ borderBottom: i < users.length - 1 ? `1px solid ${T.border}` : 'none', opacity: u.actif ? 1 : .5, transition: 'opacity .2s' }}>
                                        <td style={{ padding: '13px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `linear-gradient(135deg,${rc.color},${rc.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                                                    {u.nom && u.nom[0] ? u.nom[0].toUpperCase() : '?'}
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: '500', color: T.text }}>{u.nom}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 16px', fontSize: '12px', color: T.textSub }}>{u.email}</td>
                                        <td style={{ padding: '13px 16px' }}>
                                            <span style={{ padding: '2px 9px', borderRadius: '99px', background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, fontSize: '11px', fontWeight: '600' }}>{u.role}</span>
                                        </td>
                                        <td style={{ padding: '13px 16px' }}>
                                            <span style={{
                                                padding: '2px 9px', borderRadius: '99px', fontSize: '11px', fontWeight: '600',
                                                background: u.actif ? (dark ? 'rgba(22,163,74,.1)' : '#f0fdf4') : (dark ? 'rgba(100,116,139,.1)' : '#f8fafc'),
                                                color: u.actif ? '#16a34a' : '#64748b',
                                                border: `1px solid ${u.actif ? (dark ? 'rgba(22,163,74,.25)' : '#86efac') : T.border}`,
                                            }}>{u.actif ? 'Actif' : 'Inactif'}</span>
                                        </td>
                                        <td style={{ padding: '13px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => openEdit(u)} style={{ padding: '5px 11px', borderRadius: '6px', border: `1px solid ${T.border}`, background: 'transparent', color: T.textSub, fontSize: '11px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                    ✏ Modifier
                                                </button>
                                                {u.role !== 'ADMIN' && (
                                                    <>
                                                        <button onClick={() => toggleActif(u)} style={{
                                                            padding: '5px 11px', borderRadius: '6px',
                                                            border: `1px solid ${u.actif ? '#fca5a5' : '#86efac'}`,
                                                            background: 'transparent',
                                                            color: u.actif ? '#dc2626' : '#16a34a',
                                                            fontSize: '11px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                                                        }}>
                                                            {u.actif ? '🔒 Désactiver' : '🔓 Réactiver'}
                                                        </button>
                                                        <button onClick={() => { setTarget(u); setModal('delete') }} style={{
                                                            padding: '5px 9px', borderRadius: '6px', border: `1px solid ${T.border}`,
                                                            background: 'transparent', color: T.textMut,
                                                            fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                                                        }}>🗑</button>
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

                {/* ── Matrice RBAC ────────────────────────────────────────── */}
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', boxShadow: T.shadow, overflow: 'hidden' }}>
                    <div style={{ padding: '13px 18px', borderBottom: `1px solid ${T.border}`, fontWeight: '600', fontSize: '13px', color: T.text }}>
                        Matrice des permissions RBAC
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.surface2 }}>
                                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: T.textSub, letterSpacing: '.04em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>Ressource</th>
                                {Object.keys(PERMS).map(role => {
                                    const rc = ROLE_CFG[role]
                                    return <th key={role} style={{ padding: '10px 16px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                                        <span style={{ padding: '2px 9px', borderRadius: '99px', background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, fontSize: '11px', fontWeight: '600' }}>{role}</span>
                                    </th>
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
                                <tr key={key} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                                    <td style={{ padding: '11px 16px', fontSize: '12px', fontWeight: '500', color: T.text }}>{label}</td>
                                    {Object.entries(PERMS).map(([role, perms]) => (
                                        <td key={role} style={{ padding: '11px 16px', textAlign: 'center', fontSize: '16px' }}>{perms[key] ? '✅' : '❌'}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ══ MODAL Ajouter / Modifier ════════════════════════════════ */}
            {(modal === 'add' || modal === 'edit') && (
                <ModalWrap title={modal === 'add' ? '➕ Nouvel utilisateur' : '✏ Modifier l\'utilisateur'}>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <label style={labelStyle}>Nom complet</label>
                            <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                                placeholder="Ex: DUPONT Jean" style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#1d4ed8'} onBlur={e => e.target.style.borderColor = T.border} />
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="email@urba-drain.ma" style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#1d4ed8'} onBlur={e => e.target.style.borderColor = T.border} />
                        </div>
                        <div>
                            <label style={labelStyle}>Rôle</label>
                            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                {Object.keys(ROLE_CFG).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        {modal === 'add' && (
                            <div>
                                <label style={labelStyle}>Mot de passe initial</label>
                                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="Min. 8 caractères" style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#1d4ed8'} onBlur={e => e.target.style.borderColor = T.border} />
                            </div>
                        )}
                        {/* Aperçu permissions */}
                        <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '12px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: T.textSub, marginBottom: '8px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                                Permissions — {form.role}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {Object.entries(PERMS[form.role] || {}).map(([k, v]) => (
                                    <span key={k} style={{
                                        padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '500',
                                        background: v ? (dark ? 'rgba(22,163,74,.1)' : '#f0fdf4') : (dark ? 'rgba(100,116,139,.1)' : '#f8fafc'),
                                        color: v ? '#16a34a' : '#94a3b8',
                                        border: `1px solid ${v ? (dark ? 'rgba(22,163,74,.25)' : '#86efac') : T.border}`,
                                    }}>{v ? '✓' : '✗'} {k}</span>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button onClick={() => setModal(null)} style={{ flex: 1, padding: '9px', borderRadius: '7px', border: `1px solid ${T.border}`, background: 'transparent', color: T.textSub, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
                            <button onClick={modal === 'add' ? saveAdd : saveEdit} style={{ flex: 1, padding: '9px', borderRadius: '7px', border: 'none', background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                                {modal === 'add' ? 'Créer le compte' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </ModalWrap>
            )}

            {/* ══ MODAL Supprimer ═════════════════════════════════════════ */}
            {modal === 'delete' && target && (
                <ModalWrap title="🗑 Supprimer le compte">
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ padding: '14px', borderRadius: '8px', background: dark ? 'rgba(220,38,38,.1)' : '#fef2f2', border: '1px solid #fca5a5' }}>
                            <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '6px' }}>⚠ Action irréversible</div>
                            <div style={{ fontSize: '13px', color: T.textSub, lineHeight: '1.6' }}>
                                Supprimer définitivement <strong style={{ color: T.text }}>{target.nom}</strong> ?
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setModal(null)} style={{ flex: 1, padding: '9px', borderRadius: '7px', border: `1px solid ${T.border}`, background: 'transparent', color: T.textSub, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
                            <button onClick={deleteUser} style={{ flex: 1, padding: '9px', borderRadius: '7px', border: 'none', background: '#dc2626', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer définitivement</button>
                        </div>
                    </div>
                </ModalWrap>
            )}

            {/* ══ TOAST ═══════════════════════════════════════════════════ */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000,
                    padding: '12px 18px', borderRadius: '10px',
                    background: toast.type === 'error' ? '#dc2626' : toast.type === 'info' ? '#1d4ed8' : '#16a34a',
                    color: 'white', fontSize: '13px', fontWeight: '500',
                    boxShadow: '0 4px 16px rgba(0,0,0,.25)', animation: 'fadeUp .2s ease',
                }}>
                    {toast.type === 'error' ? '⚠ ' : toast.type === 'info' ? 'ℹ ' : '✓ '}{toast.msg}
                </div>
            )}
        </>
    )
}
