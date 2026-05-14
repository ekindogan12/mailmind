'use client';
import { useState } from 'react';
import { useEmailStore } from '@/store/useEmailStore';

export default function ComposeModal() {
  const { closeCompose, sendEmail, composeMode, replyToEmail } = useEmailStore();

  const [to, setTo] = useState(composeMode === 'reply' && replyToEmail ? replyToEmail.from.email : '');
  const [subject, setSubject] = useState(
    composeMode === 'reply' && replyToEmail ? `Re: ${replyToEmail.subject}` :
    composeMode === 'forward' && replyToEmail ? `Fwd: ${replyToEmail.subject}` : ''
  );
  const [body, setBody] = useState(
    composeMode === 'forward' && replyToEmail
      ? `\n\n---------- Forwarded message ----------\nFrom: ${replyToEmail.from.name} <${replyToEmail.from.email}>\nSubject: ${replyToEmail.subject}\n\n${replyToEmail.body}`
      : ''
  );

  const handleSend = () => {
    if (!to || !subject) return;
    sendEmail(to, subject, body);
  };

  const title = composeMode === 'reply' ? 'Reply' : composeMode === 'forward' ? 'Forward' : 'New Message';

  return (
    <div className="compose-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeCompose(); }}>
      <div className="compose-modal">
        <div className="compose-header">
          <span className="compose-title">{title}</span>
          <button className="close-btn" onClick={closeCompose}>x</button>
        </div>
        <div className="compose-fields">
          <div className="compose-field">
            <label>To</label>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@email.com" id="compose-to" />
          </div>
          <div className="compose-field">
            <label>Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" id="compose-subject" />
          </div>
        </div>
        <div className="compose-body">
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." id="compose-body" />
        </div>
        <div className="compose-footer">
          <button className="send-btn" onClick={handleSend} id="compose-send">Send</button>
          <button className="action-btn" onClick={closeCompose}>Discard</button>
        </div>
      </div>
    </div>
  );
}
