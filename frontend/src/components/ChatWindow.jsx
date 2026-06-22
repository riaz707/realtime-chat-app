import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Users as UsersIcon, Loader2 } from "lucide-react";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { getMessages } from "../api/messages";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import {
  conversationTitle,
  otherParticipant,
  formatDayLabel,
} from "../utils/format";

export default function ChatWindow({ conversation, onBack }) {
  const { user } = useAuth();
  const {
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markRead,
    onNewMessage,
    onMessageRead,
    onlineUserIds,
    typingByConversation,
  } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const listRef = useRef(null);

  const title = conversationTitle(conversation, user._id);
  const other = otherParticipant(conversation, user._id);
  const isOnline = !conversation.isGroup && onlineUserIds?.has(other?._id);
  const typingUserIds = [...(typingByConversation?.[conversation._id] || [])].filter(
    (id) => id !== user._id
  );

  const scrollToBottom = useCallback((behavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  // Load history + join the socket room whenever the conversation changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessages([]);

    getMessages(conversation._id)
      .then((data) => {
        if (!cancelled) {
          setMessages(data);
          setTimeout(() => scrollToBottom("auto"), 0);
        }
      })
      .finally(() => !cancelled && setLoading(false));

    joinConversation(conversation._id);

    return () => {
      cancelled = true;
      leaveConversation(conversation._id);
    };
  }, [conversation._id, joinConversation, leaveConversation, scrollToBottom]);

  // Listen for live messages in any room we've joined.
  useEffect(() => {
    const off = onNewMessage((msg) => {
      if (msg.conversation !== conversation._id) return;
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => scrollToBottom("smooth"), 0);
      if (msg.sender?._id !== user._id) {
        markRead(conversation._id, msg._id);
      }
    });
    return off;
  }, [conversation._id, onNewMessage, scrollToBottom, markRead, user._id]);

  // Live read-receipt updates for messages we sent.
  useEffect(() => {
    const off = onMessageRead(({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId && !m.readBy?.includes(userId)
            ? { ...m, readBy: [...(m.readBy || []), userId] }
            : m
        )
      );
    });
    return off;
  }, [onMessageRead]);

  // Mark the latest incoming message as read once history loads.
  useEffect(() => {
    if (loading || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.sender?._id !== user._id && !last.readBy?.includes(user._id)) {
      markRead(conversation._id, last._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, conversation._id]);

  const handleSend = async (text) => {
    try {
      await sendMessage(conversation._id, text);
      // message:new will append it for us (sender is in the room too)
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  const dayDividers = messages.map((m, i) => {
    const label = formatDayLabel(m.createdAt);
    const prevLabel = i > 0 ? formatDayLabel(messages[i - 1].createdAt) : null;
    return label !== prevLabel;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-ink-900 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-700 bg-ink-800/60 backdrop-blur">
        <button
          onClick={onBack}
          className="sm:hidden text-mist-300 hover:text-mist-100"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar
          name={title}
          src={conversation.isGroup ? conversation.groupAvatar : other?.avatar}
          online={conversation.isGroup ? undefined : isOnline}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-mist-100 truncate">{title}</p>
          <p className="text-xs text-mist-400 truncate flex items-center gap-1">
            {conversation.isGroup ? (
              <>
                <UsersIcon size={11} /> {conversation.participants?.length || 0} members
              </>
            ) : isOnline ? (
              "Online"
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 scrollbar-thin">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-mist-400" size={22} />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-mist-400">Say hello 👋 — no messages yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => {
              const dayLabel = formatDayLabel(m.createdAt);
              const showDivider = dayDividers[i];

              const isOwn = m.sender?._id === user._id;
              const prevSameSender = i > 0 && messages[i - 1].sender?._id === m.sender?._id;
              const isReadByOther = conversation.isGroup
                ? m.readBy?.some((id) => id !== user._id)
                : m.readBy?.includes(other?._id);

              return (
                <div key={m._id}>
                  {showDivider && (
                    <div className="flex items-center justify-center my-3">
                      <span className="text-[11px] text-mist-400 bg-ink-800 px-3 py-1 rounded-full">
                        {dayLabel}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={m}
                    isOwn={isOwn}
                    isGroup={conversation.isGroup}
                    showSender={!prevSameSender}
                    isRead={isReadByOther}
                  />
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Typing indicator */}
      {typingUserIds.length > 0 && (
        <TypingIndicator
          label={
            conversation.isGroup
              ? `${typingUserIds.length === 1 ? "Someone is" : "A few people are"} typing…`
              : `${title} is typing…`
          }
        />
      )}

      <MessageInput
        onSend={handleSend}
        onTypingStart={() => startTyping(conversation._id)}
        onTypingStop={() => stopTyping(conversation._id)}
      />
    </div>
  );
}
