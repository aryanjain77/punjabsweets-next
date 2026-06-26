importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBcVFnxcHa-nq77y9jHmgYsdjDA9c0OxNY",
  authDomain: "punjab-sweets-d93cf.firebaseapp.com",
  projectId: "punjab-sweets-d93cf",
  storageBucket: "punjab-sweets-d93cf.firebasestorage.app",
  messagingSenderId: "966776137345",
  appId: "1:966776137345:web:f9620a476e899b7d848f80"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/icons/icon-192.png",
    }
  );
});
