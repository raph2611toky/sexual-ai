"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config"
import PricingPlans from "./PricingPlans"
import PaymentModal from "./PaymentModal"
import ToastContainer from "./ToastContainer"
import "./DiscussionScreen.css"

export default function DiscussionScreen() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState("") // Pour le mode non-appel
  const [callQuestion, setCallQuestion] = useState("") // Pour le mode appel
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
  const [silenceStart, setSilenceStart] = useState(null)
  const [theme, setTheme] = useState("light")
  const [profile, setProfile] = useState({ name: "Utilisateur", profile_url: null })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [toasts, setToasts] = useState([])

  const chatContainerRef = useRef()
  const mediaRecorderRef = useRef()
  const audioChunksRef = useRef([])
  const callTimerRef = useRef()
  const audioContextRef = useRef()
  const analyserRef = useRef()
  const recognitionRef = useRef()
  const silenceTimerRef = useRef()

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  const addToast = (message, type = 'error', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    const savedLanguage = localStorage.getItem("language") || "fr"
    setTheme(savedTheme)
    setSelectedLanguage(savedLanguage === "fr" ? "FR" : "MG")
    document.documentElement.setAttribute("data-theme", savedTheme)

    const token = getCookie('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProfile();

    if (!discussionCreated) {
      handleCreateDiscussion()
    }

    initializeSpeechRecognition();

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [discussionCreated, navigate])

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      console.log(`Speech recognition activated...`)
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage === "FR" ? "fr-FR" : "mg-MG";
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        if (isCallMode) {
          setCallQuestion(transcript);
          console.log(`Set call question to ${transcript}`)
        } else {
          setQuestion(transcript);
          console.log(`Set question to ${transcript}`)
        }
        if (event.results[event.results.length - 1].isFinal && isCallMode) {
          setSilenceStart(null);
        }
      };
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        addToast(
          selectedLanguage === "FR"
            ? "Erreur de reconnaissance vocale : " + event.error
            : "Fahadisoana amin'ny fahafantarana feo: " + event.error,
          "error"
        );
        setIsRecording(false);
        setIsProcessingAudio(false);
      };
      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current.start();
        }
      };
    } else {
      addToast(
        selectedLanguage === "FR"
          ? "Reconnaissance vocale non prise en charge."
          : "Fahafantarana feo tsy tohana.",
        "warning"
      );
    }
  }

  const fetchProfile = async () => {
    try {
      const token = getCookie("auth_token")
      if (token) {
        const response = await axios.get(`${config.apiUrl}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setProfile({
          name: response.data.name || "Utilisateur",
          profile_url: response.data.profile_url || null,
        })
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error)
      addToast(
        selectedLanguage === "FR"
          ? "Erreur lors de la récupération du profil"
          : "Fahadisoana tamin'ny fakana ny mombamomba",
        "error"
      )
      setProfile({ name: "Utilisateur", profile_url: null })
    }
  }

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

  useEffect(() => {
    if (isCallMode && isRecording && callQuestion.trim()) {
      if (audioLevel < 0.1) {
        if (!silenceStart) {
          setSilenceStart(Date.now());
        } else if (Date.now() - silenceStart >= 3000) {
          handleAskQuestion(callQuestion);
          setCallQuestion("");
          setSilenceStart(null);
        }
      } else {
        setSilenceStart(null);
      }
    } else {
      setSilenceStart(null);
    }
  }, [audioLevel, isCallMode, isRecording, callQuestion])

  const translations = {
    FR: {
      title: "Sexual AI",
      newDiscussion: "Nouvelle discussion",
      myDiscussions: "Mes Discussions",
      loading: "Chargement...",
      welcomeTitle: "Assistant Santé Reproductive",
      welcomeText:
        "Posez vos questions sur la santé reproductive en toute confidentialité.",
      inputPlaceholder: "Tapez votre question ici...",
      callInputPlaceholder: "Votre texte vocal apparaît ici...",
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
      online: "En ligne",
      callActive: "Appel en cours",
      aiAssistant: "Assistant IA",
      settings: "Paramètres",
      subscriptions: "Abonnements",
      logout: "Déconnexion",
      micError: "Impossible d'accéder au microphone",
      transcriptionError: "Erreur lors de la transcription audio",
    },
    MG: {
      title: "Sexual AI",
      newDiscussion: "Resaka vaovao",
      myDiscussions: "Ny Resakako",
      loading: "Mamaky...",
      welcomeTitle: "Mpanampy Fahasalamana",
      welcomeText: "Apetraho ny fanontanianao momba ny fahasalamana ara-piterahana.",
      inputPlaceholder: "Soraty eto ny fanontanianao...",
      callInputPlaceholder: "Ny lahatsoratrao amin'ny feo dia miseho eto...",
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
      online: "Eo ambony",
      callActive: "Misy antso",
      aiAssistant: "Mpanampy IA",
      settings: "Fandrindrana",
      subscriptions: "Famandrihana",
      logout: "Mivoaka",
      micError: "Tsy afaka miditra amin'ny mikrô",
      transcriptionError: "Fahadisoana tamin'ny fandikana feo",
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
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang === "FR" ? "fr-FR" : "mg-MG";
    }
  }

  const toggleCallMode = () => {
    console.log(`Call mode is now : ${isCallMode}`)
    setIsCallMode(!isCallMode)
    console.log(`Call mode is now : ${isCallMode}`)
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

      startRecording()
    } catch (error) {
      console.error("Erreur accès microphone:", error)
      addToast(t("micError"), "error")
      setIsCallMode(!isCallMode)
    }
  }

  const stopCallMode = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setAudioLevel(0)
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
    setCallQuestion("")
  }

  const startRecording = async () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsRecording(true)
        setIsProcessingAudio(true)
      } else {
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
        setIsProcessingAudio(true)
      }
    } catch (error) {
      console.error("Erreur enregistrement:", error)
      addToast(t("micError"), "error")
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      setIsProcessingAudio(false)
    } else if (mediaRecorderRef.current && isRecording) {
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
          ? "Bonjour, j'aimerais des infos sur la contraception."
          : "Salama, te-hiangavy fampahalalana momba ny fisorohana vohoka."
      if (isCallMode) {
        setCallQuestion(transcribedText)
      } else {
        setQuestion(transcribedText)
      }
      setIsProcessingAudio(false)
    } catch (error) {
      console.error("Erreur transcription:", error)
      addToast(t("transcriptionError"), "error")
      setIsProcessingAudio(false)
    }
  }

  const fetchConversations = async () => {
    try {
      const token = getCookie("auth_token")
      if (token) {
        const response = await axios.get(`${config.apiUrl}/conversation/list/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setConversations(response.data || [])
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations:", error)
      addToast(
        selectedLanguage === "FR"
          ? "Erreur lors de la récupération des conversations"
          : "Fahadisoana tamin'ny fakana ny resaka",
        "error"
      )
      setIsLoading(false)
    }
  }

  const handleCreateDiscussion = async () => {
    try {
      const token = getCookie("auth_token")
      if (token) {
        const responseConversation = await axios.post(
          `${config.apiUrl}/conversation/new/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        )

        const id_conversation = responseConversation.data.id_conversation
        setId_conversation(id_conversation)
        setDiscussionCreated(true)
        setCurrentTitle("")
        setResponses([])
      }
    } catch (error) {
      console.error("Erreur lors de la création de la discussion:", error)
      addToast(
        selectedLanguage === "FR"
          ? "Erreur lors de la création de la discussion"
          : "Fahadisoana tamin'ny famoronana resaka",
        "error"
      )
    }
  }

  const handleAskQuestion = async (textToSend = null) => {
    const questionText = textToSend || (isCallMode ? callQuestion : question)
    if (questionText.trim()) {
      const languageInstruction = selectedLanguage === "FR" ? "Réponds en français: " : "Valiny amin'ny teny malagasy: "
      const questionWithLang = languageInstruction + questionText

      const newResponses = [{ type: "user", text: questionText, id: Date.now(), timestamp: new Date() }]
      setResponses((prevResponses) => [...prevResponses, ...newResponses])
      if (isCallMode) {
        setCallQuestion("")
      } else {
        setQuestion("")
      }
      setIsWaitingResponse(true)

      try {
        const token = getCookie("auth_token")
        if (token) {
          const responseMessage = await axios.post(
            `${config.apiUrl}/messagechat/new/`,
            { contenu: questionWithLang, conversation: id_conversation },
            { headers: { Authorization: `Bearer ${token}` } },
          )

          const aiResponseId = Date.now().toString() + "1"
          const aiResponse = {
            type: "ai",
            text: responseMessage.data.bot_response,
            id: aiResponseId,
            timestamp: new Date()
          }

          setResponses((prevResponses) => [...prevResponses, aiResponse])

          if (isCallMode) {
            setTimeout(() => {
              speakText(responseMessage.data.bot_response, aiResponseId)
            }, 1000)
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
                ? "Désolé, une erreur s'est produite."
                : "Miala tsiny, nisy olana.",
            id: Date.now().toString() + "error",
            timestamp: new Date()
          },
        ])
        addToast(
          selectedLanguage === "FR"
            ? "Erreur lors de l'envoi de la question"
            : "Fahadisoana tamin'ny fandefasana fanontaniana",
          "error"
        )
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
      const token = getCookie("auth_token")
      if (token) {
        const response = await axios.get(`${config.apiUrl}/conversation/${conversationId}/details/`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const formattedMessages = response.data.messages.map((msg) => ({
          type: msg.from_user ? "ai" : "user",
          text: msg.contenu,
          id: msg.id || Date.now().toString() + Math.random().toString(36).substring(7),
          timestamp: new Date(msg.created_at)
        }))

        setResponses(formattedMessages)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error)
      addToast(
        selectedLanguage === "FR"
          ? "Erreur lors de la récupération des messages"
          : "Fahadisoana tamin'ny fakana ny hafatra",
        "error"
      )
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(selectedLanguage === "FR" ? "fr-FR" : "mg-MG")
  }

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const speakText = (text, messageId) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
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
        addToast(
          selectedLanguage === "FR"
            ? "Erreur lors de la lecture du texte"
            : "Fahadisoana tamin'ny famakiana ny lahatsoratra",
          "error"
        )
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

  const toggleThemeHandler = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  const handleLogout = () => {
    localStorage.clear()
    document.cookie = "auth_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;"
    navigate("/login")
  }

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan)
    setShowPricing(false)
  }

  const handleShowPlan = ()=> {
    navigate("/pricing")
  }

  return (
    <div className="discussion-safe-area">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      {menuVisible && <div className="discussion-overlay" onClick={toggleMenu}></div>}
      {/* {showPricing && <PricingPlans language={selectedLanguage} theme={theme} onClose={() => setShowPricing(false)} onSelectPlan={handleSelectPlan} />} */}
      {selectedPlan && <PaymentModal plan={selectedPlan} language={selectedLanguage} theme={theme} onClose={() => setSelectedPlan(null)} planDetails={translations[selectedLanguage].plans ? translations[selectedLanguage].plans[selectedPlan] : {}} />}

      {menuVisible && (
        <div className="discussion-menu-container">
          <div className="discussion-menu-header">
            <h3 className="discussion-menu-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

          <div className="discussion-menu-content">
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
                    key={item.id_conversation}
                    className="discussion-conversation-item"
                    onClick={() => handleSelectConversation(item.id_conversation, item.titre)}
                  >
                    <div className="discussion-conversation-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <div className="discussion-conversation-details">
                      <p className="discussion-conversation-title">{item.titre}</p>
                      <p className="discussion-conversation-date">{formatDate(item.created_at)}</p>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"></path>
              </svg>
              {t("title")}
            </h1>
            {isCallMode && (
              <div className="discussion-call-indicator">
                <div className="discussion-call-dot"></div>
                <span className="discussion-call-duration">{formatCallDuration(callDuration)}</span>
              </div>
            )}
            {!isCallMode && (
              <div className="discussion-status-indicator">
                <div className="discussion-online-dot"></div>
                <span className="discussion-status-text">{t("online")}</span>
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

            <div className="discussion-language-selector">
              <button
                className={`discussion-language-button ${selectedLanguage === "FR" ? "active" : ""}`}
                onClick={() => setSelectedLanguage("FR")}
              >
                FR
              </button>
              <button
                className={`discussion-language-button ${selectedLanguage === "MG" ? "active" : ""}`}
                onClick={() => setSelectedLanguage("MG")}
              >
                MG
              </button>
            </div>

            <div className="discussion-header-profile">
              <button className="discussion-profile-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <div className="discussion-header-profile-avatar">
                  {profile.profile_url ? (
                    <img
                      src={profile.profile_url}
                      alt="Profile"
                      className="discussion-profile-image"
                      onError={() => setProfile((prev) => ({ ...prev, profile_url: null }))}
                    />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                </div>
                <div className="discussion-profile-active-dot"></div>
              </button>
              {isDropdownOpen && (
                <div className="discussion-profile-dropdown">
                  <button onClick={toggleThemeHandler}>
                    {theme === "light" ? "🌙 Mode sombre" : "☀️ Mode clair"}
                  </button>
                  <button onClick={handleShowPlan}>
                    {t("subscriptions")}
                  </button>
                  <button onClick={handleLogout}>
                    {t("logout")}
                  </button>
                </div>
              )}
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
              <h3 className="discussion-call-title">{t("aiAssistant")}</h3>
              <p className="discussion-call-status">{isRecording ? `🎤 ${t("speaking")}` : `👂 ${t("listening")}`}</p>
            </div>
            <div className="discussion-call-input-container">
              <textarea
                className="discussion-call-input"
                placeholder={t("callInputPlaceholder")}
                value={callQuestion}
                readOnly
                rows="1"
              />
            </div>
          </div>
        )}

        {!isCallMode && responses.length === 0 ? (
          <div className="discussion-welcome-background">
            <div className="discussion-welcome-container">
              <div className="discussion-welcome-icon">
                <div className="discussion-welcome-avatar">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"></path>
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
                      <div className="discussion-message-bubble user">
                        <p className="discussion-message-text">{item.text}</p>
                      </div>
                      <div className="discussion-message-avatar user">
                        {profile.profile_url ? (
                          <img
                            src={profile.profile_url}
                            alt="User profile"
                            className="discussion-profile-image"
                            onError={() => setProfile((prev) => ({ ...prev, profile_url: null }))}
                          />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="discussion-ai-message-content">
                      <div className="discussion-message-avatar ai">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                          <circle cx="12" cy="5" r="2"></circle>
                          <path d="M12 7v4"></path>
                          <line x1="8" y1="16" x2="8" y2="16"></line>
                          <line x1="16" y1="16" x2="16" y2="16"></line>
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
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="6" y="4" width="4" height="16"></rect>
                                <rect x="14" y="4" width="4" height="16"></rect>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="discussion-message-timestamp">
                    {formatMessageTime(item.timestamp)}
                  </div>
                </div>
              ))}

              {isWaitingResponse && (
                <div className="discussion-loading-response-container">
                  <div className="discussion-message-avatar ai">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                      <circle cx="12" cy="5" r="2"></circle>
                      <path d="M12 7v4"></path>
                      <line x1="8" y1="16" x2="8" y2="16"></line>
                      <line x1="16" y1="16" x2="16" y2="16"></line>
                    </svg>
                  </div>
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
              <button
                className={`discussion-mic-button ${isRecording ? "recording" : ""}`}
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? t("stopRecording") : t("startRecording")}
              >
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
              </button>
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