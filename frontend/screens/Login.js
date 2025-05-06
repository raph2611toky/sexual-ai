import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from './config';
const Login = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [animationValue, setAnimationValue] = useState(new Animated.Value(1));

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    Animated.timing(animationValue, {
      toValue: 0.5,
      duration: 200,
      useNativeDriver: true,
    }).start();

    try {
      const response = await axios.post(`${config.apiUrl}/login/`, { email, password });

      await AsyncStorage.setItem('userData', JSON.stringify({ 
        
        id: response.data.access, 
         
      }));

      setUserId(response.data.access);
      
      

      navigation.navigate('DiscussionScreen');
    } catch (err) {
      //navigation.navigate('MyTabs', { userId: response.data.access });
    } finally {
      setTimeout(() => {
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue! 👋</Text>
        <Text style={styles.subtitle}>Bonjour, ta santé reproductive est notre priorité!</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={24} color="orange" style={styles.inputIcon} />
          <TextInput
            placeholder="Adresse Email"
            value={email}
            onChangeText={text => setEmail(text)}
            style={[styles.input, isEmailFocused && styles.inputFocused]}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={24} color="orange" style={styles.inputIcon} />
          <TextInput
            placeholder="Mot de passe"
            value={password}
            onChangeText={text => setPassword(text)}
            secureTextEntry={!isPasswordShown}
            style={[styles.input, isPasswordFocused && styles.inputFocused]}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
          />
          <TouchableOpacity onPress={() => setIsPasswordShown(!isPasswordShown)}>
            <Ionicons name={isPasswordShown ? 'eye-off' : 'eye'} size={24} color="orange" />
          </TouchableOpacity>
        </View>

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isChecked}
            onValueChange={setIsChecked}
            color="orange"
            style={styles.checkbox}
          />
          <Text>Se souvenir de moi</Text>
        </View>

        {/* Animated Login Button */}
        <Animated.View style={[styles.buttonContainer, { opacity: animationValue }]}>
          <TouchableOpacity onPress={handleLogin}>
            <LinearGradient
              colors={['#FF7F50', '#FF1493']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Connexion</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Navigation vers l'inscription */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Je n'ai pas de compte</Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={[styles.signupText, { color: 'orange', marginLeft: 5 }]}>S'inscrire</Text>
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
    marginBottom: 16,
    color: 'noir',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 22,
    color: '#FF7F50',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 8,
    height: 55,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
  },
  inputFocused: {
    borderColor: '#FF1493',
  },
  inputIcon: {
    marginRight: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
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
    letterSpacing: 5,
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

export default Login;
