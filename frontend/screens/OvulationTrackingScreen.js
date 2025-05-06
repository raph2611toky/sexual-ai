import React, { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet, View, Dimensions, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from './config';
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native"; 
import { useCallback } from "react";

const { width } = Dimensions.get("window");

function MenstruationTrackingScreen({ navigation }) {
  const [insights, setInsights] = useState("");
  const [days, setDays] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");

        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const userToken = userData.id;

          if (userToken) {
            const response = await axios.get(`${config.apiUrl}/predict/info/`, {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            });

            if (Array.isArray(response.data.date_range)) {
              const mappedDays = response.data.date_range.map(item => ({
                day: new Date(item.day),
                status: item.status,
              }));
              setDays(mappedDays);
            }

            setInsights(response.data.advice || "Aucun conseil disponible, Veuillez entrer vos donnée.");
          }
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Erreur", "Impossible de récupérer les données du backend");
      }
    };

    fetchData(); // Appel initial des données
  }, []);

  const handleDayPress = (day) => {
    setInsights(`Analyse pour ${day.day.toLocaleDateString("fr-FR")}: ` + (day.status === "fertile" ? "Période fertile." : "Période normale."));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Suivi Menstruel Alimenté par l'IA</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalCalendar}
      >
        <View style={styles.calendarRow}>
          {days.length > 0 && days.slice(0, 9).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                item.status === "menstruation" && styles.menstruationDay,
                item.status === "fertile" && styles.fertileDay,
              ]}
              onPress={() => handleDayPress(item)}
            >
              <Text style={styles.dayText}>{item.day.getDate()}</Text>
              <Text style={styles.daySubText}>{item.day.toLocaleDateString("fr-FR", { month: "short" })}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.calendarRow}>
          {days.length > 0 && days.slice(9, 18).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                item.status === "menstruation" && styles.menstruationDay,
                item.status === "fertile" && styles.fertileDay,
              ]}
              onPress={() => handleDayPress(item)}
            >
              <Text style={styles.dayText}>{item.day.getDate()}</Text>
              <Text style={styles.daySubText}>{item.day.toLocaleDateString("fr-FR", { month: "short" })}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.calendarRow}>
          {days.length > 0 && days.slice(18, 27).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                item.status === "menstruation" && styles.menstruationDay,
                item.status === "fertile" && styles.fertileDay,
              ]}
              onPress={() => handleDayPress(item)}
            >
              <Text style={styles.dayText}>{item.day.getDate()}</Text>
              <Text style={styles.daySubText}>{item.day.toLocaleDateString("fr-FR", { month: "short" })}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.calendarRow}>
          {days.length > 0 && days.slice(26, 38).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                item.status === "menstruation" && styles.menstruationDay,
                item.status === "fertile" && styles.fertileDay,
              ]}
              onPress={() => handleDayPress(item)}
            >
              <Text style={styles.dayText}>{item.day.getDate()}</Text>
              <Text style={styles.daySubText}>{item.day.toLocaleDateString("fr-FR", { month: "short" })}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, styles.menstruationDay]} />
          <Text style={styles.legendDescription}>Règles (durée estimée de 3 à 5 jours)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, styles.fertileDay]} />
          <Text style={styles.legendDescription}>Période fertile</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: "#eee" }]} />
          <Text style={styles.legendDescription}>Période normale</Text>
        </View>
      </View>

      {/* <View style={styles.insightsSection}>
        <Text style={styles.insightsText}>{insights}</Text>
      </View> */}

      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
            onPress={() => navigation.navigate("CycleManagement")}
            style={{ borderRadius: 10, overflow: "hidden" }} 
            >
            <LinearGradient
                colors={["#FF7F50", "#FF1493"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
            >
                <Text style={styles.buttonText}>Gérer mon cycle menstruel</Text>
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  horizontalCalendar: {
    paddingVertical: 1,
    flexDirection: "column", 
  },
  calendarRow: {
    flexDirection: "row", 
  },
  dayContainer: {
    width: width * 0.159,
    height: 60,
    marginHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#eee",
    marginBottom: 10,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  daySubText: {
    fontSize: 12,
    color: "#555",
  },
  menstruationDay: {
    backgroundColor: "#ffcccc",
  },
  fertileDay: {
    backgroundColor: "#ccffcc",
  },
  insightsSection: {
    marginHorizontal: 6,
    padding: 25,
    borderRadius: 10,
    backgroundColor: "#e8f5e9",
  },
  insightsText: {
    fontSize: 14,
    color: "gray",
    fontWeight: "bolder", 
  },
  legendContainer: {
    marginHorizontal: 6,
    padding: 16,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderRadius: 10,
  },
  legendDescription: {
    fontSize: 16,
    color: "#555",
  },
  buttonContainer: {
    marginVertical: 0,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  gradientButton: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    
  },
  buttonText :{
    color:"white",
    fontWeight: 800
  }
  
});

export default MenstruationTrackingScreen;
