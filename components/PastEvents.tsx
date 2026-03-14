"use client";

import { motion } from "framer-motion";
import { PAST_EVENTS } from "@/lib/constants";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function PastEvents() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-16 text-center"
        >
          What We&apos;ve Done Before
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto"
        >
          {PAST_EVENTS.map((event, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-[#1B4965]/40 backdrop-blur-sm border border-[#2C7DA0]/30 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(44,125,160,0.2)] transition-all duration-300 flex flex-col min-w-[280px]"
            >
              {/* Top accent bar */}
              <div className="h-1 bg-[#2C7DA0]" />

              <div className="p-6 flex-1 flex flex-col">
                {/* Event number */}
                <span className="text-[#2C7DA0] text-xs font-semibold mb-3">
                  EVENT {String(i + 1).padStart(2, "0")}
                </span>

                <h3 className="text-[#EAF6FF] font-bold text-xl mb-3">
                  {event.title}
                </h3>
                <p className="text-[#A9D6E5]/70 text-sm leading-relaxed flex-1">
                  {event.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
