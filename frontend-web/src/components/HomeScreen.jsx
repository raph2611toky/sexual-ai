"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import couverture from "../assets/couverture.png"
import { useToast } from "../hooks/useToast"
import ToastContainer from "./ToastContainer"
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
  const { toasts, success, error, removeToast } = useToast()

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
      heroSubtitle:
        "Suivi des cycles menstruels, rappels par SMS et conseils personnalisés avec l'intelligence artificielle",
      getStarted: "Commencer",
      learnMore: "En savoir plus",
      login: "Se connecter",
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
      contactDescription:
        "Nous sommes à votre écoute pour améliorer votre expérience. Partagez vos suggestions, questions ou retours d'expérience avec notre équipe dédiée.",
      nameLabel: "Nom complet",
      emailLabel: "Adresse email",
      messageLabel: "Votre message",
      sendMessage: "Envoyer le message",
      footerText: "© 2025 Sexual AI. Tous droits réservés.",
      messageSuccess: "Message envoyé avec succès !",
      messageError: "Erreur lors de l'envoi du message.",
    },
    mg: {
      heroTitle: "Ny mpiara-miasa AI ho an'ny fahasalamana ara-nofo",
      heroSubtitle:
        "Fanaraha-maso ny cycle menstruel, fampahatsiahivana amin'ny SMS ary torohevitra manokana miaraka amin'ny AI",
      getStarted: "Hanomboka",
      learnMore: "Hahafantatra bebe kokoa",
      login: "Hiditra",
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
      contactDescription:
        "Mihaino anay izahay mba hanatsarana ny traikefanao. Zarao aminay ny sosokevitrao, fanontanianao na ny traikefanao miaraka amin'ny ekipanay voatokana.",
      nameLabel: "Anarana feno",
      emailLabel: "Adiresy email",
      messageLabel: "Ny hafatrao",
      sendMessage: "Alefa ny hafatra",
      footerText: "© 2025 Sexual AI. Zo rehetra voatahiry.",
      messageSuccess: "Hafatra nalefa soa aman-tsara !",
      messageError: "Nisy olana tamin'ny fandefasana ny hafatra.",
    },
  }

  const t = (key) => translations[language][key] || key

  const handleStart = () => {
    navigate("/signup")
  }

  const handleLogin = () => {
    navigate("/login")
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

    try {
      // Simulation d'envoi
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Succès
      success(t("messageSuccess"))
      setContactForm({ name: "", email: "", message: "" })
    } catch (err) {
      // Erreur
      error(t("messageError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    })
  }

  // Dupliquer les témoignages pour le carrousel infini
  const testimonials = [
    {
      text: t("testimonial1"),
      author: t("testimonial1Author"),
      avatar: "👩‍⚕️",
    },
    {
      text: t("testimonial2"),
      author: t("testimonial2Author"),
      avatar: "👩‍💼",
    },
    {
      text: t("testimonial3"),
      author: t("testimonial3Author"),
      avatar: "👩‍🎓",
    },
    {
      text: "L'interface est intuitive et les conseils sont très utiles.",
      author: "Léa, 30 ans",
      avatar: "👩‍🔬",
    },
    {
      text: "Je recommande vivement cette application à toutes mes amies.",
      author: "Nadia, 26 ans",
      avatar: "👩‍🎨",
    },
    {
      text: "Un outil indispensable pour la santé féminine moderne.",
      author: "Amélie, 35 ans",
      avatar: "👩‍💻",
    },
  ]

  // Dupliquer pour créer un effet de boucle infinie
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <div className="home-container">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

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
            <button className="home-login-btn" onClick={handleLogin}>
              {t("login")}
            </button>
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
              <img src={couverture || "/placeholder.svg"} alt="Sexual AI" className="home-image" />
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

      {/* Testimonials Section avec carrousel pleine largeur */}
      <section id="testimonials" className="home-testimonials-section">
        <div className="home-testimonials-container">
          <div className="home-testimonials-header">
            <h2 className="home-testimonials-title">{t("testimonialsTitle")}</h2>
          </div>
        </div>
        <div className="home-testimonials-carousel">
          <div className="home-testimonials-track">
            {duplicatedTestimonials.map((testimonial, index) => (
              <div key={index} className="home-testimonial-card">
                <p className="home-testimonial-text">"{testimonial.text}"</p>
                <div className="home-testimonial-author">
                  <div className="home-testimonial-avatar">{testimonial.avatar}</div>
                  <span className="home-testimonial-name">{testimonial.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section avec layout équilibré */}
      <section id="contact" className="home-contact-section">
        <div className="home-contact-container">
          <div className="home-contact-header">
            <h2 className="home-contact-title">{t("contactTitle")}</h2>
            <p className="home-contact-subtitle">{t("contactSubtitle")}</p>
          </div>

          <div className="home-contact-content">
            {/* Partie gauche - Informations et formulaire centré */}
            <div className="home-contact-main">
              <div className="home-contact-text">
                <h3 className="home-contact-info-title">Restons en contact</h3>
                <p className="home-contact-description">{t("contactDescription")}</p>

                <div className="home-contact-features">
                  <div className="home-contact-feature">
                    <div className="home-contact-feature-icon">💬</div>
                    <div>
                      <h4>Support réactif</h4>
                      <p>Réponse sous 24h maximum</p>
                    </div>
                  </div>
                  <div className="home-contact-feature">
                    <div className="home-contact-feature-icon">🔒</div>
                    <div>
                      <h4>Confidentialité garantie</h4>
                      <p>Vos données restent privées</p>
                    </div>
                  </div>
                  <div className="home-contact-feature">
                    <div className="home-contact-feature-icon">✨</div>
                    <div>
                      <h4>Amélioration continue</h4>
                      <p>Vos retours façonnent l'app</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire centré */}
              <div className="home-contact-form-wrapper">
                <form className="home-contact-form" onSubmit={handleContactSubmit}>
                  <div className="home-contact-form-group">
                    <label className="home-contact-label">{t("nameLabel")}</label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="home-contact-input"
                      placeholder="Votre nom complet"
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
                      placeholder="votre@email.com"
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
                      placeholder="Partagez vos suggestions, questions ou retours..."
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className={`home-contact-submit-btn ${isSubmitting ? "loading" : ""}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Envoi en cours..." : t("sendMessage")}
                  </button>
                </form>
              </div>
            </div>

            {/* Partie droite - Image alignée à droite */}
            <div className="home-contact-image-wrapper">
              <div className="home-contact-image">
                <img src="/fille-ecrit.png" alt="Femme avec téléphone" className="home-contact-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer avec copyright */}
      <footer className="home-footer">
        <div className="home-footer-container">
          <div className="home-footer-content">
            <div className="home-footer-logo">
              <span>Sexual AI</span>
            </div>

            {/* Réseaux sociaux dans le footer */}
            <div className="home-footer-social">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="home-footer-social-link facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="home-footer-social-link linkedin"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="home-footer-social-link github"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
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
