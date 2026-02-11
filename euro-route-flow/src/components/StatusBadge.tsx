import { cn } from "@/lib/utils";

type DeliveryStatus = "en_attente" | "en_cours" | "livre" | "EN_ATTENTE" | "EN_COURS" | "LIVRE";

interface StatusBadgeProps {
  status: DeliveryStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  en_attente: {
    label: "En attente",
    className: "status-pending",
  },
  en_cours: {
    label: "En cours",
    className: "status-in-progress",
  },
  livre: {
    label: "Livré",
    className: "status-delivered",
  },
  EN_ATTENTE: {
    label: "En attente",
    className: "status-pending",
  },
  EN_COURS: {
    label: "En cours",
    className: "status-in-progress",
  },
  LIVRE: {
    label: "Livré",
    className: "status-delivered",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          "bg-gray-100 text-gray-800",
          className
        )}
      >
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
