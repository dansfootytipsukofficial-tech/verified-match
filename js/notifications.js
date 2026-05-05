class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.initPushNotifications();
  }

  initPushNotifications() {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.pushEnabled = true;
        }
      });
    }
  }

  sendNotification(data) {
    const notification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: data.type || 'info',
      title: data.title,
      message: data.message,
      read: false,
      data: data.data || {}
    };
    this.notifications.unshift(notification);
    this.notifyListeners(notification);
    
    if (data.pushNotification && this.pushEnabled) {
      this.sendPushNotification(notification);
    }
    return notification;
  }

  sendPushNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/logo.png',
        badge: '/icons/badge.png',
        tag: notification.id
      });
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(notification) {
    this.listeners.forEach(callback => callback(notification));
  }

  getNotifications(filter = {}) {
    let results = [...this.notifications];
    if (filter.type) results = results.filter(n => n.type === filter.type);
    if (filter.read !== undefined) results = results.filter(n => n.read === filter.read);
    if (filter.limit) results = results.slice(0, filter.limit);
    return results;
  }

  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) notification.read = true;
    return notification;
  }

  deleteNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  sendMatchNotification(match) {
    return this.sendNotification({
      type: 'match',
      title: '💕 New Match!',
      message: `You matched with ${match.name}!`,
      data: { matchId: match.id },
      pushNotification: true
    });
  }

  sendMessageNotification(sender, preview) {
    return this.sendNotification({
      type: 'message',
      title: `New message from ${sender}`,
      message: preview,
      data: { senderId: sender },
      pushNotification: true
    });
  }

  sendLikeNotification(user) {
    return this.sendNotification({
      type: 'like',
      title: '❤️ New Like!',
      message: `${user.name} liked your profile`,
      data: { userId: user.id }
    });
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  clearAll() {
    this.notifications = [];
  }
}

const notificationService = new NotificationService();
export { notificationService, NotificationService };
