import { useMemo, useState } from "react";
import { Plus, LogOut, Search } from "lucide-react";
import Avatar from "./Avatar";
import ConversationItem from "./ConversationItem";
import { conversationTitle } from "../utils/format";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  onlineUserIds,
}) {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) =>
      conversationTitle(c, user._id).toLowerCase().includes(q)
    );
  }, [conversations, search, user._id]);

  return (
    <aside className="w-full sm:w-[340px] shrink-0 h-full flex flex-col bg-ink-900 border-r border-ink-700">
      {/* Brand + profile */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center font-display font-bold text-white text-sm">
            R
          </div>
          <span className="font-display font-semibold text-mist-100">TalkSpace</span>
        </div>
        <button
          onClick={onNewConversation}
          aria-label="New conversation"
          className="w-9 h-9 rounded-full bg-ink-700 hover:bg-ink-600 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-400"
        >
          <Plus size={18} className="text-mist-100" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full bg-ink-800 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-mist-400 focus:outline-none focus:ring-2 focus:ring-coral-500/60"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-thin">
        {filtered.length === 0 ? (
          <p className="text-sm text-mist-400 text-center mt-10 px-4">
            {conversations.length === 0
              ? "No conversations yet — tap + to start one."
              : "No matches."}
          </p>
        ) : (
          <div className="flex flex-col gap-1 pb-2">
            {filtered.map((c) => (
              <ConversationItem
                key={c._id}
                conversation={c}
                selfId={user._id}
                active={c._id === activeId}
                onlineUserIds={onlineUserIds}
                onClick={() => onSelect(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile footer */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-ink-700">
        <Avatar name={user.name} src={user.avatar} size="sm" online />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-mist-100 truncate">{user.name}</p>
          <p className="text-xs text-mist-400 truncate">{user.email}</p>
        </div>
        <button
          onClick={logout}
          aria-label="Log out"
          className="text-mist-400 hover:text-coral-400 transition-colors"
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
