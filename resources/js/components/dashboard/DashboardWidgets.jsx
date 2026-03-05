// ─── UpcomingDueDatesCard ─────────────────────────────────────────────────────
import { Empty, Typography, Alert, Space } from "antd";
import { BellOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import GlassCard from "../shared/GlassCard";

const { Text } = Typography;

export function UpcomingDueDatesCard({ emails, buyers }) {
  const today = new Date();
  const upcoming = emails
    .filter((e) => e.due_date && new Date(e.due_date) >= today)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

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
      {upcoming.length === 0
        ? <Empty description={<Text style={{ color: "#334155" }}>No upcoming follow-ups</Text>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcoming.map((e) => {
              const days    = Math.ceil((new Date(e.due_date) - today) / 86400000);
              const buyer   = buyers.find((b) => b.email === e.sender_email);
              const dayCol  = days <= 1 ? "#ef4444" : days <= 3 ? "#f59e0b" : "#22c55e";
              const dayText = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`;

              return (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                    <Text style={{ color: "#e2e8f0", display: "block", fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.subject || "No Subject"}
                    </Text>
                    <Text style={{ color: "#475569", fontSize: 12 }}>
                      {buyer?.company_name || e.sender_email}
                    </Text>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <Text style={{ color: dayCol, fontWeight: 700, fontSize: 12, display: "block" }}>{dayText}</Text>
                    <Text style={{ color: "#334155", fontSize: 11 }}>{dayjs(e.due_date).format("DD MMM")}</Text>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </GlassCard>
  );
}

// ─── RemindersPanel ───────────────────────────────────────────────────────────
export function RemindersPanel({ emails, buyers }) {
  const reminders = [];
  const today = new Date();

  emails.forEach((e) => {
    if (e.first_reply_date) return;
    const hrs = (Date.now() - new Date(e.received_date)) / 3600000;
    if      (hrs >= 72) reminders.push({ e, type: "error",   msg: "3×24 jam belum dibalas — Reminder Kedua" });
    else if (hrs >= 24) reminders.push({ e, type: "warning", msg: "1×24 jam belum dibalas — Reminder Pertama" });
  });

  emails.forEach((e) => {
    if (e.due_date && new Date(e.due_date).toDateString() === today.toDateString())
      reminders.push({ e, type: "info", msg: "Due date hari ini!" });
  });

  return (
    <GlassCard
      title={
        <Space size={6}>
          <BellOutlined style={{ color: "#f59e0b" }} />
          <Text style={{ color: "#f1f5f9", fontWeight: 600 }}>SLA Reminders</Text>
        </Space>
      }
    >
      {reminders.length === 0
        ? <Text style={{ color: "#334155", fontSize: 13 }}>No pending reminders</Text>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {reminders.map((r, i) => {
              const buyer = buyers.find((b) => b.email === r.e.sender_email);
              return (
                <Alert
                  key={i}
                  type={r.type}
                  showIcon
                  message={<Text style={{ fontWeight: 600, fontSize: 13 }}>{r.msg}</Text>}
                  description={
                    <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                      {buyer?.company_name || r.e.sender_email} — {r.e.subject || "No Subject"}
                    </Text>
                  }
                />
              );
            })}
          </div>
        )
      }
    </GlassCard>
  );
}
