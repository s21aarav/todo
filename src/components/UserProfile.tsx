"use client";

import { useState, useRef, useEffect } from 'react';
import { LogOut, Trash2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabaseClient';

export default function UserProfile({ isDesktop = false }: { isDesktop?: boolean }) {
  const { session, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const username = session?.user?.user_metadata?.username || 'Astronaut';
  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) {
      await supabase.rpc('delete_user');
      signOut();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border border-white/10 bg-black/40 p-1.5 pr-3 text-sm font-medium text-white transition-colors hover:bg-white/10 ${isDesktop ? 'shadow-xl shadow-black/50 backdrop-blur-md' : ''}`}
      >
        <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
          {initial}
        </div>
        <span className="max-w-[120px] truncate">{username}</span>
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 flex w-56 flex-col gap-1 rounded-xl border border-white/10 bg-neutral-900 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
            isDesktop ? 'bottom-full right-0 mb-2 origin-bottom-right' : 'top-full right-0 mt-2 origin-top-right'
          }`}
        >
          <div className="px-2 py-2 mb-1 border-b border-white/5">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Signed in as</p>
            <p className="truncate text-sm font-medium text-white mt-0.5">{session?.user?.email}</p>
          </div>
          
          <button 
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} />
            Sign out
          </button>
          
          <button 
            onClick={handleDelete}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-red-400/80 transition-colors hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 size={16} />
            Delete account
          </button>
        </div>
      )}
    </div>
  );
}
