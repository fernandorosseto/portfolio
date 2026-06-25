'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { HexColorPicker } from "react-colorful";

const optionsStep1 = [
  { id: 'leads', label: 'Captar leads e contatos' },
  { id: 'vendas', label: 'Vender um produto online' },
  { id: 'institucional', label: 'Apresentar minha empresa' },
  { id: 'sistema', label: 'Criar um sistema customizado' }
];

function TiltCard({ children, delay = 0 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="orcamento-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '1rem', transform: 'translateZ(20px)' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Orcamento() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState({ 
    objetivo: '', 
    descricao: '',
    estilo: '',
    logo: null,
    possuiDominio: null,
    dominioUrl: '',
    tema: '',
    corPrincipal: '#000000',
    corSecundaria: '#ffffff',
    nome: '',
    contato: ''
  });
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  
  const carouselRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Initial scroll sync
    if (carouselRef.current) {
      setScrollY(carouselRef.current.scrollTop);
    }
  }, []);

  const handleScroll = (e) => {
    setScrollY(e.target.scrollTop);
  };

  const scrollUp = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ top: -80, behavior: 'smooth' });
  };

  const scrollDown = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ top: 80, behavior: 'smooth' });
  };

  const handleSelect = (id) => {
    setFormData({ ...formData, objetivo: id });
    setTimeout(() => {
      setStep(2);
    }, 400);
  };

  const handleSubmit = async () => {
    // Aqui vai a lógica de enviar para o WhatsApp ou API
    console.log("Enviando Formulário para API:", formData);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        throw new Error('Falha ao enviar e-mail');
      }
      
      // Mostra o passo 6 (mensagem de sucesso)
      setStep(6);
      
      // Aguarda um pouco para leitura, depois inicia a transição de corte
      setTimeout(() => {
        setIsClosing(true);
        
        // Aguarda o tempo da animação (1s) para redirecionar
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }, 2000);
      
    } catch (error) {
      console.error(error);
      alert('Houve um problema ao enviar o orçamento. Por favor, tente novamente.');
    }
  };

  if (!mounted) return null;

  return (
    <main className={`orcamento-container ${isClosing ? 'closing' : ''}`}>
      <nav className="orcamento-nav">
        <Link href="/" className="back-button">← Voltar</Link>
      </nav>
      
      <div className="interactive-form-wrapper">
        <div className="form-step-container" style={{ overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="step-content">
              <span className="step-counter">1 de 5</span>
              <h1 className="step-question">Qual o principal objetivo do seu projeto?</h1>
              
              <div className="carousel-container">
                <button className="carousel-nav-btn up" onClick={scrollUp}>▲</button>
                
                <div className="carousel-viewport" ref={carouselRef} onScroll={handleScroll}>
                  <div className="options-list">
                    {optionsStep1.map((opt, index) => {
                      const itemHeight = 80;
                      const offset = scrollY - (index * itemHeight);
                      const normalizedOffset = offset / itemHeight;
                      
                      // 3D Math for Drum Picker effect
                      const angle = normalizedOffset * 35; // 35 degrees per item distance
                      const scale = Math.max(0.6, 1 - Math.abs(normalizedOffset) * 0.15);
                      const opacity = Math.max(0, 1 - Math.abs(normalizedOffset) * 0.75); // Aumentada a queda de opacidade
                      const isCenter = Math.abs(normalizedOffset) < 0.5;
                      
                      return (
                        <button 
                          key={opt.id}
                          className="option-btn"
                          onClick={() => { if (isCenter) handleSelect(opt.id) }} // Só permite clique se estiver no centro
                          style={{
                            transform: `rotateX(${angle}deg) scale(${scale})`,
                            opacity: opacity,
                            color: isCenter ? 'var(--color-accent)' : 'var(--text-secondary)',
                            cursor: isCenter ? 'pointer' : 'default' // Muda o cursor para indicar que não é clicável
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button className="carousel-nav-btn down" onClick={scrollDown}>▼</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="step-content">
              <span className="step-counter">2 de 5</span>
              <h1 className="step-question">Em poucas palavras, como você descreveria o seu negócio ou ideia?</h1>
              
              <div className="input-container">
                <textarea 
                  className="open-text-input" 
                  placeholder="Ex: Sou um arquiteto e preciso de um portfólio elegante..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (formData.descricao.trim() !== '') setStep(3);
                    }
                  }}
                  autoFocus
                />
                <button 
                  className={`btn-highlight btn-step-continuar ${formData.descricao.trim() !== '' ? 'visible' : ''}`}
                  onClick={() => setStep(3)}
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="step-content" style={{ width: '100%', maxWidth: '800px' }}>
              <span className="step-counter">3 de 5</span>
              <h1 className="step-question" style={{ whiteSpace: 'normal', fontSize: '2rem' }}>Detalhes do Projeto</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', color: 'var(--text-secondary)' }}>
                
                {/* Card 1: Estilo */}
                <TiltCard delay={0}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Estilo</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['Minimalista', 'Retrô', 'Corporativo'].map(est => {
                      const isSelected = formData.estilo === est;
                      let customStyle = { padding: '0.5rem 1rem', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-secondary)' };
                      
                      if (est === 'Minimalista') {
                        customStyle = {
                          ...customStyle,
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 300,
                          letterSpacing: '1px',
                          textTransform: 'lowercase',
                          background: 'transparent',
                          border: isSelected ? '1px solid var(--text-secondary)' : '1px solid rgba(18,24,36,0.1)',
                          borderRadius: '0'
                        };
                      } else if (est === 'Retrô') {
                        customStyle = {
                          ...customStyle,
                          fontFamily: '"Courier New", Courier, monospace',
                          fontWeight: 700,
                          background: isSelected ? '#fef08a' : '#ffffff',
                          border: '2px solid var(--text-secondary)',
                          boxShadow: isSelected ? '1px 1px 0 var(--text-secondary)' : '3px 3px 0 var(--text-secondary)',
                          transform: isSelected ? 'translate(2px, 2px)' : 'none',
                          borderRadius: '0'
                        };
                      } else if (est === 'Corporativo') {
                        customStyle = {
                          ...customStyle,
                          fontFamily: 'Arial, Helvetica, sans-serif',
                          fontWeight: 600,
                          background: isSelected ? '#e2e8f0' : '#f8fafc',
                          color: '#0f172a',
                          border: isSelected ? '2px solid #334155' : '1px solid #cbd5e1',
                          borderRadius: '4px',
                          boxShadow: isSelected ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                        };
                      }

                      return (
                        <button 
                          key={est} 
                          onClick={() => setFormData({...formData, estilo: est})} 
                          style={customStyle}
                        >
                          {est}
                        </button>
                      );
                    })}
                    <input 
                      type="text" 
                      placeholder="Outro (digite)" 
                      value={!['Minimalista', 'Retrô', 'Corporativo', ''].includes(formData.estilo) ? formData.estilo : ''}
                      onChange={(e) => setFormData({...formData, estilo: e.target.value})}
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(18, 24, 36, 0.2)', padding: '0.5rem', outline: 'none', color: 'inherit', textAlign: 'center' }}
                    />
                  </div>
                </TiltCard>

                {/* Card 2: Logo */}
                <TiltCard delay={0.1}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Já possui logotipo?</h3>
                  <label className="btn-highlight" style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'inline-block', marginTop: '0.5rem' }}>
                    {formData.logo ? 'Logotipo Anexado ✓' : 'Carregar Logo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setFormData({...formData, logo: e.target.files[0]})} 
                      style={{ display: 'none' }}
                    />
                  </label>
                </TiltCard>

                {/* Card 3: Domínio */}
                <TiltCard delay={0.2}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Já possui domínio?</h3>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <button 
                      onClick={() => setFormData({...formData, possuiDominio: true})} 
                      className={`btn-text ${formData.possuiDominio === true ? 'clicked' : ''}`}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                    >Sim</button>
                    <button 
                      onClick={() => setFormData({...formData, possuiDominio: false, dominioUrl: ''})} 
                      className={`btn-text ${formData.possuiDominio === false ? 'clicked' : ''}`}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                    >Não</button>
                  </div>
                  {formData.possuiDominio && (
                    <input 
                      type="text" 
                      placeholder="Ex: www.meusite.com.br" 
                      value={formData.dominioUrl} 
                      onChange={(e) => setFormData({...formData, dominioUrl: e.target.value})} 
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-accent)', padding: '0.5rem', outline: 'none', color: 'inherit', marginTop: '1rem', textAlign: 'center', width: '80%' }} 
                    />
                  )}
                </TiltCard>

                {/* Card 4: Tema e Cores (Agrupados) */}
                <TiltCard delay={0.3}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Identidade Visual</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tema de preferência</label>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <button 
                        onClick={() => setFormData({...formData, tema: 'Claro'})} 
                        className={`btn-text ${formData.tema === 'Claro' ? 'clicked' : ''}`}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                      >Claro</button>
                      <button 
                        onClick={() => setFormData({...formData, tema: 'Escuro'})} 
                        className={`btn-text ${formData.tema === 'Escuro' ? 'clicked' : ''}`}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                      >Escuro</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', position: 'relative' }}>
                    
                    {/* Popover Color Picker */}
                    {activeColorPicker && (
                      <div style={{
                        position: 'absolute',
                        bottom: '120%',
                        left: activeColorPicker === 'principal' ? '0' : '40%',
                        backgroundColor: '#fff',
                        padding: '1rem',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(18, 24, 36, 0.2)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div 
                          style={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)' }}
                          onClick={() => setActiveColorPicker(null)}
                        >
                          ✕
                        </div>
                        <HexColorPicker 
                          color={activeColorPicker === 'principal' ? formData.corPrincipal : formData.corSecundaria} 
                          onChange={(newColor) => {
                            if (activeColorPicker === 'principal') setFormData({...formData, corPrincipal: newColor});
                            else setFormData({...formData, corSecundaria: newColor});
                          }} 
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                          {['#000000', '#ffffff', '#d4af37', '#1e3a8a', '#10b981', '#f43f5e'].map(preset => (
                            <button 
                              key={preset}
                              onClick={() => {
                                if (activeColorPicker === 'principal') setFormData({...formData, corPrincipal: preset});
                                else setFormData({...formData, corSecundaria: preset});
                              }}
                              style={{ width: '20px', height: '20px', borderRadius: '50%', background: preset, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                      </div>
          )}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Principal</label>
                      <button 
                        onClick={() => setActiveColorPicker(activeColorPicker === 'principal' ? null : 'principal')}
                        style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', 
                          backgroundColor: formData.corPrincipal, border: '2px solid rgba(18,24,36,0.1)', cursor: 'pointer' 
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Secundária</label>
                      <button 
                        onClick={() => setActiveColorPicker(activeColorPicker === 'secundaria' ? null : 'secundaria')}
                        style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', 
                          backgroundColor: formData.corSecundaria, border: '2px solid rgba(18,24,36,0.1)', cursor: 'pointer' 
                        }}
                      />
                    </div>
                  </div>
                </TiltCard>

              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', width: '100%' }}>
                <button 
                  className="btn-highlight btn-step-continuar visible"
                  onClick={() => setStep(4)}
                  style={{ position: 'relative', transform: 'none' }}
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="step-content">
              <span className="step-counter">4 de 5</span>
              <h1 className="step-question">Como você gosta de ser chamado?</h1>
              
              <div className="input-container">
                <input 
                  type="text"
                  className="open-text-input single-line" 
                  placeholder="Seu nome ou apelido"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (formData.nome.trim() !== '') setStep(5);
                    }
                  }}
                  autoFocus
                />
                <button 
                  className={`btn-highlight btn-step-continuar ${formData.nome.trim() !== '' ? 'visible' : ''}`}
                  onClick={() => setStep(5)}
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="step-content">
              <span className="step-counter">5 de 5</span>
              <h1 className="step-question">Qual o seu melhor contato (WhatsApp)?</h1>
              
              <div className="input-container">
                <input 
                  type="tel"
                  className="open-text-input single-line" 
                  placeholder="Apenas números (Ex: 11999999999)"
                  value={formData.contato}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, contato: onlyNumbers });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (formData.contato.trim() !== '') handleSubmit();
                    }
                  }}
                  autoFocus
                />
                <button 
                  className={`btn-highlight btn-step-continuar ${formData.contato.trim() !== '' ? 'visible' : ''}`}
                  onClick={() => handleSubmit()}
                >
                  Enviar Solicitação
                </button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
              <h1 className="step-question" style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>Mensagem Encaminhada!</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
                Entrarei em contato.
              </p>
              <div style={{ marginTop: '3rem', opacity: 0.6, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid var(--text-secondary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Voltando para a página inicial...
              </div>
              <style jsx>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </motion.div>
          )}

          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
