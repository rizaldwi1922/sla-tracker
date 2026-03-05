import { Avatar, Progress, Empty, Skeleton, Typography } from "antd";
import GlassCard from "../shared/GlassCard";

const { Text } = Typography;

/**
 * @param {Array}   salesPerformance  - from API: [{ sales_id, sales_name, total_emails, on_time, performance_percent }]
 * @param {boolean} loading
 */
export default function SalesPerformanceCard({ salesPerformance = [], loading = false }) {
  const colors = ["#3b82f6", "#22c55e", "#a78bfa", "#f59e0b", "#ef4444"];

  return (
    <GlassCard
      title={<Text style={{ color: "#f1f5f9", fontWeight: 600 }}>SLA Performance by Sales</Text>}
      style={{ minHeight: 200 }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : salesPerformance.length === 0 ? (
        <Empty
          description={<Text style={{ color: "#334155" }}>No data available</Text>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {salesPerformance.map((row, i) => {
            const name = row.sales_name ?? "Unassigned";
            const pct  = row.performance_percent ?? 0;
            const col  = colors[i % colors.length];

            return (
              <div key={row.sales_id ?? i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar
                  size={34}
                  style={{ background: col + "22", color: col, flexShrink: 0, fontSize: 13, fontWeight: 700 }}
                >
                  {name.charAt(0)}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <Text style={{ color: "#cbd5e1", fontSize: 13 }}>{name}</Text>
                    <Text
                      style={{
                        color: pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {pct}%
                    </Text>
                  </div>
                  <Progress
                    percent={pct}
                    showInfo={false}
                    strokeColor={col}
                    trailColor="rgba(255,255,255,0.05)"
                    size={["100%", 5]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}