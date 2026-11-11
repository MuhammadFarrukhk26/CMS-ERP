/**
 * Enterprise Campus Management System (Campus ERP)
 * Global Cross-Module Search with Fuse.js Fuzzy Matching, Ranking, Categorized Dropdown & Recent Searches
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import {
  Search,
  X,
  GraduationCap,
  Users,
  CreditCard,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  History,
  Building2,
  CheckCircle2,
  Wand2,
  Trash2,
} from 'lucide-react';
import { db } from '../../services/db';
import { StatusBadge } from './StatusBadge';

export type SearchCategory = 'student' | 'employee' | 'voucher' | 'challan' | 'applicant';

export interface SearchResultItem {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle: string;
  referenceNo: string;
  status?: string;
  amount?: string;
  targetTab: string;
  score?: number;
  lastAccessed?: number;
  accessCount?: number;
  isFuzzy?: boolean;
  matchPercentage?: number;
  raw: any;
}

interface AccessHistoryRecord {
  id: string;
  count: number;
  lastAccessed: number;
}

const HISTORY_STORAGE_KEY = 'campus_erp_search_access_history';
const RECENT_QUERIES_STORAGE_KEY = 'campus_erp_recent_search_queries';

// Default initial history so the recent/frequent logic is immediately populated
const DEFAULT_INITIAL_HISTORY: Record<string, AccessHistoryRecord> = {
  'stu-stu-001': { id: 'stu-stu-001', count: 6, lastAccessed: Date.now() - 1000 * 60 * 18 },
  'emp-emp-002': { id: 'emp-emp-002', count: 4, lastAccessed: Date.now() - 1000 * 60 * 45 },
  'vch-vch-001': { id: 'vch-vch-001', count: 5, lastAccessed: Date.now() - 1000 * 60 * 120 },
  'ch-ch-001': { id: 'ch-ch-001', count: 3, lastAccessed: Date.now() - 1000 * 60 * 240 },
};

const DEFAULT_INITIAL_QUERIES: string[] = [
  '23-CS-042',
  'Dr. Mansoor Alam',
  'JV-2026',
  'Zain Ul Abideen',
  'Fee Challan',
];

interface GlobalSearchProps {
  onNavigateTab: (tab: string) => void;
  onOpenDocument?: (docType: string, data: any) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [accessHistory, setAccessHistory] = useState<Record<string, AccessHistoryRecord>>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_INITIAL_HISTORY;
  });

  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_QUERIES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      }
    } catch {
      // ignore
    }
    return DEFAULT_INITIAL_QUERIES;
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K or "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const saveAccessHistory = (id: string) => {
    setAccessHistory((prev) => {
      const existing = prev[id] || { id, count: 0, lastAccessed: 0 };
      const updated = {
        ...prev,
        [id]: {
          id,
          count: existing.count + 1,
          lastAccessed: Date.now(),
        },
      };
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save search history', err);
      }
      return updated;
    });
  };

  // Add search query to the last 5 recent searches
  const addRecentQuery = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentQueries((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_QUERIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent queries', e);
      }
      return updated;
    });
  };

  const removeRecentQuery = (queryToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRecentQueries((prev) => {
      const updated = prev.filter((q) => q.toLowerCase() !== queryToRemove.toLowerCase());
      try {
        localStorage.setItem(RECENT_QUERIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update recent queries', e);
      }
      return updated;
    });
  };

  const clearAllRecentQueries = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRecentQueries([]);
    try {
      localStorage.removeItem(RECENT_QUERIES_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear recent queries', e);
    }
  };

  // Convert all database entities to search records
  const allSearchableItems: SearchResultItem[] = useMemo(() => {
    const state = db.getState();
    const items: SearchResultItem[] = [];

    // 1. Students
    state.students.forEach((s) => {
      items.push({
        id: `stu-${s.id}`,
        category: 'student',
        title: s.fullName,
        subtitle: `Roll: ${s.rollNo} · Reg: ${s.regNo} · Sem ${s.currentSemester} · CGPA: ${s.cgpa}`,
        referenceNo: s.rollNo,
        status: s.status,
        targetTab: 'academics',
        raw: s,
      });
    });

    // 2. Employees & Faculty
    state.employees.forEach((e) => {
      items.push({
        id: `emp-${e.id}`,
        category: 'employee',
        title: e.fullName,
        subtitle: `${e.designation} · ${e.employmentType} · ${e.education}`,
        referenceNo: e.empNo,
        status: e.status,
        amount: `PKR ${e.salary.toLocaleString()}`,
        targetTab: 'hrms',
        raw: e,
      });
    });

    // 3. General Ledger Vouchers & Entries
    state.vouchers.forEach((v) => {
      items.push({
        id: `vch-${v.id}`,
        category: 'voucher',
        title: `${v.voucherType}: ${v.description}`,
        subtitle: `${v.date} · Accounts: ${v.entries.map((ent) => ent.accountTitle).join(', ')}`,
        referenceNo: v.voucherNo,
        status: v.status,
        amount: `PKR ${v.totalAmount.toLocaleString()}`,
        targetTab: 'finance',
        raw: v,
      });
    });

    // 4. Student Fee Challans
    state.feeChallans.forEach((c) => {
      items.push({
        id: `ch-${c.id}`,
        category: 'challan',
        title: `Fee Challan - ${c.studentName}`,
        subtitle: `${c.programName} (Sem ${c.semester}) · Due: ${c.dueDate}`,
        referenceNo: c.challanNo,
        status: c.status,
        amount: `PKR ${c.totalAmount.toLocaleString()}`,
        targetTab: 'finance',
        raw: c,
      });
    });

    // 5. Admission Applicants
    state.applicants.forEach((a) => {
      items.push({
        id: `app-${a.id}`,
        category: 'applicant',
        title: `Applicant: ${a.fullName}`,
        subtitle: `${a.programPreference1} · Merit Aggregate: ${a.aggregateMerit}%`,
        referenceNo: a.applicationNo,
        status: a.status,
        targetTab: 'admissions',
        raw: a,
      });
    });

    return items;
  }, []);

  // Fuse.js Index Configuration for Fuzzy Searching with Typo Tolerance
  const fuseInstance = useMemo(() => {
    return new Fuse(allSearchableItems, {
      keys: [
        { name: 'referenceNo', weight: 0.5 },
        { name: 'title', weight: 0.35 },
        { name: 'subtitle', weight: 0.15 },
      ],
      threshold: 0.45, // Typo tolerance: handles "Zayn" for "Zain", "Mansor" for "Mansoor", etc.
      distance: 100,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [allSearchableItems]);

  // Calculate ranking score & filter items with Fuzzy Search + Recency/Frequency
  const rankedItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    const now = Date.now();

    if (!q) {
      // Zero-query mode: score purely by frequency and recency
      const annotated = allSearchableItems.map((item) => {
        const hist = accessHistory[item.id];
        const count = hist?.count || 0;
        const lastAccessed = hist?.lastAccessed || 0;

        const ageHours = (now - lastAccessed) / (1000 * 60 * 60);
        const recencyWeight = lastAccessed > 0 ? Math.max(0, 100 - ageHours * 3) : 0;
        const frequencyWeight = count * 15;
        const score = recencyWeight + frequencyWeight;

        return {
          ...item,
          score,
          accessCount: count,
          lastAccessed,
          isFuzzy: false,
          matchPercentage: 100,
        };
      });

      const filtered = categoryFilter === 'all'
        ? annotated
        : annotated.filter((item) => item.category === categoryFilter);

      return filtered.sort((a, b) => b.score - a.score);
    }

    // Fuzzy Search execution via Fuse.js
    const fuseResults = fuseInstance.search(q);

    const annotatedResults = fuseResults.map((result) => {
      const item = result.item;
      const fuseScore = result.score ?? 0.5; // 0 is perfect match, 1 is complete mismatch
      const matchPercentage = Math.round((1 - fuseScore) * 100);

      // Base relevance score from fuzzy confidence
      let baseScore = Math.round((1 - fuseScore) * 200);

      const refLower = item.referenceNo.toLowerCase();
      const titleLower = item.title.toLowerCase();

      // Exact match and prefix bonuses
      if (refLower === q || titleLower === q) {
        baseScore += 100;
      } else if (refLower.startsWith(q) || titleLower.startsWith(q)) {
        baseScore += 50;
      }

      // History boosts (frequently & recently accessed)
      const hist = accessHistory[item.id];
      const count = hist?.count || 0;
      const lastAccessed = hist?.lastAccessed || 0;

      let boost = 0;
      if (count > 0) {
        const frequencyBoost = Math.min(count * 12, 60);
        const ageHours = (now - lastAccessed) / (1000 * 60 * 60);
        const recencyBoost = Math.max(0, 40 - ageHours * 2);
        boost = frequencyBoost + recencyBoost;
      }

      const isFuzzy = fuseScore > 0.12 && !refLower.includes(q) && !titleLower.includes(q);

      return {
        ...item,
        score: baseScore + boost,
        accessCount: count,
        lastAccessed,
        isFuzzy,
        matchPercentage,
      };
    });

    const filtered = categoryFilter === 'all'
      ? annotatedResults
      : annotatedResults.filter((item) => item.category === categoryFilter);

    return filtered.sort((a, b) => b.score - a.score);
  }, [allSearchableItems, fuseInstance, query, categoryFilter, accessHistory]);

  // Group ranked items by category for the categorized dropdown layout
  const categorizedResults = useMemo(() => {
    const categories: {
      key: SearchCategory;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      colorClass: string;
      items: (SearchResultItem & { score: number; accessCount: number; lastAccessed: number })[];
    }[] = [
      {
        key: 'student',
        label: 'Students',
        icon: GraduationCap,
        colorClass: 'text-blue-600',
        items: [],
      },
      {
        key: 'employee',
        label: 'Employees & Faculty',
        icon: Users,
        colorClass: 'text-emerald-600',
        items: [],
      },
      {
        key: 'voucher',
        label: 'General Ledger & Vouchers',
        icon: CreditCard,
        colorClass: 'text-purple-600',
        items: [],
      },
      {
        key: 'challan',
        label: 'Student Fee Challans',
        icon: FileText,
        colorClass: 'text-amber-600',
        items: [],
      },
      {
        key: 'applicant',
        label: 'Admissions Applicants',
        icon: Clock,
        colorClass: 'text-rose-600',
        items: [],
      },
    ];

    rankedItems.forEach((item) => {
      const cat = categories.find((c) => c.key === item.category);
      if (cat) cat.items.push(item);
    });

    return categories.filter((c) => c.items.length > 0);
  }, [rankedItems]);

  // Flattened array of items for keyboard navigation index calculation
  const flattenedItems = useMemo(() => {
    return categorizedResults.flatMap((c) => c.items);
  }, [categorizedResults]);

  const handleSelectItem = (item: SearchResultItem) => {
    saveAccessHistory(item.id);
    if (query.trim()) {
      addRecentQuery(query.trim());
    } else {
      addRecentQuery(item.referenceNo);
    }
    onNavigateTab(item.targetTab);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flattenedItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flattenedItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flattenedItems[selectedIndex]) {
        handleSelectItem(flattenedItems[selectedIndex]);
      } else if (query.trim()) {
        addRecentQuery(query.trim());
      }
    }
  };

  const handleSelectRecentQuery = (recentQ: string) => {
    setQuery(recentQ);
    addRecentQuery(recentQ);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const formatRecency = (timestamp: number) => {
    if (!timestamp) return null;
    const diffMin = Math.round((Date.now() - timestamp) / 60000);
    if (diffMin < 2) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.round(diffHours / 24)}d ago`;
  };

  let globalItemCounter = -1;

  return (
    <div className="relative">
      {/* Search Input Trigger in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between gap-3 px-3 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-lg transition-all w-48 sm:w-64 md:w-80 shadow-2xs group"
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#DD2A2A] transition-colors shrink-0" />
          <span className="truncate">Search students, staff, ledger...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shrink-0 shadow-2xs">
          ⌘K
        </kbd>
      </button>

      {/* Global Search Modal / Command Palette with Categorized Dropdown & Recent Searches */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-150">
            {/* Search Input Bar */}
            <div className="p-3.5 border-b border-slate-200 flex items-center gap-3 bg-white">
              <Search className="w-5 h-5 text-[#DD2A2A] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search by student roll no (23-CS-042), staff ID (EMP-001), voucher (JV-2026), or name..."
                className="w-full text-sm bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 rounded transition-colors"
              >
                Esc
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
              {[
                { key: 'all', label: 'All Categories' },
                { key: 'student', label: 'Students' },
                { key: 'employee', label: 'Employees & Faculty' },
                { key: 'voucher', label: 'Ledger Vouchers' },
                { key: 'challan', label: 'Fee Challans' },
                { key: 'applicant', label: 'Applicants' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setCategoryFilter(cat.key);
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0 ${
                    categoryFilter === cat.key
                      ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Results Area */}
            <div ref={listContainerRef} className="overflow-y-auto flex-1 p-2 space-y-4 max-h-[460px]">
              {/* RECENT SEARCHES SECTION (Persisted Last 5 Queries) */}
              {recentQueries.length > 0 ? (
                <div className="px-1 pt-1 pb-2 border-b border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs px-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-[#DD2A2A]" />
                      <span>Recent Searches</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        ({recentQueries.length}/5)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllRecentQueries}
                      className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors shadow-2xs"
                      title="Clear all recent search queries from localStorage"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>Clear All</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 px-1">
                    {recentQueries.map((rq) => (
                      <div
                        key={rq}
                        onClick={() => handleSelectRecentQuery(rq)}
                        className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-red-50/70 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#DD2A2A] transition-all cursor-pointer shadow-2xs"
                      >
                        <Search className="w-3 h-3 text-slate-400 group-hover:text-[#DD2A2A]" />
                        <span>{rq}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentQuery(rq, e)}
                          title="Remove from history"
                          className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 transition-colors ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !query.trim() ? (
                <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-400 bg-slate-50/50 rounded-md">
                  <span className="flex items-center gap-1.5 italic">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Search history cleared</span>
                  </span>
                  <span className="text-[10px] font-mono">0 saved in localStorage</span>
                </div>
              ) : null}

              {/* Zero-Query Prompt & Frequent Records Header */}
              {!query.trim() && (
                <div className="space-y-3">
                  <div className="px-2 pt-1 pb-1 flex items-center justify-between text-xs border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <History className="w-3.5 h-3.5 text-[#DD2A2A]" />
                      <span>Frequently Accessed & Recent University Records</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Ranked by usage & recency</span>
                  </div>

                  {/* Fuzzy Typo Quick Demos */}
                  <div className="p-3 bg-red-50/40 border border-red-200/50 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <Wand2 className="w-4 h-4 text-[#DD2A2A] shrink-0" />
                      <span>
                        <strong>Fuzzy Search Enabled:</strong> Handles minor spelling errors and partial tokens automatically.
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#DD2A2A]">
                      <span className="cursor-pointer hover:underline bg-white px-2 py-0.5 rounded border border-red-200" onClick={() => setQuery('Zayn')}>
                        Try "Zayn"
                      </span>
                      <span className="cursor-pointer hover:underline bg-white px-2 py-0.5 rounded border border-red-200" onClick={() => setQuery('Mansor')}>
                        Try "Mansor"
                      </span>
                      <span className="cursor-pointer hover:underline bg-white px-2 py-0.5 rounded border border-red-200" onClick={() => setQuery('Vocher')}>
                        Try "Vocher"
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Categorized Results */}
              {categorizedResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-600">No matching campus records</p>
                  <p className="text-[11px]">
                    No student, staff member, or ledger entry matched "<strong>{query}</strong>" even with fuzzy tolerance.
                  </p>
                </div>
              ) : (
                categorizedResults.map((categoryGroup) => {
                  const CategoryIcon = categoryGroup.icon;

                  return (
                    <div key={categoryGroup.key} className="space-y-1">
                      {/* Category Group Header */}
                      <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 rounded-md">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className={`w-3.5 h-3.5 ${categoryGroup.colorClass}`} />
                          <span>{categoryGroup.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 lowercase font-normal">
                          {categoryGroup.items.length} {categoryGroup.items.length === 1 ? 'match' : 'matches'}
                        </span>
                      </div>

                      {/* Group Items */}
                      <div className="space-y-1 pl-1">
                        {categoryGroup.items.map((item) => {
                          globalItemCounter += 1;
                          const currentItemIndex = globalItemCounter;
                          const isSelected = selectedIndex === currentItemIndex;
                          const isFrequent = (item.accessCount || 0) >= 3;
                          const recentStr = formatRecency(item.lastAccessed || 0);

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleSelectItem(item)}
                              onMouseEnter={() => setSelectedIndex(currentItemIndex)}
                              className={`p-2.5 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-red-50/70 border border-red-200/70 shadow-2xs'
                                  : 'hover:bg-slate-50 border border-transparent'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="p-2 rounded-md bg-slate-100 shrink-0 mt-0.5">
                                  <CategoryIcon className={`w-3.5 h-3.5 ${categoryGroup.colorClass}`} />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-bold text-xs text-[#DD2A2A]">
                                      {item.referenceNo}
                                    </span>

                                    {item.status && (
                                      <>
                                        <span className="text-slate-300">·</span>
                                        <StatusBadge status={item.status} />
                                      </>
                                    )}

                                    {/* Fuzzy Match Badge */}
                                    {item.isFuzzy && (
                                      <span className="text-[10px] text-indigo-700 font-semibold flex items-center gap-0.5 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                        <Wand2 className="w-2.5 h-2.5 text-indigo-500" />
                                        <span>Fuzzy match ({item.matchPercentage}%)</span>
                                      </span>
                                    )}

                                    {/* Frequent & Recency Signals */}
                                    {isFrequent && (
                                      <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                        <span>Frequent ({item.accessCount}x)</span>
                                      </span>
                                    )}

                                    {recentStr && (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        · {recentStr}
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                                    {item.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 truncate">
                                    {item.subtitle}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0 text-right">
                                {item.amount && (
                                  <span className="font-mono font-bold text-slate-900 text-xs tabular-nums block">
                                    {item.amount}
                                  </span>
                                )}
                                <span className="text-xs font-semibold text-[#DD2A2A] flex items-center gap-0.5 opacity-90 group-hover:opacity-100">
                                  <span>View</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with Search Telemetry & Navigation Hints */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono mr-1">
                    ↑↓
                  </kbd>
                  Navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono mr-1">
                    ↵
                  </kbd>
                  Select &amp; Open
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono mr-1">
                    Esc
                  </kbd>
                  Close
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums text-slate-500">
                  {flattenedItems.length} {flattenedItems.length === 1 ? 'record' : 'records'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" />
                  <span>Fuse.js + Recents</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
