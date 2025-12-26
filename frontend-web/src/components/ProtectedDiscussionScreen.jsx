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

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

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

  document.addEventListener('contextmenu', (e) => e.preventDefault());

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

      const isValidToken = await verifyToken(token);
      
      if (isValidToken) {
        setIsAuthenticated(true);
        setShowAuthChoice(false);
      } else {
        document.cookie = 'auth_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setShowAuthChoice(true);
      }
      
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

  const brandText = 'Sexual AI.'
  const subBrandText = 'Votre IA axé sur la santé sexuelle'
  const typingDurationMs = 1400

  if (isLoading) {
    
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-content loader-minimal" role="status" aria-live="polite" aria-atomic="true">
          <div className="loader-brand">
            <img className="loader-logo" src="/logo.svg" alt="Sexual AI" />

            <div className="loader-typingStack" style={{ '--duration': `${typingDurationMs}ms`, '--delay2': `${typingDurationMs}ms` }}>
              <div className="loader-typing" style={{ '--chars': brandText.length }} aria-label={brandText}>
                <span className="loader-typing-text">{brandText}</span>
              </div>

              <div className="loader-typing loader-typing--sub loader-typing--delayed" style={{ '--chars': subBrandText.length }} aria-label={subBrandText}>
                <span className="loader-typing-text">{subBrandText}</span>
              </div>
            </div>
          </div>

          <p className="loader-subtext">Vérification de l’authentification…</p>
        </div>
      </div>
    )
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