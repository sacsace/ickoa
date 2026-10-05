import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

function initFirebase() {
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    return null;
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }

  return getMessaging();
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  link?: string,
) {
  const messaging = initFirebase();
  if (!messaging) {
    console.log("[Firebase stub]", { token, title, body, link });
    return { success: false, reason: "Firebase not configured" };
  }

  await messaging.send({
    token,
    notification: { title, body },
    webpush: link ? { fcmOptions: { link } } : undefined,
  });

  return { success: true };
}

export function isFirebaseEnabled() {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}
