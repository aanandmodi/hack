"use client";

import { useState } from "react";

const BOTTOM_TABS = [
  { id: "home", icon: "stadium", label: "Home" },
  { id: "wayfinding", icon: "explore", label: "Wayfinding" },
  { id: "dining", icon: "restaurant", label: "Dining" },
  { id: "notifications", icon: "notifications_active", label: "Notifications", badge: true },
];

export default function AttendeePage() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen flex justify-center bg-stone-200">
      {/* Mobile Device Container */}
      <main className="w-full max-w-[414px] bg-[#fbf9f5] min-h-screen relative shadow-2xl overflow-hidden flex flex-col pb-24">
        {/* Header */}
        <header className="px-6 pt-12 pb-8">
          <h1 className="text-headline-lg text-[#061907]">Welcome to the Arena</h1>
          <p className="text-body-md text-[#434841] mt-2">Section 114, Row G, Seat 12</p>
        </header>

        {/* Content */}
        <div className="flex-1 px-6 flex flex-col gap-6">
          {/* Primary Card: Wayfinding */}
          <section className="bg-white rounded-xl border border-[#061907]/10 p-6 relative overflow-hidden group hover:border-[#061907]/20 transition-colors">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <span className="text-label-caps text-[#022956] bg-[#022956]/10 px-2 py-1 rounded tracking-wider">
                  System Navigation
                </span>
                <h2 className="text-headline-md text-[#061907] mt-3">Best Route to Your Seat</h2>
              </div>
              <span className="material-symbols-outlined text-[#061907] bg-[#061907]/5 p-2 rounded-full">
                directions_walk
              </span>
            </div>

            {/* Map */}
            <div className="h-32 bg-[#f5f3f0] rounded-lg border border-[#061907]/5 relative mb-6 overflow-hidden flex items-center justify-center">
              <svg
                className="w-full h-full stroke-[#022956] stroke-2 fill-none opacity-80"
                preserveAspectRatio="none"
                viewBox="0 0 100 50"
              >
                <path d="M 10 25 Q 25 10, 50 25 T 90 25" strokeDasharray="4" />
                <circle className="fill-[#061907] stroke-none" cx="10" cy="25" r="3" />
                <circle className="fill-[#984800] stroke-none" cx="90" cy="25" r="3" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-50" />
            </div>

            <button className="w-full bg-[#984800] text-white text-ui-button py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#984800]/90 transition-colors">
              Get Directions
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </section>

          {/* Secondary Card: Dining */}
          <section className="bg-white rounded-xl border border-[#061907]/10 p-6 hover:border-[#061907]/20 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-label-caps text-[#434841] tracking-wider">Dining Nearby</span>
                <h3
                  className="text-[24px] font-medium text-[#061907] mt-2 leading-tight"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Nearest Open Food Stall
                </h3>
              </div>
              <span className="material-symbols-outlined text-[#061907] bg-[#061907]/5 p-2 rounded-full">
                restaurant
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg bg-[#f5f3f0] border border-[#061907]/5 overflow-hidden">
                <img
                  alt="Gourmet Burger"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuABGpQJBSnM2coIpxN1bOi8mH6kt9qpA6lGunq0Q35vpvSjsCBe6MFQct2_83Fi4-KZFljEIAag-Qs6nIvDyecFbGwv95PS97uxiyDm3duU6gA4h99PxdkhPrYfz8cGHGv0qAZKggSaxb9pzeJb3ZnlKqBCmqMxZsd-u-S91va5l-P52Hws0oixE-Px1vu9k5RotktKTvvnsZ_w6kg-dNUVi2gE9GkajbOwKT8T6ZKPgWHrILtmnToDoBVYieFsVICcYfiX7SVLRw"
                />
              </div>
              <div>
                <h4 className="text-body-lg text-[#061907]">The Grill House</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-[#001532] text-white text-label-caps px-2 py-1 rounded-full text-[10px]">
                    4 MINS WAIT
                  </span>
                  <span className="text-[#434841] text-sm flex items-center">
                    <span className="material-symbols-outlined text-[14px] mr-1">location_on</span>
                    Sec 112
                  </span>
                </div>
              </div>
            </div>

            <button className="w-full border border-[#061907] text-[#061907] text-ui-button py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#061907]/5 transition-colors uppercase tracking-wider">
              Order Now
            </button>
          </section>

          {/* VIP Upgrade Card */}
          <section className="bg-white rounded-xl border border-[#061907]/10 p-6 flex items-center gap-4 hover:border-[#061907]/20 transition-colors">
            <div className="bg-[#984800]/10 p-3 rounded-lg border border-[#984800]/20 text-[#984800]">
              <span className="material-symbols-outlined">stars</span>
            </div>
            <div className="flex-1">
              <h4 className="text-body-md font-semibold text-[#061907]">VIP Lounge Upgrade</h4>
              <p className="text-sm text-[#434841]">Access exclusive bars.</p>
            </div>
            <span className="material-symbols-outlined text-[#061907]">chevron_right</span>
          </section>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/80 backdrop-blur-md border-t border-[#1A2E1A]/5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] max-w-[414px]">
          <div className="flex justify-around items-center px-6 pt-4 pb-8">
            {BOTTOM_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center active:scale-95 group relative transition-colors ${
                  activeTab === tab.id ? "text-[#1A2E1A] font-bold" : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <span
                  className={`material-symbols-outlined group-hover:scale-110 transition-transform ${
                    activeTab === tab.id ? "filled" : ""
                  }`}
                  style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {tab.icon}
                </span>
                {tab.badge && (
                  <span className="absolute top-0 right-1 w-2 h-2 bg-[#984800] rounded-full" />
                )}
                <span className="text-[10px] uppercase tracking-tighter mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
}
