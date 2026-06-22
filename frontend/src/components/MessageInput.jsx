import { useRef, useState, useCallback } from "react";
import { SendHorizontal } from "lucide-react";

export default function MessageInput({ onSend, onTypingStart, onTypingStop, disabled }) {
  const [text, setText] = useState("");
  const typingTimeout = useRef(null);
  const isTypingRef = useRef(false);

  const handleChange = (e) => {
    setText(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart?.();
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop?.();
    }, 1500);
  };

  const submit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    clearTimeout(typingTimeout.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }
  }, [text, disabled, onSend, onTypingStop]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 px-4 py-3 bg-ink-800 border-t border-ink-700">
      <textarea
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Write a message…"
        disabled={disabled}
        className="flex-1 resize-none bg-ink-700 text-mist-100 placeholder-mist-400 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral-500/60 max-h-32 scrollbar-thin disabled:opacity-50"
        style={{ minHeight: "2.6rem" }}
      />
      <button
        onClick={submit}
        disabled={disabled || !text.trim()}
        aria-label="Send message"
        className="shrink-0 w-10 h-10 rounded-full bg-coral-500 hover:bg-coral-600 disabled:bg-ink-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-800"
      >
        <SendHorizontal size={18} className="text-white" />
      </button>
    </div>
  );
}
