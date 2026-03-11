// Risk level helpers
export const risqueConfig = {
  FAIBLE:   { label: 'Faible',    cls: 'badge-green',  dot: 'live-dot-green' },
  MOYEN:    { label: 'Moyen',     cls: 'badge-yellow', dot: 'live-dot-yellow' },
  ELEVE:    { label: 'Élevé',     cls: 'badge-orange', dot: 'live-dot-yellow' },
  CRITIQUE: { label: 'Critique',  cls: 'badge-red',    dot: 'live-dot-red' },
}

// Sensor status helpers
export const capteurStatutConfig = {
  ACTIF:       { label: 'Actif',        cls: 'badge-green'  },
  INACTIF:     { label: 'Inactif',      cls: 'badge-muted'  },
  MAINTENANCE: { label: 'Maintenance',  cls: 'badge-yellow' },
  DEFAILLANT:  { label: 'Défaillant',   cls: 'badge-red'    },
}

// Pump status helpers
export const pompeStatutConfig = {
  ACTIVE:      { label: 'Active',       cls: 'badge-green',  dot: 'live-dot-green'  },
  INACTIVE:    { label: 'Inactive',     cls: 'badge-muted',  dot: null              },
  MAINTENANCE: { label: 'Maintenance',  cls: 'badge-yellow', dot: 'live-dot-yellow' },
  PANNE:       { label: 'Panne',        cls: 'badge-red',    dot: 'live-dot-red'    },
}

// Alert severity
export const severiteConfig = {
  INFO:          { label: 'Info',          cls: 'badge-cyan'   },
  AVERTISSEMENT: { label: 'Avertissement', cls: 'badge-yellow' },
  CRITIQUE:      { label: 'Critique',      cls: 'badge-orange' },
  URGENCE:       { label: 'Urgence',       cls: 'badge-red'    },
}

// Alert type labels
export const typeAlerteLabels = {
  NIVEAU_ELEVE:  'Niveau élevé',
  PANNE_CAPTEUR: 'Panne capteur',
  PANNE_POMPE:   'Panne pompe',
  MAINTENANCE:   'Maintenance',
}

// Sensor type
export const typeCapteurConfig = {
  NIVEAU:   { label: 'Niveau',   unit: 'm',    color: 'var(--cyan)' },
  DEBIT:    { label: 'Débit',    unit: 'm³/s', color: 'var(--blue-bright)' },
  PRESSION: { label: 'Pression', unit: 'bar',  color: 'var(--yellow)' },
}

// Format date
export const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const fmtDatetime = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const fmtNum = (n) => (n !== null && n !== undefined) ? Number(n).toLocaleString('fr-FR') : '—'
