'use client';
import { useEmailStore } from '@/store/useEmailStore';

const folders = [
  { id: 'inbox' as const, name: 'Inbox', icon: '📥' },
  { id: 'starred' as const, name: 'Starred', icon: '⭐' },
  { id: 'sent' as const, name: 'Sent', icon: '📤' },
  { id: 'drafts' as const, name: 'Drafts', icon: '📝' },
  { id: 'archive' as const, name: 'Archive', icon: '📦' },
  { id: 'trash' as const, name: 'Trash', icon: '🗑️' },
];

export default function Sidebar() {
  const {
    accounts, activeAccountId, labels, currentFolder, isSidebarOpen,
    setFolder, setActiveAccount, openCompose, toggleSidebar, emails,
  } = useEmailStore();

  const unreadCount = emails.filter(e => !e.read).length;

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">M</div>
        <span className="sidebar-brand">MailMind</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>AI</span>
      </div>

      <button className="compose-btn" onClick={() => { openCompose('new'); toggleSidebar(); }}>
        ✏️ Compose
      </button>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Folders</div>
        {folders.map(f => (
          <div
            key={f.id}
            className={`nav-item ${currentFolder === f.id ? 'active' : ''}`}
            onClick={() => { setFolder(f.id); toggleSidebar(); }}
          >
            <span className="icon">{f.icon}</span>
            <span>{f.name}</span>
            {f.id === 'inbox' && unreadCount > 0 && (
              <span className="count unread">{unreadCount}</span>
            )}
          </div>
        ))}

        <div className="nav-section-title" style={{ marginTop: 12 }}>Labels</div>
        {labels.map(l => (
          <div key={l.id} className="nav-item">
            <span className="label-dot" style={{ background: l.color }} />
            <span>{l.name}</span>
            <span className="count">{l.count}</span>
          </div>
        ))}
      </nav>

      <div className="account-section">
        <div className="nav-section-title">Accounts</div>
        <div
          className={`account-item ${!activeAccountId ? 'active' : ''}`}
          onClick={() => setActiveAccount(null)}
        >
          <div className="account-avatar" style={{ background: 'var(--gradient-accent)', fontSize: 10 }}>ALL</div>
          <div className="account-info">
            <div className="account-name">All Accounts</div>
            <div className="account-email">Unified inbox</div>
          </div>
        </div>
        {accounts.map(a => (
          <div
            key={a.id}
            className={`account-item ${activeAccountId === a.id ? 'active' : ''}`}
            onClick={() => setActiveAccount(a.id)}
          >
            <div className="account-avatar" style={{ background: a.color }}>
              {a.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="account-info">
              <div className="account-name">{a.name}</div>
              <div className="account-email">{a.email}</div>
            </div>
            {a.unreadCount > 0 && <span className="count unread">{a.unreadCount}</span>}
          </div>
        ))}
      </div>
    </aside>
  );
}
