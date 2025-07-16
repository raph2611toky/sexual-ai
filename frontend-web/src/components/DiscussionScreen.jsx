"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Menu,
  Phone,
  PhoneOff,
  User,
  Settings,
  Moon,
  Sun,
  Globe,
  Heart,
  LogIn,
  LogOut,
  Shield,
  FileText,
  Mic,
  MicOff,
  Send,
  Volume2,
  Pause,
  Bot,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react"
import axios from "axios"
import config from "../config"
import ToastContainer from "./ToastContainer"
import AuthChoice from "./AuthChoice"
import Sidebar from "./Sidebar"
import "./DiscussionScreen.css"
import "../styles/variables.css"

export default function DiscussionScreen() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState("")
  const [callQuestion, setCallQuestion] = useState("")
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
  const [profile, setProfile] = useState({ name: "Utilisateur", profile_url: null })
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [isRecognitionActive, setIsRecognitionActive] = useState(false)
  const [welcomeMessageRead, setWelcomeMessageRead] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuthChoice, setShowAuthChoice] = useState(false)
  const [transcript, setTranscript] = useState("")

  const chatContainerRef = useRef()
  const mediaRecorderRef = useRef()
  const audioChunksRef = useRef([])
  const callTimerRef = useRef()
  const audioContextRef = useRef()
  const analyserRef = useRef()
  const recognitionRef = useRef()
  const callModeRef = useRef(isCallMode)
  const isAISpeakingRef = useRef(isAISpeaking)
  const isRecognitionActiveRef = useRef(isRecognitionActive)
  const currentTranscriptRef = useRef("")

  useEffect(() => {
    callModeRef.current = isCallMode
  }, [isCallMode])

  useEffect(() => {
    isAISpeakingRef.current = isAISpeaking
  }, [isAISpeaking])

  useEffect(() => {
    isRecognitionActiveRef.current = isRecognitionActive
  }, [isRecognitionActive])

  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
    return null
  }

  const addToast = (message, type = "error", duration = 3000) => {
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

    const token = getCookie("auth_token")
    if (token) {
      setIsLoggedIn(true)
      fetchProfile(token)
      fetchConversations(token)
    } else {
      setIsLoggedIn(false)
    }

    if (!discussionCreated) {
      handleCreateDiscussion()
    }

    initializeSpeechRecognition()

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [discussionCreated])

  const textareaRef = useRef(null)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }
  }, [question])

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      addToast(
        selectedLanguage === "FR"
          ? "Reconnaissance vocale non prise en charge."
          : "Fahafantarana feo tsy tohana.",
        "warning"
      )
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = selectedLanguage === "FR" ? "fr-FR" : "mg-MG"

    let silenceTimer = null

    recognition.onresult = (event) => {
      if (isAISpeakingRef.current) return

      clearTimeout(silenceTimer)

      const textFragment = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("")

      setTranscript((prev) => {
        const updated = prev + textFragment
        currentTranscriptRef.current = textFragment
        return textFragment
      })

      if (callModeRef.current) {
        setCallQuestion(currentTranscriptRef.current)
      } else {
        setQuestion(currentTranscriptRef.current)
      }

      if (callModeRef.current) {
        silenceTimer = setTimeout(() => {
          if (currentTranscriptRef.current.trim() !== "" && !isAISpeakingRef.current) {
            console.log("Silence de 3s détecté → envoi :", currentTranscriptRef.current)
            handleAskQuestion(currentTranscriptRef.current)
            setTranscript("")
            currentTranscriptRef.current = ""
            setCallQuestion("")
          }
        }, 3000)
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      
      setIsRecognitionActive(false)
      if (event.error === "no-speech" && callModeRef.current) {
        silenceTimer = setTimeout(() => {
          if (currentTranscriptRef.current.trim() !== "" && !isAISpeakingRef.current) {
            console.log("Silence de 3s détecté (no-speech) → envoi :", currentTranscriptRef.current)
            handleAskQuestion(currentTranscriptRef.current)
            setTranscript("")
            currentTranscriptRef.current = ""
            setCallQuestion("")
          }
        }, 3000)
      }
    }

    recognition.onend = () => {
      console.log("SpeechRecognition ended…")
      setIsRecognitionActive(false)
      if (callModeRef.current && isRecording && !isAISpeakingRef.current) {
        setTimeout(() => {
          if (!isRecognitionActiveRef.current) {
            try {
              recognition.start()
              setIsRecognitionActive(true)
              setIsRecording(true)
              isRecognitionActiveRef.current = true
            } catch (error) {
            }
          } else {
            console.log("Reconnaissance déjà active, pas de redémarrage nécessaire.")
          }
        }, 900)
      }
    }

    recognitionRef.current = recognition
  }

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${config.apiUrl}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProfile({
        name: response.data.name || "Utilisateur",
        profile_url: response.data.profile_url || null,
      })
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error)
      setProfile({ name: "Utilisateur", profile_url: null })
    }
  }

  useEffect(() => {
    if (chatContainerRef.current && responses.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeightproduk
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
      welcomeTitle: "Assistant Santé Reproductive",
      welcomeText: "Posez vos questions sur la santé reproductive en toute confidentialité.",
      inputPlaceholder: "Tapez votre question ici...",
      callInputPlaceholder: "Votre texte vocal apparaît ici...",
      processing: "Traitement...",
      typing: "En train d'écrire...",
      speaking: "Vous parlez...",
      listening: "À l'écoute...",
      aiSpeaking: "IA en train de parler...",
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
      donation: "Faire un don",
      logout: "Déconnexion",
      micOff: "Microphone désactivé",
      transcriptionError: "Erreur lors de la transcription audio",
      home: "Accueil",
      login: "Se connecter",
      privacyPolicy: "Politique de confidentialité",
      termsOfService: "Conditions d'utilisation",
      profile: "Profil",
      mute: "Muet",
      speaker: "Haut-parleur",
      darkMode: "Mode sombre",
      lightMode: "Mode clair",
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
      aiSpeaking: "IA miteny...",
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
      donation: "Fanomezana",
      logout: "Mivoaka",
      micOff: "Mikrô tapaka",
      transcriptionError: "Fahadisoana tamin'ny fandikana feo",
      home: "Fandraisana",
      login: "Hiditra",
      privacyPolicy: "Politikan'ny tsiambaratelo",
      termsOfService: "Fepetra fampiasana",
      profile: "Mombamomba",
      mute: "Moana",
      speaker: "Fanamafisam-peo",
      darkMode: "Maizina",
      lightMode: "Mazava"
    }
  }
  const t = (key) => translations[selectedLanguage][key] || key

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleMenu = () => {
    setMenuVisible((prev) => !prev)
    if (!menuVisible && isLoggedIn) {
      fetchConversations()
    }
  }

  const toggleLanguage = () => {
    const newLang = selectedLanguage === "FR" ? "MG" : "FR"
    setSelectedLanguage(newLang)
    localStorage.setItem("language", newLang === "FR" ? "fr" : "mg")
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang === "FR" ? "fr-FR" : "mg-MG"
    }
  }

  useEffect(() => {
    if (isCallMode) {
      console.log("Start call mode…")
      startCallMode()
    } else {
      console.log("Stop call mode…")
      stopCallMode()
    }
  }, [isCallMode])

  const toggleCallMode = () => {
    setIsCallMode((prev) => !prev)
  }

  const startCallMode = async () => {
    console.log("Start call mode...")
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
        if (callModeRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average / 255)
          requestAnimationFrame(updateAudioLevel)
        }
      }
      updateAudioLevel()

      if (!welcomeMessageRead) {
        const welcomePhrases = [
          {
            FR: "Bonjour, je suis votre assistant en santé sexuelle. Comment puis-je vous accompagner aujourd’hui ?",
            MG: "Miarahaba, mpanampy anao amin’ny fahasalamana ara-nofo aho. Ahoana no ahafahako manohana anao androany ?",
          },
          {
            FR: "Bienvenue ! Parlons de votre bien-être intime en toute confiance.",
            MG: "Tongasoa ! Andeha hiresaka momba ny fahasalamana ara-nofo am-pahatokiana.",
          },
          {
            FR: "Bonjour, prêt·e à aborder votre santé sexuelle de manière sereine et informée ?",
            MG: "Miarahaba, vonona hijery ny fahasalamana ara-nofo am-pilaminana sy am-pahalalana ve ianao ?",
          },
          {
            FR: "Salut, je suis là pour répondre à toutes vos questions sur la santé sexuelle, sans jugement.",
            MG: "Salama, eto aho hamaly ny fanontanianao rehetra momba ny fahasalamana ara-nofo, tsy misy fitsaratsaram-poana.",
          },
          {
            FR: "Bienvenue, discutons de votre santé sexuelle avec bienveillance.",
            MG: "Tongasoa, andeha hiresaka momba ny fahasalamana ara-nofo am-pitiavana sy matihanina.",
          },
        ]
        const randomIndex = Math.floor(Math.random() * welcomePhrases.length)
        const { FR, MG } = welcomePhrases[randomIndex]
        const welcomeText = selectedLanguage === "FR" ? FR : MG
        await speakText(welcomeText, "welcome")
        setWelcomeMessageRead(true)
      }
      if (!isRecognitionActive) {
        startRecording()
      }
    } catch (error) {
      console.error("Erreur accès microphone:", error)
      setIsCallMode(false)
    }
  }

  const stopCallMode = () => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setSpeakingMessageId(null)
      setIsAISpeaking(false)
    }
    if (isRecognitionActive) {
      stopRecording()
    }
    setAudioLevel(0)
    setCallQuestion("")
    setTranscript("")
    currentTranscriptRef.current = ""
    setIsAISpeaking(false)
    setWelcomeMessageRead(false)
    setIsRecording(false)
    setIsRecognitionActive(false)
  }

  const startRecording = () => {
    console.log("Attempting to start recording...")
    if (recognitionRef.current && !isRecognitionActiveRef.current && !isAISpeakingRef.current) {
      try {
        recognitionRef.current.start()
        setIsRecognitionActive(true)
        setIsRecording(true)
        console.log("Recording started.")
      } catch (error) {
        addToast(selectedLanguage === "FR" ? "Micro éteint" : "Mikrô maty", "error")
        setIsRecognitionActive(false)
        setIsRecording(false)
      }
    }
  }

  const stopRecording = () => {
    console.log("Attempting to stop recording...")
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      recognitionRef.current.stop()
      console.log("Recording stopped.")
    }
  }

  const fetchConversations = async (token) => {
    if (!isLoggedIn) return
    try {
      const response = await axios.get(`${config.apiUrl}/conversation/list/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setConversations(response.data || [])
      setIsLoading(false)
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations:", error)
      setIsLoading(false)
    }
  }

  const handleCreateDiscussion = async () => {
    try {
      const token = getCookie("auth_token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const responseConversation = await axios.post(`${config.apiUrl}/conversation/new/`, {}, { headers })
      const id_conversation = responseConversation.data.id_conversation
      setId_conversation(id_conversation)
      setDiscussionCreated(true)
      setCurrentTitle("")
      setResponses([])
    } catch (error) {
    }
  }

  const handleAskQuestion = async (textToSend = null) => {
    const questionText = textToSend || (callModeRef.current ? callQuestion : question)
    if (questionText.trim()) {
      const languageInstruction = selectedLanguage === "FR" ? "Réponds en français: " : "Valiny amin'ny teny malagasy: "
      const questionWithLang = languageInstruction + questionText
      const newResponses = [{ type: "user", text: questionText, id: Date.now(), timestamp: new Date() }]
      setResponses((prevResponses) => [...prevResponses, ...newResponses])
      if (callModeRef.current) {
        setCallQuestion("")
        setTranscript("")
        currentTranscriptRef.current = ""
      } else {
        setQuestion("")
        setTranscript("")
        currentTranscriptRef.current = ""
      }
      setIsWaitingResponse(true)
      try {
        const token = getCookie("auth_token")
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const responseMessage = await axios.post(
          `${config.apiUrl}/messagechat/new/`,
          { contenu: questionWithLang, conversation: id_conversation },
          { headers }
        )
        const aiResponseId = Date.now().toString() + "1"
        const aiResponse = {
          type: "ai",
          text: responseMessage.data.bot_response,
          id: aiResponseId,
          timestamp: new Date(),
          liked: false,
          disliked: false,
        }
        setResponses((prevResponses) => [...prevResponses, aiResponse])
        if (callModeRef.current) {
          setTimeout(() => {
            if (!isSpeaking) speakText(responseMessage.data.bot_response, aiResponseId)
          }, 1000)
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi de la question:", error)
        setResponses((prevResponses) => [
          ...prevResponses,
          {
            type: "ai",
            text: selectedLanguage === "FR" ? "Désolé, une erreur s'est produite." : "Miala tsiny, nisy olana.",
            id: Date.now().toString() + "error",
            timestamp: new Date(),
            liked: false,
            disliked: false,
          },
        ])
      } finally {
        setIsWaitingResponse(false)
      }
    }
  }

  const handleSelectConversation = async (conversationId, title) => {
    if (!isLoggedIn) return
    setId_conversation(conversationId)
    setCurrentTitle(title || `Discussion ${conversationId}`)
    setMenuVisible(false)
    try {
      const token = getCookie("auth_token")
      const response = await axios.get(`${config.apiUrl}/conversation/${conversationId}/details/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const formattedMessages = response.data.messages.map((msg) => ({
        type: msg.from_user ? "user" : "ai",
        text: msg.contenu,
        id: msg.id || Date.now().toString() + Math.random().toString(36).substring(7),
        timestamp: new Date(msg.created_at),
        liked: false,
        disliked: false,
      }))
      setResponses(formattedMessages)
    } catch (error) {
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
    return new Promise((resolve, reject) => {
      if (isSpeaking && speakingMessageId === messageId) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
        setSpeakingMessageId(null)
        setIsAISpeaking(false)
        resolve()
        setTimeout(() => {
          if (callModeRef.current) {
            setTranscript("")
            currentTranscriptRef.current = ""
            setCallQuestion("")
            forceStartRecording()
          }
        }, 500)
        return
      }
      if (isSpeaking) {
        window.speechSynthesis.cancel()
      }
      setIsSpeaking(true)
      setSpeakingMessageId(messageId)
      setIsAISpeaking(true)
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = selectedLanguage === "FR" ? "fr-FR" : "mg-MG"
        utterance.pitch = 1.0
        utterance.rate = 0.9
        utterance.onend = () => {
          setIsSpeaking(false)
          setSpeakingMessageId(null)
          setIsAISpeaking(false)
          resolve()
          setTimeout(() => {
            if (callModeRef.current) {
              setTranscript("")
              currentTranscriptRef.current = ""
              setCallQuestion("")
              forceStartRecording()
            }
          }, 500)
        }
        utterance.onerror = (error) => {
          setIsSpeaking(false)
          setSpeakingMessageId(null)
          setIsAISpeaking(false)
          reject(error)
          setTimeout(() => {
            if (callModeRef.current) {
              setTranscript("")
              currentTranscriptRef.current = ""
              setCallQuestion("")
              forceStartRecording()
            }
          }, 500)
        }
        window.speechSynthesis.speak(utterance)
      } else {
        reject(new Error("Speech synthesis not supported"))
      }
    })
  }

  const forceStartRecording = () => {
    if (recognitionRef.current) {
      const restartRecognition = () => {
        setTimeout(() => {
          try {
            if (!isRecognitionActiveRef.current) {
              recognitionRef.current.start()
              setIsRecognitionActive(true)
              setIsRecording(true)
            }
          } catch (error) {
            setIsRecognitionActive(false)
            setIsRecording(false)
          }
        }, 900)
      }
      if (isRecognitionActiveRef.current) {
        recognitionRef.current.stop()
        setIsRecognitionActive(false)
        setIsRecording(false)
        restartRecognition()
      } else {
        restartRecognition()
      }
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
    setIsLoggedIn(false)
    localStorage.clear()
    document.cookie = "auth_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;"
    setResponses([])
    setId_conversation(null)
    setConversations([])
    setShowAuthChoice(true)
  }

  const handleDonation = () => {
    navigate("/donation")
    console.log("Navigate to donation")
  }

  const handleLogin = () => {
    navigate("/login")
    console.log("Navigate to login")
  }

  const handleSignup = () => {
    navigate("/signup")
    console.log("Navigate to signup")
  }

  const handleStayDisconnected = async () => {
    setShowAuthChoice(false)
    if (!discussionCreated) {
      handleCreateDiscussion()
    }
  }

  const handleMenstrualOption = (option) => {
    if (option === "redirect") {
      navigate("/cycle")
    }
    console.log("Menstrual option selected:", option)
  }

  const handleLike = (id) => {
    setResponses((prevResponses) =>
      prevResponses.map((msg) =>
        msg.id === id ? { ...msg, liked: !msg.liked, disliked: false } : msg
      )
    )
  }

  const handleDislike = (id) => {
    setResponses((prevResponses) =>
      prevResponses.map((msg) =>
        msg.id === id ? { ...msg, disliked: !msg.disliked, liked: false } : msg
      )
    )
  }

  const handleRegenerate = (id) => {
    const userMessage = responses.find((msg) => msg.type === "user" && msg.id < id)
    if (userMessage) {
      handleAskQuestion(userMessage.text)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".discussion-header-profile")) {
        setIsProfileDropdownOpen(false)
      }
      if (!event.target.closest(".discussion-settings-menu")) {
        setIsSettingsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="discussion-safe-area">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <Sidebar
        isOpen={menuVisible}
        onClose={toggleMenu}
        conversations={conversations}
        onNewChat={handleCreateDiscussion}
        onSelectConversation={handleSelectConversation}
        currentConversationId={id_conversation}
        onStartCall={toggleCallMode}
        onMenstrualOption={handleMenstrualOption}
        language={selectedLanguage}
      />

      <div className="discussion-container">
        <div className="discussion-header">
          <div className="discussion-title-container">
            <h1 className="discussion-title">SEXUAL AI</h1>
            {callModeRef.current && (
              <div className="discussion-call-indicator">
                <div className="discussion-call-dot"></div>
                <span className="discussion-call-duration">{formatCallDuration(callDuration)}</span>
              </div>
            )}
          </div>
          <div className="discussion-header-actions">
            <div className="discussion-header-profile">
              <button
                className="discussion-profile-btn"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className="discussion-header-profile-avatar">
                  {isLoggedIn && profile.profile_url ? (
                    <img
                      src={profile.profile_url || "/placeholder.svg"}
                      alt="Profile"
                      className="discussion-profile-image"
                      onError={() => setProfile((prev) => ({ ...prev, profile_url: null }))}
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                {isLoggedIn && <div className="discussion-profile-active-dot"></div>}
              </button>

              {isProfileDropdownOpen && (
                <div className="discussion-profile-dropdown">
                  {!isLoggedIn ? (
                    <>
                      <button onClick={() => setShowAuthChoice(true)}>
                        <LogIn size={16} />
                        {t("login")}
                      </button>
                      <button onClick={() => navigate("/privacy-policy")}>
                        <Shield size={16} />
                        {t("privacyPolicy")}
                      </button>
                      <button onClick={() => navigate("/terms-of-service")}>
                        <FileText size={16} />
                        {t("termsOfService")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => navigate("/profile")}>
                        <User size={16} />
                        {t("profile")}
                      </button>
                      <button onClick={() => navigate("/privacy-policy")}>
                        <Shield size={16} />
                        {t("privacyPolicy")}
                      </button>
                      <button onClick={() => navigate("/terms-of-service")}>
                        <FileText size={16} />
                        {t("termsOfService")}
                      </button>
                      <button onClick={handleLogout}>
                        <LogOut size={16} />
                        {t("logout")}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="discussion-settings-menu">
              <button
                className="discussion-settings-button"
                onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
              >
                <Settings size={18} />
              </button>

              {isSettingsDropdownOpen && (
                <div className="discussion-settings-dropdown">
                  <button onClick={toggleThemeHandler}>
                    {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                    {theme === "light" ? t("darkMode") : t("lightMode")}
                  </button>
                  <button onClick={toggleLanguage}>
                    <Globe size={16} />
                    {selectedLanguage === "FR" ? "MG" : "FR"}
                  </button>
                  <button onClick={handleDonation}>
                    <Heart size={16} />
                    {t("donation")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {callModeRef.current && (
          <div className="discussion-call-interface">
            <div className="discussion-call-main">
              <div className="discussion-call-avatar-section">
                <div className="discussion-call-avatar-container">
                  <div className="discussion-call-avatar-image">
                    <Bot className="discussion-avatar-icon" size={48} />
                  </div>

                  {isRecording && (
                    <div className="discussion-call-listening-indicator">
                      <div className="discussion-listening-wave">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="discussion-wave-bar"
                            style={{
                              animationDelay: `${i * 0.1}s`,
                              height: `${8 + audioLevel * 20}px`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {isAISpeaking && (
                    <div className="discussion-call-speaking-indicator">
                      <div className="discussion-speaking-rings">
                        <div className="discussion-speaking-ring"></div>
                        <div className="discussion-speaking-ring"></div>
                        <div className="discussion-speaking-ring"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="discussion-call-info">
                  <h3 className="discussion-call-contact-name">{t("aiAssistant")}</h3>
                  <p className="discussion-call-status-text">
                    {isAISpeaking ? t("aiSpeaking") : isRecognitionActive ? t("listening") : t("online")}
                  </p>
                </div>
              </div>
              {callQuestion && (
                <div className="discussion-call-transcript">
                  <span className="discussion-transcript-label">Transcription</span>
                  <div className="discussion-call-transcript-text">{callQuestion}</div>
                </div>
              )}
            </div>
            <div className="discussion-call-controls">
              <button className="discussion-call-control-btn discussion-mute-btn">
                <Mic size={24} />
                <span>{t("mute")}</span>
              </button>

              <button
                className="discussion-call-control-btn discussion-end-call-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCallMode()
                }}
              >
                <PhoneOff size={24} />
              </button>

              <button className="discussion-call-control-btn discussion-speaker-btn">
                <Volume2 size={24} />
                <span>{t("speaker")}</span>
              </button>
            </div>
          </div>
        )}
        {!callModeRef.current && responses.length === 0 ? (
          <div className="discussion-welcome-background">
            <div className="discussion-welcome-container">
              <div className="discussion-welcome-icon">
                <div className="discussion-welcome-avatar">
                  <Heart size={48} />
                </div>
                <div className="discussion-welcome-pulse"></div>
              </div>
              <h2 className="discussion-welcome-title">{t("welcomeTitle")}</h2>
              <p className="discussion-welcome-text">{t("welcomeText")}</p>
            </div>
          </div>
        ) : !callModeRef.current ? (
          <div className="discussion-chat-background">
            <div className="discussion-responses-list" ref={chatContainerRef}>
              {responses.map((item) => (
                <div
                  key={item.id || Math.random().toString()}
                  className={`discussion-message ${item.type === "user" ? "discussion-user-message" : "discussion-ai-message"}`}
                >
                  {item.type === "user" ? (
                    <>
                      <div className="discussion-user-message-content">
                        <p className="discussion-message-text">{item.text}</p>
                      </div>
                      <div className="discussion-message-avatar user">
                        {/* Avatar utilisateur ici si nécessaire */}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="discussion-message-avatar ai">
                        <Bot size={16} />
                      </div>
                      <div className="discussion-ai-message-content">
                        <p className="discussion-message-text">{item.text}</p>
                        <div className="discussion-message-actions">
                          <button
                            className={`discussion-audio-button ${speakingMessageId === item.id ? "active" : ""}`}
                            onClick={() => speakText(item.text, item.id)}
                            title={speakingMessageId === item.id ? t("stopReading") : t("readMessage")}
                          >
                            {speakingMessageId === item.id ? <Pause size={16} /> : <Volume2 size={16} />}
                          </button>
                          <button
                            className={`discussion-like-button ${item.liked ? "liked" : ""}`}
                            onClick={() => handleLike(item.id)}
                            title="Like"
                          >
                            <ThumbsUp size={16} />
                          </button>
                          <button
                            className={`discussion-dislike-button ${item.disliked ? "disliked" : ""}`}
                            onClick={() => handleDislike(item.id)}
                            title="Dislike"
                          >
                            <ThumbsDown size={16} />
                          </button>
                          <button
                            className="discussion-regenerate-button"
                            onClick={() => handleRegenerate(item.id)}
                            title="Régénérer"
                          >
                            <RefreshCw size={16} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  {/* <div className="discussion-message-timestamp">{formatMessageTime(item.timestamp)}</div> */}
                </div>
              ))}
              {isWaitingResponse && (
                <div className="discussion-loading-response-container">
                  <div className="discussion-message-avatar ai">
                    <Bot size={16} />
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
        {!callModeRef.current && (
          <div className="discussion-input-container">
            <div className="discussion-input-wrapper">
              <textarea
                className="discussion-input"
                placeholder={t("inputPlaceholder")}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  height: "auto",
                  minHeight: "24px",
                }}
                onInput={(e) => {
                  e.target.style.height = "auto"
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"
                }}
              />
              <div className="discussion-voice-controls">
                <button
                  className={`discussion-call-button ${callModeRef.current ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCallMode()
                  }}
                  title={callModeRef.current ? t("stopCall") : t("startCall")}
                >
                  {callModeRef.current ? <PhoneOff size={20} /> : <Phone size={20} />}
                </button>
                <button
                  className={`discussion-mic-button ${isRecording ? "recording" : ""}`}
                  onClick={() => {
                    if (isRecording) {
                      setIsRecording(false)
                      stopRecording()
                    } else {
                      setIsRecording(true)
                      startRecording()
                    }
                  }}
                  title={isRecording ? t("stopRecording") : t("startRecording")}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
              <button
                className={`discussion-send-button ${!question.trim() || isWaitingResponse ? "disabled" : ""}`}
                onClick={() => handleAskQuestion()}
                disabled={!question.trim() || isWaitingResponse}
                title={t("sendMessage")}
              >
                {isWaitingResponse ? <div className="discussion-send-spinner"></div> : <Send size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {showAuthChoice && (
        <AuthChoice
          onClose={() => setShowAuthChoice(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onStayDisconnected={handleStayDisconnected}
        />
      )}
    </div>
  )
}