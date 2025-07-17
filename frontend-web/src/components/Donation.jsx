"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PaymentModal from "./PaymentModal"
import "./Donation.css"

const Donation = () => {
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState("")
  const navigate = useNavigate()
  const [showPayment, setShowPayment] = useState(false)
  const [language, setLanguage] = useState("FR")
  const [theme, setTheme] = useState("light")
  const [donationType, setDonationType] = useState("monthly")
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    message: ""
  })

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "fr"
    const savedTheme = localStorage.getItem("theme") || "light"
    setLanguage(savedLanguage.toUpperCase())
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  const translations = {
    FR: {
      title: "Soutenez notre mission",
      subtitle: "Votre générosité nous aide à continuer d'améliorer Sexual AI pour tous",
      monthly: "Don mensuel",
      oneTime: "Don unique",
      suggestedAmounts: "Montants suggérés",
      customAmount: "Montant personnalisé",
      enterAmount: "Entrez votre montant",
      yourName: "Votre nom (optionnel)",
      yourMessage: "Votre message (optionnel)",
      messagePlaceholder: "Laissez un message d'encouragement...",
      donate: "Faire un don",
      donateAmount: "Faire un don de",
      impact: "Votre impact",
      thankYou: "Merci pour votre soutien !",
      backToApp: "Retour à l'application",
      securePayment: "Paiement 100% sécurisé",
      taxDeductible: "Don déductible des impôts",
      amounts: {
        5: { label: "5 000 Ariary", impact: "Aide à maintenir nos serveurs" },
        10: { label: "10 000 Ariary", impact: "Améliore nos algorithmes IA" },
        25: { label: "25 000 Ariary", impact: "Développe de nouvelles fonctionnalités" },
        50: { label: "50 000 Ariary", impact: "Soutient notre équipe de recherche" },
        100: { label: "100 000 Ariary", impact: "Finance un mois de développement" },
        250: { label: "250 000 Ariary", impact: "Permet d'ajouter de nouvelles langues" }
      }
    },
    MG: {
      title: "Tohano ny asa ataonay",
      subtitle: "Ny fanomezanareo dia manampy anay hanohy hanatsara ny Sexual AI ho an'ny rehetra",
      monthly: "Fanomezana isam-bolana",
      oneTime: "Fanomezana indray mandeha",
      suggestedAmounts: "Vola atolotra",
      customAmount: "Vola tianao",
      enterAmount: "Ampidiro ny vola tianao",
      yourName: "Ny anaranareo (tsy tsy maintsy)",
      yourMessage: "Ny hafatranareo (tsy tsy maintsy)",
      messagePlaceholder: "Avelao hafatra famprisehana...",
      donate: "Manome",
      donateAmount: "Manome",
      impact: "Ny fiantraikanareo",
      thankYou: "Misaotra tompoko!",
      backToApp: "Hiverina amin'ny fampiharana",
      securePayment: "Fandoavam-bola azo antoka 100%",
      taxDeductible: "Fanomezana azo esorina amin'ny hetra",
      amounts: {
        5: { label: "5 000 Ariary", impact: "Manampy mitazona ny server-nay" },
        10: { label: "10 000 Ariary", impact: "Manatsara ny algorithm IA" },
        25: { label: "25 000 Ariary", impact: "Mamorona zavatra vaovao" },
        50: { label: "50 000 Ariary", impact: "Manohana ny ekipa fikarohana" },
        100: { label: "100 000 Ariary", impact: "Mamatsika volana iray fivoarana" },
        250: { label: "250 000 Ariary", impact: "Ahafahana manampy fiteny vaovao" }
      }
    }
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

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  const getFinalAmount = () => {
    return selectedAmount || parseFloat(customAmount) || 0
  }

  const handleDonate = () => {
    const amount = getFinalAmount()
    if (amount > 0) {
      setShowPayment(true)
    }
  }

  const handleClosePayment = () => {
    setShowPayment(false)
  }

  const handleBackToApp = () => {
    navigate("/home")
  }

  return (
    <div className="donation-container" data-theme={theme}>
      {/* Header */}
      <header className="donation-header">
        <div className="donation-header-content">
          <div className="donation-logo">
            <span className="donation-logo-text">Sexual AI</span>
          </div>
          <div className="donation-controls">
            <button className="donation-control-btn" onClick={handleBackToApp}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t.backToApp}
            </button>
            <button className="donation-control-btn" onClick={toggleLanguage}>
              {language}
            </button>
            <button className="donation-control-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="donation-main">
        {/* Hero Section */}
        <div className="donation-hero">
          <div className="donation-hero-content">
            <h1 className="donation-title">{t.title}</h1>
            <p className="donation-subtitle">{t.subtitle}</p>

            {/* Donation Type Toggle */}
            <div className="donation-type-toggle">
              <button 
                className={`donation-type-btn ${donationType === 'monthly' ? 'active' : ''}`}
                onClick={() => setDonationType('monthly')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
                </svg>
                {t.monthly}
              </button>
              <button 
                className={`donation-type-btn ${donationType === 'oneTime' ? 'active' : ''}`}
                onClick={() => setDonationType('oneTime')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                {t.oneTime}
              </button>
            </div>
          </div>
        </div>

        {/* Donation Form */}
        <div className="donation-form-section">
          <div className="donation-form-container">
            <div className="donation-amounts-section">
              <h3 className="donation-section-title">{t.suggestedAmounts}</h3>
              <div className="donation-amounts-grid">
                {Object.entries(t.amounts).map(([amount, details]) => (
                  <button
                    key={amount}
                    className={`donation-amount-btn ${selectedAmount === parseInt(amount) ? 'selected' : ''}`}
                    onClick={() => handleAmountSelect(parseInt(amount))}
                  >
                    <div className="donation-amount-value">{details.label}</div>
                    <div className="donation-amount-impact">{details.impact}</div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="donation-custom-amount">
                <label className="donation-custom-label">{t.customAmount}</label>
                <div className="donation-custom-input-wrapper">
                  <input
                    type="number"
                    className="donation-custom-input"
                    placeholder={t.enterAmount}
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Donor Information */}
            <div className="donation-info-section">
              <h3 className="donation-section-title">{t.impact}</h3>
              
              <div className="donation-form-group">
                <label className="donation-label">{t.yourName}</label>
                <input
                  type="text"
                  className="donation-input"
                  value={donorInfo.name}
                  onChange={(e) => setDonorInfo({...donorInfo, name: e.target.value})}
                  placeholder="Votre nom"
                />
              </div>

              <div className="donation-form-group">
                <label className="donation-label">{t.yourMessage}</label>
                <textarea
                  className="donation-textarea"
                  value={donorInfo.message}
                  onChange={(e) => setDonorInfo({...donorInfo, message: e.target.value})}
                  placeholder={t.messagePlaceholder}
                  rows="4"
                />
              </div>

              {/* Impact Display */}
              {getFinalAmount() > 0 && (
                <div className="donation-impact-display">
                  <div className="donation-impact-amount">
                    {getFinalAmount()} 000 Ariary {donationType === 'monthly' ? `/${t.monthly.toLowerCase()}` : ''}
                  </div>
                  <div className="donation-impact-text">
                    {getFinalAmount() >= 250 ? t.amounts[250].impact :
                     getFinalAmount() >= 100 ? t.amounts[100].impact :
                     getFinalAmount() >= 50 ? t.amounts[50].impact :
                     getFinalAmount() >= 25 ? t.amounts[25].impact :
                     getFinalAmount() >= 10 ? t.amounts[10].impact :
                     t.amounts[5].impact}
                  </div>
                </div>
              )}

              {/* Donate Button */}
              <button
                className="donation-submit-btn"
                onClick={handleDonate}
                disabled={getFinalAmount() <= 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {t.donateAmount} {getFinalAmount() > 0 ? `${getFinalAmount()} 000 Ariary` : ''}
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="donation-footer">
          <div className="donation-security-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>{t.securePayment}</span>
          </div>
          <div className="donation-security-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>{t.taxDeductible}</span>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          plan="donation"
          language={language}
          theme={theme}
          onClose={handleClosePayment}
          planDetails={{
            name: donationType === 'monthly' ? t.monthly : t.oneTime,
            price: getFinalAmount().toString(),
            description: `Don ${donationType === 'monthly' ? 'mensuel' : 'unique'}`
          }}
        />
      )}
    </div>
  )
}

export default Donation
