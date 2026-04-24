"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const TOP_TABS = [
  { href: "/", label: "Overview" },
  { href: "#live", label: "Live Feed" },
  { href: "#reports", label: "Reports" },
];

interface TopBarProps {
  activeTab?: string;
}

export function TopBar({ activeTab = "Overview" }: TopBarProps) {
  return (
    <header className="bg-transparent fixed top-0 right-0 w-[calc(100%-16rem)] border-b border-[#1A2E1A]/10 flex justify-between items-center px-16 py-8 h-24 ml-64 z-40 backdrop-blur-sm bg-[#F5F0E8]/80">
      {/* Left: Tab navigation */}
      <nav className="flex items-center gap-8">
        {TOP_TABS.map((tab) => (
          <a
            key={tab.label}
            href={tab.href}
            className={`text-sm tracking-wide uppercase transition-colors duration-200 ${
              tab.label === activeTab
                ? "text-[#1A2E1A] border-b-2 border-[#BF5700] pb-1"
                : "text-[#1A2E1A]/50 hover:text-[#BF5700]"
            }`}
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {tab.label}
          </a>
        ))}

        {/* Search */}
        <div className="relative group ml-4">
          <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[#1A2E1A]/50 group-hover:text-[#1A2E1A] transition-colors text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="QUERY METRICS..."
            className="bg-transparent border-0 border-b border-[#1A2E1A]/20 pl-8 py-1 focus:ring-0 focus:border-[#1A2E1A] text-xs tracking-widest uppercase text-[#1A2E1A] placeholder:text-[#1A2E1A]/40 w-48 transition-all"
            style={{ fontFamily: "var(--font-serif)" }}
          />
        </div>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 border-l border-[#1A2E1A]/10 pl-8">
        <button className="text-ui-button text-[#1A2E1A] hover:text-[#BF5700] transition-colors uppercase tracking-wider text-xs border-b border-transparent hover:border-[#BF5700] pb-1">
          Export Data
        </button>
        <button className="text-ui-button bg-[#BF5700] text-white px-4 py-2 rounded uppercase tracking-wider text-xs hover:bg-[#984800] transition-colors shadow-sm">
          Emergency Protocol
        </button>

        <div className="flex items-center gap-4 ml-4">
          <button className="text-[#1A2E1A]/60 hover:text-[#BF5700] transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-[#1A2E1A]/60 hover:text-[#BF5700] transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
}
