"use client";

import { motion } from "framer-motion";
import { ORGANIZERS } from "@/lib/constants";

export default function Organizers() {
  return (
    <section className="relative py-24 sm:py-32 bg-[#0D2233]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-16 text-center"
        >
          Organized By
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ORGANIZERS.map((org, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-[#1B4965]/40 backdrop-blur-sm border border-[#2C7DA0]/30 rounded-2xl p-8 hover:shadow-[0_0_30px_rgba(44,125,160,0.2)] transition-all duration-300"
            >
              {/* Tag */}
              <span className="inline-block bg-[#2C7DA0]/20 text-[#61A5C2] text-xs font-semibold px-3 py-1 rounded-full border border-[#2C7DA0]/40 mb-6">
                {org.tag}
              </span>

              {/* Logo placeholder */}
              <div className="w-full h-20 bg-[#1B4965] rounded-lg flex items-center justify-center mb-6 border border-[#2C7DA0]/20">
                <span className="text-[#61A5C2] text-sm font-medium">
                  {org.tag} Logo
                </span>
              </div>

              {org.href ? (
                <a
                  href={org.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#61A5C2] transition-colors duration-200"
                >
                  <h3 className="text-[#EAF6FF] font-bold text-xl mb-2 hover:text-inherit">
                    {org.title}
                  </h3>
                </a>
              ) : (
                <h3 className="text-[#EAF6FF] font-bold text-xl mb-2">
                  {org.title}
                </h3>
              )}
              <p className="text-[#61A5C2] text-sm mb-4">{org.subtitle}</p>
              <p className="text-[#A9D6E5]/70 text-sm leading-relaxed">
                {org.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
