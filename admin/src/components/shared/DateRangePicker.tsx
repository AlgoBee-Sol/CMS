"use client";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  className?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  className = "",
}: DateRangePickerProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
        className="px-3 py-2 text-sm rounded-lg border bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        style={{ borderColor: "var(--color-neutral-200)" }}
      />
      <span className="text-xs text-slate-400">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndChange(e.target.value)}
        className="px-3 py-2 text-sm rounded-lg border bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        style={{ borderColor: "var(--color-neutral-200)" }}
      />
    </div>
  );
}
