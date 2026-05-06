import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminRevenueScreen() {
  const { theme } = useTheme();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Default: last 30 days
  const fetchReport = async () => {
    setLoading(true);
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    try {
      const res = await client.get(`/api/admin/reports/revenue?from=${from}&to=${to}`);
      setReport(res.data);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not fetch report');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Revenue Report</Text>
      <Text style={[styles.sub, { color: theme.subtext }]}>Last 30 days</Text>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: theme.primary }]}
        onPress={fetchReport}
        disabled={loading}
      >
        <Text style={styles.btnText}>{loading ? 'Loading...' : 'Generate Report'}</Text>
      </TouchableOpacity>

      {report && (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Row label="Total Revenue" value={`$${report.totalRevenue}`} theme={theme} />
          <Row label="Transactions" value={report.totalTransactions} theme={theme} />
          <Row label="From" value={report.from} theme={theme} />
          <Row label="To" value={report.to} theme={theme} />
        </View>
      )}
    </SafeAreaView>
  );
}

function Row({ label, value, theme }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.subtext }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 14, marginBottom: 24 },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 24 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  card: { borderRadius: 12, padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' },
  rowLabel: { fontSize: 14 },
  rowValue: { fontSize: 14, fontWeight: '600' },
});
