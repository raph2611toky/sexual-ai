import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import AuthChoice from './AuthChoice';
import DiscussionScreen from './DiscussionScreen';
import './ProtectedDiscussionScreen.css';

const ProtectedDiscussionScreen = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthChoice, setShowAuthChoice] = useState(false);

  // Utility to get cookie by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Vérifier la validité du token
  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${config.apiUrl}/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Token invalide:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      const startTime = Date.now();
      const token = getCookie('auth_token');
      
      if (!token) {
        setIsAuthenticated(false);
        setShowAuthChoice(true);
        // Attendre au minimum 3 secondes
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 3500 - elapsedTime);
        setTimeout(() => setIsLoading(false), remainingTime);
        return;
      }

      // Vérifier la validité du token
      const isValidToken = await verifyToken(token);
      
      if (isValidToken) {
        setIsAuthenticated(true);
        setShowAuthChoice(false);
      } else {
        // Token invalide, supprimer le cookie et afficher le choix d'auth
        document.cookie = 'auth_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setShowAuthChoice(true);
      }
      
      // Attendre au minimum 3 secondes
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3500 - elapsedTime);
      setTimeout(() => setIsLoading(false), remainingTime);
    };

    checkAuthentication();
  }, []);

  const handleAuthChoiceClose = () => {
    setShowAuthChoice(false);
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-content">
          <div className="auth-loading-logo-container">
            <div className="logo-svg-container">
              <svg className="animated-logo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                {/* Cercle de base */}
                <circle 
                  className="logo-circle" 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="url(#gradient1)" 
                  strokeWidth="3"
                />
                
                {/* Symbole féminin */}
                <g className="female-symbol-group">
                  <circle cx="85" cy="85" r="15" fill="none" stroke="#e91e63" strokeWidth="3"/>
                  <line x1="85" y1="100" x2="85" y2="125" stroke="#e91e63" strokeWidth="3"/>
                  <line x1="75" y1="115" x2="95" y2="115" stroke="#e91e63" strokeWidth="3"/>
                </g>
                
                {/* Symbole masculin */}
                <g className="male-symbol-group">
                  <circle cx="115" cy="115" r="15" fill="none" stroke="#6366f1" strokeWidth="3"/>
                  <line x1="125" y1="105" x2="140" y2="90" stroke="#6366f1" strokeWidth="3"/>
                  <line x1="135" y1="90" x2="145" y2="90" stroke="#6366f1" strokeWidth="3"/>
                  <line x1="140" y1="85" x2="140" y2="95" stroke="#6366f1" strokeWidth="3"/>
                </g>
                
                {/* Ondes de connexion */}
                <g className="connection-waves">
                  <path className="wave-1" d="M 60 100 Q 100 60 140 100" fill="none" stroke="url(#gradient2)" strokeWidth="2"/>
                  <path className="wave-2" d="M 70 110 Q 100 80 130 110" fill="none" stroke="url(#gradient2)" strokeWidth="2"/>
                  <path className="wave-3" d="M 80 120 Q 100 100 120 120" fill="none" stroke="url(#gradient2)" strokeWidth="2"/>
                </g>
                
                {/* Particules d'énergie */}
                <g className="energy-particles">
                  <circle className="particle-1" cx="60" cy="60" r="2" fill="#e91e63"/>
                  <circle className="particle-2" cx="140" cy="60" r="2" fill="#6366f1"/>
                  <circle className="particle-3" cx="60" cy="140" r="2" fill="#10b981"/>
                  <circle className="particle-4" cx="140" cy="140" r="2" fill="#f59e0b"/>
                </g>
                
                {/* Gradients */}
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e91e63"/>
                    <stop offset="50%" stopColor="#9c27b0"/>
                    <stop offset="100%" stopColor="#6366f1"/>
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e91e63" stopOpacity="0.6"/>
                    <stop offset="50%" stopColor="#9c27b0" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6"/>
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="sexual-ai-text">SEXUAL AI</div>
            </div>
          </div>
          
          <div className="auth-loading-dots">
            <div className="auth-loading-dot"></div>
            <div className="auth-loading-dot"></div>
            <div className="auth-loading-dot"></div>
            <div className="auth-loading-dot"></div>
            <div className="auth-loading-dot"></div>
          </div>
          
          <p className="auth-loading-text">
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  if (showAuthChoice) {
    return (
      <>
        <DiscussionScreen />
        <AuthChoice onClose={handleAuthChoiceClose} />
      </>
    );
  }

  return <DiscussionScreen />;
};

export default ProtectedDiscussionScreen;