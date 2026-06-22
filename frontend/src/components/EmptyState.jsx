import { MessageCircle } from "lucide-react";

export default function EmptyState({ title, subtitle, icon }) {
  const Icon = icon || MessageCircle;
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-ink-700 flex items-center justify-center">
        <Icon size={28} className="text-coral-400" />
      </div>
      <h2 className="font-display text-lg font-semibold text-mist-100">{title}</h2>
      {subtitle && <p className="text-sm text-mist-400 max-w-xs">{subtitle}</p>}
    </div>
  );
}
