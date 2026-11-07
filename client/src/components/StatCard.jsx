import React from 'react';

export default function StatCard({ label, value, subtext, icon, valueColor }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="stat-label">{label}</span>
        {icon && <div style={{ opacity: 0.8 }}>{icon}</div>}
      </div>
      <div className="stat-value" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </div>
      {subtext && <div className="stat-footer">{subtext}</div>}
    </div>
  );
}
