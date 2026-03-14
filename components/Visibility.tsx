"use client";

import { motion } from "framer-motion";
import {
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";

const iconMap = {
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaGlobe,
};

const RAS_CHANNELS = [
  { platform: "WhatsApp", icon: "FaWhatsapp" as keyof typeof iconMap },
  { platform: "Facebook", icon: "FaFacebook" as keyof typeof iconMap },
  { platform: "LinkedIn", icon: "FaLinkedin" as keyof typeof iconMap },
];

const WIE_CHANNELS = [
  { platform: "Official Website", icon: "FaGlobe" as keyof typeof iconMap },
  { platform: "Facebook", icon: "FaFacebook" as keyof typeof iconMap },
  { platform: "LinkedIn", icon: "FaLinkedin" as keyof typeof iconMap },
  { platform: "YouTube Channel", icon: "FaYoutube" as keyof typeof iconMap },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function ChannelCard({
  platform,
  icon,
}: {
  platform: string;
  icon: keyof typeof iconMap;
}) {
  const Icon = iconMap[icon];
  return (
    <motion.div
      variants={itemVariants}
      className="bg-[#1B4965]/40 backdrop-blur-sm border border-[#2C7DA0]/30 rounded-xl p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(44,125,160,0.2)] transition-all duration-300"
    >
      <div className="w-10 h-10 rounded-lg bg-[#2C7DA0]/20 flex items-center justify-center text-[#61A5C2]">
        <Icon size={20} />
      </div>
      <span className="text-[#EAF6FF] text-sm font-medium">{platform}</span>
    </motion.div>
  );
}

export default function Visibility() {
  return (
    <section className="relative py-24 sm:py-32 bg-[#0D2233]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-16 text-center"
        >
          Our Reach
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* RAS */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#61A5C2] font-bold text-lg mb-6 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#2C7DA0]" />
              IEEE RAS Channels
            </motion.h3>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-3"
            >
              {RAS_CHANNELS.map((ch, i) => (
                <ChannelCard key={i} {...ch} />
              ))}
            </motion.div>
          </div>

          {/* WIE */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#61A5C2] font-bold text-lg mb-6 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#61A5C2]" />
              IEEE WIE Channels
            </motion.h3>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-3"
            >
              {WIE_CHANNELS.map((ch, i) => (
                <ChannelCard key={i} {...ch} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
