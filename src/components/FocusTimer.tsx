"use client";

import { useState, useEffect } from 'react';
import { Play, Square, Timer, RotateCcw } from 'lucide-react';
import { useFocusStore } from '@/store/useFocusStore';

const PRESETS = [
  { label: '15m', value: 15 },
  { label: '25m', value: 25 },
  { label: '50m', value: 50 },
];

export default function FocusTimer() {
  const isFocusMode = useFocusStore((state) => state.isFocusModeActive);
  const setFocusMode = useFocusStore((state) => state.setIsFocusModeActive);

  // We keep timer state local as requested, but remove the full screen overlay
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [duration, setDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setFocusMode(false);
      // Could play a sound here
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, setFocusMode]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    setFocusMode(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setFocusMode(false);
    setTimeLeft(duration);
  };

  const setPreset = (mins: number) => {
    setIsRunning(false);
    setFocusMode(false);
    setDuration(mins * 60);
    setTimeLeft(mins * 60);
  };

  const progress = ((duration - timeLeft) / duration) * 100;
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="glass-card p-5 animate-fade-in relative overflow-hidden group">
      {/* Background progress indicator */}
      {isRunning && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          <Timer size={14} /> Focus Timer
        </h3>
        {!isRunning && (
          <div className="flex gap-1">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setPreset(preset.value)}
                className={`min-h-[32px] rounded-md px-2 text-[10px] font-bold transition-colors ${
                  duration === preset.value * 60
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-neutral-500 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className={`text-4xl font-mono tracking-tight font-bold transition-colors ${
          isRunning ? 'text-white glow-emerald drop-shadow-md' : 'text-neutral-400'
        }`}>
          {minutes}:{seconds}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetTimer}
            className="grid min-h-[44px] min-w-[44px] place-items-center rounded-xl text-neutral-500 hover:bg-white/[0.06] hover:text-white transition-colors"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
          
          <button
            onClick={toggleTimer}
            className={`grid min-h-[44px] min-w-[44px] place-items-center rounded-xl transition-all duration-200 ${
              isRunning 
                ? 'bg-white/[0.1] text-white hover:bg-red-500/20 hover:text-red-400 border border-white/[0.1]' 
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            }`}
          >
            {isRunning ? <Square size={16} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}
