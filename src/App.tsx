/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from './firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

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

// Dynamic categories will be declared inside the App component to stay synchronized with localStorage and Admin Dashboard.

const EXPERTS = [
  {
    name: "Sarah Jenkins",
    role: "Lead Football Analyst",
    img: "https://lh3.googleusercontent.com/aida/AP1WRLsrrY2NDvLGASL6GFr5YEXFN7HvnoIssmmhEhRx-af_r9ZPFndvHIpXmfWZl60750iuXz6XleV3WSH_gxAuk2MEhwIXiUKXC6UYOt-bHu5CiOKYijVgwfJXVWGrsvppmzh-PbPcUWxJ3DjkX2JDZmVvTysDoBdDvsWJGYB9ARVRCuPJDS3ooszYufWulMhbSVXKpCS_SakvzwydvxHHQBod2qM_Lo7Up2RGvnTOeLRrryxNm3pBVLaqFw",
    specialty: "EPL & Champions League Specialist",
    icon: "star",
    isFeatured: true
  },
  {
    name: "Marcus Rowe",
    role: "Technical Tipster",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBADRwOSTJsGPecAaPfeH8pQhXbfSbNjmKYmqH63OneQNOMZW_8C43HrP03CAocaPvXcB9cbIUkFRMOS9bsPs6siit0Ik-X6Nw0efVcs-DiQWnmrOHXDNK64GEo_ooB0fZaM1LlBchvs3Bcg4EpHwr4uS0Dv8pn8mH5CL1nfafWKEriFGZptWOgZHLgkwKs0LA_bmipjBTZaMx4kX7WaRem6tofZMWL0tOCRoqZkIH21rdXqADl0Fym-enutX_r3QCg7vewhfFoxA",
    specialty: "Adaptation Family",
    icon: "trending_up"
  },
  {
    name: "Elena Rostova",
    role: "Market Strategist",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8nHzRcISqObDhfIDZMcLp23AdrbkQFHkLUqgAJXrCVkcjvTBUeRJ3urccrWZwWu0Zx4e__AmNiwxhfM3QPFtIp1LOXjdoYdz_GOMOr-R4Igs1TD9saXoE7Sl5-CGUZ7hP2FpkfoaJC6400AZP0JyxhauuJKq8E2G_Sl26fGnoo6MoXfftM2KNMozrDB56SM2_2Z7paeJ8XBXPQynPDGrl9Q1RAuxTe-egyOPhP_QJEg8EXcTOSy9lOnSakhPgpxsMAPixLyNzKQ",
    specialty: "Asian Handicap",
    icon: "monitoring"
  },
  {
    name: "Chloe Adams",
    role: "Quantitative Analyst",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuACs2OrVkiuHYGkrtgjAwAAi3mosxLICe3utAXKDuAh80C5Y1vBROfq-u5fRg12RL7Aj9Lbq8zWiLGjH37EqV0-a3c4XuugdDcAYwsp9cptx0iVEb5qqKzdYqhICglhMA_pOgq4rndABLyF8enacAeTj9U0O6VImCLgTvOMxWgj9oOkUKV7v_pHbkZ152tDgl3aOQkleO07kZHwRz3PWDBjabB7gJFk10KW5uIC-n21pYCEHv4O6UgLMvp0l77NeYT85f8GFwbr1A",
    specialty: "Adaptation Family",
    icon: "calculate"
  },
  {
    name: "David Thorne",
    role: "Player Prop Specialist",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDW2KwXsADnAN51V-Kni9s5R8cfEKgG-ZY-UZLNcjahwC-BZLStAiJMEoALolgRKTvllddslvd4dnD62RV4d852Gb1ZpyjAjdE006-n_rZe4LRCqJHZ0A3hqEesE6dpBhOCAB5cZ7WF7gVFlslyHdzZgi3GgtyybCBu8oFPM0xIfex6W_tz_GfjP-Ba-uzg6ecet8KlGYWe42d4DULDYPDpcTCs8pL9zt4PpcsHXHGaJst4OzhedAHvMVKp6R_ayOmwQfWpMJ3Uig",
    specialty: "Adaptation Family",
    icon: "person_play"
  },
  {
    name: "Carlos Mendez",
    role: "Underdog Scout",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYFlxGxb9as179x43ojZEWU5a8apUG2vBWsUGauyM9pDAHJuxHKcBiYQRYYeYV-9iPBCrKjBcmx_Cb8eeaWZ54Ail3xR5Y0eoxNzmh5eiwcHGetjy9YZx9AWNVT9ZFRQfmla4fwXluqpwoNjjSxbOrih5mf4UpC-DXpaVHyeXQBRvwEXQkNI4rLY8plNt_TDQ0U35iAbC7zJWwefPB5xr8E8c3w0SZBtnRbf8f6l50qGjT_bIz_YSITnI_wFtsPZJBmrk_qAb0iQ",
    specialty: "Adaptation Family",
    icon: "bolt"
  },
  {
    name: "Alex Rivera",
    role: "Performance Specialist",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoaK-f6RqMYHQhKlG3xamLuj7YjwX4f2pFiCgGLcNAKyzuJy4T2Ma-RM9ls_jDszwrv83_Ec6BJlPCJzkpmZvw5pQAVdUKuRG7XOKyLHoivQ0qugsBUpAPAjuduE2mRtTaJhXIzjUQXQzd7wK_EnjPjZO5xROtvAiHpJGj_lNT22e7XiF0hEkYD8diFz9oV6RBZCqBL5lHsyR6lN0OdzrnbFqwYPanTIqcYuBbMC7Eu_FN0Iy5K0Hj7gTxrlJmUEi3UcxJ0ZGl_w",
    specialty: "Data-Driven Insights",
    icon: "analytics"
  }
];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'booking-codes' | 'team' | 'donate' | 'privacy' | 'terms' | 'login' | 'admin-dashboard'>('home');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('All');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [donationCopiedText, setDonationCopiedText] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedExpertIndex, setSelectedExpertIndex] = useState<number>(0);
  const [showDate, setShowDate] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [formattedDate, setFormattedDate] = useState('');
  const [oddsSortOrder, setOddsSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [logoClickCount, setLogoClickCount] = useState(0);

  // Synchronized payment settings
  const [momoAccountName, setMomoAccountName] = useState(() => localStorage.getItem("momo_account_name") || "ADAPTATION FAMILY");
  const [momoNumber, setMomoNumber] = useState(() => localStorage.getItem("momo_number") || "055 776 5432");
  const [momoReference, setMomoReference] = useState(() => localStorage.getItem("momo_reference") || "ADAPT FAMILY");

  // Bank details
  const [bankName, setBankName] = useState(() => localStorage.getItem("bank_name") || "Ecobank Ghana");
  const [bankAccountNumber, setBankAccountNumber] = useState(() => localStorage.getItem("bank_account_number") || "1441002345678");
  const [bankAccountHolder, setBankAccountHolder] = useState(() => localStorage.getItem("bank_account_holder") || "ADAPTATION FAMILY");
  const [bankBranch, setBankBranch] = useState(() => localStorage.getItem("bank_branch") || "Accra Mall Branch");

  const [publicTeamMembers, setPublicTeamMembers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [slips, setSlips] = useState<any[]>([]);

  // Compute dynamic CATEGORIES structure to match original template expectation and adapt to live changes
  const CATEGORIES: Category[] = categories.map(cat => {
    const ticketsForCat = slips
      .filter(s => s.category === cat.name)
      .map(s => ({
        id: s.id,
        category: s.category,
        matches: typeof s.matches === 'number' ? `${s.matches} Matches` : s.matches,
        odds: s.odds,
        bookingCode: s.bookingCode || `AF-${cat.name.substring(0,3).toUpperCase()}-${s.odds.replace('.', '')}`,
        isHighOdds: parseFloat(s.odds) >= 100
      }));
    return {
      name: cat.name,
      icon: cat.icon || "receipt_long",
      matches: ticketsForCat.length > 0 ? ticketsForCat[0].matches : "0 Matches",
      tickets: ticketsForCat,
      status: cat.status || "Active"
    };
  }).filter(cat => cat.status === "Active");

  useEffect(() => {
    // 1. Instantly load offline/local storage fallbacks for immediate responsiveness
    setMomoAccountName(localStorage.getItem("momo_account_name") || "ADAPTATION FAMILY");
    setMomoNumber(localStorage.getItem("momo_number") || "055 776 5432");
    setMomoReference(localStorage.getItem("momo_reference") || "ADAPT FAMILY");
    setBankName(localStorage.getItem("bank_name") || "Ecobank Ghana");
    setBankAccountNumber(localStorage.getItem("bank_account_number") || "1441002345678");
    setBankAccountHolder(localStorage.getItem("bank_account_holder") || "ADAPTATION FAMILY");
    setBankBranch(localStorage.getItem("bank_branch") || "Accra Mall Branch");

    const localCats = localStorage.getItem("adaptation_slip_categories");
    if (localCats) {
      try { setCategories(JSON.parse(localCats)); } catch (e) {}
    } else {
      const defaultCats = [
        { id: "1", name: "World Cup", icon: "sports_soccer", status: "Active" },
        { id: "2", name: "Bet Builder", icon: "construction", status: "Active" },
        { id: "3", name: "Roll Over", icon: "cached", status: "Active" },
        { id: "4", name: "1 Cedi and a Dream", icon: "payments", status: "Active" },
        { id: "5", name: "Beticology", icon: "psychology", status: "Active" },
        { id: "6", name: "General / Long Bets", icon: "hourglass_empty", status: "Active" },
        { id: "7", name: "Engine Room", icon: "settings", status: "Active" }
      ];
      setCategories(defaultCats);
      localStorage.setItem("adaptation_slip_categories", JSON.stringify(defaultCats));
    }

    const localSlips = localStorage.getItem("adaptation_slips_list");
    if (localSlips) {
      try { setSlips(JSON.parse(localSlips)); } catch (e) {}
    } else {
      const defaultSlips = [
        { id: "wc-1", category: "World Cup", matches: "9 Matches", odds: "12.40", bookingCode: "AF-WOR-1240", dateUploaded: "Jun 30, 2026" },
        { id: "wc-2", category: "World Cup", matches: "9 Matches", odds: "13.40", bookingCode: "AF-WOR-1340", dateUploaded: "Jun 30, 2026" },
        { id: "wc-3", category: "World Cup", matches: "9 Matches", odds: "14.40", bookingCode: "AF-WOR-1440", dateUploaded: "Jun 30, 2026" },
        { id: "wc-4", category: "World Cup", matches: "9 Matches", odds: "15.40", bookingCode: "AF-WOR-1540", dateUploaded: "Jun 30, 2026" },
        { id: "wc-5", category: "World Cup", matches: "9 Matches", odds: "16.40", bookingCode: "AF-WOR-1640", dateUploaded: "Jun 30, 2026" }
      ];
      setSlips(defaultSlips);
      localStorage.setItem("adaptation_slips_list", JSON.stringify(defaultSlips));
    }

    const localTeam = localStorage.getItem("adaptation_team_members");
    if (localTeam) {
      try { setPublicTeamMembers(JSON.parse(localTeam)); } catch (e) {}
    } else {
      const defaultTeam = [
        { id: "1", name: "Alex Rivera", role: "Head Strategist", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCmiZUJxcfA2HLcC3ksPOmZ9iFilcu9VxwM1cEZQ0dDxRaMc9wh2q2HXOYnGMZUnKxIIMsgZwWxLuTSTbZU9663BX7vzGD0qa4CBV4oeNR-Q-QyjXLVvnUwzCa3CE13tYbIjRaHWMgyZPbIuo9VC2ipzI3jo8acV4pt47p8zoE4BOfn2fHL5CTVtT0yQlB7ihuN6w5QDziNla4OLDwud_8PPNUYhG7S7tHZoKlnwtfLxn13-CAKb6RUaaZfii5cER2IlC97pGzR2Q" },
        { id: "2", name: "Sarah Chen", role: "Betting Analyst", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCyYp7hzyLNJ48AOfaeEBhlHcqZ67PjXLmLQtiNv69fvyB7ovUvq7wfgIctAQpDgp5os_G7ahOPk-nRwMwN0_b-kmleasMXVxcLrXwZWriqmea3bRcJ9DHmKkEznGZd9gG4hFvx9KvMNGklh1sw5KtuEHyg_5-pGtoZVXmUTivK15iEsltP6pkphhR9AFw8P6sSE5ShXhypOiSINjJN7JtxiunqhNQ6ptWAedCeKsVBu3f3xp43-CkhLtf4mhMhCBtZJ8QtDQiLQ" }
      ];
      setPublicTeamMembers(defaultTeam);
      localStorage.setItem("adaptation_team_members", JSON.stringify(defaultTeam));
    }

    // 2. Setup real-time listeners to Firestore for live data synchronization
    const unsubCats = onSnapshot(collection(db, "categories"), (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setCategories(list);
        localStorage.setItem("adaptation_slip_categories", JSON.stringify(list));
      }
    }, (err) => console.log("Firestore loaded offline/cached values", err));

    const unsubSlips = onSnapshot(collection(db, "slips"), (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setSlips(list);
        localStorage.setItem("adaptation_slips_list", JSON.stringify(list));
      }
    }, (err) => console.log("Firestore loaded offline/cached values", err));

    const unsubTeam = onSnapshot(collection(db, "team_members"), (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setPublicTeamMembers(list);
        localStorage.setItem("adaptation_team_members", JSON.stringify(list));
      }
    }, (err) => console.log("Firestore loaded offline/cached values", err));

    const unsubPayments = onSnapshot(doc(db, "payment_settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMomoAccountName(data.momoAccountName || "ADAPTATION FAMILY");
        setMomoNumber(data.momoNumber || "055 776 5432");
        setMomoReference(data.momoReference || "ADAPT FAMILY");
        setBankName(data.bankName || "Ecobank Ghana");
        setBankAccountNumber(data.bankAccountNumber || "1441002345678");
        setBankAccountHolder(data.bankAccountHolder || "ADAPTATION FAMILY");
        setBankBranch(data.bankBranch || "Accra Mall Branch");
        
        localStorage.setItem("momo_account_name", data.momoAccountName || "ADAPTATION FAMILY");
        localStorage.setItem("momo_number", data.momoNumber || "055 776 5432");
        localStorage.setItem("momo_reference", data.momoReference || "ADAPT FAMILY");
        localStorage.setItem("bank_name", data.bankName || "Ecobank Ghana");
        localStorage.setItem("bank_account_number", data.bankAccountNumber || "1441002345678");
        localStorage.setItem("bank_account_holder", data.bankAccountHolder || "ADAPTATION FAMILY");
        localStorage.setItem("bank_branch", data.bankBranch || "Accra Mall Branch");
      }
    }, (err) => console.log("Firestore loaded offline/cached values", err));

    return () => {
      unsubCats();
      unsubSlips();
      unsubTeam();
      unsubPayments();
    };
  }, [activeView]);

  const handleLogoClick = () => {
    setLogoClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 4) {
        setActiveView('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return 0;
      }
      return newCount;
    });
  };



  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Format: e.g. "Saturday, June 27, 2026"
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setFormattedDate(new Date().toLocaleDateString('en-US', options));

    const handleScroll = () => {
      if (window.scrollY < 50) {
        setShowDate(true);
        setIsAtTop(true);
      } else {
        setShowDate(false);
        setIsAtTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
                  className="loader-title font-display text-lg sm:text-xl text-neutral-900 uppercase tracking-wider"
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
                  className="loader-subtitle text-[10px] sm:text-xs text-neutral-500 tracking-widest uppercase mt-1"
                >
                  Loading Daily Destination...
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-surface text-on-surface antialiased flex">
      
      {activeView !== 'login' && activeView !== 'admin-dashboard' && (
        <>
          {/* Top Navigation Bar (Unified Desktop & Mobile) */}
          <header className="w-full fixed top-0 left-0 right-0 h-16 z-50 bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant shadow-sm px-4 sm:px-6 md:px-8 flex items-center justify-center">
        <div className="w-full max-w-5xl flex items-center justify-between">
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm border border-outline-variant">
              <img
                src="https://res.cloudinary.com/dslngzls6/image/upload/v1782495960/photo_2026-06-26_08-47-00_avg1go.jpg"
                alt="Adaptation Family Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-on-surface leading-none tracking-tight font-display portrait-header-title" style={{ fontSize: '16px' }}>Adaptation Family</h1>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <a 
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 hover:text-primary-container transition-colors text-xs lg:text-sm cursor-pointer ${
                activeView === 'home' ? 'text-on-surface font-extrabold border-b-2 border-primary-container pb-0.5' : 'text-on-surface-variant font-normal'
              }`}
            >
              <span>Home</span>
            </a>
            
            <a 
              onClick={() => {
                setActiveView('booking-codes');
                setSelectedCategoryTab('All');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 hover:text-primary-container transition-colors text-xs lg:text-sm cursor-pointer ${
                activeView === 'booking-codes' ? 'text-on-surface font-extrabold border-b-2 border-primary-container pb-0.5' : 'text-on-surface-variant font-normal'
              }`}
            >
              <span>Booking Codes</span>
            </a>

             <a 
              onClick={() => {
                setActiveView('team');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 hover:text-primary-container transition-colors text-xs lg:text-sm cursor-pointer ${
                activeView === 'team' ? 'text-on-surface font-extrabold border-b-2 border-primary-container pb-0.5' : 'text-on-surface-variant font-normal'
              }`}
            >
              <span>Meet Our Team</span>
            </a>

            <a 
              onClick={() => {
                setActiveView('donate');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 hover:text-primary-container transition-colors text-xs lg:text-sm cursor-pointer ${
                activeView === 'donate' ? 'text-on-surface font-extrabold border-b-2 border-primary-container pb-0.5' : 'text-on-surface-variant font-normal'
              }`}
            >
              <span>Donate</span>
            </a>

            <motion.button 
              onClick={() => setIsJoinModalOpen(true)}
              whileHover={{ 
                scale: 1.05,
                rotate: [0, -1, 1, -1, 1, 0],
                transition: { duration: 0.3 }
              }}
              className="bg-primary-container text-on-primary-container font-normal text-xs lg:text-sm py-2 px-4 rounded-xl hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-1.5 shadow-sm"
            >
              Join Community
            </motion.button>
          </div>

          {/* Mobile Navigation Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => {
                setActiveView('donate');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-[11px] px-3 py-1.5 rounded-full uppercase tracking-wider font-extrabold shadow-sm hover:opacity-90 active:scale-95 transition-all portrait-donate-btn ${
                activeView === 'donate' ? 'bg-on-surface text-primary-container' : 'bg-primary-container text-on-primary-container'
              }`}
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant">
                  <img
                    src="https://res.cloudinary.com/dslngzls6/image/upload/v1782495960/photo_2026-06-26_08-47-00_avg1go.jpg"
                    alt="Adaptation Family Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="font-display text-sm font-bold text-on-surface tracking-tight">Navigation</span>
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
                  setActiveView('home');
                  setIsMobileNavOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-sm p-3 hover:bg-primary-container/10 hover:text-on-primary-container rounded-xl transition-all duration-200 cursor-pointer text-sm ${
                  activeView === 'home' ? 'bg-primary-container/10 text-on-primary-container font-extrabold' : 'text-on-surface-variant font-semibold'
                }`}
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
                <span className={`font-label-lg ${activeView === 'home' ? 'font-bold' : 'font-normal'}`}>Home</span>
              </a>
              
              <a 
                onClick={() => {
                  setActiveView('booking-codes');
                  setSelectedCategoryTab('All');
                  setIsMobileNavOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-sm p-3 hover:bg-primary-container/10 hover:text-on-primary-container rounded-xl transition-all duration-200 cursor-pointer text-sm ${
                  activeView === 'booking-codes' ? 'bg-primary-container/10 text-on-primary-container font-extrabold' : 'text-on-surface-variant font-semibold'
                }`}
              >
                <span className="material-symbols-outlined text-lg">confirmation_number</span>
                <span className={`font-label-lg ${activeView === 'booking-codes' ? 'font-bold' : 'font-normal'}`}>Booking Codes</span>
              </a>

              <a 
                onClick={() => {
                  setActiveView('team');
                  setIsMobileNavOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-sm p-3 hover:bg-primary-container/10 hover:text-on-primary-container rounded-xl transition-all duration-200 cursor-pointer text-sm ${
                  activeView === 'team' ? 'bg-primary-container/10 text-on-primary-container font-extrabold' : 'text-on-surface-variant font-semibold'
                }`}
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: activeView === 'team' ? '"FILL" 1' : '' }}>groups</span>
                <span className={`font-label-lg ${activeView === 'team' ? 'font-bold' : 'font-normal'}`}>Meet Our Team</span>
              </a>

              <a 
                onClick={() => {
                  setActiveView('donate');
                  setIsMobileNavOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-sm p-3 hover:bg-primary-container/10 hover:text-on-primary-container rounded-xl transition-all duration-200 cursor-pointer text-sm ${
                  activeView === 'donate' ? 'bg-primary-container/10 text-on-primary-container font-extrabold' : 'text-on-surface-variant font-semibold'
                }`}
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: activeView === 'donate' ? '"FILL" 1' : '' }}>volunteer_activism</span>
                <span className={`font-label-lg ${activeView === 'donate' ? 'font-bold' : 'font-normal'}`}>Support / Donate</span>
              </a>

              <a 
                onClick={() => {
                  setActiveView('privacy');
                  setIsMobileNavOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-sm p-3 hover:bg-primary-container/10 hover:text-on-primary-container rounded-xl transition-all duration-200 cursor-pointer text-sm ${
                  activeView === 'privacy' ? 'bg-primary-container/10 text-on-primary-container font-extrabold' : 'text-on-surface-variant font-semibold'
                }`}
              >
                <span className="material-symbols-outlined text-lg">gavel</span>
                <span className={`font-label-lg ${activeView === 'privacy' ? 'font-bold' : 'font-normal'}`}>Privacy Policy</span>
              </a>

              <a 
                onClick={() => {
                  setActiveView('terms');
                  setIsMobileNavOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-sm p-3 hover:bg-primary-container/10 hover:text-on-primary-container rounded-xl transition-all duration-200 cursor-pointer text-sm ${
                  activeView === 'terms' ? 'bg-primary-container/10 text-on-primary-container font-extrabold' : 'text-on-surface-variant font-semibold'
                }`}
              >
                <span className="material-symbols-outlined text-lg">description</span>
                <span className={`font-label-lg ${activeView === 'terms' ? 'font-bold' : 'font-normal'}`}>Terms of Service</span>
              </a>


            </div>

            <div className="flex flex-col gap-sm pt-4 border-t border-outline-variant">
              <button 
                onClick={() => {
                  setIsJoinModalOpen(true);
                  setIsMobileNavOpen(false);
                }}
                className="w-full bg-primary-container text-on-primary-container font-label-lg text-label-lg py-3 px-4 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-xs shadow-md font-normal cursor-pointer"
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
        </>
      )}

      {/* Main Content Canvas */}
      <main className={`w-full min-h-screen flex flex-col bg-surface-bright ${(activeView === 'login' || activeView === 'admin-dashboard') ? '' : 'pt-16'}`}>
        
        {activeView === 'home' && (
          <>
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

                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight max-w-4xl drop-shadow-lg portrait-hero-title" style={{ fontSize: '49px' }}>
                  Your Daily Destination for <br />
                  <span className="text-black bg-primary-container px-3 py-1 rounded-lg border-0 inline-block mt-2 shadow-xl transform -rotate-1 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold portrait-hero-span">
                    Winning Bet Slips
                  </span>
                </h2>

                <div className="flex flex-col gap-4 max-w-3xl">
                  <p className="text-sm sm:text-base md:text-lg text-white/95 font-normal leading-relaxed drop-shadow-md portrait-hero-desc">
                    Welcome to the official <span className="font-bold text-white">Adaptation Family</span> website, a rapidly growing and highly engaged global Sports Betting Community! Born on TikTok, our platform brings together a passionate audience of over <span className="font-bold text-[#f3c623] bg-white/10 px-2 py-0.5 rounded-md border border-white/10">90,000 followers</span> and millions of viewers who love sports, trending entertainment, and impactful cultural content.
                  </p>
                </div>

                <div className="mx-auto flex flex-row justify-center items-stretch gap-2 mt-6 w-full max-w-lg px-2">
                  <div className="flex-1 bg-white/10 backdrop-blur-md p-2.5 sm:p-4 rounded-xl border border-white/20 shadow-lg flex flex-col items-center justify-center text-white">
                    <span className="stat-value-text text-base sm:text-2xl font-extrabold drop-shadow-md">85%</span>
                    <span className="stat-label-text text-[9px] sm:text-xs text-white/85 uppercase font-bold tracking-wider text-center mt-1 leading-none">Win Rate</span>
                  </div>
                  <div className="flex-1 bg-white/10 backdrop-blur-md p-2.5 sm:p-4 rounded-xl border border-white/20 shadow-lg flex flex-col items-center justify-center text-white">
                    <span className="stat-value-text text-base sm:text-2xl font-extrabold drop-shadow-md">90K+</span>
                    <span className="stat-label-text text-[9px] sm:text-xs text-white/85 uppercase font-bold tracking-wider text-center mt-1 leading-none">Followers</span>
                  </div>
                  <div className="flex-1 bg-white/10 backdrop-blur-md p-2.5 sm:p-4 rounded-xl border border-white/20 shadow-lg flex flex-col items-center justify-center text-white">
                    <span className="stat-value-text text-base sm:text-2xl font-extrabold drop-shadow-md">24/7</span>
                    <span className="stat-label-text text-[9px] sm:text-xs text-white/85 uppercase font-bold tracking-wider text-center mt-1 leading-none">Analysis</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Container for max-width content */}
            <div id="booking-codes" className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-10 md:py-16 flex flex-col gap-10 md:gap-16">
              
              {/* Booking Codes Restructuring (7 Categories) */}
              <div className="flex flex-col gap-10 md:gap-16">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-on-surface font-bold leading-tight border-b-4 border-primary-container inline-block pb-2 mb-2 portrait-booking-title" style={{ fontSize: '32px' }}>
                    Exclusive Booking Codes
                  </h2>
                  <p className="text-sm sm:text-base text-on-surface-variant font-normal">
                    Access our specialized betting categories for maximum returns.
                  </p>
                </div>

                {CATEGORIES.map((category) => (
                  <section key={category.name} className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b-2 border-surface-container pb-2">
                      <h3 className="text-base sm:text-lg md:text-xl text-on-surface font-bold flex items-center gap-2 portrait-category-title" style={{ fontSize: '18px' }}>
                        <span className="material-symbols-outlined text-primary-container bg-black p-1 rounded text-lg sm:text-xl">
                          {category.icon}
                        </span>
                        {category.name}
                      </h3>
                      <button 
                        onClick={() => {
                          setActiveView('booking-codes');
                          setSelectedCategoryTab(category.name);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="hidden sm:block portrait-hide text-xs sm:text-sm text-on-surface-variant hover:text-primary-container transition-colors font-normal uppercase tracking-wider portrait-view-more-btn cursor-pointer"
                      >
                        View More →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4 px-1 py-1">
                      {category.tickets.map((ticket) => {
                        const isCopied = !!copiedStates[ticket.id];
                        return (
                          <div 
                            key={ticket.id} 
                            className="bg-surface-container-lowest border border-surface-container rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-sm flex flex-col justify-between gap-3 sm:gap-4 group hover:border-primary-container/80 hover:shadow-md transition-all duration-300 w-full"
                          >
                            <div className="flex justify-between items-center bg-surface-container-low p-2 rounded-lg gap-1">
                              <span className="font-bold text-[9px] sm:text-[10px] uppercase tracking-wider text-on-surface-variant truncate">
                                {ticket.category}
                              </span>
                              <span className="bg-surface-container-lowest px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold text-on-surface flex-shrink-0">
                                {ticket.matches}
                              </span>
                            </div>

                            <div className="border border-dashed border-outline-variant bg-surface-container-low/50 rounded-lg py-2 px-1 text-center select-all">
                              <span className="slip-code-text text-on-surface tracking-wider">
                                {generateSlipCode(ticket.id, category.name, ticket.odds)}
                              </span>
                            </div>

                            <div className="flex justify-between items-baseline py-0.5 sm:py-1">
                              <span className="text-on-surface-variant font-normal text-[10px] sm:text-xs">Total Odds:</span>
                              <span className={`font-bold text-base sm:text-xl ${ticket.isHighOdds ? "text-error" : "text-on-surface"}`}>
                                {ticket.odds}
                              </span>
                            </div>

                            <button 
                              onClick={() => handleCopyCode(ticket.id, category.name, ticket.odds)}
                              className={`w-full font-normal text-[10px] sm:text-xs py-2 sm:py-2.5 rounded-lg flex justify-center items-center gap-1 transition-all shadow-sm cursor-pointer ${
                                isCopied 
                                  ? "bg-emerald-500 text-white hover:opacity-100" 
                                  : "bg-primary-container text-on-primary-container hover:opacity-90 active:scale-[0.98]"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                                {isCopied ? "check" : "content_copy"}
                              </span> 
                              {isCopied ? "Copied!" : "Copy Slip"}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile/Portrait view: View More button placed after the last card */}
                    <div className="hidden portrait-show-block mt-2">
                      <button 
                        onClick={() => {
                          setActiveView('booking-codes');
                          setSelectedCategoryTab(category.name);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full py-2.5 bg-surface-container-low hover:bg-surface-container-high text-on-surface hover:text-primary-container font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all border border-surface-container text-center flex justify-center items-center gap-1.5 portrait-view-more-btn cursor-pointer"
                      >
                        View More {category.name} →
                      </button>
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
                    onClick={() => {
                      setActiveView('donate');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
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
                  <span className="bg-primary-container/25 text-[#7d7d7d] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary-container/35 portrait-analytical-span">
                    ⚡ Engine Room
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl text-on-surface font-extrabold tracking-tight mt-1 portrait-experts-title" style={{ fontSize: '36px' }}>Meet the Experts</h3>
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>
          </>
        )}

        {activeView === 'booking-codes' && (
          <div className="w-full flex flex-col bg-surface-bright pb-16 animate-in fade-in duration-300">
            {/* Header section designed to match colors, fonts, sizing */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 pt-8 md:pt-12 flex flex-col gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-on-surface font-extrabold tracking-tight mt-3 mb-2" style={{ fontSize: '38px' }}>
                  Exclusive Booking Codes
                </h2>
                <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl font-normal">
                  Access all our analytical sports betting categories. Select a category below to filter our high-octane premium slips.
                </p>
              </div>
            </div>

            {/* Sticky subheader Category Filter Chips bar */}
            <div className={`sticky-category-bar w-full bg-surface-bright/90 sticky top-16 z-40 border-b border-outline-variant py-4 px-4 sm:px-6 md:px-8 backdrop-blur-md mt-6 ${
              isAtTop ? 'is-at-top' : 'is-scrolled'
            }`}>
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
                  <div 
                    className="category-chips-container flex flex-wrap items-center justify-center bg-surface-container-low border border-surface-container rounded-2xl md:rounded-full p-2 md:p-1 shadow-sm gap-2 md:gap-1 max-w-full mx-auto"
                  >
                    <button 
                      onClick={() => setSelectedCategoryTab('All')}
                      className={`px-5 py-2 rounded-full font-sans text-xs sm:text-sm tracking-wide transition-all duration-300 cursor-pointer ${
                        selectedCategoryTab === 'All' 
                          ? "bg-primary-container text-on-primary-container font-bold shadow-md" 
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-normal"
                      }`}
                    >
                      All Categories
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button 
                        key={cat.name}
                        onClick={() => setSelectedCategoryTab(cat.name)}
                        className={`px-5 py-2 rounded-full font-sans text-xs sm:text-sm tracking-wide whitespace-nowrap transition-all duration-300 cursor-pointer ${
                          selectedCategoryTab === cat.name 
                            ? "bg-primary-container text-on-primary-container font-bold shadow-md" 
                            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-normal"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sorting Dropdown */}
                <div className="flex items-center gap-2.5 bg-surface-container-low border border-surface-container rounded-xl sm:rounded-full px-4 py-2 shadow-sm w-full md:w-auto justify-between md:justify-start">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">sort</span>
                    <label htmlFor="odds-sort-select" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">
                      Sort Odds:
                    </label>
                  </div>
                  <select
                    id="odds-sort-select"
                    value={oddsSortOrder}
                    onChange={(e) => setOddsSortOrder(e.target.value as 'default' | 'asc' | 'desc')}
                    className="bg-transparent text-on-surface text-xs sm:text-sm font-bold outline-none cursor-pointer pr-1"
                  >
                    <option value="default" className="bg-surface-bright text-on-surface">Default</option>
                    <option value="asc" className="bg-surface-bright text-on-surface">Low → High</option>
                    <option value="desc" className="bg-surface-bright text-on-surface">High → Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Categories list grids (showing all 5 tickets per category) */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-8 md:py-12 flex flex-col gap-10 md:gap-16">
              <div className="flex flex-col gap-10 md:gap-16">
                {CATEGORIES
                  .filter((category) => selectedCategoryTab === 'All' || category.name === selectedCategoryTab)
                  .map((category) => (
                    <section key={category.name} className="flex flex-col gap-5 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center border-b-2 border-surface-container pb-2">
                        <h3 className="text-base sm:text-lg md:text-xl text-on-surface font-extrabold flex items-center gap-2 portrait-category-title" style={{ fontSize: '21px' }}>
                          <span className="material-symbols-outlined text-primary-container bg-black p-1.5 rounded-lg text-lg sm:text-xl shadow-md">
                            {category.icon}
                          </span>
                          {category.name}
                        </h3>
                        <span className="bg-surface-container-low border border-surface-container px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant">
                          {category.tickets.length} Slips Available
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 px-1 py-1">
                        {(() => {
                          const sortedTickets = [...category.tickets];
                          if (oddsSortOrder === 'asc') {
                            sortedTickets.sort((a, b) => parseFloat(a.odds) - parseFloat(b.odds));
                          } else if (oddsSortOrder === 'desc') {
                            sortedTickets.sort((a, b) => parseFloat(b.odds) - parseFloat(a.odds));
                          }
                          return sortedTickets.map((ticket) => {
                            const isCopied = !!copiedStates[ticket.id];
                            return (
                              <div 
                                key={ticket.id} 
                                className="bg-surface-container-lowest border border-surface-container rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col justify-between gap-3 sm:gap-4 group hover:border-primary-container/80 hover:shadow-md transition-all duration-300 w-full"
                              >
                                <div className="flex justify-between items-center bg-surface-container-low p-2 rounded-lg gap-1">
                                  <span className="font-bold text-[9px] sm:text-[10px] uppercase tracking-wider text-on-surface-variant truncate">
                                    {ticket.category}
                                  </span>
                                  <span className="bg-surface-container-lowest px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold text-on-surface flex-shrink-0">
                                    {ticket.matches}
                                  </span>
                                </div>

                                <div className="border border-dashed border-outline-variant bg-surface-container-low/50 rounded-lg py-2.5 px-1.5 text-center select-all">
                                  <span className="slip-code-text text-on-surface tracking-wider">
                                    {generateSlipCode(ticket.id, category.name, ticket.odds)}
                                  </span>
                                </div>

                                <div className="flex justify-between items-baseline py-0.5 sm:py-1">
                                  <span className="text-on-surface-variant font-normal text-[10px] sm:text-xs">Total Odds:</span>
                                  <span className={`font-bold text-base sm:text-xl ${ticket.isHighOdds ? "text-error" : "text-on-surface"}`}>
                                    {ticket.odds}
                                  </span>
                                </div>

                                <button 
                                  onClick={() => handleCopyCode(ticket.id, category.name, ticket.odds)}
                                  className={`w-full font-normal text-[10px] sm:text-xs py-2 sm:py-2.5 rounded-lg flex justify-center items-center gap-1 transition-all shadow-sm cursor-pointer ${
                                    isCopied 
                                      ? "bg-emerald-500 text-white hover:opacity-100" 
                                      : "bg-primary-container text-on-primary-container hover:opacity-90 active:scale-[0.98]"
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                                    {isCopied ? "check" : "content_copy"}
                                  </span> 
                                  {isCopied ? "Copied!" : "Copy Slip"}
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </section>
                  ))}
              </div>

              {/* Back to Home Button */}
              <div className="flex justify-center mt-12">
                <button 
                  onClick={() => {
                    setActiveView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 font-normal text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  BACK TO HOME
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'team' && (
          <div className="w-full flex flex-col bg-surface-bright pb-16 animate-in fade-in duration-300">
            {/* Hero Section */}
            <section className="py-12 md:py-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto text-center relative overflow-hidden w-full mt-4">
              <div className="absolute inset-0 bg-surface-container-low -z-10 rounded-[3rem] opacity-50 transform -skew-y-2 scale-105"></div>
              <div className="max-w-3xl mx-auto flex flex-col items-center gap-4 relative z-10">
                <div className="inline-flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full mb-2 border border-outline-variant/30">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">THE ENGINE ROOM</span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-on-surface font-extrabold tracking-tight leading-tight">
                  THE TEAM <br />
                  <span className="text-white bg-on-surface px-4 py-1.5 leading-tight inline-block transform -skew-x-6 mt-3 text-2xl sm:text-3xl md:text-4xl font-black">
                    Unmatched Experts
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl font-normal mt-2">
                  The elite minds driving our high-octane sports analysis and predictions. Under the hood of the Adaptation Family.
                </p>
              </div>
            </section>

            {/* Team Grid */}
            <section className="py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {publicTeamMembers.length > 0 ? (
                  <>
                    {/* Lead Profile (Spans 2x2 on LG) */}
                    {(() => {
                      const lead = publicTeamMembers[0];
                      return (
                        <div className="group relative bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col lg:col-span-2 lg:row-span-2 w-full">
                          <div className="w-full relative aspect-square overflow-hidden bg-surface-container-low">
                            <img 
                              alt={lead.name} 
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" 
                              src={lead.image}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          </div>
                          <div className="p-6 md:p-8 flex-grow flex flex-col bg-surface-container-lowest relative">
                            <div className="w-1.5 h-12 bg-primary-container absolute left-0 top-6 md:top-8"></div>
                            <span className="inline-block bg-surface-container-low text-on-surface-variant text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
                              {lead.role}
                            </span>
                            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface mb-2">
                              {lead.name}
                            </h3>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Other team profiles */}
                    {publicTeamMembers.slice(1).map((expert) => (
                      <div 
                        key={expert.id}
                        className="group relative bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col w-full"
                      >
                        <div className="w-full relative aspect-square overflow-hidden bg-surface-container-low">
                          <img 
                            alt={expert.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" 
                            src={expert.image}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
                            }}
                          />
                        </div>
                        <div className="p-5 flex-grow flex flex-col bg-surface-container-lowest relative">
                          <div className="w-1.5 h-12 bg-primary-container absolute left-0 top-5"></div>
                          <span className="inline-block bg-surface-container-low text-on-surface-variant text-[11px] font-bold px-3 py-1 rounded-full w-fit mb-3">
                            {expert.role}
                          </span>
                          <h3 className="font-display text-lg sm:text-xl font-extrabold text-on-surface mb-2">
                            {expert.name}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-on-surface-variant text-center col-span-full">No team members defined yet.</p>
                )}
              </div>
            </section>

            {/* Back Call-to-action button */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4 flex justify-center">
              <button 
                onClick={() => {
                  setActiveView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 font-normal text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                BACK TO HOME
              </button>
            </div>
          </div>
        )}

        {activeView === 'donate' && (
          <div className="w-full flex flex-col bg-surface-bright pb-16 animate-in fade-in duration-300">
            {/* Hero Section */}
            <section className="py-12 md:py-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto text-center relative overflow-hidden w-full mt-4">
              <div className="absolute inset-0 bg-surface-container-low -z-10 rounded-[3rem] opacity-50 transform -skew-y-2 scale-105"></div>
              <div className="max-w-3xl mx-auto flex flex-col items-center gap-4 relative z-10">
                <div className="inline-flex items-center gap-2 bg-[#f3c623]/10 px-4 py-2 rounded-full mb-2 border border-[#f3c623]/30">
                  <span className="w-2 h-2 rounded-full bg-[#f3c623] animate-pulse"></span>
                  <span className="text-xs font-bold text-[#8f7200] uppercase tracking-wider">SUPPORT THE MOVEMENT</span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-on-surface font-extrabold tracking-tight leading-tight">
                  DONATE <br />
                  <span className="text-black bg-[#f3c623] px-4 py-1.5 leading-tight inline-block transform -skew-x-6 mt-3 text-2xl sm:text-3xl md:text-4xl font-black">
                    Direct Support Channels
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl font-normal mt-2">
                  To keep our high-performance codes and daily elite analysis 100% free for everyone, you can support us directly through Mobile Money or Direct Bank Transfer.
                </p>
              </div>
            </section>

            {/* Direct Donation Channels Cards Grid */}
            <section className="py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                       {/* Mobile Money Details Card */}
                <div className="bg-surface-container-lowest border border-[#f3c623]/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between gap-6 group hover:border-[#f3c623] hover:shadow-md transition-all duration-300 w-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#f3c623]/10 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#f3c623]/20 flex items-center justify-center text-on-surface">
                      <span className="material-symbols-outlined text-2xl font-bold text-[#8f7200]">phone_iphone</span>
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-[#8f7200] uppercase tracking-wider">Option 1</span>
                      <h3 className="font-display text-xl sm:text-2xl font-black text-on-surface">Mobile Money Transfer</h3>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Transfer directly to our Mobile Money number using your mobile wallet provider.
                  </p>

                  <div className="flex flex-col gap-4">
                    {/* Recipient Account Name */}
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Registered Account Name</span>
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base font-black text-on-surface">{momoAccountName}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(momoAccountName);
                            setDonationCopiedText("Account Name Copied!");
                            setTimeout(() => setDonationCopiedText(null), 2000);
                          }}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg text-[#8f7200] transition-all flex items-center justify-center cursor-pointer"
                          title="Copy Account Name"
                        >
                          <span className="material-symbols-outlined text-lg">content_copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Mobile Money Number */}
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[#8f7200] uppercase tracking-wider font-display">MoMo Number</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg sm:text-xl font-black text-on-surface font-mono tracking-tight">{momoNumber}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(momoNumber.replace(/\s+/g, ''));
                            setDonationCopiedText("MoMo Number Copied!");
                            setTimeout(() => setDonationCopiedText(null), 2000);
                          }}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg text-[#8f7200] transition-all flex items-center justify-center cursor-pointer"
                          title="Copy MoMo Number"
                        >
                          <span className="material-symbols-outlined text-lg">content_copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Preferred Reference */}
                    <div className="bg-[#f3c623]/5 border border-[#f3c623]/20 rounded-2xl p-4 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[#8f7200] uppercase tracking-wider">Required Reference</span>
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base font-black text-[#8f7200] font-mono">{momoReference}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(momoReference);
                            setDonationCopiedText("Reference Copied!");
                            setTimeout(() => setDonationCopiedText(null), 2000);
                          }}
                          className="p-1.5 hover:bg-[#f3c623]/20 rounded-lg text-[#8f7200] transition-all flex items-center justify-center cursor-pointer"
                          title="Copy Reference"
                        >
                          <span className="material-symbols-outlined text-lg">content_copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details Card (Optional / Secondary) */}
                <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between gap-6 group hover:border-neutral-400 hover:shadow-md transition-all duration-300 w-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-200/20 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-on-surface">
                      <span className="material-symbols-outlined text-2xl font-bold text-neutral-600">account_balance</span>
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">Option 2 (Optional)</span>
                      <h3 className="font-display text-xl sm:text-2xl font-black text-on-surface">Direct Bank Transfer</h3>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Deposit or transfer directly from any local or international bank account.
                  </p>

                  <div className="flex flex-col gap-4">
                    {/* Bank Name */}
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Bank Name</span>
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base font-black text-on-surface">{bankName}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(bankName);
                            setDonationCopiedText("Bank Name Copied!");
                            setTimeout(() => setDonationCopiedText(null), 2000);
                          }}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface transition-all flex items-center justify-center cursor-pointer"
                          title="Copy Bank Name"
                        >
                          <span className="material-symbols-outlined text-lg">content_copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Account Holder Name */}
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Account Holder Name</span>
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base font-black text-on-surface">{bankAccountHolder}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(bankAccountHolder);
                            setDonationCopiedText("Account Name Copied!");
                            setTimeout(() => setDonationCopiedText(null), 2000);
                          }}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface transition-all flex items-center justify-center cursor-pointer"
                          title="Copy Account Name"
                        >
                          <span className="material-symbols-outlined text-lg">content_copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Account Number */}
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Account Number</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg sm:text-xl font-black text-on-surface font-mono tracking-tight">{bankAccountNumber}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(bankAccountNumber);
                            setDonationCopiedText("Account Number Copied!");
                            setTimeout(() => setDonationCopiedText(null), 2000);
                          }}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface transition-all flex items-center justify-center cursor-pointer"
                          title="Copy Account Number"
                        >
                          <span className="material-symbols-outlined text-lg">content_copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Bank Branch */}
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Branch</span>
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base font-black text-on-surface">{bankBranch}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(bankBranch);
                            setDonationCopiedText("Branch Copied!");
                            setTimeout(() => setDonationCopiedText(null), 2000);
                          }}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface transition-all flex items-center justify-center cursor-pointer"
                          title="Copy Branch"
                        >
                          <span className="material-symbols-outlined text-lg">content_copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Toast Feedback for Copied Items */}
              {donationCopiedText && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-on-surface text-primary-container text-xs font-bold px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-primary-container/20">
                  <span className="material-symbols-outlined text-sm font-black text-primary-container">done</span>
                  <span>{donationCopiedText}</span>
                </div>
              )}
            </section>

            {/* Back Call-to-action button */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4 flex justify-center">
              <button 
                onClick={() => {
                  setActiveView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 font-normal text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                BACK TO HOME
              </button>
            </div>
          </div>
        )}

        {activeView === 'privacy' && (
          <PrivacyPolicy 
            onBackToHome={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        )}

        {activeView === 'terms' && (
          <TermsOfService 
            onBackToHome={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        )}

        {activeView === 'login' && (
          <AdminLogin 
            onBackToHome={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToPrivacy={() => {
              setActiveView('privacy');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToTerms={() => {
              setActiveView('terms');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLoginSuccess={() => {
              setActiveView('admin-dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'admin-dashboard' && (
          <AdminDashboard 
            onLogout={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Footer */}
        {activeView !== 'login' && activeView !== 'admin-dashboard' && (
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
                    <a 
                      onClick={() => {
                        setActiveView('home');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      className="hover:text-[#f3c623] transition-colors text-neutral-400 cursor-pointer"
                    >
                      Home Dashboard
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => {
                        setActiveView('booking-codes');
                        setSelectedCategoryTab('All');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      className="hover:text-[#f3c623] transition-colors text-neutral-400 cursor-pointer"
                    >
                      Booking Codes
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => {
                        setActiveView('team');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      className="hover:text-[#f3c623] transition-colors text-neutral-400 cursor-pointer"
                    >
                      Meet Our Team
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => {
                        setActiveView('donate');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      className="hover:text-[#f3c623] transition-colors text-neutral-400 cursor-pointer"
                    >
                      Support / Donate
                    </a>
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
                    <a 
                      onClick={() => {
                        setActiveView('privacy');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#f3c623] transition-colors text-neutral-400 cursor-pointer"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => {
                        setActiveView('terms');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#f3c623] transition-colors text-neutral-400 cursor-pointer"
                    >
                      Terms of Service
                    </a>
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
        )}

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
