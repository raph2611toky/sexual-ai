"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./NotFound.css"

const NotFound = () => {
  const navigate = useNavigate()
  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("fr")

  useEffect(() => {
    // Récupérer le thème et la langue depuis localStorage ou les valeurs par défaut
    const savedTheme = localStorage.getItem("theme") || "light"
    const savedLanguage = localStorage.getItem("language") || "fr"
    setTheme(savedTheme)
    setLanguage(savedLanguage)
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  const translations = {
    fr: {
      title: "Page non trouvée",
      subtitle: "Oups ! La page que vous cherchez n'existe pas.",
      description: "Il se peut que la page ait été déplacée, supprimée ou que l'URL soit incorrecte.",
      backHome: "Retourner à l'accueil",
      errorCode: "Erreur 404",
      suggestions: "Suggestions :",
      suggestion1: "Vérifiez l'URL dans la barre d'adresse",
      suggestion2: "Utilisez le menu de navigation",
      suggestion3: "Contactez-nous si le problème persiste",
    },
    mg: {
      title: "Pejy tsy hita",
      subtitle: "Indrisy! Ny pejy tadiavinao dia tsy misy.",
      description: "Mety nafindra, nesorina, na diso ny URL ny pejy.",
      backHome: "Hiverina any amin'ny fandraisana",
      errorCode: "Hadisoana 404",
      suggestions: "Soso-kevitra:",
      suggestion1: "Hamarino ny URL ao amin'ny bara adiresy",
      suggestion2: "Ampiasao ny menu navigation",
      suggestion3: "Mifandraisa aminay raha mbola misy olana",
    },
  }

  const t = (key) => translations[language][key] || key

  const handleGoHome = () => {
    navigate("/")
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  const toggleLanguage = () => {
    const newLang = language === "fr" ? "mg" : "fr"
    setLanguage(newLang)
    localStorage.setItem("language", newLang)
  }

  return (
    <div className="notfound-container" data-theme={theme}>
      {/* Header avec contrôles */}
      <div className="notfound-header">
        <div className="notfound-header-content">
          <div className="notfound-logo">
            <span className="notfound-logo-text">Sexual AI</span>
          </div>
          <div className="notfound-controls">
            <button className="notfound-control-btn" onClick={toggleLanguage}>
              {language.toUpperCase()}
            </button>
            <button className="notfound-control-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="notfound-content">
        <div className="notfound-main">
          {/* Animation 404 */}
          <div className="notfound-error-animation">
            <div className="notfound-error-code">
              <span className="notfound-digit">4</span>
              <div className="notfound-zero">
                <div className="notfound-zero-inner">
                  <div className="notfound-face">
                    <div className="notfound-eyes">
                      <div className="notfound-eye"></div>
                      <div className="notfound-eye"></div>
                    </div>
                    <div className="notfound-mouth"></div>
                  </div>
                </div>
              </div>
              <span className="notfound-digit">4</span>
            </div>
            <div className="notfound-error-label">{t("errorCode")}</div>
          </div>

          {/* Texte d'erreur */}
          <div className="notfound-text">
            <h1 className="notfound-title">{t("title")}</h1>
            <p className="notfound-subtitle">{t("subtitle")}</p>
            <p className="notfound-description">{t("description")}</p>
          </div>

          {/* Suggestions */}
          <div className="notfound-suggestions">
            <h3 className="notfound-suggestions-title">{t("suggestions")}</h3>
            <ul className="notfound-suggestions-list">
              <li className="notfound-suggestion-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                {t("suggestion1")}
              </li>
              <li className="notfound-suggestion-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                {t("suggestion2")}
              </li>
              <li className="notfound-suggestion-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                {t("suggestion3")}
              </li>
            </ul>
          </div>

          {/* Bouton retour */}
          <div className="notfound-actions">
            <button className="notfound-home-btn" onClick={handleGoHome}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
              </svg>
              {t("backHome")}
            </button>
          </div>
        </div>

        {/* Illustration décorative */}
        <div className="notfound-illustration">
          <div className="notfound-floating-elements">
            <div className="notfound-element notfound-element-1">💫</div>
            <div className="notfound-element notfound-element-2">⭐</div>
            <div className="notfound-element notfound-element-3">✨</div>
            <div className="notfound-element notfound-element-4">🌟</div>
            <div className="notfound-element notfound-element-5">💎</div>
          </div>
        </div>
      </div>

      {/* Footer simple */}
      <div className="notfound-footer">
        <p className="notfound-footer-text">
          © 2025 Sexual AI. {language === "fr" ? "Tous droits réservés" : "Zo rehetra voatahiry"}.
        </p>
      </div>
    </div>
  )
}

export default NotFound
