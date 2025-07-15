import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import './GoogleCallback.css';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false); // Empêcher le double appel

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Empêcher le double appel en mode développement
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;

      try {
        // Extraire les paramètres de l'URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        console.log('Paramètres extraits:', { code, state });

        if (!code || !state) {
          setError('Paramètres manquants dans l\'URL de callback');
          setIsProcessing(false);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        console.log('Envoi de la requête au backend...');

        // Envoyer les paramètres au backend
        const response = await axios.post(`${config.apiUrl}/auth/google/callback/`, {
          code: code,
          state: state
        });

        console.log('Réponse du backend:', response.data);

        if (response.data.access) {
          // Sauvegarder le token dans un cookie
          const token = response.data.access;
          const date = new Date();
          date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 jours
          document.cookie = `auth_token=${token};expires=${date.toUTCString()};path=/;SameSite=Strict`;

          // Sauvegarder les données utilisateur
          localStorage.setItem(
            'userData',
            JSON.stringify({
              id: token,
            })
          );

          console.log('Token sauvegardé, redirection vers /');

          // Attendre un peu pour montrer le succès puis rediriger
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          console.error('Pas de token access dans la réponse');
          setError('Réponse invalide du serveur');
          setIsProcessing(false);
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('Erreur lors du callback Google:', err);
        
        // Gestion plus détaillée des erreurs
        if (err.response) {
          console.error('Erreur du serveur:', err.response.status, err.response.data);
          setError(`Erreur du serveur (${err.response.status}): ${err.response.data?.message || 'Erreur inconnue'}`);
        } else if (err.request) {
          console.error('Pas de réponse du serveur');
          setError('Impossible de contacter le serveur');
        } else {
          console.error('Erreur de configuration:', err.message);
          setError('Erreur de configuration de la requête');
        }
        
        setIsProcessing(false);
        setTimeout(() => navigate('/login'), 5000); // Plus de temps pour lire l'erreur
      }
    };

    handleGoogleCallback();
  }, [navigate, searchParams]); // Dépendances stables

  return (
    <div className="google-callback-container">
      <div className="google-callback-content">
        <div className="google-callback-logo-container">
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
        
        <div className="google-callback-dots">
          <div className="google-callback-dot"></div>
          <div className="google-callback-dot"></div>
          <div className="google-callback-dot"></div>
          <div className="google-callback-dot"></div>
          <div className="google-callback-dot"></div>
        </div>
        
        <p className={`google-callback-text ${error ? 'error' : isProcessing ? '' : 'success'}`}>
          {isProcessing ? (
            'Finalisation de l\'authentification Google...'
          ) : error ? (
            error
          ) : (
            'Authentification réussie ! Redirection en cours...'
          )}
        </p>
        
        {isProcessing && (
          <div className="google-callback-progress">
            <div className="google-callback-progress-bar"></div>
          </div>
        )}
        
        <p className={`google-callback-subtitle ${error ? 'error' : isProcessing ? '' : 'success'}`}>
          {isProcessing ? (
            'Veuillez patienter pendant que nous vérifions vos informations'
          ) : error ? (
            'Vous allez être redirigé vers la page de connexion'
          ) : (
            'Vous allez être redirigé vers l\'application'
          )}
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;