import { Row, Col } from "antd";
import { dummyEmails, dummyBuyers } from "../data/dummy";
import { computeEmailStats } from "../utils/helpers";
import PageHeader from "../components/shared/PageHeader";
import StatCards from "../components/dashboard/StatCards";
import SalesPerformanceCard from "../components/dashboard/SalesPerformanceCard";
import { UpcomingDueDatesCard, RemindersPanel } from "../components/dashboard/DashboardWidgets";

export default function DashboardPage() {
  const stats = computeEmailStats(dummyEmails);

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Monitor your email SLA performance in real-time"
      />

      <StatCards stats={stats} />

      <Row gutter={[14, 14]} style={{ marginBottom: 14 }}>
        <Col xs={24} lg={12}>
          <SalesPerformanceCard emails={dummyEmails} buyers={dummyBuyers} />
        </Col>
        <Col xs={24} lg={12}>
          <UpcomingDueDatesCard emails={dummyEmails} buyers={dummyBuyers} />
        </Col>
      </Row>

      <RemindersPanel emails={dummyEmails} buyers={dummyBuyers} />
    </div>
  );
}
