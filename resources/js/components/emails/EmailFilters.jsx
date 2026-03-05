import { Row, Col, Select, DatePicker, Typography } from "antd";
import GlassCard from "../shared/GlassCard";

const { Option } = Select;
const { Text } = Typography;

/** EmailFilters — filter bar above the email table */
export function EmailFilters({ salesList = [], filters, onChange }) {

  return (
    <GlassCard style={{ marginBottom: 14 }}>
      <Row gutter={[10, 10]}>

        {/* Sales Filter */}
        <Col xs={24} sm={6}>
          <Text style={s.label}>Sales Name</Text>

          <Select
            style={{ width: "100%" }}
            value={filters.sales || undefined}
            onChange={(v) => onChange({ sales: v ?? "" })}
            placeholder="All Sales"
            allowClear
            size="middle"
          >
            {salesList.map((s) => (
              <Option key={s.id} value={s.id}>
                {s.name}
              </Option>
            ))}
          </Select>
        </Col>

        {/* Date From */}
        <Col xs={24} sm={6}>
          <Text style={s.label}>Date From</Text>
          <DatePicker
            style={{ width: "100%" }}
            value={filters.dateFrom}
            onChange={(v) => onChange({ dateFrom: v })}
            size="middle"
          />
        </Col>

        {/* Date To */}
        <Col xs={24} sm={6}>
          <Text style={s.label}>Date To</Text>
          <DatePicker
            style={{ width: "100%" }}
            value={filters.dateTo}
            onChange={(v) => onChange({ dateTo: v })}
            size="middle"
          />
        </Col>

        {/* SLA Status */}
        <Col xs={24} sm={6}>
          <Text style={s.label}>SLA Status</Text>
          <Select
            style={{ width: "100%" }}
            value={filters.sla || undefined}
            onChange={(v) => onChange({ sla: v ?? "" })}
            placeholder="All Status"
            allowClear
            size="middle"
          >
            <Option value="On-Time">On-Time</Option>
            <Option value="Overdue">Overdue</Option>
            <Option value="Pending">Pending</Option>
          </Select>
        </Col>

      </Row>
    </GlassCard>
  );
}

const s = {
  label: {
    color: "#475569",
    fontSize: 11,
    fontWeight: 600,
    display: "block",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: "0.04em"
  }
};