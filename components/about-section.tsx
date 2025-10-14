"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function AboutSection() {
  return (
    <section id="about" className="relative py-20 px-4 md:px-8 overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Imagem */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl border border-white/10 flex items-center justify-center">
                <div className="text-8xl">👨‍💻</div>
              </div>
            </div>
          </motion.div>

          {/* Conteúdo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-block">
              <span className="text-blue-500 font-semibold text-sm uppercase tracking-wider">
                Sobre mim
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Desenvolvedor Full Stack
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                apaixonado por tecnologia
              </span>
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed">
              Olá! Sou Afonso Burginski, desenvolvedor full stack com experiência em criar soluções 
              web modernas e escaláveis. Trabalho com as mais recentes tecnologias do mercado, 
              sempre buscando entregar a melhor experiência para o usuário.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Desenvolvimento Web Moderno</h3>
                  <p className="text-gray-400">Especialista em React, Next.js e TypeScript</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Soluções Completas</h3>
                  <p className="text-gray-400">Do frontend ao backend, criando aplicações robustas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Performance e Qualidade</h3>
                  <p className="text-gray-400">Código limpo, otimizado e de fácil manutenção</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="#contact"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Entre em Contato
              </a>
              <a
                href="#projects"
                className="px-8 py-3 border border-white/20 rounded-full text-white font-semibold hover:bg-white/5 transition-all"
              >
                Ver Projetos
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

