import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    path.resolve(__dirname, './firebase.config.update.json')
  ),
});

interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

interface SendNotificationInput {
  fcmToken: string; // Single FCM token
  payload: NotificationPayload;
}

async function sendPushNotification({
  fcmToken,
  payload,
}: SendNotificationInput): Promise<void> {

  console.log('Send notification:', fcmToken, payload);

  if (!fcmToken) {
    console.log('No FCM token provided.');
    return;
  }

  const message: admin.messaging.Message = {
    notification: {
      title: payload.title,
      body: payload.body,
      // ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
    },
    data: payload.data || {},
    token: fcmToken,  // Single token for sending to one device
  };

  try {
    const response = await admin.messaging().send(message);

    console.log('Successfully sent notification:', response);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

export { sendPushNotification };
