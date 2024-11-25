import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_TASK_NAME = 'backgroundTask';

// Define the background task
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  console.log('Background task executed');
  return BackgroundFetch.Result.NewData;
});

export default function App() {
  useEffect(() => {
    const setupApp = async () => {
      // Request permissions for notifications
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissions Needed',
          'Notification permissions are required for this app to work.'
        );
        console.log('Permission not granted for notifications');
        return;
      }
      console.log('Notification permissions granted!');

      // Register background task
      try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
          minimumInterval: 15 * 60, // 15 minutes
          stopOnTerminate: false,
          startOnBoot: true,
        });
        console.log('Background task registered!');
      } catch (err) {
        console.error('Failed to register background task:', err);
      }
    };

    setupApp();
  }, []);

  // Schedule a notification
  const scheduleNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "You've got a new message!",
          body: 'Check your inbox.',
        },
        trigger: { seconds: 10 }, // Notification after 10 seconds
      });
      console.log('Notification scheduled');
      Alert.alert('Notification Scheduled', 'You will receive it in 10 seconds.');
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Unable to schedule notification. Try again.');
    }
  };

  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Listen for notification interactions
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { title, body } = response.notification.request.content;
      console.log(`Notification clicked: Title - ${title}, Body - ${body}`);
      Alert.alert('Notification Clicked', `Title: ${title}\nBody: ${body}`);
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://cdn-icons-png.flaticon.com/512/3093/3093487.png',
        }}
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome to Your App!</Text>
      <Text style={styles.subtitle}>
        A fun and stylish way to explore notifications and background tasks.
      </Text>
      <TouchableOpacity style={styles.button} onPress={scheduleNotification}>
        <Text style={styles.buttonText}>Send a Notification</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>
        Your notification will pop up in 10 seconds. Get ready for the magic!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffe4e6', // Soft pink background
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d81b60', // Deep pink text
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e44ad', // Lavender-purple text
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#f06292', // Bright pink button
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20, // Rounded button for a soft look
  },
  buttonText: {
    color: '#ffffff', // White text
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 14,
    color: '#9c27b0', // Purple footer text
    textAlign: 'center',
    marginTop: 20,
  },
});
