"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config"
import "./DiscussionScreen.css"

export default function DiscussionScreen() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState("")
  const [responses, setResponses] = useState([])
  const [id_conversation, setId_conversation] = useState("")
  const [discussionCreated, setDiscussionCreated] = useState(false)
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [menuVisible, setMenuVisible] = useState(false)
  const [currentTitle, setCurrentTitle] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const [isWaitingResponse, setIsWaitingResponse] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("FR")
  const [isCallMode, setIsCallMode] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [theme, setTheme] = useState("light")

  const chatContainerRef = useRef()
  const mediaRecorderRef = useRef()
  const audioChunksRef = useRef([])
  const callTimerRef = useRef()
  const audioContextRef = useRef()
  const analyserRef = useRef()

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    const savedLanguage = localStorage.getItem("language") || "fr"
    setTheme(savedTheme)
    setSelectedLanguage(savedLanguage === "fr" ? "FR" : "MG")
    document.documentElement.setAttribute("data-theme", savedTheme)

    if (!discussionCreated) {
      handleCreateDiscussion()
    }
  }, [discussionCreated])

  useEffect(() => {
    if (chatContainerRef.current && responses.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [responses])

  useEffect(() => {
    if (isCallMode) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
      setCallDuration(0)
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
  }, [isCallMode])

  const translations = {
    FR: {
      title: "Sexual AI",
      newDiscussion: "Nouvelle discussion",
      myDiscussions: "Mes Discussions",
      loading: "Chargement...",
      welcomeTitle: "Sexual AI Assistant",
      welcomeText:
        "Posez vos questions sur la santé reproductive en toute confidentialité. Vous pouvez taper ou utiliser la reconnaissance vocale.",
      inputPlaceholder: "Tapez votre question ici...",
      processing: "Traitement...",
      typing: "En train d'écrire...",
      speaking: "Vous parlez...",
      listening: "À l'écoute...",
      stopReading: "Arrêter la lecture",
      readMessage: "Lire le message",
      startRecording: "Commencer l'enregistrement",
      stopRecording: "Arrêter l'enregistrement",
      sendMessage: "Envoyer le message",
      startCall: "Démarrer un appel vocal",
      stopCall: "Arrêter l'appel",
    },
    MG: {
      title: "Sexual AI",
      newDiscussion: "Resaka vaovao",
      myDiscussions: "Ny Resakako",
      loading: "Mamaky...",
      welcomeTitle: "Mpanampy Sexual AI",
      welcomeText:
        "Apetraho ny fanontanianao momba ny fahasalamana ara-piterahana amin'ny tsiambaratelo. Afaka manoratra na mampiasa ny fanekena feo ianao.",
      inputPlaceholder: "Soraty eto ny fanontanianao...",
      processing: "Miasa...",
      typing: "Manoratra...",
      speaking: "Miteny ianao...",
      listening: "Mihaino...",
      stopReading: "Ajanony ny famakiana",
      readMessage: "Vakio ny hafatra",
      startRecording: "Atombohy ny fandraketana",
      stopRecording: "Ajanony ny fandraketana",
      sendMessage: "Alefaso ny hafatra",
      startCall: "Atombohy ny antso",
      stopCall: "Ajanony ny antso",
    },
  }

  const t = (key) => translations[selectedLanguage][key] || key

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleMenu = () => {
    if (menuVisible) {
      setMenuVisible(false)
    } else {
      fetchConversations()
      setMenuVisible(true)
    }
  }

  const toggleLanguage = () => {
    const newLang = selectedLanguage === "FR" ? "MG" : "FR"
    setSelectedLanguage(newLang)
    localStorage.setItem("language", newLang === "FR" ? "fr" : "mg")
  }

  const toggleCallMode = () => {
    setIsCallMode(!isCallMode)
    if (!isCallMode) {
      startCallMode()
    } else {
      stopCallMode()
    }
  }

  const startCallMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      analyserRef.current.fftSize = 256
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateAudioLevel = () => {
        if (isCallMode) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average / 255)
          requestAnimationFrame(updateAudioLevel)
        }
      }
      updateAudioLevel()
    } catch (error) {
      console.error("Erreur accès microphone:", error)
      alert("Impossible d'accéder au microphone")
      setIsCallMode(false)
    }
  }

  const stopCallMode = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setAudioLevel(0)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processAudioToText(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Erreur enregistrement:", error)
      alert("Impossible d'accéder au microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessingAudio(true)
    }
  }

  const processAudioToText = async (audioBlob) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const transcribedText =
        selectedLanguage === "FR"
          ? "Bonjour, j'aimerais avoir des informations sur la contraception."
          : "Salama, te-hiangavy fampahalalana momba ny fisorohana vohoka aho."

      setQuestion(transcribedText)
      setIsProcessingAudio(false)

      if (isCallMode) {
        setTimeout(() => {
          handleAskQuestion(transcribedText)
        }, 500)
      }
    } catch (error) {
      console.error("Erreur transcription:", error)
      setIsProcessingAudio(false)
      alert("Erreur lors de la transcription audio")
    }
  }

  const fetchConversations = async () => {
    try {
      const userDataString = localStorage.getItem("userData")

      if (userDataString) {
        const userData = JSON.parse(userDataString)
        const userToken = userData.id

        if (userToken) {
          const response = await axios.get(`${config.apiUrl}/conversation/list/`, {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          })

          setConversations(response.data || [])
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations:", error)
      setIsLoading(false)
      setConversations([
        { id: "1", title: "Discussion sur la contraception", date: "2023-04-01" },
        { id: "2", title: "Questions sur la grossesse", date: "2023-04-02" },
        { id: "3", title: "Santé reproductive", date: "2023-04-03" },
      ])
    }
  }

  const handleCreateDiscussion = async () => {
    try {
      const userDataString = localStorage.getItem("userData")

      if (userDataString) {
        const userData = JSON.parse(userDataString)
        const userToken = userData.id

        if (userToken) {
          const responseConversation = await axios.post(
            `${config.apiUrl}/conversation/new/`,
            {},
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            },
          )

          const id_conversation = responseConversation.data.id_conversation
          setId_conversation(id_conversation)
          setDiscussionCreated(true)
          setCurrentTitle("")
          setResponses([])

          console.log("Discussion créée avec succès")
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création de la discussion:", error)
    }
  }

  const handleAskQuestion = async (textToSend = null) => {
    const questionText = textToSend || question
    if (questionText.trim()) {
      const languageInstruction = selectedLanguage === "FR" ? "Réponds en français: " : "Valiny amin'ny teny malagasy: "
      const questionWithLang = languageInstruction + questionText

      const newResponses = [{ type: "user", text: questionText, id: Date.now() }]
      setResponses((prevResponses) => [...prevResponses, ...newResponses])
      setQuestion("")

      setIsWaitingResponse(true)

      try {
        const userDataString = localStorage.getItem("userData")

        if (userDataString) {
          const userData = JSON.parse(userDataString)
          const userToken = userData.id

          if (userToken) {
            const responseMessage = await axios.post(
              `${config.apiUrl}/messagechat/new/`,
              { contenu: questionWithLang, conversation: id_conversation },
              {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                },
              },
            )

            const aiResponseId = Date.now().toString() + "1"
            const aiResponse = {
              type: "ai",
              text: responseMessage.data.bot_response,
              id: aiResponseId,
            }

            setResponses((prevResponses) => [...prevResponses, aiResponse])

            if (isCallMode) {
              setTimeout(() => {
                speakText(responseMessage.data.bot_response, aiResponseId)
              }, 1000)
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi de la question:", error)
        setResponses((prevResponses) => [
          ...prevResponses,
          {
            type: "ai",
            text:
              selectedLanguage === "FR"
                ? "Désolé, une erreur s'est produite. Veuillez réessayer."
                : "Miala tsiny, nisy olana. Andramo indray azafady.",
            id: Date.now().toString() + "error",
          },
        ])
      } finally {
        setIsWaitingResponse(false)
      }
    }
  }

  const handleSelectConversation = async (conversationId, title) => {
    setId_conversation(conversationId)
    setCurrentTitle(title || `Discussion ${conversationId}`)
    setMenuVisible(false)

    try {
      const userDataString = localStorage.getItem("userData")

      if (userDataString) {
        const userData = JSON.parse(userDataString)
        const userToken = userData.id

        if (userToken) {
          const response = await axios.get(`${config.apiUrl}/conversation/${conversationId}/messages/`, {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          })

          const formattedMessages = response.data.map((msg) => ({
            type: msg.is_bot ? "ai" : "user",
            text: msg.contenu,
            id: msg.id || Date.now().toString() + Math.random().toString(36).substring(7),
          }))

          setResponses(formattedMessages)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(selectedLanguage === "FR" ? "fr-FR" : "mg-MG")
  }

  const speakText = (text, messageId) => {
    if (isSpeaking) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      if (speakingMessageId === messageId) {
        setIsSpeaking(false)
        setSpeakingMessageId(null)
        return
      }
    }

    setIsSpeaking(true)
    setSpeakingMessageId(messageId)

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = selectedLanguage === "FR" ? "fr-FR" : "mg-MG"
      utterance.pitch = 1.0
      utterance.rate = 0.9

      utterance.onend = () => {
        setIsSpeaking(false)
        setSpeakingMessageId(null)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setSpeakingMessageId(null)
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAskQuestion()
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  return (
    <div className="discussion-safe-area">
      {menuVisible && <div className="discussion-overlay" onClick={toggleMenu}></div>}

      {menuVisible && (
        <div className="discussion-menu-container">
          <div className="discussion-menu-header">
            <h3 className="discussion-menu-title">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginRight: "8px" }}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {t("myDiscussions")}
            </h3>
            <button className="discussion-close-button" onClick={toggleMenu}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <button
            className="discussion-new-chat-button"
            onClick={() => {
              handleCreateDiscussion()
              toggleMenu()
            }}
          >
            <div className="discussion-new-chat-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span className="discussion-new-chat-text">{t("newDiscussion")}</span>
          </button>

          {isLoading ? (
            <div className="discussion-loading-container">
              <div className="discussion-loading-spinner"></div>
              <p className="discussion-loading-text">{t("loading")}</p>
            </div>
          ) : (
            <div className="discussion-conversations-list">
              {conversations.map((item) => (
                <button
                  key={item.id}
                  className="discussion-conversation-item"
                  onClick={() => handleSelectConversation(item.id, item.title)}
                >
                  <div className="discussion-conversation-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div className="discussion-conversation-details">
                    <p className="discussion-conversation-title">{item.title || `Discussion ${item.id}`}</p>
                    <p className="discussion-conversation-date">{formatDate(item.date)}</p>
                  </div>
                  <svg
                    className="discussion-conversation-arrow"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="discussion-container">
        <div className="discussion-header">
          <button className="discussion-menu-button" onClick={toggleMenu}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="discussion-title-container">
            <h1 className="discussion-title">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginRight: "8px" }}
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"></path>
              </svg>
              {t("title")}
            </h1>
            {isCallMode && (
              <div className="discussion-call-indicator">
                <div className="discussion-call-dot"></div>
                <span className="discussion-call-duration">{formatCallDuration(callDuration)}</span>
              </div>
            )}
          </div>

          <div className="discussion-header-actions">
            <button
              className={`discussion-call-button ${isCallMode ? "active" : ""}`}
              onClick={toggleCallMode}
              title={isCallMode ? t("stopCall") : t("startCall")}
            >
              {isCallMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l18 18M17.05 17.05A10 10 0 1 1 6.95 6.95"></path>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              )}
            </button>

            <button className="discussion-menstruation-button" onClick={() => navigate("/cycle")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>

            <button className="discussion-control-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            <div className="discussion-language-selector">
              <button
                className={`discussion-language-button ${selectedLanguage === "FR" ? "active" : ""}`}
                onClick={toggleLanguage}
              >
                FR
              </button>
              <button
                className={`discussion-language-button ${selectedLanguage === "MG" ? "active" : ""}`}
                onClick={toggleLanguage}
              >
                MG
              </button>
            </div>
          </div>
        </div>

        {isCallMode && (
          <div className="discussion-call-interface">
            <div className="discussion-call-avatar">
              <div className="discussion-avatar-container">
                <div className="discussion-avatar-image">🩺</div>
                <div className="discussion-audio-visualizer">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="discussion-audio-bar"
                      style={{
                        height: `${20 + audioLevel * 30 * (i % 3 === 0 ? 0.6 : i % 2 === 0 ? 1 : 0.8)}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <h3 className="discussion-call-title">{t("title")} Assistant</h3>
              <p className="discussion-call-status">{isRecording ? `🎤 ${t("speaking")}` : `👂 ${t("listening")}`}</p>
            </div>
          </div>
        )}

        {!isCallMode && responses.length === 0 ? (
          <div className="discussion-welcome-background">
            <div className="discussion-welcome-container">
              <div className="discussion-welcome-icon">
                <div className="discussion-welcome-avatar">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"></path>
                  </svg>
                </div>
                <div className="discussion-welcome-pulse"></div>
              </div>
              <h2 className="discussion-welcome-title">{t("welcomeTitle")}</h2>
              <p className="discussion-welcome-text">{t("welcomeText")}</p>
            </div>
          </div>
        ) : !isCallMode ? (
          <div className="discussion-chat-background">
            <div className="discussion-responses-list" ref={chatContainerRef}>
              {responses.map((item) => (
                <div
                  key={item.id || Math.random().toString()}
                  className={`discussion-message ${item.type === "user" ? "discussion-user-message" : "discussion-ai-message"}`}
                >
                  {item.type === "user" ? (
                    <div className="discussion-user-message-content">
                      <div className="discussion-message-avatar user">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="discussion-message-bubble user">
                        <p className="discussion-message-text">{item.text}</p>
                        <span className="discussion-message-time">
                          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="discussion-ai-message-content">
                      <div className="discussion-message-avatar ai">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"></path>
                        </svg>
                      </div>
                      <div className="discussion-message-bubble ai">
                        <p className="discussion-message-text">{item.text}</p>
                        <div className="discussion-message-actions">
                          <button
                            className={`discussion-audio-button ${speakingMessageId === item.id ? "active" : ""}`}
                            onClick={() => speakText(item.text, item.id)}
                            title={speakingMessageId === item.id ? t("stopReading") : t("readMessage")}
                          >
                            {speakingMessageId === item.id ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect x="6" y="4" width="4" height="16"></rect>
                                <rect x="14" y="4" width="4" height="16"></rect>
                              </svg>
                            ) : (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                              </svg>
                            )}
                          </button>
                          <span className="discussion-message-time">
                            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isWaitingResponse && (
                <div className="discussion-loading-response-container">
                  <div className="discussion-message-avatar ai">🩺</div>
                  <div className="discussion-typing-indicator">
                    <div className="discussion-typing-dots">
                      <div className="discussion-typing-dot"></div>
                      <div className="discussion-typing-dot"></div>
                      <div className="discussion-typing-dot"></div>
                    </div>
                    <span className="discussion-typing-text">{t("typing")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="discussion-input-container">
          <div className="discussion-input-wrapper">
            {!isCallMode && (
              <textarea
                className="discussion-input"
                placeholder={t("inputPlaceholder")}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                rows="1"
              />
            )}

            <div className="discussion-voice-controls">
              {isProcessingAudio ? (
                <div className="discussion-processing-audio">
                  <div className="discussion-processing-spinner"></div>
                  <span className="discussion-processing-text">{t("processing")}</span>
                </div>
              ) : (
                <button
                  className={`discussion-mic-button ${isRecording ? "recording" : ""} ${isCallMode ? "call-mode" : ""}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  title={isRecording ? t("stopRecording") : t("startRecording")}
                >
                  <div className="discussion-mic-icon">
                    {isRecording ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                    )}
                  </div>

                  {isRecording && (
                    <div className="discussion-recording-animation">
                      <div className="discussion-recording-pulse"></div>
                      <div className="discussion-recording-wave">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="discussion-wave-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              )}
            </div>

            {!isCallMode && (
              <button
                className={`discussion-send-button ${!question.trim() || isWaitingResponse ? "disabled" : ""}`}
                onClick={() => handleAskQuestion()}
                disabled={!question.trim() || isWaitingResponse}
                title={t("sendMessage")}
              >
                {isWaitingResponse ? (
                  <div className="discussion-send-spinner"></div>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9"></polygon>
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
