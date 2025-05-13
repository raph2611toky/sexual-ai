"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from "react-native"
import { Calendar } from "react-native-calendars"
import { Picker } from "@react-native-picker/picker"
import axios from "axios"
import config from "./config"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { FontAwesome } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/core"
import { LinearGradient } from "expo-linear-gradient"

function CycleManagementScreen() {
  const [ruleStartDate, setRuleStartDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [symptoms, setSymptoms] = useState({ physiques: [], emotions: [] })
  const [ruleDuration, setRuleDuration] = useState("3")
  const [cycleLength, setCycleLength] = useState("28")
  const [selectedSymptoms, setSelectedSymptoms] = useState({})
  const [regleType, setRegleType] = useState("regulier")
  const [activeTab, setActiveTab] = useState("calendar")

  const navigation = useNavigation()

  useEffect(() => {
    fetchSymptoms()
  }, [])

  const fetchSymptoms = async () => {
    setIsLoading(true)
    try {
      const userDataString = await AsyncStorage.getItem("userData")
      if (userDataString) {
        const userData = JSON.parse(userDataString)
        const userToken = userData.id
        if (userToken) {
          const response = await axios.get(`${config.apiUrl}/symptom/list/`, {
            headers: { Authorization: `Bearer ${userToken}` },
          })
          setSymptoms(response.data || { physiques: [], emotions: [] })
           console.log(symptoms) 
        }
      }
    } catch (error) {
      console.error("Error fetching symptoms:", error)
      // Fallback data in case API fails
      setSymptoms({
        physiques: [
          { id_symptom: "1", title: "Crampes abdominales" },
          { id_symptom: "2", title: "Maux de tête" },
          { id_symptom: "3", title: "Fatigue" },
          { id_symptom: "4", title: "Douleurs lombaires" },
          { id_symptom: "5", title: "Seins sensibles" },
        ],
        emotions: [
          { id_symptom: "1", title: "Irritabilité" },
          { id_symptom: "2", title: "Anxiété" },
          { id_symptom: "3", title: "Sautes d'humeur" },
          { id_symptom: "4", title: "Tristesse" },
        ],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!ruleStartDate || !cycleLength) {
      Alert.alert("Information manquante", "Veuillez sélectionner une date et indiquer la durée de votre cycle.", [
        { text: "OK" },
      ])
      return
    }

    setIsLoading(true)
    try {
      const selectedSymptomIds = Object.keys(selectedSymptoms).filter((key) => selectedSymptoms[key])

      const data = {
        start_date: ruleStartDate,
        cycle_duration: Number.parseInt(cycleLength),
        menstruation_duration: Number.parseInt(ruleDuration),
        symptoms: selectedSymptomIds,
        regle_type: regleType,
      }

      const userDataString = await AsyncStorage.getItem("userData")
      if (userDataString) {
        const userData = JSON.parse(userDataString)
        const userToken = userData.id
        if (userToken) {
          await axios.post(`${config.apiUrl}/menstruation/new/full/`, data, {
            headers: { Authorization: `Bearer ${userToken}` },
          })

          Alert.alert("Succès", "Les informations de votre cycle ont été enregistrées !", [{ text: "OK" }])
        }
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite lors de l'enregistrement. Veuillez réessayer.", [{ text: "OK" }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckboxChange = (symptomId) => {
    setSelectedSymptoms((prevSelected) => ({
      ...prevSelected,
      [symptomId]: !prevSelected[symptomId],
    }))
  }

  const onDayPress = (day) => {
    setRuleStartDate(day.dateString)
  }

  const durations = ["1", "2", "3", "4", "5", "6", "7"]

  // Calculate next period date
  const getNextPeriodDate = () => {
    if (!ruleStartDate || !cycleLength) return null

    const startDate = new Date(ruleStartDate)
    const nextDate = new Date(startDate)
    nextDate.setDate(startDate.getDate() + Number.parseInt(cycleLength))

    return nextDate.toISOString().split("T")[0]
  }

  const nextPeriodDate = getNextPeriodDate()

  // Calculate fertile window (simplified)
  const getFertileWindow = () => {
    if (!ruleStartDate || !cycleLength) return null

    const startDate = new Date(ruleStartDate)
    const cycleInt = Number.parseInt(cycleLength)

    // Fertile window typically starts 5 days before ovulation
    // Ovulation typically occurs 14 days before the next period
    const ovulationDate = new Date(startDate)
    ovulationDate.setDate(startDate.getDate() + cycleInt - 14)

    const fertileStart = new Date(ovulationDate)
    fertileStart.setDate(ovulationDate.getDate() - 5)

    const fertileEnd = new Date(ovulationDate)
    fertileEnd.setDate(ovulationDate.getDate() + 1)

    return {
      start: fertileStart.toISOString().split("T")[0],
      end: fertileEnd.toISOString().split("T")[0],
      ovulation: ovulationDate.toISOString().split("T")[0],
    }
  }

  const fertileWindow = getFertileWindow()

  // Prepare marked dates for calendar
  const getMarkedDates = () => {
    const markedDates = {}

    if (ruleStartDate) {
      // Mark period start date
      markedDates[ruleStartDate] = {
        selected: true,
        selectedColor: "#FF4081",
      }

      // Mark period days
      const periodEnd = new Date(ruleStartDate)
      periodEnd.setDate(periodEnd.getDate() + Number.parseInt(ruleDuration) - 1)

      const currentDate = new Date(ruleStartDate)
      while (currentDate <= periodEnd) {
        const dateString = currentDate.toISOString().split("T")[0]
        if (dateString !== ruleStartDate) {
          markedDates[dateString] = {
            marked: true,
            dotColor: "#FF4081",
          }
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    // Mark next period
    if (nextPeriodDate) {
      markedDates[nextPeriodDate] = {
        ...markedDates[nextPeriodDate],
        marked: true,
        dotColor: "#C2185B",
      }
    }

    // Mark fertile window
    if (fertileWindow) {
      // Mark ovulation day
      markedDates[fertileWindow.ovulation] = {
        ...markedDates[fertileWindow.ovulation],
        marked: true,
        dotColor: "#4CAF50",
      }

      // Mark fertile days
      const currentDate = new Date(fertileWindow.start)
      const fertileEnd = new Date(fertileWindow.end)

      while (currentDate <= fertileEnd) {
        const dateString = currentDate.toISOString().split("T")[0]
        if (dateString !== fertileWindow.ovulation) {
          markedDates[dateString] = {
            ...markedDates[dateString],
            marked: true,
            dotColor: dateString === fertileWindow.start || dateString === fertileWindow.end ? "#8BC34A" : "#CDDC39",
          }
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    return markedDates
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FF4081" />

      <LinearGradient colors={["#FF4081", "#C2185B"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi du cycle menstruel</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "calendar" && styles.activeTab]}
          onPress={() => setActiveTab("calendar")}
        >
          <FontAwesome name="calendar" size={18} color={activeTab === "calendar" ? "#FF4081" : "#666"} />
          <Text style={[styles.tabText, activeTab === "calendar" && styles.activeTabText]}>Calendrier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "symptoms" && styles.activeTab]}
          onPress={() => setActiveTab("symptoms")}
        >
          <FontAwesome name="list-ul" size={18} color={activeTab === "symptoms" ? "#FF4081" : "#666"} />
          <Text style={[styles.tabText, activeTab === "symptoms" && styles.activeTabText]}>Symptômes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "settings" && styles.activeTab]}
          onPress={() => setActiveTab("settings")}
        >
          <FontAwesome name="sliders" size={18} color={activeTab === "settings" ? "#FF4081" : "#666"} />
          <Text style={[styles.tabText, activeTab === "settings" && styles.activeTabText]}>Paramètres</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4081" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          {activeTab === "calendar" && (
            <>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Calendrier menstruel</Text>
                <Text style={styles.sectionDescription}>
                  Sélectionnez le premier jour de vos dernières règles pour suivre votre cycle.
                </Text>
              </View>

              <View style={styles.calendarContainer}>
                <Calendar
                  style={styles.calendar}
                  onDayPress={onDayPress}
                  markedDates={getMarkedDates()}
                  theme={{
                    selectedDayBackgroundColor: "#FF4081",
                    selectedDayTextColor: "white",
                    todayTextColor: "#FF4081",
                    arrowColor: "#FF4081",
                    monthTextColor: "#333",
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 14,
                    dayTextColor: "#333",
                    textSectionTitleColor: "#666",
                    "stylesheet.calendar.header": {
                      header: {
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingLeft: 10,
                        paddingRight: 10,
                        marginTop: 10,
                        alignItems: "center",
                      },
                    },
                  }}
                />
              </View>

              <View style={styles.infoCards}>
                <View style={styles.infoCard}>
                  <LinearGradient colors={["#FF4081", "#C2185B"]} style={styles.infoCardIcon}>
                    <FontAwesome name="calendar-check-o" size={20} color="#fff" />
                  </LinearGradient>
                  <View style={styles.infoCardContent}>
                    <Text style={styles.infoCardTitle}>Prochaines règles</Text>
                    <Text style={styles.infoCardValue}>
                      {nextPeriodDate ? new Date(nextPeriodDate).toLocaleDateString() : "Non défini"}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <LinearGradient colors={["#4CAF50", "#8BC34A"]} style={styles.infoCardIcon}>
                    <FontAwesome name="leaf" size={20} color="#fff" />
                  </LinearGradient>
                  <View style={styles.infoCardContent}>
                    <Text style={styles.infoCardTitle}>Ovulation</Text>
                    <Text style={styles.infoCardValue}>
                      {fertileWindow ? new Date(fertileWindow.ovulation).toLocaleDateString() : "Non défini"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Durée du cycle (jours)</Text>
                <View style={styles.inputWithButtons}>
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={() => setCycleLength(Math.max(21, Number.parseInt(cycleLength) - 1).toString())}
                  >
                    <FontAwesome name="minus" size={16} color="#666" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={cycleLength}
                    onChangeText={setCycleLength}
                    maxLength={2}
                  />
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={() => setCycleLength(Math.min(35, Number.parseInt(cycleLength) + 1).toString())}
                  >
                    <FontAwesome name="plus" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {activeTab === "symptoms" && (
            <>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Symptômes</Text>
                <Text style={styles.sectionDescription}>
                  Sélectionnez les symptômes que vous ressentez pendant votre cycle.
                </Text>
              </View>

              <View style={styles.symptomsContainer}>
                <Text style={styles.symptomsCategory}>Symptômes physiques</Text>
                <View style={styles.symptomsGrid}>
                  {symptoms.physiques && symptoms.physiques.length > 0 ? (
                    symptoms.physiques.map((symptom) => (
                      <TouchableOpacity
                        key={symptom.id_symptom}
                        style={[styles.symptomItem, selectedSymptoms[symptom.id_symptom] && styles.symptomItemSelected]}
                        onPress={() => handleCheckboxChange(symptom.id_symptom)}
                      >
                        <Text
                          style={[
                            styles.symptomText,
                            selectedSymptoms[symptom.id_symptom] && styles.symptomTextSelected,
                          ]}
                        >
                          {symptom.title}
                        </Text>
                        {selectedSymptoms[symptom.id_symptom] && (
                          <FontAwesome name="check" size={14} color="#fff" style={styles.symptomCheck} />
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>Aucun symptôme physique disponible</Text>
                  )}
                </View>

                <Text style={styles.symptomsCategory}>Symptômes émotionnels</Text>
                <View style={styles.symptomsGrid}>
                  {symptoms.emotions && symptoms.emotions.length > 0 ? (
                    symptoms.emotions.map((symptom) => (
                      <TouchableOpacity
                        key={symptom.id_symptom}
                        style={[styles.symptomItem, selectedSymptoms[symptom.id_symptom] && styles.symptomItemSelected]}
                        onPress={() => handleCheckboxChange(symptom.id_symptom)}
                      >
                        <Text
                          style={[
                            styles.symptomText,
                            selectedSymptoms[symptom.id_symptom] && styles.symptomTextSelected,
                          ]}
                        >
                          {symptom.title}
                        </Text>
                        {selectedSymptoms[symptom.id_symptom] && (
                          <FontAwesome name="check" size={14} color="#fff" style={styles.symptomCheck} />
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>Aucun symptôme émotionnel disponible</Text>
                  )}
                </View>
              </View>
            </>
          )}

          {activeTab === "settings" && (
            <>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Paramètres du cycle</Text>
                <Text style={styles.sectionDescription}>Personnalisez les paramètres de votre cycle menstruel.</Text>
              </View>

              <View style={styles.settingsContainer}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Durée des règles (jours)</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={ruleDuration}
                      onValueChange={(itemValue) => setRuleDuration(itemValue)}
                      style={styles.picker}
                      dropdownIconColor="#FF4081"
                    >
                      {durations.map((duration) => (
                        <Picker.Item key={duration} label={duration} value={duration} style={styles.pickerItem} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Type de cycle</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={regleType}
                      onValueChange={(itemValue) => setRegleType(itemValue)}
                      style={styles.picker}
                      dropdownIconColor="#FF4081"
                    >
                      <Picker.Item label="Régulier" value="regulier" style={styles.pickerItem} />
                      <Picker.Item label="Irrégulier" value="irregulier" style={styles.pickerItem} />
                    </Picker>
                  </View>
                </View>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.saveButtonContainer} onPress={handleSubmit} disabled={isLoading}>
            <LinearGradient
              colors={["#FF4081", "#C2185B"]}
              style={styles.saveButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <FontAwesome name="save" size={18} color="#fff" style={styles.saveButtonIcon} />
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerRight: {
    width: 36,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#FF4081",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#FF4081",
    fontWeight: "500",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  calendarContainer: {
    backgroundColor: "#fff",
    padding: 8,
    marginBottom: 16,
  },
  calendar: {
    borderRadius: 8,
    overflow: "hidden",
  },
  infoCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
  },
  infoCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  inputContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  inputWithButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    textAlign: "center",
    fontSize: 16,
    color: "#333",
  },
  symptomsContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
  },
  symptomsCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  symptomItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  symptomItemSelected: {
    backgroundColor: "#FF4081",
    borderColor: "#FF4081",
  },
  symptomText: {
    fontSize: 14,
    color: "#333",
  },
  symptomTextSelected: {
    color: "#fff",
  },
  symptomCheck: {
    marginLeft: 6,
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    padding: 8,
  },
  settingsContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#333",
  },
  pickerItem: {
    fontSize: 16,
  },
  saveButtonContainer: {
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    
    elevation: 2,
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    height: 43,

  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 2,
  },
})

export default CycleManagementScreen
