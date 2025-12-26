import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import config from '../config'
import './Profile.css'

const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const Profile = () => {
  const navigate = useNavigate()

  const [language, setLanguage] = useState('FR')
  const [theme, setTheme] = useState('light')

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const translations = {
    FR: {
      title: 'Profil',
      back: 'Retour',
      loading: 'Chargement du profil…',
      error: 'Impossible de charger le profil.',
      name: 'Nom',
      email: 'Email',
      birthDate: 'Date de naissance',
      sex: 'Sexe',
      status: 'Statut',
      active: 'Actif',
      inactive: 'Inactif',
      theme: 'Thème',
      light: 'Clair',
      dark: 'Sombre',
      language: 'Langue',
    },
    MG: {
      title: 'Mombamomba',
      back: 'Hiverina',
      loading: 'Mampiditra mombamomba…',
      error: 'Tsy afaka naka ny mombamomba.',
      name: 'Anarana',
      email: 'Mailaka',
      birthDate: 'Daty nahaterahana',
      sex: 'Lahy/Vavy',
      status: 'Sata',
      active: 'Mandeha',
      inactive: 'Tsy mandeha',
      theme: 'Loko',
      light: 'Mazava',
      dark: 'Maizina',
      language: 'Fiteny',
    },
  }

  const t = translations[language] || translations.FR

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    const savedLanguage = (localStorage.getItem('language') || 'fr').toUpperCase()

    setTheme(savedTheme)
    setLanguage(savedLanguage === 'MG' ? 'MG' : 'FR')
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const token = getCookie('auth_token')
        const res = await axios.get(`${config.apiUrl}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(res.data)
      } catch (e) {
        setError(t.error)
      } finally {
        setLoading(false)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleLanguage = () => {
    const newLang = language === 'FR' ? 'MG' : 'FR'
    setLanguage(newLang)
    localStorage.setItem('language', newLang === 'FR' ? 'fr' : 'mg')
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  if (loading) {
    return (
      <div className="profile-page" data-theme={theme}>
        <div className="profile-card">
          <div className="profile-topbar">
            <button className="profile-back" onClick={() => navigate(-1)}>{t.back}</button>
          </div>
          <div className="profile-loading">{t.loading}</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page" data-theme={theme}>
        <div className="profile-card">
          <div className="profile-topbar">
            <button className="profile-back" onClick={() => navigate(-1)}>{t.back}</button>
          </div>
          <div className="profile-error">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page" data-theme={theme}>
      <div className="profile-card">
        <div className="profile-topbar">
          <button className="profile-back" onClick={() => navigate(-1)}>{t.back}</button>

          <div className="profile-topbar-right">
            <button className="profile-pill" onClick={toggleLanguage}>{language}</button>
            <button className="profile-pill" onClick={toggleTheme}>{theme === 'dark' ? t.dark : t.light}</button>
          </div>
        </div>

        <div className="profile-header">
          <img
            className="profile-avatar"
            src={user?.profile_url}
            alt={`Photo de profil de ${user?.name || ''}`}
          />
          <div className="profile-title">
            <h1 className="profile-name">{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-field">
            <div className="profile-label">ID</div>
            <div className="profile-value">{user?.id}</div>
          </div>

          <div className="profile-field">
            <div className="profile-label">{t.birthDate}</div>
            <div className="profile-value">{user?.birth_date}</div>
          </div>

          <div className="profile-field">
            <div className="profile-label">{t.sex}</div>
            <div className="profile-value">{user?.sexe}</div>
          </div>

          <div className="profile-field">
            <div className="profile-label">{t.status}</div>
            <div className={`profile-badge ${user?.is_active ? 'is-active' : 'is-inactive'}`}>
              {user?.is_active ? t.active : t.inactive}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
