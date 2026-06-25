"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';

// Importação dinâmica do Canvas WebGL (Three.js/Fiber) para não inflar o bundle inicial
const WebGLCanvas = dynamic(() => import('./components/WebGLCanvas'), { 
  ssr: false,
  loading: () => <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "transparent" }} />
});

function TypewriterText({ text, delay = 0 }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    let interval;
    
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
        }
      }, 100); // 100ms por caractere
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay]);

  return (
    <>
      {displayedText}
      <span className="typewriter-caret" />
    </>
  );
}

function FlickerSubtitle({ text }) {
  const [flicker, setFlicker] = useState(true);

  useEffect(() => {
    // A cada 12 segundos, forçar a animação a rodar novamente
    const interval = setInterval(() => {
      setFlicker(false);
      setTimeout(() => setFlicker(true), 50); 
    }, 12000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <h2 className={`card-subtitle ${flicker ? 'text-flicker-in-glow' : ''}`} style={{ marginBottom: "2rem", minHeight: "2em" }}>
      {text}
    </h2>
  );
}

export default function Home() {
  const router = useRouter();
  const [clickedBtn, setClickedBtn] = useState(null);
  const [isSucking, setIsSucking] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [bgWhite, setBgWhite] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('from_success') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (bgWhite) {
      sessionStorage.removeItem('from_success');
      setTimeout(() => {
        setContentVisible(true);
        setBgWhite(false);
      }, 1500); // Aguarda 1.5s para as folhas aparecerem antes de mostrar o texto e escurecer o fundo
    } else {
      setContentVisible(true);
    }
  }, [bgWhite]);

  const handleNav = (e, path, id) => {
    e.preventDefault();
    setClickedBtn(id);
    
    if (id === 'portfolio') {
      setIsSucking(true);
      setTimeout(() => {
        router.push(path);
      }, 2000); // 2 segundos para o espetáculo do buraco negro
    } else {
      setTimeout(() => {
        router.push(path);
      }, 600); 
    }
  };

  return (
    <main className="main-container">
      <div className="glow-effect" />
      
      {/* Fundo dinâmico para a transição de sucesso */}
      <div 
        style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 4, 
          backgroundColor: bgWhite ? '#f9fbfd' : '#6c7a8f',
          transition: 'background-color 1.5s ease-in-out'
        }}
      />

      {/* Grid de Pedaços de Papel Renderizados em GPU via WebGL (carregado sob demanda) */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 5 }}>
        <WebGLCanvas isSucking={isSucking} />
      </div>

      {/* Conteúdo sobreposto */}
      <div className={`content-overlay ${isSucking ? 'fade-out' : ''}`} style={{ opacity: contentVisible ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
        <div className="content-wrapper">
          <h1 className="card-title" style={{ minHeight: '1.2em' }}>
            {contentVisible && <TypewriterText text="Fernando Rosseto" />}
          </h1>
          {contentVisible && <FlickerSubtitle text="Desenvolvo soluções." />}

          <div className="button-group" style={{ gap: "2.5rem", marginTop: "12vh" }}>
            <a 
              href="/portfolio" 
              className={`btn-text ${clickedBtn === 'portfolio' ? 'clicked' : ''}`}
              onClick={(e) => handleNav(e, '/portfolio', 'portfolio')}
            >
              Portfólios
            </a>
            <div style={{ position: 'relative' }}>
              <div className="floating-arrows">
                <span>
                  <svg width="17" height="17" viewBox="0 0 24 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0h10v18h6L12 32 1 18h6V0z" />
                  </svg>
                </span>
                <span>
                  <svg width="21" height="19" viewBox="0 0 24 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0h10v18h6L12 32 1 18h6V0z" />
                  </svg>
                </span>
                <span>
                  <svg width="20" height="15" viewBox="0 0 24 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0h10v18h6L12 32 1 18h6V0z" />
                  </svg>
                </span>
              </div>
              <a 
                href="/orcamento" 
                className={`btn-highlight ${clickedBtn === 'orcamento' ? 'clicked' : ''}`}
                onClick={(e) => handleNav(e, '/orcamento', 'orcamento')}
              >
                Clique Aqui
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
