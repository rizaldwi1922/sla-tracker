/**
 * GmailPage.jsx  —  Versi terintegrasi dengan Laravel API
 *
 * Perubahan dari versi dummy:
 *  - Data sales dari GET /api/sales
 *  - Data inbox  dari GET /api/gmail/{account}/inbox
 *  - Data sent   dari GET /api/gmail/{account}/sent
 *  - Detail pesan dari GET /api/gmail/{account}/message/{id}
 *  - Loading/error states
 */

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Typography, Spin, Alert } from "antd";
import {
  InboxOutlined, SendOutlined, SearchOutlined,
  PaperClipOutlined, MailOutlined, CalendarOutlined,
  DownOutlined, UpOutlined, ReloadOutlined,
  StarOutlined, CommentOutlined, LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";

// ── Hooks (ganti import dummy dengan hooks nyata) ─────────────────────────────
import { useSales, useInbox, useSent, useMessageDetail } from "../hook/useGmail";

// Impor CSS tetap sama
import '../config/gmail.css';

dayjs.extend(isToday);
const { Text } = Typography;

// ── Konstanta warna label ─────────────────────────────────────────────────────
const LABEL_COLORS = {
  INBOX    : { bg: "rgba(59,130,246,0.15)",  text: "#60a5fa",  border: "rgba(59,130,246,0.3)"  },
  SENT     : { bg: "rgba(34,197,94,0.15)",   text: "#4ade80",  border: "rgba(34,197,94,0.3)"   },
  UNREAD   : { bg: "rgba(249,115,22,0.15)",  text: "#fb923c",  border: "rgba(249,115,22,0.3)"  },
  STARRED  : { bg: "rgba(250,204,21,0.15)",  text: "#fde047",  border: "rgba(250,204,21,0.3)"  },
  IMPORTANT: { bg: "rgba(167,139,250,0.15)", text: "#c4b5fd",  border: "rgba(167,139,250,0.3)" },
  CATEGORY_PROMOTIONS: { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf", border: "rgba(20,184,166,0.3)" },
};

// ── Helpers visual ────────────────────────────────────────────────────────────
const PAL = [
  { bg: "rgba(59,130,246,0.2)",  color: "#60a5fa" },
  { bg: "rgba(167,139,250,0.2)", color: "#a78bfa" },
  { bg: "rgba(34,197,94,0.2)",   color: "#4ade80" },
  { bg: "rgba(249,115,22,0.2)",  color: "#fb923c" },
  { bg: "rgba(20,184,166,0.2)",  color: "#2dd4bf" },
];
const avPal = (name) => PAL[(name?.charCodeAt(0) ?? 0) % PAL.length];

function Av({ name, size = 32 }) {
  const p = avPal(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700,
      background: p.bg, color: p.color, flexShrink: 0,
    }}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

function Chip({ label }) {
  const c = LABEL_COLORS[label] ?? { bg: "rgba(255,255,255,0.08)", text: "#94a3b8", border: "rgba(255,255,255,0.15)" };
  return (
    <span className="gm-label" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {label}
    </span>
  );
}

function fmtD(iso) {
  if (!iso) return "";
  const d = dayjs(iso);
  if (d.isToday()) return d.format("HH:mm");
  if (dayjs().diff(d, "day") < 7) return d.format("ddd");
  return d.format("DD MMM");
}

// ── Collapsible body ──────────────────────────────────────────────────────────
function Body({ html }) {
  const [exp, setExp] = useState(false);
  const [over, setOver] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) setOver(ref.current.scrollHeight > 280); }, [html]);
  return (
    <div>
      <div ref={ref} className="gm-email-body"
        style={{ maxHeight: exp ? "none" : 280, overflow: "hidden", position: "relative" }}
        dangerouslySetInnerHTML={{ __html: html || "<em>No content</em>" }}
      />
      {!exp && over && (
        <div style={{ height: 48, marginTop: -48, position: "relative", background: "linear-gradient(transparent,rgba(7,15,32,0.97))", pointerEvents: "none" }} />
      )}
      {over && (
        <button className="gm-toggle" onClick={() => setExp(v => !v)}>
          {exp ? <><UpOutlined /> Show less</> : <><DownOutlined /> Show more</>}
        </button>
      )}
    </div>
  );
}

