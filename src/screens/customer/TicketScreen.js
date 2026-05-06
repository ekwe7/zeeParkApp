import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useTheme } from '../../contexts/ThemeContext';

export default function TicketScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { sessionId } = route.params || {};
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch ticket for this session
    client.post('/api/tickets/search', { sessionId })
      .then(res => setTicket(res.data))
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Ionicons name="ticket" size={48} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>Your Ticket</Text>
        <Text style={[styles.sub, { color: theme.subtext }]}>Show this at the exit gate</Text>
      </View>

      <View style={[styles.ticketCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Dashed top border effect */}
        <View style={[styles.dashedLine, { borderColor: theme.border }]} />

        <View style={styles.ticketRow}>
          <Text style={[styles.ticketLabel, { color: theme.subtext }]}>Ticket ID</Text>
          <Text style={[styles.ticketValue, { color: theme.text }]} numberOfLines={1}>
            {ticket?.id?.slice(-12)?.toUpperCase() || sessionId?.slice(-12)?.toUpperCase()}
          </Text>
        </View>

        <View style={styles.ticketRow}>
          <Text style={[styles.ticketLabel, { color: theme.subtext }]}>Session ID</Text>
          <Text style={[styles.ticketValue, { color: theme.text }]} numberOfLines={1}>
            {sessionId?.slice(-12)?.toUpperCase()}
          </Text>
        </View>

        <View style={styles.ticketRow}>
          <Text style={[styles.ticketLabel, { color: theme.subtext }]}>Issued At</Text>
          <Text style={[styles.ticketValue, { color: theme.text }]}>
            {ticket?.issuedAt
              ? new Date(ticket.issuedAt).toLocaleString()
              : new Date().toLocaleString()}
          </Text>
        </View>

        {/* Barcode-style visual */}
        <View style={styles.barcodeWrap}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View
              key={i}
              style={[styles.barLine, {
                backgroundColor: theme.text,
                height: i % 3 === 0 ? 40 : i % 2 === 0 ? 32 : 24,
                opacity: i % 4 === 0 ? 1 : 0.4,
              }]}
            />
          ))}
        </View>

        <Text style={[styles.scanNote, { color: theme.subtext }]}>
          Scan at exit gate to verify
        </Text>

        <View style={[styles.dashedLine, { borderColor: theme.border }]} />
      </View>

      <TouchableOpacity
        style={[styles.doneBtn, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('Tickets')}
      >
        <Text style={styles.doneBtnText}>Go to Active Session</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 32, gap: 8 },
  title: { fontSize: 26, fontWeight: '800' },
  sub: { fontSize: 14 },
  ticketCard: {
    width: '100%', borderRadius: 20, borderWidth: 1,
    padding: 24, gap: 16, marginBottom: 32,
  },
  dashedLine: { borderTopWidth: 1, borderStyle: 'dashed', width: '100%' },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketLabel: { fontSize: 13 },
  ticketValue: { fontSize: 13, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  barcodeWrap: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 2, paddingVertical: 8,
  },
  barLine: { width: 3, borderRadius: 2 },
  scanNote: { fontSize: 12, textAlign: 'center' },
  doneBtn: { width: '100%', padding: 16, borderRadius: 14, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
