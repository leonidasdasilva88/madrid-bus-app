import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { fetchNearbyStops } from "../api/client";

export default function NearbyStopsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stops, setStops] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Necesitamos permiso de ubicación para buscar paradas cercanas.");
          setLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = position.coords;

        const data = await fetchNearbyStops(latitude, longitude);
        // TODO: ajustar según la forma real de la respuesta de la API de EMT
        setStops(data?.data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Buscando paradas cercanas…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={stops}
      keyExtractor={(item, idx) => item.stopId ?? String(idx)}
      contentContainerStyle={{ padding: 16, gap: 8 }}
      renderItem={({ item }) => (
        <Pressable
          style={styles.stopItem}
          onPress={() =>
            navigation.navigate("StopDetail", { stopId: item.stopId })
          }
        >
          <Text style={styles.stopName}>{item.stopName ?? `Parada ${item.stopId}`}</Text>
          <Text style={styles.stopMeta}>Nº {item.stopId}</Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>No se encontraron paradas cercanas.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 8 },
  error: { color: "#c62828", textAlign: "center" },
  stopItem: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 16,
  },
  stopName: { fontSize: 16, fontWeight: "600" },
  stopMeta: { color: "#666", marginTop: 4 },
});
