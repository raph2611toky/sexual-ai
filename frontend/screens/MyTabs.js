import React from 'react';
import { View, StyleSheet, Text, Animated, TouchableOpacity, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import QuizScreen from './QuizScreen';
import Home from './Home';
import DiscussionScreen from './DiscussionScreen';
import MenstruationTrackingScreen from './OvulationTrackingScreen';


const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }) {
  const { colors } = useTheme();

  const icons = {
    "IA SEXUEL": "comments",
    'forum': "comment-alt",
    "Suivi menstruation": "calendar-alt",
    "Quiz": "question-circle",
  };

  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Animated.View
              style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}
            >
              <FontAwesome5
                name={icons[route.name] || 'home'}
                size={25}  
                color={isFocused ? 'orange' : 'grey'} 
              />
            </Animated.View>
            <Text
              style={[
                styles.tabLabel,
                isFocused && styles.tabLabelFocused,
                { color: isFocused ? 'orange' : 'grey' }, 
              ]}
            >
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MyTabs({ navigation }) {
  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Image
          source={require('../assets/sexual.png')}
          style={styles.titreImage}
        />
        <TouchableOpacity onPress={handleSettings}>
          <Ionicons name="menu" size={28} color="grey" /> 
        </TouchableOpacity>
      </View>

      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <MyTabBar {...props} />}
      > 
        <Tab.Screen name="forum" component={Home} /> 
        <Tab.Screen name="IA SEXUEL" component={DiscussionScreen} />
        <Tab.Screen name="Suivi menstruation" component={MenstruationTrackingScreen} />
        <Tab.Screen name="Quiz" component={QuizScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 19,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingTop: 50,
  },
  titreImage: {
    height: 63,
    width: 160,
    resizeMode: 'contain',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 8, 
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60, 
    height: 58, 
    borderRadius: 30, 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerFocused: {
    backgroundColor: '#ddd',
    transform: [{ translateY: -15 }], 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tabLabel: {
    fontSize: 11,  
    textAlign: 'center',
    marginTop: 1, 
    fontWeight: 'bold',
  },
  tabLabelFocused: {
    marginTop: -2, 
  },
});
