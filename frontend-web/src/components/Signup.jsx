"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config"
import { useToast } from "../hooks/useToast"
import ToastContainer from "./ToastContainer"
import "./Signup.css"

const Signup = () => {
  const navigate = useNavigate()
  const genre = "feminin"
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [dob, setDob] = useState("")
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState("fr")
  const [theme, setTheme] = useState("light")
  const { toasts, success, error, removeToast } = useToast()

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "fr"
    const savedTheme = localStorage.getItem("theme") || "light"
    setLanguage(savedLanguage)
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)

    document.body.classList.add("auth-flip-enter")
    setTimeout(() => {
      document.body.classList.remove("auth-flip-enter")
    }, 800)
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
      createAccount: "Créer votre compte! 👋",
      subtitle: "Connectez-vous au monde!",
      name: "Nom",
      email: "Adresse Email",
      password: "Mot de passe",
      phone: "Numéro de téléphone",
      acceptTerms: "J'accepte les ",
      termsLink: "conditions et politiques",
      termsOfServiceLink: "termes des services",
      signup: "Inscription",
      haveAccount: "J'ai déjà un compte",
      signIn: "Se connecter",
      acceptTermsError: "Veuillez accepter les conditions et les politiques.",
      fillFields: "Veuillez remplir tous les champs.",
      signupSuccess: "Inscription réussie ! Veuillez vérifier votre email pour le code OTP.",
      unexpectedError: "Une erreur inattendue est survenue.",
      signupError: "Erreur lors de l'inscription.",
      and: "et",
    },
    mg: {
      and: "ary ny",
      createAccount: "Mamorona ny kaontinao! 👋",
      subtitle: "Mifandray amin'izao tontolo izao!",
      name: "Anarana",
      email: "Adiresy Email",
      password: "Teny miafina",
      phone: "Nomeraon-telefaona",
      acceptTerms: "Ekeko ny ",
      termsLink: "fepetra sy politika",
      termsOfServiceLink: "fepetra fampiasana ny tolotra",
      signup: "Hisoratra anarana",
      haveAccount: "Efa manana kaonty aho",
      signIn: "Hiditra",
      acceptTermsError: "Ekeo ny fepetra sy ny politika azafady.",
      fillFields: "Fenoy ny saha rehetra azafady.",
      signupSuccess: "Fisoratana anarana nahomby ! Hamarino ny mailakao ho an'ny kaody OTP.",
      unexpectedError: "Nisy olana tsy nampoizina.",
      signupError: "Nisy olana tamin'ny fisoratana anarana.",
    },
  }

  const t = (key) => translations[language][key] || key

  const handleLogin = () => {
    document.body.classList.add("auth-flip-exit")
    setTimeout(() => {
      navigate("/login")
    }, 400)
  }

  const handleSignup = async () => {
    if (!isChecked) {
      error(t("acceptTermsError"))
      return
    }

    if (!username.trim() || !email.trim() || !password.trim() || !genre.trim()) {
      error(t("fillFields"))
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(`${config.apiUrl}/register/`, {
        name: username,
        email,
        password,
        sexe: genre,
        birth_date: dob,
        phone_number: "+261" + phoneNumber,
      })

      if (response.status === 201) {
        success(t("signupSuccess"))
        setTimeout(() => {
          document.body.classList.add("auth-flip-exit")
          setTimeout(() => {
            navigate("/verify-otp", { state: { email: email } })
          }, 400)
        }, 2000)
      } else {
        error(t("unexpectedError"))
      }
    } catch (err) {
      console.error(err)
      error(t("signupError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="signup-content">
        <div className="signup-header-controls">
          <button className="signup-control-btn" onClick={toggleLanguage}>
            {language.toUpperCase()}
          </button>
          <button className="signup-control-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        <h1 className="signup-title">{t("createAccount")}</h1>
        <p className="signup-subtitle">{t("subtitle")}</p>

        <div className="signup-input-container">
          <svg className="signup-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <input
            type="text"
            placeholder={t("name")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="signup-input"
          />
        </div>

        <div className="signup-input-container">
          <svg className="signup-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="signup-input"
          />
        </div>

        <div className="signup-input-container">
          <svg className="signup-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="signup-input" />
        </div>

        <div className="signup-input-container">
          <svg className="signup-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <circle cx="12" cy="16" r="1"></circle>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input
            type={isPasswordShown ? "text" : "password"}
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signup-input"
          />
          <button type="button" className="signup-password-toggle" onClick={() => setIsPasswordShown(!isPasswordShown)}>
            {isPasswordShown ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>

        <div className="signup-input-container">
          <svg className="signup-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span className="signup-prefix">+261</span>
          <input
            type="tel"
            placeholder={t("phone")}
            value={phoneNumber}
            onChange={(e) => {
              const filteredText = e.target.value.replace(/[^0-9]/g, "")
              if (filteredText.length <= 9) {
                setPhoneNumber(filteredText)
              }
            }}
            className="signup-input signup-phone-input"
          />
        </div>

        <div className="signup-checkbox-container">
          <input
            type="checkbox"
            id="terms"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="signup-checkbox"
          />
          <label htmlFor="terms">
            {t("acceptTerms")}
            <a href="/terms-of-services" className="signup-terms-link">{t("termsOfServiceLink")}</a> {t("and")} <a href="/privacy-policy" className="signup-terms-link">{t("termsLink")}</a>
          </label>
        </div>

        <button
          className={`signup-button ${isLoading ? "signup-button-loading" : ""}`}
          onClick={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? "..." : t("signup")}
        </button>

        <div className="signup-login-container">
          <span className="signup-login-text">{t("haveAccount")}</span>
          <button className="signup-login-link" onClick={handleLogin}>
            {t("signIn")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signup