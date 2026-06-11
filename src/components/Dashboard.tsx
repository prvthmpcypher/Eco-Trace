import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, Car, Utensils, Zap, ShoppingBag, Trash2, 
  TreePine, Trophy, Sparkles, CheckCircle 
} from "lucide-react";
import { ActivityLog, Challenge } from "../types";

interface DashboardProps {
  logs: ActivityLog[];
  onSwipeLog: () => void;
  onNavigateAdd: (category?: string) => void;
  activeChallenges: Challenge[];
  coachAdvice: string;
  onRefreshCoach: () => void;
  loadingCoach: boolean;
  dailyTarget?: number;
}

export default function Dashboard({
  logs,
  onSwipeLog,
  onNavigateAdd,
  activeChallenges,
  coachAdvice,
  onRefreshCoach,
  loadingCoach,
  dailyTarget
}: DashboardProps) {
  // Compute carbon saved and today's value
  // Let's assume a starting standard raw daily allowance limit is 6.0 kg CO2.
  // Swiping or adding sustainable activities subtracts (saves) from that baseline footprint, showing the Net footprint!
  const targetDaily = dailyTarget || 6.0;
  const totalSavedToday = logs.reduce((sum, log) => sum + log.co2Saved, 0);
  const netFootprint = Math.max(0, parseFloat((targetDaily - totalSavedToday).toFixed(1)));
  
  // Is the user under green limit (6.0 kg)?
  const inTheGreen = netFootprint <= targetDaily;

  // Swipe interaction state
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const pageX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(pageX);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    const pageX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const delta = pageX - startX;
    const maxDrag = 180; // track limit
    const progress = Math.min(100, Math.max(0, (delta / maxDrag) * 100));
    if (!isSwiped) {
      setSwipeProgress(progress);
      if (progress >= 95) {
        setIsSwiped(true);
        setSwipeProgress(100);
        onSwipeLog();
        setTimeout(() => {
          setIsSwiped(false);
          setSwipeProgress(0);
        }, 1800);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiped) {
      setSwipeProgress(0);
    }
  };

  // SVG circle calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // Calculate stroke-dashoffset proportional to score progress (netFootprint / targetDaily)
  const scoreRatio = Math.min(1, netFootprint / targetDaily);
  const strokeDashoffset = circumference * (1 - scoreRatio);

  return (
    <div className="space-y-6 pb-24">
      {/* Carbon Dial Dial Section */}
      <section className="px-1" id="carbon-dial">
        <div className="bg-[#d8f5e1] border border-[#C5DDD2] rounded-3xl p-6 relative overflow-hidden shadow-sm">
          {/* Decorative Background Glow */}
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#92f7c3]/40 organic-shape blur-2xl"></div>
          
          <div className="flex flex-col items-center justify-center py-4 relative z-10">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* SVG circular track */}
              <svg className="w-full h-full transform -rotate-90 scale-x-[-1]" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#cde9d6"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#006c48"
                  strokeLinecap="round"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              
              <div className="absolute flex flex-col items-center text-center">
                <span className="font-mono text-5xl font-semibold tracking-tight text-[#012d1d]">
                  {netFootprint}
                </span>
                <span className="text-[10px] font-bold text-[#414844] uppercase tracking-widest mt-1">
                  kg CO2 today
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[#072014] text-sm">
                Target: <span className="font-bold text-[#006c48]">{targetDaily.toFixed(1)} kg</span> Daily
              </p>
              
              <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#92f7c3] rounded-full text-[#00734d]">
                <TreePine className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest">
                  {inTheGreen ? "You're in the green" : "Eco-limit Exceeded"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Coach Card */}
      <section className="px-1" id="ai-coach">
        <div className="bg-[#defbe7] border border-[#C5DDD2] rounded-3xl p-5 flex gap-4 items-start shadow-sm transition-transform active:scale-[0.98]">
          <div className="w-12 h-12 rounded-full bg-[#92f7c3] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-[#00734d]" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold text-[#414844] uppercase tracking-wider">
                AI EcoCoach
              </span>
              <button 
                onClick={onRefreshCoach}
                disabled={loadingCoach}
                className="text-xs text-[#006c48] font-bold hover:underline disabled:opacity-50"
              >
                {loadingCoach ? "Refreshed..." : "Ask Coach"}
              </button>
            </div>
            {loadingCoach ? (
              <div className="flex items-center gap-2 text-sm text-[#006c48] py-1">
                <span className="animate-pulse">Thinking...</span>
              </div>
            ) : (
              <p className="text-[#072014] text-sm leading-relaxed font-sans">
                {coachAdvice}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Quick Log Row */}
      <section id="quick-log">
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-bold text-lg text-[#012d1d]">Quick Log</h3>
          <button 
            onClick={() => onNavigateAdd()}
            className="text-[10px] font-bold text-[#006c48] uppercase tracking-wider hover:underline"
          >
            See All
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x">
          <div 
            onClick={() => onNavigateAdd("Transport")}
            className="snap-center flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <button className="w-16 h-16 rounded-2xl bg-[#EEF6F0] border border-[#C5DDD2] flex items-center justify-center shadow-sm active:scale-90 transition-transform group-hover:bg-[#92f7c3]">
              <Car className="w-7 h-7 text-[#012d1d]" />
            </button>
            <span className="text-[10px] font-bold text-[#414844] uppercase tracking-wide">Transport</span>
          </div>

          <div 
            onClick={() => onNavigateAdd("Food")}
            className="snap-center flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <button className="w-16 h-16 rounded-2xl bg-[#EEF6F0] border border-[#C5DDD2] flex items-center justify-center shadow-sm active:scale-90 transition-transform group-hover:bg-[#92f7c3]">
              <Utensils className="w-7 h-7 text-[#012d1d]" />
            </button>
            <span className="text-[10px] font-bold text-[#414844] uppercase tracking-wide">Food</span>
          </div>

          <div 
            onClick={() => onNavigateAdd("Energy")}
            className="snap-center flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <button className="w-16 h-16 rounded-2xl bg-[#EEF6F0] border border-[#C5DDD2] flex items-center justify-center shadow-sm active:scale-90 transition-transform group-hover:bg-[#92f7c3]">
              <Zap className="w-7 h-7 text-[#012d1d]" />
            </button>
            <span className="text-[10px] font-bold text-[#414844] uppercase tracking-wide">Energy</span>
          </div>

          <div 
            onClick={() => onNavigateAdd("Shopping")}
            className="snap-center flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <button className="w-16 h-16 rounded-2xl bg-[#EEF6F0] border border-[#C5DDD2] flex items-center justify-center shadow-sm active:scale-90 transition-transform group-hover:bg-[#92f7c3]">
              <ShoppingBag className="w-7 h-7 text-[#012d1d]" />
            </button>
            <span className="text-[10px] font-bold text-[#414844] uppercase tracking-wide">Shopping</span>
          </div>

          <div 
            onClick={() => onNavigateAdd("Waste")}
            className="snap-center flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <button className="w-16 h-16 rounded-2xl bg-[#EEF6F0] border border-[#C5DDD2] flex items-center justify-center shadow-sm active:scale-90 transition-transform group-hover:bg-[#92f7c3]">
              <Trash2 className="w-7 h-7 text-[#012d1d]" />
            </button>
            <span className="text-[10px] font-bold text-[#414844] uppercase tracking-wide">Waste</span>
          </div>
        </div>
      </section>

      {/* Community Challenge */}
      <section className="px-1" id="challenge-card">
        {activeChallenges.slice(0, 1).map(c => (
          <div key={c.id} className="bg-[#1b4332] text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
            {/* Decorative organic background */}
            <div className="absolute right-[-10%] top-[-20%] w-32 h-32 bg-[#006c48] opacity-35 organic-shape blur-xl"></div>
            
            <div className="flex justify-between items-start mb-5 relative z-10">
              <div>
                <h4 className="font-bold text-lg leading-tight">{c.title}</h4>
                <p className="text-xs text-[#86af99] mt-0.5">Community Challenge</p>
              </div>
              <Trophy className="w-6 h-6 text-[#92f7c3]" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-[#86af99]">
                <span>Progress</span>
                <span>{c.progressPercent}% Complete</span>
              </div>
              <div className="w-full bg-[#012d1d]/60 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#92f7c3] h-full rounded-full transition-all duration-1000"
                  style={{ width: `${c.progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-5 flex items-center -space-x-1.5 relative z-10">
              {c.friendsJoined.map((f, idx) => (
                <img 
                  key={idx}
                  className="w-8 h-8 rounded-full border-2 border-[#1b4332] object-cover" 
                  alt={f.name}
                  src={f.avatarUrl}
                />
              ))}
              <div className="w-8 h-8 rounded-full bg-[#92f7c3] text-[#002113] text-[10px] font-bold flex items-center justify-center border-2 border-[#1b4332]">
                +12
              </div>
              <span className="ml-3 text-xs text-[#92f7c3] font-semibold">
                Friends joined
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Swipe-to-Log component */}
      <section className="px-1 py-4" id="swipe-to-log">
        <div className="relative h-16 bg-[#d8f5e1] border border-[#c5ddd2] rounded-full flex items-center p-1.5 overflow-hidden group select-none">
          {/* Fill Track */}
          <div 
            className="absolute left-0 top-0 h-full bg-[#006c48]/25 transition-all duration-100" 
            style={{ width: `${swipeProgress}%` }}
          ></div>

          {/* Sliding button */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            style={{ transform: `translateX(${swipeProgress * 1.8}px)` }}
            className={`w-13 h-13 ${isSwiped ? 'bg-[#006c48]' : 'bg-[#012d1d]'} rounded-full flex items-center justify-center cursor-pointer z-10 shadow-md active:scale-95 transition-colors duration-200`}
          >
            <TreePine className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 text-center pr-10 pointer-events-none select-none z-10">
            <span className="text-[10px] font-extrabold text-[#414844] uppercase tracking-widest opacity-70">
              {isSwiped ? "Action Logged! " : "Swipe to log daily walk"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
