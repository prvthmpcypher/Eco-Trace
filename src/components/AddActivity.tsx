import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Search, Bike, Utensils, Zap, ShoppingBag, 
  Trash2, Globe, Heart, Check, ChevronRight, Sparkles 
} from "lucide-react";
import { ActivityLog } from "../types";
import { INITIAL_LOG_TEMPLATES } from "../data";

interface AddActivityProps {
  onAddLog: (log: Omit<ActivityLog, "id" | "timestamp">) => void;
  onGoBack: () => void;
  initialCategory?: string;
}

export default function AddActivity({ onAddLog, onGoBack, initialCategory }: AddActivityProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "Transport");
  
  // Choose template based on category or custom selected template
  const [selectedTemplate, setSelectedTemplate] = useState<typeof INITIAL_LOG_TEMPLATES[0]>(
    INITIAL_LOG_TEMPLATES.find(t => t.category === (initialCategory || "Transport")) || INITIAL_LOG_TEMPLATES[0]
  );

  // Slider amount state
  const [sliderVal, setSliderVal] = useState<number>(12);

  // Synchronize category preset choice
  useEffect(() => {
    const preset = INITIAL_LOG_TEMPLATES.find(t => t.category === selectedCategory);
    if (preset) {
      setSelectedTemplate(preset);
      // set reasonable starting value per category
      if (preset.category === "Transport") setSliderVal(12);
      else if (preset.category === "Food") setSliderVal(1);
      else if (preset.category === "Energy") setSliderVal(15);
      else if (preset.category === "Shopping") setSliderVal(2);
      else setSliderVal(5);
    }
  }, [selectedCategory]);

  // Handle template selection from search / recent items
  const selectTemplateDirectly = (template: typeof INITIAL_LOG_TEMPLATES[0]) => {
    setSelectedCategory(template.category);
    setSelectedTemplate(template);
    if (template.category === "Transport") setSliderVal(15);
    else if (template.category === "Food") setSliderVal(1);
    else setSliderVal(10);
  };

  // Live Carbon calculations
  const carbonImpact = parseFloat((sliderVal * selectedTemplate.baseSavedPerUnit).toFixed(1));

  // Search filter
  const filteredTemplates = INITIAL_LOG_TEMPLATES.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Slider Swipe-to-Log interaction
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);

  const handleSwipeStart = (e: React.TouchEvent | React.MouseEvent) => {
    const pageX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(pageX);
  };

  const handleSwipeMove = (e: React.TouchEvent | React.MouseEvent) => {
    const pageX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const delta = pageX - startX;
    const maxDrag = 180;
    const progress = Math.min(100, Math.max(0, (delta / maxDrag) * 100));
    
    if (!isSwiped) {
      setSwipeProgress(progress);
      if (progress >= 95) {
        setIsSwiped(true);
        setSwipeProgress(100);
        // Dispatch add item
        onAddLog({
          category: selectedTemplate.category,
          name: selectedTemplate.name,
          amount: sliderVal,
          unit: selectedTemplate.unit,
          co2Saved: carbonImpact
        });
        setTimeout(() => {
          onGoBack();
        }, 800);
      }
    }
  };

  const handleSwipeEnd = () => {
    if (!isSwiped) {
      setSwipeProgress(0);
    }
  };

  return (
    <div className="space-y-6 pb-48">
      {/* Top Header Row with profile */}
      <section className="flex justify-between items-center bg-[#e8ffee] sticky top-0 z-10 py-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={onGoBack}
            className="p-2 hover:bg-[#d8f5e1] rounded-full transition-colors active:scale-95 duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-[#012d1d]" />
          </button>
          <h1 className="text-2xl font-extrabold text-[#012d1d]">Add Activity</h1>
        </div>
      </section>

      {/* Search Input */}
      <section className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-[#607a6a]" />
        </div>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#defbe7] border border-[#c5ddd2] rounded-2xl focus:ring-2 focus:ring-[#006c48] focus:outline-none text-sm placeholder-[#607a6a] transition-all"
          placeholder="Search activities..."
        />
      </section>

      {/* Recent Items horizontal scroll row */}
      <section>
        <h2 className="text-sm font-extrabold text-[#012d1d] uppercase tracking-wider mb-2">
          Recent Items
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {INITIAL_LOG_TEMPLATES.map((item) => (
            <button
              key={item.id}
              onClick={() => selectTemplateDirectly(item)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white border border-[#c5ddd2] rounded-full hover:bg-[#defbe7] transition-all active:scale-95 duration-200 text-xs font-bold uppercase tracking-wider text-[#072014]"
            >
              {item.category === "Transport" && <Bike className="w-4 h-4 text-[#006c48]" />}
              {item.category === "Food" && <Utensils className="w-4 h-4 text-[#006c48]" />}
              {item.category === "Energy" && <Zap className="w-4 h-4 text-[#006c48]" />}
              {item.category === "Shopping" && <ShoppingBag className="w-4 h-4 text-[#006c48]" />}
              {item.category === "Waste" && <Trash2 className="w-4 h-4 text-[#006c48]" />}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section>
        <h2 className="text-sm font-extrabold text-[#012d1d] uppercase tracking-wider mb-3">
          Categories
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "Transport", label: "Transport", icon: Bike },
            { id: "Food", label: "Food", icon: Utensils },
            { id: "Energy", label: "Energy", icon: Zap },
            { id: "Shopping", label: "Shopping", icon: ShoppingBag },
            { id: "Waste", label: "Waste", icon: Trash2 },
            { id: "More", label: "More", icon: Globe }
          ].map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => cat.id !== "More" && setSelectedCategory(cat.id)}
                className={`p-4 flex flex-col items-center justify-center border rounded-2xl group transition-all duration-200 ${
                  isSelected 
                    ? "bg-[#92f7c3] border-[#006c48]" 
                    : "bg-white border-[#c5ddd2] hover:bg-[#defbe7]"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${
                  isSelected ? "bg-[#006c48] text-white" : "bg-[#d8f5e1] text-[#006c48]"
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold text-[#072014] uppercase tracking-widest">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Entry Details card */}
      <section className="bg-white border border-[#c5ddd2] rounded-3xl p-5 space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-[#012d1d]">Entry Details</h3>
          <span className="text-xs bg-[#defbe7] text-[#006c48] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {selectedTemplate.category}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-[#607a6a] uppercase tracking-widest block">
            Duration / Amount
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range"
              min="1"
              max={selectedTemplate.category === "Food" ? "10" : "100"}
              value={sliderVal}
              onChange={(e) => setSliderVal(parseInt(e.target.value))}
              className="w-full accent-[#006c48] h-2 bg-[#d8f5e1] rounded-full appearance-none cursor-pointer"
            />
            <div className="flex items-baseline gap-1 shrink-0">
              <span className="font-mono text-xl font-bold text-[#006c48] w-12 text-right">
                {sliderVal}
              </span>
              <span className="text-xs text-[#607a6a]">{selectedTemplate.unit}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#defbe7] rounded-2xl border border-[#c5ddd2] flex items-center gap-3">
          <Heart className="w-5 h-5 text-[#006c48]" />
          <p className="text-xs text-[#002113]">
            You're choosing a low-carbon {selectedTemplate.category.toLowerCase()} mode. Well done!
          </p>
        </div>
      </section>

      {/* Dynamic Slide To Confirm Fixed Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/95 border-t border-[#c5ddd2] rounded-t-3xl z-40 p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold text-[#607a6a] uppercase tracking-widest block">
              Calculated Carbon Impact
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-semibold text-[#006c48]">
                -{carbonImpact}
              </span>
              <span className="text-xs text-[#607a6a] font-semibold">kg CO2e</span>
            </div>
          </div>
          {/* Micro Growth visual indicators */}
          <div className="w-10 h-10 rounded-full bg-[#d8f5e1] flex items-center justify-center animate-bounce">
            <Sparkles className="w-5 h-5 text-[#006c48]" />
          </div>
        </div>

        {/* Slide confirmation container */}
        <div className="relative h-16 w-full bg-[#d8f5e1] border border-[#c5ddd2] rounded-full flex items-center p-1.5 overflow-hidden group select-none">
          {/* Fill Bar */}
          <div 
            className="absolute left-0 top-0 h-full bg-[#006c48]/25 transition-all duration-100" 
            style={{ width: `${swipeProgress}%` }}
          ></div>

          {/* Slider Trigger Handle */}
          <div
            onTouchStart={handleSwipeStart}
            onTouchMove={handleSwipeMove}
            onTouchEnd={handleSwipeEnd}
            onMouseDown={handleSwipeStart}
            onMouseMove={handleSwipeMove}
            onMouseUp={handleSwipeEnd}
            style={{ transform: `translateX(${swipeProgress * 1.8}px)` }}
            className={`w-13 h-13 ${isSwiped ? 'bg-[#006c48]' : 'bg-[#012d1d]'} rounded-full flex items-center justify-center cursor-pointer z-10 shadow-md active:scale-95 transition-colors duration-200`}
          >
            {isSwiped ? <Check className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-extrabold text-[#414844] uppercase tracking-widest opacity-70">
              {isSwiped ? "Entry Logged! " : "Swipe to confirm entry"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
