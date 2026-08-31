import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { fetchArrivals } from "../api/client";
import { addFavorite, getFavorites } from "../utils/favorites";

const REFRESH_INTERVAL_MS = 20000; // 20s

export default function StopDetailScreen({ route }) {
  const { stopId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [arrivals, setArrivals] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    (async () => {
      const favs = await getFavorites();
      setIsFavorite(favs.some((f) => f.stopId === stopId));
    })();
  }, [stopId]);

  const handleAddFavorite = async () => {
    await addFavorite({ stopId });
    setIsFavorite(true);
  };

  const load = useCallback(async () => {
    try {
      const data = await fetchArrivals(stopId);
      // TODO: ajustar según la forma real de la respuesta de la API de EMT
      setArrivals(data?.data?.[0]?.Arrive ?? []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [stopId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando llegadas…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parada {stopId}</Text>
        <Pressable
          onPress={handleAddFavorite}
          disabled={isFavorite}
          style={styles.favButton}
        >
          <Text style={styles.favButtonText}>
            {isFavorite ? "★ Guardada" : "☆ Guardar"}
          </Text>
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={arrivals}
        keyExtractor={(item, idx) => `${item.line}-${idx}`}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => {
          // EMT usa 999999 como valor "sin estimación fiable" — no es un tiempo real.
          const noEstimate = !item.estimateArrive || item.estimateArrive >= 999999;
          return (
            <View style={styles.arrivalItem}>
              <View>
                <Text style={styles.line}>Línea {item.line}</Text>
                <Text style={styles.destination}>{item.destination}</Text>
              </View>
              <Text style={styles.minutes}>
                {noEstimate ? "―" : `${Math.round(item.estimateArrive / 60)} min`}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No hay llegadas previstas ahora mismo.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 8 },
  error: { color: "#c62828", textAlign: "center", padding: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  favButton: { padding: 8 },
  favButtonText: { color: "#1565c0", fontWeight: "600" },
  arrivalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 16,
  },
  line: { fontSize: 16, fontWeight: "600" },
  destination: { fontSize: 13, color: "#666", marginTop: 2 },
  minutes: { fontSize: 16, fontWeight: "700", color: "#1565c0" },
});
