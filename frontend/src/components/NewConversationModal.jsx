import { useEffect, useState } from "react";
import { X, Search, Users, UserPlus, Loader2 } from "lucide-react";
import Avatar from "./Avatar";
import { listUsers } from "../api/auth";
import { accessPrivateChat, createGroupChat } from "../api/conversations";
import { useSocket } from "../context/SocketContext";

export default function NewConversationModal({ onClose, onCreated }) {
  const { onlineUserIds } = useSocket();
  const [tab, setTab] = useState("direct"); // 'direct' | 'group'
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [groupName, setGroupName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoadingUsers(true);
      listUsers(search)
        .then(setUsers)
        .catch(() => setError("Could not load users"))
        .finally(() => setLoadingUsers(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [search]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleStartDirect = async (userId) => {
    setBusy(true);
    setError("");
    try {
      const convo = await accessPrivateChat(userId);
      onCreated(convo);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not start chat");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedIds.size < 2) return;
    setBusy(true);
    setError("");
    try {
      const convo = await createGroupChat(groupName.trim(), [...selectedIds]);
      onCreated(convo);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not create group");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-ink-800 rounded-2xl shadow-soft border border-ink-700 overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="font-display text-lg font-semibold">New conversation</h2>
          <button
            onClick={onClose}
            className="text-mist-400 hover:text-mist-100 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 mt-4">
          <button
            onClick={() => setTab("direct")}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg transition-colors ${
              tab === "direct" ? "bg-coral-500 text-white" : "bg-ink-700 text-mist-400 hover:text-mist-100"
            }`}
          >
            <UserPlus size={15} /> Direct
          </button>
          <button
            onClick={() => setTab("group")}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg transition-colors ${
              tab === "group" ? "bg-coral-500 text-white" : "bg-ink-700 text-mist-400 hover:text-mist-100"
            }`}
          >
            <Users size={15} /> Group
          </button>
        </div>

        {tab === "group" && (
          <div className="px-5 mt-4">
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full bg-ink-700 rounded-lg px-3 py-2 text-sm placeholder-mist-400 focus:outline-none focus:ring-2 focus:ring-coral-500/60"
            />
          </div>
        )}

        {/* Search */}
        <div className="px-5 mt-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people by name or email…"
              className="w-full bg-ink-700 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-mist-400 focus:outline-none focus:ring-2 focus:ring-coral-500/60"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-400 px-5 mt-2">{error}</p>}

        {/* User list */}
        <div className="px-3 mt-3 max-h-72 overflow-y-auto scrollbar-thin">
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-mist-400" size={20} />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-mist-400 text-center py-8">No people found.</p>
          ) : (
            users.map((u) => {
              const selected = selectedIds.has(u._id);
              return (
                <button
                  key={u._id}
                  disabled={busy}
                  onClick={() => (tab === "direct" ? handleStartDirect(u._id) : toggleSelect(u._id))}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-ink-700 transition-colors text-left disabled:opacity-50"
                >
                  <Avatar
                    name={u.name}
                    src={u.avatar}
                    size="sm"
                    online={onlineUserIds?.has(u._id) ?? u.isOnline}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-mist-100 truncate">{u.name}</p>
                    <p className="text-xs text-mist-400 truncate">{u.email}</p>
                  </div>
                  {tab === "group" && (
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] ${
                        selected
                          ? "bg-coral-500 border-coral-500 text-white"
                          : "border-ink-500 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-5">
          {tab === "group" ? (
            <button
              onClick={handleCreateGroup}
              disabled={busy || !groupName.trim() || selectedIds.size < 2}
              className="w-full bg-coral-500 hover:bg-coral-600 disabled:bg-ink-600 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              {busy ? "Creating…" : `Create group ${selectedIds.size ? `(${selectedIds.size})` : ""}`}
            </button>
          ) : (
            <p className="text-xs text-mist-400 text-center">
              Tap someone to start chatting.
            </p>
          )}
          {tab === "group" && selectedIds.size > 0 && selectedIds.size < 2 && (
            <p className="text-xs text-mist-400 text-center mt-2">Pick at least 2 people.</p>
          )}
        </div>
      </div>
    </div>
  );
}
