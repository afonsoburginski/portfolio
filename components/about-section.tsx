"use client";

import { motion } from "motion/react";
import Image from "next/image";

const skills = [
  "React Native",
  "Next.js", 
  "Node.js",
  "Golang",
  "TypeScript",
  "Supabase",
  "PostgreSQL",
  "Docker",
  "REST APIs"
];

const experiences = [
  {
    role: "Senior Mobile Developer",
    company: "Freelance",
    period: "Currently"
  },
  {
    role: "Full Stack Developer", 
    company: "Tech Startup",
    period: "2021-24"
  },
  {
    role: "Frontend Developer",
    company: "Web Agency", 
    period: "2018-21"
  }
];

export function AboutSection() {
  return (
    <section id="about-me" className="relative py-20 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative aspect-[16/9] rounded-2xl overflow-hidden group"
          >
            <Image
              src="https://framerusercontent.com/images/roWFLkzHAotwSx5UxGPxpxMeA.jpg"
              alt="Afonso profile picture"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-all duration-500 transform-gpu will-change-transform filter grayscale group-hover:grayscale-0 group-hover:scale-[1.06]"
              priority
            />
          </motion.div>

          {/* Right - Content */}
          <div className="space-y-8">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[56px] md:text-[80px] lg:text-[96px] font-normal text-white mb-4 leading-[1.03] tracking-[-0.02em] font-satoshi">
                Meet Afonso
              </h2>
            </motion.div>

            {/* About Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-white/70 text-lg leading-relaxed font-sans">
                I'm Afonso Burginski, a Senior Mobile Developer with 6+ years of experience. I specialize in React Native and Next.js, building scalable mobile apps and web applications. Currently focused on mobile development while maintaining expertise in full-stack solutions.
              </p>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-white text-xl font-medium font-sans">Skills</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    viewport={{ once: true }}
                    className="px-4 py-2 bg-[#0d0d0d] rounded-lg text-white text-sm font-sans"
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* Experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-white text-xl font-medium font-sans">Experience</h3>
              <div className="space-y-4">
                {experiences.map((exp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="p-6 bg-[#0d0d0d] rounded-[20px] shadow-[16px_24px_20px_8px_rgba(0,0,0,0.4)]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium text-sm font-sans">{exp.role}</p>
                        <p className="text-white/70 text-sm font-sans">{exp.company}</p>
                      </div>
                      <p className="text-white/70 text-sm font-sans">{exp.period}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}