"use client";

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './AuthProvider';
import { UserCircle, LogOut, Trash2 } from 'lucide-react';

interface UserProfileProps {
  isDesktop?: boolean;
}

export default function UserProfile({ isDesktop = false }: UserProfileProps) {
  const { session, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const email = session?.user?.email;
  const username = session?.user?.user_metadata?.username || 'User';
  const initial = username.charAt(0).toUpperCase();

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      setIsDeleting(true);
      try {
        const { error } = await supabase.rpc('delete_user');
        if (error) {
          console.error("Error deleting user account:", error.message);
          alert(`Failed to delete account: ${error.message}`);
        } else {
          await signOut();
        }
      } catch (e) {
        console.error("Unexpected error:", e);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-full bg-white/[0.04] p-1 pr-3 hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
          {initial}
        </div>
        <span className="text-sm font-medium text-white max-w-[100px] truncate hidden sm:block">
          {username}
        </span>
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 w-56 rounded-2xl glass-card-strong p-2 shadow-2xl animate-fade-in
            ${isDesktop ? 'bottom-full right-0 mb-3' : 'top-full right-0 mt-3'}
          `}
        >
          <div className="mb-2 px-3 pb-3 pt-2 border-b border-white/[0.06]">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Signed in as</p>
            <p className="mt-1 truncate text-sm font-medium text-white">{email}</p>
          </div>
          
          <button
            onClick={() => { setIsOpen(false); signOut(); }}
            className="flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral-300 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
          
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors mt-1"
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      )}
    </div>
  );
}
