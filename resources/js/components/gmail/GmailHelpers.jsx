import { PaperClipOutlined } from "@ant-design/icons";
import { LABEL_COLORS } from "../../data/gmailDummy";

// ─── Label chip ───────────────────────────────────────────────────────────────
export function LabelChip({ label }) {
  const style = LABEL_COLORS[label] ?? {
    bg: "rgba(255,255,255,0.08)", text: "#94a3b8", border: "rgba(255,255,255,0.15)",
  };
  return (
    <span
      className="gm-label"
      style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
    >
      {label}
    </span>
  );
}

// ─── Letter avatar ────────────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  { bg: "rgba(59,130,246,0.2)",  color: "#60a5fa" },
  { bg: "rgba(167,139,250,0.2)", color: "#a78bfa" },
  { bg: "rgba(34,197,94,0.2)",   color: "#4ade80" },
  { bg: "rgba(249,115,22,0.2)",  color: "#fb923c" },
  { bg: "rgba(20,184,166,0.2)",  color: "#2dd4bf" },
];

export function AvatarLetter({ name, size = 36 }) {
  const idx    = name.charCodeAt(0) % AVATAR_PALETTE.length;
  const palette = AVATAR_PALETTE[idx];
  const letter  = name.charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
        background: palette.bg, color: palette.color,
      }}
    >
      {letter}
    </div>
  );
}

// ─── Attachment chip ──────────────────────────────────────────────────────────
export function AttachmentChip({ name }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 8,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      fontSize: 12, color: "#64748b", cursor: "pointer",
    }}>
      <PaperClipOutlined style={{ fontSize: 11 }} />
      {name}
    </div>
  );
}

// ─── Format date ─────────────────────────────────────────────────────────────
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
dayjs.extend(isToday);

export function fmtEmailDate(iso, full = false) {
  const d = dayjs(iso);
  if (full) return d.format("DD MMM YYYY, HH:mm");
  if (d.isToday()) return d.format("HH:mm");
  return d.format("DD MMM");
}
