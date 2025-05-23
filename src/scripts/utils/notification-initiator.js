import { subscribeNotification, unsubscribeNotification } from './notification-helper';
import { generateSubscribeButtonTemplate } from '../templates';

const NotificationInitiator = {
  async init() {
    await this._setupPushNotification();
  },

  async _setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    if (!pushNotificationTools) return;

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();

    const subscribeButton = document.getElementById('subscribe-button');
    if (!subscribeButton) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        subscribeButton.querySelector('i').className = 'fas fa-bell-slash';
        subscribeButton.querySelector('span').textContent = ' Unsubscribe Notifikasi';
      }

      subscribeButton.addEventListener('click', async () => {
        try {
          const subscription = await registration.pushManager.getSubscription();

          if (subscription) {
            const success = await unsubscribeNotification();
            if (success) {
              subscribeButton.querySelector('i').className = 'fas fa-bell';
              subscribeButton.querySelector('span').textContent = ' Subscribe Notifikasi';
              this._showAlert('Berhasil berhenti berlangganan notifikasi!', 'success');
            } else {
              this._showAlert('Gagal berhenti berlangganan notifikasi!', 'error');
            }
          } else {
            const success = await subscribeNotification();
            if (success) {
              subscribeButton.querySelector('i').className = 'fas fa-bell-slash';
              subscribeButton.querySelector('span').textContent = ' Unsubscribe Notifikasi';
              this._showAlert('Berhasil berlangganan notifikasi!', 'success');
            } else {
              this._showAlert('Gagal berlangganan notifikasi!', 'error');
            }
          }
        } catch (error) {
          console.error('Error handling notification subscription:', error);
          this._showAlert('Terjadi kesalahan saat mengelola langganan notifikasi!', 'error');
        }
      });
    } catch (error) {
      console.error('Error setting up push notification:', error);
      pushNotificationTools.innerHTML = '<p class="error-text">Browser tidak mendukung notifikasi</p>';
    }
  },

  _showAlert(message, type) {
    const alertContainer = document.querySelector('.alert-container');
    if (alertContainer) {
      const alertElement = document.createElement('div');
      alertElement.className = `alert alert-${type}`;
      alertElement.textContent = message;
      alertContainer.appendChild(alertElement);

      setTimeout(() => {
        alertElement.remove();
      }, 3000);
    }
  },
};

export default NotificationInitiator;