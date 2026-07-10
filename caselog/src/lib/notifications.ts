import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Check permission without prompting. Returns null where notifications aren't supported (web). */
export async function getNotificationPermissionStatus(): Promise<boolean | null> {
  if (Platform.OS === 'web') return null;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  // Never throws — a permission failure must not break the save flow calling it.
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Auris Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleEventNotification(
  title: string,
  body: string,
  dateStr: string,
  timeStr?: string,
  hoursBefore = 24
): Promise<string | null> {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [h, m] = timeStr ? timeStr.split(':').map(Number) : [9, 0];
    const eventDate = new Date(year, month - 1, day, h, m, 0);
    const triggerDate = new Date(eventDate.getTime() - hoursBefore * 60 * 60 * 1000);
    if (triggerDate <= new Date()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
    return id;
  } catch {
    return null;
  }
}

export async function scheduleReminderNotification(
  title: string,
  body: string,
  dateStr: string,
  timeStr?: string
): Promise<string | null> {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [h, m] = timeStr ? timeStr.split(':').map(Number) : [9, 0];
    const triggerDate = new Date(year, month - 1, day, h, m, 0);
    if (triggerDate <= new Date()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelNotification(id: string) {
  try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
}
