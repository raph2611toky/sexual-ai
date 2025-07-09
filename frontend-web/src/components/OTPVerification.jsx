"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import config from "../config"
import { useToast } from "../hooks/useToast"
import ToastContainer from "./ToastContainer"
import "./OTPVerification.css"

const OTPVerification = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState("fr")
  const [theme, setTheme] = useState("light")
  const [email, setEmail] = useState("")
  const { toasts, success, error, removeToast } = useToast()
  const inputRefs = useRef([])

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "fr"
    const savedTheme = localStorage.getItem("theme") || "light"
    setLanguage(savedLanguage)
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)

    if (location.state?.email) {
      setEmail(location.state.email)
    } else {
      navigate("/signup")
      return
    }

    document.body.classList.add("auth-flip-enter")
    setTimeout(() => {
      document.body.classList.remove("auth-flip-enter")
    }, 800)

    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [location.state, navigate])

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
      verifyAccount: "Vérifiez votre compte! 🔐",
      subtitle: "Entrez le code à 6 chiffres envoyé à",
      enterCode: "Entrez votre code de vérification",
      verify: "Vérifier",
      resendCode: "Renvoyer le code",
      backToSignup: "Retour à l'inscription",
      fillAllFields: "Veuillez remplir tous les champs du code.",
      verificationSuccess: "Vérification réussie ! Redirection vers l'accueil...",
      verificationError: "Code de vérification incorrect.",
      resendSuccess: "Code renvoyé avec succès !",
      resendError: "Erreur lors du renvoi du code.",
      unexpectedError: "Une erreur inattendue est survenue.",
    },
    mg: {
      verifyAccount: "Hanamarina ny kaontinao! 🔐",
      subtitle: "Ampidiro ny kaody 6 tarehimarika nalefa tany",
      enterCode: "Ampidiro ny kaody fanamafisana",
      verify: "Hanamarina",
      resendCode: "Halefa indray ny kaody",
      backToSignup: "Hiverina amin'ny fisoratana anarana",
      fillAllFields: "Fenoy ny saha rehetra amin'ny kaody azafady.",
      verificationSuccess: "Fanamafisana nahomby ! Mandehana any amin'ny fandraisana...",
      verificationError: "Diso ny kaody fanamafisana.",
      resendSuccess: "Nalefa indray soa aman-tsara ny kaody !",
      resendError: "Nisy olana tamin'ny fandefasana indray ny kaody.",
      unexpectedError: "Nisy olana tsy nampoizina.",
    },
  }

  const t = (key) => translations[language][key] || key

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtpValues = [...otpValues]
    newOtpValues[index] = value
    setOtpValues(newOtpValues)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    if (e.key === "Enter") {
      handleVerification()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newOtpValues = [...otpValues]
    for (let i = 0; i < pastedData.length; i++) {
      newOtpValues[i] = pastedData[i]
    }
    setOtpValues(newOtpValues)
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleVerification = async () => {
    const otpCode = otpValues.join("")
    if (otpCode.length !== 6) {
      error(t("fillAllFields"))
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(`${config.apiUrl}/user/verify-otp/`, {
        email: email,
        code_otp: otpCode,
      })

      if (response.status === 200) {
        const token = response.data.access // Adjust if token is in a different field
        const expires = 7 // 7 days expiration
        const date = new Date()
        date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000))
        document.cookie = `auth_token=${token};expires=${date.toUTCString()};path=/;SameSite=Strict`

        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: token,
          })
        )

        success(t("verificationSuccess"))
        setTimeout(() => {
          document.body.classList.add("auth-flip-exit")
          setTimeout(() => {
            navigate("/")
          }, 400)
        }, 2000)
      } else {
        error(t("unexpectedError"))
      }
    } catch (err) {
      console.error(err)
      if (err.response?.status === 400) {
        error(t("verificationError"))
      } else {
        error(t("unexpectedError"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      const response = await axios.post(`${config.apiUrl}/user/resend-otp/`, {
        email: email,
      })

      if (response.status === 200) {
        success(t("resendSuccess"))
        setOtpValues(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      } else {
        error(t("resendError"))
      }
    } catch (err) {
      console.error(err)
      error(t("resendError"))
    }
  }

  const handleBackToSignup = () => {
    document.body.classList.add("auth-flip-exit")
    setTimeout(() => {
      navigate("/signup")
    }, 400)
  }

  return (
    <div className="otp-container">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="otp-content">
        <div className="otp-header-controls">
          <button className="otp-control-btn" onClick={toggleLanguage}>
            {language.toUpperCase()}
          </button>
          <button className="otp-control-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        <h1 className="otp-title">{t("verifyAccount")}</h1>
        <p className="otp-subtitle">
          {t("subtitle")} <strong>{email}</strong>
        </p>

        <div className="otp-inputs-container">
          <p className="otp-label">{t("enterCode")}</p>
          <div className="otp-inputs">
            {otpValues.map((value, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="otp-input"
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <button
          className={`otp-button ${isLoading ? "otp-button-loading" : ""}`}
          onClick={handleVerification}
          disabled={isLoading}
        >
          {isLoading ? "..." : t("verify")}
        </button>

        <div className="otp-actions">
          <button className="otp-resend-link" onClick={handleResendCode}>
            {t("resendCode")}
          </button>
          <button className="otp-back-link" onClick={handleBackToSignup}>
            {t("backToSignup")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OTPVerification