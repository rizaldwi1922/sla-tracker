import { Avatar, Progress, Empty, Typography } from "antd";
import GlassCard from "../shared/GlassCard";

const { Text } = Typography;

export default function SalesPerformanceCard({ emails, buyers }) {
  const stats = {};
  emails.forEach((e) => {
    const buyer = buyers.find((b) => b.email === e.sender_email);
    const name  = buyer?.assigned_sales ?? "Unassigned";
    if (!stats[name]) stats[name] = { total: 0, onTime: 0 };
    stats[name].total++;
    if (e.sla_status === "On-Time") stats[name].onTime++;
  });

  const entries = Object.entries(stats);
  const colors = ["#3b82f6","#22c55e","#a78bfa","#f59e0b","#ef4444"];

  return (
    <GlassCard
      title={<Text style={{ color: "#f1f5f9", fontWeight: 600 }}>SLA Performance by Sales</Text>}
      style={{ minHeight: 200 }}
    >
      {entries.length === 0
        ? <Empty description={<Text style={{ color: "#334155" }}>No data available</Text>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {entries.map(([name, st], i) => {
              const pct = st.total > 0 ? Math.round((st.onTime / st.total) * 100) : 0;
              const col = colors[i % colors.length];
              return (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar size={34} style={{ background: col + "22", color: col, flexShrink: 0, fontSize: 13, fontWeight: 700 }}>
                    {name.charAt(0)}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <Text style={{ color: "#cbd5e1", fontSize: 13 }}>{name}</Text>
                      <Text style={{ color: pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444", fontWeight: 700, fontSize: 13 }}>
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
        )
      }
    </GlassCard>
  );
}
