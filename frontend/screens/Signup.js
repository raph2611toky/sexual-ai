import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import config from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';   
import axios from 'axios';  

const Signup = ({ navigation }) => {

  const genre = 'feminin'; 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const handleSignup = async () => {
    if (!isChecked) {
      Alert.alert('Erreur', 'Veuillez accepter les conditions et les politiques.');
      return;
    }

    if (!username.trim() || !email.trim() || !password.trim() || !genre.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${config.apiUrl}/register/`, {
        name: username,
        email,
        password,
        sexe: genre,
        birth_date: formatDate(dob),
        phone_number: "+261"+phoneNumber
      });

      if (response.status === 201) {
        Alert.alert('Succès', 'Inscription réussie !');
        navigation.navigate('Login');
      } else {
        Alert.alert('Erreur', 'Une erreur inattendue est survenue.');
      }
    } catch (error) {
      console.error(error);
      
    }

    setIsLoading(false);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(false);
    setDob(currentDate);
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Créer votre compte! 👋</Text>
        <Text style={styles.subtitle}>Connectez-vous au monde!</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person" size={24} color="orange" style={styles.inputIcon} />
          <TextInput
            placeholder="Nom"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={24} color="orange" style={styles.inputIcon} />
          <TextInput
            placeholder="Adresse Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>

      
        <View style={styles.inputContainer}>
          <Ionicons name="calendar" size={24} color="orange" style={styles.inputIcon} />
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text style={styles.inputText}>{dob.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

      
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={24} color="orange" style={styles.inputIcon} />
          <TextInput
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="call" size={24} color="orange" style={styles.inputIcon} />
          <Text style={styles.prefix}>+261</Text>
          <TextInput
            placeholder="Numéro de téléphone"
            value={phoneNumber}
            onChangeText={(text) => {
              const filteredText = text.replace(/[^0-9]/g, '');
              if (filteredText.length <= 9) {
                setPhoneNumber(filteredText);
              }
            }}
            keyboardType="numeric"
            style={[styles.input, { marginLeft: 5 }]}
          />
        </View>

        
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isChecked}
            onValueChange={setIsChecked}
            color="orange"
            style={styles.checkbox}
          />
          <Text>J'accepte les conditions et les politiques</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="orange" />
        ) : (
          <TouchableOpacity onPress={handleSignup}>
            <LinearGradient
              colors={['#FF7F50', '#FF1493']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Inscription</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>J'ai déjà un compte</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.signupText, { color: 'orange', marginLeft: 5 }]}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 8,
    height: 55,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
  },
  inputIcon: {
    marginRight: 10,
    color: 'orange',
  },
  inputText: {
    fontSize: 16,
    color: 'orange',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    marginRight: 10,
  },
  button: {
    width: '100%',
    padding: 13,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 5
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
  },
});

export default Signup;
