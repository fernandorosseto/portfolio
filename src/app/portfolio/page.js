"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

export default function Portfolio() {
  const { t } = useLanguage();
  const [activeCard, setActiveCard] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const projects = [
    { 
      id: 1, 
      title: t.proj1Title, 
      img: '/siteEsistemaAgendamentoPsico.png', 
      type: 'site', 
      url: 'https://www.amandaladeirapsi.com.br/', 
      desc: t.proj1Desc 
    },
    { 
      id: 2, 
      title: t.proj2Title, 
      img: '/sistemadeRegistroAtividadeHomeschoopling.png', 
      type: 'site', 
      url: 'https://www.centelhahomeschooling.com.br/vendas', 
      desc: t.proj2Desc 
    },
    { 
      id: 3, 
      title: t.proj3Title, 
      img: '/holeritesUnipac.png', 
      type: 'sistema', 
      url: '', 
      desc: t.proj3Desc 
    },
    { 
      id: 4, 
      title: t.proj4Title, 
      img: '/dashboardStreamlitRdStation.png', 
      type: 'sistema', 
      url: '', 
      desc: t.proj4Desc 
    }
  ];

  if (!mounted) return null;

  return (
    <main className="portfolio-container">
      <nav className="portfolio-nav">
        <Link href="/" className="back-button">{t.back}</Link>
        <LanguageToggle />
      </nav>

      <div className="portfolio-header">
        <h1 className="portfolio-title">{t.myProjects}</h1>
        <p className="portfolio-subtitle">{t.portfolioSubtitle}</p>
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
                {project.type === 'site' ? t.website : t.onlineSystem}
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
              <button className="modal-back-button" onClick={() => setActiveCard(null)}>{t.back}</button>
              
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
                <p className="modal-subtitle">{project.type === 'site' ? t.website : t.closedSystem}</p>
                
                <p className="description">{project.desc}</p>
                
                <div className="modal-actions">
                  {project.type === 'site' ? (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn-highlight">
                      {t.goToSite}
                    </a>
                  ) : (
                    <div className="info-box">
                      {t.restrictedAccess}
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
