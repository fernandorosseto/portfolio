"use client";

import { useState, useEffect } from "react";

export default function SplashLoader({ onComplete, setLanguage }) {
  const [progress, setProgress] = useState(0);
  const [showSelector, setShowSelector] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [hasLanguage, setHasLanguage] = useState(false);

  useEffect(() => {
    // Check if language preference is already stored
    const savedLang = localStorage.getItem("lang");
    const langExists = savedLang && (savedLang === "pt" || savedLang === "en");
    setHasLanguage(langExists);

    // Progress animation
    let currentProgress = 0;
    const duration = langExists ? 1000 : 700; // Return users get 1s progress, new users get 0.7s before prompt
    const intervalTime = 20;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(timer);
        
        // Handle next step
        setTimeout(() => {
          if (langExists) {
            // Return user: start exit transition immediately
            triggerExit();
          } else {
            // New user: show the language select buttons
            setShowSelector(true);
          }
        }, 200);
      } else {
        setProgress(Math.floor(currentProgress));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const triggerExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 700); // exit transition duration matches CSS transition
  };

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    triggerExit();
  };

  return (
    <div className={`splash-container ${isExiting ? "exiting" : ""}`}>
      <div className="splash-glow" />
      
      <div className="splash-content">
        <h1 className="splash-title">Fernando Rosseto</h1>
        
        {!showSelector ? (
          <div className="splash-loader-wrapper">
            <div className="splash-progress-track">
              <div 
                className="splash-progress-bar" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="splash-progress-text">
              {progress}%
            </span>
          </div>
        ) : (
          <div className="splash-selector-wrapper">
            <p className="splash-selector-prompt">
              Selecione o idioma / Select language
            </p>
            <div className="splash-button-group">
              <button 
                className="splash-btn"
                onClick={() => handleSelectLanguage("pt")}
              >
                Português
              </button>
              <button 
                className="splash-btn"
                onClick={() => handleSelectLanguage("en")}
              >
                English
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
