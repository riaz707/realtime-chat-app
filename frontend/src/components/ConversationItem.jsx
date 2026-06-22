import Avatar from "./Avatar";
import { conversationTitle, lastMessagePreview, formatListTimestamp, otherParticipant } from "../utils/format";

export default function ConversationItem({ conversation, selfId, active, onlineUserIds, onClick }) {
  const title = conversationTitle(conversation, selfId);
  const other = otherParticipant(conversation, selfId);
  const isOnline = conversation.isGroup ? false : onlineUserIds?.has(other?._id);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
        active ? "bg-ink-700" : "hover:bg-ink-800"
      }`}
    >
      <Avatar
        name={title}
        src={conversation.isGroup ? conversation.groupAvatar : other?.avatar}
        online={conversation.isGroup ? undefined : isOnline}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-mist-100 truncate">{title}</span>
          <span className="text-[11px] text-mist-400 font-mono shrink-0">
            {formatListTimestamp(conversation.lastMessage?.createdAt || conversation.updatedAt)}
          </span>
        </div>
        <p className="text-xs text-mist-400 truncate mt-0.5">
          {lastMessagePreview(conversation)}
        </p>
      </div>
    </button>
  );
}