// ── Detail pane ───────────────────────────────────────────────────────────────
function Detail({ accountId, messageId, salesId, tab }) {
  const { message, loading, error, refetch } = useMessageDetail(accountId, messageId, salesId);

  // State kosong
  if (!messageId) {
    return (
      <div className="gm-panel-detail">
        <div className="gm-detail-empty">
          <MailOutlined style={{ fontSize: 36, color: "#1e3a5f" }} />
          <Text style={{ color: "#334155", fontSize: 13 }}>Pilih email untuk membaca</Text>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="gm-panel-detail">
        <div className="gm-detail-empty">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 28, color: "#3b82f6" }} spin />} />
          <Text style={{ color: "#334155", fontSize: 13, marginTop: 12 }}>Memuat email…</Text>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="gm-panel-detail" style={{ padding: 20 }}>
        <Alert
          type="error"
          message="Gagal memuat email"
          description={error}
          action={<button className="gm-d-btn" onClick={refetch}>Coba lagi</button>}
        />
      </div>
    );
  }

  if (!message) return null;

  const isInbox = tab === "inbox";
  const dateVal = isInbox ? message.received_at : message.sent_at;
  const sender  = message.from;
  const recips  = message.to ?? [];

  return (
    <div className="gm-panel-detail gm-fade" key={message.id}>
      {/* toolbar */}
      <div className="gm-detail-hd">
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {isInbox ? <InboxOutlined style={{ color: "#475569" }} /> : <SendOutlined style={{ color: "#475569" }} />}
          <Text style={{ color: "#64748b", fontSize: 12, fontWeight: 600 }}>{isInbox ? "Inbox" : "Sent"}</Text>
        </div>
      </div>

      {/* content */}
      <div className="gm-detail-inner">
        {/* subject */}
        <h2 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 16, lineHeight: 1.3, marginBottom: 12 }}>
          {message.subject}
        </h2>

        {/* labels */}
        {message.labels?.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            {message.labels.map(l => <Chip key={l} label={l} />)}
          </div>
        )}

        {/* sender card */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 14px", borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)", marginBottom: 16,
        }}>
          <Av name={sender?.name} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 2 }}>
              <Text style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13 }}>{sender?.name}</Text>
              <Text style={{ color: "#334155", fontSize: 11 }}>&lt;{sender?.email}&gt;</Text>
              {isInbox
                ? <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 9, background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", color: "#c4b5fd", fontWeight: 600 }}>Buyer</span>
                : <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 9, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd", fontWeight: 600 }}>Sales</span>
              }
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <Text style={{ color: "#334155", fontSize: 11 }}>To:</Text>
              {recips.map((r, i) => (
                <Text key={i} style={{ color: "#475569", fontSize: 11 }}>{r.name} &lt;{r.email}&gt;</Text>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <CalendarOutlined style={{ color: "#334155", fontSize: 11 }} />
            <Text style={{ color: "#475569", fontSize: 11, whiteSpace: "nowrap" }}>
              {dateVal ? dayjs(dateVal).format("DD MMM YYYY, HH:mm") : "—"}
            </Text>
          </div>
        </div>

        {/* body */}
        <div style={{ paddingBottom: 16 }}>
          <Body html={message.body_html} />
        </div>

        {/* attachments */}
        {message.has_attachment && message.attachments?.length > 0 && (
          <div style={{ paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <Text style={{ color: "#475569", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
              Attachments
            </Text>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {message.attachments.map((a) => (
                <div key={a.filename} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer" }}>
                  <PaperClipOutlined style={{ color: "#64748b", fontSize: 12 }} />
                  <Text style={{ color: "#94a3b8", fontSize: 12 }}>{a.filename}</Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Email list (middle panel) ─────────────────────────────────────────────────
function EmailList({ emails, loading, error, tab, selectedId, onSelect, nextPageToken, loadMore, loadingMore, refetch }) {
  if (loading) {
    return (
      <div className="gm-email-list" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: "#3b82f6" }} spin />} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="gm-email-list" style={{ padding: 16 }}>
        <Alert
          type="error"
          message="Gagal memuat email"
          description={error}
          action={<button className="gm-d-btn" onClick={refetch} style={{ marginTop: 8 }}>Coba lagi</button>}
        />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="gm-email-list" style={{ padding: "40px 16px", textAlign: "center" }}>
        <MailOutlined style={{ fontSize: 28, color: "#1e3a5f", display: "block", marginBottom: 8 }} />
        <Text style={{ color: "#334155", fontSize: 12 }}>Tidak ada email</Text>
      </div>
    );
  }

  return (
    <div className="gm-email-list">
      {emails.map((msg) => {
        const isUnread  = tab === "inbox" && msg.labelIds?.includes("UNREAD");
        const isSelected = selectedId === msg.id;
        // Untuk metadata-only (inbox list), from bisa berupa string "Name <email>"
        const contactName = typeof msg.from === "string"
          ? msg.from.split("<")[0].trim()
          : (msg.from?.name ?? msg.to?.[0]?.name ?? "?");
        const dateKey = tab === "inbox" ? "date" : "date";
        const dateVal = msg.date ?? msg.sent_at ?? msg.received_at;

        return (
          <div
            key={msg.id}
            className={`gm-email-item ${isUnread ? "unread" : ""} ${isSelected ? "selected" : ""}`}
            onClick={() => onSelect(msg.id)}
          >
            {isUnread && <div className="gm-udot" />}
            <Av name={contactName} size={30} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <div className="gm-i-from">
                  {tab === "sent" ? `→ ${contactName}` : contactName}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                  <span className="gm-i-date">{fmtD(dateVal)}</span>
                  {msg.has_attachment && <PaperClipOutlined style={{ color: "#2d3d52", fontSize: 10 }} />}
                </div>
              </div>
              <div className="gm-i-subj">{msg.subject ?? "(No Subject)"}</div>
              <div className="gm-i-snip">{msg.snippet}</div>
            </div>
          </div>
        );
      })}

      {/* Load more */}
      <div style={{ padding: "12px 16px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          className="gm-d-btn"
          onClick={loadMore}
          disabled={loadingMore || !nextPageToken}
          style={{
            width: "100%", justifyContent: "center",
            opacity: !nextPageToken ? 0.35 : 1,
            cursor : !nextPageToken ? "default" : "pointer",
          }}
        >
          {loadingMore
            ? <><LoadingOutlined spin /> Memuat…</>
            : nextPageToken
              ? "Muat lebih banyak"
              : "Semua email sudah dimuat"
          }
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GmailPage() {
  const [tab,        setTab]       = useState("inbox");
  const [search,     setSearch]    = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Fetch daftar sales
  const { sales, loading: salesLoading, error: salesError, refetch: refetchSales } = useSales();

  // activeSalesId: simpan ID saja (primitive) bukan object, agar tidak trigger re-render loop
  const [activeSalesId, setActiveSalesId] = useState(null);

  useEffect(() => {
    if (sales.length > 0 && !activeSalesId) {
      setActiveSalesId(sales[0].gmailAccountId ?? sales[0].id);
    }
  }, [sales]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive object sales aktif dari ID
  const activeSales = sales.find(s => (s.gmailAccountId ?? s.id) === activeSalesId) ?? sales[0] ?? null;
  const accountId   = activeSales?.gmailAccountId ?? null;
  const salesId     = activeSales?.id ?? null;

  // Inbox & Sent untuk sales aktif
  const {
    emails: inboxEmails, loading: inboxLoading, error: inboxError,
    nextPageToken: inboxNextToken, loadMore: inboxLoadMore, loadingMore: inboxLoadingMore,
    refetch: refetchInbox,
  } = useInbox(accountId, salesId);

  const {
    emails: sentEmails, loading: sentLoading, error: sentError,
    nextPageToken: sentNextToken, loadMore: sentLoadMore, loadingMore: sentLoadingMore,
    refetch: refetchSent,
  } = useSent(accountId, salesId);

  // Pilih list aktif & filter search
  const displayList = useMemo(() => {
    const src = tab === "inbox" ? inboxEmails : sentEmails;
    if (!search.trim()) return src;
    const q = search.toLowerCase();
    return src.filter((m) => {
      const from    = typeof m.from === "string" ? m.from : (m.from?.name + " " + m.from?.email);
      const subject = m.subject ?? "";
      const snippet = m.snippet ?? "";
      return from.toLowerCase().includes(q) || subject.toLowerCase().includes(q) || snippet.toLowerCase().includes(q);
    });
  }, [tab, inboxEmails, sentEmails, search]);

  const handleSales   = (s) => { setActiveSalesId(s.gmailAccountId ?? s.id); setSelectedId(null); };
  const handleTab     = (t) => { setTab(t); setSelectedId(null); setSearch(""); };
  const handleSelect  = (id) => setSelectedId(id);
  const handleRefresh = ()  => { tab === "inbox" ? refetchInbox() : refetchSent(); };

  // Aktifkan nextPageToken/loadMore sesuai tab yang sedang aktif
  const nextPageToken = tab === "inbox" ? inboxNextToken  : sentNextToken;
  const loadMore      = tab === "inbox" ? inboxLoadMore   : sentLoadMore;
  const loadingMore   = tab === "inbox" ? inboxLoadingMore : sentLoadingMore;

  const curUnread = inboxEmails.filter((m) => m.labelIds?.includes("UNREAD")).length;
  const curSent   = sentEmails.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexShrink: 0 }}>
        <div>
          <h2 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Gmail</h2>
          <Text style={{ color: "#64748b", fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Email inbox & sent semua sales</Text>
        </div>
        <button
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          onClick={handleRefresh}
        >
          <ReloadOutlined style={{ fontSize: 12 }} /> Refresh
        </button>
      </div>

      {/* Sales loading / error */}
      {salesLoading && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 20, color: "#3b82f6" }} spin />} />
        </div>
      )}
      {salesError && (
        <Alert type="error" message={`Gagal memuat data sales: ${salesError}`} style={{ marginBottom: 14 }}
          action={<button className="gm-d-btn" onClick={refetchSales}>Coba lagi</button>} />
      )}

      {/* 3 panels */}
      {!salesLoading && sales.length > 0 && (
        <div className="gm-root" style={{ flex: 1, minHeight: 0 }}>

          {/* LEFT: Sales */}
          <div className="gm-panel-sales">
            <div className="gm-panel-sales-hd">
              <Text style={{ color: "#475569", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Sales ({sales.length})
              </Text>
            </div>
            <div className="gm-sales-list">
              {sales.map((s) => {
                const active = activeSales?.id === s.id;
                return (
                  <div
                    key={s.id}
                    className={`gm-sales-item ${active ? "active" : ""}`}
                    onClick={() => handleSales(s)}
                  >
                    <div className="gm-s-av">{s.avatar}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="gm-s-name">{s.name}</div>
                      <Text style={{ color: "#2d3d52", fontSize: 10, fontFamily: "inherit" }}>
                        {s.email}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MIDDLE: Email list */}
          <div className="gm-panel-list">
            <div className="gm-list-hd">
              {/* Tabs */}
              <div className="gm-tabs">
                <button className={`gm-tab ${tab === "inbox" ? "active" : ""}`} onClick={() => handleTab("inbox")}>
                  <InboxOutlined style={{ fontSize: 13 }} /> Inbox
                  {curUnread > 0 && <span className="gm-tab-cnt">{curUnread}</span>}
                </button>
                <button className={`gm-tab ${tab === "sent" ? "active" : ""}`} onClick={() => handleTab("sent")}>
                  <SendOutlined style={{ fontSize: 13 }} /> Sent
                  {curSent > 0 && <span className="gm-tab-cnt" style={{ background: "rgba(255,255,255,0.07)", color: "#475569" }}>{curSent}</span>}
                </button>
              </div>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <SearchOutlined style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 12, zIndex: 1 }} />
                <input
                  className="gm-search-box"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari email…"
                />
              </div>
            </div>

            <EmailList
              emails={displayList}
              loading={tab === "inbox" ? inboxLoading : sentLoading}
              error={tab === "inbox" ? inboxError : sentError}
              tab={tab}
              selectedId={selectedId}
              onSelect={handleSelect}
              nextPageToken={nextPageToken}
              loadMore={loadMore}
              loadingMore={loadingMore}
              refetch={tab === "inbox" ? refetchInbox : refetchSent}
            />
          </div>

          {/* RIGHT: Detail */}
          <Detail
            accountId={accountId}
            messageId={selectedId}
            salesId={salesId}
            tab={tab}
          />
        </div>
      )}
    </div>
  );
}