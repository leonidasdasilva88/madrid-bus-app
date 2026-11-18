import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { fetchNearbyStops } from "../api/client";

const GPS_TIMEOUT_MS = 12000;

// Cualquier paso que se cuelgue acaba en error en vez de esperar para siempre.
function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function ensurePermission() {
  const current = await withTimeout(
    Location.getForegroundPermissionsAsync(),
    8000,
    "No se pudo comprobar el permiso de ubicación."
  );
  if (current.status === "granted") return;
  const asked = await withTimeout(
    Location.requestForegroundPermissionsAsync(),
    60000,
    "No se obtuvo respuesta al permiso de ubicación."
  );
  if (asked.status !== "granted") {
    throw new Error("Necesitamos permiso de ubicación para buscar paradas cercanas.");
  }
}

// 1) Ubicación reciente del móvil (instantánea). 2) Si no hay, pide una nueva con
// precisión baja (más rápida y fiable). Para buscar paradas a ~300 m basta.
async function getPosition() {
  const recent = await withTimeout(
    Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 }),
    5000,
    "No se pudo leer la última ubicación."
  ).catch(() => null);
  if (recent) return recent;

  try {
    return await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
      GPS_TIMEOUT_MS,
      "El móvil no consigue tu ubicación. Comprueba que la ubicación está activada y prueba a salir a un sitio con mejor señal."
    );
  } catch (err) {
    const old = await Location.getLastKnownPositionAsync().catch(() => null);
    if (old) return old;
    throw err;
  }
}

export default function NearbyStopsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Obteniendo tu ubicación…");
  const [error, setError] = useState(null);
  const [stops, setStops] = useState([]);
  const [elapsed, setElapsed] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setElapsed(0);
    const t0 = Date.now();
    const log = (m) => console.log(`[Cercanas +${Date.now() - t0}ms] ${m}`);
    try {
      setStatus("Comprobando permiso de ubicación…");
      await ensurePermission();
      log("permiso ok");

      setStatus("Obteniendo tu ubicación…");
      const position = await getPosition();
      const { latitude, longitude } = position.coords;
      log("ubicación obtenida");

      setStatus("Buscando paradas cercanas…");
      const data = await fetchNearbyStops(latitude, longitude);
      log("respuesta del servidor");
      const list = Array.isArray(data?.data) ? data.data : [];
      list.sort((a, b) => (a.metersToPoint ?? 0) - (b.metersToPoint ?? 0));
      setStops(list);
    } catch (err) {
      log(`error: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Contador de segundos mientras carga (ayuda a ver en qué paso se queda)
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>{status}</Text>
        <Text style={styles.elapsed}>{elapsed} s</Text>
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
        const name = item.stopName ?? item.name ?? `Parada ${item.stopId}`;
        const lines = Array.isArray(item.lines)
          ? [...new Set(item.lines.map((l) => l.label))].join(", ")
          : "";
        return (
          <Pressable
            style={styles.stopItem}
            onPress={() => navigation.navigate("StopDetail", { stopId: String(item.stopId) })}
          >
            <Text style={styles.stopName}>{name}</Text>
            <Text style={styles.stopMeta}>
              Nº {item.stopId}
              {item.metersToPoint != null ? ` · a ${item.metersToPoint} m` : ""}
            </Text>
            {lines ? <Text style={styles.stopLines}>Líneas: {lines}</Text> : null}
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
  elapsed: { color: "#888", fontSize: 12 },
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
  stopLines: { color: "#1565c0", marginTop: 4, fontSize: 13 },
});
