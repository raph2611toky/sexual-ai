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
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;

      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          setError('Paramètres manquants dans l\'URL de callback');
          setIsProcessing(false);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        const response = await axios.post(`${config.apiUrl}/auth/google/callback/`, {
          code: code,
          state: state
        });

        if (response.data.access) {
          const token = response.data.access;
          const date = new Date();
          date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
          document.cookie = `auth_token=${token};expires=${date.toUTCString()};path=/;SameSite=Strict`;

          localStorage.setItem(
            'userData',
            JSON.stringify({
              id: token,
            })
          );

          setIsProcessing(false);
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          setError('Réponse invalide du serveur');
          setIsProcessing(false);
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        if (err.response) {
          setError(`Erreur du serveur (${err.response.status}): ${err.response.data?.message || 'Erreur inconnue'}`);
        } else if (err.request) {
          setError('Impossible de contacter le serveur');
        } else {
          setError('Erreur de configuration de la requête');
        }
        
        setIsProcessing(false);
        setTimeout(() => navigate('/login'), 5000);
      }
    };

    handleGoogleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="google-callback-container">
      <div className="google-callback-content">
        <div className="google-callback-dots">
          <div className="google-callback-dot"></div>
          <div className="google-callback-dot"></div>
          <div className="google-callback-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;