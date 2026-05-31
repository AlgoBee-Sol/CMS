import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: number; // positive = up, negative = down
  trendLabel?: string;
  onClick?: () => void;
  chips?: { label: string; color: string; bg: string }[];
}

export default function StatCard({
  title, value, subtitle, icon, iconBg = "#eff6ff",
  trend, trendLabel, onClick, chips,
}: StatCardProps) {
  const isClickable = !!onClick;
  return (
    <div
      className={`card-base p-5 transition-all duration-200 ${isClickable ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-neutral-400)" }}>
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-neutral-400)" }}>{subtitle}</p>
          )}
          {chips && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: chip.bg, color: chip.color }}
                >
                  {chip.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : trend < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-500" />
          ) : (
            <Minus className="w-4 h-4 text-slate-400" />
          )}
          <span style={{ color: trend > 0 ? "var(--color-success)" : trend < 0 ? "var(--color-danger)" : "var(--color-neutral-400)" }}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
          {trendLabel && <span style={{ color: "var(--color-neutral-400)" }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
