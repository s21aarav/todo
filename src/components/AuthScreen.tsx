"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Lock, User, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    if (isSignUp) {
      if (!username.trim()) {
        setError('Username is required for sign up.');
        setIsLoading(false);
        return;
      }
      
      const { data: identityData, error: identityError } = await supabase
        .from('identities')
        .select('id')
        .eq('identity_data->>email', email)
        .single();
        
      if (identityData) {
        setError("This email is already registered. Please sign in instead.");
        setIsLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccessMsg('Account created successfully! You are now signed in.');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) setError(signInError.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <div className="glass-card-strong w-full max-w-md p-8 animate-fade-in relative z-10 overflow-hidden">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles size={32} />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white tracking-tight">ToDoYourDo</h1>
          <p className="text-neutral-400">Your premium productivity workspace</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 animate-fade-in">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400 animate-fade-in">
            <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">{successMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-black/40 py-3.5 pl-11 pr-4 text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:bg-black/60 focus:outline-none transition-colors"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-black/40 py-3.5 pl-11 pr-4 text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:bg-black/60 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-black/40 py-3.5 pl-11 pr-4 text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:bg-black/60 focus:outline-none transition-colors"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full min-h-[48px] items-center justify-center rounded-xl bg-emerald-500 py-3.5 font-semibold text-black hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 transition-all duration-200"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccessMsg(null); }}
            className="min-h-[44px] px-4 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
