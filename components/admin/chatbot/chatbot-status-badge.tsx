import { cn } from "@/lib/utils";
import {
  chatbotStatusBadgeClass,
  chatbotStatusLabels,
  type ChatbotConversaStatus,
} from "@/types/chatbot";

export function ChatbotStatusBadge({
  status,
  className,
}: {
  status: ChatbotConversaStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        chatbotStatusBadgeClass[status],
        className,
      )}
    >
      {chatbotStatusLabels[status]}
    </span>
  );
}
