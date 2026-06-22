import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import EmptyState from "../components/EmptyState";
import NewConversationModal from "../components/NewConversationModal";
import { getMyConversations } from "../api/conversations";
import { useSocket } from "../context/SocketContext";

export default function ChatPage() {
  const { onNewMessage, onlineUserIds } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  useEffect(() => {
    getMyConversations()
      .then(setConversations)
      .finally(() => setLoading(false));
  }, []);

  // Keep the sidebar's last-message preview + ordering fresh for every
  // incoming message, even in conversations that aren't currently open.
  useEffect(() => {
    const off = onNewMessage((msg) => {
      setConversations((prev) => {
        const next = prev.map((c) =>
          c._id === msg.conversation ? { ...c, lastMessage: msg } : c
        );
        next.sort((a, b) => {
          const at = new Date(a.lastMessage?.createdAt || a.updatedAt).getTime();
          const bt = new Date(b.lastMessage?.createdAt || b.updatedAt).getTime();
          return bt - at;
        });
        return next;
      });
    });
    return off;
  }, [onNewMessage]);

  const activeConversation = conversations.find((c) => c._id === activeId) || null;

  const handleSelect = (conversation) => {
    setActiveId(conversation._id);
    setShowChatOnMobile(true);
  };

  const handleCreated = useCallback((conversation) => {
    setConversations((prev) => {
      const exists = prev.some((c) => c._id === conversation._id);
      return exists ? prev : [conversation, ...prev];
    });
    setActiveId(conversation._id);
    setShowChatOnMobile(true);
    setShowNewModal(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-ink-900">
        <Loader2 className="animate-spin text-mist-400" size={24} />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-ink-900">
      <div className={`${showChatOnMobile ? "hidden" : "flex"} sm:flex h-full`}>
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNewConversation={() => setShowNewModal(true)}
          onlineUserIds={onlineUserIds}
        />
      </div>

      <div className={`${showChatOnMobile ? "flex" : "hidden"} sm:flex flex-1 min-w-0 h-full`}>
        {activeConversation ? (
          <ChatWindow
            key={activeConversation._id}
            conversation={activeConversation}
            onBack={() => setShowChatOnMobile(false)}
          />
        ) : (
          <EmptyState
            title="Pick a conversation"
            subtitle="Select someone from the list, or start a new chat to begin messaging in real time."
          />
        )}
      </div>

      {showNewModal && (
        <NewConversationModal onClose={() => setShowNewModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
