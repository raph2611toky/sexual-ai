"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  ActivityIndicator,
} from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Audio } from "expo-av"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Speech from "expo-speech"
import config from "./config"

export default function DiscussionScreen({ navigation }) {
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
  const [recording, setRecording] = useState(null)
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const [isWaitingResponse, setIsWaitingResponse] = useState(false)
  const [language, setLanguage] = useState("FR") // Ajout de l'état pour la langue
  // Ajouter un nouvel état pour la langue sélectionnée après les autres états
  const [selectedLanguage, setSelectedLanguage] = useState("FR")

  // Ajoutons des états pour l'animation d'onde sonore
  const [audioLevel, setAudioLevel] = useState(0)
  const pulseAnim = useRef(new Animated.Value(1)).current

  const flatListRef = useRef()
  const slideAnim = useRef(new Animated.Value(-300)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const spinValue = useRef(new Animated.Value(0)).current

  // Create a rotating animation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  useEffect(() => {
    if (!discussionCreated) {
      handleCreateDiscussion()
    }

    // Fade in animation for welcome screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [discussionCreated])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (flatListRef.current && responses.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true })
    }
  }, [responses])

  useEffect(() => {
    // Start rotation animation when waiting for response
    if (isWaitingResponse) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ).start()
    } else {
      spinValue.setValue(0)
    }
  }, [isWaitingResponse])

  const toggleMenu = () => {
    if (menuVisible) {
      // Close menu
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false))
    } else {
      // Open menu and fetch conversations
      fetchConversations()
      setMenuVisible(true)
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }

  // Fonction pour changer la langue
  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "FR" ? "EN" : "FR"))
  }

  const fetchConversations = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData")

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
      // Populate with mock data if API fails
      setConversations([
        { id: "1", title: "Discussion sur la contraception", date: "2023-04-01" },
        { id: "2", title: "Questions sur la grossesse", date: "2023-04-02" },
        { id: "3", title: "Santé reproductive", date: "2023-04-03" },
      ])
    }
  }

  const handleCreateDiscussion = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData")

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

  // Modifier la fonction handleAskQuestion pour concaténer l'instruction de langue
  const handleAskQuestion = async () => {
    if (question.trim()) {
      // Ajouter l'instruction de langue à la question
      const languageInstruction = selectedLanguage === "FR" ? "Réponds en français: " : "Answer in English: "
      const questionWithLang = languageInstruction + question

      // Afficher la question originale à l'utilisateur, mais envoyer la question avec instruction au backend
      const newResponses = [{ type: "user", text: question, id: Date.now() }]
      setResponses((prevResponses) => [...prevResponses, ...newResponses])
      setQuestion("")
      Keyboard.dismiss()

      // Show loading animation
      setIsWaitingResponse(true)

      try {
        const userDataString = await AsyncStorage.getItem("userData")

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
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi de la question:", error)
        // Add error message
        setResponses((prevResponses) => [
          ...prevResponses,
          {
            type: "ai",
            text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
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
    toggleMenu() // Close the menu

    try {
      const userDataString = await AsyncStorage.getItem("userData")

      if (userDataString) {
        const userData = JSON.parse(userDataString)
        const userToken = userData.id

        if (userToken) {
          const response = await axios.get(`${config.apiUrl}/conversation/${conversationId}/messages/`, {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          })

          // Transform the messages to match our format
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
    return date.toLocaleDateString("fr-FR")
  }

  const speakText = (text, messageId) => {
    // Stop any ongoing speech
    if (isSpeaking) {
      Speech.stop()
      if (speakingMessageId === messageId) {
        setIsSpeaking(false)
        setSpeakingMessageId(null)
        return
      }
    }

    setIsSpeaking(true)
    setSpeakingMessageId(messageId)

    // Utiliser la langue sélectionnée pour la synthèse vocale
    const speechLanguage = language === "FR" ? "fr" : "en-US"

    Speech.speak(text, {
      language: speechLanguage,
      pitch: 1.0,
      rate: 0.9,
      onDone: () => {
        setIsSpeaking(false)
        setSpeakingMessageId(null)
      },
      onError: () => {
        setIsSpeaking(false)
        setSpeakingMessageId(null)
      },
    })
  }

  // Fonction pour simuler les niveaux audio pendant l'enregistrement
  useEffect(() => {
    let audioLevelInterval

    if (isRecording) {
      // Démarrer l'animation de pulsation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start()

      // Simuler les niveaux audio changeants
      audioLevelInterval = setInterval(() => {
        // Générer un niveau aléatoire entre 0.3 et 1
        const randomLevel = 0.3 + Math.random() * 0.7
        setAudioLevel(randomLevel)
      }, 150)
    } else {
      // Arrêter l'animation de pulsation
      pulseAnim.setValue(1)
      setAudioLevel(0)
    }

    return () => {
      if (audioLevelInterval) clearInterval(audioLevelInterval)
    }
  }, [isRecording])

  // Modifions la fonction startRecording pour ajouter des retours visuels
  async function startRecording() {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== "granted") {
        alert("Permission to access microphone is required!")
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      // Animation de démarrage
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
      await recording.startAsync()
      setRecording(recording)
      setIsRecording(true)
    } catch (err) {
      console.error("Failed to start recording", err)
    }
  }

  // Modifions la fonction stopRecording pour ajouter des retours visuels
  async function stopRecording() {
    // Animation de fin d'enregistrement
    Animated.timing(pulseAnim, {
      toValue: 0.8,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      pulseAnim.setValue(1)
    })

    setIsRecording(false)
    setIsProcessingAudio(true)

    try {
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()

      // Ici, vous enverriez normalement le fichier audio à un service de reconnaissance vocale
      // Pour cet exemple, nous allons simuler le processus avec un délai
      setTimeout(() => {
        // Simuler l'obtention de texte à partir de l'audio
        const transcribedText =
          language === "FR"
            ? "Ceci est un exemple de texte transcrit à partir d'un enregistrement audio."
            : "This is an example of text transcribed from an audio recording."
        setQuestion(transcribedText)
        setIsProcessingAudio(false)
      }, 2000)
    } catch (err) {
      console.error("Failed to stop recording", err)
      setIsProcessingAudio(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FF4081" />

      {/* Sliding Menu */}
      {menuVisible && (
        <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
          <LinearGradient colors={["#FF4081", "#C2185B"]} style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Mes Discussions</Text>
            <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => {
              handleCreateDiscussion()
              toggleMenu()
            }}
          >
            <LinearGradient colors={["#FF4081", "#C2185B"]} style={styles.newChatGradient}>
              <FontAwesome name="plus" size={16} color="#fff" style={styles.newChatIcon} />
              <Text style={styles.newChatText}>Nouvelle discussion</Text>
            </LinearGradient>
          </TouchableOpacity>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.conversationItem}
                  onPress={() => handleSelectConversation(item.id, item.title)}
                >
                  <View style={styles.conversationIcon}>
                    <FontAwesome name="comment" size={16} color="#FF4081" />
                  </View>
                  <View style={styles.conversationDetails}>
                    <Text style={styles.conversationTitle} numberOfLines={1}>
                      {item.title || `Discussion ${item.id}`}
                    </Text>
                    <Text style={styles.conversationDate}>{formatDate(item.date)}</Text>
                  </View>
                  <FontAwesome name="chevron-right" size={14} color="#ccc" />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.conversationsList}
            />
          )}
        </Animated.View>
      )}

      {/* Overlay when menu is open */}
      {menuVisible && <TouchableOpacity style={styles.overlay} activeOpacity={0.5} onPress={toggleMenu} />}

      {/* Main Chat Interface */}
      <View style={styles.container}>
        <LinearGradient colors={["#FF4081", "#C2185B"]} style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <FontAwesome name="bars" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Sexual AI</Text>
          <TouchableOpacity
            style={styles.menstruationButton}
            onPress={() => navigation.navigate("CycleManagementScreen")}
          >
            <FontAwesome name="calendar" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.languageSelector}>
            <TouchableOpacity
              style={[styles.languageButton, selectedLanguage === "FR" && styles.languageButtonActive]}
              onPress={() => setSelectedLanguage("FR")}
            >
              <Text style={[styles.languageText, selectedLanguage === "FR" && styles.languageTextActive]}>FR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageButton, selectedLanguage === "EN" && styles.languageButtonActive]}
              onPress={() => setSelectedLanguage("EN")}
            >
              <Text style={[styles.languageText, selectedLanguage === "EN" && styles.languageTextActive]}>EN</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {responses.length === 0 ? (
          <ImageBackground
            source={{
              uri: "https://img.freepik.com/free-vector/abstract-medical-wallpaper-template-design_53876-61802.jpg",
            }}
            style={styles.welcomeBackground}
            imageStyle={{ opacity: 0.2 }}
          >
            <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
              <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png" }}
                style={styles.welcomeImage}
                resizeMode="contain"
              />
              <Text style={styles.welcomeTitle}>Sexual AI Assistant</Text>
              <Text style={styles.welcomeText}>
                {language === "FR"
                  ? "Posez vos questions sur la santé reproductive en toute confidentialité."
                  : "Ask your questions about reproductive health in complete confidentiality."}
              </Text>
            </Animated.View>
          </ImageBackground>
        ) : (
          <ImageBackground
            source={{
              uri: "https://img.freepik.com/free-vector/abstract-medical-wallpaper-template-design_53876-61802.jpg",
            }}
            style={styles.chatBackground}
            imageStyle={{ opacity: 0.05 }}
          >
            <FlatList
              ref={flatListRef}
              data={responses}
              keyExtractor={(item) => item.id || Math.random().toString()}
              renderItem={({ item }) => (
                <View
                  style={[
                    item.type === "user" ? styles.userMessage : styles.aiMessage,
                    item.type === "user" && styles.userMessageAlign,
                  ]}
                >
                  {item.type === "user" ? (
                    <LinearGradient colors={["#ffcccc", "#ffb8b8"]} style={styles.userMessageGradient}>
                      <Text style={styles.messageText}>{item.text}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.aiMessageContent}>
                      <Text style={styles.messageText}>{item.text}</Text>

                      <TouchableOpacity
                        style={[styles.audioButton, speakingMessageId === item.id && styles.audioButtonActive]}
                        onPress={() => speakText(item.text, item.id)}
                      >
                        <FontAwesome
                          name={speakingMessageId === item.id ? "stop" : "volume-up"}
                          size={16}
                          color={speakingMessageId === item.id ? "#FF4081" : "#666"}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              style={styles.responsesList}
              contentContainerStyle={styles.responsesContent}
              ListFooterComponent={
                isWaitingResponse ? (
                  <View style={styles.loadingResponseContainer}>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <FontAwesome name="circle-o-notch" size={24} color="#FF4081" />
                    </Animated.View>
                    <Text style={styles.loadingResponseText}>
                      {language === "FR" ? "En attente de réponse..." : "Waiting for response..."}
                    </Text>
                  </View>
                ) : null
              }
            />
          </ImageBackground>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={language === "FR" ? "Tapez votre question ici..." : "Type your question here..."}
              value={question}
              onChangeText={setQuestion}
              multiline={true}
              placeholderTextColor="#999"
            />

            {isProcessingAudio ? (
              <View style={styles.processingAudio}>
                <ActivityIndicator size="small" color="#FF4081" />
              </View>
            ) : (
              <TouchableOpacity style={styles.micButton} onPress={isRecording ? stopRecording : startRecording}>
                <Animated.View
                  style={[
                    styles.micButtonInner,
                    {
                      transform: [{ scale: pulseAnim }],
                      backgroundColor: isRecording ? "rgba(255, 64, 129, 0.1)" : "transparent",
                    },
                  ]}
                >
                  <FontAwesome
                    name={isRecording ? "stop-circle" : "microphone"}
                    size={20}
                    color={isRecording ? "#FF4081" : "#888"}
                  />

                  {isRecording && (
                    <View style={styles.waveContainer}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Animated.View
                          key={i}
                          style={[
                            styles.waveLine,
                            {
                              height: 10 + 15 * audioLevel * (i % 3 === 0 ? 0.6 : i % 2 === 0 ? 1 : 0.8),
                              opacity: audioLevel * (i % 2 === 0 ? 1 : 0.7),
                            },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !question.trim() && isWaitingResponse && styles.sendButtonDisabled]}
            onPress={handleAskQuestion}
            disabled={!question.trim() || isWaitingResponse}
          >
            <LinearGradient colors={["#FF4081", "#C2185B"]} style={styles.sendButtonGradient}>
              {isWaitingResponse ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <FontAwesome name="paper-plane" size={18} color="#fff" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    color: "#fff",
  },
  // Styles pour le bouton de langue
  languageButton: {
    marginLeft: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  languageButtonGradient: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  languageButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  // Welcome screen
  welcomeBackground: {
    flex: 1,
    width: "100%",
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  // Menu styles
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: "#fff",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 5,
  },
  newChatButton: {
    margin: 16,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  newChatGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  newChatIcon: {
    marginRight: 10,
  },
  newChatText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
  },
  conversationsList: {
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  conversationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fce4ec",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  conversationDetails: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  conversationDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  // Chat styles
  chatBackground: {
    flex: 1,
    width: "100%",
  },
  responsesList: {
    flex: 1,
  },
  responsesContent: {
    padding: 16,
    paddingBottom: 60, // Extra space at the bottom
  },
  userMessage: {
    alignSelf: "flex-end",
    marginBottom: 12,
    maxWidth: "80%",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  userMessageGradient: {
    padding: 12,
  },
  userMessageAlign: {
    alignSelf: "flex-end",
  },
  aiMessage: {
    alignSelf: "flex-start",
    marginBottom: 12,
    maxWidth: "80%",
    borderRadius: 18,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    overflow: "hidden",
  },
  aiMessageContent: {
    padding: 12,
    paddingBottom: 30, // Space for audio button
  },
  messageText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  audioButton: {
    position: "absolute",
    bottom: 5,
    right: 8,
    padding: 5,
  },
  audioButtonActive: {
    backgroundColor: "#fce4ec",
    borderRadius: 12,
  },
  loadingResponseContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginBottom: 10,
  },
  loadingResponseText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
  },
  micButton: {
    padding: 8,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  micButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  processingAudio: {
    padding: 8,
  },
  waveContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 20,
    bottom: -22,
    left: -12,
  },
  waveLine: {
    width: 3,
    marginHorizontal: 1,
    backgroundColor: "#FF4081",
    borderRadius: 3,
  },
  sendButton: {
    marginLeft: 10,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  // Ajouter les styles pour le sélecteur de langue à la fin
  languageSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    padding: 2,
    marginLeft: "auto",
  },
  languageButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  languageButtonActive: {
    backgroundColor: "#fff",
  },
  languageText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    fontSize: 12,
  },
  languageTextActive: {
    color: "#FF4081",
  },
  // Menstruation tracker styles
  menstruationButton: {
    padding: 8,
    marginRight: 8,
  },
})
