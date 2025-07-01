"use client"
import { useNavigate } from "react-router-dom"
import "./DetailsScreen.css"

export default function DetailsScreen() {
  const navigate = useNavigate()

  return (
    <div className="details-container">
      <h1 className="details-title">Écran des détails</h1>
      <button className="details-button" onClick={() => navigate(-1)}>
        Retourner
      </button>
    </div>
  )
}
