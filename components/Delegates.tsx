"use client";

import { motion } from "framer-motion";

export default function Delegates() {
  return (
    <section id="delegates" className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 bg-[#0D2233]">
      {/* Decorative radial glow */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(44, 125, 160, 0.12) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(97, 165, 194, 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section tag */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-4"
        >
          <span className="inline-block bg-[#2C7DA0]/15 text-[#61A5C2] text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#2C7DA0]/30">
            For Delegates
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-6 pb-2 text-center"
        >
          Delegate Booklet
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[#A9D6E5]/80 text-lg sm:text-xl leading-relaxed text-center max-w-3xl mx-auto mb-16"
        >
          Everything you need to know about MazeX 1.0 in one place. Our comprehensive
          delegate booklet covers the event schedule, competition rules, venue logistics,
          and technical resources — designed to help every participant make the most of
          this experience.
        </motion.p>

        {/* Download CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-gradient-to-br from-[#1B4965]/70 to-[#0D2233]/90 backdrop-blur-sm border border-[#2C7DA0]/30 rounded-3xl p-8 sm:p-12 overflow-hidden"
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(44, 125, 160, 0.1) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* PDF icon illustration */}
            <div className="flex-shrink-0">
              <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-gradient-to-br from-[#2C7DA0]/30 to-[#1B4965]/60 border border-[#2C7DA0]/40 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(44,125,160,0.15)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 sm:w-12 sm:h-12 text-[#61A5C2] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="text-[#A9D6E5] text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                  PDF
                </span>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-[#EAF6FF] text-xl sm:text-2xl font-bold mb-3">
                Download the Official Delegate Booklet
              </h3>
              <p className="text-[#A9D6E5]/70 text-sm sm:text-base leading-relaxed max-w-xl">
                Get your hands on the complete guide — event schedules, competition
                rules, venue navigation, and all the technical resources you'll need.
                Available as a convenient PDF for offline access.
              </p>
            </div>

            {/* Download button */}
            <div className="flex-shrink-0">
              <a
                href="/downloads/Delegate_booklet_dummy.pdf"
                download
                className="group/btn inline-flex items-center gap-3 bg-[#2C7DA0] hover:bg-[#3A8DB3] text-[#EAF6FF] px-8 py-4 rounded-full text-base font-bold shadow-[0_0_25px_rgba(44,125,160,0.3)] hover:shadow-[0_0_40px_rgba(44,125,160,0.5)] transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Booklet
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
