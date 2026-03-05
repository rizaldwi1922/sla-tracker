import { theme as antTheme } from "antd";

const darkTheme = {
  algorithm: antTheme.darkAlgorithm,
  token: {
    colorPrimary: "#3b82f6",
    colorBgBase: "#0f172a",
    colorBgContainer: "rgba(255,255,255,0.04)",
    colorBgElevated: "#1e293b",
    colorBorder: "rgba(255,255,255,0.16)",        // brighter border
    colorBorderSecondary: "rgba(255,255,255,0.1)",
    colorText: "#e2e8f0",                          // brighter body text
    colorTextSecondary: "#94a3b8",                 // brighter secondary
    colorTextTertiary: "#64748b",
    colorTextPlaceholder: "#4b6080",
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
      darkItemSelectedColor: "#93c5fd",
      darkItemColor: "#94a3b8",                    // brighter idle menu text
      darkItemHoverColor: "#e2e8f0",
      darkItemHoverBg: "rgba(255,255,255,0.07)",
      itemBorderRadius: 10,
      itemMarginBlock: 2,
      itemPaddingInline: 16,
    },
    Card: {
      colorBgContainer: "rgba(255,255,255,0.03)",
      colorBorderSecondary: "rgba(255,255,255,0.1)",
      paddingLG: 20,
    },
    Table: {
      colorBgContainer: "transparent",
      headerBg: "rgba(255,255,255,0.06)",
      rowHoverBg: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.08)",
      headerColor: "#94a3b8",                      // brighter header text
      colorText: "#cbd5e1",                        // brighter row text
      fontSize: 13,
    },
    Input: {
      colorBgContainer: "rgba(255,255,255,0.07)",
      colorBorder: "rgba(255,255,255,0.18)",
      activeBorderColor: "#3b82f6",
      hoverBorderColor: "rgba(255,255,255,0.28)",
      colorText: "#f1f5f9",
      colorTextPlaceholder: "#4b6080",
    },
    Select: {
      colorBgContainer: "rgba(255,255,255,0.07)",
      colorBgElevated: "#1a2744",
      colorBorder: "rgba(255,255,255,0.18)",
      optionSelectedBg: "rgba(59,130,246,0.15)",
      colorText: "#e2e8f0",
      colorTextPlaceholder: "#4b6080",
    },
    DatePicker: {
      colorBgContainer: "rgba(255,255,255,0.07)",
      colorBgElevated: "#1a2744",
      colorBorder: "rgba(255,255,255,0.18)",
      colorText: "#e2e8f0",
      colorTextPlaceholder: "#4b6080",
    },
    Modal: {
      contentBg: "#111c35",
      headerBg: "#111c35",
      titleColor: "#f1f5f9",
      colorIcon: "#64748b",
    },
    Button: {
      defaultBg: "rgba(255,255,255,0.06)",
      defaultBorderColor: "rgba(255,255,255,0.18)",
      defaultColor: "#94a3b8",
      defaultHoverBg: "rgba(255,255,255,0.1)",
      defaultHoverBorderColor: "rgba(255,255,255,0.3)",
      defaultHoverColor: "#e2e8f0",
    },
    Tag: {
      defaultBg: "rgba(255,255,255,0.08)",
      defaultColor: "#94a3b8",
    },
    Statistic: {
      titleFontSize: 11,
      contentFontSize: 28,
    },
    Form: {
      labelColor: "#94a3b8",
      labelFontSize: 12,
    },
    Pagination: {
      colorBgContainer: "rgba(255,255,255,0.06)",
      colorBorder: "rgba(255,255,255,0.16)",
      itemActiveBg: "rgba(59,130,246,0.15)",
    },
    Alert: {
      borderRadiusLG: 10,
    },
  },
};

export default darkTheme;
