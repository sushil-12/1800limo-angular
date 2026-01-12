import { Component, OnInit, OnDestroy } from '@angular/core';
import { PushNotificationService, TopicSubscription } from '../../services/push-notification.service';
import { AuthService } from '../../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorDialogService } from '../../services/error-dialog/errordialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-push-notification-test',
  templateUrl: './push-notification-test.component.html',
  styleUrls: ['./push-notification-test.component.scss']
})
export class PushNotificationTestComponent implements OnInit, OnDestroy {
  notificationPermission: NotificationPermission = 'default';
  currentTopics: TopicSubscription[] = [];
  currentUser: any;
  fcmToken: string | null = null;
  isServiceInitialized = false;
  
  // Test form data
  testMessage = 'Test notification from Angular app';
  testTopic = 'general_notifications';
  
  // Subscriptions
  private permissionSubscription: Subscription;
  private topicsSubscription: Subscription;

  constructor(
    private pushNotificationService: PushNotificationService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private errorDialogService: ErrorDialogService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.setupSubscriptions();
    this.updateServiceStatus();
  }

  ngOnDestroy(): void {
    if (this.permissionSubscription) {
      this.permissionSubscription.unsubscribe();
    }
    if (this.topicsSubscription) {
      this.topicsSubscription.unsubscribe();
    }
  }

  private setupSubscriptions(): void {
    // Subscribe to notification permission changes
    this.permissionSubscription = this.pushNotificationService.getNotificationPermission()
      .subscribe(permission => {
        this.notificationPermission = permission;
      });

    // Subscribe to topics changes
    this.topicsSubscription = this.pushNotificationService.getCurrentTopics()
      .subscribe(topics => {
        this.currentTopics = topics;
      });
  }

  private updateServiceStatus(): void {
    this.isServiceInitialized = this.pushNotificationService.isServiceInitialized();
    this.fcmToken = this.pushNotificationService.getCurrentToken();
  }

  /**
   * Request notification permission manually
   */
  async requestPermission(): Promise<void> {
    try {
      this.spinner.show();
      const permission = await this.pushNotificationService.requestPermission();
      this.notificationPermission = permission;
      
      if (permission === 'granted') {
        this.errorDialogService.openDialog({
          errors: {
            error: '<span class="text-success">Notification permission granted successfully!</span>'
          }
        });
        this.updateServiceStatus();
      } else {
        this.errorDialogService.openDialog({
          errors: {
            error: 'Notification permission was denied. Please enable notifications in your browser settings.'
          }
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      this.errorDialogService.openDialog({
        errors: {
          error: 'Error requesting notification permission. Please try again.'
        }
      });
    } finally {
      this.spinner.hide();
    }
  }

  /**
   * Test user-specific notification
   */
  testUserNotification(): void {
    if (!this.currentUser) {
      this.errorDialogService.openDialog({
        errors: {
          error: 'Please log in to test user notifications.'
        }
      });
      return;
    }

    this.spinner.show();
    this.pushNotificationService.testUserNotification(this.testMessage)
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.errorDialogService.openDialog({
            errors: {
              error: `<span class="text-success">User notification sent successfully!<br>Response: ${JSON.stringify(response)}</span>`
            }
          });
        },
        error: (error) => {
          this.spinner.hide();
          console.error('Error sending user notification:', error);
          this.errorDialogService.openDialog({
            errors: {
              error: `Error sending user notification: ${error.message || 'Unknown error'}`
            }
          });
        }
      });
  }

  /**
   * Test topic-based notification
   */
  testTopicNotification(): void {
    this.spinner.show();
    this.pushNotificationService.testTopicNotification(this.testTopic, this.testMessage)
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.errorDialogService.openDialog({
            errors: {
              error: `<span class="text-success">Topic notification sent successfully!<br>Topic: ${this.testTopic}<br>Response: ${JSON.stringify(response)}</span>`
            }
          });
        },
        error: (error) => {
          this.spinner.hide();
          console.error('Error sending topic notification:', error);
          this.errorDialogService.openDialog({
            errors: {
              error: `Error sending topic notification: ${error.message || 'Unknown error'}`
            }
          });
        }
      });
  }

  /**
   * Test customer broadcast notification
   */
  testCustomerNotification(): void {
    this.spinner.show();
    this.pushNotificationService.testCustomerNotification(this.testMessage)
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.errorDialogService.openDialog({
            errors: {
              error: `<span class="text-success">Customer broadcast notification sent successfully!<br>Response: ${JSON.stringify(response)}</span>`
            }
          });
        },
        error: (error) => {
          this.spinner.hide();
          console.error('Error sending customer notification:', error);
          this.errorDialogService.openDialog({
            errors: {
              error: `Error sending customer notification: ${error.message || 'Unknown error'}`
            }
          });
        }
      });
  }

  /**
   * Test driver broadcast notification
   */
  testDriverNotification(): void {
    this.spinner.show();
    this.pushNotificationService.testDriverNotification(this.testMessage)
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.errorDialogService.openDialog({
            errors: {
              error: `<span class="text-success">Driver broadcast notification sent successfully!<br>Response: ${JSON.stringify(response)}</span>`
            }
          });
        },
        error: (error) => {
          this.spinner.hide();
          console.error('Error sending driver notification:', error);
          this.errorDialogService.openDialog({
            errors: {
              error: `Error sending driver notification: ${error.message || 'Unknown error'}`
            }
          });
        }
      });
  }

  /**
   * Copy FCM token to clipboard
   */
  copyFCMToken(): void {
    if (this.fcmToken) {
      navigator.clipboard.writeText(this.fcmToken).then(() => {
        this.errorDialogService.openDialog({
          errors: {
            error: '<span class="text-success">FCM token copied to clipboard!</span>'
          }
        });
      }).catch(() => {
        this.errorDialogService.openDialog({
          errors: {
            error: 'Failed to copy FCM token to clipboard.'
          }
        });
      });
    }
  }

  /**
   * Get permission status text
   */
  getPermissionStatusText(): string {
    switch (this.notificationPermission) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      case 'default':
        return 'Not Requested';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get permission status class
   */
  getPermissionStatusClass(): string {
    switch (this.notificationPermission) {
      case 'granted':
        return 'text-success';
      case 'denied':
        return 'text-danger';
      case 'default':
        return 'text-warning';
      default:
        return 'text-muted';
    }
  }

  /**
   * Check if user is logged in
   */
  isUserLoggedIn(): boolean {
    return !!this.currentUser;
  }

  /**
   * Get user role display name
   */
  getUserRoleDisplay(): string {
    if (!this.currentUser) {
      return 'Not Logged In';
    }
    return this.currentUser.roleName || this.currentUser.role || 'Unknown Role';
  }
} 