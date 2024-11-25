import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { logout } from '../../services/auth';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to logout');
    }
  };

  const handleSettingPress = (setting: string) => {
    Alert.alert('Coming Soon', `${setting} settings will be available soon!`);
  };

  const settings = [
    { title: 'Account Settings', icon: 'person-outline' },
    { title: 'Notifications', icon: 'notifications-outline' },
    { title: 'Privacy', icon: 'lock-closed-outline' },
    { title: 'Help & Support', icon: 'help-circle-outline' },
    { title: 'About', icon: 'information-circle-outline' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.settingsContainer}>
        {settings.map((setting, index) => (
          <TouchableOpacity
            key={setting.title}
            style={[
              styles.settingItem,
              index === settings.length - 1 && styles.lastItem,
            ]}
            onPress={() => handleSettingPress(setting.title)}
          >
            <View style={styles.settingContent}>
              <Ionicons
                name={setting.icon as any}
                size={24}
                color="#007AFF"
                style={styles.settingIcon}
              />
              <Text style={styles.settingText}>{setting.title}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
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
  settingsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginBottom: 30,
  },
});
