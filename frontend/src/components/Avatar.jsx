import { initials, avatarColor } from "../utils/format";

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

export default function Avatar({ name = "?", src, size = "md", online, className = "" }) {
  const sizeClasses = SIZES[size] || SIZES.md;

  return (
    <div className={`relative shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses} rounded-full object-cover ring-1 ring-white/5`}
        />
      ) : (
        <div
          className={`${sizeClasses} ${avatarColor(
            name
          )} rounded-full flex items-center justify-center font-display font-semibold text-white ring-1 ring-white/10`}
        >
          {initials(name) || "?"}
        </div>
      )}
      {typeof online === "boolean" && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-ink-900 ${
            online ? "bg-leaf-500" : "bg-ink-500"
          }`}
        />
      )}
    </div>
  );
}
