export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// Stable, pleasant-looking color picked from a small palette based on name hash.
const AVATAR_HUES = [
  "bg-coral-500",
  "bg-leaf-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-pink-500",
];

export function avatarColor(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % AVATAR_HUES.length;
  return AVATAR_HUES[idx];
}

export function formatTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDayLabel(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

export function formatListTimestamp(date) {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (sameDay) return formatTime(date);
  const diffDays = Math.floor((today - d) / 86400000);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function otherParticipant(conversation, selfId) {
  if (!conversation || conversation.isGroup) return null;
  return conversation.participants?.find((p) => p._id !== selfId) || null;
}

export function conversationTitle(conversation, selfId) {
  if (!conversation) return "";
  if (conversation.isGroup) return conversation.groupName || "Group chat";
  const other = otherParticipant(conversation, selfId);
  return other?.name || "Unknown user";
}

export function lastMessagePreview(conversation) {
  const msg = conversation?.lastMessage;
  if (!msg) return "No messages yet";
  return msg.text?.length > 42 ? msg.text.slice(0, 42) + "…" : msg.text || "";
}
