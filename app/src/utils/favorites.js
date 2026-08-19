import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@madrid_bus_app:favorites";

export async function getFavorites() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addFavorite(stop) {
  const current = await getFavorites();
  const exists = current.some((s) => s.stopId === stop.stopId);
  if (exists) return current;
  const updated = [...current, stop];
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export async function removeFavorite(stopId) {
  const current = await getFavorites();
  const updated = current.filter((s) => s.stopId !== stopId);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}
