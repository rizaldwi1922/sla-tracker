import { useState, useEffect } from "react";
import {
    Table,
    Button,
    Space,
    Tooltip,
    Card,
    Typography,
    notification,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { apiRequest } from "../services/apiRequest";
import { STATUS_TAG } from "../utils/helpers";
import PageHeader from "../components/shared/PageHeader";
import DeleteModal from "../components/shared/DeleteModal";
import BuyerModal from "../components/buyers/BuyerModal";

const { Text } = Typography;

export default function BuyersPage() {
    const [buyers, setBuyers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editRecord, setEdit] = useState(null);
    const [deleteTarget, setDel] = useState(null);
    const [salesList, setSalesList] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBuyers = async () => {
        try {
            setLoading(true);
            const res = await apiRequest({
                method: "GET",
                url: "/buyers",
            });

            const data = res.data.map((b) => ({
                id: b.id,
                email: b.email,
                company_name: b.company,
                pic_name: b.pic_name,
                assigned_sales: b.sales?.name ?? "-",
                status: b.is_active ? "Active" : "Inactive",
                registration_date: b.registered_at,
            }));

            setBuyers(data);
        } catch (err) {
            notification.error({
                message: "Failed to load buyers",
                placement: "bottomRight",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSales = async () => {
        try {
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
        }
    };

    useEffect(() => {
        fetchBuyers();
        fetchSales();
    }, []);

    const handleSave = async (vals, record) => {
        try {
            const payload = {
                email: vals.email,
                company: vals.company_name,
                pic_name: vals.pic_name,
                assigned_sales: vals.assigned_sales,
                is_active: vals.status === "Active",
            };

            if (record) {
                await apiRequest({
                    method: "PUT",
                    url: `/buyers/${record.id}`,
                    data: payload,
                });

                notification.success({
                    message: "Buyer updated",
                    placement: "bottomRight",
                });
            } else {
                await apiRequest({
                    method: "POST",
                    url: `/buyers`,
                    data: payload,
                });

                notification.success({
                    message: "Buyer added",
                    placement: "bottomRight",
                });
            }

            setModalOpen(false);
            fetchBuyers();
        } catch (err) {
            notification.error({
                message: "Failed to save buyer",
                placement: "bottomRight",
            });
        }
    };

    const handleDelete = async () => {
        try {
            await apiRequest({
                method: "DELETE",
                url: `/buyers/${deleteTarget.id}`,
            });

            notification.success({
                message: "Buyer deleted",
                placement: "bottomRight",
            });

            setDel(null);
            fetchBuyers();
        } catch (err) {
            notification.error({
                message: "Failed to delete buyer",
                placement: "bottomRight",
            });
        }
    };

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
            title: "Company",
            dataIndex: "company_name",
            key: "company",
            render: (v) => (
                <Text style={{ color: "#94a3b8", fontSize: 13 }}>{v}</Text>
            ),
        },
        {
            title: "PIC Name",
            dataIndex: "pic_name",
            key: "pic",
            render: (v) => (
                <Text style={{ color: "#94a3b8", fontSize: 13 }}>{v}</Text>
            ),
        },
        {
            title: "Assigned Sales",
            dataIndex: "assigned_sales",
            key: "sales",
            render: (v) => (
                <Text style={{ color: "#94a3b8", fontSize: 13 }}>{v}</Text>
            ),
        },
        {
            title: "Status",
            key: "status",
            render: (_, r) => STATUS_TAG[r.status] ?? STATUS_TAG.Active,
        },
        {
            title: "Registered",
            key: "reg",
            width: 130,
            render: (_, r) => (
                <Text style={{ color: "#475569", fontSize: 12 }}>
                    {r.registration_date
                        ? dayjs(r.registration_date).format("DD MMM YYYY")
                        : "-"}
                </Text>
            ),
        },
        {
            title: "Actions",
            key: "act",
            width: 90,
            render: (_, r) => (
                <Space size={4}>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                setEdit(r);
                                setModalOpen(true);
                            }}
                            style={{ borderRadius: 8 }}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => setDel(r)}
                            style={{ borderRadius: 8 }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Master Buyer Email"
                subtitle="Register and manage buyer email addresses"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ borderRadius: 10 }}
                        onClick={() => {
                            setEdit(null);
                            setModalOpen(true);
                        }}
                    >
                        Add Buyer
                    </Button>
                }
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
                    dataSource={buyers}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                    size="middle"
                    loading={loading}
                />
            </Card>

            <BuyerModal
                open={modalOpen}
                record={editRecord}
                salesList={salesList}
                onSave={handleSave}
                onClose={() => setModalOpen(false)}
            />
            <DeleteModal
                open={!!deleteTarget}
                message="Delete this buyer?"
                onConfirm={handleDelete}
                onCancel={() => setDel(null)}
                
            />
        </div>
    );
}
