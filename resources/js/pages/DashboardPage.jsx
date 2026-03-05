import { useState, useEffect } from "react";
import { Row, Col } from "antd";
import { apiRequest } from "../services/apiRequest";
import PageHeader from "../components/shared/PageHeader";
import StatCards from "../components/dashboard/StatCards";
import SalesPerformanceCard from "../components/dashboard/SalesPerformanceCard";
import { UpcomingDueDatesCard, RemindersPanel } from "../components/dashboard/DashboardWidgets";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await apiRequest({ method: "GET", url: "/dashboard/sla" });
        setDashboardData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = dashboardData
    ? {
        total:   dashboardData?.summary?.total_buyer_emails,
        onTime:  dashboardData?.summary?.on_time_responses,
        overdue: dashboardData?.summary?.overdue_responses,
        avgHrs:  (dashboardData?.summary?.avg_response_minutes ?? 0) / 60,
      }
    : { total: 0, onTime: 0, overdue: 0, avgHrs: 0 };

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Monitor your email SLA performance in real-time"
      />

      <StatCards stats={stats} loading={loading} />

      <Row gutter={[14, 14]} style={{ marginBottom: 14 }}>
        <Col xs={24} lg={12}>
          <SalesPerformanceCard
            salesPerformance={dashboardData?.sales_performance ?? []}
            loading={loading}
          />
        </Col>
        <Col xs={24} lg={12}>
          <UpcomingDueDatesCard
            upcomingDueDates={dashboardData?.upcoming_due_dates ?? []}
            loading={loading}
          />
        </Col>
      </Row>

      <RemindersPanel
        reminders={dashboardData?.sla_reminders ?? []}
        loading={loading}
      />
    </div>
  );
}