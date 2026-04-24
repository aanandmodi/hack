"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Operations", icon: "dashboard" },
  { href: "/personnel", label: "Personnel", icon: "group" },
  { href: "/intelligence", label: "Intelligence", icon: "insights" },
  { href: "/heatmaps", label: "Heatmaps", icon: "layers" },
  { href: "/archive", label: "Archive", icon: "history" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#F5F0E8] h-screen fixed left-0 top-0 w-64 border-r border-[#1A2E1A]/15 flex flex-col py-12 z-50 hidden md:flex">
      {/* Header */}
      <div className="px-8 mb-12">
        <h1
          className="text-2xl tracking-widest uppercase text-[#1A2E1A]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          StadiumIQ
        </h1>
        <p
          className="uppercase text-xs font-semibold mt-2 text-[#1A2E1A]/60 tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Venue Operations
        </p>
      </div>

      {/* Main Nav */}
      <ul className="flex-1 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-4 py-4 transition-all duration-300 uppercase text-xs font-semibold tracking-tight ${
                  isActive
                    ? "text-[#1A2E1A] border-l-4 border-[#BF5700] pl-6 bg-white/40"
                    : "text-[#1A2E1A]/60 pl-8 hover:bg-white/60 hover:text-[#BF5700]"
                }`}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="px-8 mt-auto flex flex-col gap-6">
        <button className="w-full py-3 bg-[#984800] text-white rounded text-xs font-semibold uppercase tracking-widest hover:bg-[#984800]/90 transition-colors">
          Operational Support
        </button>
        <ul className="flex flex-col gap-2 border-t border-[#1A2E1A]/15 pt-6">
          <li>
            <a
              href="#"
              className="flex items-center gap-4 py-2 text-[#1A2E1A]/60 hover:text-[#BF5700] transition-colors uppercase text-xs font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-4 py-2 text-[#1A2E1A]/60 hover:text-[#BF5700] transition-colors uppercase text-xs font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              <span className="material-symbols-outlined text-[18px]">help_center</span>
              Support
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
