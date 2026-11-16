import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { fetchNearbyStops } from "../api/client";

const GPS_TIMEOUT_MS = 15000;

// Obtiene la posición con un tiempo límite; si el GPS no responde, usa la última
// ubicación conocida del móvil (suficiente para buscar paradas a ~300 m).
async function getPosition() {
  const servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn) {
    throw new Error("La ubicación del móvil está desactivada. Actívala e inténtalo de nuevo.");
  }

  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), GPS_TIMEOUT_MS));
  const current = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const position = await Promise.race([current, timeout]);
  if (position) return position;

  const lastKnown = await Location.getLastKnownPositionAsync();
  if (lastKnown) return lastKnown;

  throw new Error("No se pudo obtener tu ubicación. Prueba a salir a un lugar con mejor señal.");
}

export default function NearbyStopsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Obteniendo tu ubicación…");
  const [error, setError] = useState(null);
  const [stops, setStops] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStatus("Obteniendo tu ubicación…");
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== "granted") {
        throw new Error("Necesitamos permiso de ubicación para buscar paradas cercanas.");
      }

      const position = await getPosition();
      const { latitude, longitude } = position.coords;

      setStatus("Buscando paradas cercanas…");
      const data = await fetchNearbyStops(latitude, longitude);
      setStops(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>{status}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={stops}
      keyExtractor={(item, idx) => String(item.stopId ?? idx)}
      contentContainerStyle={{ padding: 16, gap: 8 }}
      renderItem={({ item }) => {
        // La API puede devolver el nombre como "name" o "stopName" según la versión.
        const name = item.name ?? item.stopName ?? `Parada ${item.stopId}`;
        return (
          <Pressable
            style={styles.stopItem}
            onPress={() => navigation.navigate("StopDetail", { stopId: String(item.stopId) })}
          >
            <Text style={styles.stopName}>{name}</Text>
            <Text style={styles.stopMeta}>Nº {item.stopId}</Text>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>No se encontraron paradas cercanas.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  error: { color: "#c62828", textAlign: "center" },
  retryButton: {
    backgroundColor: "#1565c0",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryText: { color: "white", fontWeight: "600" },
  stopItem: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 16,
  },
  stopName: { fontSize: 16, fontWeight: "600" },
  stopMeta: { color: "#666", marginTop: 4 },
});
