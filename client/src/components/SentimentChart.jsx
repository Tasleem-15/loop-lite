import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export function SentimentPieChart({ data = [] }) {
  if (!data || data.length === 0 || data.every(d => d.count === 0)) {
    return <div className="empty-state">No sentiment data available</div>;
  }

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          padding: '0.5rem 0.85rem',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '0.85rem'
        }}>
          <strong>{item.name}:</strong> {item.value} items
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || '#3b82f6'} />
            ))}
          </Pie>
          <Tooltip content={customTooltip} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
        {data.map(item => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.fill }} />
            <span style={{ color: '#94a3b8' }}>{item.name}:</span>
            <span style={{ fontWeight: 700, color: '#fff' }}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChannelBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="empty-state">No channel breakdown available</div>;
  }

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis 
            dataKey="channel" 
            stroke="#64748b" 
            fontSize={11} 
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.85rem'
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
