import {
    Layout,
    Menu,
    Badge,
    Button,
    Space,
    Avatar,
    Typography,
    Tooltip,
} from "antd";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    MailOutlined,
    DashboardOutlined,
    TeamOutlined,
    BarChartOutlined,
    LogoutOutlined,
    LockOutlined,
    UserOutlined,
    GoogleOutlined
} from "@ant-design/icons";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const { Sider } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/emails",    icon: <MailOutlined />,      label: "Email Inbox" },
    { key: "/gmail",     icon: <GoogleOutlined />,    label: "Gmail" },
    { key: "/buyers",    icon: <TeamOutlined />,      label: "Master Buyer" },
    { key: "/reports",   icon: <BarChartOutlined />,  label: "Reports" },
];

export default function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const { user, logout } = useContext(AuthContext);
    const menuItems =
        user?.role === "sales"
            ? NAV_ITEMS.filter((item) => item.key === "/dashboard")
            : NAV_ITEMS;

    const handleLogout = () => logout();

    // Halaman yang butuh full-height tanpa padding scroll
    const isFullHeight = ["/gmail"].includes(location.pathname);

    return (
        <Layout style={{ height: "100vh", overflow: "hidden" }}>
            {/* ── Sidebar ── */}
            <Sider width={240} className="app-sider">
                {/* Logo */}
                <div style={s.logoArea}>
                    <div style={s.logoIcon}>
                        <MailOutlined style={{ color: "#fff", fontSize: 16 }} />
                    </div>
                    <div>
                        <Text style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, display: "block", lineHeight: 1.2 }}>
                            Email SLA
                        </Text>
                        <Text style={{ color: "#334155", fontSize: 11 }}>Tracker</Text>
                    </div>
                </div>

                {/* Nav */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    style={{ background: "transparent", border: "none", padding: "4px 0", flex: 1 }}
                    items={menuItems.map(({ key, icon, label }) => ({
                        key, icon, label,
                        onClick: () => navigate(key),
                    }))}
                />

                {/* Footer */}
                <div style={s.sideFooter}>
                    <div style={s.statusBox}>
                        <Space size={6}>
                            <Badge status="processing" color="#22c55e" />
                            <Text style={{ color: "#475569", fontSize: 12 }}>System Active</Text>
                        </Space>
                    </div>
                    <div style={s.userBox}>
                        <Space size={10}>
                            <Avatar size={30} style={{ background: "rgba(59,130,246,0.2)", color: "#3b82f6", fontSize: 12 }}>
                               {user?.role === "admin" ? <LockOutlined /> : <UserOutlined />}
                            </Avatar>
                            <div>
                                <Text style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 600, display: "block" }}>
                                    {user?.name}
                                </Text>
                                <Text style={{ color: "#334155", fontSize: 11 }}>{user?.role}</Text>
                            </div>
                        </Space>
                    </div>
                    <Tooltip title="Logout">
                        <Button
                            icon={<LogoutOutlined />}
                            block
                            onClick={handleLogout}
                            style={{ borderRadius: 10, borderColor: "rgba(255,255,255,0.08)", fontSize: 13, color: "#475569" }}
                        >
                            Logout
                        </Button>
                    </Tooltip>
                </div>
            </Sider>

            {/* ── Main Content ── */}
            <div
                className="app-content"
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",   // ← kunci: tidak scroll di sini
                    minWidth: 0,
                }}
            >
                <div style={isFullHeight ? s.contentFull : s.contentNormal}>
                    <Outlet />
                </div>
            </div>
        </Layout>
    );
}

const s = {
    logoArea: {
        padding: "22px 20px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
    },
    logoIcon: {
        width: 34, height: 34, borderRadius: 9,
        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
    },
    sideFooter: {
        padding: "12px 14px 16px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        marginTop: "auto",
    },
    statusBox: {
        padding: "10px 12px", borderRadius: 10,
        background: "rgba(255,255,255,0.03)", marginBottom: 10,
    },
    userBox: {
        padding: "10px 12px", borderRadius: 10,
        background: "rgba(255,255,255,0.03)", marginBottom: 10,
    },
    // Halaman biasa — bisa scroll normal
    contentNormal: {
        padding: "28px 32px",
        flex: 1,
        overflowY: "auto",
        height: "100%",
    },
    // Halaman full-height (Gmail) — tidak scroll, konten manage scrollnya sendiri
    contentFull: {
        padding: "28px 32px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
    },
};