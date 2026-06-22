export default function TypingIndicator({ label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1 animate-fade-in-up">
      <div className="flex items-center gap-1 bg-ink-700 rounded-full px-3 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-mist-400 animate-pulse-dot [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-mist-400 animate-pulse-dot [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-mist-400 animate-pulse-dot [animation-delay:300ms]" />
      </div>
      {label && <span className="text-xs text-mist-400">{label}</span>}
    </div>
  );
}
