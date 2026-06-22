import { MessageCircle, Zap, Users, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: Zap, text: "Real-time delivery powered by Socket.io" },
  { icon: Users, text: "1-to-1 chats and group conversations" },
  { icon: ShieldCheck, text: "JWT-secured accounts, every request" },
];

export default function AuthBrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-1/2 p-12 overflow-hidden bg-ink-950">
      {/* Ambient gradient mesh */}
      <div className="pointer-events-none absolute -top-32 -left-20 w-[28rem] h-[28rem] rounded-full bg-coral-600/30 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[-6rem] right-[-4rem] w-[24rem] h-[24rem] rounded-full bg-leaf-500/15 blur-[110px]" />

      <div className="relative z-10 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center">
          <MessageCircle size={18} className="text-white" />
        </div>
        <span className="font-display font-semibold text-lg">Riaz Chat</span>
      </div>

      <div className="relative z-10 max-w-md">
        <h1 className="font-display text-4xl font-bold leading-tight text-mist-100">
          Conversations that
          <br />
          <span className="text-coral-400">arrive instantly.</span>
        </h1>
        <p className="mt-4 text-mist-400 text-sm leading-relaxed">
          A MERN-stack messaging app — built to demonstrate real-time delivery,
          persistent history, and clean REST + Socket.io architecture end to end.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-mist-200">
              <span className="w-7 h-7 rounded-lg bg-ink-800 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-coral-400" />
              </span>
              {text}
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 text-xs text-mist-400">
        Built by Riaz Islam · MERN Stack Developer
      </p>
    </div>
  );
}
