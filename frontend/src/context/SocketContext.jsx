import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState(() => new Set());
  // conversationId -> Set of userIds currently typing
  const [typingByConversation, setTypingByConversation] = useState({});

  useEffect(() => {
    if (!token || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("user:online", ({ userId }) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    });

    socket.on("user:offline", ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on("typing:start", ({ conversationId, userId }) => {
      setTypingByConversation((prev) => {
        const set = new Set(prev[conversationId] || []);
        set.add(userId);
        return { ...prev, [conversationId]: set };
      });
    });

    socket.on("typing:stop", ({ conversationId, userId }) => {
      setTypingByConversation((prev) => {
        const set = new Set(prev[conversationId] || []);
        set.delete(userId);
        return { ...prev, [conversationId]: set };
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?._id]);

  const joinConversation = useCallback((conversationId) => {
    socketRef.current?.emit("conversation:join", conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    socketRef.current?.emit("conversation:leave", conversationId);
  }, []);

  const sendMessage = useCallback((conversationId, text) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) return reject(new Error("Not connected"));
      socketRef.current.emit("message:send", { conversationId, text }, (res) => {
        if (res?.ok) resolve(res.message);
        else reject(new Error(res?.error || "Send failed"));
      });
    });
  }, []);

  const startTyping = useCallback((conversationId) => {
    socketRef.current?.emit("typing:start", conversationId);
  }, []);

  const stopTyping = useCallback((conversationId) => {
    socketRef.current?.emit("typing:stop", conversationId);
  }, []);

  const markRead = useCallback((conversationId, messageId) => {
    socketRef.current?.emit("message:read", { conversationId, messageId });
  }, []);

  const onNewMessage = useCallback((handler) => {
    socketRef.current?.on("message:new", handler);
    return () => socketRef.current?.off("message:new", handler);
  }, []);

  const onMessageRead = useCallback((handler) => {
    socketRef.current?.on("message:read", handler);
    return () => socketRef.current?.off("message:read", handler);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        connected,
        onlineUserIds,
        typingByConversation,
        joinConversation,
        leaveConversation,
        sendMessage,
        startTyping,
        stopTyping,
        markRead,
        onNewMessage,
        onMessageRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
