import React, { useState, useEffect } from "react";
import { 
  Home as HomeIcon, CheckCircle, Lightbulb, Trophy, Users, Plus, 
  Bike, Utensils, Zap, ShoppingBag, Trash2, ArrowLeft, Send,
  RefreshCw, TreePine, Award, Calendar, Flame, ChevronRight, HelpCircle, Sparkles,
  Bell
} from "lucide-react";
import { ActivityLog, Challenge, Goal } from "./types";
import { INITIAL_LOGS, INITIAL_CHALLENGES, INITIAL_LOG_TEMPLATES, INITIAL_GOALS } from "./data";
import Dashboard from "./components/Dashboard";
import AddActivity from "./components/AddActivity";

export default function App() {
  // Navigation: "Home" | "Track" | "Insights" | "Goals" | "Community" | "AddActivityFlow"
  const [activeTab, setActiveTab] = useState<string>("Home");
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState<string | undefined>(undefined);

  // Profile customization state
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    avatarUrl: string;
    dailyTarget: number;
    location: string;
  }>(() => {
    const saved = localStorage.getItem("ecotrace_profile");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      name: "Priya 🌿",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop",
      dailyTarget: 6.0,
      location: "Seattle, WA"
    };
  });

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Core Data State (persisted in localStorage)
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("ecotrace_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_LOGS;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem("ecotrace_challenges");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CHALLENGES;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("ecotrace_goals");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_GOALS;
  });

  // AI EcoCoach state
  const [coachAdvice, setCoachAdvice] = useState<string>("Your diet is your top opportunity — cutting red meat saves ~3.2 kg CO2 per meal.");
  const [loadingCoach, setLoadingCoach] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: "Hello! I am your AI EcoCoach. Ask me anything about reducing your carbon footprint, lifestyle upgrades, or offsetting." }
  ]);
  const [userQuery, setUserQuery] = useState("");

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem("ecotrace_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("ecotrace_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("ecotrace_challenges", JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem("ecotrace_goals", JSON.stringify(goals));
  }, [goals]);

  // Request new AI advice from custom backend route
  const fetchNewCoachAdvice = async (categoryContext?: string) => {
    setLoadingCoach(true);
    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs, category: categoryContext })
      });
      const data = await response.json();
      if (data.tip) {
        setCoachAdvice(data.tip);
      }
    } catch (error) {
      console.error("Could not fetch advice:", error);
    } finally {
      setLoadingCoach(false);
    }
  };

  // Helper: Trigger advice on load
  useEffect(() => {
    fetchNewCoachAdvice();
  }, []);

  // Quick Action Handler: Swipe to log daily walk
  const handleQuickLogWalk = () => {
    const walkLog: ActivityLog = {
      id: "quick_walk_" + Date.now(),
      category: "Transport",
      name: "Commute by walking",
      amount: 4, // 4 km
      unit: "km",
      co2Saved: parseFloat((4 * 0.15).toFixed(1)), // saves 0.6 kg compared to standard driving
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [walkLog, ...prev]);
    // update challenges that might relate to walking
    setChallenges(prev => prev.map(c => {
      if (c.title === "Walk to Work") {
        return { ...c, progressPercent: Math.min(100, c.progressPercent + 8) };
      }
      return c;
    }));
    fetchNewCoachAdvice("Transport");
  };

  // Add customized activity log
  const handleAddLog = (newLogEntry: Omit<ActivityLog, "id" | "timestamp">) => {
    const freshLog: ActivityLog = {
      ...newLogEntry,
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [freshLog, ...prev]);

    // Check if the user completed any active challenges based on category
    setChallenges(prev => prev.map(c => {
      if (c.category === freshLog.category) {
        return { ...c, progressPercent: Math.min(100, c.progressPercent + 10) };
      }
      return c;
    }));

    // Trigger AI advise refresh for that category
    fetchNewCoachAdvice(freshLog.category);
  };

  // Send conversational chat query to server-side Gemini
  const handleSendChat = async () => {
    if (!userQuery.trim()) return;
    const currentQuery = userQuery;
    setChatMessages(prev => [...prev, { role: 'user', text: currentQuery }]);
    setUserQuery("");
    setLoadingCoach(true);

    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          logs, 
          category: "Interactive Question: " + currentQuery 
        })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'model', text: data.tip || "That sounds like a great eco-friendly habit! Let's keep driving that footprint down." }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'model', text: "EcoCoach is currently reflecting on green energy. Try checking back in a moment or exploring transit reductions!" }]);
    } finally {
      setLoadingCoach(false);
    }
  };

  // Delete logged item
  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  // Reset demo databases
  const handleResetDemoData = () => {
    setLogs(INITIAL_LOGS);
    setChallenges(INITIAL_CHALLENGES);
    setGoals(INITIAL_GOALS);
    setCoachAdvice("Your diet is your top opportunity — cutting red meat saves ~3.2 kg CO2 per meal.");
  };

  // Challenge Action: Toggle Join Challenge
  const handleToggleJoinChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, joined: !c.joined, progressPercent: c.joined ? 0 : 10 };
      }
      return c;
    }));
  };

  // Goal updates
  const handleAddGoal = (title: string, target: number, category: string) => {
    const newGoal: Goal = {
      id: "goal_" + Date.now(),
      title,
      targetReduction: target,
      currentProgress: 0,
      category
    };
    setGoals(prev => [...prev, newGoal]);
  };

  // Navigation callbacks
  const navigateToCategoryAdd = (category?: string) => {
    setSelectedCategoryForAdd(category);
    setActiveTab("AddActivityFlow");
  };

  return (
    <div id="app-viewport" className="min-h-screen bg-[#e8ffee] text-[#072014] pb-24 flex flex-col items-center">
      
      {/* Universal Desktop Sidepanel + Mobile responsive Frame holder */}
      <div className="w-full max-w-lg bg-[#e8ffee] flex flex-col min-h-screen relative shadow-md">
        
        {/* Top Common Appbar */}
        {activeTab !== "AddActivityFlow" && (
          <header className="flex justify-between items-center w-full px-5 py-4 bg-[#e8ffee] sticky top-0 z-40 border-b border-[#c5ddd2]/50">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setShowSettingsModal(true)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#006c48]/50 shadow-sm cursor-pointer hover:scale-105 active:scale-95 duration-100 transition-transform"
                title="Profile & Preferences"
              >
                <img 
                  alt="Profile" 
                  className="w-full h-full object-cover animate-fade-in" 
                  src={userProfile.avatarUrl}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-[#012d1d] tracking-tight leading-tight">EcoTrace</span>
                <span className="text-[10px] text-[#607a6a] font-bold">{userProfile.name} • {userProfile.location}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  const bulletins = [
                    "Awesome job! You recently logged commutes matching Paris Agreement guidelines.",
                    "Tip of the Hour: Commuting by foot or light transit saves up to 4kg of CO2 per trip!",
                    "Community update: Aria Green achieved a 7-day footprint streak!",
                    "Peak saving alert: Choosing plant-based diet options cut your diet footprint by 55% today!"
                  ];
                  setNotificationMsg(bulletins[Math.floor(Math.random() * bulletins.length)]);
                }}
                className="relative p-2 rounded-full hover:bg-white/50 transition-colors"
                title="Environmental Bulletins"
              >
                <Bell className="w-5 h-5 text-[#012d1d]" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#006c48] rounded-full animate-ping"></span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#006c48] rounded-full"></span>
              </button>

              <button 
                onClick={() => setShowSettingsModal(true)}
                className="text-[10px] font-black uppercase tracking-wider text-[#006c48] bg-[#92f7c3]/40 border border-[#c5ddd2]/60 px-3 py-1.5 rounded-full active:scale-95 transition-all hover:bg-[#92f7c3]/60 duration-100"
              >
                Settings
              </button>
            </div>
          </header>
        )}

        {/* Dynamic Route Screen Frame */}
        <main className="flex-1 px-5 py-3 overflow-y-auto">
          {/* Dismissible Real-time Bulletin Banner */}
          {notificationMsg && (
            <div className="mb-4 bg-[#defbe7] border border-[#006c48]/30 rounded-2xl p-4 relative overflow-hidden shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase text-[#006c48] tracking-widest block mb-1">
                    Eco Bulletin Alert
                  </span>
                  <p className="text-xs text-[#072014] font-medium leading-relaxed">
                    {notificationMsg}
                  </p>
                </div>
                <button 
                  onClick={() => setNotificationMsg(null)}
                  className="text-xs font-black text-[#587262] hover:text-[#006c48] bg-white/60 w-5 h-5 flex items-center justify-center border border-[#c5ddd2] rounded-full shrink-0 ml-2"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {activeTab === "Home" && (
            <Dashboard 
              logs={logs}
              onSwipeLog={handleQuickLogWalk}
              onNavigateAdd={navigateToCategoryAdd}
              activeChallenges={challenges}
              coachAdvice={coachAdvice}
              onRefreshCoach={() => fetchNewCoachAdvice()}
              loadingCoach={loadingCoach}
              dailyTarget={userProfile.dailyTarget}
            />
          )}

          {activeTab === "Track" && (
            <div className="space-y-6 pb-12">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-extrabold text-[#012d1d]">Footprint Logs</h1>
                <button 
                  onClick={() => navigateToCategoryAdd()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#012d1d] text-[#92f7c3] rounded-full text-xs font-bold uppercase tracking-wider shadow"
                >
                  <Plus className="w-4 h-4" /> Log item
                </button>
              </div>

              {/* Aggregation summary card */}
              <div className="bg-[#defbe7] border border-[#c5ddd2] rounded-3xl p-5 grid grid-cols-2 gap-4 text-center">
                <div className="space-y-0.5 border-r border-[#c5ddd2]/60">
                  <span className="text-[10px] font-black uppercase text-[#607a6a] tracking-wider block">Total Co2 Saved</span>
                  <span className="text-3xl font-mono font-bold text-[#006c48]">
                    {logs.reduce((sum, l) => sum + l.co2Saved, 0).toFixed(1)} <span className="text-xs">kg</span>
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-[#607a6a] tracking-wider block">Logged Entries</span>
                  <span className="text-3xl font-mono font-bold text-[#012d1d]">
                    {logs.length}
                  </span>
                </div>
              </div>

              {/* History logged list */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-[#012d1d] uppercase tracking-widest px-1">Your Tracking History</h3>
                
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-[#607a6a] bg-white rounded-3xl border border-[#c5ddd2] p-6 space-y-2">
                    <TreePine className="w-12 h-12 text-[#92f7c3] mx-auto animate-pulse" />
                    <p className="font-bold">No carbon tracked yet</p>
                    <p className="text-xs">Start logging transport, diet, or waste to watch your savings grow!</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div 
                      key={log.id}
                      className="bg-white border border-[#c5ddd2] rounded-2xl p-4 flex justify-between items-center shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#d8f5e1] rounded-xl flex items-center justify-center text-[#006c48]">
                          {log.category === "Transport" && <Bike className="w-5 h-5" />}
                          {log.category === "Food" && <Utensils className="w-5 h-5" />}
                          {log.category === "Energy" && <Zap className="w-5 h-5" />}
                          {log.category === "Shopping" && <ShoppingBag className="w-5 h-5" />}
                          {log.category === "Waste" && <Trash2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#012d1d]">{log.name}</p>
                          <p className="text-[10px] text-[#607a6a]">
                            Saved {log.co2Saved} kg • {log.amount} {log.unit}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-xs text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "Insights" && (
            <div className="space-y-6 pb-12">
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-[#012d1d]">AI EcoInsights</h1>
                <p className="text-sm text-[#607a6a]">Unlock custom savings metrics matched to your actual routine.</p>
              </div>

              {/* Dynamic coach chat console */}
              <div className="bg-white border border-[#c5ddd2] rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#c5ddd2]/50">
                  <Sparkles className="w-5 h-5 text-[#006c48]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#012d1d]">Direct Chat with EcoCoach</span>
                </div>

                <div className="h-48 overflow-y-auto space-y-3 pr-1 hide-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i}
                      className={`p-3.5 rounded-2xl max-w-[90%] text-sm leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-[#012d1d] text-white ml-auto rounded-tr-none" 
                          : "bg-[#defbe7] text-[#072014] mr-auto rounded-tl-none border border-[#c5ddd2]/50"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {loadingCoach && (
                    <div className="text-xs text-[#006c48] animate-pulse italic mr-auto pl-2">
                      EcoCoach is typing...
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Suggest a low-carbon vegetarian meal..."
                    className="flex-1 bg-[#EEF6F0] px-4 py-3 rounded-full border border-[#c5ddd2] text-xs focus:outline-none focus:ring-1 focus:ring-[#006c48]"
                  />
                  <button 
                    onClick={handleSendChat}
                    className="bg-[#006c48] p-3 text-white rounded-full hover:bg-[#012d1d] active:scale-95 duration-100"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Peer comparisons stats */}
              <div className="bg-[#1b4332] text-white rounded-3xl p-5 space-y-4">
                <h3 className="font-bold text-base text-[#92f7c3] flex items-center gap-2">
                  <Award className="w-5 h-5" /> Your Eco-Ranking
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Excellent! You are ranking in the <span className="font-bold text-[#92f7c3]">top 18%</span> of your neighborhood on green transport modes this week.
                </p>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="bg-[#012d1d]/60 rounded-xl p-3">
                    <span className="text-[10px] text-white/50 block font-bold">SAVED</span>
                    <span className="font-mono text-base font-bold text-[#92f7c3]">14.2 kg</span>
                  </div>
                  <div className="bg-[#012d1d]/60 rounded-xl p-3">
                    <span className="text-[10px] text-white/50 block font-bold">PERCENTILE</span>
                    <span className="font-mono text-base font-bold text-[#92f7c3]">82nd</span>
                  </div>
                  <div className="bg-[#012d1d]/60 rounded-xl p-3">
                    <span className="text-[10px] text-white/50 block font-bold">GRADE</span>
                    <span className="font-mono text-base font-bold text-[#92f7c3]">A+</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Goals" && (
            <div className="space-y-6 pb-12">
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-[#012d1d]">My Milestones</h1>
                <p className="text-sm text-[#607a6a]">Track your long term eco commitments and achievements.</p>
              </div>

              {/* Living Tree Milestone Graphic */}
              <div className="bg-white border border-[#c5ddd2] rounded-3xl p-6 text-center space-y-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-[#EEF6F0] rounded-full text-[9px] font-bold text-[#006c48]">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  <span>5 Day Streak</span>
                </div>

                <div className="space-y-2">
                  <TreePine className="w-24 h-24 text-[#006c48] mx-auto filter drop-shadow animate-bounce" />
                  <h3 className="font-bold text-lg text-[#012d1d]">Your Ecosystem Tree</h3>
                  <p className="text-xs text-[#607a6a] max-w-xs mx-auto">
                    This living seedling has gained <span className="font-bold text-[#006c48]">12 healthy leaves</span> from your transport & diet choices. Complete challenges to grow it!
                  </p>
                </div>

                <div className="pt-2">
                  <div className="w-full bg-[#EEF6F0] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#006c48] h-full rounded-full" style={{ width: "65%" }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#607a6a] font-bold mt-1.5">
                    <span>Level 2 Sapling</span>
                    <span>350g more to reach Forest Oak</span>
                  </div>
                </div>
              </div>

              {/* Goal tracking cards list */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-[#012d1d] uppercase tracking-widest px-1">Active Carbon Targets</h3>
                
                {goals.map((goal) => (
                  <div key={goal.id} className="bg-white border border-[#c5ddd2] rounded-2xl p-5 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-[#012d1d]">{goal.title}</span>
                      <span className="text-xs text-[#006c48] bg-[#defbe7] px-2.5 py-0.5 rounded-full font-bold">
                        {goal.category}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-[#607a6a] font-bold">
                        <span>Progress: {goal.currentProgress}%</span>
                        <span>Target: {goal.targetReduction}%</span>
                      </div>
                      <div className="w-full bg-[#defbe7] h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#006c48] h-full rounded-full" 
                          style={{ width: `${(goal.currentProgress / goal.targetReduction) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Community" && (
            <div className="space-y-6 pb-12">
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-[#012d1d]">Community Hub</h1>
                <p className="text-sm text-[#607a6a]">Compete in challenges and team up with local friends.</p>
              </div>

              {/* Browse and Join Challenges */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#012d1d] uppercase tracking-widest px-1">Available Challenges</h3>
                
                {challenges.map((c) => (
                  <div 
                    key={c.id} 
                    className="bg-white border border-[#c5ddd2] rounded-2xl p-5 space-y-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-[#012d1d]">{c.title}</h4>
                        <p className="text-xs text-[#607a6a] mt-0.5 leading-relaxed">{c.description}</p>
                      </div>
                      <button 
                        onClick={() => handleToggleJoinChallenge(c.id)}
                        className={`text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider scale-95 duration-100 ${
                          c.joined 
                            ? "bg-red-50 text-red-600 border border-red-200" 
                            : "bg-[#006c48] text-white"
                        }`}
                      >
                        {c.joined ? "Leave" : "Join"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EEF6F0] text-xs font-semibold">
                      <span className="text-[#006c48] uppercase tracking-wider text-[10px]">{c.category} Focus</span>
                      <span className="text-[#607a6a]">
                        {c.friendsJoined.length} active friends
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Local Leaderboards */}
              <div className="bg-white border border-[#c5ddd2] rounded-3xl p-5 space-y-4">
                <h3 className="font-bold text-base text-[#012d1d] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#006c48]" /> Neighborhood Leaderboard
                </h3>
                
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "Siddharth (Me)", footprintSaved: "34.5 kg", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
                    { rank: 2, name: "Aria Green", footprintSaved: "31.2 kg", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
                    { rank: 3, name: "Kaelen Forest", footprintSaved: "28.0 kg", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" }
                  ].map((user, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-xl hover:bg-[#EEF6F0]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#006c48] w-4">#{user.rank}</span>
                        <img className="w-8 h-8 rounded-full object-cover" src={user.avatar} alt={user.name} />
                        <span className="text-xs font-bold text-[#012d1d]">{user.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#006c48]">{user.footprintSaved} Saved</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "AddActivityFlow" && (
            <AddActivity 
              initialCategory={selectedCategoryForAdd}
              onGoBack={() => {
                setActiveTab("Home");
                setSelectedCategoryForAdd(undefined);
              }}
              onAddLog={handleAddLog}
            />
          )}
        </main>

        {/* Global Bottom Sticky Tab Bar component */}
        {activeTab !== "AddActivityFlow" && (
          <nav className="fixed bottom-0 w-full max-w-lg z-50 flex justify-around items-center px-4 py-3 bg-[#EEF6F0] border-t border-[#c5ddd2] rounded-t-3xl shadow-xl backdrop-blur-md">
            
            {/* Home (Active) */}
            <button 
              onClick={() => setActiveTab("Home")}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${
                activeTab === "Home" 
                  ? "bg-[#92f7c3] text-[#00734d]" 
                  : "text-[#607a6a] hover:bg-white/40"
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase mt-1">Home</span>
            </button>

            {/* Track */}
            <button 
              onClick={() => setActiveTab("Track")}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${
                activeTab === "Track" 
                  ? "bg-[#92f7c3] text-[#00734d]" 
                  : "text-[#607a6a] hover:bg-white/40"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase mt-1">Track</span>
            </button>

            {/* Insights */}
            <button 
              onClick={() => setActiveTab("Insights")}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${
                activeTab === "Insights" 
                  ? "bg-[#92f7c3] text-[#00734d]" 
                  : "text-[#607a6a] hover:bg-white/40"
              }`}
            >
              <Lightbulb className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase mt-1">Insights</span>
            </button>

            {/* Goals */}
            <button 
              onClick={() => setActiveTab("Goals")}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${
                activeTab === "Goals" 
                  ? "bg-[#92f7c3] text-[#00734d]" 
                  : "text-[#607a6a] hover:bg-white/40"
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase mt-1">Goals</span>
            </button>

            {/* Community */}
            <button 
              onClick={() => setActiveTab("Community")}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${
                activeTab === "Community" 
                  ? "bg-[#92f7c3] text-[#00734d]" 
                  : "text-[#607a6a] hover:bg-white/40"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase mt-1">Community</span>
            </button>
          </nav>
        )}

        {/* Dynamic Settings & Profile Customisation Modal Overlay */}
        {showSettingsModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in p-4">
            <div className="bg-white rounded-t-[2.5rem] rounded-b-[1.5rem] w-full max-h-[92%] overflow-y-auto p-6 space-y-6 shadow-2xl border border-[#c5ddd2]/50">
              
              {/* Header Title option */}
              <div className="flex justify-between items-center border-b border-[#EEF6F0] pb-4">
                <div>
                  <h2 className="text-xl font-black text-[#012d1d]">Profile & Settings</h2>
                  <p className="text-xs text-[#607a6a]">Customise your carbon tracker parameters</p>
                </div>
                <button 
                  onClick={() => {
                    setShowSettingsModal(false);
                    setNotificationMsg("Profile settings saved successfully!");
                  }}
                  className="bg-[#006c48] text-[#92f7c3] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider scale-95 duration-100 hover:bg-[#012d1d]"
                >
                  Done
                </button>
              </div>

              {/* Edit Nickname & Location */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-[#012d1d] uppercase tracking-widest">Personal Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#607a6a] uppercase">Nickname</label>
                    <input 
                      type="text" 
                      value={userProfile.name}
                      onChange={(e) => {
                        const newName = e.target.value || "Anonymous Tracker";
                        setUserProfile(prev => ({ ...prev, name: newName }));
                      }}
                      placeholder="e.g. Priya 🌿"
                      className="w-full bg-[#EEF6F0] px-3.5 py-2.5 rounded-xl border border-[#c5ddd2] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006c48]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#607a6a] uppercase">Location</label>
                    <input 
                      type="text" 
                      value={userProfile.location}
                      onChange={(e) => {
                        const newLoc = e.target.value || "Earth";
                        setUserProfile(prev => ({ ...prev, location: newLoc }));
                      }}
                      placeholder="e.g. Portland, OR"
                      className="w-full bg-[#EEF6F0] px-3.5 py-2.5 rounded-xl border border-[#c5ddd2] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006c48]"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Preset Options */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-[#012d1d] uppercase tracking-widest">Select Avatar Preset</h3>
                
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: "Priya", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop" },
                    { name: "Eco Biker", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop" },
                    { name: "Explorer", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop" },
                    { name: "Zen Yogi", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop" }
                  ].map((preset, idx) => {
                    const isSelected = userProfile.avatarUrl === preset.url;
                    return (
                      <button 
                        key={idx}
                        onClick={() => setUserProfile(prev => ({ ...prev, avatarUrl: preset.url }))}
                        className={`flex flex-col items-center p-1.5 rounded-xl border-2 duration-150 relative ${
                          isSelected ? "border-[#006c48] bg-[#defbe7]" : "border-[#c5ddd2]/50 hover:bg-[#EEF6F0]"
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="w-10 h-10 rounded-full object-cover shadow-sm"
                        />
                        <span className="text-[8px] font-bold text-[#607a6a] mt-1 text-center truncate w-full">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 bg-[#006c48] text-white text-[8px] px-1 rounded-full w-4 h-4 flex items-center justify-center font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#607a6a] uppercase">Or enter custom Avatar Image URL</label>
                  <input 
                    type="text" 
                    value={userProfile.avatarUrl}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserProfile(prev => ({ ...prev, avatarUrl: value }));
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#EEF6F0] px-3.5 py-2 rounded-xl border border-[#c5ddd2] text-[10px] font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Carbon footprint Daily budget Target */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-[#012d1d] uppercase tracking-widest">Daily budget Target</h3>
                  <span className="text-sm font-mono font-bold text-[#006c48] bg-[#defbe7] px-2.5 py-1 rounded-lg">
                    {userProfile.dailyTarget.toFixed(1)} kg CO2
                  </span>
                </div>
                
                <input 
                  type="range" 
                  min="2.0" 
                  max="15.0" 
                  step="0.5"
                  value={userProfile.dailyTarget}
                  onChange={(e) => {
                    const nextVal = parseFloat(e.target.value) || 6.0;
                    setUserProfile(prev => ({ ...prev, dailyTarget: nextVal }));
                  }}
                  className="w-full accent-[#006c48] h-2 bg-[#EEF6F0] rounded-lg appearance-none cursor-pointer border border-[#c5ddd2]"
                />
                <div className="flex justify-between text-[10px] text-[#607a6a] font-bold">
                  <span>2.0 kg (Strict Green)</span>
                  <span>15.0 kg (Standard Global)</span>
                </div>
              </div>

              {/* Safety Actions & Data Resets */}
              <div className="border-t border-[#EEF6F0] pt-4 space-y-3">
                <h3 className="text-xs font-black text-[#012d1d] uppercase tracking-widest">Database Maintenance</h3>
                <p className="text-xs text-[#607a6a] leading-normal">
                  Need to recreate demo tracking metrics or restore the app's default datasets? You can rebuild all values with the reset action below.
                </p>
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to restore default initial logs & goals? Your current modifications will be replaced.")) {
                      handleResetDemoData();
                      setShowSettingsModal(false);
                    }
                  }}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors active:scale-95 duration-100"
                >
                  Reset Demo Databases
                </button>
              </div>

              {/* Final close helper */}
              <button 
                onClick={() => {
                  setShowSettingsModal(false);
                  setNotificationMsg("Profile settings saved successfully!");
                }}
                className="w-full py-3.5 bg-[#012d1d] text-[#92f7c3] rounded-2xl text-xs font-bold uppercase tracking-widest shadow-md hover:bg-[#006c48] transition-colors"
              >
                Save & Close Preferences
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
