"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  X,
  Trash2,
  FileText,
  Receipt,
  Wallet,
  ArrowRight,
  Filter,
  Check,
  CalendarCheck2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { gsap } from "gsap";
import { usePageAnimation } from "@/hooks/usePageAnimation";
import {
  invoicesApi,
  expensesApi,
  followUpsApi,
  customersApi,
} from "@/lib/api";
import {
  Invoice,
  Expense,
  FollowUp,
  Customer,
  CalendarEventItem,
  CalendarEventType,
} from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EVENT_TYPE_CONFIG: Record<
  CalendarEventType,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
    chipBg: string;
    dotColor: string;
    icon: React.ElementType;
  }
> = {
  invoice_due: {
    label: "Invoice Due",
    bg: "var(--warning-50)",
    border: "var(--warning-200)",
    text: "var(--warning-700)",
    chipBg: "rgba(217, 119, 6, 0.12)",
    dotColor: "var(--warning-500)",
    icon: FileText,
  },
  payment_received: {
    label: "Payment Received",
    bg: "var(--success-50)",
    border: "var(--success-200)",
    text: "var(--success-700)",
    chipBg: "rgba(22, 101, 52, 0.12)",
    dotColor: "var(--success-500)",
    icon: Receipt,
  },
  follow_up: {
    label: "Customer Follow-up",
    bg: "var(--info-50)",
    border: "var(--info-200)",
    text: "var(--info-700)",
    chipBg: "rgba(30, 64, 175, 0.12)",
    dotColor: "var(--info-500)",
    icon: Users,
  },
  expense_due: {
    label: "Expense Recorded",
    bg: "var(--danger-50)",
    border: "var(--danger-200)",
    text: "var(--danger-700)",
    chipBg: "rgba(185, 28, 28, 0.12)",
    dotColor: "var(--danger-500)",
    icon: Wallet,
  },
};

const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

