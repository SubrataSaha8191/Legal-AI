// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Build config from environment variables (NEXT_PUBLIC_* are exposed to browser in Next.js)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
};

// Guard against missing env vars in development
function assertConfig(cfg: Record<string, any>) {
  if (process.env.NODE_ENV !== 'production') {
    const missing = Object.entries(cfg)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    if (missing.length) {
      // eslint-disable-next-line no-console
      console.warn("[firebase] Missing environment variables:", missing.join(", "));
    }
  }
}
assertConfig(firebaseConfig);

// Optional initialization: allow app to run without Firebase in local/dev if env missing
const requiredKeys = ['apiKey','authDomain','projectId','appId'];
const missingReq = requiredKeys.filter(k => !(firebaseConfig as any)[k]);
export const firebaseEnabled = missingReq.length === 0;

// Initialize only when enabled (singleton pattern to avoid duplicate apps in dev hot reload)
const app = firebaseEnabled ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : undefined as any;

// Export auth (undefined when disabled)
export const auth = firebaseEnabled ? getAuth(app) : undefined as any;

// Export database (undefined when disabled)
export const database = firebaseEnabled ? getDatabase(app) : undefined as any;

// Lazy analytics: only if supported & client side and firebase is enabled
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (firebaseEnabled && typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {/* ignore */});
}

export { analytics };
export default app;