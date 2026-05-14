'use client';
import { useEmailStore } from '@/store/useEmailStore';
import { Email } from '@/lib/types';

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getAvatarColor(name: string): string {
  const colors = ['#4285f4','#ea4335','#34a853','#fbbc04','#9334e6','#ff6d01','#e91e63','#00bcd4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getPriorityLabel(email: Email) {
  if (email.aiCategory === 'urgent') return <span className="priority-badge urgent">Urgent</span>;
  if (email.aiCategory === 'important') return <span className="priority-badge important">Important</span>;
  if (email.aiCategory === 'newsletter') return <span className="priority-badge newsletter">Newsletter</span>;
  return null;
}

export default function EmailList() {
  const { emails, selectedEmail, selectEmail, searchQuery, setSearch, toggleStar, isLoading } = useEmailStore();

  return (
    <div className="email-list-panel">
      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            id="search-input"
          />
          {searchQuery && (
            <button className="close-btn" onClick={() => setSearch('')} style={{ fontSize: 14 }}>✕</button>
          )}
        </div>
      </div>

      <div className="email-list">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="email-list-item" style={{ flexDirection: 'column', gap: 8 }}>
              <div className="skeleton" style={{ width: '60%', height: 14 }} />
              <div className="skeleton" style={{ width: '90%', height: 12 }} />
              <div className="skeleton" style={{ width: '75%', height: 12 }} />
            </div>
          ))
        ) : emails.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 13 }}>No emails found</div>
          </div>
        ) : (
          emails.map(email => (
            <div
              key={email.id}
              className={`email-list-item ${!email.read ? 'unread' : ''} ${selectedEmail?.id === email.id ? 'active' : ''}`}
              onClick={() => selectEmail(email)}
              id={`email-${email.id}`}
            >
              <div className="email-item-avatar" style={{ background: getAvatarColor(email.from.name) }}>
                {email.from.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="email-item-content">
                <div className="email-item-header">
                  <span className="email-item-from">{email.from.name}</span>
                  <span className="email-item-date">{getRelativeTime(email.date)}</span>
                </div>
                <div className="email-item-subject">{email.subject}</div>
                <div className="email-item-snippet">{email.snippet}</div>
                <div className="email-item-meta">
                  {getPriorityLabel(email)}
                  {email.attachments.length > 0 && <span className="attachment-indicator">📎</span>}
                  <button
                    className={`star-btn ${email.starred ? 'starred' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }}
                    aria-label="Toggle star"
                  >
                    {email.starred ? '★' : '☆'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
