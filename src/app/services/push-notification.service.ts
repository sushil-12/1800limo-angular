import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { StateManagementService } from './statemanagement.service';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface TopicSubscription {
  topic: string;
  subscribed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private messaging: any;
  private currentToken: string | null = null;
  private isInitialized = false;
  private notificationPermission = new BehaviorSubject<NotificationPermission>('default');
  private currentTopics = new BehaviorSubject<TopicSubscription[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private stateManagementService: StateManagementService,
    private ngZone: NgZone
  ) {
    // Don't auto-initialize, wait for user login
  }

  /**
   * Initialize push notifications after user login
   * Call this method after successful authentication
   */
  async initializeAfterLogin(): Promise<void> {
    if (this.isInitialized) {
      console.log('Push notification service already initialized');
      return;
    }

    try {
      await this.initializeFirebase();
    } catch (error) {
      console.error('Error initializing push notifications after login:', error);
    }
  }

  /**
   * Initialize Firebase and request notification permission
   */
  private async initializeFirebase(): Promise<void> {
    try {
      // Check if Firebase Messaging is supported
      const isMessagingSupported = await isSupported();
      if (!isMessagingSupported) {
        console.warn('Firebase Messaging is not supported in this browser');
        return;
      }

      // Initialize Firebase
      const app = initializeApp(environment.firebase);

      // Initialize Firebase Messaging
      this.messaging = getMessaging(app);
      
      // Request permission
      await this.requestNotificationPermission();
      
      // Set up message handlers
      this.setupMessageHandlers();
      
      this.isInitialized = true;
      console.log('Firebase Messaging initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }

  /**
   * Request notification permission from user
   */
  private async requestNotificationPermission(): Promise<void> {
    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission.next(permission);
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        await this.getFCMToken();
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  /**
   * Get FCM token and register with backend
   */
  private async getFCMToken(): Promise<void> {
    try {
      if (!this.messaging) {
        console.warn('Firebase messaging not initialized');
        return;
      }

      this.currentToken = await getToken(this.messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Add your VAPID key here
      });

      if (this.currentToken) {
        console.log('FCM Token:', this.currentToken);
        await this.registerTokenWithBackend(this.currentToken);
        await this.subscribeToUserTopics();
      } else {
        console.log('No registration token available');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  }

  /**
   * Register FCM token with Laravel backend
   */
  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) {
        console.warn('No user logged in, skipping token registration');
        return;
      }

      const payload = {
        token: token,
        user_id: currentUser.id,
        platform: 'web',
        user_agent: navigator.userAgent
      };

      await this.http.post(`${environment.serverUrl}mobile/v1/device/register`, payload).toPromise();
      console.log('FCM token registered with backend');
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  }

  /**
   * Subscribe user to relevant topics based on their role and ID
   */
  private async subscribeToUserTopics(): Promise<void> {
    try {
      const currentUser = this.authService.currentUserValue;
      if (!currentUser || !this.currentToken) {
        return;
      }

      const topics: TopicSubscription[] = [
        // User-specific topics
        { topic: `user_${currentUser.id}_notifications`, subscribed: false },
        { topic: `user_${currentUser.id}_bookings`, subscribed: false },
        { topic: `user_${currentUser.id}_payments`, subscribed: false },
        { topic: `user_${currentUser.id}_reminders`, subscribed: false },
        
        // Role-based broadcast topics
        { topic: `user_type_${currentUser.roleName?.toLowerCase()}`, subscribed: false },
        
        // General topics
        { topic: 'general_notifications', subscribed: false },
        { topic: 'system_updates', subscribed: false }
      ];

      // Note: Topic subscription is handled on the backend for web apps
      // The backend will subscribe the token to these topics
      for (const topicData of topics) {
        try {
          // For web apps, topic subscription is typically handled server-side
          // You can make an API call to your backend to subscribe to topics
          await this.http.post(`${environment.serverUrl}mobile/v1/topics/subscribe`, {
            token: this.currentToken,
            topic: topicData.topic
          }).toPromise();
          
          topicData.subscribed = true;
          console.log(`Subscribed to topic: ${topicData.topic}`);
        } catch (error) {
          console.error(`Error subscribing to topic ${topicData.topic}:`, error);
        }
      }

      this.currentTopics.next(topics);
    } catch (error) {
      console.error('Error subscribing to topics:', error);
    }
  }

  /**
   * Set up message handlers for foreground and background notifications
   */
  private setupMessageHandlers(): void {
    if (!this.messaging) {
      return;
    }

    // Handle foreground messages
    onMessage(this.messaging, (payload: any) => {
      console.log('Foreground message received:', payload);
      this.ngZone.run(() => {
        this.showNotification(payload);
      });
    });
  }

  /**
   * Show notification in browser
   */
  private showNotification(payload: any): void {
    const notificationData: NotificationData = {
      title: payload.notification?.title || 'New Notification',
      body: payload.notification?.body || 'You have a new notification',
      icon: payload.notification?.icon || '/assets/images/logo.png',
      badge: '/assets/images/badge.png',
      tag: payload.data?.tag || 'default',
      data: payload.data || {},
      requireInteraction: payload.data?.requireInteraction === 'true',
      silent: payload.data?.silent === 'true'
    };

    // Add actions if provided
    if (payload.data?.actions) {
      try {
        notificationData.actions = JSON.parse(payload.data.actions);
      } catch (error) {
        console.error('Error parsing notification actions:', error);
      }
    }

    // Show the notification
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(notificationData.title, notificationData);
      });
    }
  }

  /**
   * Public method to manually request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    await this.requestNotificationPermission();
    return this.notificationPermission.value;
  }

  /**
   * Get current notification permission status
   */
  getNotificationPermission(): Observable<NotificationPermission> {
    return this.notificationPermission.asObservable();
  }

  /**
   * Get current topics subscription status
   */
  getCurrentTopics(): Observable<TopicSubscription[]> {
    return this.currentTopics.asObservable();
  }

  /**
   * Test notification endpoints
   */
  testUserNotification(message: string = 'Test notification from Angular app'): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const payload = {
      user_id: currentUser.id,
      message: message,
      title: 'Test Notification'
    };

    return this.http.post(`${environment.serverUrl}mobile/v1/notifications/test-user`, payload);
  }

  testTopicNotification(topic: string, message: string = 'Test topic notification'): Observable<any> {
    const payload = {
      topic: topic,
      message: message,
      title: 'Topic Test Notification'
    };

    return this.http.post(`${environment.serverUrl}mobile/v1/notifications/send-topic`, payload);
  }

  testCustomerNotification(message: string = 'Test customer notification'): Observable<any> {
    const payload = {
      message: message,
      title: 'Customer Test Notification'
    };

    return this.http.post(`${environment.serverUrl}mobile/v1/notifications/send-customer`, payload);
  }

  testDriverNotification(message: string = 'Test driver notification'): Observable<any> {
    const payload = {
      message: message,
      title: 'Driver Test Notification'
    };

    return this.http.post(`${environment.serverUrl}mobile/v1/notifications/send-driver`, payload);
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current FCM token
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Refresh FCM token
   */
  async refreshToken(): Promise<void> {
    if (this.messaging) {
      // Token refresh is handled automatically by Firebase
      // You can listen for token refresh events if needed
      console.log('Token refresh is handled automatically by Firebase');
    }
  }

  /**
   * Cleanup on logout
   */
  async cleanupOnLogout(): Promise<void> {
    try {
      // Unsubscribe from topics via backend
      if (this.currentToken) {
        const topics = this.currentTopics.value;
        for (const topicData of topics) {
          if (topicData.subscribed) {
            try {
              await this.http.post(`${environment.serverUrl}mobile/v1/topics/unsubscribe`, {
                token: this.currentToken,
                topic: topicData.topic
              }).toPromise();
              
              console.log(`Unsubscribed from topic: ${topicData.topic}`);
            } catch (error) {
              console.error(`Error unsubscribing from topic ${topicData.topic}:`, error);
            }
          }
        }
      }

      // Reset state
      this.currentToken = null;
      this.isInitialized = false;
      this.currentTopics.next([]);
      this.notificationPermission.next('default');

      console.log('Push notification service cleaned up on logout');
    } catch (error) {
      console.error('Error cleaning up push notification service:', error);
    }
  }
} 