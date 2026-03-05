import { useState, useEffect } from "react";
import {
    Table,
    Card,
    Typography,
    notification,
} from "antd";
import { apiRequest } from "../services/apiRequest";
import PageHeader from "../components/shared/PageHeader";

const { Text } = Typography;

export default function SalesListPage() {
    const [salesList, setSalesList] = useState([]);
    const [loading, setLoading] = useState(false)


    const fetchSales = async () => {
        try {
            setLoading(true)
            const res = await apiRequest({
                method: "GET",
                url: "/sales",
            });

            setSalesList(res);
        } catch (err) {
            notification.error({
                message: "Failed to load sales",
                placement: "bottomRight",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const columns = [
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (v) => (
                <Text style={{ color: "#e2e8f0", fontSize: 13 }}>{v}</Text>
            ),
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (v) => (
                <Text style={{ color: "#94a3b8", fontSize: 13 }}>{v}</Text>
            ),
        },
       
    ];

    return (
        <div>
            <PageHeader
                title="Register Sales"
                
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
                    dataSource={salesList}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                    size="middle"
                    loading={loading}
                />
            </Card>
        </div>
    );
}
