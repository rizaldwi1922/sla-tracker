import { useState, useMemo } from "react";
import { Row, Col, Select, Button, Table, Tag, Progress, Empty, Card, Typography } from "antd";
import { dummyEmails, dummyBuyers } from "../data/dummy";
import GlassCard from "../components/shared/GlassCard";
import PageHeader from "../components/shared/PageHeader";

const { Option } = Select;
const { Text } = Typography;

export default function ReportsPage() {
  const [salesFilter, setSalesFilter] = useState("");
  const [range, setRange]             = useState(30);
  const [generated, setGenerated]     = useState(true);

  const salesNames = [...new Set(dummyBuyers.map((b) => b.assigned_sales))];

  const report = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);

    let re = dummyEmails.filter((e) => new Date(e.received_date) >= cutoff);
    if (salesFilter) re = re.filter((e) => dummyBuyers.find((b) => b.email === e.sender_email)?.assigned_sales === salesFilter);

    let d1h = 0, d12h = 0, d24h = 0, dOver = 0;
    re.forEach((e) => {
      if (!e.first_reply_date) return;
      const h = (new Date(e.first_reply_date) - new Date(e.received_date)) / 3600000;
      if (h <= 1) d1h++; else if (h <= 12) d12h++; else if (h <= 24) d24h++; else dOver++;
    });

    const total      = re.length;
    const onTime     = re.filter((e) => e.sla_status === "On-Time").length;
    const compliance = total > 0 ? Math.round((onTime / total) * 100) : 0;

    const salesStats = {};
    re.forEach((e) => {
      const b = dummyBuyers.find((b) => b.email === e.sender_email);
      const n = b?.assigned_sales ?? "Unassigned";
      if (!salesStats[n]) salesStats[n] = { total: 0, onTime: 0, overdue: 0, times: [] };
      salesStats[n].total++;
      if (e.sla_status === "On-Time") salesStats[n].onTime++;
      if (e.sla_status === "Overdue") salesStats[n].overdue++;
      if (e.first_reply_date) salesStats[n].times.push((new Date(e.first_reply_date) - new Date(e.received_date)) / 3600000);
    });

    return { d1h, d12h, d24h, dOver, compliance, salesStats, total };
  }, [salesFilter, range, generated]);

  const distItems = [
    { label: "< 1 hour",    val: report.d1h,   color: "#22c55e" },
    { label: "1–12 hours",  val: report.d12h,  color: "#3b82f6" },
    { label: "12–24 hours", val: report.d24h,  color: "#f59e0b" },
    { label: "> 24 hours",  val: report.dOver, color: "#ef4444" },
  ];
  const totalDist = distItems.reduce((s, i) => s + i.val, 0);

  const perfData = Object.entries(report.salesStats).map(([name, st]) => ({
    name,
    total:      st.total,
    onTime:     st.onTime,
    overdue:    st.overdue,
    avg:        st.times.length > 0 ? Math.round(st.times.reduce((a, b) => a + b, 0) / st.times.length) + "h" : "-",
    compliance: st.total > 0 ? Math.round((st.onTime / st.total) * 100) : 0,
  }));

  const perfColumns = [
    { title: "Sales Name",   key: "name",   render: (_, r) => <Text style={{ color: "#e2e8f0", fontWeight: 600 }}>{r.name}</Text> },
    { title: "Total Emails", key: "total",  dataIndex: "total",  render: (v) => <Text style={{ color: "#94a3b8" }}>{v}</Text> },
    { title: "On-Time",      key: "ot",     render: (_, r) => <Text style={{ color: "#22c55e", fontWeight: 700 }}>{r.onTime}</Text> },
    { title: "Overdue",      key: "ov",     render: (_, r) => <Text style={{ color: "#ef4444", fontWeight: 700 }}>{r.overdue}</Text> },
    { title: "Avg Response", key: "avg",    render: (_, r) => <Text style={{ color: "#64748b" }}>{r.avg}</Text> },
    {
      title: "Compliance",
      key: "comp",
      render: (_, r) => (
        <Tag
          color={r.compliance >= 80 ? "success" : r.compliance >= 50 ? "warning" : "error"}
          style={{ borderRadius: 20, fontWeight: 700 }}
        >
          {r.compliance}%
        </Tag>
      ),
    },
  ];

  const complianceColor = report.compliance >= 80 ? "#22c55e" : report.compliance >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div>
      <PageHeader title="Reports &amp; Analytics" subtitle="Detailed SLA performance analysis" />

      {/* Filter bar */}
      <GlassCard style={{ marginBottom: 16 }}>
        <Row gutter={[10, 10]} align="bottom">
          <Col xs={24} sm={8}>
            <Text style={s.label}>Sales Person</Text>
            <Select style={{ width: "100%" }} value={salesFilter || undefined} onChange={(v) => setSalesFilter(v ?? "")} placeholder="All Sales" allowClear>
              {salesNames.map((n) => <Option key={n} value={n}>{n}</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Text style={s.label}>Date Range</Text>
            <Select style={{ width: "100%" }} value={range} onChange={setRange}>
              <Option value={7}>Last 7 Days</Option>
              <Option value={30}>Last 30 Days</Option>
              <Option value={90}>Last 90 Days</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Button type="primary" block style={{ borderRadius: 10 }} onClick={() => setGenerated((g) => !g)}>
              Generate Report
            </Button>
          </Col>
        </Row>
      </GlassCard>

      {/* Charts */}
      <Row gutter={[14, 14]} style={{ marginBottom: 14 }}>
        {/* Distribution */}
        <Col xs={24} lg={12}>
          <GlassCard title={<Text style={{ color: "#f1f5f9", fontWeight: 600 }}>Response Time Distribution</Text>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {distItems.map((d) => (
                <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Text style={{ color: "#64748b", width: 88, fontSize: 12, flexShrink: 0 }}>{d.label}</Text>
                  <div style={{ flex: 1, height: 7, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: totalDist > 0 ? `${(d.val / totalDist) * 100}%` : "0%", background: d.color, borderRadius: 4, transition: "width 0.5s ease" }} />
                  </div>
                  <Text style={{ color: "#e2e8f0", width: 22, textAlign: "right", fontWeight: 700, fontSize: 13 }}>{d.val}</Text>
                </div>
              ))}
            </div>
          </GlassCard>
        </Col>

        {/* Compliance gauge */}
        <Col xs={24} lg={12}>
          <GlassCard title={<Text style={{ color: "#f1f5f9", fontWeight: 600 }}>SLA Compliance Rate</Text>}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 150 }}>
              <Progress
                type="circle"
                percent={report.compliance}
                size={150}
                strokeColor={complianceColor}
                trailColor="rgba(255,255,255,0.06)"
                strokeWidth={10}
                format={(p) => (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{p}%</div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 4, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Compliance</div>
                  </div>
                )}
              />
            </div>
          </GlassCard>
        </Col>
      </Row>

      {/* Performance table */}
      <Card
        title={<Text style={{ color: "#f1f5f9", fontWeight: 600 }}>Sales Performance Summary</Text>}
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}
        styles={{ body: { padding: 0 }, header: { padding: "0 20px" } }}
      >
        <Table
          dataSource={perfData}
          columns={perfColumns}
          rowKey="name"
          pagination={false}
          size="middle"
          locale={{ emptyText: <Empty description={<Text style={{ color: "#334155" }}>No data available</Text>} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        />
      </Card>
    </div>
  );
}

const s = {
  label: { color: "#475569", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" },
};
