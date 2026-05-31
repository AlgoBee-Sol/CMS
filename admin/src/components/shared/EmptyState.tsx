import { InboxIcon } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ message = "No records found", description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "var(--color-primary-50)" }}
      >
        <InboxIcon className="w-8 h-8" style={{ color: "var(--color-primary-400)" }} />
      </div>
      <p className="font-semibold text-base" style={{ color: "var(--color-neutral-900)" }}>{message}</p>
      {description && (
        <p className="mt-1 text-sm max-w-sm" style={{ color: "var(--color-neutral-400)" }}>{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
