"use client";

import { motion } from "framer-motion";

const skillCategories = [
  {
    title: "Streaming & Media",
    skills: [
      { name: "WebRTC", level: 95 },
      { name: "HLS / LL-HLS", level: 90 },
      { name: "FFmpeg", level: 88 },
      { name: "Video analytics", level: 92 },
      { name: "Custom players", level: 95 },
    ]
  },
  {
    title: "Distributed Systems",
    skills: [
      { name: "NestJS / Node.js", level: 85 },
      { name: "Kafka", level: 82 },
      { name: "Redis / BullMQ", level: 80 },
      { name: "PostgreSQL", level: 78 },
      { name: "WebSockets", level: 88 },
    ]
  },
  {
    title: "Platform Engineering",
    skills: [
      { name: "Kubernetes", level: 90 },
      { name: "Docker", level: 75 },
      { name: "GitOps / Argo CD", level: 85 },
      { name: "CI/CD", level: 80 },
      { name: "TypeScript", level: 95 },
    ]
  }
];

export function SkillsSection() {
  return (
    <section id="skills" className="relative py-20 px-4 md:px-8 overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-500 font-semibold text-sm uppercase tracking-wider">
            Engineering capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Systems I build and operate
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Practical depth in media systems, distributed backends, and platform infrastructure
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIdx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIdx * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {category.title}
              </h3>
              
              <div className="space-y-4">
                {category.skills.map((skill, skillIdx) => (
                  <div key={skill.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 font-medium">
                        {skill.name}
                      </span>
                      <span className="text-blue-400 text-sm font-semibold">
                        {skill.level}%
                      </span>
                    </div>
                    
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: categoryIdx * 0.1 + skillIdx * 0.1 }}
                        viewport={{ once: true }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Tech Stack
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-6">
              {["WebRTC", "HLS", "FFmpeg", "Kafka", "Kubernetes", "PostgreSQL", "Redis", "Docker", "React Native"].map((tech) => (
                <div
                  key={tech}
                  className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 hover:border-blue-500/50 hover:text-white transition-all cursor-default"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

