

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import CheckBox from 'expo-checkbox';
import { Picker } from '@react-native-picker/picker'; 
import axios from 'axios'; 
import config from './config';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/core';
import { LinearGradient } from "expo-linear-gradient";

function CycleManagementScreen() {
  const [ruleStartDate, setRuleStartDate] = useState("");
  const [nextCycleStartDate, setNextCycleStartDate] = useState(""); 
  const [ symptomsPhysic, setSymptomsPhysic] = useState("")
  const [symptomsEmotion, setSymptomsEmotion] = useState("")
  const [symptoms, setSymptoms] = useState({ physiques: [], emotions: [] });
  const [ruleDuration, setRuleDuration] = useState("3");
  const [cycleLength, setCycleLength] = useState("");
  const [isToday, setIsToday] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [buttonText, setButtonText] = useState("Avez-vous vos règles aujourd'hui ?");
  const [todayDate, setTodayDate] = useState(""); 
  const [regleType, setRegleType] = useState("regulier");
  const navigation = useNavigation()
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);  
          const userToken = userData.id;  
          if (userToken) {
            const response = await axios.get(`${config.apiUrl}/symptom/list/`, {
              headers: { Authorization: `Bearer ${userToken}` }
            });
            setSymptoms(response.data|| { physiques: [],  emotions: [] });
          }
        }
        
      } catch (error) {
       
      }
    };
    fetchSymptoms();
  }, []);

  const handleTodayButtonPress = () => {
    const currentDate = new Date().toISOString().split('T')[0]; 
    setTodayDate(currentDate);
    setIsToday(true);
    setRuleStartDate(currentDate); 
    setButtonText("Enregistrer");
  };

  const handleSubmit = async () => {
    try {

      const selectedSymptomIds = Object.keys(selectedSymptoms).filter(
        (key) => selectedSymptoms[key]
      );

      const data = {
        start_date: ruleStartDate,
        cycle_duration: parseInt(cycleLength),
        menstruation_duration: parseInt(ruleDuration),
        symptoms: selectedSymptomIds,
        regle_type:regleType
      };

      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);  
        const userToken = userData.id;  
        if (userToken) {
          await axios.post(`${config.apiUrl}/menstruation/new/full/`, data, {
            headers: { Authorization: `Bearer ${userToken}` },
          });
            setRuleStartDate("");
          Alert.alert("Les informations de votre cycle ont été enregistrées !");
          
        }
      }
      
    } catch (error) {
      Alert.alert("Veuillez remplir tous les champs");
    }
  };

  const handleCheckboxChange = (symptomId) => {
    setSelectedSymptoms((prevSelected) => ({
      ...prevSelected,
      [symptomId]: !prevSelected[symptomId],
    }));
  };
  

  const onDayPress = (day) => {
    setRuleStartDate(day.dateString);
  }

  const durations = ["1", "2", "3", "4", "5", "6", "7"];

  return (
    <ScrollView style={styles.container} >
      <View style={styles.header}>
        <Text style={styles.label}>Veuillez sélectionner la date de vos règles la plus récente :</Text>
      </View>
      <View style={styles.calendarContainer}>
        <Calendar
          style={styles.calendar}
          onDayPress={onDayPress}
          markedDates={{
            ...(ruleStartDate && {
              [ruleStartDate]: { selected: true, selectedColor: "#FF4081", selectedTextColor: "white" },
            }),
          }}
          theme={{
            selectedDayBackgroundColor: "#FF4081",
            selectedDayTextColor: "white",
            arrowColor: "#FF4081",
            todayTextColor: "#4C6EF5",
            textDayFontSize: 14, 
            textMonthFontSize: 14, 
            textDayHeaderFontSize: 14,
            
          }}
        />

      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Durée des cycles (en jours) :</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez la durée"
          keyboardType="numeric"
          value={cycleLength}
          onChangeText={setCycleLength}
        />
      </View>

      <View style={styles.checkboxContainer}>
        <Text style={styles.label}>Symptômes :</Text>

        <View style={styles.checkboxCategory}>
          <Text style={styles.checkboxCategoryTitle}>Physiques :</Text>
          {symptoms && symptoms.physiques && symptoms.physiques.length > 0 ? (
            symptoms.physiques.map((symptom_physique) => (
              <View style={styles.checkboxRow} key={symptom_physique.id_symptom}>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    value={!!selectedSymptoms[symptom_physique.id_symptom]}
                    onValueChange={() => handleCheckboxChange(symptom_physique.id_symptom)}
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxLabel}>{symptom_physique.title}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataMessage}>No physical symptoms available</Text>
          )}
        </View>

        <View style={styles.checkboxCategory}>
          <Text style={styles.checkboxCategoryTitle}>Émotionnels :</Text>
          {symptoms && symptoms.emotions && symptoms.emotions.length > 0 ? (
            symptoms.emotions.map((symptom_emotion) => (
              <View style={styles.checkboxRow} key={symptom_emotion.id_symptom}>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    value={!!selectedSymptoms[symptom_emotion.id_symptom]}
                    onValueChange={() => handleCheckboxChange(symptom_emotion.id_symptom)}
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxLabel}>{symptom_emotion.title}</Text>
                </View>
              </View>
                  ))
                ) : (
                  <Text style={styles.noDataMessage}>No symptoms available</Text>
                )}
              </View>
      </View>

      <View style={styles.containerRegle}>
        <Text style={styles.label}>Durée des règles (en jours) :</Text>
        <Picker
          selectedValue={ruleDuration}
          onValueChange={(itemValue) => setRuleDuration(itemValue)}
          style={styles.picker}
        >
          {durations.map((duration, index) => (
            <Picker.Item key={index} label={`${duration} jour(s)`} value={duration} />
          ))}
        </Picker>
      </View>

      <View style={styles.containerRegle}>
        <Text style={styles.label}>Type de règle :</Text>
        <Picker
          selectedValue={regleType}
          onValueChange={(itemValue) => setRegleType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Régulier" value="regulier" />
          <Picker.Item label="Irrégulier" value="irregulier" />
        </Picker>
      </View>

     
      <TouchableOpacity onPress={handleSubmit}>
            <LinearGradient
              colors={['#FF7F50', '#FF1493']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Enregistrer</Text>
            </LinearGradient>
          </TouchableOpacity>

      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.card} onPress={() => alert("Signaler un symptôme")}>
          <Ionicons name="medkit" size={30} color="orange" />
          <Text style={styles.cardText}>Symptômes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert("Signaler vos règles")}>
          <Ionicons name="water" size={30} color="orange" />
          <Text style={styles.cardText}>Règles</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert("Signaler ovulation")}>
          <Ionicons name="leaf" size={30} color="orange" />
          <Text style={styles.cardText}>Ovulation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F7F7F7", 
  },
  containerHeader: {
    backgroundColor: '#dddd',
    padding: 10,
    marginVertical: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF007F",
    justifyContent:'center',
    alignItems:'center',
    marginTop: 25,
    padding:5
    
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#34495E", 
  },
  calendarContainer:{
    justifyContent: 'center',
    alignItems: 'center',
    padding:5
  },
  calendar: {
    borderRadius: 8,
    overflow: "hidden",
    width: 370,
    height: 310,    
  },

  checkboxContainer: {
    backgroundColor: '#FFC0CB33',
    padding: 10,
    borderRadius: 8,
    width: 370,
    marginLeft:5
  },
  checkboxCategory: {
    marginBottom: 10
  },
  checkboxCategoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "orange", 
    marginBottom: 10
  },
  checkboxRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    
    
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom:2

  },
  checkbox: {
    marginRight: 7,
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 3,
    backgroundColor: "white",
  },
  checkboxLabel: {
    fontSize: 12,
  },
   containerRegle:{
    flexDirection: "row",
    width: 190,
    alignItems:'center',
    marginVertical : 2,
    backgroundColor: "#F7F7F7",
    padding: 5,
    borderRadius: 8,
  },
  picker: {
    backgroundColor:"#FFC0CB33",
    height: 52,
    width: 150,
    borderWidth: 5,
    borderColor: "#FFC0CB33",
    borderRadius: 8,
    
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    backgroundColor: "#FFC0CB33",
    padding: 10,
    borderRadius: 10,
    marginBottom:20,
    alignItems:"center"
  },
  card: {
    alignItems: "center",
    padding: 15,
    width: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom:20
  },
  cardText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    color: "#34495E",
  },
  inputContainer: {
    padding : 5,
    paddingVertical : 7,
    gap:7
  },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  button: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 5
  },
});

export default CycleManagementScreen;
