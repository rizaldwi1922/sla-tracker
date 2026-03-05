import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/apiRequest";
import { Avatar, Row, Col, Spin, Tag, Tooltip, Typography } from "antd";
import {
    ArrowLeftOutlined,
    MailOutlined,
    UserOutlined,
    ShopOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    PaperClipOutlined,
    DownOutlined,
    UpOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

// ─── SLA tag helper ───────────────────────────────────────────────────────────
const SLA_TAG = {
    "On-Time": (
        <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}
        >
            On-Time
        </Tag>
    ),
    Overdue: (
        <Tag
            icon={<ExclamationCircleOutlined />}
            color="error"
            style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}
        >
            Overdue
        </Tag>
    ),
    Pending: (
        <Tag
            color="warning"
            style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}
        >
            Pending
        </Tag>
    ),
};

// ─── Inline styles ────────────────────────────────────────────────────────────
const css = `
  .thread-page { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* Back button */
  .thread-back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    color: #64748b; font-size: 13px; font-weight: 600;
    cursor: pointer; padding: 6px 0;
    transition: color 0.2s;
    border: none; background: none;
  }
  .thread-back-btn:hover { color: #60a5fa; }

  /* Header card */
  .thread-header {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px;
    padding: 24px 28px;
    margin-bottom: 20px;
  }

  /* Message bubble */
  .msg-bubble {
    border-radius: 16px;
    padding: 16px 20px;
    position: relative;
    transition: box-shadow 0.2s;
  }
  .msg-bubble:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }

  /* Buyer bubble */
  .msg-bubble.buyer {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-top-left-radius: 4px;
  }

  /* Sales bubble */
  .msg-bubble.sales {
    background: rgba(59,130,246,0.1);
    border: 1px solid rgba(59,130,246,0.2);
    border-top-right-radius: 4px;
  }

  /* Avatar */
  .msg-avatar.buyer { background: rgba(167,139,250,0.2) !important; color: #a78bfa !important; font-weight: 700 !important; }
  .msg-avatar.sales { background: rgba(59,130,246,0.2) !important; color: #60a5fa !important; font-weight: 700 !important; }

  /* Timeline connector */
  .msg-row { position: relative; }
  .msg-row:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -10px;
    width: 1px;
    height: 10px;
    background: rgba(255,255,255,0.06);
  }

  /* Email body */
  .email-body { color: #94a3b8 !important; font-size: 13px !important; line-height: 1.7 !important; }
  .email-body * { color: #94a3b8 !important; background: transparent !important; font-family: inherit !important; max-width: 100%; }
  .email-body a { color: #60a5fa !important; text-decoration: underline; }
  .email-body blockquote {
    border-left: 2px solid rgba(255,255,255,0.1);
    padding-left: 14px;
    margin: 10px 0;
    color: #475569 !important;
    font-style: italic;
  }
  .email-body img { max-width: 100%; border-radius: 8px; opacity: 0.85; }

  /* Stat pill */
  .stat-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px; font-weight: 600;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    color: #64748b;
  }
  .stat-pill .anticon { color: #475569; }

  /* Divider with date */
  .date-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0 16px;
    color: #334155; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .date-divider::before, .date-divider::after {
    content: ''; flex: 1;
    height: 1px; background: rgba(255,255,255,0.05);
  }

  /* ── Show more / show less ─────────────────────────── */
  .email-body-wrap {
    position: relative;
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .email-body-wrap.collapsed { max-height: 72px; }
  .email-body-wrap.expanded  { max-height: 9999px; }

  .email-body-fade {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 52px;
    pointer-events: none;
    transition: opacity 0.25s;
  }
  .email-body-fade.buyer-fade {
    background: linear-gradient(to bottom, transparent, #0e1520);
  }
  .email-body-fade.sales-fade {
    background: linear-gradient(to bottom, transparent, #091525);
  }
  .email-body-fade.hidden { opacity: 0; }

  .show-toggle-btn {
    display: inline-flex; align-items: center; gap: 5px;
    margin-top: 8px;
    padding: 3px 10px 3px 8px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #64748b;
    font-size: 11px; font-weight: 600;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
    line-height: 1;
  }
  .show-toggle-btn:hover {
    color: #94a3b8;
    border-color: rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.07);
  }
  .show-toggle-btn svg { font-size: 10px !important; }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .msg-animate { animation: fadeSlideIn 0.3s ease both; }
`;

// ─── Group messages by date ───────────────────────────────────────────────────
function groupByDate(messages) {
    const groups = {};
    messages.forEach((msg) => {
        const key = dayjs(msg.received_at).format("DD MMMM YYYY");
        if (!groups[key]) groups[key] = [];
        groups[key].push(msg);
    });
    return groups;
}

