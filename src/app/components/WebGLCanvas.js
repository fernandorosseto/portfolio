"use client";

import { useEffect, useState, useRef } from "react";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

export default function WebGLCanvas({ isSucking }) {
  return (
    <Canvas flat camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 2]}>
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 10, 8]} intensity={1.5} />
      <WebGLGrid isSucking={isSucking} />
    </Canvas>
  );
}
