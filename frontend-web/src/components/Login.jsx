"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config"
import { useToast } from "../hooks/useToast"
import ToastContainer from "./ToastContainer"
import "./Login.css"

const Login = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
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

    // Animation flip d'entrée
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
      welcome: "Bienvenue! 👋",
      subtitle: "Bonjour, ta santé reproductive est notre priorité!",
      email: "Adresse Email",
      password: "Mot de passe",
      rememberMe: "Se souvenir de moi",
      login: "Connexion",
      noAccount: "Je n'ai pas de compte",
      signUp: "S'inscrire",
      fillFields: "Veuillez remplir tous les champs.",
      loginError: "Erreur de connexion. Veuillez vérifier vos identifiants.",
      loginSuccess: "Connexion réussie ! Redirection en cours...",
    },
    mg: {
      welcome: "Tongasoa! 👋",
      subtitle: "Salama, ny fahasalamanao momba ny fiterahana no laharam-pahamehafanay!",
      email: "Adiresy Email",
      password: "Teny miafina",
      rememberMe: "Tadidio aho",
      login: "Hiditra",
      noAccount: "Tsy manana kaonty aho",
      signUp: "Hisoratra anarana",
      fillFields: "Fenoy ny saha rehetra azafady.",
      loginError: "Tsy afaka niditra. Hamarino ny antontan-kevitrao.",
      loginSuccess: "Niditra soa aman-tsara ! Mandehana...",
    },
  }

  const t = (key) => translations[language][key] || key

  const handleSignup = () => {
    document.body.classList.add("auth-flip-exit")
    setTimeout(() => {
      navigate("/signup")
    }, 400)
  }

  const handleLogin = async () => {
    if (!email || !password) {
      error(t("fillFields"))
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(`${config.apiUrl}/login/`, { email, password })

      const token = response.data.access;
      const expires = isChecked ? 7 : 1;
      const date = new Date();
      date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
      document.cookie = `auth_token=${token};expires=${date.toUTCString()};path=/;SameSite=Strict`;

      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: token,
        }),
      )

      success(t("loginSuccess"))

      setTimeout(() => {
        document.body.classList.add("auth-flip-exit")
        setTimeout(() => {
          navigate("/")
        }, 400)
      }, 1500)
    } catch (err) {
      console.error("Erreur de connexion:", err)
      error(t("loginError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="login-content">
        <div className="login-header-controls">
          <button className="login-control-btn" onClick={toggleLanguage}>
            {language.toUpperCase()}
          </button>
          <button className="login-control-btn" onClick={toggleTheme}>
            {theme === "light"? "🌙" : "☀️"}
          </button>
        </div>

        <h1 className="login-title">{t("welcome")}</h1>
        <p className="login-subtitle">{t("subtitle")}</p>

        <div className="login-input-container">
          <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
        </div>

        <div className="login-input-container">
          <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <circle cx="12" cy="16" r="1"></circle>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input
            type={isPasswordShown ? "text" : "password"}
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button type="button" className="login-password-toggle" onClick={() => setIsPasswordShown(!isPasswordShown)}>
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

        <div className="login-checkbox-container">
          <input
            type="checkbox"
            id="remember"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="login-checkbox"
          />
          <label htmlFor="remember">{t("rememberMe")}</label>
        </div>

        <button
          className={`login-button ${isLoading ? "login-button-loading" : ""}`}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "..." : t("login")}
        </button>

        <div className="login-signup-container">
          <span className="login-signup-text">{t("noAccount")}</span>
          <button className="login-signup-link" onClick={handleSignup}>
            {t("signUp")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login