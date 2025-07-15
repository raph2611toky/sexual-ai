"use client"

import { useState, useEffect } from "react"
import { X, Plus, MessageCircle, Search, Mic, Calendar, MoreHorizontal, Trash2, Edit3, Phone } from "lucide-react"
import "./Sidebar.css" // Ensure this CSS file is used for styling

const Sidebar = ({
  isOpen,
  onClose,
  conversations,
  onNewChat,
  onSelectConversation,
  currentConversationId,
  onStartCall,
  onMenstrualOption,
  language, // Added language prop
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredConversations, setFilteredConversations] = useState(conversations)

  useEffect(() => {
    const filtered = conversations.filter(
      (conv) =>
        conv.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.preview.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredConversations(filtered)
  }, [searchQuery, conversations])

  const handleDeleteConversation = (id, e) => {
    e.stopPropagation()
    console.log("Delete conversation:", id)
  }

  const handleRenameConversation = (id, e) => {
    e.stopPropagation()
    console.log("Rename conversation:", id)
  }

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
    },
  }

  const t = (key) => {
    const currentLang = translations[language] ? language : "FR"
    return translations[currentLang][key] || key
  }

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
        {/* Header */}
        <div className="sidebar-header">
            <div className="header-left">
            <img src="/LOGO-1.png" alt="Logo" className="header-logo" />
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <X className="icon-sm" />
          </button>
        </div>

        {/* Nouveau chat */}
        <div className="sidebar-new-chat-section">
          <button onClick={onNewChat} className="new-chat-btn">
            <Plus className="icon-sm" />
            {t("newDiscussion")}
          </button>
        </div>

        {/* Recherche */}
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

        {/* Options avec icône d'appel */}
        <div className="sidebar-options-section">
          <div className="option-item">
            <div className="option-label">
              <Phone className="icon-sm" onClick={onStartCall}/>
              <span>{t("callMode")}</span>
            </div>
            
          </div>

          <div className="option-item">
            <div className="option-label">
              <Mic className="icon-sm" />
              <span>{t("voiceMode")}</span>
            </div>
            <span className="status-text">{t("available")}</span>
          </div>

          <div className="option-item">
            <div className="option-label">
              <Calendar className="icon-sm" />
              <span>{t("menstrualTracking")}</span>
            </div>
            <div className="dropdown-container">
              <button className="menstrual-dropdown-btn" onClick={() => onMenstrualOption("redirect")}>
                {t("options")}
              </button>
            </div>
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="conversations-section">
         
          <div className="conversations-list">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id_conversation}
                className={`conversation-item ${currentConversationId === conversation.id_conversation ? "conversation-active" : ""}`}
                onClick={() => onSelectConversation(conversation.id_conversation, conversation.titre)}
              >
                <div className="conversation-icon">
                  <MessageCircle className="icon-sm" />
                </div>

                <div className="conversation-content">
                  <h3 className="conversation-title">{conversation.titre}</h3>
                </div>

                <div className="conversation-actions">
                  <div className="dropdown-menu">
                    <button className="dropdown-trigger">
                      <MoreHorizontal className="icon-sm" />
                    </button>
                    <div className="dropdown-content">
                      <button onClick={(e) => handleRenameConversation(conversation.id_conversation, e)}>
                        <Edit3 className="icon-sm" />
                        {t("rename")}
                      </button>
                      <button
                        onClick={(e) => handleDeleteConversation(conversation.id_conversation, e)}
                        className="delete-action"
                      >
                        <Trash2 className="icon-sm" />
                        {t("delete")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
