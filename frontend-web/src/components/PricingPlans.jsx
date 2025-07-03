"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PaymentModal from "./PaymentModal"
import "./PricingPlans.css"

const PricingPlans = () => {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [language, setLanguage] = useState("FR")
  const [theme, setTheme] = useState("light")
  const [billingCycle, setBillingCycle] = useState("monthly")

  useEffect(() => {
    // Récupérer les préférences depuis localStorage
    const savedLanguage = localStorage.getItem("language") || "fr"
    const savedTheme = localStorage.getItem("theme") || "light"
    setLanguage(savedLanguage.toUpperCase())
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  const translations = {
    FR: {
      title: "Choisissez votre plan",
      subtitle: "Débloquez tout le potentiel de Sexual AI avec nos plans premium",
      monthly: "Mensuel",
      yearly: "Annuel",
      save: "Économisez 20%",
      currentPlan: "Plan actuel",
      upgrade: "Mettre à niveau",
      choose: "Choisir ce plan",
      popular: "Le plus populaire",
      features: "Fonctionnalités incluses",
      unlimited: "Illimité",
      limited: "Limité",
      support: "Support",
      priority: "Prioritaire",
      standard: "Standard",
      basic: "Basique",
      backToApp: "Retour à l'application",
      plans: {
        free: {
          name: "Gratuit",
          price: "0",
          description: "Parfait pour commencer",
          features: [
            "10 questions par jour",
            "Réponses de base",
            "Support communautaire",
            "Accès aux guides de base",
            "Mode texte uniquement",
          ],
        },
        premium: {
          name: "Premium",
          price: "9.99",
          description: "Pour une utilisation régulière",
          features: [
            "Questions illimitées",
            "Réponses détaillées et personnalisées",
            "Support vocal et texte",
            "Accès à tous les guides",
            "Support prioritaire",
            "Historique des conversations",
            "Mode privé avancé",
          ],
        },
        pro: {
          name: "Pro",
          price: "19.99",
          description: "Pour les professionnels de santé",
          features: [
            "Tout du plan Premium",
            "Consultations vidéo IA",
            "Rapports détaillés",
            "API access",
            "Support 24/7",
            "Formation personnalisée",
            "Intégration avec systèmes médicaux",
            "Certificats professionnels",
          ],
        },
      },
    },
    MG: {
      title: "Safidio ny drafitrao",
      subtitle: "Hamaky ny herin'ny Sexual AI amin'ny drafitra premium",
      monthly: "Isam-bolana",
      yearly: "Isan-taona",
      save: "Mitahiry 20%",
      currentPlan: "Drafitra ankehitriny",
      upgrade: "Hanampy",
      choose: "Safidio ity drafitra ity",
      popular: "Malaza indrindra",
      features: "Zavatra tafiditra",
      unlimited: "Tsy voafetra",
      limited: "Voafetra",
      support: "Fanampiana",
      priority: "Laharam-pahamehana",
      standard: "Mahazatra",
      basic: "Fototra",
      backToApp: "Hiverina amin'ny fampiharana",
      plans: {
        free: {
          name: "Maimaim-poana",
          price: "0",
          description: "Tsara ho fanombohana",
          features: [
            "Fanontaniana 10 isan'andro",
            "Valiny fototra",
            "Fanampian'ny vondrom-bahoaka",
            "Fidirana amin'ny torolalana fototra",
            "Soratra ihany",
          ],
        },
        premium: {
          name: "Premium",
          price: "9.99",
          description: "Ho an'ny fampiasana tsy tapaka",
          features: [
            "Fanontaniana tsy voafetra",
            "Valiny amin'ny antsipiriany",
            "Feo sy soratra",
            "Fidirana amin'ny torolalana rehetra",
            "Fanampiana voalohany",
            "Tantaran'ny resaka",
            "Fomba manokana",
          ],
        },
        pro: {
          name: "Pro",
          price: "19.99",
          description: "Ho an'ny mpiasa ara-pahasalamana",
          features: [
            "Ny rehetra ao amin'ny Premium",
            "Fihaonambe horonan-tsary IA",
            "Tatitra amin'ny antsipiriany",
            "Fidirana API",
            "Fanampiana 24/7",
            "Fiofanana manokana",
            "Fampifangaroana amin'ny rafitra ara-pitsaboana",
            "Taratasy fanamarinana",
          ],
        },
      },
    },
  }

  const t = translations[language]

  const toggleLanguage = () => {
    const newLang = language === "FR" ? "MG" : "FR"
    setLanguage(newLang)
    localStorage.setItem("language", newLang.toLowerCase())
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  const handleSelectPlan = (planType) => {
    if (planType !== "free") {
      setSelectedPlan(planType)
      setShowPayment(true)
    }
  }

  const handleClosePayment = () => {
    setShowPayment(false)
    setSelectedPlan(null)
  }

  const handleBackToApp = () => {
    navigate("/discussion")
  }

  const calculatePrice = (basePrice) => {
    return billingCycle === "yearly" ? (Number.parseFloat(basePrice) * 12 * 0.8).toFixed(2) : basePrice
  }

  return (
    <div className="pricing-page-container" data-theme={theme}>
      {/* Header de la page */}
      <header className="pricing-page-header">
        <div className="pricing-page-header-content">
          <div className="pricing-page-logo">
            <span className="pricing-page-logo-text">Sexual AI</span>
          </div>
          <div className="pricing-page-controls">
            <button className="pricing-page-control-btn" onClick={handleBackToApp}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t.backToApp}
            </button>
            <button className="pricing-page-control-btn" onClick={toggleLanguage}>
              {language}
            </button>
            <button className="pricing-page-control-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="pricing-page-main">
        <div className="pricing-page-hero">
          <div className="pricing-page-hero-content">
            <h1 className="pricing-page-title">{t.title}</h1>
            <p className="pricing-page-subtitle">{t.subtitle}</p>

            {/* Toggle Mensuel/Annuel corrigé */}
            <div className="pricing-page-toggle">
              <span className="pricing-page-toggle-label">{t.monthly}</span>
              <div className="pricing-page-toggle-switch">
                <input
                  type="checkbox"
                  id="pricing-page-yearly"
                  checked={billingCycle === "yearly"}
                  onChange={(e) => setBillingCycle(e.target.checked ? "yearly" : "monthly")}
                />
                <label htmlFor="pricing-page-yearly" className="pricing-page-switch-label">
                  <span className="pricing-page-switch-slider"></span>
                </label>
              </div>
              <span className="pricing-page-toggle-label">
                {t.yearly}
                <span className="pricing-page-save-badge">{t.save}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Grille des plans */}
        <div className="pricing-page-plans-section">
          <div className="pricing-page-plans-container">
            <div className="pricing-page-plans-grid">
              {Object.entries(t.plans).map(([planKey, plan], index) => (
                <div key={planKey} className={`pricing-page-plan-card ${planKey} ${planKey === "premium" ? "popular" : ""}`}>
                  {planKey === "premium" && (
                    <div className="pricing-page-popular-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"></polygon>
                      </svg>
                      {t.popular}
                    </div>
                  )}

                  <div className="pricing-page-plan-header">
                    <div className="pricing-page-plan-icon">
                      {planKey === "free" && "🆓"}
                      {planKey === "premium" && "⭐"}
                      {planKey === "pro" && "👑"}
                    </div>
                    <h3 className="pricing-page-plan-name">{plan.name}</h3>
                    <p className="pricing-page-plan-description">{plan.description}</p>
                  </div>

                  <div className="pricing-page-plan-price">
                    <div className="pricing-page-price-main">
                      <span className="pricing-page-currency">$</span>
                      <span className="pricing-page-amount">{calculatePrice(plan.price)}</span>
                      <span className="pricing-page-period">
                        /{billingCycle === "monthly" ? t.monthly.toLowerCase() : language === "FR" ? "an" : "taona"}
                      </span>
                    </div>
                    {planKey !== "free" && billingCycle === "yearly" && (
                      <div className="pricing-page-price-yearly">
                        <span className="pricing-page-yearly-price">
                          Au lieu de ${(Number.parseFloat(plan.price) * 12).toFixed(2)}/an
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pricing-page-plan-features">
                    <h4 className="pricing-page-features-title">{t.features}</h4>
                    <ul className="pricing-page-features-list">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="pricing-page-feature-item">
                          <svg
                            className="pricing-page-feature-check"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pricing-page-plan-action">
                    <button
                      className={`pricing-page-plan-btn ${planKey}`}
                      onClick={() => handleSelectPlan(planKey)}
                      disabled={planKey === "free"}
                    >
                      {planKey === "free" ? t.currentPlan : t.choose}
                    </button>
                  </div>

                  <div className="pricing-page-plan-guarantee">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>{language === "FR" ? "Garantie 30 jours" : "Antoka 30 andro"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer de sécurité */}
        <div className="pricing-page-footer">
          <div className="pricing-page-security">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <circle cx="12" cy="16" r="1"></circle>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>{language === "FR" ? "Paiement 100% sécurisé" : "Fandoavam-bola azo antoka 100%"}</span>
          </div>

          <div className="pricing-page-support">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{language === "FR" ? "Support client 24/7" : "Fanampiana mpanjifa 24/7"}</span>
          </div>
        </div>
      </main>

      {/* Modal de paiement */}
      {showPayment && (
        <PaymentModal
          plan={selectedPlan}
          language={language}
          theme={theme}
          onClose={handleClosePayment}
          planDetails={t.plans[selectedPlan]}
        />
      )}
    </div>
  )
}

export default PricingPlans
