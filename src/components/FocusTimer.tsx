"use client";

import { useState, useEffect } from 'react';
import { Play, Square, Timer, RotateCcw } from 'lucide-react';
import { useFocusStore } from '@/store/useFocusStore';

export default function FocusTimer() {
  const isFocusModeActive = useFocusStore(state => state.isFocusModeActive);
  const setIsFocusModeActive = useFocusStore(state => state.setIsFocusModeActive);
  
  const [duration, setDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min default
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFocusModeActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsFocusModeActive(false);
    }
    return () => clearInterval(interval);
  }, [isFocusModeActive, timeLeft, setIsFocusModeActive]);
  
  const toggleTimer = () => {
    setIsFocusModeActive(!isFocusModeActive);
  };
  
  const resetTimer = () => {
    setTimeLeft(duration);
    setIsFocusModeActive(false);
  };

  const setPreset = (minutes: number) => {
    const seconds = minutes * 60;
    setDuration(seconds);
    setTimeLeft(seconds);
    setIsFocusModeActive(false);
  };
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = Math.max(0, Math.min(100, ((duration - timeLeft) / duration) * 100));

  return (
    <>
      {isFocusModeActive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-1000" />
      )}
      
      <div className={`glass-panel relative z-50 flex flex-col gap-3 rounded-xl p-3 transition-all duration-500 ${
        isFocusModeActive ? 'border-white/20 shadow-2xl bg-white/5' : ''
      }`}>
        <div className="flex items-center justify-between w-full">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            <Timer size={16} className={isFocusModeActive ? 'animate-pulse' : ''} />
            Focus Timer
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`font-mono text-3xl font-bold leading-none ${isFocusModeActive ? 'text-white' : 'text-gray-200'}`}>
            {formatTime(timeLeft)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-3 gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1">
          {[15, 25, 50].map((minutes) => (
            <button
              type="button"
              key={minutes}
              onClick={() => setPreset(minutes)}
              className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
                duration === minutes * 60
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {minutes}m
            </button>
          ))}
        </div>
        
        <div className="flex w-full items-center gap-2">
          <button 
            onClick={toggleTimer}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              isFocusModeActive 
                ? 'border border-white/40 bg-white/20 text-white hover:bg-white/30' 
                : 'border border-emerald-300/20 bg-emerald-300/15 text-emerald-50 hover:bg-emerald-300/20'
            }`}
          >
            {isFocusModeActive ? <><Square size={16} /> Stop</> : <><Play size={16} /> Start</>}
          </button>
          
          <button 
            onClick={resetTimer}
            title="Reset timer"
            className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
