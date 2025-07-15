import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import AuthChoice from './AuthChoice';
import DiscussionScreen from './DiscussionScreen';

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
      const token = getCookie('auth_token');
      console.log(document.cookie)
      console.log(token);
      
      if (!token) {
        setIsAuthenticated(false);
        setShowAuthChoice(true);
        setIsLoading(false);
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
      
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  const handleAuthChoiceClose = () => {
    setShowAuthChoice(false);
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
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