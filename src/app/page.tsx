'use client';
import { useEffect, useState } from 'react';
import { useEmailStore } from '@/store/useEmailStore';
import Sidebar from '@/components/Sidebar';
import EmailList from '@/components/EmailList';
import EmailDetail from '@/components/EmailDetail';
import ComposeModal from '@/components/ComposeModal';

export default function Home() {
  const { selectedEmail, isSidebarOpen, isComposeOpen, toggleSidebar, fetchEmails } = useEmailStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); fetchEmails(); }, [fetchEmails]);

  if (!mounted) return <div className="app-layout"><div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="ai-sparkle" style={{ fontSize: 32 }}>✨</div></div></div>;

  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} onClick={toggleSidebar} />
      <Sidebar />
      <div className="main-content">
        <header className="header">
          <button className="hamburger" onClick={toggleSidebar} aria-label="Toggle sidebar">☰</button>
          <h1 className="header-title">
            {selectedEmail ? '' : 'Inbox'}
          </h1>
        </header>
        <div className="content-area">
          <EmailList />
          <EmailDetail />
        </div>
      </div>
      {isComposeOpen && <ComposeModal />}
    </div>
  );
}
