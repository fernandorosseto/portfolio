'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

const HexColorPicker = dynamic(() => import('react-colorful').then(mod => mod.HexColorPicker), {
  ssr: false,
  loading: () => <div style={{ width: '200px', height: '200px', backgroundColor: 'rgba(18,24,36,0.05)', borderRadius: '12px' }} />
});

// Wrapper para evitar re-renders excessivos na árvore principal durante o arraste da cor
function DebouncedColorPicker({ color, onChange }) {
  const [value, setValue] = useState(color);
  
  useEffect(() => { setValue(color); }, [color]);

  useEffect(() => {
    const handler = setTimeout(() => onChange(value), 50); // Debounce de 50ms para manter a fluidez do picker sem travar a interface
    return () => clearTimeout(handler);
  }, [value]); // Removido onChange da dependência para evitar loops

  return <HexColorPicker color={value} onChange={setValue} />;
}

// optionsStep1 is defined dynamically inside Orcamento component using translations

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
  const { t } = useLanguage();
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

  const optionsStep1 = [
    { id: 'leads', label: t.opt1_leads },
    { id: 'vendas', label: t.opt1_vendas },
    { id: 'institucional', label: t.opt1_institucional },
    { id: 'sistema', label: t.opt1_sistema }
  ];

  const stylesOptions = [
    { id: 'Minimalista', label: t.styleMinimalist },
    { id: 'Retrô', label: t.styleRetro },
    { id: 'Corporativo', label: t.styleCorporate }
  ];
  
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
    if (carouselRef.current) carouselRef.current.scrollBy({ top: -60, behavior: 'smooth' });
  };

  const scrollDown = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ top: 60, behavior: 'smooth' });
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
      
      // Aguarda um pouco para leitura, depois inicia a transição de fade out
      setTimeout(() => {
        setIsClosing(true);
        
        // Aguarda o tempo da animação (800ms) para redirecionar
        setTimeout(() => {
          sessionStorage.setItem('from_success', 'true');
          router.push('/');
        }, 800);
      }, 2000);
      
    } catch (error) {
      console.error(error);
      alert(t.alertError);
    }
  };

  if (!mounted) return null;

  return (
    <main className={`orcamento-container ${isClosing ? 'closing' : ''}`}>
      <nav className="orcamento-nav">
        <Link href="/" className="back-button">{t.back}</Link>
        <LanguageToggle />
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
              <span className="step-counter">{t.stepCounter(1, 5)}</span>
              <h1 className="step-question">{t.q1}</h1>
              
              <div className="carousel-container">
                <button className="carousel-nav-btn up" onClick={scrollUp}>▲</button>
                
                <div className="carousel-viewport" ref={carouselRef} onScroll={handleScroll}>
                  <div className="options-list">
                    {optionsStep1.map((opt, index) => {
                      const itemHeight = 60;
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
              <span className="step-counter">{t.stepCounter(2, 5)}</span>
              <h1 className="step-question">{t.q2}</h1>
              
              <div className="input-container">
                <textarea 
                  className="open-text-input" 
                  placeholder={t.q2Placeholder}
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
                  {t.continueBtn}
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
              <span className="step-counter">{t.stepCounter(3, 5)}</span>
              <h1 className="step-question" style={{ whiteSpace: 'normal', fontSize: '2rem' }}>{t.q3}</h1>
              
              <div className="details-grid" style={{ width: '100%', color: 'var(--text-secondary)' }}>
                
                {/* Card 1: Estilo */}
                <TiltCard delay={0}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.styleLabel}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {stylesOptions.map(opt => {
                      const isSelected = formData.estilo === opt.id;
                      let customStyle = { padding: '0.5rem 1rem', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-secondary)' };
                      
                      if (opt.id === 'Minimalista') {
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
                      } else if (opt.id === 'Retrô') {
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
                      } else if (opt.id === 'Corporativo') {
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
                          key={opt.id} 
                          onClick={() => setFormData({...formData, estilo: opt.id})} 
                          style={customStyle}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                    <input 
                      type="text" 
                      placeholder={t.styleOther} 
                      value={!['Minimalista', 'Retrô', 'Corporativo', ''].includes(formData.estilo) ? formData.estilo : ''}
                      onChange={(e) => setFormData({...formData, estilo: e.target.value})}
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(18, 24, 36, 0.2)', padding: '0.5rem', outline: 'none', color: 'inherit', textAlign: 'center' }}
                    />
                  </div>
                </TiltCard>

                {/* Card 2: Logo */}
                <TiltCard delay={0.1}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.logoLabel}</h3>
                  <label className="btn-highlight" style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'inline-block', marginTop: '0.5rem' }}>
                    {formData.logo ? t.logoBtnAttached : t.logoBtnUpload}
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
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.domainLabel}</h3>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <button 
                      onClick={() => setFormData({...formData, possuiDominio: true})} 
                      className={`btn-text ${formData.possuiDominio === true ? 'clicked' : ''}`}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                    >{t.domainYes}</button>
                    <button 
                      onClick={() => setFormData({...formData, possuiDominio: false, dominioUrl: ''})} 
                      className={`btn-text ${formData.possuiDominio === false ? 'clicked' : ''}`}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                    >{t.domainNo}</button>
                  </div>
                  {formData.possuiDominio && (
                    <input 
                      type="text" 
                      placeholder={t.domainPlaceholder} 
                      value={formData.dominioUrl} 
                      onChange={(e) => setFormData({...formData, dominioUrl: e.target.value})} 
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-accent)', padding: '0.5rem', outline: 'none', color: 'inherit', marginTop: '1rem', textAlign: 'center', width: '80%' }} 
                    />
                  )}
                </TiltCard>

                {/* Card 4: Tema e Cores (Agrupados) */}
                <TiltCard delay={0.3}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.identityLabel}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '2rem', marginTop: '1rem' }}>
                    
                    {/* Seção 1: Tema */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.themeLabel}</label>
                      <div style={{ display: 'flex', background: 'rgba(18,24,36,0.04)', padding: '0.4rem', borderRadius: '12px', gap: '0.5rem' }}>
                        <button 
                          onClick={() => setFormData({...formData, tema: 'Claro'})} 
                          style={{ 
                            padding: '0.6rem 2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
                            background: formData.tema === 'Claro' ? '#ffffff' : 'transparent',
                            color: formData.tema === 'Claro' ? '#121824' : 'var(--text-secondary)',
                            boxShadow: formData.tema === 'Claro' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {t.themeLight}
                        </button>
                        <button 
                          onClick={() => setFormData({...formData, tema: 'Escuro'})} 
                          style={{ 
                            padding: '0.6rem 2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
                            background: formData.tema === 'Escuro' ? '#121824' : 'transparent',
                            color: formData.tema === 'Escuro' ? '#ffffff' : 'var(--text-secondary)',
                            boxShadow: formData.tema === 'Escuro' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {t.themeDark}
                        </button>
                      </div>
                    </div>

                    {/* Divisor */}
                    <div style={{ width: '100%', height: '1px', background: 'rgba(18,24,36,0.08)' }} />

                    {/* Seção 2: Cores */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.colorLabel}</label>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', opacity: 0.7 }}>{t.colorSub}</span>
                      
                      <div style={{ display: 'flex', gap: '2.5rem', marginTop: '1rem', position: 'relative' }}>
                    
                    {/* Popover Color Picker */}
                    {activeColorPicker && (
                      <div style={{
                        position: 'absolute',
                        bottom: '120%',
                        left: activeColorPicker === 'principal' ? '0' : '40%',
                        backgroundColor: '#fff',
                        padding: '2.5rem 1.2rem 1.2rem 1.2rem', // Mais espaço no topo para o botão X
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(18, 24, 36, 0.2)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.8rem' // Diminui o gap para não ficar alto demais
                      }}>
                        {/* Botão fechar com área de clique maior */}
                        <div 
                          style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)' }}
                          onClick={() => setActiveColorPicker(null)}
                        >
                          ✕
                        </div>
                        <DebouncedColorPicker 
                          color={activeColorPicker === 'principal' ? formData.corPrincipal : formData.corSecundaria} 
                          onChange={(newColor) => {
                            if (activeColorPicker === 'principal') setFormData({...formData, corPrincipal: newColor});
                            else setFormData({...formData, corSecundaria: newColor});
                          }} 
                        />
                        <div style={{ display: 'flex', gap: '0.6rem', width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                          {['#000000', '#ffffff', '#d4af37', '#1e3a8a', '#10b981', '#f43f5e'].map(preset => (
                            <button 
                              key={preset}
                              onClick={() => {
                                if (activeColorPicker === 'principal') setFormData({...formData, corPrincipal: preset});
                                else setFormData({...formData, corSecundaria: preset});
                              }}
                              style={{ width: '24px', height: '24px', borderRadius: '50%', background: preset, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botão Principal com área expandida */}
                    <div 
                      onClick={() => setActiveColorPicker(activeColorPicker === 'principal' ? null : 'principal')}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(18,24,36,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <label style={{ fontSize: '0.9rem', fontWeight: 600, pointerEvents: 'none' }}>{t.colorPrimary}</label>
                      <button 
                        style={{ 
                          width: '44px', height: '44px', borderRadius: '50%', 
                          backgroundColor: formData.corPrincipal, border: '2px solid rgba(18,24,36,0.1)', pointerEvents: 'none'
                        }}
                      />
                    </div>

                    {/* Botão Secundário com área expandida */}
                    <div 
                      onClick={() => setActiveColorPicker(activeColorPicker === 'secundaria' ? null : 'secundaria')}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(18,24,36,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <label style={{ fontSize: '0.9rem', fontWeight: 600, pointerEvents: 'none' }}>{t.colorSecondary}</label>
                      <button 
                        style={{ 
                          width: '44px', height: '44px', borderRadius: '50%', 
                          backgroundColor: formData.corSecundaria, border: '2px solid rgba(18,24,36,0.1)', pointerEvents: 'none'
                        }}
                      />
                    </div>
                  </div>
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
                  {t.continueBtn}
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
              <span className="step-counter">{t.stepCounter(4, 5)}</span>
              <h1 className="step-question">{t.q4}</h1>
              
              <div className="input-container">
                <input 
                  type="text"
                  className="open-text-input single-line" 
                  placeholder={t.q4Placeholder}
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
                  {t.continueBtn}
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
              <span className="step-counter">{t.stepCounter(5, 5)}</span>
              <h1 className="step-question">{t.q5}</h1>
              
              <div className="input-container">
                <input 
                  type="tel"
                  className="open-text-input single-line" 
                  placeholder={t.q5Placeholder}
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
                  {t.submitBtn}
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
              <h1 className="step-question" style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>{t.q6Title}</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
                {t.q6Desc}
              </p>
            </motion.div>
          )}

          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
