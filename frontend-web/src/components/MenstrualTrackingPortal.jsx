import React from 'react';
import { Calendar, Clock, Heart, X, Sparkles } from 'lucide-react';
import './MenstrualTrackingPortal.css';

const MenstrualTrackingPortal = ({ isOpen, onClose, language = 'FR' }) => {
  const translations = {
    FR: {
      title: "Suivi Menstruel",
      subtitle: "Bientôt disponible",
      message: "Fonctionnalité en cours de développement",
      features: [
        "Calendrier personnalisé",
        "Prédictions IA",
        "Rappels intelligents",
        "Suivi symptômes",
        "Analyses détaillées"
      ],
      comingSoon: "En développement",
      stayTuned: "Restez connectée !",
      close: "Fermer"
    },
    MG: {
      title: "Fanaraha-maso Fadimbolana",
      subtitle: "Ho avy tsy ho ela",
      message: "Asa mbola atao",
      features: [
        "Kalandrie manokana",
        "Faminaniana IA",
        "Fampahatsiahivana",
        "Fanaraha-maso",
        "Famakafakana"
      ],
      comingSoon: "Mbola atao",
      stayTuned: "Mijanòna mifandray !",
      close: "Hidio"
    }
  };

  const t = (key) => {
    const currentLang = translations[language] ? language : "FR";
    return translations[currentLang][key] || key;
  };

  if (!isOpen) return null;

  return (
    <div className="menstrual-portal-overlay" onClick={onClose}>
      <div className="menstrual-portal-container" onClick={(e) => e.stopPropagation()}>
        <button className="menstrual-portal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="menstrual-portal-header">
          <div className="menstrual-portal-icon">
            <Sparkles size={24} />
          </div>
          <h2 className="menstrual-portal-title">{t('title')}</h2>
          <p className="menstrual-portal-subtitle">{t('subtitle')}</p>
        </div>

        <div className="menstrual-portal-content">
          <div className="menstrual-portal-message">
            <p>{t('message')}</p>
          </div>

          <div className="menstrual-portal-features">
            <ul>
              {t('features').map((feature, index) => (
                <li key={index}>
                  <Heart size={12} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="menstrual-portal-status">
            <div className="status-badge">
              <Clock size={12} />
              <span>{t('comingSoon')}</span>
            </div>
            <p className="status-message">{t('stayTuned')}</p>
          </div>
        </div>

        <div className="menstrual-portal-footer">
          <button className="menstrual-portal-btn" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenstrualTrackingPortal;