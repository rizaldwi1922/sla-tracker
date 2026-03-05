import { Typography } from "antd";
const { Title, Text } = Typography;

/**
 * PageHeader — consistent title + subtitle used on every page
 * Props: title, subtitle, extra (React node for right side)
 */
export default function PageHeader({ title, subtitle, extra }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
      <div>
        <Title level={3} style={{ color: "#f1f5f9", marginBottom: 2, fontSize: 20, fontWeight: 700 }}>
          {title}
        </Title>
        {subtitle && <Text style={{ color: "#64748b", fontSize: 13 }}>{subtitle}</Text>}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}
