import { Link } from 'expo-router';
import { SafeAreaView, Text, View, StyleSheet } from 'react-native';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.brand}>MADIA sa Partido</Text>
      <Text style={styles.subtitle}>Mobile shell — map, trips, and AI parity in progress.</Text>
      <View style={styles.links}>
        <Link href="/map">Partido Map</Link>
        <Link href="/trips">Saved Trips</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E9F4F7' },
  brand: { fontSize: 28, fontWeight: '700', color: '#0B3D5E' },
  subtitle: { marginTop: 8, color: '#102A33' },
  links: { marginTop: 24, gap: 12 },
});
