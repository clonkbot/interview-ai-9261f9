import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Could not continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="grain-overlay" />

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md fade-in-up">
          {/* Logo / Brand */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="ai-avatar" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
              Interview<span className="text-cyan">AI</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Practice interviews with live AI feedback
            </p>
          </div>

          {/* Auth Card */}
          <div className="card p-6 md:p-8">
            <h2 className="font-serif text-xl md:text-2xl text-charcoal mb-6">
              {flow === "signIn" ? "Welcome back" : "Create account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="input-field w-full px-4 py-3 rounded-lg text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field w-full px-4 py-3 rounded-lg text-charcoal"
                />
              </div>

              <input type="hidden" name="flow" value={flow} />

              {error && (
                <p className="text-coral text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  flow === "signIn" ? "Sign In" : "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleAnonymous}
                disabled={isLoading}
                className="btn-secondary w-full py-3 rounded-lg font-medium mb-4"
              >
                Continue as Guest
              </button>

              <p className="text-center text-sm text-gray-500">
                {flow === "signIn" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      onClick={() => setFlow("signUp")}
                      className="text-cyan hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => setFlow("signIn")}
                      className="text-cyan hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="footer-text">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
