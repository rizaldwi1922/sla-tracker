/**
 * GmailDetailPage.jsx  —  Versi terintegrasi dengan Laravel API
 *
 * Menerima accountId & salesId via:
 *  1. router location.state  (dikirim dari InboxPage / SentPage saat navigate)
 *  2. fallback: query params  (?account=X&sales=Y)
 */

import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Typography, Tooltip, Button, Divider, Spin, Alert } from "antd";
import {
  ArrowLeftOutlined,
  MailOutlined,
  PaperClipOutlined,
  MoreOutlined,
  CalendarOutlined,
  DownOutlined,
  UpOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { gmailCss } from "./gmailCss";
import { LabelChip, AvatarLetter, fmtEmailDate } from "./GmailHelpers";
import { useMessageDetail } from "./useGmail";

const { Text } = Typography;

// ─── Collapsible body ─────────────────────────────────────────────────────────
function EmailBody({ html }) {
  const [expanded, setExpanded] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) setOverflow(ref.current.scrollHeight > 260);
  }, [html]);

  return (
    <div>
      <div
        ref={ref}
        className="gm-email-body"
        style={{
          maxHeight: expanded ? "none" : 260,
          overflow: "hidden",
          position: "relative",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
        dangerouslySetInnerHTML={{ __html: html || "<em>No content</em>" }}
      />
      {!expanded && overflow && (
        <div style={{
          height: 52, marginTop: -52, position: "relative",
          background: "linear-gradient(transparent, rgba(10,18,36,0.97))",
          pointerEvents: "none",
        }} />
      )}
      {overflow && (
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            marginTop: expanded ? 10 : 6,
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            color: "#cbd5e1", fontSize: 11, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          {expanded ? <><UpOutlined /> Show less</> : <><DownOutlined /> Show more</>}
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GmailDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  // Ambil accountId & salesId dari state navigasi atau query params
  const state     = location.state ?? {};
  const params    = new URLSearchParams(location.search);
  const accountId = state.accountId ?? params.get("account") ?? null;
  const salesId   = state.salesId   ?? params.get("sales")   ?? null;

  const isInbox  = location.pathname.includes("/inbox/");
  const backPath = isInbox ? "/gmail/inbox" : "/gmail/sent";

  // Fetch detail pesan dari API
  const { message, loading, error, refetch } = useMessageDetail(accountId, id, salesId);

  // ── Loading ──
  if (loading) {
    return (
      <>
        <style>{gmailCss}</style>
        <div className="gm-empty" style={{ height: "60vh" }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: "#3b82f6" }} spin />} />
          <Text style={{ color: "#94a3b8", marginTop: 16 }}>Memuat email…</Text>
        </div>
      </>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <>
        <style>{gmailCss}</style>
        <div className="gm-page" style={{ maxWidth: 860, margin: "0 auto", paddingTop: 40 }}>
          <Alert
            type="error"
            message="Gagal memuat email"
            description={error}
            action={
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="gm-back-btn" onClick={refetch}>Coba lagi</button>
                <button className="gm-back-btn" onClick={() => navigate(backPath)}>
                  <ArrowLeftOutlined /> Kembali
                </button>
              </div>
            }
          />
        </div>
      </>
    );
  }

  // ── Not found ──
  if (!message) {
    return (
      <>
        <style>{gmailCss}</style>
        <div className="gm-empty" style={{ height: "60vh" }}>
          <MailOutlined style={{ fontSize: 40, color: "#475569" }} />
          <Text style={{ color: "#94a3b8" }}>Email tidak ditemukan</Text>
          <button className="gm-back-btn" onClick={() => navigate(backPath)}>
            <ArrowLeftOutlined /> Kembali
          </button>
        </div>
      </>
    );
  }

  const sender     = message.from;
  const recipients = message.to ?? [];
  const dateStr    = fmtEmailDate(
    isInbox ? message.received_at : message.sent_at,
    true
  );

  return (
    <>
      <style>{gmailCss}</style>
      <div className="gm-page" style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* ── Back ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button className="gm-back-btn" onClick={() => navigate(backPath)}>
            <ArrowLeftOutlined />
            {isInbox ? "Kembali ke Inbox" : "Kembali ke Sent"}
          </button>

          <div style={{ display: "flex", gap: 8 }}>
           
            <Tooltip title="More">
              <Button icon={<MoreOutlined />} style={{ borderRadius: 9 }} />
            </Tooltip>
          </div>
        </div>

        {/* ── Header card ── */}
        <div className="gm-detail-header gm-animate">
          <div className="gm-detail-subject">{message.subject}</div>

          {/* Labels (Gmail system labels) */}
          {message.labels?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {message.labels
                .filter((l) => !["INBOX", "SENT", "UNREAD"].includes(l))
                .map((l) => <LabelChip key={l} label={l} />)}
            </div>
          )}

          {/* From / To meta */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

            {/* Meta pills */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <CalendarOutlined style={{ color: "#94a3b8", fontSize: 12 }} />
                <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: 500 }}>{dateStr}</Text>
              </div>
            </div>
          </div>

          {/* To */}
          {recipients.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <Text style={{ color: "#cbd5e1", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                To
              </Text>
              <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {recipients.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <AvatarLetter name={r.name} size={20} />
                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>{r.name}</Text>
                    <Text style={{ color: "#cbd5e1", fontSize: 11 }}>&lt;{r.email}&gt;</Text>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="gm-detail-body-wrap gm-animate gm-animate-delay-1">
          <EmailBody html={message.body_html} />

          {/* Attachments */}
          {message.has_attachment && message.attachments?.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <Text style={{ color: "#cbd5e1", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 10 }}>
                <PaperClipOutlined style={{ marginRight: 6 }} />
                Attachments
              </Text>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {message.attachments.map((a) => (
                  <div
                    key={a.filename}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", transition: "background 0.15s" }}
                  >
                    <PaperClipOutlined style={{ color: "#94a3b8", fontSize: 14 }} />
                    <Text style={{ color: "#94a3b8", fontSize: 13 }}>{a.filename}</Text>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}