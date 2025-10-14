"use client";

import { motion } from "framer-motion";

const experiences = [
  {
    id: 1,
    role: "Desenvolvedor Full Stack",
    company: "Freelancer",
    period: "2020 - Presente",
    description: "Desenvolvimento de aplicações web completas, desde o planejamento até a entrega, utilizando tecnologias modernas como React, Next.js, Node.js e bancos de dados SQL e NoSQL.",
    achievements: [
      "Desenvolvimento de +20 projetos web",
      "Melhoria de performance em até 70%",
      "Implementação de soluções escaláveis"
    ]
  },
  {
    id: 2,
    role: "Desenvolvedor Frontend",
    company: "Projetos Pessoais",
    period: "2019 - 2020",
    description: "Criação de interfaces modernas e responsivas, focando em experiência do usuário e performance. Trabalho com React, TypeScript e Tailwind CSS.",
    achievements: [
      "Criação de componentes reutilizáveis",
      "Implementação de design systems",
      "Otimização de SEO e acessibilidade"
    ]
  }
];

export function ExperienceSection() {
  return (
    <section id="experience" className="relative py-20 px-4 md:px-8 overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent pointer-events-none" />
      
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
            Experiência
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Minha jornada
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experiência em desenvolvimento de soluções completas e inovadoras
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500" />

          {/* Experience Items */}
          <div className="space-y-12">
            {experiences.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className={`relative flex items-center ${
                  idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                  <div className="p-6 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm hover:bg-white/5 transition-all group">
                    <div className="mb-4">
                      <span className="text-blue-400 text-sm font-semibold">
                        {exp.period}
                      </span>
                      <h3 className="text-2xl font-bold text-white mt-1">
                        {exp.role}
                      </h3>
                      <p className="text-purple-400 font-medium">
                        {exp.company}
                      </p>
                    </div>
                    
                    <p className="text-gray-400 mb-4 leading-relaxed">
                      {exp.description}
                    </p>

                    <div className="space-y-2">
                      {exp.achievements.map((achievement, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-300 text-sm">
                            {achievement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Center Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 -ml-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-4 border-black z-10" />

                {/* Spacer for alternate layout */}
                <div className="hidden md:block w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

