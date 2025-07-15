"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config"
import "./AuthChoice.css"

const AuthChoice = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleStayDisconnected = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${config.apiUrl}/profile/anonymous/`)
      const anonymousToken = response.data.access

      if (response.status === 200) {
        const token = anonymousToken
        const expires = 7
        const date = new Date()
        date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000)
        document.cookie = `auth_token=${token};expires=${date.toUTCString()};path=/;SameSite=Strict`

        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: token,
          })
        )
      }
      onClose()
    } catch (error) {
      console.error("Erreur lors de la récupération du token anonyme:", error)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginClick = () => {
    navigate("/login")
  }

  const handleSignupClick = () => {
    navigate("/signup")
  }

  return (
    <div className="auth-choice-overlay">
      <div className="auth-choice-card">
        <div className="auth-choice-content">
          <button className="auth-close-btn" onClick={onClose}>
            <X className="icon-sm" />
          </button>

          <div className="auth-choice-header">
            <div className="auth-choice-icon">
              <span className="welcome-emoji">👋</span>
            </div>
            <h2 className="auth-choice-title">Bienvenue sur Sexual AI</h2>
            <p className="auth-choice-subtitle">
              Votre assistant personnel pour la santé reproductive
            </p>
          </div>

          <div className="auth-choice-buttons">
            <button
              onClick={handleLoginClick}
              className="auth-btn auth-btn-primary"
              disabled={isLoading}
            >
              <div className="auth-btn-content">
                <span className="auth-btn-text">Se connecter</span>
              </div>
            </button>

            <button
              onClick={handleSignupClick}
              className="auth-btn auth-btn-secondary"
              disabled={isLoading}
            >
              <div className="auth-btn-content">
                <span className="auth-btn-text">Inscription gratuite</span>
              </div>
            </button>
          </div>

          <div className="auth-choice-footer">
            <button
              onClick={handleStayDisconnected}
              disabled={isLoading}
              className="stay-disconnected-link"
            >
              {isLoading ? "Chargement..." : "Continuer sans compte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthChoice
