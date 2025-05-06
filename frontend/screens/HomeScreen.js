import { View, Image, TouchableOpacity, Text } from "react-native";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Roboto_400Regular, Roboto_700Bold, useFonts  } from "@expo-google-fonts/roboto";
function HomeScreen({ navigation }) {
  const handleStart = () => {
    navigation.navigate('Signup');
  };
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  return (
    <View style={styles.container}>
      
      <View style={styles.containerHaut}>
        <Image
          source={require('../assets/couverture.png')}
          style={styles.image}
        />
      </View>

    
      <View style={styles.containerBas}>
        <View style={styles.textContainer}>
          <View style={styles.titre}>
           
            <View style={styles.containerImage}>
              <Image
                source={require('../assets/sexual.png')}
                style={styles.titreImage}
              />
            </View>

           
            <View style={styles.containerText}>
              <Text style={styles.text}>
                Prenez soin de votre santé sexuelle informations, conseils et bien-être à portée de main.
              </Text>
            </View>
          </View>
        </View>

        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonStart} onPress={handleStart}>
            <LinearGradient
                colors={["#FF7F50", "#FF1493"]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startText}>Commencer</Text>
              </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerHaut: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: "15%",
  },
  image: {
    marginTop: 25,
    width: '90%',
    height: '100%',
    resizeMode: 'contain',
  },
  containerBas: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: "space-between"
    
    
  },
  textContainer: {
    width: '66%',
    alignItems: 'center',
  },
  titre: {
    alignItems: 'center',
   
  },
  containerImage: {
    backgroundColor: "white",
  },
  titreImage: {
    height: 155,
    width: 1000,
    resizeMode: 'contain',
  },
  containerText: {
    alignItems: 'center',
    height: 70,
    justifyContent: 'center'
    
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
    fontWeight: 800,
    fontFamily: "Roboto_400Regular",
  },
  buttonContainer: {
    width: '90%',
    height: '50%',
    justifyContent:'center',
    alignItems: "center"
  },
  buttonStart: {
    borderRadius: 10,
  },
  gradient: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    paddingHorizontal: 65,
  },
  startText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 5
  },
});

export default HomeScreen;
