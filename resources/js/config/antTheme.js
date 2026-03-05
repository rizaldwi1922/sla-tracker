import { theme as antTheme } from "antd";

const darkTheme = {
  algorithm: antTheme.darkAlgorithm,
  token: {
    colorPrimary: "#3b82f6",
    colorBgBase: "#0f172a",
    colorBgContainer: "rgba(255,255,255,0.03)",
    colorBgElevated: "#1e293b",
    colorBorder: "rgba(255,255,255,0.08)",
    colorText: "#f1f5f9",
    colorTextSecondary: "#94a3b8",
    borderRadius: 12,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    colorSuccess: "#22c55e",
    colorError: "#ef4444",
    colorWarning: "#f59e0b",
    colorInfo: "#3b82f6",
  },
  components: {
    Layout: {
      siderBg: "#0a1628",
      bodyBg: "transparent",
    },
    Menu: {
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
      darkItemSelectedBg: "rgba(59,130,246,0.15)",
      darkItemSelectedColor: "#60a5fa",
      darkItemColor: "#64748b",
      darkItemHoverColor: "#f1f5f9",
      darkItemHoverBg: "rgba(255,255,255,0.04)",
      itemBorderRadius: 10,
      itemMarginBlock: 2,
      itemPaddingInline: 16,
    },
    Card: {
      colorBgContainer: "rgba(255,255,255,0.03)",
      colorBorderSecondary: "rgba(255,255,255,0.07)",
      paddingLG: 20,
    },
    Table: {
      colorBgContainer: "transparent",
      headerBg: "rgba(255,255,255,0.03)",
      rowHoverBg: "rgba(255,255,255,0.03)",
      borderColor: "rgba(255,255,255,0.05)",
      headerColor: "#64748b",
      colorText: "#e2e8f0",
      fontSize: 13,
    },
    Input: {
      colorBgContainer: "rgba(255,255,255,0.05)",
      colorBorder: "rgba(255,255,255,0.1)",
      activeBorderColor: "#3b82f6",
      hoverBorderColor: "rgba(255,255,255,0.2)",
      colorText: "#f1f5f9",
      colorPlaceholderText: "#475569",
    },
    Select: {
      colorBgContainer: "rgba(255,255,255,0.05)",
      colorBgElevated: "#1a2744",
      colorBorder: "rgba(255,255,255,0.1)",
      optionSelectedBg: "rgba(59,130,246,0.15)",
    },
    DatePicker: {
      colorBgContainer: "rgba(255,255,255,0.05)",
      colorBgElevated: "#1a2744",
      colorBorder: "rgba(255,255,255,0.1)",
      colorText: "#f1f5f9",
    },
    Modal: {
      contentBg: "#111c35",
      headerBg: "#111c35",
      titleColor: "#f1f5f9",
      colorIcon: "#64748b",
    },
    Button: {
      defaultBg: "rgba(255,255,255,0.05)",
      defaultBorderColor: "rgba(255,255,255,0.12)",
      defaultColor: "#cbd5e1",
      defaultHoverBg: "rgba(255,255,255,0.08)",
      defaultHoverBorderColor: "rgba(255,255,255,0.2)",
    },
    Tag: {
      defaultBg: "rgba(255,255,255,0.06)",
      defaultColor: "#94a3b8",
    },
    Statistic: {
      titleFontSize: 12,
      contentFontSize: 28,
    },
    Form: {
      labelColor: "#94a3b8",
      labelFontSize: 13,
    },
    Pagination: {
      colorBgContainer: "rgba(255,255,255,0.05)",
      colorBorder: "rgba(255,255,255,0.08)",
      itemActiveBg: "rgba(59,130,246,0.15)",
    },
    Alert: {
      borderRadiusLG: 10,
    },
  },
};

export default darkTheme;
