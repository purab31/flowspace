import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

const slides = [
  {
    title: "Welcome to flowspace",
    description: "Your all-in-one professional workspace. Let's take a quick tour to help you get started with managing your team's projects and daily tasks seamlessly.",
    icon: "rocket_launch"
  },
  {
    title: "Kanban Task Tracking",
    description: "Navigate to the Tasks tab. You can easily drag and drop task cards across the columns (To Do, In Progress, Done) to keep everyone updated on your progress in real time.",
    icon: "drag_indicator"
  },
  {
    title: "Real-time Communication",
    description: "Click on any task card or head to Chat. Inside, you'll find live communication channels to collaborate with your teammates right where the work happens.",
    icon: "forum"
  },
  {
    title: "Creating Entries",
    description: "Hit the green 'New Entry' button in the sidebar anytime to generate a new Project or assign Tasks directly to your team members.",
    icon: "add_circle"
  }
];

export default function OnboardingModal() {
  const { isOnboardingOpen, closeOnboarding } = useAppStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOnboardingOpen) return null;

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      closeOnboarding();
      setCurrentSlide(0);
    }
  };

  const skipTour = () => {
    closeOnboarding();
    setCurrentSlide(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={skipTour}
      ></div>
      
      {/* Modal Box */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="h-40 bg-gradient-to-br from-primary to-green-800 flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-7xl opacity-90 drop-shadow-md">
            {slides[currentSlide].icon}
          </span>
        </div>
        
        <div className="p-8 text-center flex flex-col items-center">
          <h2 className="text-2xl font-headline font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
            {slides[currentSlide].title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-body text-sm leading-relaxed mb-8 max-w-sm">
            {slides[currentSlide].description}
          </p>

          <div className="flex gap-2 mb-8">
            {slides.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentSlide ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
              ></div>
            ))}
          </div>

          <div className="flex items-center justify-between w-full">
            <button 
              onClick={skipTour} 
              className="text-slate-400 dark:text-slate-500 font-label text-sm font-semibold hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Skip
            </button>
            <button 
              onClick={nextSlide} 
              className="bg-primary hover:bg-green-600 text-white font-label font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-primary/20 transition-all flex items-center gap-1.5"
            >
              <span>{currentSlide === slides.length - 1 ? "Get Started" : "Next"}</span>
              {currentSlide < slides.length - 1 && <span className="material-symbols-outlined text-[16px]">arrow_forward</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
