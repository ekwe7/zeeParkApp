import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const METHODS = [
  { key: 'FLUTTERWAVE', label: 'Card / Bank Transfer', icon: 'card', subtitle: 'Powered by Flutterwave' },
  { key: 'PAYPAL', label: 'PayPal', icon: 'logo-paypal', subtitle: 'Pay with your PayPal account' },
];

export default function PaymentScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { sessionId, duration } = route.params || {};
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [webViewVisible, setWebViewVisible] = useState(false);

  const initiatePayment = async () => {
    if (!selected) return Alert.alert('Select a payment method', 'Choose how you want to pay');
    setLoading(true);
    try {
      const res = await client.post('/api/payments', {
        sessionId,
        method: selected,
        email: user?.email,
      });
      setCheckoutUrl(res.data.checkoutUrl);
      setPaymentId(res.data.paymentId);
      setWebViewVisible(true);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNav = async (navState) => {
    const url = navState.url;

    // Detect redirect back to app after payment
    if (url.includes('zeepark://payment/success') || url.includes('transaction_id')) {
      setWebViewVisible(false);

      // Extract transaction_id and tx_ref from URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const transactionId = urlParams.get('transaction_id');
      const txRef = urlParams.get('tx_ref');

      if (transactionId && txRef) {
        try {
          const res = await client.get(`/api/payments/verify?transaction_id=${transactionId}&tx_ref=${txRef}`);
          if (res.data.status === 'COMPLETED') {
            Alert.alert(
              'Payment Successful ✓',
              `Amount: ${res.data.amount} ${res.data.currency}`,
              [{ text: 'Done', onPress: () => navigation.navigate('Home') }]
            );
          } else {
            Alert.alert('Payment Failed', 'Your payment could not be completed');
          }
        } catch (e) {
          Alert.alert('Verification Error', 'Could not verify payment status');
        }
      }
    }

    // User cancelled
    if (url.includes('cancelled') || url.includes('cancel')) {
      setWebViewVisible(false);
      Alert.alert('Payment Cancelled', 'You cancelled the payment');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Payment</Text>

      <View style={[styles.summary, { backgroundColor: theme.surface }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Duration</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{duration} mins</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Session</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]} numberOfLines={1}>
            {sessionId?.slice(-8)}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.subtext }]}>PAYMENT METHOD</Text>

      {METHODS.map((method) => {
        const isSelected = selected === method.key;
        return (
          <TouchableOpacity
            key={method.key}
            style={[styles.methodCard,
              { backgroundColor: theme.surface,
                borderColor: isSelected ? theme.primary : theme.border,
                borderWidth: isSelected ? 2 : 1 }
            ]}
            onPress={() => setSelected(method.key)}
          >
            <View style={[styles.methodIcon, { backgroundColor: isSelected ? theme.primary + '15' : theme.background }]}>
              <Ionicons name={method.icon} size={24} color={isSelected ? theme.primary : theme.subtext} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodLabel, { color: theme.text }]}>{method.label}</Text>
              <Text style={[styles.methodSub, { color: theme.subtext }]}>{method.subtitle}</Text>
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
          </TouchableOpacity>
        );
      })}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, { backgroundColor: selected ? theme.primary : theme.border }]}
          onPress={initiatePayment}
          disabled={loading || !selected}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#fff" />
              <Text style={styles.payBtnText}>Pay Securely</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment WebView Modal */}
      <Modal visible={webViewVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity onPress={() => setWebViewVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Secure Payment</Text>
            <View style={{ width: 40 }} />
          </View>
          {checkoutUrl && (
            <WebView
              source={{ uri: checkoutUrl }}
              onNavigationStateChange={handleWebViewNav}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color={theme.primary} />
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
  summary: { borderRadius: 14, padding: 16, marginBottom: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '600', maxWidth: '60%' },
  divider: { height: 1, marginVertical: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  methodCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, marginBottom: 12, gap: 12 },
  methodIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 15, fontWeight: '600' },
  methodSub: { fontSize: 12, marginTop: 2 },
  footer: { position: 'absolute', bottom: 32, left: 20, right: 20 },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14 },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  webViewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1a1a1a' },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  webViewTitle: { color: '#fff', fontWeight: '600', fontSize: 16 },
  webViewLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
});
