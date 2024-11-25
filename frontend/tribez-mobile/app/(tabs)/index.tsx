import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createTribe, joinTribe, getUserTribes, logout } from '../../services/auth';

interface Tribe {
  id: string;
  name: string;
  code: string;
  role: string;
}

export default function HomeScreen() {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTribeName, setNewTribeName] = useState('');
  const [tribeCode, setTribeCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadTribes();
  }, []);

  const loadTribes = async () => {
    try {
      setIsLoading(true);
      const userTribes = await getUserTribes();
      setTribes(userTribes);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to load tribes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTribe = async () => {
    if (!newTribeName.trim()) {
      Alert.alert('Error', 'Please enter a tribe name');
      return;
    }

    try {
      setIsLoading(true);
      const result = await createTribe(newTribeName);
      setTribes(prevTribes => [...prevTribes, result]);
      setNewTribeName('');
      Alert.alert('Success', `Tribe created! Code: ${result.code}`);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create tribe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTribe = async () => {
    if (!tribeCode.trim()) {
      Alert.alert('Error', 'Please enter a tribe code');
      return;
    }

    try {
      setIsLoading(true);
      const result = await joinTribe(tribeCode);
      setTribes(prevTribes => [...prevTribes, result]);
      setTribeCode('');
      Alert.alert('Success', 'Joined tribe successfully!');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to join tribe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to logout');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Tribes</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsCreating(!isCreating)}
        >
          <Text style={styles.toggleText}>
            {isCreating ? 'Join Existing Tribe' : 'Create New Tribe'}
          </Text>
        </TouchableOpacity>

        {isCreating ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Enter tribe name"
              value={newTribeName}
              onChangeText={setNewTribeName}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateTribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Tribe</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Enter tribe code"
              value={tribeCode}
              onChangeText={setTribeCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleJoinTribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Join Tribe</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.tribesContainer}>
        {isLoading && tribes.length === 0 ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : tribes.length === 0 ? (
          <Text style={styles.emptyText}>
            You haven't joined any tribes yet.
          </Text>
        ) : (
          tribes.map((tribe) => (
            <View key={tribe.id} style={styles.tribeCard}>
              <Text style={styles.tribeName}>{tribe.name}</Text>
              <Text style={styles.tribeCode}>Code: {tribe.code}</Text>
              <Text style={styles.tribeRole}>Role: {tribe.role}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  form: {
    marginTop: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    padding: 10,
    alignItems: 'center',
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 16,
  },
  tribesContainer: {
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  tribeCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  tribeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tribeCode: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  tribeRole: {
    fontSize: 16,
    color: '#666',
  },
});
