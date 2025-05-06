import React from 'react';
import { View, Text, Button } from 'react-native';

export default function DetailsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Écran des détails</Text>
      <Button title="Retourner" onPress={() => navigation.goBack()} />
    </View>
  );
}
