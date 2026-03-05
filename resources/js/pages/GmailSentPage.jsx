/**
 * GmailSentPage.jsx  —  Versi terintegrasi dengan Laravel API
 *
 * Controller sent sekarang return shape yang sama dengan inbox:
 * { emails: [{id, threadId, snippet, subject, from, to, date}], next_page_token }
 * Field "to" adalah string header "Name <email>, Name2 <email2>"
 */

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Typography, Tooltip, Spin, Alert } from "antd";
import {
  SendOutlined, SearchOutlined,
  PaperClipOutlined, ReloadOutlined, LoadingOutlined,
} from "@ant-design/icons";
import { gmailCss } from "./gmailCss";
import { AvatarLetter, fmtEmailDate } from "./GmailHelpers";
import PageHeader from "../shared/PageHeader";
import { useSales, useSent } from "./useGmail";
import { parseAddress, parseAddressList } from "./gmailApi";

const { Text } = Typography;

export default function GmailSentPage() {
  const navigate = useNavigate();
  const [activeSalesId, setActiveSalesId] = useState(null);
  const [search,      setSearch]      = useState("");

  // Sales list
  const { sales, loading: salesLoading, error: salesError, refetch: refetchSales } = useSales();

  useEffect(() => {
    if (sales.length > 0 && !activeSalesId) {
      setActiveSalesId(sales[0].gmailAccountId ?? sales[0].id);
    }
  }, [sales]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeSales = sales.find(s => (s.gmailAccountId ?? s.id) === activeSalesId) ?? sales[0] ?? null;
  const accountId   = activeSales?.gmailAccountId ?? null;
  const salesId     = activeSales?.id ?? null;

  // Sent emails + pagination
  const {
    emails, loading, loadingMore, error,
    nextPageToken, loadMore, refetch,
  } = useSent(accountId, salesId);

  // ── Filter search ──
  const filtered = useMemo(() => {
    if (!search.trim()) return emails;
    const q = search.toLowerCase();
    return emails.filter((m) => {
      const to      = m.to ?? "";
      const subject = m.subject ?? "";
      const snippet = m.snippet ?? "";
      return (
        to.toLowerCase().includes(q) ||
        subject.toLowerCase().includes(q) ||
        snippet.toLowerCase().includes(q)
      );
    });
  }, [emails, search]);

  return (
    <>
      <style>{gmailCss}</style>
      <div className="gm-page">
        <PageHeader
          title="Gmail Sent"
          subtitle="Email terkirim dari sales ke buyer"
          extra={
            <Tooltip title="Refresh">
              <button className="gm-back-btn" onClick={refetch}>
                <ReloadOutlined /> Refresh
              </button>
            </Tooltip>
          }
        />

        {/* ── Sales selector ── */}
        <div style={{ marginBottom: 18 }}>
          <Text style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>
            Pilih Sales
          </Text>

          {salesLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 16, color: "#3b82f6" }} spin />} />}
          {salesError && (
            <Alert type="error" message={salesError}
              action={<button className="gm-back-btn" onClick={refetchSales}>Retry</button>} />
          )}

          {!salesLoading && (
            <div className="gm-sales-selector">
              {sales.map((s) => (
                <button
                  key={s.id}
                  className={`gm-sales-chip ${activeSalesId === (s.gmailAccountId ?? s.id) ? "active" : ""}`}
                  onClick={() => { setActiveSalesId(s.gmailAccountId ?? s.id); setSearch(""); }}
                >
                  <div className="chip-avatar">{s.avatar}</div>
                  {s.name}
                  {activeSalesId === (s.gmailAccountId ?? s.id) && emails.length > 0 && (
                    <span style={{ color: "#475569", fontSize: 11, fontWeight: 600 }}>
                      {emails.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div className="gm-search-wrap" style={{ flex: 1, maxWidth: 380, position: "relative" }}>
            <SearchOutlined style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569", zIndex: 1 }} />
            <Input
              placeholder="Cari penerima, subjek…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34, borderRadius: 10 }}
              allowClear
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <SendOutlined style={{ color: "#64748b", fontSize: 13 }} />
            <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>
              {filtered.length} terkirim
            </Text>
          </div>
        </div>

        {/* ── List ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 28, color: "#3b82f6" }} spin />} />
          </div>
        ) : error ? (
          <Alert
            type="error"
            message="Gagal memuat sent"
            description={error}
            action={<button className="gm-back-btn" onClick={refetch} style={{ marginTop: 8 }}>Coba lagi</button>}
          />
        ) : filtered.length === 0 ? (
          <div className="gm-list">
            <div className="gm-empty">
              <SendOutlined style={{ fontSize: 36, color: "#1e3a5f" }} />
              <Text style={{ color: "#334155", fontSize: 14 }}>
                {search ? "Tidak ada hasil pencarian" : "Tidak ada email terkirim"}
              </Text>
            </div>
          </div>
        ) : (
          <div className="gm-list">
            {filtered.map((msg, i) => {
              // "to" dari controller adalah string header, parse ke array
              const toList    = parseAddressList(msg.to ?? "");
              const recipient = toList[0] ?? parseAddress(msg.to ?? "");

              return (
                <div
                  key={msg.id}
                  className="gm-list-item gm-animate"
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/gmail/sent/${msg.id}`, { state: { accountId, salesId } })}
                >
                  <AvatarLetter name={recipient.name} size={36} />

                  {/* To */}
                  <div className="gm-sender-col">
                    <div className="gm-sender-name">
                      To: {recipient.name}
                      {toList.length > 1 && (
                        <span style={{ color: "#475569", fontWeight: 400 }}>
                          {" "}+{toList.length - 1}
                        </span>
                      )}
                    </div>
                    <Text style={{ color: "#334155", fontSize: 11 }}>{recipient.email}</Text>
                  </div>

                  {/* Subject + snippet */}
                  <div className="gm-subject-col">
                    <span className="gm-subject-text">{msg.subject ?? "(No Subject)"}</span>
                    <span className="gm-snippet"> — {msg.snippet}</span>
                  </div>

                  {/* Date */}
                  <div className="gm-meta-col">
                    <span className="gm-date" style={{ color: "#475569" }}>
                      {fmtEmailDate(msg.date)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* ── DEBUG: hapus setelah fix ── */}
            <div style={{ padding: "4px 16px", fontSize: 10, color: "#ff6b6b", fontFamily: "monospace" }}>
              nextPageToken: {nextPageToken ?? "NULL"} | emails: {emails.length} | filtered: {filtered.length}
            </div>

            {/* ── Load more ── */}
            <div style={{ padding: "14px 16px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                className="gm-back-btn"
                onClick={loadMore}
                disabled={loadingMore || !nextPageToken}
                style={{
                  width: "100%", justifyContent: "center", gap: 8,
                  opacity: !nextPageToken ? 0.35 : 1,
                  cursor : !nextPageToken ? "default" : "pointer",
                }}
              >
                {loadingMore
                  ? <><LoadingOutlined spin /> Memuat…</>
                  : nextPageToken
                    ? <><SendOutlined /> Muat lebih banyak</>
                    : <>Semua email sudah dimuat</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}