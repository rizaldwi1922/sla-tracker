import { useNavigate } from "react-router-dom";
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    Row,
    Col,
    Alert,
    Space,
    notification,
} from "antd";
import {
    MailOutlined,
    LockOutlined,
    UserOutlined,
    GoogleOutlined,
} from "@ant-design/icons";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const { Title, Text } = Typography;

export default function LoginPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState("admin");
    const [adminForm] = Form.useForm();
    const [salesForm] = Form.useForm();
    const { loginAdmin, loginSales } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handleAdmin = async ({ username, password }) => {
        setLoading(true);
        try {
            await loginAdmin(username, password);

            notification.success({
                message: "Login successful",
                placement: "bottomRight",
            });

            navigate("/dashboard");
        } catch (err) {
            notification.error({
                message: err?.error || "Invalid credentials",
                placement: "bottomRight",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSales = () => {
        loginSales();
    };

    return (
        <div className="login-page">
            <div style={{ width: "100%", maxWidth: 420, padding: "0 16px" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={s.logoBox}>
                        <MailOutlined style={{ fontSize: 28, color: "#fff" }} />
                    </div>
                    <Title
                        level={2}
                        style={{
                            color: "#f1f5f9",
                            marginBottom: 4,
                            fontSize: 24,
                        }}
                    >
                        Email SLA Tracker
                    </Title>
                    <Text style={{ color: "#475569", fontSize: 13 }}>
                        Monitor &amp; Manage Sales Response Time
                    </Text>
                </div>

                {/* Tab toggle */}
                <Row gutter={10} style={{ marginBottom: 20 }}>
                    {[
                        {
                            key: "admin",
                            icon: <LockOutlined />,
                            label: "Admin",
                        },
                        {
                            key: "sales",
                            icon: <UserOutlined />,
                            label: "Sales",
                        },
                    ].map((t) => (
                        <Col span={12} key={t.key}>
                            <Button
                                block
                                icon={t.icon}
                                type={tab === t.key ? "primary" : "default"}
                                size="large"
                                style={{ borderRadius: 10, fontWeight: 600 }}
                                onClick={() => setTab(t.key)}
                            >
                                {t.label}
                            </Button>
                        </Col>
                    ))}
                </Row>

                {/* Form card */}
                <div style={s.formCard}>
                    {tab === "admin" ? (
                        <Form
                            form={adminForm}
                            layout="vertical"
                            onFinish={handleAdmin}
                        >
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[{ required: true }]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Enter username"
                                    size="large"
                                />
                            </Form.Item>
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{ required: true }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Enter password"
                                    size="large"
                                />
                            </Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={loading}
                            >
                                Login as Admin
                            </Button>
                            <Text style={s.hint}>Demo: admin / admin123</Text>
                        </Form>
                    ) : (
                        <Form
                            form={salesForm}
                            layout="vertical"
                            onFinish={handleSales}
                        >
                            <Alert
                                message="In production this uses Google OAuth. Any Gmail works for demo."
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                            <Form.Item
                                label="Gmail Address"
                                name="email"
                                rules={[{ required: true, type: "email" }]}
                            >
                                <Input
                                    prefix={<GoogleOutlined />}
                                    placeholder="your.name@gmail.com"
                                    size="large"
                                />
                            </Form.Item>
                            <Button
                                onClick={handleSales}
                                block
                                size="large"
                                icon={<GoogleOutlined />}
                            >
                                Continue with Gmail
                            </Button>
                            <Text style={s.hint}>
                                Use any @gmail.com address
                            </Text>
                        </Form>
                    )}
                </div>
            </div>
        </div>
    );
}

const s = {
    logoBox: {
        width: 64,
        height: 64,
        borderRadius: 18,
        background: "linear-gradient(135deg,#3b82f6,#2563eb)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 14px",
        boxShadow: "0 16px 36px rgba(59,130,246,0.28)",
    },
    formCard: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 28,
        backdropFilter: "blur(12px)",
    },
    hint: {
        color: "#334155",
        display: "block",
        textAlign: "center",
        marginTop: 14,
        fontSize: 12,
    },
};
