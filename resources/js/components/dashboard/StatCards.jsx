import { Row, Col, Card, Statistic, Typography } from "antd";
import {
  MailOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, ClockCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function StatCards({ stats }) {
  const { total, onTime, overdue, avgHrs } = stats;

  const cards = [
    { title: "Total Buyer Emails", value: total,  suffix: "",  icon: <MailOutlined />,               color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    { title: "On-Time Responses",  value: onTime, suffix: "",  icon: <CheckCircleOutlined />,         color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    { title: "Overdue Responses",  value: overdue,suffix: "",  icon: <ExclamationCircleOutlined />,   color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    { title: "Avg Response Time",  value: avgHrs < 24 ? Math.round(avgHrs) : Math.round(avgHrs / 24),
                                    suffix: avgHrs < 24 ? "h" : "d",
                                    icon: <ClockCircleOutlined />, color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  ];

  return (
    <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
      {cards.map((c) => (
        <Col xs={24} sm={12} xl={6} key={c.title}>
          <Card
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}
            styles={{ body: { padding: "18px 20px" } }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, color: c.color }}>{c.icon}</span>
              </div>
            </div>
            <Statistic
              value={c.value}
              suffix={<span style={{ fontSize: 18, color: "#64748b" }}>{c.suffix}</span>}
              valueStyle={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}
              title={<Text style={{ color: "#64748b", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{c.title}</Text>}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
