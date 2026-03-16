"use client";

import { motion } from "framer-motion";
import { MICROMOUSE_STATS } from "@/lib/constants";
import MazeAnimation from "./MazeAnimation";

export default function WhatIsMicromouse() {
  return (
    <section id="micromouse" className="relative py-24 sm:py-32 bg-[#0D2233]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-16 text-center"
        >
          What is a Micromouse?
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Maze Animation */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <MazeAnimation size={320} />
          </motion.div>

          {/* Right - Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#A9D6E5]/80 text-lg leading-relaxed mb-10">
              A Micromouse is a small, fully autonomous robot that navigates and
              solves a maze in the shortest possible time with no human
              intervention. It uses sensors to detect walls, processes data using
              onboard microcontrollers, and applies maze-solving algorithms to
              find the optimal path.
            </p>

            {/* Stat boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MICROMOUSE_STATS.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-[#1B4965]/60 backdrop-blur-sm border border-[#2C7DA0]/40 rounded-xl p-4 text-center"
                >
                  <h4 className="text-[#EAF6FF] font-bold text-sm mb-1">
                    {stat.title}
                  </h4>
                  <p className="text-[#61A5C2] text-xs">{stat.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
