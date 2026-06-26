/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Ticket {
  id: string;
  category: string;
  matches: string;
  odds: string;
  isHighOdds?: boolean;
}

interface Category {
  name: string;
  icon: string;
  matches: string;
  tickets: Ticket[];
}

const CATEGORIES: Category[] = [
  {
    name: "World Cup",
    icon: "public",
    matches: "9 Matches",
    tickets: [
      { id: "wc-1", category: "World Cup", matches: "9 Matches", odds: "12.40" },
      { id: "wc-2", category: "World Cup", matches: "9 Matches", odds: "13.40" },
      { id: "wc-3", category: "World Cup", matches: "9 Matches", odds: "14.40" },
      { id: "wc-4", category: "World Cup", matches: "9 Matches", odds: "15.40" },
      { id: "wc-5", category: "World Cup", matches: "9 Matches", odds: "16.40" },
    ]
  },
  {
    name: "Bet Builder",
    icon: "construction",
    matches: "5 Matches",
    tickets: [
      { id: "bb-1", category: "Bet Builder", matches: "5 Matches", odds: "8.00" },
      { id: "bb-2", category: "Bet Builder", matches: "5 Matches", odds: "8.10" },
      { id: "bb-3", category: "Bet Builder", matches: "5 Matches", odds: "8.20" },
      { id: "bb-4", category: "Bet Builder", matches: "5 Matches", odds: "8.30" },
      { id: "bb-5", category: "Bet Builder", matches: "5 Matches", odds: "8.40" },
    ]
  },
  {
    name: "Roll Over",
    icon: "loop",
    matches: "2 Matches",
    tickets: [
      { id: "ro-1", category: "Roll Over", matches: "2 Matches", odds: "1.80" },
      { id: "ro-2", category: "Roll Over", matches: "2 Matches", odds: "1.81" },
      { id: "ro-3", category: "Roll Over", matches: "2 Matches", odds: "1.82" },
      { id: "ro-4", category: "Roll Over", matches: "2 Matches", odds: "1.83" },
      { id: "ro-5", category: "Roll Over", matches: "2 Matches", odds: "1.84" },
    ]
  },
  {
    name: "1 Cedi and a Dream",
    icon: "diamond",
    matches: "25 Matches",
    tickets: [
      { id: "cd-1", category: "1 Cedi", matches: "25 Matches", odds: "950.00", isHighOdds: true },
      { id: "cd-2", category: "1 Cedi", matches: "25 Matches", odds: "951.00", isHighOdds: true },
      { id: "cd-3", category: "1 Cedi", matches: "25 Matches", odds: "952.00", isHighOdds: true },
      { id: "cd-4", category: "1 Cedi", matches: "25 Matches", odds: "953.00", isHighOdds: true },
      { id: "cd-5", category: "1 Cedi", matches: "25 Matches", odds: "954.00", isHighOdds: true },
    ]
  },
  {
    name: "Beticology",
    icon: "science",
    matches: "4 Matches",
    tickets: [
      { id: "bet-1", category: "Beticology", matches: "4 Matches", odds: "5.05" },
      { id: "bet-2", category: "Beticology", matches: "4 Matches", odds: "5.15" },
      { id: "bet-3", category: "Beticology", matches: "4 Matches", odds: "5.25" },
      { id: "bet-4", category: "Beticology", matches: "4 Matches", odds: "5.35" },
      { id: "bet-5", category: "Beticology", matches: "4 Matches", odds: "5.45" },
    ]
  },
  {
    name: "General / Long Bets",
    icon: "trending_up",
    matches: "12 Matches",
    tickets: [
      { id: "lb-1", category: "Long Bets", matches: "12 Matches", odds: "20.50" },
      { id: "lb-2", category: "Long Bets", matches: "12 Matches", odds: "21.50" },
      { id: "lb-3", category: "Long Bets", matches: "12 Matches", odds: "22.50" },
      { id: "lb-4", category: "Long Bets", matches: "12 Matches", odds: "23.50" },
      { id: "lb-5", category: "Long Bets", matches: "12 Matches", odds: "24.50" },
    ]
  },
  {
    name: "Engine Room",
    icon: "settings",
    matches: "3 Matches",
    tickets: [
      { id: "er-1", category: "Engine Room", matches: "3 Matches", odds: "3.05" },
      { id: "er-2", category: "Engine Room", matches: "3 Matches", odds: "3.15" },
      { id: "er-3", category: "Engine Room", matches: "3 Matches", odds: "3.25" },
      { id: "er-4", category: "Engine Room", matches: "3 Matches", odds: "3.35" },
      { id: "er-5", category: "Engine Room", matches: "3 Matches", odds: "3.45" },
    ]
  },
];

