"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import couverture from "../assets/couverture.png"
import "./HomeScreen.css"

function HomeScreen() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState("fr")
  const [theme, setTheme] = useState("light")
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "fr"
    const savedTheme = localStorage.getItem("theme") || "light"
    setLanguage(savedLanguage)
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  const toggleLanguage = () => {
    const newLang = language === "fr" ? "mg" : "fr"
    setLanguage(newLang)
    localStorage.setItem("language", newLang)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  const translations = {
    fr: {
      heroTitle: "Votre partenaire IA pour la santé sexuelle",
      heroSubtitle: "Suivi des cycles menstruels, rappels par SMS et conseils personnalisés avec l'intelligence artificielle",
      getStarted: "Commencer",
      learnMore: "En savoir plus",
      featuresTitle: "Nos Fonctionnalités",
      featuresSubtitle: "Découvrez les outils pour votre santé sexuelle",
      feature1Title: "Suivi du Cycle",
      feature1Desc: "Suivez votre cycle menstruel avec précision",
      feature2Title: "Assistant IA",
      feature2Desc: "Conseils confidentiels sur la santé sexuelle",
      feature3Title: "Conseils Personnalisés",
      feature3Desc: "Recommandations adaptées à vos besoins",
      feature4Title: "Mode Vocal",
      feature4Desc: "Interagissez facilement par la voix",
      feature5Title: "Rappels par SMS",
      feature5Desc: "Recevez des rappels pour vos rendez-vous",
      feature6Title: "Données Sécurisées",
      feature6Desc: "Protection renforcée de vos données",
      testimonialsTitle: "Ce que disent nos utilisatrices",
      testimonial1: "Cette IA a transformé ma gestion de la santé sexuelle.",
      testimonial1Author: "Marie, 28 ans",
      testimonial2: "Les rappels par SMS sont tellement pratiques !",
      testimonial2Author: "Sophie, 32 ans",
      testimonial3: "Une application sécurisée et facile à utiliser.",
      testimonial3Author: "Fatima, 25 ans",
      contactTitle: "Partagez vos retours",
      contactSubtitle: "Votre avis nous aide à nous améliorer",
      nameLabel: "Nom complet",
      emailLabel: "Adresse email",
      messageLabel: "Votre message",
      sendMessage: "Envoyer le message",
      footerText: "© 2025 Sexual AI. Tous droits réservés.",
    },
    mg: {
      heroTitle: "Ny mpiara-miasa AI ho an'ny fahasalamana ara-nofo",
      heroSubtitle: "Fanaraha-maso ny cycle menstruel, fampahatsiahivana amin'ny SMS ary torohevitra manokana miaraka amin'ny AI",
      getStarted: "Hanomboka",
      learnMore: "Hahafantatra bebe kokoa",
      featuresTitle: "Ny Endri-javatra",
      featuresSubtitle: "Fantaro ny fitaovana ho an'ny fahasalamanao ara-nofo",
      feature1Title: "Fanaraha-maso ny Cycle",
      feature1Desc: "Araho ny cycle menstruel-nao amin'ny mazava tsara",
      feature2Title: "Mpanampy IA",
      feature2Desc: "Torohevitra tsiambaratelo momba ny fahasalamana ara-nofo",
      feature3Title: "Torohevitra Manokana",
      feature3Desc: "Torohevitra mifanaraka amin'ny filanao",
      feature4Title: "Fomba Feo",
      feature4Desc: "Mifandray mora amin'ny feo",
      feature5Title: "Fampahatsiahivana SMS",
      feature5Desc: "Mahazo fampahatsiahivana ho an'ny fotoana",
      feature6Title: "Angona Voaaro",
      feature6Desc: "Fiarovana nohamafisina ho an'ny angonao",
      testimonialsTitle: "Izay lazain'ny mpampiasa",
      testimonial1: "Nanova ny fomba fitantanako ny fahasalamako ara-nofo ity AI ity.",
      testimonial1Author: "Marie, 28 taona",
      testimonial2: "Tena mahasoa ny fampahatsiahivana amin'ny SMS!",
      testimonial2Author: "Sophie, 32 taona",
      testimonial3: "Fampiharana azo antoka sy mora ampiasaina.",
      testimonial3Author: "Fatima, 25 taona",
      contactTitle: "Zarao ny hevitrao",
      contactSubtitle: "Ny hevitrao dia manampy anay hanatsara",
      nameLabel: "Anarana feno",
      emailLabel: "Adiresy email",
      messageLabel: "Ny hafatrao",
      sendMessage: "Alefa ny hafatra",
      footerText: "© 2025 Sexual AI. Zo rehetra voatahiry.",
    },
  }

  const t = (key) => translations[language][key] || key

  const handleStart = () => {
    navigate("/signup")
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    alert(language === "fr" ? "Message envoyé avec succès!" : "Hafatra nalefa soa aman-tsara!")
    setContactForm({ name: "", email: "", message: "" })
    setIsSubmitting(false)
  }

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-container">
          <div className="home-header-logo">
            <span className="home-header-logo-text">Sexual AI</span>
          </div>
          <nav className="home-header-nav">
            <button className="home-header-nav-link" onClick={() => scrollToSection("hero")}>
              Accueil
            </button>
            <button className="home-header-nav-link" onClick={() => scrollToSection("features")}>
              Fonctionnalités
            </button>
            <button className="home-header-nav-link" onClick={() => scrollToSection("testimonials")}>
              Témoignages
            </button>
            <button className="home-header-nav-link" onClick={() => scrollToSection("contact")}>
              Contact
            </button>
          </nav>
          <div className="home-header-controls">
            <button className="home-control-btn" onClick={toggleLanguage}>
              {language.toUpperCase()}
            </button>
            <button className="home-control-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="home-hero-section">
        <div className="home-hero-container">
          <div className="home-hero-content">
            <div className="home-hero-text">
              <h1 className="home-hero-title">{t("heroTitle")}</h1>
              <p className="home-hero-subtitle">{t("heroSubtitle")}</p>
              <div className="home-hero-buttons">
                <button className="home-button-start" onClick={handleStart}>
                  <span className="home-start-text">{t("getStarted")}</span>
                </button>
                <button className="home-button-secondary" onClick={() => scrollToSection("features")}>
                  {t("learnMore")}
                </button>
              </div>
            </div>
            <div className="home-hero-image">
              <img src={couverture} alt="Sexual AI" className="home-image" />
              <div className="home-hero-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="home-features-section">
        <div className="home-features-container">
          <div className="home-features-header">
            <h2 className="home-features-title">{t("featuresTitle")}</h2>
            <p className="home-features-subtitle">{t("featuresSubtitle")}</p>
          </div>
          <div className="home-features-scroll">
            <div className="home-features-grid">
              <div className="home-feature-card">
                <div className="home-feature-icon">📅</div>
                <h3 className="home-feature-title">{t("feature1Title")}</h3>
                <p className="home-feature-description">{t("feature1Desc")}</p>
              </div>
              <div className="home-feature-card">
                <div className="home-feature-icon">🤖</div>
                <h3 className="home-feature-title">{t("feature2Title")}</h3>
                <p className="home-feature-description">{t("feature2Desc")}</p>
              </div>
              <div className="home-feature-card">
                <div className="home-feature-icon">💡</div>
                <h3 className="home-feature-title">{t("feature3Title")}</h3>
                <p className="home-feature-description">{t("feature3Desc")}</p>
              </div>
              <div className="home-feature-card">
                <div className="home-feature-icon">🎤</div>
                <h3 className="home-feature-title">{t("feature4Title")}</h3>
                <p className="home-feature-description">{t("feature4Desc")}</p>
              </div>
              <div className="home-feature-card">
                <div className="home-feature-icon">📱</div>
                <h3 className="home-feature-title">{t("feature5Title")}</h3>
                <p className="home-feature-description">{t("feature5Desc")}</p>
              </div>
              <div className="home-feature-card">
                <div className="home-feature-icon">🔒</div>
                <h3 className="home-feature-title">{t("feature6Title")}</h3>
                <p className="home-feature-description">{t("feature6Desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="home-testimonials-section">
        <div className="home-testimonials-container">
          <div className="home-testimonials-header">
            <h2 className="home-testimonials-title">{t("testimonialsTitle")}</h2>
          </div>
          <div className="home-testimonials-grid">
            <div className="home-testimonial-card">
              <p className="home-testimonial-text">"{t("testimonial1")}"</p>
              <div className="home-testimonial-author">
                <div className="home-testimonial-avatar">👩‍⚕️</div>
                <span className="home-testimonial-name">{t("testimonial1Author")}</span>
              </div>
            </div>
            <div className="home-testimonial-card">
              <p className="home-testimonial-text">"{t("testimonial2")}"</p>
              <div className="home-testimonial-author">
                <div className="home-testimonial-avatar">👩‍💼</div>
                <span className="home-testimonial-name">{t("testimonial2Author")}</span>
              </div>
            </div>
            <div className="home-testimonial-card">
              <p className="home-testimonial-text">"{t("testimonial3")}"</p>
              <div className="home-testimonial-author">
                <div className="home-testimonial-avatar">👩‍🎓</div>
                <span className="home-testimonial-name">{t("testimonial3Author")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="home-contact-section">
        <div className="home-contact-container">
          <div className="home-contact-header">
            <h2 className="home-contact-title">{t("contactTitle")}</h2>
            <p className="home-contact-subtitle">{t("contactSubtitle")}</p>
          </div>
          <form className="home-contact-form" onSubmit={handleContactSubmit}>
            <div className="home-contact-form-group">
              <label className="home-contact-label">{t("nameLabel")}</label>
              <input
                type="text"
                name="name"
                value={contactForm.name}
                onChange={handleInputChange}
                className="home-contact-input"
                required
              />
            </div>
            <div className="home-contact-form-group">
              <label className="home-contact-label">{t("emailLabel")}</label>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={handleInputChange}
                className="home-contact-input"
                required
              />
            </div>
            <div className="home-contact-form-group">
              <label className="home-contact-label">{t("messageLabel")}</label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleInputChange}
                className="home-contact-textarea"
                rows="5"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className={`home-contact-submit-btn ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "..." : t("sendMessage")}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-container">
          <div className="home-footer-content">
            <div className="home-footer-logo">
              <span>Sexual AI</span>
            </div>
          </div>
          <div className="home-footer-bottom">
            <p className="home-footer-text">{t("footerText")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomeScreen