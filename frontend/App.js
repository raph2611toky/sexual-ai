import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import Signup from './screens/Signup';
import Login from './screens/Login';
import MyTabs from './screens/MyTabs';
import QuizScreen from './screens/QuizScreen';
import Comment from './screens/Comment'
import OvulationTrackingScreen from './screens/OvulationTrackingScreen'
import CycleManagementScreen from './screens/CycleManagementScreen';
import DiscussionScreen from './screens/DiscussionScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}  
        />
        
        <Stack.Screen 
          name="Signup" component={Signup}  
          options={{ headerShown: false }}  
        />
        <Stack.Screen 
          name="Login" component={Login}  
          options={{ headerShown: false }}  
        />
        <Stack.Screen 
          name="DiscussionScreen" component={DiscussionScreen}  
          options={{ headerShown: false }}  
        />
        <Stack.Screen 
          name="MyTabs" component={MyTabs}  
          options={{ headerShown: false }}  
        /> 
        <Stack.Screen 
          name="CycleManagementScreen" component={CycleManagementScreen}  
          options={{ headerShown: false }}  
        /> 
        
        <Stack.Screen 
          name="Comment" component={Comment}  
          options={{ headerShown: false }}  
        />
         <Stack.Screen 
          name="OvulationTrackingScreen" component={OvulationTrackingScreen}  
          options={{ headerShown: false }}  
        />
      </Stack.Navigator>
    </NavigationContainer>                
  );
}
