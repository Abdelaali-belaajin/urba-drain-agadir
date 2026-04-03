import { useState, useEffect } from 'react';
import { ShieldCheck, Users, FileText, Plus, Edit2, Trash2, Power, AlertTriangle, Key, Search, ChevronRight, Check, CheckCircle, Mail, Globe } from 'lucide-react';
import client, { getUsers, createUser, updateUser, toggleUser, deleteUser, getLogs, resetSystem, notifyCitizens, getZones } from '../api/client';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('users'); // users, rbac, logs, smartcity
    const [users, setUsers] = useState([]);
    const [zones, setZones] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [isNotifying, setIsNotifying] = useState(false);
    const [selectedZone, setSelectedZone] = useState('');

    // Modal States
    const [showUserModal, setShowUserModal] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [formData, setFormData] = useState({ nom: '', email: '', mot_de_passe: '', role: 'LECTEUR' });
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            showToast("Erreur chargement utilisateurs", "error");
        }
    };

    const fetchLogs = async () => {
        try {
            const data = await getLogs();
            setLogs(data);
        } catch (err) {
            showToast("Erreur chargement logs", "error");
        }
    };

    const fetchZones = async () => {
        try {
            const data = await getZones();
            setZones(data);
            if (data.length > 0) setSelectedZone(data[0].zone_id);
        } catch (err) {
            showToast("Erreur chargement zones", "error");
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            if (activeTab === 'users' || activeTab === 'rbac') await fetchUsers();
            if (activeTab === 'logs') await fetchLogs();
            if (activeTab === 'smartcity') await fetchZones();
            setLoading(false);
        };
        load();
    }, [activeTab]);

    const handleSaveUser = async () => {
        if (!formData.nom || !formData.email || (!editUserId && !formData.mot_de_passe)) return;
        try {
            if (editUserId) {
                // Pour l'édition, on n'envoie pas le mot de passe s'il est vide
                const payload = { nom: formData.nom, email: formData.email, role: formData.role };
                if (formData.mot_de_passe) payload.password = formData.mot_de_passe;
                await updateUser(editUserId, payload);
                showToast("Utilisateur modifié ✓");
            } else {
                await createUser({ nom: formData.nom, email: formData.email, password: formData.mot_de_passe, role: formData.role });
                showToast("Utilisateur créé ✓");
            }
            setShowUserModal(false);
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.error || "Erreur de sauvegarde", "error");
        }
    };

    const handleToggleUser = async (id) => {
        try {
            await toggleUser(id);
            showToast("Statut modifié ✓");
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.error || "Erreur", "error");
        }
    };

    const handleDeleteUser = async () => {
        try {
            await deleteUser(showDeleteModal.user_id);
            showToast("Utilisateur supprimé", "error"); // Red for deletion
            setShowDeleteModal(null);
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.error || "Erreur de suppression", "error");
        }
    };

    const handleNotifyCitizens = async () => {
        if (!selectedZone) return;
        
        // Validation locale pour feedback rapide
        const zoneObj = zones.find(z => String(z.zone_id) === String(selectedZone));
        if (zoneObj && !["CRITIQUE", "ELEVE"].includes(zoneObj.niveau_risque)) {
            showToast("Notification non autorisée : la zone n'est ni en état CRITIQUE ni en état ELEVE.", "error");
            return;
        }

        setIsNotifying(true);
        try {
            const res = await notifyCitizens(selectedZone);
            showToast(res.message || "Emails envoyés avec succès ✓");
        } catch (err) {
            showToast(err.response?.data?.error || "Erreur lors de la notification", "error");
        } finally {
            setIsNotifying(false);
        }
    };

    const handleSystemReset = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir réinitialiser tout le système ? Cette action va remettre à zéro les alertes, pompes et zones.")) return;
        setIsResetting(true);
        try {
            await resetSystem();
            showToast("Système réinitialisé avec succès ✓");
            // Force le rafraîchissement global pour que le Dashboard, la Carte et les Alertes soient synchrones
            setTimeout(() => {
                window.location.reload();
            }, 800);
        } catch (err) {
            showToast(err.response?.data?.error || "Erreur lors de la réinitialisation", "error");
        } finally {
            setIsResetting(false);
        }
    };

    const ROLE_CFG = {
        ADMIN: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
        OPERATEUR: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
        TECHNICIEN: { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)' },
        LECTEUR: { color: '#94a3b8', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
    };

    const PERMS = {
        ADMIN: { zones: true, capteurs: true, pompes: true, alertes: true, users: true, logs: true },
        OPERATEUR: { zones: true, capteurs: true, pompes: true, alertes: true, users: false, logs: false },
        TECHNICIEN: { zones: true, capteurs: true, pompes: true, alertes: true, users: false, logs: false },
        LECTEUR: { zones: true, capteurs: false, pompes: false, alertes: false, users: false, logs: false },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
            {/* Header & Inner Tabs */}
            <div style={{
                background: 'rgba(12, 20, 38, 0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.2)', borderTop: '4px solid #8b5cf6', borderRadius: '24px',
                padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.15)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.2))', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,0.3)' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f1f5f9', margin: 0, letterSpacing: '-0.02em' }}>Administration Système</h2>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>Accès restreint aux administrateurs</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {[
                        { id: 'users', label: 'Utilisateurs', icon: <Users size={16} /> },
                        { id: 'rbac', label: 'Permissions (RBAC)', icon: <Key size={16} /> },
                        { id: 'logs', label: 'Logs Système', icon: <FileText size={16} /> },
                        { id: 'smartcity', label: 'Smart City Connect', icon: <Globe size={16} /> }
                    ].map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} className="transition-all" style={{
                            padding: '10px 16px', borderRadius: '10px',
                            background: activeTab === t.id ? 'rgba(139,92,246,0.15)' : 'transparent',
                            color: activeTab === t.id ? '#a78bfa' : '#94a3b8',
                            border: `1px solid ${activeTab === t.id ? 'rgba(139,92,246,0.3)' : 'transparent'}`,
                            fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{
                background: 'rgba(12, 20, 38, 0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column'
            }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '400px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                        {/* BOUTON RESET SYSTEME MASSIVEMENT VISIBLE */}
                        <div style={{ margin: '24px 24px 0 24px', padding: '16px 20px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                                    <Power size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '800', color: '#f1f5f9', fontSize: '16px' }}>Reset Système</div>
                                    <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>Remet à zéro l'état de la simulation (Alertes, Zones, Pompes). Action prioritaire.</div>
                                </div>
                            </div>
                            <button 
                                onClick={handleSystemReset} 
                                disabled={isResetting}
                                style={{
                                    padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
                                    color: 'white', fontSize: '14px', fontWeight: '800', cursor: isResetting ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px', opacity: isResetting ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                                }}
                            >
                                <AlertTriangle size={18} />
                                {isResetting ? 'Reset en cours...' : 'DÉCLENCHER LE RESET'}
                            </button>
                        </div>

                        {/* TAB: USERS */}
                        {activeTab === 'users' && (
                            <>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Comptes Utilisateurs ({users.length})</h3>
                                    <button onClick={() => { setEditUserId(null); setFormData({ nom: '', email: '', mot_de_passe: '', role: 'LECTEUR' }); setShowUserModal(true); }} style={{
                                        padding: '10px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none',
                                        color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(139,92,246,0.3)'
                                    }}>
                                        <Plus size={16} /> Nouvel Utilisateur
                                    </button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                            <tr>
                                                {['Utilisateur', 'Rôle', 'Dernière Connexion', 'Statut', 'Actions'].map(h => (
                                                    <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => {
                                                const rc = ROLE_CFG[u.role] || ROLE_CFG.LECTEUR;
                                                return (
                                                    <tr key={u.user_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: rc.bg, border: `1px solid ${rc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rc.color, fontWeight: '700', fontSize: '14px' }}>
                                                                    {u.nom.substring(0,2).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>{u.nom}</div>
                                                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{u.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <span style={{ padding: '4px 10px', borderRadius: '6px', background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em' }}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#cbd5e1' }}>
                                                            {u.derniere_connexion ? new Date(u.derniere_connexion).toLocaleString('fr-FR') : 'Jamais'}
                                                        </td>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.actif ? '#22c55e' : '#64748b', boxShadow: u.actif ? '0 0 10px rgba(34,197,94,0.6)' : 'none' }} />
                                                                <span style={{ fontSize: '12px', fontWeight: '600', color: u.actif ? '#f1f5f9' : '#94a3b8' }}>{u.actif ? 'Actif' : 'Désactivé'}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={() => { setEditUserId(u.user_id); setFormData({ nom: u.nom, email: u.email, mot_de_passe: '', role: u.role }); setShowUserModal(true); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Modifier">
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                
                                                                {u.role !== 'ADMIN' && (
                                                                    <>
                                                                        <button onClick={() => handleToggleUser(u.user_id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${u.actif ? 'rgba(249,115,22,0.3)' : 'rgba(34,197,94,0.3)'}`, background: u.actif ? 'rgba(249,115,22,0.1)' : 'rgba(34,197,94,0.1)', color: u.actif ? '#f97316' : '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title={u.actif ? 'Désactiver' : 'Activer'}>
                                                                            <Power size={14} />
                                                                        </button>
                                                                        <button onClick={() => setShowDeleteModal(u)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Supprimer">
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* TAB: RBAC */}
                        {activeTab === 'rbac' && (
                            <div style={{ padding: '30px' }}>
                                <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', marginBottom: '30px', display: 'flex', gap: '16px' }}>
                                    <Key size={24} color="#a78bfa" />
                                    <div>
                                        <h4 style={{ margin: '0 0 8px 0', color: '#f1f5f9', fontSize: '15px' }}>Matrice de Contrôle d'Accès</h4>
                                        <p style={{ margin: 0, color: '#a78bfa', fontSize: '13px', lineHeight: '1.5' }}>Le système Urba-Drain Agadir utilise une approche stricte de Role-Based Access Control (RBAC). Cette matrice définit les permissions en lecture et écriture pour chaque entité système.</p>
                                    </div>
                                </div>
                                <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', background: 'rgba(0,0,0,0.2)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                                            <tr>
                                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>Ressource / Entité</th>
                                                {Object.keys(PERMS).map(role => {
                                                    const rc = ROLE_CFG[role];
                                                    return (
                                                        <th key={role} style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                                            <span style={{ padding: '4px 12px', borderRadius: '99px', background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, fontSize: '11px', fontWeight: '700' }}>{role}</span>
                                                        </th>
                                                    )
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { key: 'zones', label: '🗺 Vue détaillée des Zones' },
                                                { key: 'capteurs', label: '📡 Données des Capteurs (Lecture)' },
                                                { key: 'pompes', label: '⚙️ Contrôle des Pompes (Ecriture)' },
                                                { key: 'alertes', label: '⚠ Traitement des Alertes (Ecriture)' },
                                                { key: 'users', label: '👤 Gestion des Utilisateurs (CRUD)' },
                                                { key: 'logs', label: '📋 Logs Système (Lecture seule)' },
                                            ].map(({ key, label }, i, arr) => (
                                                <tr key={key} style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '500', color: '#f1f5f9' }}>{label}</td>
                                                    {Object.entries(PERMS).map(([role, perms]) => (
                                                        <td key={role} style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                            {perms[key] ? <Check size={18} color="#22c55e" style={{ margin: '0 auto' }} /> : <span style={{ color: '#475569', fontSize: '18px', fontWeight: '800' }}>-</span>}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB: LOGS */}
                        {activeTab === 'logs' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Derniers événements système (Lecture seule stricte garantie par Trigger)</div>
                                    <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', fontSize: '11px', fontWeight: '700' }}>INSERT ONLY</div>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                                    {logs.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Aucun log disponible.</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {logs.map(lg => (
                                                <div key={lg.log_id} style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'monospace', fontSize: '12px' }}>
                                                    <span style={{ color: '#cbd5e1', whiteSpace: 'nowrap' }}>{new Date(lg.date_action).toLocaleString('fr-FR')}</span>
                                                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontWeight: '600' }}>{lg.action}</span>
                                                    <span style={{ color: '#64748b' }}>User {lg.utilisateur_id}</span>
                                                    <span style={{ color: '#94a3b8', flex: 1 }}>{lg.details}</span>
                                                    <span style={{ color: '#475569' }}>IP: {lg.ip_address}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: SMART CITY */}
                        {activeTab === 'smartcity' && (
                            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ 
                                    padding: '24px', borderRadius: '16px', 
                                    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', 
                                    display: 'flex', gap: '16px' 
                                }}>
                                    <Globe size={24} color="#60a5fa" />
                                    <div>
                                        <h4 style={{ margin: '0 0 8px 0', color: '#f1f5f9', fontSize: '15px' }}>Communication Citoyenne</h4>
                                        <p style={{ margin: 0, color: '#93c5fd', fontSize: '13px', lineHeight: '1.5' }}>
                                            Connectez-vous directement aux résidents d'Agadir. Ce module permet de notifier les citoyens abonnés par email en cas d'urgence dans leur quartier.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ 
                                    background: 'rgba(15,23,42,0.4)', borderRadius: '20px', padding: '32px',
                                    border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px',
                                    maxWidth: '600px'
                                }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Sélectionner la Zone à Notifier</label>
                                        <select 
                                            value={selectedZone} 
                                            onChange={e => setSelectedZone(e.target.value)}
                                            style={{ 
                                                width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', 
                                                border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '14px', outline: 'none'
                                            }}
                                        >
                                            {zones.map(z => (
                                                <option key={z.zone_id} value={z.zone_id}>
                                                    {z.quartier} {z.niveau_risque !== 'FAIBLE' ? `(🚨 ${z.niveau_risque})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                                        <button 
                                            onClick={handleNotifyCitizens}
                                            disabled={isNotifying}
                                            style={{
                                                padding: '16px', borderRadius: '14px', 
                                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none',
                                                color: 'white', fontSize: '15px', fontWeight: '800', cursor: isNotifying ? 'not-allowed' : 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                                transition: 'all 0.2s', boxShadow: '0 10px 20px -5px rgba(59,130,246,0.4)',
                                                opacity: isNotifying ? 0.7 : 1
                                            }}
                                        >
                                            <Mail size={20} />
                                            {isNotifying ? "Envoi en cours..." : "Notifier les citoyens"}
                                        </button>
                                        <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                                            ⚠️ Cette action enverra un email à tous les résidents enregistrés dans la zone sélectionnée.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL: ADD/EDIT USER */}
            {showUserModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,13,26,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowUserModal(false)}>
                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', overflow: 'hidden', animation: 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>{editUserId ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h3>
                            <button onClick={() => setShowUserModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Nom complet</label>
                                <input type="text" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} placeholder="Ali Ahmed" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Email</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ali@urba-drain.ma" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Rôle</label>
                                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '14px', fontFamily: 'inherit', outline: 'none', appearance: 'none' }}>
                                    <option value="ADMIN">ADMIN (Accès total)</option>
                                    <option value="OPERATEUR">OPERATEUR (Zones, Pompes, Alertes)</option>
                                    <option value="TECHNICIEN">TECHNICIEN (Zones, Capteurs, Alertes)</option>
                                    <option value="LECTEUR">LECTEUR (Lecture Seule Zones)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Mot de passe {editUserId && '(Optionnel)'}</label>
                                <input type="password" value={formData.mot_de_passe} onChange={e => setFormData({...formData, mot_de_passe: e.target.value})} placeholder="••••••••" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>

                            <button onClick={handleSaveUser} disabled={!formData.nom || !formData.email || (!editUserId && !formData.mot_de_passe)} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: (!formData.nom || !formData.email || (!editUserId && !formData.mot_de_passe)) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: (!formData.nom || !formData.email || (!editUserId && !formData.mot_de_passe)) ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'all 0.2s' }}>
                                {editUserId ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: DELETE USER CONFIRMATION */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,13,26,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowDeleteModal(null)}>
                    <div style={{ background: '#0f172a', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(239,68,68,0.2)', overflow: 'hidden', animation: 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#ef4444' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Supprimer le compte ?</h3>
                            </div>
                            
                            <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>
                                Vous êtes sur le point de supprimer l'utilisateur <strong>{showDeleteModal.nom}</strong> de façon permanente. Cette action est irréversible et supprimera tout accès à la plateforme pour cet utilisateur.
                            </p>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                <button onClick={() => setShowDeleteModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontWeight: '600', cursor: 'pointer' }}>Annuler</button>
                                <button onClick={handleDeleteUser} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#ef4444', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}>Oui, Supprimer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Toast within Panel */}
             {toast && (
                <div style={{
                    position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
                    padding: '16px 20px', borderRadius: '14px',
                    background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : toast.type === 'info' ? 'rgba(59, 130, 246, 0.95)' : 'rgba(34, 197, 94, 0.95)',
                    backdropFilter: 'blur(10px)', color: 'white', fontSize: '14px', fontWeight: '600',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '12px',
                    animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
