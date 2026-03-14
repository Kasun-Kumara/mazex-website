"use client";

import { motion } from "framer-motion";
import { SPONSOR_TIERS } from "@/lib/constants";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Sponsorship() {
  return (
    <section id="sponsors" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Partner With Us
          </h2>
          <p className="text-[#A9D6E5]/80 text-lg max-w-2xl mx-auto">
            Join us in shaping the next generation of robotics engineers
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {SPONSOR_TIERS.map((tier, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-[#1B4965]/40 backdrop-blur-sm border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(44,125,160,0.3)] transition-all duration-300 flex flex-col"
              style={{ borderColor: `${tier.color}40` }}
            >
              {/* Icon + tier */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{tier.icon}</span>
                <h3
                  className="font-bold text-lg"
                  style={{ color: tier.color }}
                >
                  {tier.tier}
                </h3>
              </div>

              {/* Amount pill */}
              <span
                className="inline-block self-start px-3 py-1 rounded-full text-xs font-semibold mb-5"
                style={{
                  backgroundColor: `${tier.color}15`,
                  color: tier.color,
                  border: `1px solid ${tier.color}40`,
                }}
              >
                {tier.amount}
              </span>

              {/* Perks */}
              <ul className="space-y-2 mb-6 flex-1">
                {tier.perks.map((perk, j) => (
                  <li
                    key={j}
                    className="text-[#A9D6E5]/70 text-sm flex items-start gap-2"
                  >
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tier.color }}
                    />
                    {perk}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                className="w-full py-2 rounded-lg text-sm font-medium border transition-all duration-300 hover:bg-[#2C7DA0]/10 cursor-pointer"
                style={{
                  borderColor: `${tier.color}60`,
                  color: tier.color,
                }}
              >
                Learn More
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-[#1B4965]/40 backdrop-blur-sm border border-[#2C7DA0]/30 rounded-2xl p-8 sm:p-12 text-center"
        >
          <h3 className="text-[#EAF6FF] font-bold text-2xl mb-3">
            Interested in partnering? Let&apos;s talk.
          </h3>
          <p className="text-[#A9D6E5]/70 mb-6 max-w-lg mx-auto">
            Help us make MazeX 1.0 a landmark event for robotics education at
            the University of Moratuwa.
          </p>
          <a
            href="mailto:contact@mazex.lk"
            className="inline-block bg-[#2C7DA0] text-[#EAF6FF] px-8 py-3 rounded-full font-semibold hover:shadow-[0_0_30px_rgba(44,125,160,0.5)] transition-all duration-300"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}
