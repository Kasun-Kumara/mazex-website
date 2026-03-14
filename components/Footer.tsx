"use client";

import { NAV_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#030F18] border-t border-[#1B4965]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left - Logo + tagline */}
          <div>
            <div className="flex items-baseline gap-0 text-xl font-bold font-[family-name:var(--font-space-grotesk)] mb-4">
              <span className="text-[#EAF6FF]">MAZE</span>
              <span className="text-[#61A5C2] text-2xl">X</span>
              <span className="text-[#2C7DA0] text-xs ml-0.5 relative -top-2">
                1.0
              </span>
            </div>
            <p className="text-[#61A5C2] text-sm leading-relaxed">
              Micromouse Workshop Series & Competition
              <br />
              University of Moratuwa
            </p>
          </div>

          {/* Middle - Quick Links */}
          <div>
            <h4 className="text-[#EAF6FF] font-bold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[#61A5C2] hover:text-[#A9D6E5] text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Organized by */}
          <div>
            <h4 className="text-[#EAF6FF] font-bold text-sm uppercase tracking-wider mb-4">
              Organized By
            </h4>
            <ul className="space-y-2 text-[#61A5C2] text-sm">
              <li>University of Moratuwa IEEE Student Branch</li>
              <li>IEEE Robotics & Automation Society Chapter</li>
              <li>IEEE WIE Affinity Group</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1B4965]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-[#61A5C2] text-xs text-center">
            © 2026 MazeX 1.0 | IEEE Student Branch, University of Moratuwa
          </p>
        </div>
      </div>
    </footer>
  );
}
