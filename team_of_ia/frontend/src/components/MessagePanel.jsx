import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle, User, X, MessageSquare } from 'lucide-react';
import { 
  getMessages, getMessageUsers, markMessageAsRead, sendMessage 
} from '../api/client';

export default function MessagePanel({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    destinataire_id: '',
    sujet: '',
    contenu: ''
  });

  const fetchMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (err) {
      console.error("Erreur lecture messages:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getMessageUsers();
      setUsers(data);
    } catch (err) {
      console.error("Erreur lecture utilisateurs:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markMessageAsRead(id);
      fetchMessages();
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendMessage({
        destinataire_id: parseInt(formData.destinataire_id),
        sujet: formData.sujet,
        contenu: formData.contenu
      });
      setFormData({ destinataire_id: '', sujet: '', contenu: '' });
      setActiveTab('inbox');
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = messages.filter(m => !m.lu).length;

  const ROLE_COLORS = {
    ADMIN: '#a78bfa',
    OPERATEUR: '#3b82f6',
    TECHNICIEN: '#06b6d4',
    LECTEUR: '#94a3b8',
  };

  return (
    <div style={{
      background: 'rgba(12, 20, 38, 0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px',
      padding: '24px',
      color: '#f1f5f9',
      fontFamily: '"Inter", sans-serif',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '400px',
      maxWidth: '700px',
      width: '100%',
      margin: '0 auto'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <div style={{ position: 'relative' }}>
            <MessageSquare color="#3b82f6" size={24} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: '#ef4444', color: 'white', borderRadius: '50%',
                width: '18px', height: '18px', fontSize: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', boxShadow: '0 0 8px rgba(239,68,68,0.6)'
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          Messagerie Interne
        </h2>
        {onClose && (
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {[
          { id: 'inbox', label: 'Boîte de réception', icon: <Mail size={16} /> },
          { id: 'compose', label: 'Nouveau Message', icon: <Send size={16} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
            background: activeTab === t.id ? 'rgba(59,130,246,0.2)' : 'transparent',
            border: activeTab === t.id ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
            color: activeTab === t.id ? '#3b82f6' : '#94a3b8',
            fontWeight: '600', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit'
          }}>
            {t.icon} {t.label}
            {t.id === 'inbox' && unreadCount > 0 && (
              <span style={{ background: '#ef4444', color: 'white', borderRadius: '99px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* INBOX */}
        {activeTab === 'inbox' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', marginTop: '60px' }}>
                <MessageSquare size={40} color="#334155" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ margin: 0, fontSize: '14px' }}>Aucun message reçu.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.message_id} style={{
                  background: msg.lu ? 'rgba(255,255,255,0.02)' : 'rgba(59,130,246,0.05)',
                  border: msg.lu ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(59,130,246,0.4)',
                  borderRadius: '14px', padding: '16px',
                  display: 'flex', flexDirection: 'column', gap: '10px'
                }}>

                  {/* Sujet + Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '15px', fontWeight: msg.lu ? '500' : '700', color: msg.lu ? '#94a3b8' : '#f1f5f9' }}>
                      {!msg.lu && <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', marginRight: '8px', boxShadow: '0 0 6px #3b82f6' }} />}
                      {msg.sujet}
                    </span>
                    <span style={{ fontSize: '11px', color: '#475569', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {new Date(msg.date_envoi).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Expéditeur */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: `${ROLE_COLORS[msg.expediteur_role] || '#94a3b8'}20`,
                      border: `1px solid ${ROLE_COLORS[msg.expediteur_role] || '#94a3b8'}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: ROLE_COLORS[msg.expediteur_role] || '#94a3b8',
                      fontSize: '11px', fontWeight: '700'
                    }}>
                      {msg.expediteur_nom ? msg.expediteur_nom.substring(0, 2).toUpperCase() : '??'}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                      {msg.expediteur_nom || `User ${msg.expediteur_id}`}
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '99px',
                      background: `${ROLE_COLORS[msg.expediteur_role] || '#94a3b8'}20`,
                      color: ROLE_COLORS[msg.expediteur_role] || '#94a3b8',
                      border: `1px solid ${ROLE_COLORS[msg.expediteur_role] || '#94a3b8'}40`
                    }}>
                      {msg.expediteur_role}
                    </span>
                  </div>

                  {/* Contenu */}
                  <p style={{
                    fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.6',
                    padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px'
                  }}>
                    {msg.contenu}
                  </p>

                  {/* Action */}
                  {!msg.lu && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleMarkAsRead(msg.message_id)} style={{
                        background: 'transparent', border: '1px solid rgba(59,130,246,0.3)',
                        color: '#3b82f6', fontSize: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '8px', fontFamily: 'inherit', fontWeight: '600'
                      }}>
                        <CheckCircle size={14} /> Marquer comme lu
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* COMPOSE */}
        {activeTab === 'compose' && (
          <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            {[
              { key: 'destinataire_id', label: 'Destinataire', type: 'select' },
              { key: 'sujet', label: 'Sujet', type: 'text', placeholder: 'Sujet du message...' },
              { key: 'contenu', label: 'Message', type: 'textarea', placeholder: 'Écrivez votre message ici...' },
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                {f.type === 'select' ? (
                  <select value={formData.destinataire_id} onChange={e => setFormData({...formData, destinataire_id: e.target.value})} required
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: '#f1f5f9', outline: 'none', fontFamily: 'inherit', fontSize: '14px' }}>
                    <option value="" disabled style={{ color: '#0f172a' }}>Sélectionner un utilisateur...</option>
                    {users.map(u => (
                      <option key={u.user_id} value={u.user_id} style={{ color: '#0f172a' }}>{u.nom} — {u.role}</option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea value={formData.contenu} onChange={e => setFormData({...formData, contenu: e.target.value})} required placeholder={f.placeholder} rows={6}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: '#f1f5f9', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.6' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                ) : (
                  <input type="text" value={formData.sujet} onChange={e => setFormData({...formData, sujet: e.target.value})} required placeholder={f.placeholder}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: '#f1f5f9', outline: 'none', fontFamily: 'inherit', fontSize: '14px' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                )}
              </div>
            ))}

            <button type="submit" disabled={loading} style={{
              background: loading ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff', border: 'none', borderRadius: '12px', padding: '14px',
              fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '8px', fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 8px 20px rgba(59,130,246,0.3)'
            }}>
              <Send size={16} /> {loading ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
