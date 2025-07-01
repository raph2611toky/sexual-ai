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
  const [selectedLanguage, setSelectedLanguage] = useState("FR")

  // Audio visualization animation
  const [audioLevel, setAudioLevel] = useState(0)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const flatListRef = useRef()
  const slideAnim = useRef(new Animated.Value(-300)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const spinValue = useRef(new Animated.Value(0)).current

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  useEffect(() => {
    if (!discussionCreated) {
      handleCreateDiscussion()
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [discussionCreated])

  useEffect(() => {
    if (flatListRef.current && responses.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true })
    }
  }, [responses])

  useEffect(() => {
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

  useEffect(() => {
    let audioLevelInterval
    if (isRecording) {
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

      audioLevelInterval = setInterval(() => {
        const randomLevel = 0.3 + Math.random() * 0.7
        setAudioLevel(randomLevel)
      }, 150)
    } else {
      pulseAnim.setValue(1)
      setAudioLevel(0)
    }

    return () => {
      if (audioLevelInterval) clearInterval(audioLevelInterval)
    }
  }, [isRecording])

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false))
    } else {
      fetchConversations()
      setMenuVisible(true)
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
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
      console.error("Error fetching conversations:", error)
      setIsLoading(false)
      setConversations([
        { id: "1", title: "Discussion sur la contraception", date: "2023-04-01" },
        { id: "2", title: "Questions sur la grossesse", date: "2023-04-02" },
        { id: "3", title: "Santé reproductive", date: "2023-04-03" },
      ])
    }
  }

  const handleCreateDiscussion = async () => {
    console.log("discussion initialiser")
    // try {
    //   // const userDataString = await AsyncStorage.getItem("userData");
  
    //   // if (userDataString) {
    //   //   const userData = JSON.parse(userDataString);
    //   //   const userToken = userData.id;
    //   //       if (userToken) {
    //   //     const responseConversation = await axios.post(
    //   //       `${config.apiUrl}/conversation/new/`,
            
    //   //       {
    //   //         headers: {
    //   //           Authorization: `Bearer ${userToken}`,
    //   //         },
    //   //       },
    //   //     )
    //   //     const id_conversation = responseConversation.data.id_conversation
    //   //     setId_conversation(id_conversation)
    //   //     setDiscussionCreated(true)
    //   //     setCurrentTitle("")
    //   //     setResponses([])
    //   //     console.log("Discussion created successfully")
    //     // }
        
    //   }
    // } catch (error) {
    //   console.error("Error creating discussion:", error)
    // }
  }

  const handleAskQuestion = async () => {
    if (question.trim()) {
      const languageInstruction = {
        FR: "Réponds en français: ",
        EN: "Answer in English: ",
        MG: "Valiny amin'ny teny Malagasy: ",
      }[selectedLanguage]

      const questionWithLang = languageInstruction + question
      const newResponses = [{ type: "user", text: question, id: Date.now() }]
      setResponses((prevResponses) => [...prevResponses, ...newResponses])
      setQuestion("")
      Keyboard.dismiss()
      setIsWaitingResponse(true)

      try {
        const userDataString = await AsyncStorage.getItem("userData")
        if (userDataString) {
          const userData = JSON.parse(userDataString)
          const userToken = userData.id
          if (userToken) {
            const responseMessage = await axios.post(
              `${config.apiUrl}/messagechat/new/`,
              { contenu: questionWithLang, lang: selectedLanguage },
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
        console.error("Error sending question:", error)
        setResponses((prevResponses) => [
          ...prevResponses,
          {
            type: "ai",
            text: selectedLanguage === "FR"
              ? "Désolé, une erreur s'est produite. Veuillez réessayer."
              : selectedLanguage === "EN"
              ? "Sorry, an error occurred. Please try again."
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
    toggleMenu()

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
          const formattedMessages = response.data.map((msg) => ({
            type: msg.is_bot ? "ai" : "user",
            text: msg.contenu,
            id: msg.id || Date.now().toString() + Math.random().toString(36).substring(7),
          }))
          setResponses(formattedMessages)
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(selectedLanguage === "FR" ? "fr-FR" : selectedLanguage === "EN" ? "en-US" : "mg-MG")
  }

  const speakText = (text, messageId) => {
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

    const speechLanguage = {
      FR: "fr-FR",
      EN: "en-US",
      MG: "mg-MG"
    }[selectedLanguage]

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

 async function startRecording() {
  if (selectedLanguage === "EN") {
    setResponses((prevResponses) => [
      ...prevResponses,
      {
        type: "ai",
        text: "Sorry, speech-to-text for English is not available yet.",
        id: Date.now().toString() + "error",
      },
    ])
    return
  }

  try {
    const { status } = await Audio.requestPermissionsAsync()
    if (status !== "granted") {
      alert(
        selectedLanguage === "FR"
          ? "Permission d'accès au microphone requise !"
          : selectedLanguage === "EN"
          ? "Microphone access permission required!"
          : "Ilaina ny fahazoan-dàlana hidirana amin'ny mikrô!"
      )
      return
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    })

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

    await Voice.start(selectedLanguage === "FR" ? "fr-FR" : "mg-MG")
    setIsRecording(true)
  } catch (err) {
    console.error("Failed to start recording", err)
    alert(
      selectedLanguage === "FR"
        ? "Échec du démarrage de l'enregistrement"
        : selectedLanguage === "EN"
        ? "Failed to start recording"
        : "Tsy nahomby ny fanombohana ny firaketana"
    )
  }
}
  async function stopRecording() {
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
      
      // Send audio to backend for transcription
      const userDataString = await AsyncStorage.getItem("userData")
      if (userDataString) {
        const userData = JSON.parse(userDataString)
        const userToken = userData.id
        if (userToken) {
          const formData = new FormData()
          formData.append('audio', {
            uri,
            type: 'audio/m4a',
            name: 'recording.m4a',
          })
          formData.append('lang', selectedLanguage)

          const response = await axios.post(
            `${config.apiUrl}/messagechat/new/audio`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          )

          const transcribedText = response.data.text
          setQuestion(transcribedText)
        }
      }
    } catch (err) {
      console.error("Failed to process recording", err)
      setResponses((prevResponses) => [
        ...prevResponses,
        {
          type: "ai",
          text: selectedLanguage === "FR"
            ? "Erreur lors du traitement de l'audio. Veuillez réessayer."
            : selectedLanguage === "EN"
            ? "Error processing audio. Please try again."
            : "Hadisoana tamin'ny fanodinana ny feo. Andramo indray azafady.",
          id: Date.now().toString() + "error",
        },
      ])
    } finally {
      setIsProcessingAudio(false)
      setRecording(null)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FF4081" />
      
      {menuVisible && (
        <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
          <LinearGradient colors={["#FF4081", "#C2185B"]} style={styles.menuHeader}>
            <Text style={styles.menuTitle}>
              {selectedLanguage === "FR" ? "Mes Discussions" : 
               selectedLanguage === "EN" ? "My Discussions" : 
               "Ny Resakofiko"}
            </Text>
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
              <Text style={styles.newChatText}>
                {selectedLanguage === "FR" ? "Nouvelle discussion" : 
                 selectedLanguage === "EN" ? "New discussion" : 
                 "Resaka vaovao"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {selectedLanguage === "FR" ? "Chargement..." : 
                 selectedLanguage === "EN" ? "Loading..." : 
                 "Ampidina..."}
              </Text>
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

      {menuVisible && <TouchableOpacity style={styles.overlay} activeOpacity={0.5} onPress={toggleMenu} />}

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
            {["FR", "EN", "MG"].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.languageButton, selectedLanguage === lang && styles.languageButtonActive]}
                onPress={() => setSelectedLanguage(lang)}
              >
                <Text style={[styles.languageText, selectedLanguage === lang && styles.languageTextActive]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
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
                {selectedLanguage === "FR"
                  ? "Posez vos questions sur la santé reproductive en toute confidentialité."
                  : selectedLanguage === "EN"
                  ? "Ask your questions about reproductive health in complete confidentiality."
                  : "Mametraha ny fanontanianao momba ny fahasalamana ara-panabeazana amin'ny tsiambaratelo tanteraka."}
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
                      {selectedLanguage === "FR" ? "En attente de réponse..." : 
                       selectedLanguage === "EN" ? "Waiting for response..." : 
                       "Miandry valiny..."}
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
              placeholder={
                selectedLanguage === "FR" ? "Tapez votre question ici..." : 
                selectedLanguage === "EN" ? "Type your question here..." : 
                "Soraty eto ny fanontanianao..."
              }
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
  menstruationButton: {
    padding: 8,
    marginRight: 8,
  },
  languageSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    padding: 2,
  },
  languageButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    marginHorizontal: 2,
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
  chatBackground: {
    flex: 1,
    width: "100%",
  },
  responsesList: {
    flex: 1,
  },
  responsesContent: {
    padding: 16,
    paddingBottom: 60,
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
    paddingBottom: 30,
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
})