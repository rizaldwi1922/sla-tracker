import { useState, useEffect, useCallback } from "react";
import { Row, Col, Select, Button, Table, Tag, Progress, Empty, Card, Typography, Spin } from "antd";
import { apiRequest } from "../services/apiRequest";
import GlassCard from "../components/shared/GlassCard";
import PageHeader from "../components/shared/PageHeader";

const { Option } = Select;
const { Text } = Typography;

export default function ReportsPage() {
  const [salesFilter, setSalesFilter] = useState(undefined);
  const [range, setRange]             = useState(30);
  const [reportData, setReportData]   = useState(null);
  const [salesList, setSalesList]     = useState([]);
  const [loading, setLoading]         = useState(false);

  // Fetch sales list for dropdown
  useEffect(() => {
    apiRequest({ method: "GET", url: "/sales" })
      .then((data) => setSalesList(data))
      .catch(() => {});
  }, []);

  const fetchReport = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const data = await apiRequest({
        method: "GET",
        url: "/report/sla-report",
        params: {
          range: params.range ?? range,
          ...(params.salesId ? { sales_id: params.salesId } : {}),
        },
      });
      setReportData(data);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchReport({ range });
  }, []);

  const handleGenerate = () => {
    fetchReport({ range, salesId: salesFilter });
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const dist = reportData?.response_time_distribution ?? {
    under_1_hour: 0, hour_1_12: 0, hour_12_24: 0, over_24_hour: 0,
  };

  const distItems = [
    { label: "< 1 hour",    val: dist.under_1_hour, color: "#22c55e" },
    { label: "1–12 hours",  val: dist.hour_1_12,    color: "#3b82f6" },
    { label: "12–24 hours", val: dist.hour_12_24,   color: "#f59e0b" },
    { label: "> 24 hours",  val: dist.over_24_hour, color: "#ef4444" },
  ];
  const totalDist = distItems.reduce((s, i) => s + i.val, 0);

  const compliance      = reportData?.sla_compliance_rate ?? 0;
  const complianceColor = compliance >= 80 ? "#22c55e" : compliance >= 50 ? "#f59e0b" : "#ef4444";

  const perfData = (reportData?.sales_performance ?? []).map((row) => ({
    sales_id:    row.sales_id,
    name:        row.sales_name ?? "Unassigned",
    total:       row.total_emails,
    onTime:      row.on_time,
    overdue:     row.overdue,
    avg:         row.avg_response_hours != null ? `${row.avg_response_hours}h` : "—",
    compliance:  row.compliance_percent,
  }));

  const perfColumns = [
    {
      title: "Sales Name",
      key: "name",
      render: (_, r) => <Text style={{ color: "#e2e8f0", fontWeight: 600 }}>{r.name}</Text>,
    },
    {
      title: "Total Emails",
      key: "total",
      dataIndex: "total",
      render: (v) => <Text style={{ color: "#94a3b8" }}>{v}</Text>,
    },
    {
      title: "On-Time",
      key: "ot",
      render: (_, r) => <Text style={{ color: "#22c55e", fontWeight: 700 }}>{r.onTime}</Text>,
    },
    {
      title: "Overdue",
      key: "ov",
      render: (_, r) => <Text style={{ color: "#ef4444", fontWeight: 700 }}>{r.overdue}</Text>,
    },
    {
      title: "Avg Response",
      key: "avg",
      render: (_, r) => <Text style={{ color: "#64748b" }}>{r.avg}</Text>,
    },
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

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Detailed SLA performance analysis" />

      {/* Filter bar */}
      <GlassCard style={{ marginBottom: 16 }}>
        <Row gutter={[10, 10]} align="bottom">
          <Col xs={24} sm={8}>
            <Text style={s.label}>Sales Person</Text>
            <Select
              style={{ width: "100%" }}
              value={salesFilter}
              onChange={(v) => setSalesFilter(v)}
              placeholder="All Sales"
              allowClear
              onClear={() => setSalesFilter(undefined)}
            >
              {salesList.map((s) => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
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
            <Button
              type="primary"
              block
              loading={loading}
              style={{ borderRadius: 10 }}
              onClick={handleGenerate}
            >
              Generate Report
            </Button>
          </Col>
        </Row>
      </GlassCard>

      <Spin spinning={loading}>
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
                      <div style={{
                        height: "100%",
                        width: totalDist > 0 ? `${(d.val / totalDist) * 100}%` : "0%",
                        background: d.color,
                        borderRadius: 4,
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                    <Text style={{ color: "#e2e8f0", width: 22, textAlign: "right", fontWeight: 700, fontSize: 13 }}>
                      {d.val}
                    </Text>
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
                  percent={compliance}
                  size={150}
                  strokeColor={complianceColor}
                  trailColor="rgba(255,255,255,0.06)"
                  strokeWidth={10}
                  format={(p) => (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{p}%</div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 4, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Compliance
                      </div>
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
            rowKey="sales_id"
            pagination={false}
            size="middle"
            locale={{
              emptyText: (
                <Empty
                  description={<Text style={{ color: "#334155" }}>No data available</Text>}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Card>
      </Spin>
    </div>
  );
}

const s = {
  label: {
    color: "#475569", fontSize: 11, fontWeight: 600,
    display: "block", marginBottom: 4,
    textTransform: "uppercase", letterSpacing: "0.04em",
  },
};