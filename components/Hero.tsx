"use client";

import { motion } from "framer-motion";
import { HERO_STATS } from "@/lib/constants";
import HexBackground from "./HexBackground";
import MazeAnimation from "./MazeAnimation";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <HexBackground opacity={0.06} />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 right-1/4 w-[600px] h-[600px] -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(27, 73, 101, 0.4) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-6"
            >
              <span className="bg-[#1B4965] text-[#61A5C2] border border-[#2C7DA0] px-4 py-1.5 rounded-full text-sm font-medium">
                IEEE RAS × WIE | University of Moratuwa
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl sm:text-7xl lg:text-8xl xl:text-[96px] font-bold uppercase gradient-text leading-tight mb-4"
            >
              MazeX 1.0
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl text-[#A9D6E5] mb-6 font-[family-name:var(--font-space-grotesk)]"
            >
              Micromouse Workshop Series & Competition
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[#A9D6E5]/80 text-base sm:text-lg max-w-xl mb-8 leading-relaxed"
            >
              Build. Program. Solve. An intra-university robotics competition
              where you design an autonomous maze-solving robot and race against
              the best minds at Moratuwa.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <a
                href="#register"
                className="bg-[#2C7DA0] text-[#EAF6FF] px-8 py-3 rounded-full font-semibold hover:shadow-[0_0_30px_rgba(44,125,160,0.5)] transition-all duration-300 text-base"
              >
                Register Now
              </a>
              <a
                href="#about"
                className="border border-[#61A5C2] text-[#61A5C2] px-8 py-3 rounded-full font-semibold hover:bg-[#61A5C2]/10 transition-all duration-300 text-base"
              >
                Learn More
              </a>
            </motion.div>

            {/* Stat pills */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              {HERO_STATS.map((stat, i) => (
                <span
                  key={i}
                  className="bg-[#1B4965]/60 border border-[#2C7DA0]/30 text-[#A9D6E5] px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <span>{stat.icon}</span>
                  {stat.label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right - Maze Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex justify-center items-center"
          >
            <MazeAnimation size={360} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
