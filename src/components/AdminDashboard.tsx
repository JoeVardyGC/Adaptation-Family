import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

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
  const currentUser = auth.currentUser;
  const adminEmail = currentUser?.email || "abubakarsadikmusah2004@gmail.com";
  
  const getAdminName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    const parts = adminEmail.split("@")[0];
    return parts
      .split(/[^a-zA-Z0-9]/)
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };
  
  const adminName = getAdminName();
  const adminImage = currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=f3c623&color=0d0e11&bold=true&size=128`;

  const [logoClickCount, setLogoClickCount] = useState(0);
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.warn("Signout error:", e);
    }
    onLogout();
  };
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "team-settings" | "slips" | "admin-access">("home");

  // Admin Access Management States & Handlers
  const [admins, setAdmins] = useState<any[]>(() => {
    const saved = localStorage.getItem("adaptation_admins_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: "super-admin", name: "Abubakar Sadik Musah", email: "abubakarsadikmusah2004@gmail.com", role: "Super Admin", lastActive: "Active Now", initials: "AS" }
    ];
  });

  const [adminSearch, setAdminSearch] = useState("");
  const [isGoogleSSO, setIsGoogleSSO] = useState(true);
  const [adminFormEmail, setAdminFormEmail] = useState("");
  const [adminFormPassword, setAdminFormPassword] = useState("••••••••");
  const [adminFormRole, setAdminFormRole] = useState("Standard Admin");
  const [securityLogs, setSecurityLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("adaptation_security_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: "1", time: "09:00", text: "System initialized with database support.", type: "info" }
    ];
  });

  const saveAdmins = async (updated: any[]) => {
    setAdmins(updated);
    localStorage.setItem("adaptation_admins_list", JSON.stringify(updated));
    try {
      for (const admin of updated) {
        await setDoc(doc(db, "admins", admin.id || admin.email), {
          name: admin.name,
          email: admin.email,
          role: admin.role,
          lastActive: admin.lastActive || "Active Now",
          initials: admin.initials || "AD"
        });
      }
      const currentIds = updated.map(a => a.id || a.email);
      for (const admin of admins) {
        const adminId = admin.id || admin.email;
        if (!currentIds.includes(adminId)) {
          await deleteDoc(doc(db, "admins", adminId));
        }
      }
    } catch (e) {
      console.error("Firestore Admin sync error:", e);
    }
  };

  const saveSecurityLogs = async (updated: any[]) => {
    setSecurityLogs(updated);
    localStorage.setItem("adaptation_security_logs", JSON.stringify(updated));
    try {
      for (const log of updated) {
        await setDoc(doc(db, "security_logs", log.id), {
          time: log.time,
          text: log.text,
          type: log.type
        });
      }
    } catch (e) {
      console.error("Firestore Security log sync error:", e);
    }
  };

  const handleClearLogs = async () => {
    for (const log of securityLogs) {
      try {
        await deleteDoc(doc(db, "security_logs", log.id));
      } catch (e) {
        console.warn("Firestore delete log failed: ", e);
      }
    }
    setSecurityLogs([]);
    localStorage.setItem("adaptation_security_logs", JSON.stringify([]));
  };

  const saveActivities = async (updated: ActivityItem[]) => {
    setActivities(updated);
    localStorage.setItem("adaptation_activities_list", JSON.stringify(updated));
    try {
      for (const act of updated) {
        await setDoc(doc(db, "activities", act.id || Date.now().toString()), {
          type: act.type || "info",
          icon: act.icon || "info",
          title: act.title,
          time: act.time || "Just now",
          author: act.author || adminName,
          tag: act.tag || ""
        });
      }
      const currentIds = updated.map(a => a.id);
      for (const act of activities) {
        if (!currentIds.includes(act.id)) {
          await deleteDoc(doc(db, "activities", act.id));
        }
      }
    } catch (e) {
      console.error("Firestore activities sync error:", e);
    }
  };

  const handleGrantAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFormEmail.trim()) {
      alert("Please enter a valid email address.");
      return;
    }

    const emailVal = adminFormEmail.trim();

    // Check if admin already exists
    if (admins.some(a => a.email.toLowerCase() === emailVal.toLowerCase())) {
      alert("This email is already registered as an administrator.");
      return;
    }

    const emailParts = emailVal.split("@")[0];
    const computedName = emailParts.charAt(0).toUpperCase() + emailParts.slice(1).replace(/[^a-zA-Z]/g, ' ');
    const computedInitials = computedName.split(" ").map(n => n.charAt(0)).join("").substring(0, 2).toUpperCase() || "AD";

    const newAdmin = {
      id: Date.now().toString(),
      name: computedName,
      email: emailVal,
      role: adminFormRole,
      lastActive: "Active Now",
      initials: computedInitials
    };

    const updatedAdmins = [newAdmin, ...admins];
    saveAdmins(updatedAdmins);

    // Add security log
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now().toString(),
      time: timeStr,
      text: `Granted ${adminFormRole} access to ${emailVal}`,
      type: "invite"
    };
    saveSecurityLogs([newLog, ...securityLogs]);

    // Reset inputs
    setAdminFormEmail("");
    if (!isGoogleSSO) {
      setAdminFormPassword("••••••••");
    }

    alert(`Successfully granted ${adminFormRole} access to ${emailVal}!`);
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke administrative access for ${name}?`)) {
      const updated = admins.filter(a => a.id !== id);
      saveAdmins(updated);

      // Add security log
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: Date.now().toString(),
        time: timeStr,
        text: `Revoked access for ${name}`,
        type: "error"
      };
      saveSecurityLogs([newLog, ...securityLogs]);
    }
  };

  // States for Slip and Category Management
  const [slipCategories, setSlipCategories] = useState<any[]>(() => {
    const saved = localStorage.getItem("adaptation_slip_categories");
    let loadedCats = [];
    if (saved) {
      try {
        loadedCats = JSON.parse(saved);
      } catch (e) {}
    }

    const defaults = [
      { id: "1", name: "World Cup", icon: "sports_soccer", status: "Active" },
      { id: "2", name: "Bet Builder", icon: "construction", status: "Active" },
      { id: "3", name: "Roll Over", icon: "cached", status: "Active" },
      { id: "4", name: "1 Cedi and a Dream", icon: "payments", status: "Active" },
      { id: "5", name: "Beticology", icon: "psychology", status: "Active" },
      { id: "6", name: "General / Long Bets", icon: "hourglass_empty", status: "Active" },
      { id: "7", name: "Engine Room", icon: "settings", status: "Active" }
    ];

    if (loadedCats.length > 0) {
      // Upgrade loaded cached categories to latest icons
      const upgraded = loadedCats.map((cat: any) => {
        let newIcon = cat.icon;
        if (cat.name === "World Cup" && (cat.icon === "public" || !cat.icon)) newIcon = "sports_soccer";
        else if (cat.name === "Roll Over" && (cat.icon === "loop" || !cat.icon)) newIcon = "cached";
        else if (cat.name === "1 Cedi and a Dream" && (cat.icon === "diamond" || !cat.icon)) newIcon = "payments";
        else if (cat.name === "Beticology" && (cat.icon === "science" || !cat.icon)) newIcon = "psychology";
        else if (cat.name === "General / Long Bets" && (cat.icon === "trending_up" || !cat.icon)) newIcon = "hourglass_empty";
        return { ...cat, icon: newIcon };
      });
      localStorage.setItem("adaptation_slip_categories", JSON.stringify(upgraded));
      return upgraded;
    }

    localStorage.setItem("adaptation_slip_categories", JSON.stringify(defaults));
    return defaults;
  });

  const [slips, setSlips] = useState<any[]>(() => {
    const saved = localStorage.getItem("adaptation_slips_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const defaults = [
      { id: "wc-1", category: "World Cup", matches: 9, odds: "12.40", bookingCode: "AF-WOR-1240", dateUploaded: "Jun 30, 2026" },
      { id: "wc-2", category: "World Cup", matches: 9, odds: "13.40", bookingCode: "AF-WOR-1340", dateUploaded: "Jun 30, 2026" },
      { id: "wc-3", category: "World Cup", matches: 9, odds: "14.40", bookingCode: "AF-WOR-1440", dateUploaded: "Jun 30, 2026" },
      { id: "wc-4", category: "World Cup", matches: 9, odds: "15.40", bookingCode: "AF-WOR-1540", dateUploaded: "Jun 30, 2026" },
      { id: "wc-5", category: "World Cup", matches: 9, odds: "16.40", bookingCode: "AF-WOR-1640", dateUploaded: "Jun 30, 2026" },
      
      { id: "bb-1", category: "Bet Builder", matches: 5, odds: "8.00", bookingCode: "AF-BET-800", dateUploaded: "Jun 30, 2026" },
      { id: "bb-2", category: "Bet Builder", matches: 5, odds: "8.10", bookingCode: "AF-BET-810", dateUploaded: "Jun 30, 2026" },
      { id: "bb-3", category: "Bet Builder", matches: 5, odds: "8.20", bookingCode: "AF-BET-820", dateUploaded: "Jun 30, 2026" },
      { id: "bb-4", category: "Bet Builder", matches: 5, odds: "8.30", bookingCode: "AF-BET-830", dateUploaded: "Jun 30, 2026" },
      { id: "bb-5", category: "Bet Builder", matches: 5, odds: "8.40", bookingCode: "AF-BET-840", dateUploaded: "Jun 30, 2026" },

      { id: "ro-1", category: "Roll Over", matches: 2, odds: "1.80", bookingCode: "AF-ROL-180", dateUploaded: "Jun 30, 2026" },
      { id: "ro-2", category: "Roll Over", matches: 2, odds: "1.81", bookingCode: "AF-ROL-181", dateUploaded: "Jun 30, 2026" },
      { id: "ro-3", category: "Roll Over", matches: 2, odds: "1.82", bookingCode: "AF-ROL-182", dateUploaded: "Jun 30, 2026" },
      { id: "ro-4", category: "Roll Over", matches: 2, odds: "1.83", bookingCode: "AF-ROL-183", dateUploaded: "Jun 30, 2026" },
      { id: "ro-5", category: "Roll Over", matches: 2, odds: "1.84", bookingCode: "AF-ROL-184", dateUploaded: "Jun 30, 2026" },

      { id: "cd-1", category: "1 Cedi and a Dream", matches: 25, odds: "950.00", bookingCode: "AF-ONE-95000", dateUploaded: "Jun 30, 2026" },
      { id: "cd-2", category: "1 Cedi and a Dream", matches: 25, odds: "951.00", bookingCode: "AF-ONE-95100", dateUploaded: "Jun 30, 2026" },
      { id: "cd-3", category: "1 Cedi and a Dream", matches: 25, odds: "952.00", bookingCode: "AF-ONE-95200", dateUploaded: "Jun 30, 2026" },
      { id: "cd-4", category: "1 Cedi and a Dream", matches: 25, odds: "953.00", bookingCode: "AF-ONE-95300", dateUploaded: "Jun 30, 2026" },
      { id: "cd-5", category: "1 Cedi and a Dream", matches: 25, odds: "954.00", bookingCode: "AF-ONE-95400", dateUploaded: "Jun 30, 2026" },

      { id: "bet-1", category: "Beticology", matches: 4, odds: "5.05", bookingCode: "AF-BIC-505", dateUploaded: "Jun 30, 2026" },
      { id: "bet-2", category: "Beticology", matches: 4, odds: "5.15", bookingCode: "AF-BIC-515", dateUploaded: "Jun 30, 2026" },
      { id: "bet-3", category: "Beticology", matches: 4, odds: "5.25", bookingCode: "AF-BIC-525", dateUploaded: "Jun 30, 2026" },
      { id: "bet-4", category: "Beticology", matches: 4, odds: "5.35", bookingCode: "AF-BIC-535", dateUploaded: "Jun 30, 2026" },
      { id: "bet-5", category: "Beticology", matches: 4, odds: "5.45", bookingCode: "AF-BIC-545", dateUploaded: "Jun 30, 2026" },

      { id: "lb-1", category: "General / Long Bets", matches: 12, odds: "20.50", bookingCode: "AF-LON-2050", dateUploaded: "Jun 30, 2026" },
      { id: "lb-2", category: "General / Long Bets", matches: 12, odds: "21.50", bookingCode: "AF-LON-2150", dateUploaded: "Jun 30, 2026" },
      { id: "lb-3", category: "General / Long Bets", matches: 12, odds: "22.50", bookingCode: "AF-LON-2250", dateUploaded: "Jun 30, 2026" },
      { id: "lb-4", category: "General / Long Bets", matches: 12, odds: "23.50", bookingCode: "AF-LON-2350", dateUploaded: "Jun 30, 2026" },
      { id: "lb-5", category: "General / Long Bets", matches: 12, odds: "24.50", bookingCode: "AF-LON-2450", dateUploaded: "Jun 30, 2026" },

      { id: "er-1", category: "Engine Room", matches: 3, odds: "3.05", bookingCode: "AF-ENG-305", dateUploaded: "Jun 30, 2026" },
      { id: "er-2", category: "Engine Room", matches: 3, odds: "3.15", bookingCode: "AF-ENG-315", dateUploaded: "Jun 30, 2026" },
      { id: "er-3", category: "Engine Room", matches: 3, odds: "3.25", bookingCode: "AF-ENG-325", dateUploaded: "Jun 30, 2026" },
      { id: "er-4", category: "Engine Room", matches: 3, odds: "3.35", bookingCode: "AF-ENG-335", dateUploaded: "Jun 30, 2026" },
      { id: "er-5", category: "Engine Room", matches: 3, odds: "3.45", bookingCode: "AF-ENG-345", dateUploaded: "Jun 30, 2026" }
    ];
    localStorage.setItem("adaptation_slips_list", JSON.stringify(defaults));
    return defaults;
  });

  const [categoryFormName, setCategoryFormName] = useState("");
  const [historyFilter, setHistoryFilter] = useState<string>("All");
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);

  // Custom alert and confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText
    });
  };

  const showAlert = (title: string, message: string, type: "success" | "error" | "info" = "success") => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  // Upload Slip Form States
  const [slipFormMatches, setSlipFormMatches] = useState<number | "">("");
  const [slipFormCategory, setSlipFormCategory] = useState("World Cup");
  const [slipFormOdds, setSlipFormOdds] = useState("");
  const [slipFormBookingCode, setSlipFormBookingCode] = useState("");

  useEffect(() => {
    // Record login event in security logs (once per session)
    if (auth.currentUser && !sessionStorage.getItem("adaptation_logged_login")) {
      const email = auth.currentUser.email || "abubakarsadikmusah2004@gmail.com";
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const logId = "login-" + Date.now();
      
      sessionStorage.setItem("adaptation_logged_login", "true");
      setDoc(doc(db, "security_logs", logId), {
        id: logId,
        time: timeStr,
        text: `Admin logged in: ${email} at ${timeStr} on ${dateStr}`,
        type: "invite"
      }).catch(err => console.error("Error creating login log:", err));
    }

    const unsubAdmins = onSnapshot(collection(db, "admins"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAdmins(list);
      localStorage.setItem("adaptation_admins_list", JSON.stringify(list));
    }, (err) => console.log("Admins database offline or not configured yet.", err));

    const unsubLogs = onSnapshot(collection(db, "security_logs"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSecurityLogs(list);
      localStorage.setItem("adaptation_security_logs", JSON.stringify(list));
    }, (err) => console.log("Security logs database offline or not configured yet.", err));

    const unsubCats = onSnapshot(collection(db, "categories"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSlipCategories(list);
      localStorage.setItem("adaptation_slip_categories", JSON.stringify(list));
    }, (err) => console.log("Categories database offline or not configured yet.", err));

    const unsubSlips = onSnapshot(collection(db, "slips"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSlips(list);
      localStorage.setItem("adaptation_slips_list", JSON.stringify(list));
    }, (err) => console.log("Slips database offline or not configured yet.", err));

    const unsubTeam = onSnapshot(collection(db, "team_members"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setTeamMembers(list);
      localStorage.setItem("adaptation_team_members", JSON.stringify(list));
    }, (err) => console.log("Team members database offline or not configured yet.", err));

    const unsubActivities = onSnapshot(collection(db, "activities"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => (b.id || "").localeCompare(a.id || ""));
      setActivities(list);
      localStorage.setItem("adaptation_activities_list", JSON.stringify(list));
    }, (err) => console.log("Activities database offline or not configured yet.", err));

    const unsubPayments = onSnapshot(doc(db, "payment_settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMomoProviderInput(data.momoProvider || "MTN");
        setMomoNumberInput(data.momoNumber || "055 776 5432");
        setMomoAccountNameInput(data.momoAccountName || "ADAPTATION FAMILY");
        setMomoReferenceInput(data.momoReference || "ADAPT FAMILY");
        setBankNameInput(data.bankName || "Ecobank Ghana");
        setBankAccountNumberInput(data.bankAccountNumber || "1441002345678");
        setBankAccountHolderInput(data.bankAccountHolder || "ADAPTATION FAMILY");
        setBankBranchInput(data.bankBranch || "Accra Mall Branch");
      }
    }, (err) => console.log("Payment settings loaded offline", err));

    return () => {
      unsubAdmins();
      unsubLogs();
      unsubCats();
      unsubSlips();
      unsubTeam();
      unsubActivities();
      unsubPayments();
    };
  }, []);

  const saveSlipCategories = async (updated: any[]) => {
    setSlipCategories(updated);
    localStorage.setItem("adaptation_slip_categories", JSON.stringify(updated));
    try {
      for (const cat of updated) {
        await setDoc(doc(db, "categories", cat.id || cat.name), {
          name: cat.name,
          icon: cat.icon || "receipt_long",
          status: cat.status || "Active"
        });
      }
      const currentIds = updated.map(c => c.id || c.name);
      for (const cat of slipCategories) {
        const catId = cat.id || cat.name;
        if (!currentIds.includes(catId)) {
          await deleteDoc(doc(db, "categories", catId));
        }
      }
    } catch (e) {
      console.error("Firestore Category sync error:", e);
    }
  };

  const parseMatchesValue = (val: any): number => {
    if (typeof val === 'number') {
      return isNaN(val) ? 0 : val;
    }
    if (!val) return 0;
    const parsed = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const saveSlips = async (updated: any[], slipToUpsert?: any, slipIdToDelete?: string) => {
    setSlips(updated);
    localStorage.setItem("adaptation_slips_list", JSON.stringify(updated));
    try {
      if (slipToUpsert) {
        await setDoc(doc(db, "slips", slipToUpsert.id), {
          category: slipToUpsert.category,
          matches: parseMatchesValue(slipToUpsert.matches),
          odds: slipToUpsert.odds,
          bookingCode: slipToUpsert.bookingCode || "",
          dateUploaded: slipToUpsert.dateUploaded || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        });
      } else if (slipIdToDelete) {
        await deleteDoc(doc(db, "slips", slipIdToDelete));
      } else {
        // Fallback: update everything if neither is specified
        for (const slip of updated) {
          await setDoc(doc(db, "slips", slip.id), {
            category: slip.category,
            matches: parseMatchesValue(slip.matches),
            odds: slip.odds,
            bookingCode: slip.bookingCode || "",
            dateUploaded: slip.dateUploaded || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          });
        }
        const currentIds = updated.map(s => s.id);
        for (const slip of slips) {
          if (!currentIds.includes(slip.id)) {
            await deleteDoc(doc(db, "slips", slip.id));
          }
        }
      }
    } catch (e) {
      console.error("Firestore Slips sync error:", e);
    }
  };

  // Edit Slip Modal States and Handlers
  const [isEditSlipModalOpen, setIsEditSlipModalOpen] = useState(false);
  const [editingSlip, setEditingSlip] = useState<any | null>(null);
  const [editSlipCategory, setEditSlipCategory] = useState("");
  const [editSlipMatches, setEditSlipMatches] = useState<number | "">("");
  const [editSlipOdds, setEditSlipOdds] = useState("");
  const [editSlipBookingCode, setEditSlipBookingCode] = useState("");
  const [editSlipDateUploaded, setEditSlipDateUploaded] = useState("");

  const handleOpenEditSlipModal = (slip: any) => {
    setEditingSlip(slip);
    setEditSlipCategory(slip.category);
    setEditSlipMatches(slip.matches);
    setEditSlipOdds(slip.odds);
    setEditSlipBookingCode(slip.bookingCode);
    setEditSlipDateUploaded(slip.dateUploaded || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
    setIsEditSlipModalOpen(true);
  };

  const handleSaveEditSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlip) return;
    const updated = slips.map(s => s.id === editingSlip.id ? {
      ...s,
      category: editSlipCategory,
      matches: parseMatchesValue(editSlipMatches),
      odds: editSlipOdds,
      bookingCode: editSlipBookingCode,
      dateUploaded: editSlipDateUploaded
    } : s);
    const editedSlip = updated.find(s => s.id === editingSlip.id);
    saveSlips(updated, editedSlip);
    
    // Push modification log to activity feed
    const logTitle = `Ticket Updated: ${editSlipBookingCode} in ${editSlipCategory}`;
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: "neutral" as const,
      icon: "edit",
      title: logTitle,
      time: "Just now",
      author: adminName,
      tag: "Modified"
    };
    saveActivities([newActivity, ...activities]);

    setIsEditSlipModalOpen(false);
    setEditingSlip(null);
    showAlert("Success", "Sports betting slip updated successfully!", "success");
  };

  const handleDeleteSlip = async (slipId: string) => {
    const slipToDelete = slips.find(s => s.id === slipId);
    if (!slipToDelete) return;
    
    try {
      // 1. Delete slip directly from Firestore
      await deleteDoc(doc(db, "slips", slipId));

      // 2. Update local slips list
      setSlips(prev => {
        const updated = prev.filter(s => s.id !== slipId);
        localStorage.setItem("adaptation_slips_list", JSON.stringify(updated));
        return updated;
      });

      // 3. Decrement the slips count for the category
      setSlipCategories(prev => {
        const updatedCategories = prev.map(c => 
          c.name === slipToDelete.category 
            ? { ...c, slipsCount: Math.max(0, (c.slipsCount || 0) - 1) } 
            : c
        );
        localStorage.setItem("adaptation_slip_categories", JSON.stringify(updatedCategories));
        
        // Sync specific category update to Firestore
        const affectedCategory = updatedCategories.find(c => c.name === slipToDelete.category);
        if (affectedCategory) {
          setDoc(doc(db, "categories", affectedCategory.id || affectedCategory.name), {
            name: affectedCategory.name,
            icon: affectedCategory.icon || "receipt_long",
            status: affectedCategory.status || "Active"
          }).catch(err => console.error("Error updating category count:", err));
        }
        return updatedCategories;
      });

      // 4. Push activity log
      const logTitle = `Ticket Deleted: ${slipToDelete.bookingCode} from ${slipToDelete.category}`;
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: "error" as const,
        icon: "delete_forever",
        title: logTitle,
        time: "Just now",
        author: adminName,
        tag: "Removed"
      };
      setActivities(prev => {
        const updatedActivities = [newActivity, ...prev];
        localStorage.setItem("adaptation_activities_list", JSON.stringify(updatedActivities));
        return updatedActivities;
      });

      // Sync activity to Firestore
      await setDoc(doc(db, "activities", newActivity.id), {
        type: newActivity.type,
        icon: newActivity.icon,
        title: newActivity.title,
        time: newActivity.time,
        author: newActivity.author,
        tag: newActivity.tag
      });
    } catch (error) {
      console.error("Delete slip error:", error);
    }
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
  const [momoProviderInput, setMomoProviderInput] = useState(() => localStorage.getItem("momo_provider") || "MTN");
  const [momoNumberInput, setMomoNumberInput] = useState(() => localStorage.getItem("momo_number") || "055 776 5432");
  const [momoAccountNameInput, setMomoAccountNameInput] = useState(() => localStorage.getItem("momo_account_name") || "ADAPTATION FAMILY");
  const [momoReferenceInput, setMomoReferenceInput] = useState(() => localStorage.getItem("momo_reference") || "ADAPT FAMILY");

  // Bank details
  const [bankNameInput, setBankNameInput] = useState(() => localStorage.getItem("bank_name") || "Ecobank Ghana");
  const [bankAccountNumberInput, setBankAccountNumberInput] = useState(() => localStorage.getItem("bank_account_number") || "1441002345678");
  const [bankAccountHolderInput, setBankAccountHolderInput] = useState(() => localStorage.getItem("bank_account_holder") || "ADAPTATION FAMILY");
  const [bankBranchInput, setBankBranchInput] = useState(() => localStorage.getItem("bank_branch") || "Accra Mall Branch");

  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  const saveTeamMembers = async (newTeam: TeamMember[]) => {
    setTeamMembers(newTeam);
    localStorage.setItem("adaptation_team_members", JSON.stringify(newTeam));
    try {
      for (const m of newTeam) {
        await setDoc(doc(db, "team_members", m.id), {
          name: m.name,
          role: m.role,
          image: m.image
        });
      }
      const currentIds = newTeam.map(m => m.id);
      for (const m of teamMembers) {
        if (!currentIds.includes(m.id)) {
          await deleteDoc(doc(db, "team_members", m.id));
        }
      }
    } catch (e) {
      console.error("Firestore Team sync error:", e);
    }
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

  const handleSavePayments = async () => {
    localStorage.setItem("momo_provider", momoProviderInput);
    localStorage.setItem("momo_number", momoNumberInput);
    localStorage.setItem("momo_account_name", momoAccountNameInput);
    localStorage.setItem("momo_reference", momoReferenceInput);
    localStorage.setItem("bank_name", bankNameInput);
    localStorage.setItem("bank_account_number", bankAccountNumberInput);
    localStorage.setItem("bank_account_holder", bankAccountHolderInput);
    localStorage.setItem("bank_branch", bankBranchInput);
    
    try {
      await setDoc(doc(db, "payment_settings", "global"), {
        momoProvider: momoProviderInput,
        momoNumber: momoNumberInput,
        momoAccountName: momoAccountNameInput,
        momoReference: momoReferenceInput,
        bankName: bankNameInput,
        bankAccountNumber: bankAccountNumberInput,
        bankAccountHolder: bankAccountHolderInput,
        bankBranch: bankBranchInput
      });
    } catch (e) {
      console.error("Firestore Payment settings sync error:", e);
    }
    
    // Dispatch custom storage event so other views can update immediately
    window.dispatchEvent(new Event("storage"));

    setPaymentSuccessMessage("Payment settings synchronized with Firestore database successfully!");
    setTimeout(() => setPaymentSuccessMessage(null), 3500);
  };

  const handleCancelPayments = () => {
    setMomoProviderInput(localStorage.getItem("momo_provider") || "MTN");
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
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem("adaptation_activities_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Form states for uploading a new betting slip via Pop-up Modal
  const [isNewSlipModalOpen, setIsNewSlipModalOpen] = useState(false);
  const [newSlipMatches, setNewSlipMatches] = useState<number | "">("");
  const [newSlipCategory, setNewSlipCategory] = useState("World Cup");
  const [newSlipOdds, setNewSlipOdds] = useState("");
  const [newSlipBookingCode, setNewSlipBookingCode] = useState("");

  const handleModalUploadSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlipMatches || !newSlipOdds || !newSlipBookingCode) {
      alert("Please complete all fields.");
      return;
    }

    // Create new slip item
    const newSlip = {
      id: Date.now().toString(),
      category: newSlipCategory,
      matches: parseMatchesValue(newSlipMatches),
      odds: newSlipOdds,
      bookingCode: newSlipBookingCode,
      dateUploaded: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    saveSlips([newSlip, ...slips]);

    // Increment the slips count for selected category
    const updatedCategories = slipCategories.map(c => 
      c.name === newSlipCategory 
        ? { ...c, slipsCount: c.slipsCount + 1 } 
        : c
    );
    saveSlipCategories(updatedCategories);

    // Push to activity logs
    const logTitle = `New Ticket Published: ${newSlipCategory} with ${newSlipMatches} Matches @ ${newSlipOdds} Odds (${newSlipBookingCode})`;
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: "success" as const,
      icon: "check_circle",
      title: logTitle,
      time: "Just now",
      author: adminName,
      tag: "Published"
    };
    saveActivities([newActivity, ...activities]);

    // Reset form fields
    setNewSlipMatches("");
    setNewSlipOdds("");
    setNewSlipBookingCode("");
    setIsNewSlipModalOpen(false);

    alert(`Sports betting slip ${newSlip.bookingCode} successfully published!`);
  };

  const handleDeleteActivity = (id: string) => {
    saveActivities(activities.filter(activity => activity.id !== id));
  };

  // Get dynamic count of slips for a specific category
  const getSlipsCountByCategory = (categoryName: string) => {
    return slips.filter(s => s.category.toLowerCase() === categoryName.toLowerCase()).length;
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
            <span className="text-xs font-bold uppercase tracking-wider">Team & Payment</span>
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
            <span className="text-xs font-bold uppercase tracking-wider">Slip Management</span>
          </button>

          <button 
            onClick={() => setActiveTab("admin-access")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer text-left ${
              activeTab === "admin-access" 
                ? "bg-white text-[#526600] font-bold shadow-sm border-l-4 border-[#f3c623]" 
                : "text-[#5d5e64] hover:bg-neutral-200/50 hover:text-[#1a1c1d]"
            }`}
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            <span className="text-xs font-bold uppercase tracking-wider">Admin Access</span>
          </button>
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-neutral-200/60">
          <button 
            onClick={handleLogout}
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
                  src={adminImage} 
                  alt={adminName} 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-[11px] font-bold text-[#1a1c1d] leading-none">{adminName}</span>
                <span className="text-[9px] text-[#5d5e64] font-medium mt-0.5 leading-none">Admin</span>
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
                    <span className="text-xs font-bold uppercase tracking-wider">Team & Payment</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab("slips"); setIsMobileNavOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer text-left ${
                      activeTab === "slips" ? "bg-neutral-100 text-[#526600] font-bold" : "text-[#5d5e64]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Slip Management</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab("admin-access"); setIsMobileNavOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer text-left ${
                      activeTab === "admin-access" ? "bg-neutral-100 text-[#526600] font-bold" : "text-[#5d5e64]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Admin Access</span>
                  </button>
                </div>

                <div className="p-4 border-t border-neutral-100">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 text-[#ba1a1a] font-bold rounded-xl text-xs uppercase tracking-wider transition-all">
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
                    <span className="text-3xl font-extrabold tracking-tight text-emerald-700">{getSlipsCountByCategory("World Cup")}</span>
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
                    <span className="text-3xl font-extrabold tracking-tight text-indigo-700">{getSlipsCountByCategory("Bet Builder")}</span>
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
                    <span className="text-3xl font-extrabold tracking-tight text-violet-700">{getSlipsCountByCategory("Roll Over")}</span>
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
                    <span className="text-3xl font-extrabold tracking-tight text-amber-700">{getSlipsCountByCategory("1 Cedi and a Dream")}</span>
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
                    <span className="text-3xl font-extrabold tracking-tight text-rose-700">{getSlipsCountByCategory("Beticology")}</span>
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
                    <span className="text-3xl font-extrabold tracking-tight text-teal-700">{getSlipsCountByCategory("General / Long Bets")}</span>
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
                    <span className="text-3xl font-extrabold tracking-tight text-sky-700">{getSlipsCountByCategory("Engine Room")}</span>
                    <span className="text-[10px] text-sky-600/80 font-semibold uppercase tracking-wider mt-1">Booking Codes</span>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-neutral-900 border border-neutral-850 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden text-white col-span-2 sm:col-span-1">
                   <div>
                     <h4 className="font-display text-xs font-extrabold uppercase tracking-widest text-[#f3c623]">Quick Actions</h4>
                     <p className="text-[11px] text-neutral-400 mt-0.5 font-medium leading-tight">Create and publish a brand new sports betting forecast slip directly into the user ecosystem.</p>
                   </div>
                   <div className="mt-4">
                     <button 
                       onClick={() => setIsNewSlipModalOpen(true)}
                       className="bg-[#f3c623] text-black hover:bg-[#e2b516] py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 w-full font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm"
                       title="ADD A NEW SLIP"
                     >
                       <span className="material-symbols-outlined text-lg font-bold">add_circle</span>
                       <span>ADD A NEW SLIP</span>
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
                          saveActivities([]);
                          setSearchQuery("");
                          alert("All system activity logs have been cleared from the database.");
                        }}
                        className="text-[#526600] font-sans text-xs font-bold hover:underline cursor-pointer"
                      >
                        Clear Logs
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

                        <div className="flex flex-col gap-2.5">
                          <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wider">Service Provider (Scroll to Choose)</label>
                          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-neutral-200 scroll-smooth snap-x">
                            {[
                              {
                                id: "MTN",
                                name: "MTN MoMo",
                                logo: "https://upload.wikimedia.org/wikipedia/commons/a/af/MTN_Logo.svg",
                                brandColor: "bg-[#FFCC00]",
                                borderColor: "border-[#FFCC00]/60",
                                textColor: "text-[#8f7200]",
                                lightBg: "bg-[#FFCC00]/10",
                              },
                              {
                                id: "Telecel",
                                name: "Telecel Cash",
                                logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Telecel_Group.jpg",
                                brandColor: "bg-[#E60000]",
                                borderColor: "border-[#E60000]/60",
                                textColor: "text-[#E60000]",
                                lightBg: "bg-[#E60000]/10",
                              },
                              {
                                id: "AirtelTigo",
                                name: "AirtelTigo (AT)",
                                logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/AirtelTigo_logo.png",
                                brandColor: "bg-[#0056B3]",
                                borderColor: "border-[#0056B3]/60",
                                textColor: "text-[#0056B3]",
                                lightBg: "bg-[#0056B3]/10",
                              },
                            ].map((provider) => {
                              const isSelected = momoProviderInput === provider.id;
                              return (
                                <button
                                  key={provider.id}
                                  type="button"
                                  onClick={() => setMomoProviderInput(provider.id)}
                                  className={`flex-shrink-0 snap-center w-[130px] rounded-2xl border-2 p-4 flex flex-col items-center justify-between gap-3 transition-all duration-300 cursor-pointer ${
                                    isSelected
                                      ? `${provider.borderColor} bg-white shadow-md ring-2 ring-[#f3c623]/20 scale-[1.02]`
                                      : "border-neutral-200 bg-white/70 hover:border-neutral-300 hover:bg-white"
                                  }`}
                                >
                                  {/* Big Logo Frame */}
                                  <div className="w-16 h-16 rounded-xl flex items-center justify-center p-2 bg-neutral-50 border border-neutral-100">
                                    <img
                                      src={provider.logo}
                                      alt={provider.name}
                                      className="w-full h-full object-contain"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        if (provider.id === "Telecel") {
                                          (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/e/ea/Telecel_Group_Logo.svg";
                                        } else if (provider.id === "AirtelTigo") {
                                          (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/2/22/AirtelTigo_logo.png";
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="text-center">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider block text-neutral-400">
                                      {provider.id}
                                    </span>
                                    <span className={`text-[11px] font-black ${isSelected ? provider.textColor : 'text-neutral-700'}`}>
                                      {provider.name}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected Provider Highlight (Displays its Name and Big Logo) */}
                          <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center gap-5 transition-all duration-300">
                            <div className="w-20 h-20 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-center p-3 shrink-0 shadow-sm">
                              <img
                                src={
                                  momoProviderInput === "MTN"
                                    ? "https://upload.wikimedia.org/wikipedia/commons/a/af/MTN_Logo.svg"
                                    : momoProviderInput === "Telecel"
                                    ? "https://upload.wikimedia.org/wikipedia/commons/2/23/Telecel_Group.jpg"
                                    : "https://upload.wikimedia.org/wikipedia/commons/e/e5/AirtelTigo_logo.png"
                                }
                                alt="Selected Provider Logo"
                                className="w-full h-full object-contain transition-transform duration-300 scale-110"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  if (momoProviderInput === "Telecel") {
                                    (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/e/ea/Telecel_Group_Logo.svg";
                                  } else if (momoProviderInput === "AirtelTigo") {
                                    (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/2/22/AirtelTigo_logo.png";
                                  }
                                }}
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Active Choice</span>
                              <h4 className="text-base font-black text-neutral-900 font-display">
                                {momoProviderInput === "MTN"
                                  ? "MTN Mobile Money"
                                  : momoProviderInput === "Telecel"
                                  ? "Telecel Cash Ghana"
                                  : "AirtelTigo (AT) Money"}
                              </h4>
                              <p className="text-[11px] text-neutral-500 font-medium">
                                The system will render this provider's branding & logo.
                              </p>
                            </div>
                          </div>
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
                        The public Mobile Money card will show: <span className="font-black text-[#1a1c1d]">"Pay to: {momoAccountNameInput || '...'}"</span> via <span className="font-black text-[#1a1c1d]">{momoProviderInput || 'Mobile Money'} ({momoNumberInput || '...'})</span> with Reference <span className="font-black text-[#1a1c1d]">"{momoReferenceInput || '...'}"</span>.
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
                  </div>                   {/* Growth Insights card */}
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
                          {slipCategories.reduce((acc, curr) => acc + (curr.status === "Active" ? slips.filter(s => s.category === curr.name).length : 0), 0)}
                        </span>
                        <span className="text-[9px] font-bold text-[#5d5e64] uppercase tracking-wider mt-1">Active Forecasts</span>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Booking Codes History Directory */}
                  <div className="bg-white border border-neutral-200 rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-5 w-full mt-6">
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-extrabold text-[#1a1c1d] flex items-center gap-2">
                        <span className="material-symbols-outlined text-black bg-[#f3c623] p-1.5 rounded-xl text-lg font-bold">history</span>
                        Booking Code Directory & History
                      </h3>
                      <p className="text-[11px] text-[#5d5e64] mt-1">Manage and edit active sports betting slips currently visible in the ecosystem.</p>
                    </div>

                    {(() => {
                      const filteredSlips = historyFilter === "All"
                        ? slips
                        : slips.filter(s => s.category === historyFilter);

                      return (
                        <>
                          {/* Category Filter Tabs with Horizontal Scroll & "Clear Category" button */}
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                              <button
                                onClick={() => setHistoryFilter("All")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                  historyFilter === "All"
                                    ? "bg-[#f3c623] text-black shadow-sm"
                                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                                }`}
                              >
                                All ({slips.length})
                              </button>
                              {slipCategories.map((cat) => {
                                const count = slips.filter(s => s.category === cat.name).length;
                                return (
                                  <button
                                    key={cat.id || cat.name}
                                    onClick={() => setHistoryFilter(cat.name)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                      historyFilter === cat.name
                                        ? "bg-[#f3c623] text-black shadow-sm"
                                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                                    }`}
                                  >
                                    {cat.name} ({count})
                                  </button>
                                );
                              })}
                            </div>

                            {historyFilter !== "All" && (
                              <button
                                onClick={async () => {
                                  const toDelete = slips.filter(s => s.category === historyFilter);
                                  if (toDelete.length === 0) {
                                    return;
                                  }
                                  try {
                                    // 1. Update local slips list functionally
                                    setSlips(prev => {
                                      const remaining = prev.filter(s => s.category !== historyFilter);
                                      localStorage.setItem("adaptation_slips_list", JSON.stringify(remaining));
                                      return remaining;
                                    });

                                    // 2. Delete the slips from Firestore
                                    for (const slip of toDelete) {
                                      try {
                                        await deleteDoc(doc(db, "slips", slip.id));
                                      } catch (e) {
                                        console.warn("Firestore delete failed: ", e);
                                      }
                                    }

                                    // 3. Reset category count in state and Firestore
                                    setSlipCategories(prev => {
                                      const updatedCats = prev.map(c => 
                                        c.name === historyFilter 
                                          ? { ...c, slipsCount: 0 } 
                                          : c
                                      );
                                      localStorage.setItem("adaptation_slip_categories", JSON.stringify(updatedCats));

                                      // Sync to Firestore
                                      const affectedCat = updatedCats.find(c => c.name === historyFilter);
                                      if (affectedCat) {
                                        setDoc(doc(db, "categories", affectedCat.id || affectedCat.name), {
                                          name: affectedCat.name,
                                          icon: affectedCat.icon || "receipt_long",
                                          status: affectedCat.status || "Active"
                                        }).catch(err => console.error("Error resetting category count:", err));
                                      }
                                      return updatedCats;
                                    });

                                    // 4. Log security event matching firestore.rules schema (must have time, text, type)
                                    try {
                                      const logId = Date.now().toString();
                                      const logPayload = {
                                        time: new Date().toLocaleString(),
                                        text: `Cleared all booking codes in category "${historyFilter}" by ${adminEmail}`,
                                        type: "Security"
                                      };
                                      await setDoc(doc(db, "security_logs", logId), logPayload);
                                      
                                      // Update local security logs state
                                      setSecurityLogs(prev => {
                                        const updatedLogs = [{ id: logId, ...logPayload }, ...prev];
                                        localStorage.setItem("adaptation_security_logs", JSON.stringify(updatedLogs));
                                        return updatedLogs;
                                      });
                                    } catch (err) {
                                      console.error("Failed to write security log:", err);
                                    }

                                    // 5. Reset filter back to All
                                    setHistoryFilter("All");
                                  } catch (error) {
                                    console.error("Clear category error:", error);
                                  }
                                }}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-error rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start lg:self-auto"
                              >
                                <span className="material-symbols-outlined text-sm font-bold">delete_sweep</span>
                                <span>Clear Category</span>
                              </button>
                            )}
                          </div>

                          {/* Desktop View Table */}
                          <div className="hidden md:block overflow-x-auto w-full border border-neutral-100 rounded-xl">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-neutral-50 text-[10px] font-bold text-[#5d5e64] uppercase tracking-wider border-b border-neutral-100">
                                  <th className="py-3 px-4">Booking Code</th>
                                  <th className="py-3 px-4">Category</th>
                                  <th className="py-3 px-4 text-center">Matches</th>
                                  <th className="py-3 px-4 text-center">Odds</th>
                                  <th className="py-3 px-4">Uploaded Date</th>
                                  <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-100 text-xs">
                                {filteredSlips.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="py-8 text-center text-neutral-400 font-medium">
                                      {historyFilter === "All"
                                        ? "No booking codes uploaded yet. Use the form on the right to upload one."
                                        : `No booking codes currently under the "${historyFilter}" category.`}
                                    </td>
                                  </tr>
                                ) : (
                                  filteredSlips.map((slip) => (
                                    <tr key={slip.id} className="hover:bg-neutral-50/50 transition-colors">
                                      <td className="py-3 px-4 font-mono font-bold text-neutral-800">{slip.bookingCode}</td>
                                      <td className="py-3 px-4">
                                        <span className="bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                          {slip.category}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-center font-medium text-neutral-600">{slip.matches} Matches</td>
                                      <td className="py-3 px-4 text-center font-bold text-neutral-900">{slip.odds}</td>
                                      <td className="py-3 px-4 text-neutral-500">{slip.dateUploaded || "Jun 30, 2026"}</td>
                                      <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end gap-2">
                                          <button
                                            onClick={() => handleOpenEditSlipModal(slip)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                            title="Edit Slip"
                                          >
                                            <span className="material-symbols-outlined text-sm font-bold">edit</span>
                                          </button>
                                          <button
                                            onClick={() => handleDeleteSlip(slip.id)}
                                            className="p-1.5 text-error hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                            title="Delete Slip"
                                          >
                                            <span className="material-symbols-outlined text-sm font-bold">delete</span>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile View Stack */}
                          <div className="block md:hidden flex flex-col gap-3">
                            {filteredSlips.length === 0 ? (
                              <div className="py-8 text-center text-neutral-400 font-medium text-xs">
                                {historyFilter === "All"
                                  ? "No booking codes uploaded yet. Use the form on the right to upload one."
                                  : `No booking codes currently under the "${historyFilter}" category.`}
                              </div>
                            ) : (
                              filteredSlips.map((slip) => (
                                <div key={slip.id} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 flex flex-col gap-2.5">
                                  <div className="flex justify-between items-start">
                                    <span className="font-mono font-bold text-xs text-neutral-800 bg-white border border-neutral-200 px-2 py-1 rounded">
                                      {slip.bookingCode}
                                    </span>
                                    <span className="bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                      {slip.category}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600">
                                    <div>
                                      <span className="text-neutral-400">Matches:</span> <strong className="text-neutral-800">{slip.matches} Matches</strong>
                                    </div>
                                    <div>
                                      <span className="text-neutral-400">Odds:</span> <strong className="text-neutral-800">{slip.odds}</strong>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-neutral-400">Uploaded:</span> <strong className="text-neutral-800">{slip.dateUploaded || "Jun 30, 2026"}</strong>
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2 border-t border-neutral-200/50 pt-2 mt-1">
                                    <button
                                      onClick={() => handleOpenEditSlipModal(slip)}
                                      className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <span className="material-symbols-outlined text-xs">edit</span> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSlip(slip.id)}
                                      className="px-3 py-1.5 text-error hover:bg-red-50 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <span className="material-symbols-outlined text-xs">delete</span> Delete
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      );
                    })()}
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
                          matches: parseMatchesValue(slipFormMatches),
                          odds: slipFormOdds,
                          bookingCode: slipFormBookingCode,
                          dateUploaded: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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
                          author: adminName,
                          tag: "Published"
                        };
                        saveActivities([newActivity, ...activities]);

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

          {activeTab === "admin-access" && (
            <div className="flex flex-col gap-6 animate-fade-in w-full">
              {/* Page Header */}
              <div className="mb-2">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1a1c1d] tracking-tight">Admin Access Management</h1>
                <p className="text-xs sm:text-sm text-[#5d5e64] mt-1">Control the keys to the elite stadium. Add new administrators, manage existing permissions, and ensure safety guidelines are upheld.</p>
              </div>

              {/* Bento Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start w-full">
                
                {/* Section 1: Add Administrator Form (Bento Large) */}
                <section className="lg:col-span-7 flex flex-col gap-5 w-full">
                  <div className="bg-white border border-neutral-200 rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-6 w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xs font-extrabold uppercase tracking-widest text-neutral-400">Add New Administrator</h3>
                      <span className="bg-[#f3c623]/20 text-[#8f7200] px-3 py-1 rounded-full text-[10px] font-bold">Security Level 1</span>
                    </div>

                    <form onSubmit={handleGrantAdminAccess} className="flex flex-col gap-5">
                      
                      {/* Google Authentication SSO Option */}
                      <div className={`p-4 rounded-2xl border transition-all duration-300 ${isGoogleSSO ? 'bg-[#526600]/5 border-[#526600]/30' : 'bg-neutral-50 border-neutral-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-xl shadow-xs flex items-center justify-center border border-neutral-200">
                              <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-neutral-800 block">Google SSO Domain Auth</span>
                              <span className="text-[9px] text-[#5d5e64] block">Verify instantly via Workspace SSO account</span>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={isGoogleSSO}
                              onChange={(e) => {
                                setIsGoogleSSO(e.target.checked);
                                setAdminFormEmail("");
                              }}
                              className="sr-only peer" 
                            />
                            <div className="w-9 h-5 bg-neutral-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#526600]" />
                          </label>
                        </div>
                        
                        <div className="relative">
                          <input 
                            type="email"
                            required={isGoogleSSO}
                            disabled={!isGoogleSSO}
                            value={isGoogleSSO ? adminFormEmail : ""}
                            onChange={(e) => setAdminFormEmail(e.target.value)}
                            placeholder={isGoogleSSO ? "Enter administrator's organization email" : "SSO disabled - use manual fields below"}
                            className={`w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] ${!isGoogleSSO ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                          <p className="text-[10px] text-neutral-400 mt-2 px-1">Allows secure passwordless sign-on using verified organization credentials.</p>
                        </div>
                      </div>

                      {/* Manual / Verification Method */}
                      <div className="flex items-center gap-4 text-neutral-300">
                        <div className="h-[1px] flex-1 bg-neutral-200"></div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">OR</span>
                        <div className="h-[1px] flex-1 bg-neutral-200"></div>
                      </div>

                      <div className={`p-4 rounded-2xl border transition-all duration-300 ${!isGoogleSSO ? 'bg-[#f3c623]/5 border-[#f3c623]' : 'bg-neutral-50 border-neutral-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-neutral-800">Email Verification & Password Method</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={!isGoogleSSO}
                              onChange={(e) => {
                                setIsGoogleSSO(!e.target.checked);
                                setAdminFormEmail("");
                              }}
                              className="sr-only peer" 
                            />
                            <div className="w-9 h-5 bg-neutral-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f3c623]" />
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Direct Email</label>
                            <input 
                              type="email"
                              required={!isGoogleSSO}
                              disabled={isGoogleSSO}
                              value={!isGoogleSSO ? adminFormEmail : ""}
                              onChange={(e) => setAdminFormEmail(e.target.value)}
                              placeholder={isGoogleSSO ? "Disabled" : "e.g. coach@adaptation.com"}
                              className={`bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] ${isGoogleSSO ? 'opacity-40 cursor-not-allowed' : ''}`}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Temporary Password</label>
                            <div className="relative">
                              <input 
                                type="text"
                                required={!isGoogleSSO}
                                disabled={isGoogleSSO}
                                value={isGoogleSSO ? "" : adminFormPassword}
                                onChange={(e) => setAdminFormPassword(e.target.value)}
                                placeholder={isGoogleSSO ? "Disabled" : "Enter or auto-generate"}
                                className={`w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] pr-10 ${isGoogleSSO ? 'opacity-40 cursor-not-allowed' : ''}`}
                              />
                              <span className="material-symbols-outlined absolute right-3 top-3 text-neutral-400 text-sm">visibility</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-2 px-1">An invitation with verification details is sent instantly to setup passwordless verification flow.</p>
                      </div>

                      {/* Role Selector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Access Level / Authorization Role</label>
                        <select 
                          value={adminFormRole} 
                          onChange={(e) => setAdminFormRole(e.target.value)}
                          className="bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="Standard Admin">Standard Admin (Manage Slips & Teams)</option>
                          <option value="Super Admin">Super Admin (Full System Access)</option>
                        </select>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-4 rounded-xl bg-[#f3c623] hover:bg-[#e0b418] text-black font-black text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer flex justify-center items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">shield_person</span>
                        <span>Grant Administrative Access</span>
                      </button>

                    </form>
                  </div>
                </section>

                {/* Section 2: Platform Integrity & Security Logs (Bento Small) */}
                <section className="lg:col-span-5 flex flex-col gap-6 w-full">
                  
                  {/* Platform Integrity Card */}
                  <div className="bg-neutral-900 border border-neutral-850 rounded-[24px] p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[190px]">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#f3c623]"></div>
                    <div>
                      <h3 className="font-display text-xs font-extrabold uppercase tracking-widest text-[#f3c623]">Platform Integrity</h3>
                      <div className="flex justify-between items-end mt-6 mb-2">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Active Super Admins</span>
                        <span className="text-3xl font-black text-white">{admins.filter(a => a.role === "Super Admin").length.toString().padStart(2, '0')}</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#f3c623] transition-all duration-500 animate-pulse" 
                          style={{ width: `${Math.min(100, (admins.filter(a => a.role === "Super Admin").length / 10) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-3 leading-relaxed">
                        Security protocols advise keeping Super Admin count below 5 to reduce structural system vulnerability.
                      </p>
                    </div>
                  </div>

                  {/* Recent Logs Card */}
                  <div className="bg-white border border-neutral-200 rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-4 w-full">
                    <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                      <h3 className="font-display text-xs font-extrabold uppercase tracking-widest text-neutral-400">Recent Security Logs</h3>
                      {securityLogs.length > 0 && (
                        <button
                          onClick={handleClearLogs}
                          className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide bg-red-50 hover:bg-red-100 text-[#ba1a1a] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                          title="Clear security logs instantly"
                        >
                          <span className="material-symbols-outlined text-xs font-bold">delete_sweep</span>
                          <span>Clear Logs</span>
                        </button>
                      )}
                    </div>
                    <div className="space-y-3 mt-2">
                      {securityLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 text-xs border-b border-neutral-50 pb-2 last:border-0 last:pb-0">
                          <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.type === 'error' ? 'bg-[#ba1a1a]' : log.type === 'invite' ? 'bg-green-500' : 'bg-[#f3c623]'}`} />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-400 font-mono text-[9px]">{log.time}</span>
                              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                                {log.type === 'error' ? 'AUTH REVOKED' : log.type === 'invite' ? 'ACCESS GRANTED' : 'SYSTEM LOG'}
                              </span>
                            </div>
                            <span className="text-neutral-700 font-medium mt-0.5">{log.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => alert("Current session security logs saved to administrative console partition.")} 
                      className="mt-2 text-neutral-500 hover:text-[#526600] font-bold text-[10px] uppercase tracking-wider text-left hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">history_edu</span>
                      <span>Export Full Audit Trail</span>
                    </button>
                  </div>

                </section>

                {/* Section 3: Current Administrators Table (Bento Full Width) */}
                <section className="lg:col-span-12 w-full mt-2">
                  <div className="bg-white border border-neutral-200 rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-5 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-extrabold text-[#1a1c1d] flex items-center gap-2">
                          <span className="material-symbols-outlined text-black bg-[#f3c623] p-1.5 rounded-xl text-lg font-bold">shield_person</span>
                          Current Administrators
                        </h3>
                        <p className="text-[11px] text-[#5d5e64] mt-1">Review, search and revoke roles for team managers and systems architects.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Search field */}
                        <div className="relative w-full sm:w-64">
                          <input 
                            type="text"
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                            placeholder="Filter by name or email..."
                            className="bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623] w-full"
                          />
                          <span className="material-symbols-outlined absolute left-3 top-3 text-neutral-400 text-xs">search</span>
                        </div>
                        <button 
                          onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8," + "Name,Email,Role,LastActive\n" + admins.map(a => `"${a.name}","${a.email}","${a.role}","${a.lastActive}"`).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "adaptation_admins.csv");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="px-4 py-2.5 border border-neutral-200 hover:bg-neutral-100 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">download</span>
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto w-full border border-neutral-100 rounded-xl mt-2">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 text-[10px] font-bold text-[#5d5e64] uppercase tracking-wider border-b border-neutral-100">
                            <th className="py-4 px-4 sm:px-6">Admin User</th>
                            <th className="py-4 px-4 sm:px-6">Email Address</th>
                            <th className="py-4 px-4 sm:px-6">Access Level</th>
                            <th className="py-4 px-4 sm:px-6">Last Active</th>
                            <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-xs">
                          {admins.filter(a => {
                            const query = adminSearch.toLowerCase().trim();
                            return a.name.toLowerCase().includes(query) || a.email.toLowerCase().includes(query);
                          }).length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-neutral-400 font-medium">
                                No administrators match your search filter criteria.
                              </td>
                            </tr>
                          ) : (
                            admins.filter(a => {
                              const query = adminSearch.toLowerCase().trim();
                              return a.name.toLowerCase().includes(query) || a.email.toLowerCase().includes(query);
                            }).map((admin) => (
                              <tr key={admin.id} className="hover:bg-neutral-50/30 transition-colors">
                                <td className="py-4 px-4 sm:px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 text-[10px] border border-neutral-200">
                                      {admin.initials || "AD"}
                                    </div>
                                    <span className="font-semibold text-[#1a1c1d]">{admin.name}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 sm:px-6 font-mono text-neutral-500">{admin.email}</td>
                                <td className="py-4 px-4 sm:px-6">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                                    admin.role === 'Super Admin' 
                                      ? 'bg-neutral-900 text-white' 
                                      : 'bg-neutral-100 text-neutral-800 border border-neutral-200/50'
                                  }`}>
                                    {admin.role}
                                  </span>
                                </td>
                                <td className="py-4 px-4 sm:px-6 text-neutral-500">{admin.lastActive || "Active Now"}</td>
                                <td className="py-4 px-4 sm:px-6 text-right">
                                  <button
                                    onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                                    className="p-1.5 text-neutral-400 hover:text-[#ba1a1a] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Revoke Admin Access"
                                    disabled={admins.length <= 1 && admin.role === 'Super Admin'}
                                  >
                                    <span className="material-symbols-outlined text-sm font-bold">delete</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
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

      {/* Interactive overlay dialog to Upload a New Betting Slip */}
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
              className="bg-white border border-neutral-200 rounded-[28px] p-6 sm:p-8 max-w-[500px] w-full relative z-10 shadow-2xl flex flex-col gap-5 max-h-[95vh] overflow-y-auto"
            >
              <div>
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#1a1c1d] tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-black bg-[#f3c623] p-1.5 rounded-xl text-lg font-bold">cloud_upload</span>
                  Upload New Betting Slip
                </h3>
                <p className="text-xs text-[#5d5e64] mt-1">Submit high-probability forecast configurations into the public directory.</p>
              </div>

              <form onSubmit={handleModalUploadSlip} className="flex flex-col gap-4">
                {/* Matches Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Number of Matches</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSlipMatches}
                    onChange={(e) => setNewSlipMatches(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 10"
                    className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                  />
                </div>

                {/* Category & Odds Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Category</label>
                    <select 
                      value={newSlipCategory} 
                      onChange={(e) => setNewSlipCategory(e.target.value)}
                      className="bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none cursor-pointer"
                    >
                      {slipCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Total Odds</label>
                    <input 
                      type="text"
                      required
                      value={newSlipOdds}
                      onChange={(e) => setNewSlipOdds(e.target.value)}
                      placeholder="e.g. 12.40"
                      className="bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                    />
                  </div>
                </div>

                {/* Booking Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Booking Code</label>
                  <input 
                    type="text"
                    required
                    value={newSlipBookingCode}
                    onChange={(e) => setNewSlipBookingCode(e.target.value)}
                    placeholder="e.g. AF-WOR-1240"
                    className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                  />
                </div>

                {/* Live Ticket Preview */}
                <div className="relative overflow-hidden bg-neutral-900 border border-neutral-850 rounded-2xl p-4 text-white shadow-md flex flex-col gap-3 mt-1">
                  <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#f3c623]"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[8px] bg-neutral-800 text-[#f3c623] px-2 py-0.5 rounded uppercase tracking-widest font-bold">MODAL PREVIEW</span>
                    <span className="material-symbols-outlined text-neutral-400 text-sm">visibility</span>
                  </div>
                  <div>
                    <h4 className="font-display text-[10px] font-black uppercase tracking-widest text-neutral-400">High-Octane Accumulator</h4>
                    <h3 className="font-display text-sm font-black text-white mt-0.5 uppercase">
                      {newSlipCategory || "Select Category"}
                    </h3>
                  </div>
                  <div className="h-[1px] bg-neutral-800"></div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider font-sans">MATCHES</span>
                      <span className="text-base font-black text-white">{newSlipMatches || "--"}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider font-sans">TOTAL ODDS</span>
                      <span className="text-base font-black text-[#f3c623]">{newSlipOdds || "--"}</span>
                    </div>
                  </div>
                  {newSlipBookingCode && (
                    <div className="bg-neutral-800 rounded-xl px-3 py-2 flex justify-between items-center border border-neutral-700/50">
                      <span className="text-[9px] font-mono text-white/90 tracking-wider font-bold">{newSlipBookingCode}</span>
                      <span className="material-symbols-outlined text-neutral-400 text-xs">content_copy</span>
                    </div>
                  )}
                </div>

                {/* Cancel & Submit Actions */}
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setNewSlipMatches("");
                      setNewSlipOdds("");
                      setNewSlipBookingCode("");
                      setIsNewSlipModalOpen(false);
                    }}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200/80 text-[#5d5e64] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#f3c623] text-black hover:brightness-95 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-sm"
                  >
                    Publish Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive overlay dialog to Edit a Slip */}
      <AnimatePresence>
        {isEditSlipModalOpen && editingSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditSlipModalOpen(false);
                setEditingSlip(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-neutral-200 rounded-[28px] p-6 sm:p-8 max-w-[480px] w-full relative z-10 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
            >
              <div>
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#1a1c1d] tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-black bg-[#f3c623] p-1.5 rounded-xl text-lg font-bold">edit_note</span>
                  Edit Betting Slip
                </h3>
                <p className="text-xs text-[#5d5e64] mt-1">Modify properties for slip code <span className="font-mono font-bold text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded">{editingSlip.bookingCode}</span></p>
              </div>

              <form onSubmit={handleSaveEditSlip} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Booking Code</label>
                  <input 
                    type="text" 
                    required 
                    value={editSlipBookingCode}
                    onChange={(e) => setEditSlipBookingCode(e.target.value)}
                    placeholder="e.g. AF-WOR-1240"
                    className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Category</label>
                    <select 
                      value={editSlipCategory} 
                      onChange={(e) => setEditSlipCategory(e.target.value)}
                      className="bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none"
                    >
                      {slipCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Matches</label>
                    <input 
                      type="number"
                      min="1"
                      required
                      value={editSlipMatches}
                      onChange={(e) => setEditSlipMatches(e.target.value ? Number(e.target.value) : "")}
                      className="bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Total Odds</label>
                    <input 
                      type="text"
                      required
                      value={editSlipOdds}
                      onChange={(e) => setEditSlipOdds(e.target.value)}
                      placeholder="e.g. 12.40"
                      className="bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1a1c1d] uppercase tracking-wide">Uploaded Date</label>
                    <input 
                      type="text"
                      required
                      value={editSlipDateUploaded}
                      onChange={(e) => setEditSlipDateUploaded(e.target.value)}
                      placeholder="e.g. Jun 30, 2026"
                      className="bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f3c623]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditSlipModalOpen(false);
                      setEditingSlip(null);
                    }}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200/80 text-[#5d5e64] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#f3c623] text-black hover:brightness-95 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 flex flex-col gap-4 animate-scale-in">
            <div className="flex items-center gap-3 text-amber-500">
              <span className="material-symbols-outlined text-3xl font-bold">warning</span>
              <h3 className="text-base font-extrabold text-neutral-900">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">{confirmModal.message}</p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {confirmModal.cancelText || "Cancel"}
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                {confirmModal.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 flex flex-col gap-4 animate-scale-in">
            <div className="flex items-center gap-3">
              {alertModal.type === "error" ? (
                <span className="material-symbols-outlined text-red-500 text-3xl font-bold">cancel</span>
              ) : alertModal.type === "info" ? (
                <span className="material-symbols-outlined text-blue-500 text-3xl font-bold">info</span>
              ) : (
                <span className="material-symbols-outlined text-emerald-500 text-3xl font-bold">check_circle</span>
              )}
              <h3 className="text-base font-extrabold text-neutral-900">{alertModal.title}</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">{alertModal.message}</p>
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                className="px-5 py-2 bg-[#f3c623] hover:bg-[#d9b01c] text-black rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
