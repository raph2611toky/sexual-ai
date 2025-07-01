"use client"
import { useNavigate } from "react-router-dom"
import "./ProfileScreen.css"

export default function ProfileScreen() {
  const navigate = useNavigate()

  const handleNavigation = () => {
    navigate("/")
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Paramètres</h1>
      <p className="profile-description">
        Gérez les préférences de votre application, y compris les notifications et les comptes.
      </p>
      <button className="profile-button" onClick={handleNavigation}>
        Retour à l'accueil
      </button>
    </div>
  )
}
