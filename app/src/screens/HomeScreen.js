import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚌 Madrid Bus</Text>
      <Text style={styles.subtitle}>¿Cómo quieres buscar tu parada?</Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate("SearchStop")}
      >
        <Text style={styles.buttonText}>Buscar por número de parada</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate("NearbyStops")}
      >
        <Text style={styles.buttonText}>Ver paradas cercanas</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 16 },
  title: { fontSize: 32, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center", color: "#555", marginBottom: 24 },
  button: {
    backgroundColor: "#1565c0",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
