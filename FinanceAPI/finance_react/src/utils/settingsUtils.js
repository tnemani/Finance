// Utility to fetch all settings and build a symbol->value map
import axios from 'axios';
const API_URL = 'http://localhost:5226/api/Settings';
export async function fetchSymbolSettingsMap() {
  console.log('[fetchSymbolSettingsMap] Fetching settings from', API_URL);
  const res = await axios.get(API_URL);
  console.log('[fetchSymbolSettingsMap] Received data:', res.data);
  // Build a map: key (symbol) -> value (number)
  const map = {};
  for (const s of res.data) {
    if (s.key && s.value && !isNaN(Number(s.value))) {
      map[s.key.trim()] = Number(s.value);
    }
  }
  console.log('[fetchSymbolSettingsMap] Built symbol-value map:', map);
  return map;
}
