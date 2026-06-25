"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const projects = [
  { 
    id: 1, 
    title: 'Clínica de Psicologia', 
    img: '/siteEsistemaAgendamentoPsico.png', 
    type: 'site', 
    url: 'https://www.amandaladeirapsi.com.br/', 
    desc: 'Site institucional moderno para atendimentos psicológicos, contando com sistema de agendamento online inteligente e arquitetura focada na captação de pacientes.' 
  },
  { 
    id: 2, 
    title: 'Cadastro de Atividades Homeschooling', 
    img: '/sistemadeRegistroAtividadeHomeschoopling.png', 
    type: 'site', 
    url: 'https://www.centelhahomeschooling.com.br/vendas', 
    desc: 'Landing page de alta conversão para o Centelha Homeschooling, apresentando um sistema exclusivo e completo para o registro de atividades domiciliares.' 
  },
  { 
    id: 3, 
    title: 'Portal do Colaborador', 
    img: '/holeritesUnipac.png', 
    type: 'sistema', 
    url: '', 
    desc: 'Plataforma corporativa segura e ágil projetada para os colaboradores da UNIPAC acessarem de forma unificada seus holerites e informações.' 
  },
  { 
    id: 4, 
    title: 'Dashboard RD Station', 
    img: '/dashboardStreamlitRdStation.png', 
    type: 'sistema', 
    url: '', 
    desc: 'Painel de Business Intelligence (BI) interativo desenvolvido em Streamlit com processamento de dados do RD Station para análise profunda de indicadores.' 
  }
];

export default function Portfolio() {
  const [activeCard, setActiveCard] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="portfolio-container">
      <nav className="portfolio-nav">
        <Link href="/" className="back-button">← Voltar</Link>
      </nav>

      <div className="portfolio-header">
        <h1 className="portfolio-title">Meus Projetos</h1>
        <p className="portfolio-subtitle">Um pouco do que venho construindo.</p>
      </div>

      <div className={`portfolio-grid ${projects.length <= 4 ? 'grid-2-cols' : 'grid-3-cols'}`}>
        {projects.map((project, index) => (
          <div 
            key={project.id} 
            className="portfolio-card"
            onClick={() => setActiveCard(project.id)}
            style={{ animationDelay: `${index * 0.15}s, ${index * -0.8}s` }}
          >
            <div className="card-image-wrapper">
              <Image 
                src={project.img} 
                alt={project.title} 
                fill 
                className="card-image"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="card-overlay">
              <span className="card-type-label">
                {project.type === 'site' ? 'Website' : 'Sistema Online'}
              </span>
              <h3 className="card-title-hover">{project.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {activeCard && (() => {
        const project = projects.find(p => p.id === activeCard);
        return (
          <div className="portfolio-modal-backdrop" onClick={() => setActiveCard(null)}>
            <div className="portfolio-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-back-button" onClick={() => setActiveCard(null)}>← Voltar</button>
              
              <div className="modal-image-container">
                <Image 
                  src={project.img} 
                  alt={project.title} 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
              </div>
              
              <div className="modal-content">
                <h2>{project.title}</h2>
                <p className="modal-subtitle">{project.type === 'site' ? 'Website' : 'Sistema Fechado'}</p>
                
                <p className="description">{project.desc}</p>
                
                <div className="modal-actions">
                  {project.type === 'site' ? (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn-highlight">
                      Ir para o site
                    </a>
                  ) : (
                    <div className="info-box">
                      🔒 Acesso restrito (Uso interno do cliente)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}
