import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

export default function SearchStopScreen({ navigation }) {
  const [stopId, setStopId] = useState("");

  const handleSearch = () => {
    if (!stopId.trim()) return;
    navigation.navigate("StopDetail", { stopId: stopId.trim() });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Número de parada</Text>
      <TextInput
        style={styles.input}
        value={stopId}
        onChangeText={setStopId}
        placeholder="Ej. 71"
        keyboardType="number-pad"
      />
      <Pressable style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Ver llegadas</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, justifyContent: "center" },
  label: { fontSize: 16, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
  },
  button: {
    backgroundColor: "#1565c0",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
