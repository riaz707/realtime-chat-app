import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthBrandPanel from "../components/AuthBrandPanel";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Could not log in. Check your details.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-ink-900">
      <AuthBrandPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center">
              <MessageCircle size={18} className="text-white" />
            </div>
            <span className="font-display font-semibold text-lg">Riaz Chat</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-mist-100">Welcome back</h2>
          <p className="text-sm text-mist-400 mt-1.5">Log in to keep the conversation going.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-mist-400">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                className="mt-1.5 w-full bg-ink-800 border border-ink-600 rounded-xl px-3.5 py-2.5 text-sm placeholder-mist-400 focus:outline-none focus:ring-2 focus:ring-coral-500/60 focus:border-coral-500/60"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-mist-400">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={update("password")}
                placeholder="••••••••"
                className="mt-1.5 w-full bg-ink-800 border border-ink-600 rounded-xl px-3.5 py-2.5 text-sm placeholder-mist-400 focus:outline-none focus:ring-2 focus:ring-coral-500/60 focus:border-coral-500/60"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-coral-500 hover:bg-coral-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="text-sm text-mist-400 mt-6 text-center">
            New here?{" "}
            <Link to="/register" className="text-coral-400 hover:text-coral-300 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