export default function CalendarPage() {
  const containerRef = usePageAnimation();
  const calendarGridRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Current view date (for month browsing)
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Data states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | CalendarEventType>("ALL");

  // Follow-up modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formCustomerId, setFormCustomerId] = useState<string>("");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formDate, setFormDate] = useState<string>(todayKey);
  const [formNote, setFormNote] = useState<string>("");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Load all initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, expRes, fuRes, custRes] = await Promise.allSettled([
        invoicesApi.getAll(),
        expensesApi.getAll(),
        followUpsApi.getAll(),
        customersApi.getAll(),
      ]);

      if (invRes.status === "fulfilled") setInvoices(invRes.value.data || []);
      if (expRes.status === "fulfilled") setExpenses(expRes.value.data || []);
      if (fuRes.status === "fulfilled") setFollowUps(fuRes.value.data || []);
      if (custRes.status === "fulfilled") setCustomers(custRes.value.data || []);
    } catch {
      toast.error("Failed to load some calendar events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Animate calendar grid on month change
  useEffect(() => {
    if (calendarGridRef.current) {
      gsap.fromTo(
        calendarGridRef.current,
        { opacity: 0.4, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [currentYear, currentMonth]);

  // Modal animations
  useEffect(() => {
    if (isModalOpen && modalRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [isModalOpen]);

  // Transform business entities into normalized CalendarEventItem array
  const allEvents = useMemo<CalendarEventItem[]>(() => {
    const list: CalendarEventItem[] = [];

    // 1. Invoices Due Date
    invoices.forEach((inv) => {
      if (inv.dueDate) {
        list.push({
          id: `inv-${inv.id}`,
          type: "invoice_due",
          title: `Invoice #${inv.invoiceNumber} Due`,
          date: inv.dueDate.split("T")[0],
          amount: inv.totalAmount,
          status: inv.status,
          entityId: inv.id,
          customerName: inv.customer?.name,
          description: `Total: ${fmtCurrency(inv.totalAmount || 0)} • Status: ${inv.status}`,
          raw: inv,
        });
      }

      // Payments from invoice
      if (Array.isArray(inv.payments)) {
        inv.payments.forEach((p) => {
          if (p.paymentDate) {
            list.push({
              id: `pay-${p.id || Math.random()}`,
              type: "payment_received",
              title: `Payment: ${fmtCurrency(p.amount || 0)}`,
              date: p.paymentDate.split("T")[0],
              amount: p.amount,
              status: "Received",
              entityId: inv.id,
              customerName: inv.customer?.name,
              description: `For #${inv.invoiceNumber} via ${p.paymentMethod || "Direct"}`,
              raw: p,
            });
          }
        });
      }
    });

    // 2. Expenses
    expenses.forEach((exp) => {
      if (exp.expenseDate) {
        list.push({
          id: `exp-${exp.id}`,
          type: "expense_due",
          title: exp.title,
          date: exp.expenseDate.split("T")[0],
          amount: exp.amount,
          category: exp.category,
          status: "Paid",
          entityId: exp.id,
          description: `${exp.category} • ${exp.paymentMethod || "Cash"}`,
          raw: exp,
        });
      }
    });

    // 3. Customer Follow-ups
    followUps.forEach((fu) => {
      if (fu.followUpDate) {
        list.push({
          id: `fu-${fu.id}`,
          type: "follow_up",
          title: fu.title,
          date: fu.followUpDate.split("T")[0],
          status: fu.status,
          entityId: fu.id,
          customerName: fu.customer?.name,
          description: fu.note || "No notes provided",
          raw: fu,
        });
      }
    });

    return list;
  }, [invoices, expenses, followUps]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const matchType = activeFilter === "ALL" || ev.type === activeFilter;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchType;

      const matchQuery =
        ev.title.toLowerCase().includes(query) ||
        (ev.customerName && ev.customerName.toLowerCase().includes(query)) ||
        (ev.category && ev.category.toLowerCase().includes(query)) ||
        (ev.description && ev.description.toLowerCase().includes(query));

      return matchType && matchQuery;
    });
  }, [allEvents, activeFilter, searchQuery]);

  // Group events by date key: { "2026-10-08": [...] }
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    filteredEvents.forEach((item) => {
      const existing = map.get(item.date) || [];
      existing.push(item);
      map.set(item.date, existing);
    });
    return map;
  }, [filteredEvents]);

  // Calendar matrix calculations
  const calendarDays = useMemo(() => {
    const days: Array<{
      date: Date;
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // First day of current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    // 0 = Sun, 1 = Mon ...
    const dayOfWeek = firstDay.getDay();
    // 0 for Mon, 6 for Sun
    const firstDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Number of days in current month
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Days from previous month
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
      const key = formatDateKey(d);
      days.push({
        date: d,
        dateKey: key,
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
      });
    }

    // Days in current month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const key = formatDateKey(d);
      days.push({
        date: d,
        dateKey: key,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
      });
    }

    // Trailing days to fill standard 5 or 6 rows (multiples of 7)
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const d = new Date(currentYear, currentMonth + 1, i);
        const key = formatDateKey(d);
        days.push({
          date: d,
          dateKey: key,
          dayNumber: i,
          isCurrentMonth: false,
          isToday: key === todayKey,
          isSelected: key === selectedDateKey,
        });
      }
    }

    return days;
  }, [currentYear, currentMonth, todayKey, selectedDateKey]);

  // Counts for filter pills
  const eventCounts = useMemo(() => {
    return {
      all: allEvents.length,
      invoice_due: allEvents.filter((e) => e.type === "invoice_due").length,
      payment_received: allEvents.filter((e) => e.type === "payment_received").length,
      follow_up: allEvents.filter((e) => e.type === "follow_up").length,
      expense_due: allEvents.filter((e) => e.type === "expense_due").length,
    };
  }, [allEvents]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    return filteredEvents.filter((e) => e.date === selectedDateKey);
  }, [filteredEvents, selectedDateKey]);

  const selectedDateObject = useMemo(() => {
    const parts = selectedDateKey.split("-");
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date();
  }, [selectedDateKey]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateKey(formatDateKey(now));
  };

  // Follow-up actions
  const openFollowUpModal = (prefillDate?: string) => {
    setFormDate(prefillDate || selectedDateKey || todayKey);
    setFormTitle("");
    setFormNote("");
    if (customers.length > 0 && !formCustomerId) {
      setFormCustomerId(String(customers[0].id));
    }
    setIsModalOpen(true);
  };

  const closeFollowUpModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 10,
        duration: 0.2,
        onComplete: () => {
          setIsModalOpen(false);
          setFormTitle("");
          setFormNote("");
        },
      });
    } else {
      setIsModalOpen(false);
    }
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!formTitle.trim()) {
      toast.error("Please provide a title");
      return;
    }

    try {
      setSubmitting(true);
      const res = await followUpsApi.create({
        customerId: Number(formCustomerId),
        title: formTitle.trim(),
        followUpDate: formDate,
        note: formNote.trim(),
        status: "PENDING",
      });

      setFollowUps((prev) => [res.data, ...prev]);
      toast.success("Follow-up scheduled successfully");
      closeFollowUpModal();
    } catch {
      toast.error("Failed to create follow-up");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFollowUp = async (id: number) => {
    try {
      const res = await followUpsApi.toggle(id);
      setFollowUps((prev) =>
        prev.map((fu) => (fu.id === id ? res.data : fu))
      );
      toast.success(
        res.data.status === "COMPLETED"
          ? "Follow-up marked as completed"
          : "Follow-up reopened"
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteFollowUp = async (id: number) => {
    if (!confirm("Delete this follow-up?")) return;
    try {
      await followUpsApi.delete(id);
      setFollowUps((prev) => prev.filter((fu) => fu.id !== id));
      toast.success("Follow-up removed");
    } catch {
      toast.error("Failed to delete follow-up");
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        minHeight: "100%",
      }}
    >
      {/* =========================================================
          TOP HEADER
      ========================================================= */}
      <div
        data-animate="page-title"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "var(--accent-50)",
                border: "1px solid var(--accent-200)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-600)",
              }}
            >
              <CalendarIcon style={{ width: "20px", height: "20px" }} />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "26px",
                  fontWeight: 600,
                  color: "var(--stone-900)",
                  lineHeight: 1.2,
                }}
              >
                Business Calendar
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--stone-500)",
                  marginTop: "2px",
                }}
              >
                Track invoice deadlines, payments, customer follow-ups & business expenses
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => openFollowUpModal()}
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            Add Follow-up
          </button>
        </div>
      </div>

      {/* =========================================================
          FILTER BAR & MONTH CONTROLS
      ========================================================= */}
      <div
        className="card-refined"
        data-animate="fade-in"
        style={{
          padding: "14px 20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* Month Navigator */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--stone-100)",
              borderRadius: "8px",
              padding: "2px",
              border: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                color: "var(--stone-700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--stone-200)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <ChevronLeft style={{ width: "18px", height: "18px" }} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                color: "var(--stone-700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--stone-200)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <ChevronRight style={{ width: "18px", height: "18px" }} />
            </button>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--stone-900)",
              minWidth: "180px",
            }}
          >
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>

          <button
            type="button"
            onClick={handleGoToday}
            style={{
              fontSize: "12px",
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: "var(--stone-100)",
              color: "var(--stone-800)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--stone-200)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--stone-100)";
            }}
          >
            Today
          </button>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {/* ALL */}
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              border:
                activeFilter === "ALL"
                  ? "1px solid var(--primary-900)"
                  : "1px solid var(--border)",
              background:
                activeFilter === "ALL"
                  ? "var(--primary-900)"
                  : "var(--card)",
              color:
                activeFilter === "ALL" ? "#FFFFFF" : "var(--stone-700)",
            }}
          >
            <span>All Events</span>
            <span
              style={{
                fontSize: "10px",
                padding: "1px 6px",
                borderRadius: "10px",
                background:
                  activeFilter === "ALL"
                    ? "rgba(255,255,255,0.25)"
                    : "var(--stone-200)",
                color: activeFilter === "ALL" ? "#FFFFFF" : "var(--stone-700)",
              }}
            >
              {eventCounts.all}
            </span>
          </button>

          {/* INVOICE DUE */}
          <button
            type="button"
            onClick={() => setActiveFilter("invoice_due")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              border:
                activeFilter === "invoice_due"
                  ? "1px solid var(--warning-500)"
                  : "1px solid var(--border)",
              background:
                activeFilter === "invoice_due"
                  ? "var(--warning-500)"
                  : "var(--card)",
              color:
                activeFilter === "invoice_due" ? "#FFFFFF" : "var(--stone-700)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background:
                  activeFilter === "invoice_due" ? "#FFFFFF" : "var(--warning-500)",
              }}
            />
            <span>Invoices Due</span>
            <span
              style={{
                fontSize: "10px",
                padding: "1px 6px",
                borderRadius: "10px",
                background:
                  activeFilter === "invoice_due"
                    ? "rgba(255,255,255,0.25)"
                    : "var(--stone-200)",
                color:
                  activeFilter === "invoice_due" ? "#FFFFFF" : "var(--stone-700)",
              }}
            >
              {eventCounts.invoice_due}
            </span>
          </button>

          {/* PAYMENTS */}
          <button
            type="button"
            onClick={() => setActiveFilter("payment_received")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              border:
                activeFilter === "payment_received"
                  ? "1px solid var(--success-500)"
                  : "1px solid var(--border)",
              background:
                activeFilter === "payment_received"
                  ? "var(--success-500)"
                  : "var(--card)",
              color:
                activeFilter === "payment_received" ? "#FFFFFF" : "var(--stone-700)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background:
                  activeFilter === "payment_received" ? "#FFFFFF" : "var(--success-500)",
              }}
            />
            <span>Payments</span>
            <span
              style={{
                fontSize: "10px",
                padding: "1px 6px",
                borderRadius: "10px",
                background:
                  activeFilter === "payment_received"
                    ? "rgba(255,255,255,0.25)"
                    : "var(--stone-200)",
                color:
                  activeFilter === "payment_received" ? "#FFFFFF" : "var(--stone-700)",
              }}
            >
              {eventCounts.payment_received}
            </span>
          </button>

          {/* FOLLOW-UPS */}
          <button
            type="button"
            onClick={() => setActiveFilter("follow_up")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              border:
                activeFilter === "follow_up"
                  ? "1px solid var(--info-500)"
                  : "1px solid var(--border)",
              background:
                activeFilter === "follow_up"
                  ? "var(--info-500)"
                  : "var(--card)",
              color:
                activeFilter === "follow_up" ? "#FFFFFF" : "var(--stone-700)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background:
                  activeFilter === "follow_up" ? "#FFFFFF" : "var(--info-500)",
              }}
            />
            <span>Follow-ups</span>
            <span
              style={{
                fontSize: "10px",
                padding: "1px 6px",
                borderRadius: "10px",
                background:
                  activeFilter === "follow_up"
                    ? "rgba(255,255,255,0.25)"
                    : "var(--stone-200)",
                color:
                  activeFilter === "follow_up" ? "#FFFFFF" : "var(--stone-700)",
              }}
            >
              {eventCounts.follow_up}
            </span>
          </button>

          {/* EXPENSES */}
          <button
            type="button"
            onClick={() => setActiveFilter("expense_due")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              border:
                activeFilter === "expense_due"
                  ? "1px solid var(--danger-500)"
                  : "1px solid var(--border)",
              background:
                activeFilter === "expense_due"
                  ? "var(--danger-500)"
                  : "var(--card)",
              color:
                activeFilter === "expense_due" ? "#FFFFFF" : "var(--stone-700)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background:
                  activeFilter === "expense_due" ? "#FFFFFF" : "var(--danger-500)",
              }}
            />
            <span>Expenses</span>
            <span
              style={{
                fontSize: "10px",
                padding: "1px 6px",
                borderRadius: "10px",
                background:
                  activeFilter === "expense_due"
                    ? "rgba(255,255,255,0.25)"
                    : "var(--stone-200)",
                color:
                  activeFilter === "expense_due" ? "#FFFFFF" : "var(--stone-700)",
              }}
            >
              {eventCounts.expense_due}
            </span>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: "220px" }}>
          <Search
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "15px",
              height: "15px",
              color: "var(--stone-400)",
            }}
          />
          <input
            type="text"
            className="input-refined"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: "34px",
              height: "36px",
              fontSize: "13px",
            }}
          />
        </div>
      </div>

      {/* =========================================================
          MAIN CALENDAR + SIDEBAR GRID
      ========================================================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Calendar Grid (8 cols on lg) */}
        <div
          className="card-refined"
          data-animate="fade-in"
          style={{
            gridColumn: "span 8",
            overflow: "hidden",
            padding: 0,
          }}
        >
          {/* Day of Week Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              borderBottom: "1px solid var(--border)",
              background: "var(--stone-50)",
            }}
          >
            {WEEK_DAYS.map((wd) => (
              <div
                key={wd}
                style={{
                  padding: "12px 8px",
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  color: "var(--stone-500)",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Month Cells Grid */}
          <div
            ref={calendarGridRef}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              background: "var(--border)",
              gap: "1px", // creates crisp 1px borders between cells
            }}
          >
            {calendarDays.map((cell) => {
              const dayEvents = eventsByDate.get(cell.dateKey) || [];
              const maxDisplay = 2;
              const hasMore = dayEvents.length > maxDisplay;

              return (
                <div
                  key={cell.dateKey}
                  onClick={() => setSelectedDateKey(cell.dateKey)}
                  style={{
                    minHeight: "116px",
                    background: cell.isSelected
                      ? "var(--accent-50)"
                      : cell.isCurrentMonth
                      ? "var(--card)"
                      : "var(--stone-100)",
                    padding: "8px 6px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    outline: cell.isSelected
                      ? "2px solid var(--accent-500)"
                      : "none",
                    outlineOffset: "-2px",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!cell.isSelected) {
                      e.currentTarget.style.backgroundColor = "var(--stone-50)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!cell.isSelected) {
                      e.currentTarget.style.backgroundColor = cell.isCurrentMonth
                        ? "var(--card)"
                        : "var(--stone-100)";
                    }
                  }}
                >
                  {/* Date Header in Cell */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        fontSize: "12px",
                        fontWeight: cell.isToday || cell.isSelected ? 700 : 500,
                        background: cell.isToday
                          ? "var(--primary-900)"
                          : "transparent",
                        color: cell.isToday
                          ? "#FFFFFF"
                          : cell.isCurrentMonth
                          ? "var(--stone-800)"
                          : "var(--stone-400)",
                      }}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Dot indicators if any */}
                    {dayEvents.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        {Array.from(new Set(dayEvents.map((e) => e.type)))
                          .slice(0, 3)
                          .map((type) => (
                            <span
                              key={type}
                              style={{
                                width: "5px",
                                height: "5px",
                                borderRadius: "50%",
                                background: EVENT_TYPE_CONFIG[type].dotColor,
                              }}
                            />
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Event Chips */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "3px",
                      flex: 1,
                    }}
                  >
                    {dayEvents.slice(0, maxDisplay).map((item) => {
                      const cfg = EVENT_TYPE_CONFIG[item.type];
                      return (
                        <div
                          key={item.id}
                          title={`${cfg.label}: ${item.title}`}
                          style={{
                            fontSize: "11px",
                            padding: "2px 5px",
                            borderRadius: "4px",
                            background: cfg.chipBg,
                            color: cfg.text,
                            borderLeft: `3px solid ${cfg.dotColor}`,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontWeight: 500,
                            lineHeight: 1.3,
                          }}
                        >
                          {item.title}
                        </div>
                      );
                    })}

                    {hasMore && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "var(--stone-500)",
                          paddingLeft: "4px",
                        }}
                      >
                        +{dayEvents.length - maxDisplay} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel (4 cols on lg) */}
        <div
          className="card-refined"
          data-animate="fade-in"
          style={{
            gridColumn: "span 4",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            position: "sticky",
            top: "24px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "14px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--stone-400)",
                }}
              >
                Selected Date
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--stone-900)",
                  marginTop: "2px",
                }}
              >
                {selectedDateObject.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => openFollowUpModal(selectedDateKey)}
              title="Add follow-up for this day"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "1px solid var(--accent-300)",
                background: "var(--accent-50)",
                color: "var(--accent-700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-100)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent-50)";
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
            </button>
          </div>

          {/* Events Count Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "var(--stone-500)",
            }}
          >
            <span>
              {selectedDateEvents.length}{" "}
              {selectedDateEvents.length === 1 ? "Event scheduled" : "Events scheduled"}
            </span>

            {selectedDateKey === todayKey && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--accent-700)",
                  background: "var(--accent-50)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                }}
              >
                Today
              </span>
            )}
          </div>

          {/* Events List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "520px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {selectedDateEvents.length === 0 ? (
              <div
                style={{
                  padding: "36px 16px",
                  textAlign: "center",
                  borderRadius: "8px",
                  border: "1px dashed var(--border)",
                  background: "var(--stone-50)",
                }}
              >
                <CalendarCheck2
                  style={{
                    width: "32px",
                    height: "32px",
                    color: "var(--stone-400)",
                    margin: "0 auto 10px auto",
                  }}
                />
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--stone-700)",
                  }}
                >
                  No events on this day
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--stone-400)",
                    marginTop: "4px",
                  }}
                >
                  Click the plus button above or &quot;Add Follow-up&quot; to schedule a reminder.
                </p>
                <button
                  type="button"
                  onClick={() => openFollowUpModal(selectedDateKey)}
                  style={{
                    marginTop: "14px",
                    fontSize: "12px",
                    fontWeight: 500,
                    padding: "6px 14px",
                    borderRadius: "6px",
                    background: "var(--stone-200)",
                    color: "var(--stone-800)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  + Add Follow-up
                </button>
              </div>
            ) : (
              selectedDateEvents.map((item) => {
                const cfg = EVENT_TYPE_CONFIG[item.type];
                const IconComponent = cfg.icon;
                const isFollowUp = item.type === "follow_up";
                const isCompleted = item.status === "COMPLETED";

                return (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: "8px",
                      border: `1px solid ${cfg.border}`,
                      background: cfg.bg,
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      position: "relative",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: cfg.text,
                          }}
                        >
                          <IconComponent style={{ width: "13px", height: "13px" }} />
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: cfg.text,
                            textTransform: "uppercase",
                            letterSpacing: "0.4px",
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      {item.amount !== undefined && item.amount !== null && (
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            fontFamily: "var(--font-serif)",
                            color: "var(--stone-900)",
                          }}
                        >
                          {fmtCurrency(item.amount)}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--stone-900)",
                        textDecoration: isCompleted ? "line-through" : "none",
                        opacity: isCompleted ? 0.7 : 1,
                      }}
                    >
                      {item.title}
                    </div>

                    {item.customerName && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--stone-600)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Users style={{ width: "12px", height: "12px" }} />
                        <span>{item.customerName}</span>
                      </div>
                    )}

                    {item.description && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--stone-500)",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.description}
                      </div>
                    )}

                    {/* Actions bar for event */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "4px",
                        paddingTop: "6px",
                        borderTop: "1px dashed rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* Follow-up toggle / delete */}
                      {isFollowUp && item.entityId && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleFollowUp(item.entityId!)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid var(--border)",
                              background: isCompleted ? "var(--stone-200)" : "#FFFFFF",
                              color: isCompleted ? "var(--stone-700)" : "var(--success-700)",
                              cursor: "pointer",
                            }}
                          >
                            <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                            {isCompleted ? "Completed" : "Mark as Done"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteFollowUp(item.entityId!)}
                            title="Delete Follow-up"
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "var(--danger-500)",
                              cursor: "pointer",
                              padding: "4px",
                              borderRadius: "4px",
                            }}
                          >
                            <Trash2 style={{ width: "13px", height: "13px" }} />
                          </button>
                        </div>
                      )}

                      {/* Invoice link */}
                      {item.type === "invoice_due" && item.entityId && (
                        <Link
                          href={`/invoices`}
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "var(--primary-700)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            textDecoration: "none",
                            marginLeft: "auto",
                          }}
                        >
                          View Invoices
                          <ArrowRight style={{ width: "11px", height: "11px" }} />
                        </Link>
                      )}

                      {/* Payment link */}
                      {item.type === "payment_received" && (
                        <Link
                          href={`/payments`}
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "var(--success-700)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            textDecoration: "none",
                            marginLeft: "auto",
                          }}
                        >
                          View Payments
                          <ArrowRight style={{ width: "11px", height: "11px" }} />
                        </Link>
                      )}

                      {/* Expense link */}
                      {item.type === "expense_due" && (
                        <Link
                          href={`/expenses`}
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "var(--danger-700)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            textDecoration: "none",
                            marginLeft: "auto",
                          }}
                        >
                          View Expenses
                          <ArrowRight style={{ width: "11px", height: "11px" }} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          ADD CUSTOMER FOLLOW-UP MODAL
      ========================================================= */}
      {isModalOpen && (
        <div
          ref={overlayRef}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === overlayRef.current) closeFollowUpModal();
          }}
        >
          <div
            ref={modalRef}
            className="card-refined"
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.18)",
              position: "relative",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--stone-900)",
                  }}
                >
                  Schedule Follow-up
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--stone-500)",
                    marginTop: "2px",
                  }}
                >
                  Set a reminder to connect with a customer
                </p>
              </div>

              <button
                type="button"
                onClick={closeFollowUpModal}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--stone-100)",
                  color: "var(--stone-500)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateFollowUp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Customer Selection */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--stone-700)",
                    marginBottom: "6px",
                  }}
                >
                  Select Customer <span style={{ color: "var(--danger-500)" }}>*</span>
                </label>
                {customers.length === 0 ? (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--stone-500)",
                      padding: "8px 12px",
                      background: "var(--stone-100)",
                      borderRadius: "6px",
                    }}
                  >
                    No customers found. Create a customer in Customers page first.
                  </div>
                ) : (
                  <select
                    className="input-refined"
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    required
                    style={{ width: "100%", height: "40px" }}
                  >
                    <option value="" disabled>
                      -- Choose a customer --
                    </option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Title */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--stone-700)",
                    marginBottom: "6px",
                  }}
                >
                  Title / Subject <span style={{ color: "var(--danger-500)" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-refined"
                  placeholder="e.g., Payment reminder call, Quote review, Re-order check"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  style={{ width: "100%", height: "40px" }}
                />
              </div>

              {/* Date */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--stone-700)",
                    marginBottom: "6px",
                  }}
                >
                  Follow-up Date <span style={{ color: "var(--danger-500)" }}>*</span>
                </label>
                <input
                  type="date"
                  className="input-refined"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  style={{ width: "100%", height: "40px" }}
                />
              </div>

              {/* Note */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--stone-700)",
                    marginBottom: "6px",
                  }}
                >
                  Notes & Details (Optional)
                </label>
                <textarea
                  className="input-refined"
                  rows={3}
                  placeholder="Add details, talking points or invoice context..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  style={{ width: "100%", resize: "vertical", padding: "10px 12px" }}
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={closeFollowUpModal}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--stone-100)",
                    color: "var(--stone-700)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || customers.length === 0}
                  className="btn-primary"
                  style={{
                    padding: "8px 18px",
                    fontSize: "13px",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {submitting ? "Saving..." : "Save Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
