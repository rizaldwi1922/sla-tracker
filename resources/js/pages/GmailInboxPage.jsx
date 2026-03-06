/**
 * GmailInboxPage.jsx  —  Versi terintegrasi dengan Laravel API
 */

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Typography, Empty, Tooltip, Spin, Alert } from "antd";
import {
  InboxOutlined, SearchOutlined,
  PaperClipOutlined, ReloadOutlined, LoadingOutlined,
} from "@ant-design/icons";
import { gmailCss } from "./gmailCss";
import { LabelChip, AvatarLetter, fmtEmailDate } from "./GmailHelpers";
import PageHeader from "../shared/PageHeader";
import { useSales, useInbox } from "./useGmail";
import { parseAddress } from "./gmailApi";

const { Text } = Typography;

export default function GmailInboxPage() {
  const navigate = useNavigate();
  const [activeSales, setActiveSales] = useState(null);
  const [search,      setSearch]      = useState("");

  // Daftar sales dari API
  const { sales, loading: salesLoading, error: salesError, refetch: refetchSales } = useSales();

  useEffect(() => {
    if (sales.length > 0 && !activeSales) setActiveSales(sales[0]);
  }, [sales, activeSales]);

  const accountId = activeSales?.gmailAccountId ?? null;
  const salesId   = activeSales?.id ?? null;

  // Inbox untuk sales aktif
  const {
    emails, loading, error,
    nextPageToken, loadMore, loadingMore,
    refetch,
  } = useInbox(accountId, salesId);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = emails;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => {
        const from    = typeof m.from === "string" ? m.from : (m.from?.name + " " + m.from?.email);
        const subject = m.subject ?? "";
        const snippet = m.snippet ?? "";
        return from.toLowerCase().includes(q) || subject.toLowerCase().includes(q) || snippet.toLowerCase().includes(q);
      });
    }
    return list;
  }, [emails, search]);

  const unreadCount = emails.filter((m) => m.labelIds?.includes("UNREAD")).length;

  return (
    <>
      <style>{gmailCss}</style>
      <div className="gm-page">
        <PageHeader
          title="Gmail Inbox"
          subtitle="Email masuk dari buyer per sales"
          extra={
            <Tooltip title="Refresh">
              <button className="gm-back-btn" onClick={refetch} style={{ gap: 6 }}>
                <ReloadOutlined /> Refresh
              </button>
            </Tooltip>
          }
        />

        {/* ── Sales selector ── */}
        <div style={{ marginBottom: 18 }}>
          <Text style={{ color: "#cbd5e1", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>
            Pilih Sales
          </Text>

          {salesLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 16, color: "#3b82f6" }} spin />} />}
          {salesError && (
            <Alert type="error" message={salesError}
              action={<button className="gm-back-btn" onClick={refetchSales}>Retry</button>} />
          )}

          {!salesLoading && (
            <div className="gm-sales-selector">
              {sales.map((s) => {
                const cnt = s.id === salesId ? unreadCount : 0;
                return (
                  <button
                    key={s.id}
                    className={`gm-sales-chip ${activeSales?.id === s.id ? "active" : ""}`}
                    onClick={() => { setActiveSales(s); setSearch(""); }}
                  >
                    <div className="chip-avatar">{s.avatar}</div>
                    {s.name}
                    {cnt > 0 && (
                      <span style={{ background: "#3b82f6", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 9, padding: "1px 6px" }}>
                        {cnt}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div className="gm-search-wrap" style={{ flex: 1, maxWidth: 380, position: "relative" }}>
            <SearchOutlined style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", zIndex: 1 }} />
            <Input
              placeholder="Cari pengirim, subjek…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34, borderRadius: 10 }}
              allowClear
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <InboxOutlined style={{ color: "#94a3b8", fontSize: 13 }} />
              <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{filtered.length} email</Text>
            </div>
            {unreadCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6" }} />
                <Text style={{ color: "#93c5fd", fontSize: 12, fontWeight: 600 }}>{unreadCount} belum dibaca</Text>
              </div>
            )}
          </div>
        </div>

        {/* ── List ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 28, color: "#3b82f6" }} spin />} />
          </div>
        ) : error ? (
          <Alert type="error" message="Gagal memuat inbox" description={error}
            action={<button className="gm-back-btn" onClick={refetch}>Coba lagi</button>} />
        ) : filtered.length === 0 ? (
          <div className="gm-list" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="gm-empty">
              <InboxOutlined style={{ fontSize: 36, color: "#475569" }} />
              <Text style={{ color: "#94a3b8", fontSize: 14 }}>Tidak ada email</Text>
            </div>
          </div>
        ) : (
          <div className="gm-list">
            {filtered.map((msg, i) => {
              // from bisa berupa string (dari metadata) atau object
              const fromParsed = typeof msg.from === "string" ? parseAddress(msg.from) : msg.from;
              const isUnread   = msg.labelIds?.includes("UNREAD");

              return (
                <div
                  key={msg.id}
                  className={`gm-list-item gm-animate ${isUnread ? "unread" : ""}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/gmail/inbox/${msg.id}`, { state: { accountId, salesId } })}
                >
                  <AvatarLetter name={fromParsed?.name} size={36} />

                  <div className="gm-sender-col">
                    <div className="gm-sender-name">{fromParsed?.name}</div>
                    <Text style={{ color: "#cbd5e1", fontSize: 11 }}>{fromParsed?.email}</Text>
                  </div>

                  <div className="gm-subject-col">
                    <span className="gm-subject-text">{msg.subject ?? "(No Subject)"}</span>
                    <span className="gm-snippet"> — {msg.snippet}</span>
                  </div>

                  <div className="gm-meta-col">
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {msg.has_attachment && <PaperClipOutlined className="gm-attach" />}
                      <span className="gm-date">{fmtEmailDate(msg.date ?? msg.received_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load more (pagination) */}
            {nextPageToken && (
              <div style={{ padding: "12px 16px", textAlign: "center" }}>
                <button className="gm-back-btn" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? <><LoadingOutlined spin /> Memuat…</> : "Muat lebih banyak"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}