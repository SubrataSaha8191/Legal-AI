// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Build config from environment variables (NEXT_PUBLIC_* are exposed to browser in Next.js)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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

// Prevent initialization if required keys missing to avoid cryptic runtime errors
const requiredKeys = ['apiKey','authDomain','projectId','appId'];
const missingReq = requiredKeys.filter(k => !(firebaseConfig as any)[k]);
if (missingReq.length) {
  const msg = `[firebase] Missing required config values: ${missingReq.join(', ')}. Did you create a .env.local with NEXT_PUBLIC_FIREBASE_* variables and restart the dev server?`;
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(msg);
  }
  throw new Error(msg);
}

// Initialize (singleton pattern to avoid duplicate apps in dev hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Lazy analytics: only if supported & client side
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {/* ignore */});
}

export { analytics };
export default app;