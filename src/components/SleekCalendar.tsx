"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Timer } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { useTaskStore } from '@/store/useTaskStore';

interface Props {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function SleekCalendar({ isExpanded, onToggleExpand }: Props) {
  const selectedDateStr = useTaskStore(state => state.selectedDate);
  const setSelectedDateStr = useTaskStore(state => state.setSelectedDate);
  const tasks = useTaskStore(state => state.tasks);
  const showTimer = useTaskStore(state => state.showTimer);
  const setShowTimer = useTaskStore(state => state.setShowTimer);
  
  const [currentMonth, setCurrentMonth] = useState(() => new Date(selectedDateStr));
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className={`glass-panel flex flex-col rounded-xl p-4 shadow-2xl shadow-black/50 transition-all ${isExpanded ? 'flex-1 min-h-0' : 'shrink-0'}`}>
       {/* Header */}
       <div className="mb-4 flex items-center justify-between gap-3">
         <div className="flex min-w-0 flex-wrap items-center gap-2">
           <span className={`truncate font-semibold text-white ${isExpanded ? 'text-2xl' : ''}`}>{format(currentMonth, "MMMM yyyy")}</span>
           <button 
             onClick={() => {
               const today = new Date();
               setCurrentMonth(today);
               setSelectedDateStr(format(today, "yyyy-MM-dd"));
             }} 
             className="rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20"
           >
             Today
           </button>
           <button 
             onClick={() => setShowTimer(!showTimer)} 
             title={showTimer ? 'Hide focus timer' : 'Show focus timer'}
             className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
               showTimer ? 'bg-emerald-300/15 text-emerald-100' : 'bg-white/10 text-white hover:bg-white/20'
             }`}
           >
             <Timer size={12}/> Focus
           </button>
         </div>
         <div className="flex shrink-0 items-center gap-1">
           <button type="button" title="Previous month" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-md p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"><ChevronLeft size={16}/></button>
           <button type="button" title="Next month" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-md p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"><ChevronRight size={16}/></button>
           <button type="button" title={isExpanded ? 'Collapse calendar' : 'Expand calendar'} onClick={onToggleExpand} className="ml-1 rounded-md p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white">
             {isExpanded ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
           </button>
         </div>
       </div>
       {/* Days of week */}
       <div className={`mb-2 grid grid-cols-7 gap-1 text-center uppercase tracking-widest text-gray-500 ${isExpanded ? 'text-xs' : 'text-[10px]'}`}>
         {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
       </div>
       {/* Grid */}
       <div className={`grid flex-1 grid-cols-7 gap-1 ${isExpanded ? 'auto-rows-fr' : ''}`}>
         {days.map((day, i) => {
           const dayStr = format(day, "yyyy-MM-dd");
           const isSelected = dayStr === selectedDateStr;
           const dayTasks = tasks.filter(task => task.date === dayStr);
           const completed = dayTasks.filter(task => task.status === 'completed').length;
           return (
             <div 
               key={i} 
               onClick={() => setSelectedDateStr(dayStr)}
               onDoubleClick={() => {
                 setSelectedDateStr(dayStr);
                 if (isExpanded) onToggleExpand();
               }}
               className={`relative flex cursor-pointer rounded-md transition-all ${
                 isExpanded ? 'min-h-20 flex-col items-start justify-between border border-white/5 p-2 text-sm' : 'aspect-square items-center justify-center p-1 text-xs'
               } ${
                 !isSameMonth(day, monthStart) ? 'text-gray-700' :
                 isSelected ? 'bg-white text-black font-bold' : 'text-gray-300 hover:bg-white/10'
               } ${isToday(day) && !isSelected ? 'ring-1 ring-emerald-300/40' : ''}`}
             >
               <span className={isExpanded ? 'self-end' : ''}>{format(day, "d")}</span>
               {dayTasks.length > 0 && (
                 <div className={`${isExpanded ? 'flex w-full items-center gap-1' : 'absolute bottom-1 flex gap-0.5'}`}>
                   <span className={`rounded-full ${isSelected ? 'bg-black/70' : 'bg-emerald-300'} ${isExpanded ? 'h-1.5 flex-1' : 'size-1'}`} />
                   {dayTasks.length - completed > 0 && (
                     <span className={`rounded-full ${isSelected ? 'bg-black/45' : 'bg-amber-300'} ${isExpanded ? 'h-1.5 flex-1' : 'size-1'}`} />
                   )}
                   {isExpanded && (
                     <span className={`ml-auto text-[10px] ${isSelected ? 'text-black/70' : 'text-gray-500'}`}>
                       {completed}/{dayTasks.length}
                     </span>
                   )}
                 </div>
               )}
             </div>
           );
         })}
       </div>
    </div>
  );
}