const EXPERTS = [
  {
    name: "Sarah Jenkins",
    role: "Lead Football Analyst",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    specialty: "EPL & Champions League Specialist",
    icon: "star",
    isFeatured: true
  },
  {
    name: "Marcus Rowe",
    role: "Technical Tipster",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    specialty: "Adaptation Family",
    icon: "trending_up"
  },
  {
    name: "Elena Rostova",
    role: "Market Strategist",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600",
    specialty: "Asian Handicap",
    icon: "analytics"
  },
  {
    name: "Chloe Adams",
    role: "Quantitative Analyst",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
    specialty: "Adaptation Family",
    icon: "show_chart"
  },
  {
    name: "David Thorne",
    role: "Player Prop Specialist",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
    specialty: "Adaptation Family",
    icon: "sports_and_outdoors"
  },
  {
    name: "Carlos Mendez",
    role: "Underdog Scout",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
    specialty: "Adaptation Family",
    icon: "bolt"
  },
  {
    name: "Alex Rivera",
    role: "Performance Specialist",
    img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600",
    specialty: "Data-Driven Insights",
    icon: "monitoring"
  },
  {
    name: "Olivia Bennett",
    role: "Risk & Bankroll Manager",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600",
    specialty: "Adaptation Family",
    icon: "shield"
  }
];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedExpertIndex, setSelectedExpertIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const generateSlipCode = (id: string, category: string, odds: string) => {
    const cleanCategory = category.replace(/\s+/g, '').toUpperCase().slice(0, 3);
    const numericPart = odds.replace('.', '');
    return `AF-${cleanCategory}-${numericPart}`;
  };

  const handleCopyCode = (id: string, category: string, odds: string) => {
    const code = generateSlipCode(id, category, odds);
    navigator.clipboard.writeText(code).then(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: true }));
      setCopiedText(code);
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
        setCopiedText(null);
      }, 2000);
    }).catch((err) => {
      console.error("Could not copy text: ", err);
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Bouncing Logo */}
              <motion.div
                animate={{
                  y: [0, -32, 0],
                }}
                transition={{
                  duration: 1.0,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.12)] border-4 border-neutral-100"
              >
                <img
                  src="https://res.cloudinary.com/dslngzls6/image/upload/v1782495960/photo_2026-06-26_08-47-00_avg1go.jpg"
                  alt="Adaptation Family Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              
              {/* Subtle floor shadow bouncing with the logo */}
              <motion.div
                animate={{
                  scaleX: [1, 0.6, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 1.0,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-16 h-2 bg-neutral-900/10 rounded-full blur-[2px]"
              />

              <div className="flex flex-col items-center gap-1.5 mt-2">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-display text-lg sm:text-xl font-bold text-neutral-900 uppercase tracking-wider"
                >
                  Adaptation Family
                </motion.p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "64px" }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="h-1 bg-[#f3c623] rounded-full"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.4 }}
                  className="text-[10px] sm:text-xs text-neutral-500 font-semibold tracking-widest uppercase mt-1"
                >
                  Loading Daily Destination...
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-surface text-on-surface antialiased flex">
      
      {/* Top Navigation Bar (Unified Desktop & Mobile) */}
      <header className="w-full fixed top-0 left-0 right-0 h-16 z-50 bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant shadow-sm px-4 sm:px-6 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-on-primary-container font-black text-lg animate-pulse">bolt</span>
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-on-surface leading-tight tracking-tight font-display" style={{ fontSize: '16px' }}>Adaptation Family</h1>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider hidden sm:block">Elite Sports Community</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <a 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 text-on-surface hover:text-primary-container transition-colors text-xs lg:text-sm font-normal cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">home</span>
            <span>Home</span>
          </a>
          
          <a 
            onClick={() => scrollToSection('booking-codes')}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary-container transition-colors text-xs lg:text-sm font-normal cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">confirmation_number</span>
            <span>Booking Codes</span>
          </a>

          <a 
            onClick={() => scrollToSection('meet-the-experts')}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary-container transition-colors text-xs lg:text-sm font-normal cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">groups</span>
            <span>Meet Our Team</span>
          </a>

          <a 
            onClick={() => setIsDonateModalOpen(true)}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary-container transition-colors text-xs lg:text-sm font-normal cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">volunteer_activism</span>
            <span>Donate</span>
          </a>

          <button 
            onClick={() => setIsJoinModalOpen(true)}
            className="bg-primary-container text-on-primary-container font-bold text-xs lg:text-sm py-2 px-4 rounded-xl hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-1.5 shadow-sm"
          >
            Join Community
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button 
            onClick={() => setIsDonateModalOpen(true)}
            className="bg-primary-container text-on-primary-container text-[11px] px-3 py-1.5 rounded-full uppercase tracking-wider font-extrabold shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Donate
          </button>
          <button 
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="text-on-surface hover:bg-surface-container-high w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-2xl font-bold">
              {isMobileNavOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Drawer Menu Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop with elegant blur */}
          <div 
            onClick={() => setIsMobileNavOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
          ></div>
          
          {/* Drawer Panel on the right */}
          <nav className="absolute right-0 top-0 h-full w-72 bg-surface-container-lowest border-l border-outline-variant p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-right duration-250 ease-out">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4 mt-2">
              <div className="flex items-center gap-xs">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container text-base font-extrabold">bolt</span>
                </div>
                <span className="font-display text-sm font-black text-on-surface tracking-tight">Navigation</span>
              </div>
              <button 
                onClick={() => setIsMobileNavOpen(false)}
                className="text-on-surface-variant hover:text-on-surface w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5 flex-grow">
              <a 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setIsMobileNavOpen(false);
                }}
                className="flex items-center gap-sm p-3 hover:bg-primary-container/10 hover:text-on-primary-container text-on-surface rounded-xl transition-all duration-200 font-bold cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
                <span className="font-label-lg">Home</span>
              </a>
              
              <a 
                onClick={() => {
                  scrollToSection('booking-codes');
                  setIsMobileNavOpen(false);
                }}
                className="flex items-center gap-sm p-3 hover:bg-primary-container/10 hover:text-on-primary-container text-on-surface-variant hover:text-on-surface rounded-xl transition-all duration-200 font-semibold cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined text-lg">confirmation_number</span>
                <span className="font-label-lg">Booking Codes</span>
              </a>

              <a 
                onClick={() => {
                  scrollToSection('meet-the-experts');
                  setIsMobileNavOpen(false);
                }}
                className="flex items-center gap-sm p-3 hover:bg-primary-container/10 hover:text-on-primary-container text-on-surface-variant hover:text-on-surface rounded-xl transition-all duration-200 font-semibold cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined text-lg">groups</span>
                <span className="font-label-lg">Meet Our Experts</span>
              </a>

              <a 
                onClick={() => {
                  setIsDonateModalOpen(true);
                  setIsMobileNavOpen(false);
                }}
                className="flex items-center gap-sm p-3 hover:bg-primary-container/10 hover:text-on-primary-container text-on-surface-variant hover:text-on-surface rounded-xl transition-all duration-200 font-semibold cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                <span className="font-label-lg">Support / Donate</span>
              </a>
            </div>

            <div className="flex flex-col gap-sm pt-4 border-t border-outline-variant">
              <button 
                onClick={() => {
                  setIsJoinModalOpen(true);
                  setIsMobileNavOpen(false);
                }}
                className="w-full bg-primary-container text-on-primary-container font-label-lg text-label-lg py-3 px-4 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-xs shadow-md font-bold cursor-pointer"
              >
                Join Community
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
              <div className="text-center text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                Elite Sports Analytics
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Canvas */}
      <main className="w-full pt-16 min-h-screen flex flex-col bg-surface-bright">
        
        {/* Hero Section (Full Bleed Background) */}
        <section className="relative w-full min-h-[650px] md:min-h-[750px] lg:min-h-[850px] flex items-center overflow-hidden">
          {/* Background Carousel Images */}
          <div className="absolute inset-0 z-0">
            <img 
              className="absolute inset-0 w-full h-full object-cover bg-carousel-1" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzjNYaIMJyQVPtQWWd8vebvL84op63DV35A6_KqfnhOTNVCPkooGiZieddNgRg725pvNrF7lKKmrM5hbHJby9KxVgdkwRrQFGRyZiK4yf49OIQj3mm8-eW97OM3IzzGSYjIXFoCYQDIACLMrjWe9wNHJ-Rc0MqHwEzEl5RkZcPLxt0QoAp2H6TL3HhJ_eA-j9gtzkhGSW6N0-VvxGN8pBooRb4LgeSz6N8rQGUNB4DWSdcFwlHOVYord9kV_r1whqc2Clrw2HnmQ" 
              alt="Stadium Backdrop 1"
            />
            <img 
              className="absolute inset-0 w-full h-full object-cover bg-carousel-2" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDIOyed6M-Att8_Iy7xg8DxdlN95GM4fYVvXPGZbi0S3qIwNZC1naxxipR60yblxJOx9T_z17deK-9Fzl20mH_MLq9wG1T7isc_9U1dh214TMDKCw2HU0-jDdaNTEy_R8Tk05drcDyUu1iIwwqCrjztChEpZLZDy637WFmMSlWrgS_r-x4hL5_hXaQTcJnU0zBu--gTiCLpt-nFuT3MYMFCOkUmyRHpUHvzKCK7K7V_y6AF8sIVqO496dIPhoGhEnkap5H6C6oTg" 
              alt="Stadium Backdrop 2"
            />
            <img 
              className="absolute inset-0 w-full h-full object-cover bg-carousel-3" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVrzTImstpvtXJMSOy2oKMCjDa_dHtBH1bJp5UVWsHgQPhXjZl-FI6ub0C7Z6rdhCmYamyqx9Nha35ahqyxegOXC_pZtyyx82QOVCQHG3zWLCmrP4to4o1xdno3sm52bZgmxTaACDAfupOI3oOpg7JJ_mmeTgzh8b65PA-i8sd_C1yyGTaIusJ2RFcrAXCZC3mURticNrhRPQd4HJkr0KO-cg7q_6rChuatIJMVZa-_wI4XJJw3fySIYOQkqPQ5qn-mfhBebJ8vA" 
              alt="Stadium Backdrop 3"
            />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
          </div>

          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-16 md:py-24 lg:py-28 relative z-10 flex flex-col items-center text-center gap-6">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-pulse shadow-[0_0_8px_rgba(255,59,48,0.8)]"></span>
              Live: 5 New Predictions
            </span>

            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight max-w-4xl drop-shadow-lg" style={{ fontSize: '26px' }}>
              Your Daily Destination for <br />
              <span className="text-black bg-primary-container px-3 py-1 rounded-lg border-0 inline-block mt-2 shadow-xl transform -rotate-1 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                Winning Bet Slips
              </span>
            </h2>

            <div className="flex flex-col gap-4 max-w-3xl">
              <p className="text-sm sm:text-base md:text-lg text-white/95 font-normal leading-relaxed drop-shadow-md">
                Welcome to the official <span className="font-bold text-white">Adaptation Family</span> website, a rapidly growing and highly engaged global Sports Betting Community! Born on TikTok, our platform brings together a passionate audience of over <span className="font-bold text-[#f3c623] bg-white/10 px-2 py-0.5 rounded-md border border-white/10">90,000 followers</span> and millions of viewers who love sports, trending entertainment, and impactful cultural content.
              </p>
            </div>

            <div className="flex justify-around items-center gap-2 sm:gap-6 md:gap-8 mt-6 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-xl w-full max-w-lg">
              <div className="flex flex-col items-center text-white">
                <span className="text-lg sm:text-2xl md:text-3xl font-extrabold drop-shadow-md">85%</span>
                <span className="text-[9px] sm:text-xs text-white/85 uppercase font-bold tracking-wider">Win Rate</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex flex-col items-center text-white">
                <span className="text-lg sm:text-2xl md:text-3xl font-extrabold drop-shadow-md">90K+</span>
                <span className="text-[9px] sm:text-xs text-white/85 uppercase font-bold tracking-wider">Followers</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex flex-col items-center text-white">
                <span className="text-lg sm:text-2xl md:text-3xl font-extrabold drop-shadow-md">24/7</span>
                <span className="text-[9px] sm:text-xs text-white/85 uppercase font-bold tracking-wider">Analysis</span>
              </div>
            </div>
          </div>
        </section>

        {/* Container for max-width content */}
        <div id="booking-codes" className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-10 md:py-16 flex flex-col gap-10 md:gap-16">
          
          {/* Booking Codes Restructuring (7 Categories) */}
          <div className="flex flex-col gap-10 md:gap-16">
            <div>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-on-surface font-bold leading-tight border-b-4 border-primary-container inline-block pb-2 mb-2" style={{ fontSize: '23px' }}>
                Exclusive Booking Codes
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant font-normal">
                Access our specialized betting categories for maximum returns.
              </p>
            </div>

            {CATEGORIES.map((category) => (
              <section key={category.name} className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b-2 border-surface-container pb-2">
                  <h3 className="text-base sm:text-lg md:text-xl text-on-surface font-bold flex items-center gap-2" style={{ fontSize: '17px' }}>
                    <span className="material-symbols-outlined text-primary-container bg-black p-1 rounded text-lg sm:text-xl">
                      {category.icon}
                    </span>
                    {category.name}
                  </h3>
                  <button className="text-xs sm:text-sm text-on-surface-variant hover:text-primary-container transition-colors font-extrabold uppercase tracking-wider">
                    View More →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 px-1 py-1">
                  {category.tickets.map((ticket) => {
                    const isCopied = !!copiedStates[ticket.id];
                    return (
                      <div 
                        key={ticket.id} 
                        className="bg-surface-container-lowest border border-surface-container rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-4 group hover:border-primary-container/80 hover:shadow-md transition-all duration-300 w-full"
                      >
                        <div className="flex justify-between items-center bg-surface-container-low p-2 rounded-lg">
                          <span className="font-bold text-[10px] uppercase tracking-wider text-on-surface-variant">
                            {ticket.category}
                          </span>
                          <span className="bg-surface-container-lowest px-2 py-0.5 rounded text-[10px] font-bold text-on-surface">
                            {ticket.matches}
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline py-1">
                          <span className="text-on-surface-variant font-normal text-xs">Total Odds:</span>
                          <span className={`font-bold text-xl ${ticket.isHighOdds ? "text-error" : "text-on-surface"}`}>
                            {ticket.odds}
                          </span>
                        </div>

                        <button 
                          onClick={() => handleCopyCode(ticket.id, category.name, ticket.odds)}
                          className={`w-full font-normal text-xs py-2.5 rounded-lg flex justify-center items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                            isCopied 
                              ? "bg-emerald-500 text-white hover:opacity-100" 
                              : "bg-primary-container text-on-primary-container hover:opacity-90 active:scale-[0.98]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isCopied ? "check" : "content_copy"}
                          </span> 
                          {isCopied ? "Copied!" : "Copy Slip Code"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Support/Donate Call to Action */}
          <section className="bg-surface-container-lowest border-2 border-primary-container/80 hover:border-primary-container rounded-3xl p-6 md:p-12 flex flex-col items-center text-center gap-6 shadow-md relative overflow-hidden transition-all max-w-4xl mx-auto w-full">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-xs shadow-[0_0_20px_rgba(209,255,0,0.4)] z-10">
              <span className="material-symbols-outlined text-3xl text-on-primary-container font-bold">volunteer_activism</span>
            </div>
            
            <h3 className="font-display text-2xl md:text-3xl lg:text-4xl text-on-surface font-bold z-10">Support the Movement</h3>
            <p className="text-sm md:text-base text-on-surface-variant max-w-2xl font-normal z-10 leading-relaxed">
              Your contributions help us maintain top-tier analytics and keep the daily winning codes coming. Donate to the team and keep the momentum going!
            </p>
            
            <div className="flex flex-wrap justify-center gap-sm mt-xs z-10">
              <button 
                onClick={() => setIsDonateModalOpen(true)}
                className="bg-primary-container text-on-primary-container hover:bg-primary-container/90 font-label-lg text-label-lg py-2.5 px-6 rounded-xl flex items-center gap-sm transition-all shadow-md font-normal text-base cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-on-primary-container text-xl">payments</span> 
                Donate via Mobile Money
              </button>
            </div>
          </section>

          {/* Meet the Team */}
          <section className="flex flex-col gap-8 pt-10 md:pt-16 border-t border-surface-container-high" id="meet-the-experts">
            <div className="flex flex-col items-center text-center gap-2 mb-2">
              <span className="bg-primary-container/25 text-[#7d7d7d] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary-container/35">
                ⚡ Analytical Powerhouse
              </span>
              <h3 className="font-display text-3xl md:text-4xl text-on-surface font-extrabold tracking-tight mt-1" style={{ fontSize: '31px' }}>Meet the Experts</h3>
              <p className="text-sm md:text-base text-on-surface-variant max-w-2xl font-medium">
                The analytical minds driving our unmatched accuracy.
              </p>
            </div>

            {/* Custom structured grid based on the uploaded layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto w-full px-4">
              {EXPERTS.map((expert) => {
                return (
                  <div 
                    key={expert.name} 
                    className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden group rounded-none border border-neutral-200/40 dark:border-neutral-800/40 shadow-md cursor-pointer flex flex-col justify-end"
                  >
                    {/* Background Image */}
                    <img 
                      src={expert.img} 
                      alt={expert.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent z-10 transition-all duration-300 group-hover:via-black/55"></div>
                    
                    {/* Overlay content at bottom */}
                    <div className="relative z-20 p-5 flex flex-col text-left">
                      <h4 className="text-lg font-bold text-white leading-tight font-sans tracking-tight">
                        {expert.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-300 font-light mt-0.5 opacity-90">
                        {expert.role}
                      </p>
                      
                      {/* Divider line */}
                      <div className="border-t border-white/20 my-3 w-full"></div>
                      
                      {/* Link row */}
                      <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-300 group-hover:text-[#f3c623] font-medium tracking-wide transition-colors duration-300">
                        <span>LinkedIn</span>
                        <svg className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#f3c623] transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="w-full bg-neutral-950 text-neutral-300 border-t border-neutral-900 pt-16 pb-12 px-4 sm:px-6 md:px-8 mt-auto font-sans">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
            
            {/* Main Footer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              
              {/* Column 1: Brand & Bio */}
              <div className="flex flex-col gap-4">
                <div className="font-display text-xl md:text-2xl text-white font-black uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#f3c623] rounded-sm inline-block"></span>
                  Adaptation Family
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 text-[#f3c623] text-xs font-semibold px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#f3c623] animate-pulse"></span>
                    90K+ TikTok Fans
                  </span>
                </div>
              </div>

              {/* Column 2: Navigation Links */}
              <div className="flex flex-col gap-4">
                <h5 className="text-sm font-bold text-white uppercase tracking-widest border-l-2 border-[#f3c623] pl-2.5">
                  Explore
                </h5>
                <ul className="flex flex-col gap-2.5 text-sm font-medium">
                  <li>
                    <a href="#" className="hover:text-[#f3c623] transition-colors text-neutral-400">Home Dashboard</a>
                  </li>
                  <li>
                    <a href="#predictions" className="hover:text-[#f3c623] transition-colors text-neutral-400">Elite Predictions</a>
                  </li>
                  <li>
                    <a href="#booking-codes" className="hover:text-[#f3c623] transition-colors text-neutral-400">Booking Codes</a>
                  </li>
                  <li>
                    <a onClick={() => setIsJoinModalOpen(true)} className="hover:text-[#f3c623] transition-colors text-neutral-400 cursor-pointer">Join The Family</a>
                  </li>
                </ul>
              </div>

              {/* Column 3: Resources */}
              <div className="flex flex-col gap-4">
                <h5 className="text-sm font-bold text-white uppercase tracking-widest border-l-2 border-[#f3c623] pl-2.5">
                  Resources
                </h5>
                <ul className="flex flex-col gap-2.5 text-sm font-medium">
                  <li>
                    <a className="hover:text-[#f3c623] transition-colors text-neutral-400 cursor-pointer">Privacy Policy</a>
                  </li>
                  <li>
                    <a className="hover:text-[#f3c623] transition-colors text-neutral-400 cursor-pointer">Terms of Service</a>
                  </li>
                </ul>
              </div>

              {/* Column 4: Contact & Disclaimer */}
              <div className="flex flex-col gap-4">
                <h5 className="text-sm font-bold text-white uppercase tracking-widest border-l-2 border-[#f3c623] pl-2.5">
                  Get In Touch
                </h5>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Have partnership proposals, marketing inquiries, or questions? Connect with our administration.
                </p>
              </div>

            </div>



          </div>
        </footer>

      </main>

      {/* Join Community Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsJoinModalOpen(false)}></div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md w-full p-6 shadow-2xl relative z-10 flex flex-col gap-md">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-bold flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary-container bg-on-surface p-1 rounded">send</span>
                Join Adaptation Family
              </h4>
              <button 
                onClick={() => setIsJoinModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-on-surface-variant">
              Get direct notification of accurate slips, strategy discussion, 24/7 analysis, and stay ahead of the game with the ultimate sports analysts network.
            </p>
            <div className="flex flex-col gap-xs mt-xs">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Your Telegram Username / Phone</label>
              <input 
                type="text" 
                placeholder="@username or +233..." 
                className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-sm text-sm focus:outline-none focus:border-on-surface"
              />
            </div>
            <button 
              onClick={() => {
                alert("Awesome! Our support staff will contact you shortly to onboard you into the Adaptation Family elite circle.");
                setIsJoinModalOpen(false);
              }}
              className="w-full bg-primary-container text-on-primary-container font-bold py-3 rounded-xl hover:opacity-90 transition-opacity mt-sm shadow-md"
            >
              Get Instant Access Now
            </button>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {isDonateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDonateModalOpen(false)}></div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md w-full p-6 shadow-2xl relative z-10 flex flex-col gap-md">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-bold flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary-container bg-on-surface p-1 rounded">volunteer_activism</span>
                Donate to the Experts
              </h4>
              <button 
                onClick={() => setIsDonateModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-on-surface-variant">
              Support the free daily tickets, deep statistics systems, and continuous high-octane coverage. Choose your payment method below:
            </p>
            <div className="flex flex-col gap-sm">
              <div className="border border-surface-container-high rounded-xl p-sm flex items-center gap-md hover:bg-surface-container-low transition-all cursor-pointer">
                <span className="material-symbols-outlined text-3xl text-primary-container bg-on-surface p-2 rounded-lg">phone_iphone</span>
                <div className="flex-grow">
                  <div className="font-bold text-sm">Mobile Money Ghana</div>
                  <div className="text-xs text-on-surface-variant">MTN / Telecel / AT Money</div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </div>
              <div className="border border-surface-container-high rounded-xl p-sm flex items-center gap-md hover:bg-surface-container-low transition-all cursor-pointer">
                <span className="material-symbols-outlined text-3xl text-primary-container bg-on-surface p-2 rounded-lg">credit_card</span>
                <div className="flex-grow">
                  <div className="font-bold text-sm">Visa / Mastercard / Card</div>
                  <div className="text-xs text-on-surface-variant">Direct Checkout Portal</div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </div>
            </div>
            <div className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-sm text-xs text-on-primary-container leading-relaxed">
              <strong>Note:</strong> All funds are shared directly with the lead analysts to keep analytical tools up-to-date. Thank you for driving this community forward!
            </div>
            <div className="flex gap-sm mt-xs">
              <button 
                onClick={() => setIsDonateModalOpen(false)}
                className="flex-1 bg-surface-container-high text-on-surface font-bold py-3 rounded-lg hover:bg-surface-container-highest transition-all"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  alert("Thank you for your support! Mobile Money payment process initiated.");
                  setIsDonateModalOpen(false);
                }}
                className="flex-1 bg-primary-container text-on-primary-container font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Proceed Ghana MoMo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy notification Toast indicator */}
      {copiedText && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-on-surface text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-sm animate-bounce">
          <span className="material-symbols-outlined text-primary-container">check_circle</span>
          <span>Slip Code copied: <strong>{copiedText}</strong></span>
        </div>
      )}

    </div>
    </>
  );
}
