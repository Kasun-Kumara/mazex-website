"use client";

import { motion } from "framer-motion";
import Countdown from "./Countdown";
import HexBackground from "./HexBackground";

export default function RegisterCTA() {
  return (
    <section id="register" className="relative py-24 sm:py-32 overflow-hidden">
      <HexBackground opacity={0.04} />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(44, 125, 160, 0.15) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-4"
        >
          Ready to Build Your Micromouse?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[#A9D6E5]/80 text-lg mb-12 max-w-2xl mx-auto"
        >
          Registration opens April 4th, 2026. Don&apos;t miss your chance to
          compete.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Countdown />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a
            href="#"
            className="inline-block bg-[#2C7DA0] text-[#EAF6FF] px-10 py-4 rounded-full text-lg font-bold hover:shadow-[0_0_40px_rgba(44,125,160,0.6)] transition-all duration-300 animate-pulse-glow"
          >
            Register Now — Starting April 4
          </a>
        </motion.div>
      </div>
    </section>
  );
}
