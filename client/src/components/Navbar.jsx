import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, MessageSquareText, PlusCircle, LogOut, Shield, User } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="brand" onClick={() => setActivePage('dashboard')}>
          <div className="brand-icon">🔄</div>
          <span>LOOP <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9em' }}>Lite</span></span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-link ${activePage === 'inbox' ? 'active' : ''}`}
            onClick={() => setActivePage('inbox')}
          >
            <MessageSquareText size={18} />
            <span>Feedback</span>
          </button>

          {isAdmin && (
            <button
              className={`nav-link ${activePage === 'add' ? 'active' : ''}`}
              onClick={() => setActivePage('add')}
            >
              <PlusCircle size={18} />
              <span>Add Feedback</span>
            </button>
          )}
        </nav>

        <div className="nav-user">
          <div className="user-badge">
            {isAdmin ? <Shield size={14} color="#60a5fa" /> : <User size={14} color="#94a3b8" />}
            <span style={{ fontWeight: 600 }}>{user?.name || 'User'}</span>
            <span className={`role-tag ${user?.role === 'admin' ? 'admin' : 'viewer'}`}>
              {user?.role}
            </span>
          </div>

          <button className="btn-logout" onClick={logout} title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
