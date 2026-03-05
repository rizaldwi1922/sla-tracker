import { Card } from "antd";

export default function GlassCard({ style, styles: s, children, ...rest }) {
  return (
    <Card
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        ...style,
      }}
      styles={{ body: { padding: 20 }, ...s }}
      {...rest}
    >
      {children}
    </Card>
  );
}
