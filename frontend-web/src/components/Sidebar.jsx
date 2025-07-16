"use client"

import { useState, useEffect, useRef } from "react"
import { X, Plus, MessageCircle, Search, Mic, Calendar, MoreHorizontal, Trash2, Edit3, Phone, Info, Sun, Moon, HandCoinsIcon } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import config from "../config"
import MenstrualTrackingPortal from "./MenstrualTrackingPortal"
import "./Sidebar.css"

const Sidebar = ({
  isOpen,
  onClose,
  conversations,
  onNewChat,
  onSelectConversation,
  currentConversationId,
  onStartCall,
  onMenstrualOption,
  language,
  onConversationsUpdate,
  theme,
  onThemeToggle,
}) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredConversations, setFilteredConversations] = useState(conversations)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newTitle, setNewTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showMenstrualPortal, setShowMenstrualPortal] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const sidebarElement = document.querySelector(".sidebar")
    if (activeDropdown) {
      sidebarElement?.classList.add("dropdown-active")
    } else {
      sidebarElement?.classList.remove("dropdown-active")
    }

    return () => {
      sidebarElement?.classList.remove("dropdown-active")
    }
  }, [activeDropdown])

  useEffect(() => {
    const filtered = conversations.filter(
      (conv) =>
        conv.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.preview && conv.preview.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    setFilteredConversations(filtered)
  }, [searchQuery, conversations])

  useEffect(() => {
    const handleClickOutside = (event) => {
      const activeDropdownElement = document.querySelector(`[data-dropdown-id="${activeDropdown}"]`)
      if (activeDropdown && activeDropdownElement && !activeDropdownElement.contains(event.target)) {
        setActiveDropdown(null)
      }
    }

    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDropdown])

  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
    return null
  }

  // Fonction pour récupérer la liste des conversations mise à jour
  const fetchUpdatedConversations = async () => {
    try {
      const token = getCookie("auth_token")
      if (!token) return

      const response = await axios.get(`${config.apiUrl}/conversation/list/`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (onConversationsUpdate) {
        onConversationsUpdate(response.data || [])
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations:", error)
    }
  }

  const handleMoreInfo = () => {
    navigate('/home')
  }

  const handleMakeDonation = () => {
    navigate('/donation')
  }

  const handleMenstrualOption = (option) => {
    if (option === "redirect") {
      setShowMenstrualPortal(true)
    }
  }

  const handleDropdownToggle = (conversationId, event) => {
    event.stopPropagation()
    setActiveDropdown(activeDropdown === conversationId ? null : conversationId)
  }

  const handleRenameConversation = (conversation, e) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedConversation(conversation)
    setNewTitle(conversation.titre || `Discussion ${conversation.id_conversation}`)
    setShowRenameModal(true)
    setActiveDropdown(null)
  }

  const handleDeleteConversation = (conversation, e) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedConversation(conversation)
    setShowDeleteModal(true)
    setActiveDropdown(null)
  }

  const handleRenameSubmit = async () => {
    if (!selectedConversation || !newTitle.trim() || isLoading) return

    setIsLoading(true)
    try {
      const token = getCookie("auth_token")
      if (!token) {
        return
      }

      await axios.put(
        `${config.apiUrl}/conversation/${selectedConversation.id_conversation}/modifier/titre/`,
        { titre: newTitle.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Récupérer la liste mise à jour depuis le serveur
      await fetchUpdatedConversations()

      setShowRenameModal(false)
      setSelectedConversation(null)
      setNewTitle("")
    } catch (error) {
      console.error("Erreur lors du renommage:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedConversation || isLoading) return

    setIsLoading(true)
    try {
      const token = getCookie("auth_token")
      if (!token) {
        return
      }

      await axios.delete(`${config.apiUrl}/conversation/${selectedConversation.id_conversation}/supprimer/`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Récupérer la liste mise à jour depuis le serveur
      await fetchUpdatedConversations()

      // Si la conversation supprimée était la conversation active, créer une nouvelle discussion
      if (currentConversationId === selectedConversation.id_conversation) {
        onNewChat()
      }

      setShowDeleteModal(false)
      setSelectedConversation(null)
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const closeModals = () => {
    setShowRenameModal(false)
    setShowDeleteModal(false)
    setSelectedConversation(null)
    setNewTitle("")
    document.body.classList.remove("modal-open")
  }

  useEffect(() => {
    if (showRenameModal || showDeleteModal) {
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
    }

    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [showRenameModal, showDeleteModal])

  const translations = {
    FR: {
      newDiscussion: "Nouvelle discussion",
      searchConversations: "Rechercher dans les discussions...",
      callMode: "Mode appel",
      voiceMode: "Mode vocal",
      available: "Disponible",
      menstrualTracking: "Suivi menstruel",
      options: "Options",
      rename: "Renommer",
      delete: "Supprimer",
      myDiscussions: "Mes Discussions",
      renameTitle: "Renommer la discussion",
      deleteTitle: "Supprimer la discussion",
      renamePrompt: "Entrez le nouveau titre de la discussion :",
      deletePrompt: "Êtes-vous sûr de vouloir supprimer cette discussion ? Cette action est irréversible.",
      cancel: "Annuler",
      save: "Enregistrer",
      confirm: "Confirmer",
      placeholder: "Nouveau titre...",
      authRequired: "Authentification requise",
      renameError: "Erreur lors du renommage de la discussion",
      deleteError: "Erreur lors de la suppression de la discussion",
      moreInfo: "Plus d'Information",
      themeToggle: "Thème",
      lightMode: "Mode clair",
      darkMode: "Mode sombre",
      makeDonation: "Faire un don"
    },
    MG: {
      newDiscussion: "Resaka vaovao",
      searchConversations: "Tadiavo ny resaka...",
      callMode: "Fomba fiantsoana",
      voiceMode: "Fomba feo",
      available: "Misy",
      menstrualTracking: "Fanaraha-maso fadimbolana",
      options: "Safidy",
      rename: "Hanova anarana",
      delete: "Hamafa",
      myDiscussions: "Ny Resakako",
      renameTitle: "Hanova ny anaran'ny resaka",
      deleteTitle: "Hamafa ny resaka",
      renamePrompt: "Ampidiro ny anarana vaovao ho an'ny resaka :",
      deletePrompt: "Tena hofafanao ve ity resaka ity ? Tsy azo averina intsony izany.",
      cancel: "Aoka ihany",
      save: "Tehirizo",
      confirm: "Ekeo",
      placeholder: "Anarana vaovao...",
      authRequired: "Mila miditra",
      renameError: "Nisy olana tamin'ny fanovana anarana",
      deleteError: "Nisy olana tamin'ny famafana",
      moreInfo: 'Fahalalana fanampiny',
      themeToggle: "Loko",
      lightMode: "Mazava",
      darkMode: "Maizina",
      makeDonation: "Hanolotra fanampiana"
    },
  }

  const t = (key) => {
    const currentLang = translations[language] ? language : "FR"
    return translations[currentLang][key] || key
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="sidebar-header">
          <div className="header-left">
            <img src="/LOGO-1.png" alt="Logo" className="header-logo" />
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <X className="icon-sm" />
          </button>
        </div>

        <div className="sidebar-new-chat-section">
          <button onClick={onNewChat} className="new-chat-btn">
            <Plus className="icon-sm" />
            {t("newDiscussion")}
          </button>
        </div>

        <div className="sidebar-search-section">
          <div className="search-input-container">
            <Search className="search-icon" />
            <input
              placeholder={t("searchConversations")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="sidebar-options-section">
          <div className="option-item">
            <div className="option-label">
              <Phone className="icon-sm" onClick={onStartCall} />
              <span>{t("callMode")}</span>
            </div>
          </div>

          <div className="option-item">
            <div className="option-label" onClick={handleMoreInfo}>
              <Info className="icon-sm"  />
              <span>{t("moreInfo")}</span>
            </div>
          </div>

          <div className="option-item" onClick={handleMakeDonation}>
            <div className="option-label">
              <HandCoinsIcon className="icon-sm" />
              <span>{t("makeDonation")}</span>
            </div>
            <span className="status-text">
            </span>
          </div>

          <div className="option-item" onClick={() => handleMenstrualOption("redirect")}>
            <div className="option-label" >
              <Calendar className="icon-sm" />
              <span>{t("menstrualTracking")}</span>
            </div>
            <div className="dropdown-container">
              <button className="menstrual-dropdown-btn" onClick={() => handleMenstrualOption("redirect")}>
                {t("options")}
              </button>
            </div>
          </div>
        </div>

        <div className="conversations-section">
          <div className="conversations-list">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id_conversation}
                className={`conversation-item ${currentConversationId === conversation.id_conversation ? "conversation-active" : ""} ${activeDropdown === conversation.id_conversation ? "dropdown-open" : ""}`}
                onClick={() => onSelectConversation(conversation.id_conversation, conversation.titre)}
              >
                <div className="conversation-icon">
                  <MessageCircle className="icon-sm" />
                </div>

                <div className="conversation-content">
                  <h3 className="conversation-title">{conversation.titre}</h3>
                </div>

                <div className="conversation-actions">
                  <div
                    className="dropdown-menu"
                    data-dropdown-id={conversation.id_conversation}
                    ref={activeDropdown === conversation.id_conversation ? dropdownRef : null}
                  >
                    <button
                      className="dropdown-trigger"
                      onClick={(e) => handleDropdownToggle(conversation.id_conversation, e)}
                    >
                      <MoreHorizontal className="icon-sm" />
                    </button>
                    {activeDropdown === conversation.id_conversation && (
                      <>
                        <div className="dropdown-overlay" onClick={() => setActiveDropdown(null)} />
                        <div className="dropdown-content">
                          <button onClick={(e) => handleRenameConversation(conversation, e)}>
                            <Edit3 className="icon-sm" />
                            {t("rename")}
                          </button>
                          <button onClick={(e) => handleDeleteConversation(conversation, e)} className="delete-action">
                            <Trash2 className="icon-sm" />
                            {t("delete")}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showRenameModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModals()
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">{t("renameTitle")}</h3>
              <button className="modal-close-btn" onClick={closeModals}>
                <X className="icon-sm" />
              </button>
            </div>
            <div className="modal-content">
              <p className="modal-prompt">{t("renamePrompt")}</p>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t("placeholder")}
                className="modal-input"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleRenameSubmit()
                  }
                  if (e.key === "Escape") {
                    closeModals()
                  }
                }}
              />
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={closeModals} disabled={isLoading}>
                {t("cancel")}
              </button>
              <button
                className="modal-btn modal-btn-primary"
                onClick={handleRenameSubmit}
                disabled={isLoading || !newTitle.trim()}
              >
                {isLoading ? "..." : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModals()
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">{t("deleteTitle")}</h3>
              <button className="modal-close-btn" onClick={closeModals}>
                <X className="icon-sm" />
              </button>
            </div>
            <div className="modal-content">
              <p className="modal-prompt">{t("deletePrompt")}</p>
              {selectedConversation && (
                <div className="conversation-preview">
                  <strong>"{selectedConversation.titre}"</strong>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={closeModals} disabled={isLoading}>
                {t("cancel")}
              </button>
              <button className="modal-btn modal-btn-danger" onClick={handleDeleteConfirm} disabled={isLoading}>
                {isLoading ? "..." : t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      <MenstrualTrackingPortal 
        isOpen={showMenstrualPortal}
        onClose={() => setShowMenstrualPortal(false)}
        language={language}
      />
    </>
  )
}

export default Sidebar
