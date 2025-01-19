import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
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
    },
    data: payload.data || {},
    token: fcmToken,
    android: {
      notification: {
        sound: 'default', // Set default sound for Android
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default', // Set default sound for iOS
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

export { sendPushNotification };



