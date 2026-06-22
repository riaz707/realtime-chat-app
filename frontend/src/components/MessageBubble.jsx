import { Check, CheckCheck } from "lucide-react";
import { formatTime } from "../utils/format";

export default function MessageBubble({ message, isOwn, showSender, isGroup, isRead }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fade-in-up`}>
      <div className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {showSender && isGroup && !isOwn && (
          <span className="text-xs font-medium text-coral-400 mb-1 ml-1">
            {message.sender?.name}
          </span>
        )}
        <div
          className={`px-4 py-2.5 rounded-bubble text-[0.95rem] leading-relaxed break-words ${
            isOwn
              ? "bg-gradient-to-br from-coral-500 to-coral-600 text-white rounded-br-md"
              : "bg-ink-700 text-mist-100 rounded-bl-md"
          }`}
        >
          {message.text}
        </div>
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[11px] text-mist-400 font-mono">
            {formatTime(message.createdAt)}
          </span>
          {isOwn &&
            (isRead ? (
              <CheckCheck size={13} className="text-coral-400" />
            ) : (
              <Check size={13} className="text-mist-400" />
            ))}
        </div>
      </div>
    </div>
  );
}
