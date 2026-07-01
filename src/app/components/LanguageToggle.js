"use client";

import { useLanguage } from "../context/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage, mounted } = useLanguage();

  if (!mounted) {
    // Return a placeholder structure during server rendering/hydration
    // to prevent layout shifts while keeping the container dimensions consistent.
    return (
      <div className="language-selector loading">
        <span className="placeholder-btn">PT</span>
        <span className="separator">|</span>
        <span className="placeholder-btn">EN</span>
      </div>
    );
  }

  return (
    <div className="language-selector">
      <button 
        className={language === "pt" ? "active" : ""} 
        onClick={() => setLanguage("pt")}
        aria-label="Mudar para Português"
      >
        PT
      </button>
      <span className="separator">|</span>
      <button 
        className={language === "en" ? "active" : ""} 
        onClick={() => setLanguage("en")}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
