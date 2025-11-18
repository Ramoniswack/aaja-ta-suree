import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class NotificationService {
  private static instance: NotificationService;
  private fcmToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize push notifications for mobile
  async initializePushNotifications(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not a native platform, using browser notifications');
      // Request browser notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      return null;
    }

    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('Push notification permission denied');
        return null;
      }

      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();

      // Get FCM token
      await PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        this.fcmToken = token.value;
      });

      // Handle errors
      await PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Handle push notification received
      await PushNotifications.addListener(
        'pushNotificationReceived',
        (notification) => {
          console.log('Push received: ' + JSON.stringify(notification));
          // Show local notification
          this.sendImmediateNotification(
            notification.title || 'Notification',
            notification.body || ''
          );
        }
      );

      // Handle notification tap
      await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification) => {
          console.log('Push action performed: ' + JSON.stringify(notification));
        }
      );

      return this.fcmToken;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  // Initialize local notifications
  async initializeLocalNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Using browser notifications for web');
      return;
    }

    try {
      const permStatus = await LocalNotifications.checkPermissions();
      
      if (permStatus.display === 'prompt') {
        const result = await LocalNotifications.requestPermissions();
        console.log('Local notification permission:', result.display);
      }

      // Listen for notification actions
      await LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (notification) => {
          console.log('Local notification action:', notification);
        }
      );
    } catch (error) {
      console.error('Error initializing local notifications:', error);
    }
  }

  // Schedule a local notification
  async scheduleNotification(
    title: string,
    body: string,
    id: number,
    scheduleAt?: Date
  ): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: scheduleAt ? { at: scheduleAt } : undefined,
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Cancel a scheduled notification
  async cancelNotification(id: number): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Get FCM token
  getFCMToken(): string | null {
    return this.fcmToken;
  }

  // Send immediate notification
  async sendImmediateNotification(title: string, body: string): Promise<void> {
    // For web, use browser notifications
    if (!Capacitor.isNativePlatform()) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/ats.png',
          badge: '/ats.png',
        });
      }
      return;
    }

    // For mobile, use local notifications
    const id = Math.floor(Math.random() * 100000);
    await this.scheduleNotification(title, body, id);
  }
}

export default NotificationService.getInstance();
