"use client"

import { useState } from "react"
import "./PaymentModal.css"

const PaymentModal = ({ plan, language = "FR", theme = "light", onClose, planDetails }) => {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [formData, setFormData] = useState({
    // Card details
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    // Mobile Money
    phoneNumber: "",
    operator: "orange",
    // Personal info
    email: "",
    firstName: "",
    lastName: "",
    country: "Madagascar"
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const translations = {
    FR: {
      title: "Finaliser votre abonnement",
      planSelected: "Plan sélectionné",
      billingCycle: "Cycle de facturation",
      monthly: "Mensuel",
      yearly: "Annuel (20% de réduction)",
      paymentMethod: "Méthode de paiement",
      cardPayment: "Carte bancaire",
      mobilePayment: "Mobile Money",
      cardNumber: "Numéro de carte",
      expiryDate: "Date d'expiration",
      cvv: "CVV",
      cardName: "Nom sur la carte",
      phoneNumber: "Numéro de téléphone",
      operator: "Opérateur",
      email: "Email",
      firstName: "Prénom",
      lastName: "Nom",
      country: "Pays",
      total: "Total",
      processing: "Traitement en cours...",
      payNow: "Payer maintenant",
      securePayment: "Paiement sécurisé SSL",
      moneyBackGuarantee: "Garantie satisfait ou remboursé 30 jours",
      operators: {
        orange: "Orange Money",
        mvola: "MVola",
        airtel: "Airtel Money"
      },
      countries: {
        madagascar: "Madagascar",
        france: "France",
        canada: "Canada"
      }
    },
    MG: {
      title: "Famaranana ny famandrihana",
      planSelected: "Drafitra voafidy",
      billingCycle: "Fomba fandoavam-bola",
      monthly: "Isam-bolana",
      yearly: "Isan-taona (fihenam-bidy 20%)",
      paymentMethod: "Fomba fandoavam-bola",
      cardPayment: "Karatra banky",
      mobilePayment: "Mobile Money",
      cardNumber: "Laharan'ny karatra",
      expiryDate: "Daty fahafonganana",
      cvv: "CVV",
      cardName: "Anarana eo amin'ny karatra",
      phoneNumber: "Laharan-telefaona",
      operator: "Orinasa",
      email: "Email",
      firstName: "Anarana",
      lastName: "Fanampin'anarana",
      country: "Firenena",
      total: "Totalin'ny vidiny",
      processing: "Miasa...",
      payNow: "Mandoa izao",
      securePayment: "Fandoavam-bola azo antoka SSL",
      moneyBackGuarantee: "Antoka famerenana vola 30 andro",
      operators: {
        orange: "Orange Money",
        mvola: "MVola", 
        airtel: "Airtel Money"
      },
      countries: {
        madagascar: "Madagasikara",
        france: "Frantsa",
        canada: "Kanada"
      }
    }
  }

  const t = translations[language]

  const calculatePrice = () => {
    const basePrice = parseFloat(planDetails.price)
    return billingCycle === "yearly" ? (basePrice * 12 * 0.8).toFixed(2) : basePrice.toFixed(2)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      alert(language === 'FR' ? 'Paiement réussi!' : 'Fandoavam-bola nahomby!')
      onClose()
    }, 3000)
  }

  return (
    <div className={`payment-container ${theme}`} data-theme={theme}>
      <div className="payment-overlay" onClick={onClose}></div>
      
      <div className="payment-modal">
        <div className="payment-header">
          <button className="payment-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <h2 className="payment-title">{t.title}</h2>
        </div>

        <div className="payment-content">
          <div className="payment-left">
            {/* Plan Summary */}
            <div className="payment-plan-summary">
              <h3>{t.planSelected}</h3>
              <div className="payment-plan-info">
                <div className="payment-plan-name">
                  {plan === 'premium' && '⭐'} 
                  {plan === 'pro' && '👑'}
                  {planDetails.name}
                </div>
                <div className="payment-plan-price">
                  ${calculatePrice()}
                  <span>/{billingCycle === 'monthly' ? t.monthly.toLowerCase() : (language === 'FR' ? 'an' : 'taona')}</span>
                </div>
              </div>
            </div>

            {/* Billing Cycle */}
            <div className="payment-section">
              <h3>{t.billingCycle}</h3>
              <div className="payment-billing-options">
                <label className={`payment-billing-option ${billingCycle === 'monthly' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="billing" 
                    value="monthly"
                    checked={billingCycle === 'monthly'}
                    onChange={(e) => setBillingCycle(e.target.value)}
                  />
                  <span className="payment-radio-custom"></span>
                  <div className="payment-billing-info">
                    <div className="payment-billing-name">{t.monthly}</div>
                    <div className="payment-billing-price">${planDetails.price}/mois</div>
                  </div>
                </label>
                
                <label className={`payment-billing-option ${billingCycle === 'yearly' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="billing" 
                    value="yearly"
                    checked={billingCycle === 'yearly'}
                    onChange={(e) => setBillingCycle(e.target.value)}
                  />
                  <span className="payment-radio-custom"></span>
                  <div className="payment-billing-info">
                    <div className="payment-billing-name">
                      {t.yearly}
                      <span className="payment-save-badge">-20%</span>
                    </div>
                    <div className="payment-billing-price">
                      ${(parseFloat(planDetails.price) * 12 * 0.8).toFixed(2)}/{language === 'FR' ? 'an' : 'taona'}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="payment-section">
              <h3>{t.paymentMethod}</h3>
              <div className="payment-method-tabs">
                <button 
                  className={`payment-method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  {t.cardPayment}
                </button>
                
                <button 
                  className={`payment-method-tab ${paymentMethod === 'mobile' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('mobile')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                  {t.mobilePayment}
                </button>
              </div>
            </div>
          </div>

          <div className="payment-right">
            <form onSubmit={handleSubmit} className="payment-form">
              {/* Personal Information */}
              <div className="payment-form-section">
                <h4>Informations personnelles</h4>
                <div className="payment-form-row">
                  <div className="payment-form-group">
                    <label>{t.firstName}</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required 
                    />
                  </div>
                  <div className="payment-form-group">
                    <label>{t.lastName}</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required 
                    />
                  </div>
                </div>
                
                <div className="payment-form-group">
                  <label>{t.email}</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required 
                  />
                </div>

                <div className="payment-form-group">
                  <label>{t.country}</label>
                  <select 
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  >
                    <option value="Madagascar">{t.countries.madagascar}</option>
                    <option value="France">{t.countries.france}</option>
                    <option value="Canada">{t.countries.canada}</option>
                  </select>
                </div>
              </div>

              {/* Payment Details */}
              {paymentMethod === 'card' ? (
                <div className="payment-form-section">
                  <h4>Détails de la carte</h4>
                  <div className="payment-form-group">
                    <label>{t.cardNumber}</label>
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      required 
                    />
                    <div className="payment-card-icons">
                      <img src="/visa-icon.svg" alt="Visa" />
                      <img src="/mastercard-icon.svg" alt="Mastercard" />
                      <img src="/paypal-icon.svg" alt="PayPal" />
                    </div>
                  </div>
                  
                  <div className="payment-form-row">
                    <div className="payment-form-group">
                      <label>{t.expiryDate}</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="payment-form-group">
                      <label>{t.cvv}</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="payment-form-group">
                    <label>{t.cardName}</label>
                    <input 
                      type="text" 
                      value={formData.cardName}
                      onChange={(e) => handleInputChange('cardName', e.target.value)}
                      required 
                    />
                  </div>
                </div>
              ) : (
                <div className="payment-form-section">
                  <h4>Mobile Money</h4>
                  <div className="payment-form-group">
                    <label>{t.operator}</label>
                    <select 
                      value={formData.operator}
                      onChange={(e) => handleInputChange('operator', e.target.value)}
                    >
                      <option value="orange">{t.operators.orange}</option>
                      <option value="mvola">{t.operators.mvola}</option>
                      <option value="airtel">{t.operators.airtel}</option>
                    </select>
                  </div>
                  
                  <div className="payment-form-group">
                    <label>{t.phoneNumber}</label>
                    <input 
                      type="tel" 
                      placeholder="+261 34 12 345 67"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      required 
                    />
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="payment-order-summary">
                <div className="payment-summary-row">
                  <span>Plan {planDetails.name}</span>
                  <span>${planDetails.price}</span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="payment-summary-row discount">
                    <span>Réduction annuelle (-20%)</span>
                    <span>-${(parseFloat(planDetails.price) * 12 * 0.2).toFixed(2)}</span>
                  </div>
                )}
                <div className="payment-summary-total">
                  <span>{t.total}</span>
                  <span>${calculatePrice()}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="payment-submit-btn"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="payment-spinner"></div>
                    {t.processing}
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="16" r="1"></circle>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    {t.payNow} ${calculatePrice()}
                  </>
                )}
              </button>

              {/* Security Info */}
              <div className="payment-security-info">
                <div className="payment-security-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>{t.securePayment}</span>
                </div>
                <div className="payment-security-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span>{t.moneyBackGuarantee}</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
