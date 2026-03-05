import { Empty, Skeleton, Typography, Alert, Space } from "antd";
import { BellOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import GlassCard from "../shared/GlassCard";

const { Text } = Typography;

// ─── UpcomingDueDatesCard ─────────────────────────────────────────────────────
/**
 * @param {Array}   upcomingDueDates - from API: [{ id, subject, buyer, sales, due_at }]
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
            const dayText = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`;

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                  <Text
                    style={{
                      color: "#e2e8f0",
                      display: "block",
                      fontSize: 13,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.subject || "No Subject"}
                  </Text>
                  <Text style={{ color: "#475569", fontSize: 12 }}>
                    {item.buyer || item.sales || "—"}
                  </Text>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <Text style={{ color: dayCol, fontWeight: 700, fontSize: 12, display: "block" }}>
                    {dayText}
                  </Text>
                  <Text style={{ color: "#334155", fontSize: 11 }}>
                    {dayjs(item.due_at).format("DD MMM")}
                  </Text>
                </div>
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
 * @param {Array}   reminders - from API: [{ id, subject, buyer, hours_waiting }]
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
            <Alert
              key={r.id}
              type="error"
              showIcon
              message={<Text style={{ fontWeight: 600, fontSize: 13 }}>Belum dibalas</Text>}
              description={
                <div>
                  <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                    {r.buyer || "—"} — {r.subject || "No Subject"}
                  </Text>
                  {r.preview && (
                    <Text style={{ fontSize: 11, color: "#64748b", display: "block", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.preview}
                    </Text>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}