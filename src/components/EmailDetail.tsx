'use client';
import { useState } from 'react';
import { useEmailStore } from '@/store/useEmailStore';

export default function EmailDetail() {
  const {
    selectedEmail, selectEmail, openCompose, archiveEmail, deleteEmail,
    toggleStar, aiSummary, aiDrafts, aiLoading, generateSummary, generateDrafts, sendEmail,
  } = useEmailStore();
  const [aiTab, setAiTab] = useState<'summary' | 'drafts'>('summary');

  if (!selectedEmail) {
    return (
      <div className="email-detail-panel">
        <div className="email-detail-empty">
          <div className="icon"></div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Select an email to read</div>
          <div style={{ fontSize: 13 }}>Choose from the list on the left</div>
        </div>
      </div>
    );
  }

  const email = selectedEmail;
  const avatarColor = (() => {
    const colors = ['#4285f4','#ea4335','#34a853','#fbbc04','#9334e6','#ff6d01','#e91e63','#00bcd4'];
    let hash = 0;
    for (let i = 0; i < email.from.name.length; i++) hash = email.from.name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  })();

  const dateStr = new Date(email.date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`email-detail-panel ${!selectedEmail ? 'hidden' : ''}`}>
      <div className="email-detail">
        {/* Mobile back button */}
        <button
          className="action-btn"
          onClick={() => selectEmail(null)}
          style={{ marginBottom: 16, display: 'none' }}
          id="back-btn"
        >
          ← Back
        </button>
        <style>{`@media(max-width:768px){#back-btn{display:flex !important}}`}</style>

        <h2 className="detail-subject">{email.subject}</h2>

        <div className="detail-header">
          <div className="detail-avatar" style={{ background: avatarColor }}>
            {email.from.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="detail-sender">
            <div className="detail-sender-name">{email.from.name}</div>
            <div className="detail-sender-email">
              &lt;{email.from.email}&gt; to {email.to.map(t => t.name || t.email).join(', ')}
            </div>
          </div>
          <div className="detail-date">{dateStr}</div>
        </div>

        <div className="detail-body">{email.body}</div>

        {email.attachments.length > 0 && (
          <div className="detail-attachments">
            <h4>Attachments ({email.attachments.length})</h4>
            {email.attachments.map(a => (
              <div key={a.id} className="attachment-chip">
                {a.name}
                <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>
                  {(a.size / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="detail-actions">
          <button className="action-btn primary" onClick={() => openCompose('reply', email)}>Reply</button>
          <button className="action-btn" onClick={() => openCompose('forward', email)}>Forward</button>
          <button className="action-btn" onClick={() => archiveEmail(email.id)}>Archive</button>
          <button className="action-btn" onClick={() => toggleStar(email.id)}>
            {email.starred ? 'Unstar' : 'Star'}
          </button>
          <button className="action-btn danger" onClick={() => deleteEmail(email.id)}>Delete</button>
        </div>

        {/* AI Panel */}
        <div className="ai-panel">
          <div className="ai-panel-header">
            AI Assistant
          </div>
          <div className="ai-panel-body">
            <div className="ai-tabs">
              <button
                className={`ai-tab ${aiTab === 'summary' ? 'active' : ''}`}
                onClick={() => { setAiTab('summary'); if (!aiSummary) generateSummary(email); }}
              >
                Summary
              </button>
              <button
                className={`ai-tab ${aiTab === 'drafts' ? 'active' : ''}`}
                onClick={() => { setAiTab('drafts'); if (!aiDrafts) generateDrafts(email); }}
              >
                Smart Reply
              </button>
            </div>

            {aiLoading ? (
              <div className="ai-loading">
                AI is thinking...
              </div>
            ) : aiTab === 'summary' ? (
              aiSummary ? (
                <div>
                  <div className="ai-summary">{aiSummary.summary}</div>
                  {aiSummary.actionItems.length > 0 && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginTop: 12 }}>Action Items</div>
                      <ul className="ai-action-items">
                        {aiSummary.actionItems.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </>
                  )}
                </div>
              ) : (
                <button className="action-btn" onClick={() => generateSummary(email)} style={{ width: '100%', justifyContent: 'center' }}>
                  Generate Summary
                </button>
              )
            ) : aiDrafts ? (
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: 'var(--success)', marginBottom: '10px', fontSize: '13px' }}>Positive Responses</h4>
                  {aiDrafts.drafts.filter(d => d.tone === 'positive').map((d, i) => (
                    <div key={i} className="ai-draft-card" onClick={() => {
                      sendEmail(email.from.email, `Re: ${email.subject}`, d.body);
                    }}>
                      <div className="ai-draft-body">{d.body}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8, textAlign: 'right' }}>Click to Send</div>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: 'var(--danger)', marginBottom: '10px', fontSize: '13px' }}>Negative Responses</h4>
                  {aiDrafts.drafts.filter(d => d.tone === 'negative').map((d, i) => (
                    <div key={i} className="ai-draft-card" onClick={() => {
                      sendEmail(email.from.email, `Re: ${email.subject}`, d.body);
                    }}>
                      <div className="ai-draft-body">{d.body}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8, textAlign: 'right' }}>Click to Send</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button className="action-btn" onClick={() => generateDrafts(email)} style={{ width: '100%', justifyContent: 'center' }}>
                Generate Reply Drafts
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
