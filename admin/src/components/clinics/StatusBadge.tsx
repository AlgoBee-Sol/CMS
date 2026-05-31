type Status = "Active" | "Trial" | "Ended" | string;

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  Active: { bg: "#dcfce7", text: "#15803d", dot: "#16a34a", label: "Active" },
  Trial: { bg: "#fef9c3", text: "#a16207", dot: "#d97706", label: "Trial" },
  Ended: { bg: "#fee2e2", text: "#b91c1c", dot: "#dc2626", label: "Ended" },
  Inactive: { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8", label: "Inactive" },
};

interface StatusBadgeProps {
  status: Status;
  showDot?: boolean;
}

export default function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8", label: status };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      )}
      {cfg.label}
    </span>
  );
}
