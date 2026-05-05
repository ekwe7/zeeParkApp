import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const getMapHtml = (lat, lng) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { height: 100%; width: 100%; }
    .leaflet-control-attribution { display: none; }
    .custom-marker {
      background: #1A73E8;
      border: 3px solid white;
      border-radius: 50%;
      width: 18px; height: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    .pulse {
      background: rgba(26,115,232,0.2);
      border-radius: 50%;
      width: 40px; height: 40px;
      position: absolute;
      top: -11px; left: -11px;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2); opacity: 0; }
    }
    .parking-marker {
      background: #34A853;
      border: 2px solid white;
      border-radius: 6px;
      padding: 3px 6px;
      color: white;
      font-size: 11px;
      font-weight: bold;
      font-family: sans-serif;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 16);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Current location marker with pulse
    var userIcon = L.divIcon({
      html: '<div class="pulse"></div><div class="custom-marker"></div>',
      className: '',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    L.marker([${lat}, ${lng}], { icon: userIcon }).addTo(map);

    // Simulated nearby parking spots
    var spots = [
      { lat: ${lat} + 0.002, lng: ${lng} + 0.001, name: 'Zone A', free: 5 },
      { lat: ${lat} - 0.001, lng: ${lng} + 0.003, name: 'Zone B', free: 2 },
      { lat: ${lat} + 0.003, lng: ${lng} - 0.002, name: 'Zone C', free: 8 },
    ];

    spots.forEach(function(spot) {
      var icon = L.divIcon({
        html: '<div class="parking-marker">P ' + spot.name + ' (' + spot.free + ')</div>',
        className: '',
        iconAnchor: [0, 0]
      });
      L.marker([spot.lat, spot.lng], { icon: icon })
        .addTo(map)
        .bindPopup('<b>' + spot.name + '</b><br>' + spot.free + ' spots free');
    });

    // Accuracy circle
    L.circle([${lat}, ${lng}], {
      radius: 80,
      color: '#1A73E8',
      fillColor: '#1A73E8',
      fillOpacity: 0.08,
      weight: 1
    }).addTo(map);

    // Listen for location updates from React Native
    window.addEventListener('message', function(e) {
      try {
        var data = JSON.parse(e.data);
        if (data.type === 'location') {
          map.setView([data.lat, data.lng], 16);
        }
      } catch(err) {}
    });
  </script>
</body>
</html>
`;

export default function MapView({ style }) {
  const { theme } = useTheme();
  const webRef = useRef(null);
  const [location, setLocation] = useState({ latitude: 6.5244, longitude: 3.3792 });
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    } catch (e) {
      console.log('Location error:', e.message);
    } finally {
      setLocating(false);
    }
  };

  const centerOnUser = () => {
    if (webRef.current) {
      webRef.current.postMessage(JSON.stringify({
        type: 'location',
        lat: location.latitude,
        lng: location.longitude,
      }));
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html: getMapHtml(location.latitude, location.longitude) }}
        style={styles.map}
        scrollEnabled={false}
        javaScriptEnabled
      />
      {/* Locate me button */}
      <TouchableOpacity
        style={[styles.locateBtn, { backgroundColor: theme.background }]}
        onPress={centerOnUser}
      >
        <Ionicons
          name={locating ? 'locate-outline' : 'locate'}
          size={22}
          color={theme.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  locateBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
