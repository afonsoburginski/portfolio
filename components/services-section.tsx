"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const services = [
  {
    id: 1,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Desenvolvimento Web",
    description: "Criação de sites e aplicações web modernas, responsivas e otimizadas utilizando as melhores práticas do mercado."
  },
  {
    id: 2,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "Apps Mobile",
    description: "Desenvolvimento de aplicações mobile com React Native, garantindo performance e experiência nativa em iOS e Android."
  },
  {
    id: 3,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    title: "Backend & APIs",
    description: "Desenvolvimento de APIs RESTful e GraphQL robustas, escaláveis e seguras com Node.js, Express e bancos de dados modernos."
  },
  {
    id: 4,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: "UI/UX Design",
    description: "Design de interfaces modernas e intuitivas, focadas em proporcionar a melhor experiência para o usuário."
  },
  {
    id: 5,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Performance",
    description: "Otimização de performance de aplicações web, garantindo carregamento rápido e melhor experiência do usuário."
  },
  {
    id: 6,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    title: "Consultoria Tech",
    description: "Consultoria técnica para projetos de software, arquitetura de soluções e boas práticas de desenvolvimento."
  }
];

export function ServicesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="services" className="relative py-20 px-4 md:px-8 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-500 font-semibold text-sm uppercase tracking-wider">
            Serviços
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            O que eu faço
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Ofereço soluções completas de desenvolvimento, desde a concepção até a entrega final
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative group"
            >
              <div className="relative h-full p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm hover:bg-white/5 transition-all duration-300">
                {/* Hover Effect */}
                {hoveredIndex === idx && (
                  <motion.div
                    layoutId="hoverBackground"
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all group"
          >
            Vamos trabalhar juntos
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

