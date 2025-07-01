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

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "fr"
    const savedTheme = localStorage.getItem("theme") || "light"
    setLanguage(savedLanguage)
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)

    loadSymptoms()
  }, [])

  const translations = {
    fr: {
      title: "Suivi du Cycle",
      calendar: "Calendrier",
      symptoms: "Symptômes",
      settings: "Paramètres",
      calendarTitle: "Calendrier menstruel",
      lastPeriodLabel: "Premier jour des dernières règles",
      nextPeriod: "Prochaines règles",
      ovulation: "Ovulation",
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
    },
    mg: {
      title: "Fanaraha-maso ny tsingerin'ny volana",
      calendar: "Kalandrie",
      symptoms: "Soritr'aretina",
      settings: "Fandrindrana",
      calendarTitle: "Kalandrien'ny fadim-bolana",
      lastPeriodLabel: "Andro voalohany tamin'ny fadim-bolana farany",
      nextPeriod: "Fadim-bolana manaraka",
      ovulation: "Famoahan'ny atody",
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
      const userData = JSON.parse(localStorage.getItem("userData"))
      const response = await axios.get(`${config.apiUrl}/symptoms/`, {
        headers: {
          Authorization: `Bearer ${userData.id}`,
        },
      })
      setSymptoms(response.data)
    } catch (error) {
      console.error("Erreur lors du chargement des symptômes:", error)
      setSymptoms([
        { id: 1, name_fr: "Crampes abdominales", name_mg: "Fanaintainan'ny kibo", type: "physical" },
        { id: 2, name_fr: "Maux de tête", name_mg: "Aretin'ny loha", type: "physical" },
        { id: 3, name_fr: "Fatigue", name_mg: "Havizanana", type: "physical" },
        { id: 4, name_fr: "Douleurs lombaires", name_mg: "Aretin'ny lamosina", type: "physical" },
        { id: 5, name_fr: "Seins sensibles", name_mg: "Nono mahatsiaro", type: "physical" },
        { id: 6, name_fr: "Ballonnements", name_mg: "Fivontosana", type: "physical" },
        { id: 7, name_fr: "Nausées", name_mg: "Maloiloy", type: "physical" },
        { id: 8, name_fr: "Irritabilité", name_mg: "Tezitra mora", type: "emotional" },
        { id: 9, name_fr: "Anxiété", name_mg: "Ahiahy", type: "emotional" },
        { id: 10, name_fr: "Sautes d'humeur", name_mg: "Fiovan'ny toe-tsaina", type: "emotional" },
        { id: 11, name_fr: "Tristesse", name_mg: "Alahelo", type: "emotional" },
        { id: 12, name_fr: "Stress", name_mg: "Adin-tsaina", type: "emotional" },
      ])
    }
  }

  const physicalSymptoms = symptoms.filter((s) => s.type === "physical")
  const emotionalSymptoms = symptoms.filter((s) => s.type === "emotional")

  const getNextPeriodDate = () => {
    if (!cycleData.startDate) return null
    const startDate = new Date(cycleData.startDate)
    const nextDate = new Date(startDate)
    nextDate.setDate(startDate.getDate() + cycleData.cycleDuration)
    return nextDate.toLocaleDateString(language === "fr" ? "fr-FR" : "mg-MG")
  }

  const getOvulationDate = () => {
    if (!cycleData.startDate) return null
    const startDate = new Date(cycleData.startDate)
    const ovulationDate = new Date(startDate)
    ovulationDate.setDate(startDate.getDate() + cycleData.cycleDuration - 14)
    return ovulationDate.toLocaleDateString(language === "fr" ? "fr-FR" : "mg-MG")
  }

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const userData = JSON.parse(localStorage.getItem("userData"))
      await axios.post(
        `${config.apiUrl}/cycle/`,
        {
          ...cycleData,
          symptoms: selectedSymptoms,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.id}`,
          },
        },
      )
      alert(t("dataSaved"))
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert(t("saveError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="cycle-container">
      {/* Header */}
      <header className="cycle-header">
        <div className="cycle-header-content">
          <div className="cycle-header-left">
            <button className="cycle-back-btn" onClick={() => navigate(-1)}>
              ←
            </button>

            <div className="cycle-logo">
              <span className="cycle-logo-icon">❤️</span>
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
        {/* Tabs */}
        <div className="cycle-tabs">
          <button
            className={`cycle-tab ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            <span className="cycle-tab-icon">📅</span>
            <span>{t("calendar")}</span>
          </button>
          <button
            className={`cycle-tab ${activeTab === "symptoms" ? "active" : ""}`}
            onClick={() => setActiveTab("symptoms")}
          >
            <span className="cycle-tab-icon">📝</span>
            <span>{t("symptoms")}</span>
          </button>
          <button
            className={`cycle-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span className="cycle-tab-icon">⚙️</span>
            <span>{t("settings")}</span>
          </button>
        </div>

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="cycle-tab-content">
            <div className="cycle-card">
              <div className="cycle-card-header">
                <h2 className="cycle-card-title">{t("calendarTitle")}</h2>
              </div>
              <div className="cycle-card-content">
                <div className="cycle-form-group">
                  <label className="cycle-label">{t("lastPeriodLabel")}</label>
                  <input
                    type="date"
                    value={cycleData.startDate}
                    onChange={(e) => setCycleData({ ...cycleData, startDate: e.target.value })}
                    className="cycle-input"
                  />
                </div>

                <div className="cycle-predictions">
                  <div className="cycle-prediction-card next-period">
                    <div className="cycle-prediction-icon">📅</div>
                    <div className="cycle-prediction-content">
                      <h3 className="cycle-prediction-title">{t("nextPeriod")}</h3>
                      <p className="cycle-prediction-date">{getNextPeriodDate() || t("notDefined")}</p>
                    </div>
                  </div>

                  <div className="cycle-prediction-card ovulation">
                    <div className="cycle-prediction-icon">❤️</div>
                    <div className="cycle-prediction-content">
                      <h3 className="cycle-prediction-title">{t("ovulation")}</h3>
                      <p className="cycle-prediction-date">{getOvulationDate() || t("notDefined")}</p>
                    </div>
                  </div>
                </div>

                <div className="cycle-form-group">
                  <label className="cycle-label">{t("cycleDurationLabel")}</label>
                  <div className="cycle-duration-control">
                    <button
                      className="cycle-duration-btn"
                      onClick={() =>
                        setCycleData({ ...cycleData, cycleDuration: Math.max(21, cycleData.cycleDuration - 1) })
                      }
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={cycleData.cycleDuration}
                      onChange={(e) =>
                        setCycleData({ ...cycleData, cycleDuration: Number.parseInt(e.target.value) || 28 })
                      }
                      className="cycle-input cycle-duration-input"
                      min="21"
                      max="35"
                    />
                    <button
                      className="cycle-duration-btn"
                      onClick={() =>
                        setCycleData({ ...cycleData, cycleDuration: Math.min(35, cycleData.cycleDuration + 1) })
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Symptoms Tab */}
        {activeTab === "symptoms" && (
          <div className="cycle-tab-content">
            <div className="cycle-card">
              <div className="cycle-card-header">
                <h2 className="cycle-card-title">{t("physicalSymptoms")}</h2>
              </div>
              <div className="cycle-card-content">
                <div className="cycle-symptoms-grid">
                  {physicalSymptoms.map((symptom) => (
                    <button
                      key={symptom.id}
                      className={`cycle-symptom-btn ${selectedSymptoms.includes(symptom.id) ? "selected" : ""}`}
                      onClick={() => toggleSymptom(symptom.id)}
                    >
                      <span className="cycle-symptom-text">
                        {language === "fr" ? symptom.name_fr : symptom.name_mg}
                      </span>
                      {selectedSymptoms.includes(symptom.id) && <span className="cycle-symptom-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="cycle-card">
              <div className="cycle-card-header">
                <h2 className="cycle-card-title">{t("emotionalSymptoms")}</h2>
              </div>
              <div className="cycle-card-content">
                <div className="cycle-symptoms-grid">
                  {emotionalSymptoms.map((symptom) => (
                    <button
                      key={symptom.id}
                      className={`cycle-symptom-btn ${selectedSymptoms.includes(symptom.id) ? "selected" : ""}`}
                      onClick={() => toggleSymptom(symptom.id)}
                    >
                      <span className="cycle-symptom-text">
                        {language === "fr" ? symptom.name_fr : symptom.name_mg}
                      </span>
                      {selectedSymptoms.includes(symptom.id) && <span className="cycle-symptom-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="cycle-tab-content">
            <div className="cycle-card">
              <div className="cycle-card-header">
                <h2 className="cycle-card-title">{t("settingsTitle")}</h2>
              </div>
              <div className="cycle-card-content">
                <div className="cycle-form-group">
                  <label className="cycle-label">{t("menstruationDurationLabel")}</label>
                  <select
                    value={cycleData.menstruationDuration}
                    onChange={(e) =>
                      setCycleData({ ...cycleData, menstruationDuration: Number.parseInt(e.target.value) })
                    }
                    className="cycle-select"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((duration) => (
                      <option key={duration} value={duration}>
                        {duration} {duration > 1 ? t("days") : t("day")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cycle-form-group">
                  <label className="cycle-label">{t("cycleTypeLabel")}</label>
                  <select
                    value={cycleData.cycleType}
                    onChange={(e) => setCycleData({ ...cycleData, cycleType: e.target.value })}
                    className="cycle-select"
                  >
                    <option value="regular">{t("regular")}</option>
                    <option value="irregular">{t("irregular")}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="cycle-save-section">
          <button onClick={handleSave} disabled={isLoading} className={`cycle-save-btn ${isLoading ? "loading" : ""}`}>
            <span className="cycle-save-icon">💾</span>
            {isLoading ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CycleManagementScreen
