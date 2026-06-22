import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-ink-900">
        <Loader2 className="animate-spin text-mist-400" size={24} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
