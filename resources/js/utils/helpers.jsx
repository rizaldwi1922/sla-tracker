import { Tag } from "antd";
import dayjs from "dayjs";

// ─── SLA ──────────────────────────────────────────────────────────────────────
export const SLA_TAG = {
  "On-Time": <Tag color="success" style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}>On-Time</Tag>,
  Overdue:   <Tag color="error"   style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}>Overdue</Tag>,
  Pending:   <Tag color="warning" style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}>Pending</Tag>,
};

export const STATUS_TAG = {
  Active:   <Tag color="success" style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}>Active</Tag>,
  Inactive: <Tag color="default" style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}>Inactive</Tag>,
};

// ─── Formatters ───────────────────────────────────────────────────────────────
export const fmtDate     = (s) => s ? dayjs(s).format("DD MMM YYYY")       : "-";
export const fmtDateTime = (s) => s ? dayjs(s).format("DD MMM YYYY HH:mm") : "-";

// ─── SLA calculator ───────────────────────────────────────────────────────────
export function calcSLA(received, reply) {
  if (!reply) return "Pending";
  const hrs = (new Date(reply) - new Date(received)) / 3600000;
  return hrs <= 24 ? "On-Time" : "Overdue";
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export function computeEmailStats(emails) {
  const total   = emails.length;
  const onTime  = emails.filter((e) => e.sla_status === "On-Time").length;
  const overdue = emails.filter((e) => e.sla_status === "Overdue").length;
  const pending = emails.filter((e) => e.sla_status === "Pending").length;

  const responded = emails.filter((e) => e.first_reply_date);
  const avgHrs = responded.length > 0
    ? responded.reduce((s, e) =>
        s + (new Date(e.first_reply_date) - new Date(e.received_date)) / 3600000, 0
      ) / responded.length
    : 0;

  return { total, onTime, overdue, pending, avgHrs };
}
