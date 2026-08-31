import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import SearchStopScreen from "../screens/SearchStopScreen";
import NearbyStopsScreen from "../screens/NearbyStopsScreen";
import StopDetailScreen from "../screens/StopDetailScreen";
import FavoritesScreen from "../screens/FavoritesScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Madrid Bus" }} />
        <Stack.Screen name="SearchStop" component={SearchStopScreen} options={{ title: "Buscar parada" }} />
        <Stack.Screen name="NearbyStops" component={NearbyStopsScreen} options={{ title: "Paradas cercanas" }} />
        <Stack.Screen name="StopDetail" component={StopDetailScreen} options={{ title: "Llegadas" }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Favoritos" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
