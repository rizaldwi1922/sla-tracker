import { Empty, Skeleton, Typography, Space } from "antd";
import { BellOutlined, CalendarOutlined, ShopOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import GlassCard from "../shared/GlassCard";

const { Text } = Typography;

// ─── UpcomingDueDatesCard ─────────────────────────────────────────────────────
/**
 * @param {Array}   upcomingDueDates - from API: [{ id, subject, buyer, sales, due_at, preview }]
 * @param {boolean} loading
 */
export function UpcomingDueDatesCard({ upcomingDueDates = [], loading = false }) {
  const today = new Date();

  return (
    <GlassCard
      title={
        <Space size={6}>
          <CalendarOutlined style={{ color: "#3b82f6" }} />
          <Text style={{ color: "#f1f5f9", fontWeight: 600 }}>Upcoming Due Dates</Text>
        </Space>
      }
      style={{ minHeight: 200 }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : upcomingDueDates.length === 0 ? (
        <Empty
          description={<Text style={{ color: "#334155" }}>No upcoming follow-ups</Text>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {upcomingDueDates.map((item) => {
            const days    = Math.ceil((new Date(item.due_at) - today) / 86400000);
            const dayCol  = days <= 1 ? "#ef4444" : days <= 3 ? "#f59e0b" : "#22c55e";
            const dayBg   = days <= 1 ? "rgba(239,68,68,0.12)" : days <= 3 ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)";
            const dayText = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`;

            return (
              <div
                key={item.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Row 1: Subject + Due badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <Text style={{
                    color: "#e2e8f0", fontSize: 13, fontWeight: 600,
                    flex: 1, marginRight: 10,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {item.subject || "No Subject"}
                  </Text>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <span style={{
                      background: dayBg, color: dayCol,
                      fontWeight: 700, fontSize: 11,
                      padding: "2px 10px", borderRadius: 20,
                      display: "inline-block",
                    }}>
                      {dayText}
                    </span>
                    <Text style={{ color: "#475569", fontSize: 11, display: "block", marginTop: 3 }}>
                      {dayjs(item.due_at).format("DD MMM YYYY")}
                    </Text>
                  </div>
                </div>

                {/* Row 2: Buyer & Sales */}
                <div style={{ display: "flex", gap: 14, marginBottom: item.preview ? 8 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <ShopOutlined style={{ fontSize: 11, color: "#475569" }} />
                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>{item.buyer || "—"}</Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <UserOutlined style={{ fontSize: 11, color: "#475569" }} />
                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>{item.sales || "—"}</Text>
                  </div>
                </div>

                {/* Row 3: Preview */}
                {item.preview && (
                  <Text style={{
                    fontSize: 12, color: "#475569", display: "block",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontStyle: "italic",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    paddingTop: 7,
                  }}>
                    {item.preview}
                  </Text>
                )}
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

// ─── RemindersPanel ───────────────────────────────────────────────────────────
/**
 * @param {Array}   reminders - from API: [{ id, subject, buyer, sales, preview, hours_waiting }]
 * @param {boolean} loading
 */
export function RemindersPanel({ reminders = [], loading = false }) {
  return (
    <GlassCard
      title={
        <Space size={6}>
          <BellOutlined style={{ color: "#f59e0b" }} />
          <Text style={{ color: "#f1f5f9", fontWeight: 600 }}>SLA Reminders</Text>
        </Space>
      }
    >
      {reminders.length === 0 ? (
        <Text style={{ color: "#334155", fontSize: 13 }}>No pending reminders</Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reminders.map((r) => (
            <div
              key={r.id}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {/* Row 1: Icon + Subject + Hours badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(239,68,68,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <BellOutlined style={{ fontSize: 14, color: "#ef4444" }} />
                  </span>
                  <Text style={{
                    color: "#fca5a5", fontSize: 13, fontWeight: 600,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {r.subject || "No Subject"}
                  </Text>
                </div>
                <span style={{
                  background: "rgba(239,68,68,0.15)", color: "#ef4444",
                  fontWeight: 700, fontSize: 11,
                  padding: "2px 10px", borderRadius: 20, flexShrink: 0, marginLeft: 10,
                }}>
                  {Math.abs(Math.round(r.hours_waiting))}h belum dibalas
                </span>
              </div>

              {/* Row 2: Buyer & Sales */}
              <div style={{ display: "flex", gap: 14, marginBottom: r.preview ? 8 : 0, paddingLeft: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <ShopOutlined style={{ fontSize: 11, color: "#7f1d1d" }} />
                  <Text style={{ color: "#94a3b8", fontSize: 12 }}>{r.buyer || "—"}</Text>
                </div>
                {r.sales && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <UserOutlined style={{ fontSize: 11, color: "#7f1d1d" }} />
                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>{r.sales}</Text>
                  </div>
                )}
              </div>

              {/* Row 3: Preview */}
              {r.preview && (
                <Text style={{
                  fontSize: 12, color: "#6b7280", display: "block",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  fontStyle: "italic",
                  borderTop: "1px solid rgba(239,68,68,0.1)",
                  paddingTop: 7, paddingLeft: 36,
                }}>
                  {r.preview}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}