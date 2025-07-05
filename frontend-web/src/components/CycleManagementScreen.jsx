"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config"
import "./CycleManagementScreen.css"

const CycleManagementScreen = () => {
  const navigate = useNavigate()
  const [language, setLanguage] = useState("fr")
  const [theme, setTheme] = useState("light")
  const [activeTab, setActiveTab] = useState("calendar")
  const [cycleData, setCycleData] = useState({
    startDate: "",
    cycleDuration: 28,
    menstruationDuration: 5,
    cycleType: "regular",
  })
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [symptoms, setSymptoms] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Utility to get cookie by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "fr"
    const savedTheme = localStorage.getItem("theme") || "light"
    setLanguage(savedLanguage)
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)

    loadSymptoms()
  }, [navigate])

  const translations = {
    fr: {
      title: "Suivi du Cycle",
      calendar: "Calendrier",
      symptoms: "Symptômes",
      settings: "Paramètres",
      analytics: "Analyses",
      calendarTitle: "Calendrier menstruel",
      lastPeriodLabel: "Premier jour des dernières règles",
      nextPeriod: "Prochaines règles",
      ovulation: "Ovulation",
      fertilePeriod: "Période fertile",
      cycleDurationLabel: "Durée du cycle (jours)",
      physicalSymptoms: "Symptômes physiques",
      emotionalSymptoms: "Symptômes émotionnels",
      settingsTitle: "Paramètres du cycle",
      menstruationDurationLabel: "Durée des règles (jours)",
      cycleTypeLabel: "Type de cycle",
      regular: "Régulier",
      irregular: "Irrégulier",
      save: "Sauvegarder",
      saving: "Sauvegarde...",
      notDefined: "Non défini",
      day: "jour",
      days: "jours",
      dataSaved: "Données sauvegardées !",
      saveError: "Erreur lors de la sauvegarde",
      cycleInsights: "Aperçus du cycle",
      averageCycle: "Cycle moyen",
      lastCycles: "Derniers cycles",
      mood: "Humeur",
      flow: "Flux",
    },
    mg: {
      title: "Fanaraha-maso ny tsingerin'ny volana",
      calendar: "Kalandrie",
      symptoms: "Soritr'aretina",
      settings: "Fandrindrana",
      analytics: "Famakafakana",
      calendarTitle: "Kalandrien'ny fadim-bolana",
      lastPeriodLabel: "Andro voalohany tamin'ny fadim-bolana farany",
      nextPeriod: "Fadim-bolana manaraka",
      ovulation: "Famoahan'ny atody",
      fertilePeriod: "Fotoana mahavokatra",
      cycleDurationLabel: "Faharetan'ny tsingerin'ny volana (andro)",
      physicalSymptoms: "Soritr'aretina ara-batana",
      emotionalSymptoms: "Soritr'aretina ara-pihetseham-po",
      settingsTitle: "Fandrindran'ny tsingerin'ny volana",
      menstruationDurationLabel: "Faharetan'ny fadim-bolana (andro)",
      cycleTypeLabel: "Karazana tsingerin'ny volana",
      regular: "Tsy miovaova",
      irregular: "Miovaova",
      save: "Tahiry",
      saving: "Mitahiry...",
      notDefined: "Tsy voafaritra",
      day: "andro",
      days: "andro",
      dataSaved: "Voatahiry ny angon-drakitra!",
      saveError: "Nisy olana tamin'ny fitahirizana",
      cycleInsights: "Fijerin'ny tsingerin'ny volana",
      averageCycle: "Tsingerin'ny volana antonony",
      lastCycles: "Tsingerin'ny volana farany",
      mood: "Toe-tsaina",
      flow: "Fikorianan'ny ra",
    },
  }

  const t = (key) => translations[language][key] || key

  const toggleLanguage = () => {
    const newLang = language === "fr" ? "mg" : "fr"
    setLanguage(newLang)
    localStorage.setItem("language", newLang)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  const loadSymptoms = async () => {
    try {
      const token = getCookie("auth_token")
      if (token) {
        const response = await axios.get(`${config.apiUrl}/symptom/list/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setSymptoms(response.data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des symptômes:", error)
      setSymptoms([
        { id: 1, name_fr: "Crampes abdominales", name_mg: "Fanaintainan'ny kibo", type: "physical", icon: "🤕" },
        { id: 2, name_fr: "Maux de tête", name_mg: "Aretin'ny loha", type: "physical", icon: "🤯" },
        { id: 3, name_fr: "Fatigue", name_mg: "Havizanana", type: "physical", icon: "😴" },
        { id: 4, name_fr: "Douleurs lombaires", name_mg: "Aretin'ny lamosina", type: "physical", icon: "🦴" },
        { id: 5, name_fr: "Seins sensibles", name_mg: "Nono mahatsiaro", type: "physical", icon: "💔" },
        { id: 6, name_fr: "Ballonnements", name_mg: "Fivontosana", type: "physical", icon: "🎈" },
        { id: 7, name_fr: "Nausées", name_mg: "Maloiloy", type: "physical", icon: "🤢" },
        { id: 8, name_fr: "Irritabilité", name_mg: "Tezitra mora", type: "emotional", icon: "😤" },
        { id: 9, name_fr: "Anxiété", name_mg: "Ahiahy", type: "emotional", icon: "😰" },
        { id: 10, name_fr: "Sautes d'humeur", name_mg: "Fiovan'ny toe-tsaina", type: "emotional", icon: "🎭" },
        { id: 11, name_fr: "Tristesse", name_mg: "Alahelo", type: "emotional", icon: "😢" },
        { id: 12, name_fr: "Stress", name_mg: "Adin-tsaina", type: "emotional", icon: "😵" },
      ])
    }
  }

  const physicalSymptoms = symptoms.length === 0 ? [] : symptoms.physiques
  const emotionalSymptoms = symptoms.length === 0 ? [] : symptoms.emotions 

  const getNextPeriodDate = () => {
    if (!cycleData.startDate) return null
    const startDate = new Date(cycleData.startDate)
  }

  const getOvulationDate = () => {
    if (!cycleData.startDate) return null
    const startDate = new Date(cycleData.startDate)
    const ovulationDate = new Date(startDate)
    ovulationDate.setDate(startDate.getDate() + cycleData.cycleDuration - 14)
    return ovulationDate.toLocaleDateString(language === "fr" ? "fr-FR" : "mg-MG")
  }

  const getFertilePeriodDates = () => {
    if (!cycleData.startDate) return null
    const startDate = new Date(cycleData.startDate)
    const fertileStart = new Date(startDate)
    const fertileEnd = new Date(startDate)
    fertileStart.setDate(startDate.getDate() + cycleData.cycleDuration - 16)
    fertileEnd.setDate(startDate.getDate() + cycleData.cycleDuration - 12)
    return {
      start: fertileStart.toLocaleDateString(language === "fr" ? "fr-FR" : "mg-MG"),
      end: fertileEnd.toLocaleDateString(language === "fr" ? "fr-FR" : "mg-MG")
    }
  }

  const getDaysUntilNextPeriod = () => {
    if (!cycleData.startDate) return null
    const startDate = new Date(cycleData.startDate)
    const nextDate = new Date(startDate)
    nextDate.setDate(startDate.getDate() + cycleData.cycleDuration)
    const today = new Date()
    const diffTime = nextDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const token = getCookie("auth_token")
      if (token) {
        await axios.post(
          `${config.apiUrl}/symptom/new/`,
          {
            ...cycleData,
            symptoms: selectedSymptoms,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        const notification = document.createElement('div')
        notification.className = 'cycle-success-notification'
        notification.textContent = t("dataSaved")
        document.body.appendChild(notification)
        setTimeout(() => {
          notification.remove()
        }, 3000)
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert(t("saveError"))
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: "calendar", icon: "📅", label: t("calendar") },
    { id: "symptoms", icon: "📝", label: t("symptoms") },
    { id: "analytics", icon: "📊", label: t("analytics") },
    { id: "settings", icon: "⚙️", label: t("settings") },
  ]

  return (
    <div className="cycle-container">
      <header className="cycle-header">
        <div className="cycle-header-content">
          <div className="cycle-header-left">
            <button className="cycle-back-btn" onClick={() => navigate(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>

            <div className="cycle-logo">
              <div className="cycle-logo-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
                </svg>
              </div>
              <h1 className="cycle-logo-text">{t("title")}</h1>
            </div>
          </div>

          <div className="cycle-header-controls">
            <div className="cycle-language-selector">
              <button className={`cycle-lang-btn ${language === "fr" ? "active" : ""}`} onClick={toggleLanguage}>
                FR
              </button>
              <button className={`cycle-lang-btn ${language === "mg" ? "active" : ""}`} onClick={toggleLanguage}>
                MG
              </button>
            </div>

            <button className="cycle-control-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      <div className="cycle-content">
        <div className="cycle-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`cycle-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="cycle-tab-icon">{tab.icon}</span>
              <span className="cycle-tab-label">{tab.label}</span>
              <div className="cycle-tab-indicator"></div>
            </button>
          ))}
        </div>

        {activeTab === "calendar" && (
          <div className="cycle-tab-content">
            <div className="cycle-hero-section">
              <div className="cycle-hero-stats">
                <div className="cycle-stat-card primary">
                  <div className="cycle-stat-icon">🗓️</div>
                  <div className="cycle-stat-content">
                    <h3>{getDaysUntilNextPeriod() || "—"}</h3>
                    <p>jours avant les règles</p>
                  </div>
                </div>
                <div className="cycle-stat-card secondary">
                  <div className="cycle-stat-icon">📊</div>
                  <div className="cycle-stat-content">
                    <h3>{cycleData.cycleDuration}</h3>
                    <p>jours de cycle</p>
                  </div>
                </div>
                <div className="cycle-stat-card tertiary">
                  <div className="cycle-stat-icon">❤️</div>
                  <div className="cycle-stat-content">
                    <h3>{cycleData.menstruationDuration}</h3>
                    <p>jours de règles</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cycle-card modern">
              <div className="cycle-card-header">
                <div className="cycle-card-title-wrapper">
                  <h2 className="cycle-card-title">{t("calendarTitle")}</h2>
                  <div className="cycle-card-subtitle">Suivez votre cycle avec précision</div>
                </div>
              </div>
              <div className="cycle-card-content">
                <div className="cycle-form-group modern">
                  <label className="cycle-label">{t("lastPeriodLabel")}</label>
                  <div className="cycle-input-wrapper">
                    <input
                      type="date"
                      value={cycleData.startDate}
                      onChange={(e) => setCycleData({ ...cycleData, startDate: e.target.value })}
                      className="cycle-input modern"
                    />
                    <div className="cycle-input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="cycle-predictions modern">
                  <div className="cycle-prediction-card next-period">
                    <div className="cycle-prediction-header">
                      <div className="cycle-prediction-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </div>
                      <h3 className="cycle-prediction-title">{t("nextPeriod")}</h3>
                    </div>
                    <div className="cycle-prediction-content">
                      <p className="cycle-prediction-date">{getNextPeriodDate() || t("notDefined")}</p>
                      <div className="cycle-prediction-progress">
                        <div className="cycle-progress-bar" style={{width: `${((28 - (getDaysUntilNextPeriod() || 0)) / 28) * 100}%`}}></div>
                      </div>
                    </div>
                  </div>

                  <div className="cycle-prediction-card ovulation">
                    <div className="cycle-prediction-header">
                      <div className="cycle-prediction-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
                        </svg>
                      </div>
                      <h3 className="cycle-prediction-title">{t("ovulation")}</h3>
                    </div>
                    <div className="cycle-prediction-content">
                      <p className="cycle-prediction-date">{getOvulationDate() || t("notDefined")}</p>
                      <div className="cycle-prediction-badge">Pic de fertilité</div>
                    </div>
                  </div>

                  <div className="cycle-prediction-card fertile">
                    <div className="cycle-prediction-header">
                      <div className="cycle-prediction-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      </div>
                      <h3 className="cycle-prediction-title">{t("fertilePeriod")}</h3>
                    </div>
                    <div className="cycle-prediction-content">
                      <p className="cycle-prediction-date">
                        {getFertilePeriodDates() ? 
                          `${getFertilePeriodDates().start} - ${getFertilePeriodDates().end}` : 
                          t("notDefined")
                        }
                      </p>
                      <div className="cycle-prediction-badge success">Fenêtre fertile</div>
                    </div>
                  </div>
                </div>

                <div className="cycle-form-group modern">
                  <label className="cycle-label">{t("cycleDurationLabel")}</label>
                  <div className="cycle-duration-control modern">
                    <button
                      className="cycle-duration-btn"
                      onClick={() =>
                        setCycleData({ ...cycleData, cycleDuration: Math.max(21, cycleData.cycleDuration - 1) })
                      }
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                    <div className="cycle-duration-display">
                      <span className="cycle-duration-number">{cycleData.cycleDuration}</span>
                      <span className="cycle-duration-unit">jours</span>
                    </div>
                    <button
                      className="cycle-duration-btn"
                      onClick={() =>
                        setCycleData({ ...cycleData, cycleDuration: Math.min(35, cycleData.cycleDuration + 1) })
                      }
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "symptoms" && (
          <div className="cycle-tab-content">
            <div className="cycle-card modern">
              <div className="cycle-card-header">
                <div className="cycle-card-title-wrapper">
                  <h2 className="cycle-card-title">{t("physicalSymptoms")}</h2>
                  <div className="cycle-card-subtitle">Suivez vos symptômes physiques</div>
                </div>
              </div>
              <div className="cycle-card-content">
                <div className="cycle-symptoms-grid modern">
                  {physicalSymptoms.map((symptom) => (
                    <button
                      key={symptom.id_symptom}
                      className={`cycle-symptom-btn modern ${selectedSymptoms.includes(symptom.id_symptom) ? "selected" : ""}`}
                      onClick={() => toggleSymptom(symptom.id_symptom)}
                    >
                      <div className="cycle-symptom-icon">{symptom.icon || "💊"}</div>
                      <span className="cycle-symptom-text">
                        {language === "fr" ? symptom.description : symptom.description}
                      </span>
                      {selectedSymptoms.includes(symptom.id_symptom) && (
                        <div className="cycle-symptom-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="cycle-card modern">
              <div className="cycle-card-header">
                <div className="cycle-card-title-wrapper">
                  <h2 className="cycle-card-title">{t("emotionalSymptoms")}</h2>
                  <div className="cycle-card-subtitle">Suivez votre état émotionnel</div>
                </div>
              </div>
              <div className="cycle-card-content">
                <div className="cycle-symptoms-grid modern">
                  {emotionalSymptoms.map((symptom) => (
                    <button
                      key={symptom.id_symptom}
                      className={`cycle-symptom-btn modern ${selectedSymptoms.includes(symptom.id_symptom) ? "selected" : ""}`}
                      onClick={() => toggleSymptom(symptom.id_symptom)}
                    >
                      <div className="cycle-symptom-icon">{symptom.icon || "💭"}</div>
                      <span className="cycle-symptom-text">
                        {language === "fr" ? symptom.description : symptom.description}
                      </span>
                      {selectedSymptoms.includes(symptom.id_symptom) && (
                        <div className="cycle-symptom-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="cycle-tab-content">
            <div className="cycle-analytics-grid">
              <div className="cycle-card modern analytics">
                <div className="cycle-card-header">
                  <div className="cycle-card-title-wrapper">
                    <h2 className="cycle-card-title">{t("cycleInsights")}</h2>
                    <div className="cycle-card-subtitle">Analyses de vos données</div>
                  </div>
                </div>
                <div className="cycle-card-content">
                  <div className="cycle-insights-grid">
                    <div className="cycle-insight-item">
                      <div className="cycle-insight-icon">📈</div>
                      <div className="cycle-insight-content">
                        <h4>Régularité</h4>
                        <p>Cycle régulier</p>
                        <div className="cycle-insight-progress">
                          <div className="cycle-progress-bar" style={{width: "85%"}}></div>
                        </div>
                      </div>
                    </div>
                    <div className="cycle-insight-item">
                      <div className="cycle-insight-icon">🎯</div>
                      <div className="cycle-insight-content">
                        <h4>Prédictions</h4>
                        <p>95% de précision</p>
                        <div className="cycle-insight-progress">
                          <div className="cycle-progress-bar" style={{width: "95%"}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cycle-card modern chart">
                <div className="cycle-card-header">
                  <div className="cycle-card-title-wrapper">
                    <h2 className="cycle-card-title">Historique des cycles</h2>
                    <div className="cycle-card-subtitle">3 derniers mois</div>
                  </div>
                </div>
                <div className="cycle-card-content">
                  <div className="cycle-chart-placeholder">
                    <div className="cycle-chart-bars">
                      {[28, 30, 27, 29, 28].map((value, index) => (
                        <div key={index} className="cycle-chart-bar" style={{height: `${(value/35) * 100}%`}}>
                          <span className="cycle-chart-value">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="cycle-chart-labels">
                      <span>Jan</span>
                      <span>Fév</span>
                      <span>Mar</span>
                      <span>Avr</span>
                      <span>Mai</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="cycle-tab-content">
            <div className="cycle-card modern">
              <div className="cycle-card-header">
                <div className="cycle-card-title-wrapper">
                  <h2 className="cycle-card-title">{t("settingsTitle")}</h2>
                  <div className="cycle-card-subtitle">Personnalisez vos paramètres</div>
                </div>
              </div>
              <div className="cycle-card-content">
                <div className="cycle-settings-grid">
                  <div className="cycle-form-group modern">
                    <label className="cycle-label">{t("menstruationDurationLabel")}</label>
                    <div className="cycle-select-wrapper">
                      <select
                        value={cycleData.menstruationDuration}
                        onChange={(e) =>
                          setCycleData({ ...cycleData, menstruationDuration: Number.parseInt(e.target.value) })
                        }
                        className="cycle-select modern"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((duration) => (
                          <option key={duration} value={duration}>
                            {duration} {duration > 1 ? t("days") : t("day")}
                          </option>
                        ))}
                      </select>
                      <div className="cycle-select-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6,9 12,15 18,9"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="cycle-form-group modern">
                    <label className="cycle-label">{t("cycleTypeLabel")}</label>
                    <div className="cycle-select-wrapper">
                      <select
                        value={cycleData.cycleType}
                        onChange={(e) => setCycleData({ ...cycleData, cycleType: e.target.value })}
                        className="cycle-select modern"
                      >
                        <option value="regular">{t("regular")}</option>
                        <option value="irregular">{t("irregular")}</option>
                      </select>
                      <div className="cycle-select-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6,9 12,15 18,9"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cycle-settings-features">
                  <div className="cycle-feature-toggle">
                    <div className="cycle-feature-info">
                      <h4>Notifications</h4>
                      <p>Recevoir des rappels pour vos règles</p>
                    </div>
                    <div className="cycle-toggle-switch">
                      <input type="checkbox" id="notifications" defaultChecked />
                      <label htmlFor="notifications"></label>
                    </div>
                  </div>
                  
                  <div className="cycle-feature-toggle">
                    <div className="cycle-feature-info">
                      <h4>Prédictions avancées</h4>
                      <p>Analyses prédictives basées sur l'IA</p>
                    </div>
                    <div className="cycle-toggle-switch">
                      <input type="checkbox" id="predictions" defaultChecked />
                      <label htmlFor="predictions"></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="cycle-save-section">
          <button onClick={handleSave} disabled={isLoading} className={`cycle-save-btn modern ${isLoading ? "loading" : ""}`}>
            <div className="cycle-save-content">
              {isLoading ? (
                <div className="cycle-save-spinner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                </div>
              ) : (
                <div className="cycle-save-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                </div>
              )}
              <span>{isLoading ? t("saving") : t("save")}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CycleManagementScreen