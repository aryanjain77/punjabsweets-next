"use client";

import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase-client";

export function useFCMToken() {
  useEffect(() => {
    async function registerFCM() {
      try {
        if (!("Notification" in window)) {
          console.log("Notifications not supported");
          return;
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        if (!messaging) {
          console.log("Messaging unavailable");
          return;
        }

        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        console.log("Before getToken");
        console.log("VAPID:", process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
        console.log("SW Scope:", registration.scope);
        
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        console.log("After getToken");

        if (!token) {
          console.log("No FCM token generated");
          return;
        }

        console.log("FCM Token:", token);

        await fetch("/api/admin/fcm-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            token,
          }),
        });
      } catch (error) {
        console.error("FCM registration failed", error);
        if (error instanceof Error) {

          console.error("Name:", error.name);
      
          console.error("Message:", error.message);
      
          console.error("Stack:", error.stack);
      
        }
      }
    }

    registerFCM();
  }, []);
}
