"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

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
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ 
          display: "inline-block", 
          width: "4px", 
          backgroundColor: "#121824",
          marginLeft: "4px",
          verticalAlign: "baseline",
          height: "0.9em"
        }}
      />
    </>
  );
}



function WebGLPiece({ position, delay, size, isMobile, isSucking }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const shadowRef = useRef();
  
  const [hovered, setHovered] = useState(false);
  const targetRotation = useRef({ x: 0, y: 0 });
  const scale = useRef(0.96);
  const opacity = useRef(0);
  const [mounted, setMounted] = useState(false);
  const suckStartTime = useRef(null);
  
  // Características do vidro: cai reto para o chão com rotação no próprio eixo e leve pulo em Z
  const chaos = useRef({
    rx: (Math.random() - 0.5) * 8, // Rotacionar um pouco no próprio eixo
    ry: (Math.random() - 0.5) * 8,
    rz: (Math.random() - 0.5) * 5, 
    vz: (Math.random() - 0.5) * 6, // Leve movimentação em Z
    gravity: 30 + Math.random() * 20 // Gravidade forte para cair para o chão
  });
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useFrame((state, delta) => {
    if (!meshRef.current || !shadowRef.current) return;

    if (mounted) {
      opacity.current = THREE.MathUtils.lerp(opacity.current, 1, delta * 5);
      if (!isSucking) scale.current = THREE.MathUtils.lerp(scale.current, 1, delta * 5);
    }
    
    if (isSucking && suckStartTime.current === null) {
      suckStartTime.current = state.clock.elapsedTime;
    }

    // Posições locais do mesh relativas ao Group (começam sempre no 0,0,0)
    let targetX = 0;
    let targetY = 0;
    let targetZ = hovered ? size * 0.15 : 0; 
    let targetScale = hovered ? 1.05 : scale.current;
    let targetRotZ = 0;

    if (!hovered && mounted && !isSucking) {
      const wave = Math.sin(position[0] * 1.5 + position[1] * 1.5 + state.clock.elapsedTime * 1.2);
      
      if (wave > 0.8) {
        const intensity = (wave - 0.8) * 5; 
        targetZ = size * 0.08 * intensity;
        targetScale = 1 + (0.03 * intensity);
        
        targetRotation.current.x = Math.sin(state.clock.elapsedTime) * 0.1 * intensity;
        targetRotation.current.y = Math.cos(state.clock.elapsedTime) * 0.1 * intensity;
      } else {
        targetRotation.current.x = THREE.MathUtils.lerp(targetRotation.current.x, 0, delta * 5);
        targetRotation.current.y = THREE.MathUtils.lerp(targetRotation.current.y, 0, delta * 5);
      }
    }

    if (isSucking && suckStartTime.current !== null) {
      const timeSinceSuck = state.clock.elapsedTime - suckStartTime.current;
      
      const dist = Math.sqrt(position[0] * position[0] + position[1] * position[1]);
      // Rachadura super rápida (vidro quebra de uma vez)
      const shatterDelay = dist * 0.02; 

      if (timeSinceSuck > shatterDelay) {
        const fallTime = timeSinceSuck - shatterDelay;
        
        // Queda Livre: o mesh cai retinho no eixo Y global (porque o groupRef não gira mais)
        targetY = 0 - (0.5 * chaos.current.gravity * fallTime * fallTime);
        targetZ = 0 + (chaos.current.vz * fallTime); // Movimentação leve em Z
        
        targetRotation.current.x = chaos.current.rx * fallTime;
        targetRotation.current.y = chaos.current.ry * fallTime;
        targetRotZ = chaos.current.rz * fallTime;
      }
    }
    
    // Queda exige resposta imediata visual, então aumentamos muito a velocidade do Lerp durante a destruição
    const speed = isSucking ? 25 : 15; 

    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * speed);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * speed);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * speed);
    
    shadowRef.current.position.x = meshRef.current.position.x + targetZ * 0.3;
    shadowRef.current.position.y = meshRef.current.position.y - targetZ * 0.3;
    shadowRef.current.position.z = meshRef.current.position.z * 0.4;
    
    const currentScale = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * speed);
    meshRef.current.scale.setScalar(currentScale);
    shadowRef.current.scale.setScalar(currentScale);
    
    // Rotacionamos o próprio mesh no eixo dele (assim a queda em Y continua apontando para baixo!)
    const rotX = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation.current.y * 0.6, delta * speed);
    const rotY = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation.current.x * 0.6, delta * speed);
    const rotZ = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotZ, delta * speed);
    
    meshRef.current.rotation.x = rotX;
    meshRef.current.rotation.y = rotY;
    meshRef.current.rotation.z = rotZ;
    
    shadowRef.current.rotation.x = rotX;
    shadowRef.current.rotation.y = rotY;
    shadowRef.current.rotation.z = rotZ;
    
    meshRef.current.material.opacity = opacity.current;
    shadowRef.current.material.opacity = (targetZ / (size * 0.15)) * 0.15 * opacity.current;
  });

  return (
    <group 
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation(); 
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
        targetRotation.current = { x: 0, y: 0 };
      }}
      onPointerMove={(e) => {
        targetRotation.current.x = (e.uv.x - 0.5); 
        targetRotation.current.y = -(e.uv.y - 0.5); 
      }}
    >
      <mesh ref={shadowRef}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color="#000000" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} />
      </mesh>
    </group>
  );
}

function WebGLGrid({ isSucking }) {
  const { viewport, size } = useThree();
  
  const isMobile = size.width < 1024;
  const cols = isMobile ? (size.width < 600 ? 4 : 6) : 10;
  
  const pieceSize = viewport.width / cols;
  const rows = Math.ceil(viewport.height / pieceSize);
  
  const pieces = [];
  const startX = -viewport.width / 2 + pieceSize / 2;
  const startY = viewport.height / 2 - pieceSize / 2;

  for (let i = 0; i < cols * rows; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const delay = (col + row) * 35; 
    
    pieces.push(
      <WebGLPiece 
        key={i} 
        position={[startX + col * pieceSize, startY - row * pieceSize, 0]} 
        size={pieceSize * 1.01} 
        delay={delay} 
        isMobile={isMobile}
        isSucking={isSucking}
      />
    );
  }

  return <>{pieces}</>;
}



function FlickerSubtitle({ text }) {
  const [flicker, setFlicker] = useState(true);

  useEffect(() => {
    // A cada 12 segundos, removemos a classe e colocamos de novo para forçar a animação a rodar novamente
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



import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [clickedBtn, setClickedBtn] = useState(null);
  const [isSucking, setIsSucking] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const fromSuccess = sessionStorage.getItem('from_success') === 'true';
    if (fromSuccess) {
      sessionStorage.removeItem('from_success');
      setTimeout(() => {
        setContentVisible(true);
      }, 1500); // Aguarda 1.5s para as folhas aparecerem antes de mostrar o texto
    } else {
      setContentVisible(true);
    }
  }, []);

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
      
      {/* Grid de Pedaços de Papel Renderizados em GPU via WebGL */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 5 }}>
        <Canvas flat camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 2]}>
          <color attach="background" args={["#6c7a8f"]} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[5, 10, 8]} intensity={1.5} />
          <WebGLGrid isSucking={isSucking} />
        </Canvas>
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
