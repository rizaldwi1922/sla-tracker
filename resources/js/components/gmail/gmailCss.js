export const gmailCss = `
  /* ── Gmail page base ─────────────────────────────── */
  .gm-page { font-family: 'Plus Jakarta Sans', sans-serif; height: 100%; }

  /* ── Back / nav button ───────────────────────────── */
  .gm-back-btn {
    display: inline-flex; align-items: center; gap: 7px;
    color: #64748b; font-size: 13px; font-weight: 600;
    cursor: pointer; padding: 6px 12px 6px 8px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: none;
    transition: color 0.15s, background 0.15s, border-color 0.15s;
  }
  .gm-back-btn:hover {
    color: #93c5fd; background: rgba(59,130,246,0.08);
    border-color: rgba(59,130,246,0.2);
  }

  /* ── Tab bar ─────────────────────────────────────── */
  .gm-tabs {
    display: flex; gap: 4px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 4px;
  }
  .gm-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 18px;
    border-radius: 9px;
    border: none; background: none;
    font-family: inherit; font-size: 13px; font-weight: 600;
    color: #64748b; cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }
  .gm-tab:hover { color: #cbd5e1; background: rgba(255,255,255,0.05); }
  .gm-tab.active {
    color: #e2e8f0;
    background: rgba(255,255,255,0.09);
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
  .gm-tab .tab-count {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 20px; height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: rgba(59,130,246,0.2);
    color: #93c5fd;
    font-size: 10px; font-weight: 700;
  }
  .gm-tab.active .tab-count { background: #3b82f6; color: #fff; }

  /* ── Email list ──────────────────────────────────── */
  .gm-list {
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    overflow: hidden;
    background: rgba(255,255,255,0.02);
  }

  .gm-list-item {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px;
    cursor: pointer;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    transition: background 0.15s;
    position: relative;
  }
  .gm-list-item:last-child { border-bottom: none; }
  .gm-list-item:hover { background: rgba(255,255,255,0.04); }
  .gm-list-item.unread { background: rgba(59,130,246,0.04); }
  .gm-list-item.unread:hover { background: rgba(59,130,246,0.07); }

  /* Unread dot */
  .gm-list-item.unread::before {
    content: '';
    position: absolute; left: 6px; top: 50%; transform: translateY(-50%);
    width: 5px; height: 5px; border-radius: 50%;
    background: #3b82f6;
  }

  .gm-sender-col { flex: 0 0 180px; min-width: 0; }
  .gm-sender-name {
    font-size: 13px; font-weight: 600;
    color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .gm-list-item.unread .gm-sender-name { color: #f1f5f9; font-weight: 700; }

  .gm-subject-col { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; }
  .gm-subject-text {
    font-size: 13px; color: #94a3b8; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .gm-list-item.unread .gm-subject-text { color: #cbd5e1; font-weight: 600; }

  .gm-snippet {
    font-size: 13px; color: #475569; font-weight: 400;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    flex-shrink: 1;
  }
  .gm-list-item.unread .gm-snippet { color: #64748b; }

  .gm-meta-col {
    flex: 0 0 auto;
    display: flex; flex-direction: column; align-items: flex-end; gap: 5px;
  }
  .gm-date {
    font-size: 11px; color: #475569; white-space: nowrap; font-weight: 500;
  }
  .gm-list-item.unread .gm-date { color: #93c5fd; font-weight: 700; }

  /* ── Label chip ──────────────────────────────────── */
  .gm-label {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 20px;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  /* ── Attachment icon ─────────────────────────────── */
  .gm-attach { color: #475569; font-size: 13px; }

  /* ── Search bar ──────────────────────────────────── */
  .gm-search-wrap {
    position: relative; flex: 1; max-width: 400px;
  }
  .gm-search-wrap .anticon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: #475569; font-size: 14px; z-index: 1;
  }

  /* ── Email detail ────────────────────────────────── */
  .gm-detail-header {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 24px 28px;
    margin-bottom: 16px;
  }
  .gm-detail-subject {
    font-size: 20px; font-weight: 800; color: #f1f5f9;
    line-height: 1.3; margin-bottom: 16px;
  }
  .gm-detail-body-wrap {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 24px 28px;
  }
  .gm-email-body {
    font-size: 14px !important;
    line-height: 1.8 !important;
    color: #94a3b8 !important;
  }
  .gm-email-body * {
    color: #94a3b8 !important;
    background: transparent !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    max-width: 100%;
  }
  .gm-email-body p  { margin-bottom: 12px !important; }
  .gm-email-body ul, .gm-email-body ol { padding-left: 22px !important; margin-bottom: 12px !important; }
  .gm-email-body li { margin-bottom: 5px !important; }
  .gm-email-body strong, .gm-email-body b { color: #cbd5e1 !important; font-weight: 700 !important; }
  .gm-email-body a { color: #60a5fa !important; text-decoration: underline; }
  .gm-email-body table { border-collapse: collapse !important; width: 100% !important; margin-bottom: 12px !important; }
  .gm-email-body td, .gm-email-body th { padding: 6px 10px !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; }
  .gm-email-body blockquote {
    border-left: 3px solid rgba(59,130,246,0.4) !important;
    padding-left: 16px !important; margin: 12px 0 !important;
    color: #475569 !important; font-style: italic;
  }

  /* ── Sales selector ──────────────────────────────── */
  .gm-sales-selector {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .gm-sales-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit; font-size: 13px; font-weight: 600;
    color: #64748b;
  }
  .gm-sales-chip:hover { border-color: rgba(255,255,255,0.2); color: #cbd5e1; background: rgba(255,255,255,0.07); }
  .gm-sales-chip.active {
    border-color: #3b82f6;
    background: rgba(59,130,246,0.12);
    color: #93c5fd;
    box-shadow: 0 0 0 1px rgba(59,130,246,0.2);
  }
  .gm-sales-chip .chip-avatar {
    width: 24px; height: 24px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
    background: rgba(59,130,246,0.2); color: #60a5fa;
    flex-shrink: 0;
  }

  /* ── Animations ──────────────────────────────────── */
  @keyframes gmFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .gm-animate { animation: gmFadeIn 0.25s ease both; }
  .gm-animate-delay-1 { animation-delay: 0.05s; }
  .gm-animate-delay-2 { animation-delay: 0.10s; }
  .gm-animate-delay-3 { animation-delay: 0.15s; }

  /* ── Empty state ─────────────────────────────────── */
  .gm-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 20px; gap: 12px;
  }

  /* ── Avatar ──────────────────────────────────────── */
  .gm-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; flex-shrink: 0;
  }
`;
