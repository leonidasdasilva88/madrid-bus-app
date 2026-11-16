import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getFavorites, removeFavorite } from "../utils/favorites";

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  // Recarga la lista cada vez que se vuelve a esta pantalla (por ejemplo,
  // después de añadir una nueva parada como favorita desde StopDetail).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const data = await getFavorites();
        if (active) setFavorites(data);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const handleRemove = async (stopId) => {
    const updated = await removeFavorite(stopId);
    setFavorites(updated);
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Aún no tienes favoritos</Text>
        <Text style={styles.emptySubtitle}>
          Guarda una parada desde la pantalla de llegadas pulsando "☆ Guardar".
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.stopId}
      contentContainerStyle={{ padding: 16, gap: 8 }}
      renderItem={({ item }) => (
        <View style={styles.favItem}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => navigation.navigate("StopDetail", { stopId: item.stopId })}
          >
            <Text style={styles.stopName}>{item.stopName ?? `Parada ${item.stopId}`}</Text>
            <Text style={styles.stopMeta}>Nº {item.stopId}</Text>
          </Pressable>
          <Pressable onPress={() => handleRemove(item.stopId)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>✕</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  emptySubtitle: { fontSize: 14, color: "#666", textAlign: "center" },
  favItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 16,
  },
  stopName: { fontSize: 16, fontWeight: "600" },
  stopMeta: { color: "#666", marginTop: 4 },
  removeButton: { padding: 8, marginLeft: 8 },
  removeButtonText: { fontSize: 18, color: "#c62828" },
});
