import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "survivingvid.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "survivingvid-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "survivingvid.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Firebase 앱 초기화
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Provider
const googleProvider = new GoogleAuthProvider();

// 사용자 타입
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  credits: {
    free: number;
    paid: number;
  };
  subscription?: {
    plan: 'free' | 'premium' | 'pro';
    status: 'active' | 'cancelled' | 'expired';
    endDate?: Date;
  };
  settings: {
    language: string;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  createdAt: any;
  lastLogin: any;
}

// 로그인 함수
export const signInWithGoogle = async (): Promise<UserProfile> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Firestore에 사용자 정보 저장/업데이트
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // 신규 사용자
      const newUser: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        credits: {
          free: 10, // 기본 무료 크레딧
          paid: 0
        },
        subscription: {
          plan: 'free',
          status: 'active'
        },
        settings: {
          language: 'ko-KR',
          theme: 'light',
          notifications: true
        },
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };

      await setDoc(userRef, newUser);
      return newUser;
    } else {
      // 기존 사용자 - 마지막 로그인 시간 업데이트
      const userData = userDoc.data() as UserProfile;
      await setDoc(userRef, {
        ...userData,
        lastLogin: serverTimestamp()
      }, { merge: true });

      return userData;
    }
  } catch (error) {
    console.error('Google 로그인 오류:', error);
    throw error;
  }
};

// 로그아웃 함수
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
};

// 현재 사용자 정보 가져오기
export const getCurrentUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
};

// 인증 상태 감지
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};