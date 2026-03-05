import { useState, useEffect } from "react";
import { apiRequest } from "../services/apiRequest";
import {
    Table,
    Button,
    Space,
    Tooltip,
    Card,
    Typography,
    notification,
    Tag
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { SLA_TAG } from "../utils/helpers";
import PageHeader from "../components/shared/PageHeader";
import { EmailFilters } from "../components/emails/EmailFilters";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

export default function EmailsPage() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        sales: "",
        sla: "",
        dateFrom: null,
        dateTo: null,
    });
    const [salesList, setSalesList] = useState([]);
    const navigate = useNavigate();

    const columns = [
        {
            title: "Sender",
            key: "sender",
            width: 220,
            render: (_, r) => (
                <>
                    <Text
                        style={{
                            color: "#e2e8f0",
                            display: "block",
                            fontSize: 13,
                            fontWeight: 500,
                        }}
                    >
                        {r.sender_email}
                    </Text>
                    <Text style={{ color: "#475569", fontSize: 12 }}>
                        {r.company_name || "-"}
                    </Text>
                </>
            ),
        },
        {
            title: "Subject",
            key: "subject",
            ellipsis: true,
            render: (_, r) => (
                <>
                    <Text style={{ color: "#94a3b8", fontSize: 13 }}>
                        {r.subject || "-"}
                    </Text>

                    {/* preview email */}
                    <div>
                        <Text
                            style={{
                                color: "#64748b",
                                fontSize: 12,
                            }}
                            ellipsis
                        >
                            {r.body_preview || "-"}
                        </Text>
                    </div>
                </>
            ),
        },
        {
            title: "Sales",
            dataIndex: "sales",
            key: "sales",
            ellipsis: true,
            render: (_, r) => (
                <Text style={{ color: "#94a3b8", fontSize: 13 }}>
                    {r.sales || "-"}
                </Text>
            ),
        },
        {
            title: "Received",
            width: 150,
            render: (_, r) => (
                <Text style={{ color: "#64748b", fontSize: 12 }}>
                    {r.received_date
                        ? dayjs(r.received_date).format("DD MMM YYYY HH:mm")
                        : "-"}
                </Text>
            ),
        },
        {
            title: "Due Date",
            width: 150,
            render: (_, r) => (
                <Text style={{ color: "#64748b", fontSize: 12 }}>
                    {r.due_date
                        ? dayjs(r.due_date).format("DD MMM YYYY HH:mm")
                        : "-"}
                </Text>
            ),
        },
        {
            title: "SLA Duration",
            width: 120,
            render: (_, r) => (
                <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                    {r.sla_duration || "-"}
                </Text>
            ),
        },
        {
            title: "Replied",
            width: 100,
            render: (_, r) =>
                r.is_replied ? (
                    <Tag color="green">Replied</Tag>
                ) : (
                    <Tag color="orange">Pending</Tag>
                ),
        },
        {
            title: "SLA Status",
            width: 110,
            render: (_, r) => SLA_TAG[r.sla_status] ?? SLA_TAG.Pending,
        },
        {
            title: "Actions",
            key: "act",
            width: 90,
            render: (_, r) => (
                <Space size={4}>
                    <Tooltip title="Detail">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() =>
                                navigate(`/emails/thread/${r.thread_id}`)
                            }
                            style={{ borderRadius: 8 }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const fetchEmails = async (params = {}) => {
        try {
            setLoading(true);

            const res = await apiRequest({
                url: "/emails",
                method: "GET",
                params,
            });
            console.log(res.data);
            setEmails(res.data || []);
        } catch (err) {
            notification.error({
                message: "Failed to load emails",
                placement: "bottomRight",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSales = async () => {
        try {
            const res = await apiRequest({
                url: "/sales",
                method: "GET",
            });

            setSalesList(res.data);
        } catch (err) {
            notification.error({
                message: "Failed to load sales",
                placement: "bottomRight",
            });
        }
    };

    useEffect(() => {
        const params = {
            sales: filters.sales || undefined,
            sla: filters.sla || undefined,
            date_from: filters.dateFrom
                ? filters.dateFrom.format("YYYY-MM-DD")
                : undefined,
            date_to: filters.dateTo
                ? filters.dateTo.format("YYYY-MM-DD")
                : undefined,
        };

        fetchEmails(params);
    }, [filters]);

    useEffect(() => {
        fetchSales();
    }, []);

    return (
        <div>
            <PageHeader
                title="Email Inbox"
                subtitle="Manage incoming buyer emails"
            />

            <EmailFilters
                salesList={salesList}
                filters={filters}
                onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
            />

            <Card
                style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    overflow: "hidden",
                }}
                styles={{ body: { padding: 0 } }}
            >
                <Table
                    dataSource={emails}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                />
            </Card>
        </div>
    );
}
