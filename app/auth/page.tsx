"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 border border-brand-gold/30 rounded-lg bg-brand-dark/50 backdrop-blur-sm">
        <h1 className="text-3xl font-serif text-brand-gold mb-6 text-center">
          MISE / en place
        </h1>
        <p className="text-center text-brand-cream/80 mb-8 font-mono text-sm">
          Sign in via magic link
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-mono text-brand-cream/70 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-brand-gold/20 rounded-md px-4 py-2 text-brand-cream focus:outline-none focus:border-brand-gold transition-colors font-mono"
              placeholder="chef@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-gold text-brand-dark font-serif font-bold py-2 px-4 rounded-md hover:bg-brand-gold/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending link..." : "Send Magic Link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-mono text-brand-cream/90">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
