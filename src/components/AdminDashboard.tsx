import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface AdminDashboardProps {
  onLogout: () => void;
}

interface ActivityItem {
  id: string;
  type: "success" | "neutral" | "priority" | "error";
  icon: string;
  title: string;
  time: string;
  author: string;
  tag: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "team-settings" | "slips">("home");

  // States for Slip and Category Management
  const [slipCategories, setSlipCategories] = useState<any[]>(() => {
    const saved = localStorage.getItem("adaptation_slip_categories");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "1", name: "Elite Weekend 10", slipsCount: 24, status: "Active" },
      { id: "2", name: "Daily Value Accumulator", slipsCount: 112, status: "Active" },
      { id: "3", name: "VIP High Stakes", slipsCount: 8, status: "Paused" },
      { id: "4", name: "Corner Specialists", slipsCount: 45, status: "Active" }
    ];
  });

  const [slips, setSlips] = useState<any[]>(() => {
    const saved = localStorage.getItem("adaptation_slips_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "1", category: "Elite Weekend 10", matches: 10, odds: "24.50", bookingCode: "#WC-9821" },
      { id: "2", category: "Daily Value Accumulator", matches: 5, odds: "12.80", bookingCode: "#BOOST-034" }
    ];
  });

  const [categoryFormName, setCategoryFormName] = useState("");
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);

  // Upload Slip Form States
  const [slipFormMatches, setSlipFormMatches] = useState<number | "">("");
  const [slipFormCategory, setSlipFormCategory] = useState("Elite Weekend 10");
  const [slipFormOdds, setSlipFormOdds] = useState("");
  const [slipFormBookingCode, setSlipFormBookingCode] = useState("");

  const saveSlipCategories = (updated: any[]) => {
    setSlipCategories(updated);
    localStorage.setItem("adaptation_slip_categories", JSON.stringify(updated));
  };

  const saveSlips = (updated: any[]) => {
    setSlips(updated);
    localStorage.setItem("adaptation_slips_list", JSON.stringify(updated));
  };

  // State for Team Members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem("adaptation_team_members");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Keep fallback
      }
    }
    return [
      {
        id: "1",
        name: "Alex Rivera",
        role: "Head Strategist",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCmiZUJxcfA2HLcC3ksPOmZ9iFilcu9VxwM1cEZQ0dDxRaMc9wh2q2HXOYnGMZUnKxIIMsgZwWxLuTSTbZU9663BX7vzGD0qa4CBV4oeNR-Q-QyjXLVvnUwzCa3CE13tYbIjRaHWMgyZPbIuo9VC2ipzI3jo8acV4pt47p8zoE4BOfn2fHL5CTVtT0yQlB7ihuN6w5QDziNla4OLDwud_8PPNUYhG7S7tHZoKlnwtfLxn13-CAKb6RUaaZfii5cER2IlC97pGzR2Q"
      },
      {
        id: "2",
        name: "Sarah Chen",
        role: "Betting Analyst",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCyYp7hzyLNJ48AOfaeEBhlHcqZ67PjXLmLQtiNv69fvyB7ovUvq7wfgIctAQpDgp5os_G7ahOPk-nRwMwN0_b-kmleasMXVxcLrXwZWriqmea3bRcJ9DHmKkEznGZd9gG4hFvx9KvMNGklh1sw5KtuEHyg_5-pGtoZVXmUTivK15iEsltP6pkphhR9AFw8P6sSE5ShXhypOiSINjJN7JtxiunqhNQ6ptWAedCeKsVBu3f3xp43-CkhLtf4mhMhCBtZJ8QtDQiLQ"
      },
      {
        id: "3",
        name: "Marcus Kalu",
        role: "Data Scientist",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAh3Q6DdsxRqWFOLxx1Fze_ytBJKqTytUQS_qPMMB1dYsrP3-iowSYZyaNNS_quFqr_FGvFSJavftj1GnqTpNdgWdrX3qeTeJccOcawp6NyHD0X-srkvYq0qdZxnXZArJiavY8dYqc-G06vzR1JrHwWbvG3K6jlaGPxORdAbbq7Su8LzLgykt6za1KWOqAFnvtEhvgJssPlXahLd8YDACjV6gaV5iZk46aPea5Xn2sWwaa4KCBpwlAelkiPCHAMGFdl11MB97WGVw"
      },
      {
        id: "4",
        name: "Elena Rodriguez",
        role: "Community Lead",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuALUubqUDswtVcW0pIMU3998mBvcMGMEYFv8-le3Zeu7VlJWhS1_JHQGyQw60ZRa2tGgQrZHv6iIJs2B00cuXYJgjnliApeCi2Wozx9-xqK2ANUifb-2bxhd4QkU9rNgVTy_erySNIVdUPOUp8uv_C7oXzHRMYnAvO8jrIpO_5MoV8Bez1C0r_csoOheCpKzExcyTNW9RovImIga-CmYB0RvkTHRuD5EwLdiDZ-L4KMNzSxElK6r2KAajylJBZE5RravTyuhYFTVQ"
      },
      {
        id: "5",
        name: "James Wilson",
        role: "Support Specialist",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPS4A9qxg2bJPQpUJKyzLON43UgwP-T5g5XLpWNrC3z846DT9sOia8oqLajZ7_OUd3l4e_gS8lo8031L9KmSRBtKMOPEaekKy2AnlIKtMYFUSr6sLpYEAXUKNtZQpG8jfij94P_cQkwBplHGvAqfyr-yeCJIo49a93kTmYaUZr0Q9O7Mp0x2W5UGMrAJILzXShzsEhWw8IJcyn9yaQpcF_IK7_9i783fRhenn7DlQMHd9AFNLO9zwHSlQGTPYR5SlXOy8M6Wli4A"
      },
      {
        id: "6",
        name: "Sophie Laurent",
        role: "Operations Manager",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAC1G7CxYxMK9Hq0nijASDWKWpjbQASp-jyzcvGp1_eE3nY-yF15Y3IswVW_PvGJwWuoRhWD8Pdv-vFvb09xrDvYiraLx8kLhhKfih8-o-0GXbnLgxF5riE-eIumDQGXwPOUYY42taaz3feG3HRTT-2uxtPzxvHpO8Es-6opQe0qyHYiYTDIC5LnU5nkNQ0OMFa77jqKJt2nqJGLkM7mM8UN1duaHDppDII5Sa_VHoYRKSDp9jqjiHZfUAKeajbgnxEHDRgZKFV7w"
      },
      {
        id: "7",
        name: "David Okafor",
        role: "Technical Advisor",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmMSbnRs98QVjlCvGPlgUkVxxLohGxGsMvZji1zto5CPTwl4A_GvCyVb7WGF3r-R02C7vzVi4QQgdGTaI90qfJvzP5G0ry3C_jYUAGcZbg1ytLM13H22jhWhDx1gjIONmAuHPpWhhTjUPq9aj9ARD2GxIVDpSy88bFlJ8xVBsjnlYTnd-c1drKuQbwqbz6MR3Ge-Ci7gUO5rhuJ9SQkVRLos1TqLXTy_dfKU_sSLTpaffWKEhoWEf6ZBCX9R_IlsoZO4bET14IvA"
      }
    ];
  });

  // State to manage Member Modals/forms
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberFormName, setMemberFormName] = useState("");
  const [memberFormRole, setMemberFormRole] = useState("");
  const [memberFormImage, setMemberFormImage] = useState("");

  // Payment states (fully interactive, saved to localStorage and synchronized)
  const [momoNumberInput, setMomoNumberInput] = useState(() => localStorage.getItem("momo_number") || "055 776 5432");
  const [momoAccountNameInput, setMomoAccountNameInput] = useState(() => localStorage.getItem("momo_account_name") || "ADAPTATION FAMILY");
  const [momoReferenceInput, setMomoReferenceInput] = useState(() => localStorage.getItem("momo_reference") || "ADAPT FAMILY");

  // Bank details
  const [bankNameInput, setBankNameInput] = useState(() => localStorage.getItem("bank_name") || "Ecobank Ghana");
  const [bankAccountNumberInput, setBankAccountNumberInput] = useState(() => localStorage.getItem("bank_account_number") || "1441002345678");
  const [bankAccountHolderInput, setBankAccountHolderInput] = useState(() => localStorage.getItem("bank_account_holder") || "ADAPTATION FAMILY");
  const [bankBranchInput, setBankBranchInput] = useState(() => localStorage.getItem("bank_branch") || "Accra Mall Branch");

  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  const saveTeamMembers = (newTeam: TeamMember[]) => {
    setTeamMembers(newTeam);
    localStorage.setItem("adaptation_team_members", JSON.stringify(newTeam));
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setMemberFormName("");
    setMemberFormRole("");
    setMemberFormImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200");
    setIsMemberModalOpen(true);
  };

  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setMemberFormName(member.name);
    setMemberFormRole(member.role);
    setMemberFormImage(member.image);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormName.trim() || !memberFormRole.trim()) return;

    if (editingMember) {
      const updated = teamMembers.map(m => m.id === editingMember.id ? { ...m, name: memberFormName, role: memberFormRole, image: memberFormImage } : m);
      saveTeamMembers(updated);
    } else {
      const newM: TeamMember = {
        id: Date.now().toString(),
        name: memberFormName,
        role: memberFormRole,
        image: memberFormImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
      };
      saveTeamMembers([...teamMembers, newM]);
    }
    setIsMemberModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    const updated = teamMembers.filter(m => m.id !== id);
    saveTeamMembers(updated);
  };

  const handleSavePayments = () => {
    localStorage.setItem("momo_number", momoNumberInput);
    localStorage.setItem("momo_account_name", momoAccountNameInput);
    localStorage.setItem("momo_reference", momoReferenceInput);
    localStorage.setItem("bank_name", bankNameInput);
    localStorage.setItem("bank_account_number", bankAccountNumberInput);
    localStorage.setItem("bank_account_holder", bankAccountHolderInput);
    localStorage.setItem("bank_branch", bankBranchInput);
    
    // Dispatch custom storage event so other views can update immediately
    window.dispatchEvent(new Event("storage"));

    setPaymentSuccessMessage("Payment settings updated successfully!");
    setTimeout(() => setPaymentSuccessMessage(null), 3000);
  };

  const handleCancelPayments = () => {
    setMomoNumberInput(localStorage.getItem("momo_number") || "055 776 5432");
    setMomoAccountNameInput(localStorage.getItem("momo_account_name") || "ADAPTATION FAMILY");
    setMomoReferenceInput(localStorage.getItem("momo_reference") || "ADAPT FAMILY");
    setBankNameInput(localStorage.getItem("bank_name") || "Ecobank Ghana");
    setBankAccountNumberInput(localStorage.getItem("bank_account_number") || "1441002345678");
    setBankAccountHolderInput(localStorage.getItem("bank_account_holder") || "ADAPTATION FAMILY");
    setBankBranchInput(localStorage.getItem("bank_branch") || "Accra Mall Branch");
    
    setPaymentSuccessMessage("Changes reverted!");
    setTimeout(() => setPaymentSuccessMessage(null), 2000);
  };

  // State for Recent Activities list to make it fully interactive
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "success",
      icon: "check_circle",
      title: "New Slip Created: World Cup Qualifier Parlay (#WC-9821)",
      time: "2 minutes ago",
      author: "Admin Marcus",
      tag: "Published"
    },
    {
      id: "2",
      type: "neutral",
      icon: "update",
      title: "Prediction Updated: Real Madrid vs Barcelona (Elite Pick)",
      time: "45 minutes ago",
      author: "System Automated",
      tag: "Odds Shift"
    },
    {
      id: "3",
      type: "priority",
      icon: "volunteer_activism",
      title: "New Donation Received: 0.5 ETH from User_9982",
      time: "1 hour ago",
      author: "Community Support",
      tag: "Priority"
    },
    {
      id: "4",
      type: "error",
      icon: "warning",
      title: "System Alert: Multiple reports on expired booking codes.",
      time: "3 hours ago",
      author: "Support Desk",
      tag: "Action Req."
    }
  ]);

  // Form states for creating a new activity slip
  const [isNewSlipModalOpen, setIsNewSlipModalOpen] = useState(false);
  const [newSlipTitle, setNewSlipTitle] = useState("");
  const [newSlipCategory, setNewSlipCategory] = useState("World Cup");
  const [newSlipStatus, setNewSlipStatus] = useState<"success" | "neutral" | "priority" | "error">("success");

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlipTitle.trim()) return;

    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: newSlipStatus,
      icon: newSlipStatus === "success" ? "check_circle" : newSlipStatus === "neutral" ? "update" : newSlipStatus === "priority" ? "volunteer_activism" : "warning",
      title: `${newSlipCategory} - ${newSlipTitle}`,
      time: "Just now",
      author: "Admin Officer",
      tag: newSlipStatus === "success" ? "Published" : newSlipStatus === "neutral" ? "Odds Shift" : newSlipStatus === "priority" ? "Priority" : "Action Req."
    };

    setActivities([newActivity, ...activities]);
    setNewSlipTitle("");
    setIsNewSlipModalOpen(false);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  // World Cup or general filtering based on search
  const filteredActivities = activities.filter(activity => 
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full flex bg-[#f9f9fb] text-[#1a1c1d] antialiased select-none font-sans relative overflow-x-hidden">
      
      {/* 1. Desktop Left Sidebar */}
      <aside className="bg-[#f3f3f5] text-[#1a1c1d] h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col border-r border-neutral-200 z-40 shadow-sm overflow-y-auto">
        {/* Sidebar Header */}
        <div className="p-6 flex flex-col items-center gap-3 border-b border-neutral-200/60">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#f3c623] shadow-md hover:scale-105 transition-transform duration-300">
            <img 
              className="w-full h-full object-cover" 
              src="https://res.cloudinary.com/dslngzls6/image/upload/v1782495960/photo_2026-06-26_08-47-00_avg1go.jpg" 
              alt="Adaptation Family Logo" 
            />
          </div>
          <div className="text-center">
            <h1 className="font-display text-lg font-extrabold text-[#1a1c1d] leading-snug">Adaptation Family</h1>
            <p className="font-sans text-[10px] font-bold text-[#5d5e64] uppercase tracking-wider mt-0.5">Elite Sports Community</p>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab("home")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer text-left ${
              activeTab === "home" 
                ? "bg-white text-[#526600] font-bold shadow-sm border-l-4 border-[#f3c623]" 
                : "text-[#5d5e64] hover:bg-neutral-200/50 hover:text-[#1a1c1d]"
            }`}
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span className="text-xs font-bold uppercase tracking-wider">Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab("team-settings")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer text-left ${
              activeTab === "team-settings" 
                ? "bg-white text-[#526600] font-bold shadow-sm border-l-4 border-[#f3c623]" 
                : "text-[#5d5e64] hover:bg-neutral-200/50 hover:text-[#1a1c1d]"
            }`}
          >
            <span className="material-symbols-outlined text-lg">settings_suggest</span>
            <span className="text-xs font-bold uppercase tracking-wider">Team Payment</span>
          </button>

          <button 
            onClick={() => setActiveTab("slips")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer text-left ${
              activeTab === "slips" 
                ? "bg-white text-[#526600] font-bold shadow-sm border-l-4 border-[#f3c623]" 
                : "text-[#5d5e64] hover:bg-neutral-200/50 hover:text-[#1a1c1d]"
            }`}
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            <span className="text-xs font-bold uppercase tracking-wider">Select Management</span>
          </button>
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-neutral-200/60">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 text-[#ba1a1a] font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer justify-center"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Exit Portal</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col relative bg-[#f9f9fb]">
        
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-neutral-200/80 px-4 sm:px-8 py-4 flex items-center justify-between">
          
          {/* Brand/Hamburger container for responsive layout - NO OVERLAPPING */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 text-[#1a1c1d]"
            >
              <span className="material-symbols-outlined text-xl">{isMobileNavOpen ? "close" : "menu"}</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg sm:text-xl font-extrabold text-[#f3c623] tracking-tight whitespace-nowrap">
                Adaptation Family
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 bg-neutral-100 text-[9px] font-bold tracking-widest text-[#5d5e64] uppercase rounded-full border border-neutral-200">
                ADMIN
              </span>
            </div>
          </div>

          {/* Center navigation area */}
          <div className="hidden md:flex items-center gap-6">
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Profile avatar with online status indicator */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-neutral-200 relative shrink-0">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiZge3SGRpL8JQPL9-_323EEgE2C5jrjAqD8uNQYiBYUEXe-tLmQFHM6TOuw1Q20Tb99tTsJY5BcxppzcblAPwjQ6CueL8NeOprJcnw4wYYHhn1CqCUFqg_m5lcWuyYq1V7N7onFILbC6WW80LibGBLTJHZL4YyLiOxP5_rxXe02wTgRym2fuPRsORrD2UDmiPnimSkLUsT8Qgk0TWm6i76hAoQshxgox8EwLUfxWHFiHoIqJ106lYvh-UTxLiIaNe7eYgoTFsGQ" 
                  alt="Analyst Portrait" 
                />
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-[11px] font-bold text-[#1a1c1d] leading-none">Marcus Payne</span>
                <span className="text-[9px] text-[#5d5e64] font-medium mt-0.5 leading-none">Senior Analyst</span>
              </div>
            </div>
          </div>
        </header>

        {/* Responsive Mobile Drawer Navigation */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileNavOpen(false)}
                className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
              />
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 h-screen w-72 bg-white shadow-2xl z-50 flex flex-col lg:hidden overflow-y-auto"
              >
                <div className="p-6 flex items-center justify-between border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200">
                      <img src="https://res.cloudinary.com/dslngzls6/image/upload/v1782495960/photo_2026-06-26_08-47-00_avg1go.jpg" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-extrabold text-[#1a1c1d]">Adaptation Admin</h3>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Internal System</p>
                    </div>
                  </div>
                  <button onClick={() => setIsMobileNavOpen(false)} className="p-1 rounded-full hover:bg-neutral-100">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                {/* Mobile Search input - ensures complete details/features on mobile */}
                <div className="p-4 border-b border-neutral-100 lg:hidden block">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search logs or tags..."
                      className="bg-neutral-100 border border-neutral-200 rounded-full pl-9 pr-9 py-2 text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] w-full transition-all"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-xs text-[#5d5e64]">search</span>
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2 text-neutral-400 hover:text-neutral-600">
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 px-4 py-6 space-y-2">
                  <button 
                    onClick={() => { setActiveTab("home"); setIsMobileNavOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer text-left ${
                      activeTab === "home" ? "bg-neutral-100 text-[#526600] font-bold" : "text-[#5d5e64]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Dashboard</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab("team-settings"); setIsMobileNavOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer text-left ${
                      activeTab === "team-settings" ? "bg-neutral-100 text-[#526600] font-bold" : "text-[#5d5e64]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">settings_suggest</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Team Payment</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab("slips"); setIsMobileNavOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer text-left ${
                      activeTab === "slips" ? "bg-neutral-100 text-[#526600] font-bold" : "text-[#5d5e64]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Select Management</span>
                  </button>
                </div>

                <div className="p-4 border-t border-neutral-100">
                  <button onClick={onLogout} className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 text-[#ba1a1a] font-bold rounded-xl text-xs uppercase tracking-wider transition-all">
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Exit Portal</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Body Content Wrapper */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
          
          {/* Main conditional views */}
          {activeTab === "home" && (
            <>
              {/* Heading section */}
              <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/50 pb-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1a1c1d] tracking-tight">
                    Admin Dashboard
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-[#5d5e64] mt-1">
                    Live overview of community activity and predictive performance metrics.
                  </p>
                </div>
              </section>

              {/* Grid of 7 Bento Analytics Cards + 1 Action Card */}
              <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                
                {/* World Cup Card */}
                <div className="bg-emerald-50/20 border border-emerald-200/80 rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(16,185,129,0.02)] relative overflow-hidden group hover:shadow-md hover:border-emerald-400/60 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-emerald-500 col-span-2 sm:col-span-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                    <span className="font-sans text-[10px] font-bold tracking-wider text-emerald-800 uppercase flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-xs">sports_soccer</span>
                      World Cup
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/50 font-sans text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-3xl font-extrabold tracking-tight text-emerald-700">5</span>
                    <span className="text-[10px] text-emerald-600/80 font-semibold uppercase tracking-wider mt-1">Booking Codes</span>
                  </div>
                </div>

                {/* Bet Builder Card */}
                <div className="bg-indigo-50/20 border border-indigo-200/80 rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(99,102,241,0.02)] relative overflow-hidden group hover:shadow-md hover:border-indigo-400/60 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-indigo-500 col-span-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                    <span className="font-sans text-[10px] font-bold tracking-wider text-indigo-800 uppercase flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-xs">construction</span>
                      Bet Builder
                    </span>
                    <span className="text-indigo-700 bg-indigo-50 border border-indigo-200/50 font-sans text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-3xl font-extrabold tracking-tight text-indigo-700">5</span>
                    <span className="text-[10px] text-indigo-600/80 font-semibold uppercase tracking-wider mt-1">Booking Codes</span>
                  </div>
                </div>

                {/* Roll Over Card */}
                <div className="bg-violet-50/20 border border-violet-200/80 rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(139,92,246,0.02)] relative overflow-hidden group hover:shadow-md hover:border-violet-400/60 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-violet-500 col-span-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                    <span className="font-sans text-[10px] font-bold tracking-wider text-violet-800 uppercase flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-xs">cached</span>
                      Roll Over
                    </span>
                    <span className="text-violet-700 bg-violet-50 border border-violet-200/50 font-sans text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-3xl font-extrabold tracking-tight text-violet-700">5</span>
                    <span className="text-[10px] text-violet-600/80 font-semibold uppercase tracking-wider mt-1">Booking Codes</span>
                  </div>
                </div>

                {/* 1 Cedi Card */}
                <div className="bg-amber-50/20 border border-amber-200/80 rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(245,158,11,0.02)] relative overflow-hidden group hover:shadow-md hover:border-amber-400/60 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-amber-500 col-span-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                    <span className="font-sans text-[10px] font-bold tracking-wider text-amber-800 uppercase flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-xs">payments</span>
                      1 Cedi
                    </span>
                    <span className="text-amber-700 bg-amber-50 border border-amber-200/50 font-sans text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-3xl font-extrabold tracking-tight text-amber-700">5</span>
                    <span className="text-[10px] text-amber-600/80 font-semibold uppercase tracking-wider mt-1">Booking Codes</span>
                  </div>
                </div>

                {/* Beticology Card */}
                <div className="bg-rose-50/20 border border-rose-200/80 rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(244,63,94,0.02)] relative overflow-hidden group hover:shadow-md hover:border-rose-400/60 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-rose-500 col-span-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                    <span className="font-sans text-[10px] font-bold tracking-wider text-rose-800 uppercase flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-xs">psychology</span>
                      Beticology
                    </span>
                    <span className="text-rose-700 bg-rose-50 border border-rose-200/50 font-sans text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-3xl font-extrabold tracking-tight text-rose-700">5</span>
                    <span className="text-[10px] text-rose-600/80 font-semibold uppercase tracking-wider mt-1">Booking Codes</span>
                  </div>
                </div>

                {/* Long Bets Card */}
                <div className="bg-teal-50/20 border border-teal-200/80 rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(20,184,166,0.02)] relative overflow-hidden group hover:shadow-md hover:border-teal-400/60 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-teal-500 col-span-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                    <span className="font-sans text-[10px] font-bold tracking-wider text-teal-800 uppercase flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                      Long Bets
                    </span>
                    <span className="text-teal-700 bg-teal-50 border border-teal-200/50 font-sans text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-3xl font-extrabold tracking-tight text-teal-700">5</span>
                    <span className="text-[10px] text-teal-600/80 font-semibold uppercase tracking-wider mt-1">Booking Codes</span>
                  </div>
                </div>

                {/* Engine Room Card */}
                <div className="bg-sky-50/20 border border-sky-200/80 rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(56,189,248,0.02)] relative overflow-hidden group hover:shadow-md hover:border-sky-400/60 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-sky-500 col-span-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                    <span className="font-sans text-[10px] font-bold tracking-wider text-sky-800 uppercase flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-xs">settings</span>
                      Engine Room
                    </span>
                    <span className="text-sky-700 bg-sky-50 border border-sky-200/50 font-sans text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-3xl font-extrabold tracking-tight text-sky-700">5</span>
                    <span className="text-[10px] text-sky-600/80 font-semibold uppercase tracking-wider mt-1">Booking Codes</span>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-neutral-900 border border-neutral-850 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden text-white col-span-2 sm:col-span-1">
                  <div>
                    <h4 className="font-display text-xs font-extrabold uppercase tracking-widest text-[#f3c623]">Quick Actions</h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 font-medium leading-tight">Publish slips or backup activity databases.</p>
                  </div>
                  <div className="flex gap-2.5 mt-4">
                    <button 
                      onClick={() => setIsNewSlipModalOpen(true)}
                      className="bg-[#f3c623] text-black hover:bg-[#e2b516] p-2 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center flex-1 cursor-pointer"
                      title="Add Activity"
                    >
                      <span className="material-symbols-outlined text-lg font-bold">add_circle</span>
                    </button>
                    <button 
                      onClick={() => alert("Activity log link copied! Ready to share with administrators.")}
                      className="bg-neutral-800 text-neutral-200 hover:bg-neutral-700 p-2 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center flex-1 cursor-pointer"
                      title="Share Activity Feed"
                    >
                      <span className="material-symbols-outlined text-lg">share</span>
                    </button>
                    <button 
                      onClick={() => alert("Database activity log backed up to cloud systems successfully.")}
                      className="bg-neutral-800 text-neutral-200 hover:bg-neutral-700 p-2 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center flex-1 cursor-pointer"
                      title="Download Backup"
                    >
                      <span className="material-symbols-outlined text-lg">cloud_download</span>
                    </button>
                  </div>
                </div>

              </section>

              {/* Bottom Layout: Activity Feed & Sidebar Panels */}
              <div className="mt-8">
                
                {/* Column 1: Live Interactive Activity Feed (Left) - Expanded to Full Width */}
                <section className="w-full flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base sm:text-lg font-extrabold text-[#1a1c1d] uppercase tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-5 bg-[#f3c623] rounded-sm inline-block"></span>
                      Recent System Log
                    </h3>
                    <div className="flex items-center gap-2">
                      {searchQuery && (
                        <span className="text-[10px] bg-neutral-100 text-[#5d5e64] font-semibold px-2 py-0.5 rounded-md border border-neutral-200">
                          Filtered
                        </span>
                      )}
                      <button 
                        onClick={() => {
                          setActivities([
                            {
                              id: "1",
                              type: "success",
                              icon: "check_circle",
                              title: "New Slip Created: World Cup Qualifier Parlay (#WC-9821)",
                              time: "2 minutes ago",
                              author: "Admin Marcus",
                              tag: "Published"
                            },
                            {
                              id: "2",
                              type: "neutral",
                              icon: "update",
                              title: "Prediction Updated: Real Madrid vs Barcelona (Elite Pick)",
                              time: "45 minutes ago",
                              author: "System Automated",
                              tag: "Odds Shift"
                            },
                            {
                              id: "3",
                              type: "priority",
                              icon: "volunteer_activism",
                              title: "New Donation Received: 0.5 ETH from User_9982",
                              time: "1 hour ago",
                              author: "Community Support",
                              tag: "Priority"
                            },
                            {
                              id: "4",
                              type: "error",
                              icon: "warning",
                              title: "System Alert: Multiple reports on expired booking codes.",
                              time: "3 hours ago",
                              author: "Support Desk",
                              tag: "Action Req."
                            }
                          ]);
                          setSearchQuery("");
                          alert("Activity logs refreshed to baseline system snapshot.");
                        }}
                        className="text-[#526600] font-sans text-xs font-bold hover:underline cursor-pointer"
                      >
                        Reset Log
                      </button>
                    </div>
                  </div>

                  {/* List of Activity items */}
                  <div className="flex flex-col gap-3.5">
                    <AnimatePresence initial={false}>
                      {filteredActivities.length === 0 ? (
                        <div className="bg-white border border-neutral-200 rounded-[20px] p-8 text-center text-[#5d5e64] font-medium text-xs">
                          No matching system activities found. Try adjusting your search query!
                        </div>
                      ) : (
                        filteredActivities.map((activity) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white border border-neutral-200/80 rounded-[20px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-neutral-300 transition-all group"
                          >
                            <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full sm:w-auto">
                              {/* Icon with colored container based on type */}
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0 ${
                                activity.type === "success" 
                                  ? "bg-[#526600]/10 text-[#526600]" 
                                  : activity.type === "neutral" 
                                  ? "bg-neutral-100 text-neutral-600" 
                                  : activity.type === "priority" 
                                  ? "bg-[#f3c623]/10 text-amber-600" 
                                  : "bg-[#ba1a1a]/10 text-[#ba1a1a]"
                              }`}>
                                <span className="material-symbols-outlined text-lg">{activity.icon}</span>
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-bold text-[#1a1c1d] leading-snug break-words whitespace-normal pr-2">
                                  {activity.title}
                                </p>
                                <p className="text-[10px] text-[#5d5e64] font-medium mt-1">
                                  {activity.time} • by <span className="font-semibold text-[#1a1c1d]">{activity.author}</span>
                                </p>
                              </div>
                            </div>

                            {/* Actions on bottom (mobile) / right (desktop) */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 border-t border-neutral-100 sm:border-0 pt-2.5 sm:pt-0">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                activity.type === "success" 
                                  ? "bg-[#526600]/10 text-[#526600]" 
                                  : activity.type === "neutral" 
                                  ? "bg-neutral-100 text-neutral-600" 
                                  : activity.type === "priority" 
                                  ? "bg-[#f3c623]/10 text-amber-700" 
                                  : "bg-[#ba1a1a]/10 text-[#ba1a1a]"
                              }`}>
                                {activity.tag}
                              </span>
                              
                              <button 
                                onClick={() => handleDeleteActivity(activity.id)}
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-[#ba1a1a] transition-all cursor-pointer"
                                title="Dismiss/Delete from Log"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </section>

              </div>
            </>
          )}

          {activeTab === "team-settings" && (
            <div className="space-y-12 animate-fade-in">
              {/* Section 1: Team Management */}
              <section className="scroll-mt-24" id="team">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#1a1c1d] tracking-tight">Team Management</h2>
                    <p className="text-xs sm:text-sm text-[#5d5e64] mt-1">Review and manage the elite squad of the Adaptation Family.</p>
                  </div>
                  <button 
                    onClick={handleOpenAddModal}
                    className="self-start sm:self-auto bg-[#f3c623] hover:bg-[#ebd018] text-black px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add New Member
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {teamMembers.map((member, idx) => (
                    <div 
                      key={member.id} 
                      className={`bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between group shadow-xs hover:shadow-md hover:border-neutral-300 transition-all duration-300 ${
                        idx === teamMembers.length - 1 && teamMembers.length % 2 !== 0 ? "md:col-span-2" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                          <img 
                            className="w-full h-full object-cover" 
                            src={member.image} 
                            alt={member.name} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1c1d] text-xs sm:text-sm">{member.name}</p>
                          <p className="text-[10px] sm:text-xs text-[#5d5e64] font-medium mt-0.5">{member.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={() => handleOpenEditModal(member)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-[#5d5e64] hover:text-[#8f7200] transition-colors cursor-pointer"
                          title="Edit Member"
                        >
                          <span className="material-symbols-outlined text-base sm:text-lg">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-[#ba1a1a] hover:scale-105 transition-all cursor-pointer"
                          title="Delete Member"
                        >
                          <span className="material-symbols-outlined text-base sm:text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 2: Update Payment Details */}
              <section className="scroll-mt-24 pt-4" id="payments">
                <div className="mb-6">
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#1a1c1d] tracking-tight">Payment Configuration</h2>
                  <p className="text-xs sm:text-sm text-[#5d5e64] mt-1">Configure the Mobile Money & Bank details shown on the public support page.</p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">


                  <div className="p-5 sm:p-8 flex flex-col gap-6 sm:gap-8">
                    {paymentSuccessMessage && (
                      <div className="bg-amber-50 text-[#8f7200] border border-[#f3c623]/30 rounded-xl px-4 py-3 text-xs font-bold animate-pulse">
                        {paymentSuccessMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Option 1: Mobile Money */}
                      <div className="bg-neutral-50/60 border border-neutral-200 rounded-2xl p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-3 pb-2 border-b border-neutral-200/60">
                          <span className="material-symbols-outlined text-[#8f7200] font-bold">phone_iphone</span>
                          <h3 className="font-display text-sm font-black text-[#1a1c1d] uppercase tracking-wider">Option 1: Mobile Money Transfer</h3>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wider">Mobile Money Number</label>
                          <input 
                            type="text" 
                            required
                            value={momoNumberInput}
                            onChange={(e) => setMomoNumberInput(e.target.value)}
                            placeholder="e.g. 055 776 5432"
                            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] w-full font-mono font-bold"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wider">Preferred Reference</label>
                          <input 
                            type="text" 
                            required
                            value={momoReferenceInput}
                            onChange={(e) => setMomoReferenceInput(e.target.value)}
                            placeholder="e.g. ADAPT FAMILY"
                            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] w-full font-bold"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wider">Registered Account Name</label>
                          <input 
                            type="text" 
                            required
                            value={momoAccountNameInput}
                            onChange={(e) => setMomoAccountNameInput(e.target.value)}
                            placeholder="e.g. ADAPTATION FAMILY"
                            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] w-full font-bold"
                          />
                        </div>
                      </div>

                      {/* Option 2: Direct Bank Transfer (Secondary / Optional) */}
                      <div className="bg-neutral-50/60 border border-neutral-200 rounded-2xl p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-3 pb-2 border-b border-neutral-200/60">
                          <span className="material-symbols-outlined text-[#8f7200] font-bold">account_balance</span>
                          <h3 className="font-display text-sm font-black text-[#1a1c1d] uppercase tracking-wider">Option 2: Direct Bank Transfer (Secondary / Optional)</h3>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wider">Bank Name</label>
                          <input 
                            type="text" 
                            value={bankNameInput}
                            onChange={(e) => setBankNameInput(e.target.value)}
                            placeholder="e.g. Ecobank Ghana"
                            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] w-full font-bold"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wider">Bank Account Number</label>
                          <input 
                            type="text" 
                            value={bankAccountNumberInput}
                            onChange={(e) => setBankAccountNumberInput(e.target.value)}
                            placeholder="e.g. 1441002345678"
                            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] w-full font-mono font-bold"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wider">Bank Account Holder Name</label>
                          <input 
                            type="text" 
                            value={bankAccountHolderInput}
                            onChange={(e) => setBankAccountHolderInput(e.target.value)}
                            placeholder="e.g. ADAPTATION FAMILY"
                            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] w-full font-bold"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wider">Bank Branch</label>
                          <input 
                            type="text" 
                            value={bankBranchInput}
                            onChange={(e) => setBankBranchInput(e.target.value)}
                            placeholder="e.g. Accra Mall Branch"
                            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] w-full font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview Badge card in brand yellow */}
                    <div className="bg-[#f3c623]/5 border border-[#f3c623]/20 p-4 rounded-2xl">
                      <p className="text-[11px] font-bold text-[#8f7200] uppercase tracking-wider">Preview Mode</p>
                      <p className="text-xs text-[#5d5e64] mt-1.5 font-medium">
                        The public Mobile Money card will show: <span className="font-black text-[#1a1c1d]">"Pay to: {momoAccountNameInput || '...'}"</span> via <span className="font-black text-[#1a1c1d]">Mobile Money ({momoNumberInput || '...'})</span> with Reference <span className="font-black text-[#1a1c1d]">"{momoReferenceInput || '...'}"</span>.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-100">
                      <button 
                        onClick={handleCancelPayments}
                        className="px-6 py-3 rounded-xl border border-neutral-300 text-[#5d5e64] hover:bg-neutral-50 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Cancel Changes
                      </button>
                      <button 
                        onClick={handleSavePayments}
                        className="px-6 py-3 rounded-xl bg-[#f3c623] hover:bg-[#ebd018] text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                      >
                        Save Details
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "slips" && (
            <div className="flex flex-col gap-6 animate-fade-in w-full">
              {/* Page Header */}
              <div className="mb-2">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1a1c1d] tracking-tight">Admin Management</h1>
                <p className="text-xs sm:text-sm text-[#5d5e64] mt-1">Configure the ecosystem and release new betting artifacts to the community.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start w-full">
                
                {/* Section 1: Manage Categories (Bento Style) - lg:col-span-7 */}
                <section className="lg:col-span-7 flex flex-col gap-5 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="font-display text-base sm:text-lg font-extrabold text-[#1a1c1d] flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-black bg-[#f3c623] p-1.5 sm:p-2 rounded-xl text-lg font-bold">category</span>
                      Manage Categories
                    </h2>
                    
                    {!isNewCategoryOpen ? (
                      <button 
                        onClick={() => setIsNewCategoryOpen(true)}
                        className="bg-[#f3c623] text-black hover:bg-[#ebd018] px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <span className="material-symbols-outlined text-base">add_circle</span>
                        Create New Category
                      </button>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          value={categoryFormName}
                          onChange={(e) => setCategoryFormName(e.target.value)}
                          placeholder="Category Name"
                          className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#f3c623] flex-1 sm:w-48"
                        />
                        <button
                          onClick={() => {
                            if (!categoryFormName.trim()) return;
                            const newCat = {
                              id: Date.now().toString(),
                              name: categoryFormName.trim(),
                              slipsCount: 0,
                              status: "Active"
                            };
                            saveSlipCategories([...slipCategories, newCat]);
                            setCategoryFormName("");
                            setIsNewCategoryOpen(false);
                            alert(`Category "${newCat.name}" created successfully!`);
                          }}
                          className="bg-[#f3c623] text-black hover:bg-[#ebd018] px-3 py-2 rounded-xl font-bold text-xs cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setCategoryFormName("");
                            setIsNewCategoryOpen(false);
                          }}
                          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-3 py-2 rounded-xl font-bold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Categories Table Card */}
                  <div className="bg-white border border-neutral-200 rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)] w-full">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-neutral-50/80 border-b border-neutral-200 font-bold uppercase tracking-wider text-[#5d5e64]">
                            <th className="px-5 py-4">Name</th>
                            <th className="px-5 py-4">Slips</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-[#1a1c1d] font-medium">
                          {slipCategories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-neutral-50/40 transition-colors">
                              <td className="px-5 py-4 font-bold text-neutral-800">{cat.name}</td>
                              <td className="px-5 py-4 text-neutral-500 font-semibold">{cat.slipsCount}</td>
                              <td className="px-5 py-4">
                                <button
                                  onClick={() => {
                                    const updated = slipCategories.map(c => 
                                      c.id === cat.id 
                                        ? { ...c, status: c.status === "Active" ? "Paused" : "Active" } 
                                        : c
                                    );
                                    saveSlipCategories(updated);
                                  }}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    cat.status === "Active" 
                                      ? "bg-[#526600]/10 text-[#526600] hover:bg-[#526600]/20" 
                                      : "bg-neutral-100 text-[#5d5e64] hover:bg-neutral-200"
                                  }`}
                                  title="Click to toggle status"
                                >
                                  {cat.status}
                                </button>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      const newName = prompt("Enter new name for category:", cat.name);
                                      if (newName && newName.trim()) {
                                        const updated = slipCategories.map(c => c.id === cat.id ? { ...c, name: newName.trim() } : c);
                                        saveSlipCategories(updated);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-950 transition-colors"
                                    title="Rename Category"
                                  >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
                                        const updated = slipCategories.filter(c => c.id !== cat.id);
                                        saveSlipCategories(updated);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-[#ba1a1a] transition-colors"
                                    title="Delete Category"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Growth Insights card */}
                  <div className="bg-[#f9f9fb] border border-neutral-200 rounded-[20px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#526600] bg-[#526600]/10 p-2 rounded-xl">trending_up</span>
                      <div>
                        <h4 className="font-bold text-xs text-[#1a1c1d] uppercase tracking-wide">Category Growth Insight</h4>
                        <p className="text-[11px] text-[#5d5e64]">Real-time forecasting density and ecosystem configuration.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 self-start sm:self-auto pl-11 sm:pl-0">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-neutral-850 leading-none">{slipCategories.length}</span>
                        <span className="text-[9px] font-bold text-[#5d5e64] uppercase tracking-wider mt-1">Total Categories</span>
                      </div>
                      <div className="w-[1px] h-8 bg-neutral-200"></div>
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-[#526600] leading-none">
                          {slipCategories.reduce((acc, curr) => acc + (curr.status === "Active" ? curr.slipsCount : 0), 0)}
                        </span>
                        <span className="text-[9px] font-bold text-[#5d5e64] uppercase tracking-wider mt-1">Active Forecasts</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: Upload New Slip - lg:col-span-5 */}
                <section className="lg:col-span-5 flex flex-col gap-6 w-full">
                  <div className="bg-white border border-neutral-200 rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-5 w-full">
                    <div>
                      <h2 className="font-display text-base sm:text-lg font-extrabold text-[#1a1c1d] flex items-center gap-2">
                        <span className="material-symbols-outlined text-black bg-[#f3c623] p-1.5 rounded-xl text-lg font-bold">cloud_upload</span>
                        Upload New Slip
                      </h2>
                      <p className="text-[11px] text-[#5d5e64] mt-1">Submit high-probability forecast configurations into the public directory.</p>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!slipFormMatches || !slipFormOdds || !slipFormBookingCode) {
                          alert("Please complete all fields.");
                          return;
                        }

                        // Create new slip item
                        const newSlip = {
                          id: Date.now().toString(),
                          category: slipFormCategory,
                          matches: Number(slipFormMatches),
                          odds: slipFormOdds,
                          bookingCode: slipFormBookingCode
                        };

                        saveSlips([newSlip, ...slips]);

                        // Increment the slips count for selected category
                        const updatedCategories = slipCategories.map(c => 
                          c.name === slipFormCategory 
                            ? { ...c, slipsCount: c.slipsCount + 1 } 
                            : c
                        );
                        saveSlipCategories(updatedCategories);

                        // Push to activity logs
                        const logTitle = `New Ticket Published: ${slipFormCategory} with ${slipFormMatches} Matches @ ${slipFormOdds} Odds (${slipFormBookingCode})`;
                        const newActivity: ActivityItem = {
                          id: Date.now().toString(),
                          type: "success" as const,
                          icon: "check_circle",
                          title: logTitle,
                          time: "Just now",
                          author: "Senior Analyst Marcus",
                          tag: "Published"
                        };
                        setActivities([newActivity, ...activities]);

                        // Reset form
                        setSlipFormMatches("");
                        setSlipFormOdds("");
                        setSlipFormBookingCode("");

                        alert(`Sports betting slip ${newSlip.bookingCode} successfully published!`);
                      }}
                      className="flex flex-col gap-4 w-full"
                    >
                      {/* Matches Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#1a1c1d] uppercase tracking-wider">Number of Matches</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={slipFormMatches}
                          onChange={(e) => setSlipFormMatches(e.target.value ? Number(e.target.value) : "")}
                          placeholder="e.g. 10"
                          className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                        />
                      </div>

                      {/* Select Category */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#1a1c1d] uppercase tracking-wider">Select Category</label>
                        <select
                          value={slipFormCategory}
                          onChange={(e) => setSlipFormCategory(e.target.value)}
                          className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] cursor-pointer"
                        >
                          {slipCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Total Odds & Booking Code row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#1a1c1d] uppercase tracking-wider">Total Odds</label>
                          <input
                            type="text"
                            required
                            value={slipFormOdds}
                            onChange={(e) => setSlipFormOdds(e.target.value)}
                            placeholder="e.g. 24.50"
                            className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#1a1c1d] uppercase tracking-wider">Booking Code</label>
                          <input
                            type="text"
                            required
                            value={slipFormBookingCode}
                            onChange={(e) => setSlipFormBookingCode(e.target.value)}
                            placeholder="e.g. #WC-9821"
                            className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="bg-[#f3c623] hover:bg-[#ebd018] text-black font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-all active:scale-98 mt-2 cursor-pointer text-center"
                      >
                        Publish Ticket
                      </button>
                    </form>
                  </div>

                  {/* Realtime Live Preview Card */}
                  <div className="relative overflow-hidden bg-neutral-900 border border-neutral-850 rounded-[24px] p-6 text-white shadow-xl flex flex-col gap-4">
                    {/* Glowing yellow decorative top line */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#f3c623]"></div>
                    
                    <div className="flex justify-between items-center relative z-10">
                      <span className="font-mono text-[9px] bg-neutral-800 text-[#f3c623] px-2 py-0.5 rounded uppercase tracking-widest font-bold">PREVIEW MODE</span>
                      <span className="material-symbols-outlined text-neutral-400 text-lg">visibility</span>
                    </div>

                    <div className="my-1 relative z-10">
                      <h4 className="font-display text-sm font-black uppercase tracking-widest text-neutral-400">High-Octane Accumulator</h4>
                      <h3 className="font-display text-lg font-black text-white mt-1 leading-tight uppercase">
                        {slipFormCategory || "Select Category"}
                      </h3>
                    </div>

                    <div className="h-[1px] bg-neutral-800 relative z-10"></div>

                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">MATCHES</span>
                        <span className="text-xl font-black text-white mt-0.5">{slipFormMatches || "--"}</span>
                      </div>
                      
                      <div className="w-[1px] h-8 bg-neutral-800"></div>

                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">TOTAL ODDS</span>
                        <span className="text-xl font-black text-[#f3c623] mt-0.5">{slipFormOdds || "--"}</span>
                      </div>
                    </div>

                    {slipFormBookingCode && (
                      <div className="bg-neutral-800/80 rounded-xl px-4 py-2.5 flex justify-between items-center relative z-10 border border-neutral-700/50 mt-1">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">BOOKING CODE</span>
                          <span className="text-xs font-mono font-bold text-white tracking-wider mt-0.5">{slipFormBookingCode}</span>
                        </div>
                        <span className="material-symbols-outlined text-neutral-400 text-sm">content_copy</span>
                      </div>
                    )}
                  </div>
                </section>

              </div>
            </div>
          )}

        </div>

      </main>

      {/* Interactive overlay dialog to Add/Edit Team Member */}
      <AnimatePresence>
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMemberModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-neutral-200 rounded-[28px] p-6 sm:p-8 max-w-[480px] w-full relative z-10 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
            >
              <div>
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#1a1c1d] tracking-tight">
                  {editingMember ? "Edit Team Member" : "Add Team Member"}
                </h3>
                <p className="text-xs text-[#5d5e64] mt-1">
                  {editingMember ? "Update the profile information of an existing squad officer." : "Establish a new elite squad member profile in the system."}
                </p>
              </div>

              <form onSubmit={handleSaveMember} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Member Name</label>
                  <input 
                    type="text" 
                    required 
                    value={memberFormName}
                    onChange={(e) => setMemberFormName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Role / Designation</label>
                  <input 
                    type="text" 
                    required 
                    value={memberFormRole}
                    onChange={(e) => setMemberFormRole(e.target.value)}
                    placeholder="e.g. Head Strategist"
                    className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Member Avatar / Profile Image</label>
                  
                  {/* Integrated Direct Upload Control */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0 relative shadow-sm group">
                      <img 
                        className="w-full h-full object-cover" 
                        src={memberFormImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                        alt="Preview" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 w-full">
                      <div className="flex flex-col items-center sm:items-start gap-1">
                        <input 
                          type="file" 
                          accept="image/*" 
                          id="avatar-file-upload" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === "string") {
                                  setMemberFormImage(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label 
                          htmlFor="avatar-file-upload" 
                          className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer inline-block transition-all hover:border-[#f3c623]/60 select-none shadow-xs text-center"
                        >
                          Upload File Directly
                        </label>
                        <p className="text-[10px] text-[#5d5e64] mt-1 text-center sm:text-left">
                          Supports PNG, JPG or dynamic SVG files.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Or input direct image URL link */}
                  <div className="mt-2 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#5d5e64] uppercase tracking-wide">Or paste image web link instead:</span>
                    <input 
                      type="url" 
                      value={memberFormImage && memberFormImage.startsWith("data:") ? "" : memberFormImage}
                      onChange={(e) => setMemberFormImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-100 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsMemberModalOpen(false)}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200/80 text-[#5d5e64] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#f3c623] text-black hover:brightness-105 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive overlay dialog to Create a Live Slip Activity */}
      <AnimatePresence>
        {isNewSlipModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewSlipModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-neutral-200 rounded-[28px] p-6 sm:p-8 max-w-[480px] w-full relative z-10 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
            >
              <div>
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#1a1c1d] tracking-tight">Create Live Activity Log</h3>
                <p className="text-xs text-[#5d5e64] mt-1">Populate a live event notification directly onto the system feed.</p>
              </div>

              <form onSubmit={handleCreateActivity} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Activity Description</label>
                  <input 
                    type="text" 
                    required 
                    value={newSlipTitle}
                    onChange={(e) => setNewSlipTitle(e.target.value)}
                    placeholder="e.g. World Cup Qualifier Parlay (#WC-9821)"
                    className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Category</label>
                    <select 
                      value={newSlipCategory} 
                      onChange={(e) => setNewSlipCategory(e.target.value)}
                      className="bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none"
                    >
                      <option value="World Cup">World Cup</option>
                      <option value="Bet Builder">Bet Builder</option>
                      <option value="Elite Pick">Elite Pick</option>
                      <option value="Weekend Special">Weekend Special</option>
                      <option value="System Notification">System</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Severity/Status</label>
                    <select 
                      value={newSlipStatus} 
                      onChange={(e) => setNewSlipStatus(e.target.value as any)}
                      className="bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none"
                    >
                      <option value="success">Success (Published)</option>
                      <option value="neutral">Neutral (Odds Shift)</option>
                      <option value="priority">Priority Badge</option>
                      <option value="error">Action Required (Alert)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsNewSlipModalOpen(false)}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200/80 text-[#5d5e64] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#f3c623] text-black hover:brightness-95 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-sm"
                  >
                    Publish Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
