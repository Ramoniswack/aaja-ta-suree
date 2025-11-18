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
      console.log('Not a native platform, skipping push notification setup');
      return null;
    }

    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
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
    try {
      const permStatus = await LocalNotifications.checkPermissions();
      
      if (permStatus.display === 'prompt') {
        await LocalNotifications.requestPermissions();
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
    const id = Math.floor(Math.random() * 100000);
    await this.scheduleNotification(title, body, id);
  }
}

export default NotificationService.getInstance();
