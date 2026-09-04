import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkspaceScreen from '../screens/workspace/WorkspaceScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0a1a' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Workspace" component={WorkspaceScreen} />
    </Stack.Navigator>
  );
}
