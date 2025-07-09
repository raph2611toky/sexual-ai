import React, { useState } from 'react';
import { User, UserPlus, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthChoice.css';
import config from "../config"

const AuthChoice = ({ onClose }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleStayDisconnected = async () => {
    setIsLoading(true);
    try {
        const response = await axios.get(`${config.apiUrl}/profile/anonymous/`);
        const anonymousToken = response.data.access;
      
        if (response.status === 200) {
            const token = response.data.access
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
        }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la récupération du token anonyme:', error);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-choice-overlay">
      <div className="auth-choice-container">
        <div className="auth-choice-content">
          <h2 className="auth-choice-title">Bienvenue dans la discussion ! 👋</h2>
          <p className="auth-choice-subtitle">
            Pour une meilleure expérience, choisissez comment vous souhaitez continuer
          </p>
          
          <div className="auth-choice-options">
            <button 
              className="auth-choice-btn auth-choice-login"
              onClick={handleLogin}
              disabled={isLoading}
            >
              <User className="auth-choice-icon" />
              <div className="auth-choice-text">
                <span className="auth-choice-label">Se connecter</span>
                <span className="auth-choice-desc">J'ai déjà un compte</span>
              </div>
            </button>

            <button 
              className="auth-choice-btn auth-choice-signup"
              onClick={handleSignup}
              disabled={isLoading}
            >
              <UserPlus className="auth-choice-icon" />
              <div className="auth-choice-text">
                <span className="auth-choice-label">S'inscrire gratuitement</span>
                <span className="auth-choice-desc">Créer un nouveau compte</span>
              </div>
            </button>

            <button 
              className="auth-choice-btn auth-choice-guest"
              onClick={handleStayDisconnected}
              disabled={isLoading}
            >
              <UserX className="auth-choice-icon" />
              <div className="auth-choice-text">
                <span className="auth-choice-label">
                  {isLoading ? 'Chargement...' : 'Rester déconnecté'}
                </span>
                <span className="auth-choice-desc">
                  {isLoading ? 'Récupération du token...' : 'Continuer sans compte'}
                </span>
              </div>
              {isLoading && (
                <div className="auth-choice-loading-spinner"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthChoice;