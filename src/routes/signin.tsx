import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithEmail } from "@/lib/auth-client";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setIsLoading(true);

    try {
      const result = await signInWithEmail(email, password);
      console.log("[FlipDash SignIn] Result:", JSON.stringify(result, null, 2));

      if (result.success) {
        navigate({ to: "/inventory" });
      } else {
        console.error("[FlipDash SignIn] Failed:", result.error);
        setError(result.error?.message ?? "An error occurred");
        setErrorCode(result.error?.code ?? null);
      }
    } catch (err) {
      console.error("[FlipDash SignIn] Exception:", err);
      setError("Connection failed. Please check your network and try again.");
      setErrorCode("NETWORK_ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3dd45c] to-[#00c9a7] flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            F
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your FlipDash account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <p>{error}</p>
              {errorCode && (
                <p className="text-red-500/60 text-xs mt-1 font-mono">Code: {errorCode}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); setErrorCode(null); }}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-[#131a2b] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3dd45c]/50 focus:border-[#3dd45c]/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); setErrorCode(null); }}
              required
              minLength={8}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl bg-[#131a2b] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3dd45c]/50 focus:border-[#3dd45c]/50 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-[#3dd45c] font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/signin")({
  component: SignInPage,
});
