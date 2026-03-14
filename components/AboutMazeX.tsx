"use client";

import { motion } from "framer-motion";
import { ABOUT_FEATURES } from "@/lib/constants";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AboutMazeX() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-6">
              What is MazeX 1.0?
            </h2>
            <p className="text-[#A9D6E5]/80 text-lg leading-relaxed mb-8">
              MazeX 1.0 is an intra-university Micromouse Robotics Competition
              organized by IEEE RAS and WIE at the University of Moratuwa. It is
              a technical initiative designed to push the boundaries of robotics
              through hands-on engineering.
            </p>
            <div className="border-l-2 border-[#2C7DA0] pl-4">
              <p className="text-[#61A5C2] text-sm leading-relaxed italic">
                A preliminary workshop will introduce micromouse concepts, maze
                solving techniques, and robot design — giving all participants
                practical experience in robotics, embedded systems, and algorithm
                development.
              </p>
            </div>
          </motion.div>

          {/* Right - Feature cards grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            {ABOUT_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-[#1B4965]/60 backdrop-blur-sm border border-[#2C7DA0]/40 rounded-xl p-5 text-center hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(44,125,160,0.3)] transition-all duration-300 cursor-default"
              >
                <div
                  className="text-3xl mb-3"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(44,125,160,0.5))",
                  }}
                >
                  {feature.icon}
                </div>
                <p className="text-[#EAF6FF] text-sm font-medium">
                  {feature.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