// ─── Collapsed body height threshold (px) ────────────────────────────────────
const COLLAPSE_THRESHOLD = 72; // ~3 lines

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg, index }) {
    const isBuyer    = msg.type === "inbox";
    const initials   = isBuyer ? "B" : "S";
    const label      = msg.from_email;

    // Show-more state — collapsed by default
    const [expanded, setExpanded] = useState(false);
    const bodyRef                 = useRef(null);
    const [needsToggle, setNeedsToggle] = useState(false);

    // After mount, check whether the content actually overflows the threshold
    useEffect(() => {
        if (bodyRef.current) {
            setNeedsToggle(bodyRef.current.scrollHeight > COLLAPSE_THRESHOLD);
        }
    }, [msg.body_html, msg.body]);

    return (
        <Row
            justify={isBuyer ? "start" : "end"}
            style={{ marginBottom: 12, animationDelay: `${index * 0.05}s` }}
            className="msg-animate"
        >
            <Col xs={22} sm={20} md={17} lg={15}>
                {/* ── Meta row ── */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 7,
                        flexDirection: isBuyer ? "row" : "row-reverse",
                    }}
                >
                    <Avatar
                        size={30}
                        className={`msg-avatar ${isBuyer ? "buyer" : "sales"}`}
                        style={{ flexShrink: 0, fontSize: 12 }}
                    >
                        {initials}
                    </Avatar>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isBuyer ? "flex-start" : "flex-end",
                        }}
                    >
                        <Text
                            style={{
                                color: "#cbd5e1",
                                fontSize: 12,
                                fontWeight: 600,
                                maxWidth: 280,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {label}
                        </Text>
                        <Text style={{ color: "#334155", fontSize: 11 }}>
                            {isBuyer ? "Buyer" : "Sales"}
                        </Text>
                    </div>
                </div>

                {/* ── Bubble ── */}
                <div
                    className={`msg-bubble ${isBuyer ? "buyer" : "sales"}`}
                    style={{ marginLeft: isBuyer ? 0 : "auto" }}
                >
                    {/* Subject */}
                    {msg.subject && (
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: isBuyer ? "#a78bfa" : "#60a5fa",
                                marginBottom: 10,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <MailOutlined style={{ fontSize: 11 }} />
                            {msg.subject}
                        </div>
                    )}

                    {/* ── Collapsible body ── */}
                    <div
                        className={`email-body-wrap ${expanded || !needsToggle ? "expanded" : "collapsed"}`}
                        ref={bodyRef}
                    >
                        <div
                            className="email-body"
                            dangerouslySetInnerHTML={{
                                __html: msg.body_html || msg.body || "<em>No content</em>",
                            }}
                        />

                        {/* Fade overlay — only shown when collapsed */}
                        {needsToggle && (
                            <div
                                className={`email-body-fade ${isBuyer ? "buyer-fade" : "sales-fade"} ${expanded ? "hidden" : ""}`}
                            />
                        )}
                    </div>

                    {/* ── Show more / show less toggle ── */}
                    {needsToggle && (
                        <button
                            className="show-toggle-btn"
                            onClick={() => setExpanded((v) => !v)}
                        >
                            {expanded ? (
                                <>
                                    <UpOutlined /> Show less
                                </>
                            ) : (
                                <>
                                    <DownOutlined /> Show more
                                </>
                            )}
                        </button>
                    )}

                    {/* Attachments */}
                    {msg.attachments?.length > 0 && (
                        <div
                            style={{
                                marginTop: 12,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 6,
                            }}
                        >
                            {msg.attachments.map((att, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                        padding: "4px 10px",
                                        borderRadius: 8,
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        fontSize: 11,
                                        color: "#64748b",
                                        cursor: "pointer",
                                    }}
                                >
                                    <PaperClipOutlined style={{ fontSize: 11 }} />
                                    {att.filename || `Attachment ${i + 1}`}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Timestamp */}
                    <div
                        style={{
                            marginTop: 10,
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Tooltip
                            title={dayjs(msg.received_at).format(
                                "DD MMM YYYY HH:mm:ss",
                            )}
                        >
                            <Text
                                style={{
                                    color: "#334155",
                                    fontSize: 11,
                                    cursor: "default",
                                }}
                            >
                                {dayjs(msg.received_at).format("HH:mm")}
                            </Text>
                        </Tooltip>
                    </div>
                </div>
            </Col>
        </Row>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ThreadConversationPage() {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const bottomRef = useRef(null);

    const [thread, setThread] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchThread = async () => {
        try {
            const res = await apiRequest({
                url: `/emails/${threadId}`,
                method: "GET",
            });
            setThread(res);
        } catch {
            console.error("failed load thread");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThread();
    }, [threadId]);

    // Auto-scroll to latest message
    useEffect(() => {
        if (thread) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [thread]);

    // ── Loading ──
    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "60vh",
                    flexDirection: "column",
                    gap: 14,
                }}
            >
                <Spin size="large" />
                <Text style={{ color: "#334155", fontSize: 13 }}>
                    Loading conversation…
                </Text>
            </div>
        );
    }

    // ── Empty ──
    if (!thread) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "60vh",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                <MailOutlined style={{ fontSize: 40, color: "#1e3a5f" }} />
                <Text style={{ color: "#334155", fontSize: 14 }}>
                    Thread not found
                </Text>
                <button className="thread-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeftOutlined /> Back to inbox
                </button>
            </div>
        );
    }

    const messages = thread.messages ?? [];
    const firstMsg = messages[0];
    const subject = firstMsg?.subject || "Conversation";
    const msgGroups = groupByDate(messages);

    // Compute response time if applicable
    const inboxMsg = messages.find((m) => m.type === "inbox");
    const replyMsg = messages.find((m) => m.type !== "inbox");
    const responseHrs =
        inboxMsg && replyMsg
            ? ((new Date(replyMsg.received_at) - new Date(inboxMsg.received_at)) / 3600000).toFixed(1)
            : null;

    const slaStatus = thread.sla_status ?? (responseHrs === null ? "Pending" : parseFloat(responseHrs) <= 24 ? "On-Time" : "Overdue");

    return (
        <>
            <style>{css}</style>
            <div className="thread-page" style={{ maxWidth: 820, margin: "0 auto" }}>

                {/* ── Back button ── */}
                <button
                    className="thread-back-btn"
                    onClick={() => navigate(-1)}
                    style={{ marginBottom: 18 }}
                >
                    <ArrowLeftOutlined /> Back to inbox
                </button>

                {/* ── Header card ── */}
                <div className="thread-header">
                    {/* Subject */}
                    <div style={{ marginBottom: 16 }}>
                        <h2
                            style={{
                                color: "#f1f5f9",
                                fontWeight: 800,
                                fontSize: 18,
                                margin: 0,
                                lineHeight: 1.3,
                            }}
                        >
                            {subject}
                        </h2>
                    </div>

                    {/* Meta row */}
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 10,
                            alignItems: "center",
                            marginBottom: 16,
                        }}
                    >
                        {/* Buyer */}
                        <div className="stat-pill">
                            <ShopOutlined />
                            <span style={{ color: "#94a3b8" }}>
                                {thread.buyer?.company_name || "—"}
                            </span>
                        </div>

                        {/* Sales */}
                        <div className="stat-pill">
                            <UserOutlined />
                            <span style={{ color: "#94a3b8" }}>
                                {thread.sales?.name || "—"}
                            </span>
                        </div>

                        {/* Message count */}
                        <div className="stat-pill">
                            <MailOutlined />
                            <span style={{ color: "#94a3b8" }}>
                                {messages.length}{" "}
                                {messages.length === 1 ? "message" : "messages"}
                            </span>
                        </div>

                        {/* {responseHrs !== null && (
                            <div className="stat-pill">
                                <ClockCircleOutlined />
                                <span style={{ color: "#94a3b8" }}>
                                    {responseHrs}h response
                                </span>
                            </div>
                        )}

                        {SLA_TAG[slaStatus]} */}
                    </div>

                    {/* Progress bar: buyer vs sales turns */}
                    {messages.length > 0 && (() => {
                        const buyerCount  = messages.filter((m) => m.type === "inbox").length;
                        const salesCount  = messages.filter((m) => m.type !== "inbox").length;
                        const buyerPct    = Math.round((buyerCount / messages.length) * 100);
                        return (
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: 5,
                                    }}
                                >
                                    <Text style={{ color: "#475569", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Buyer {buyerCount} · Sales {salesCount}
                                    </Text>
                                    <Text style={{ color: "#334155", fontSize: 11 }}>
                                        {messages.length} total
                                    </Text>
                                </div>
                                <div
                                    style={{
                                        height: 5,
                                        borderRadius: 10,
                                        background: "rgba(255,255,255,0.05)",
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "100%",
                                            width: `${buyerPct}%`,
                                            background:
                                                "linear-gradient(90deg, #a78bfa, #60a5fa)",
                                            borderRadius: 10,
                                            transition: "width 0.5s ease",
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginTop: 4,
                                    }}
                                >
                                    <Text style={{ color: "#334155", fontSize: 10 }}>
                                        ● Buyer
                                    </Text>
                                    <Text style={{ color: "#334155", fontSize: 10 }}>
                                        Sales ●
                                    </Text>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* ── Messages ── */}
                <div style={{ paddingBottom: 40 }}>
                    {Object.entries(msgGroups).map(([date, msgs]) => (
                        <div key={date}>
                            {/* Date divider */}
                            <div className="date-divider">{date}</div>

                            {/* Bubbles */}
                            {msgs.map((msg, i) => (
                                <MessageBubble key={msg.id} msg={msg} index={i} />
                            ))}
                        </div>
                    ))}

                    {/* Scroll anchor */}
                    <div ref={bottomRef} />
                </div>

            </div>
        </>
    );
}