import { doc, updateDoc, increment, serverTimestamp, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { CreditTransaction, CreditBalance, CreditUsage } from '@/types/credits';

export class CreditService {
  // 크레딧 사용 비용 정의
  private static readonly COSTS: Record<string, CreditUsage> = {
    'generate_script': {
      action: 'AI 스크립트 생성',
      cost: { 'S-CRD': 1, 'E-CRD': 0 },
      description: 'AI 기반 영상 스크립트 생성'
    },
    'generate_images': {
      action: 'AI 이미지 생성',
      cost: { 'S-CRD': 1, 'E-CRD': 0 },
      description: '이미지 1개 생성당'
    },
    'render_video': {
      action: '영상 렌더링',
      cost: { 'S-CRD': 2, 'E-CRD': 0 },
      description: '영상 1개 렌더링'
    },
    'download_youtube': {
      action: 'YouTube 다운로드',
      cost: { 'S-CRD': 1, 'E-CRD': 0 },
      description: 'YouTube 영상 다운로드'
    },
    'export_high_quality': {
      action: '고품질 내보내기',
      cost: { 'S-CRD': 0, 'E-CRD': 1 },
      description: '고화질/고프레임 렌더링'
    }
  };

  // 크레딧 잔액 조회
  static async getCreditBalance(userId: string): Promise<CreditBalance> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const userData = userDoc.data();
      const credits = userData.credits || { free: 0, paid: 0 };

      return {
        'S-CRD': credits.free,
        'E-CRD': credits.paid,
        total: credits.free + credits.paid,
        lastUpdated: userData.lastCreditUpdate || serverTimestamp()
      };
    } catch (error) {
      console.error('크레딧 잔액 조회 오류:', error);
      throw error;
    }
  }

  // 크레딧 사용 가능 여부 확인
  static async canAfford(userId: string, action: string, quantity: number = 1): Promise<boolean> {
    try {
      const balance = await this.getCreditBalance(userId);
      const cost = this.COSTS[action];

      if (!cost) {
        throw new Error(`알 수 없는 액션: ${action}`);
      }

      const requiredSCrd = cost.cost['S-CRD'] * quantity;
      const requiredECrd = cost.cost['E-CRD'] * quantity;

      return balance['S-CRD'] >= requiredSCrd && balance['E-CRD'] >= requiredECrd;
    } catch (error) {
      console.error('크레딧 확인 오류:', error);
      return false;
    }
  }

  // 크레딧 차감
  static async spendCredits(
    userId: string,
    action: string,
    quantity: number = 1,
    metadata?: any
  ): Promise<CreditTransaction> {
    try {
      const cost = this.COSTS[action];
      if (!cost) {
        throw new Error(`알 수 없는 액션: ${action}`);
      }

      const requiredSCrd = cost.cost['S-CRD'] * quantity;
      const requiredECrd = cost.cost['E-CRD'] * quantity;

      // 잔액 확인
      const canAfford = await this.canAfford(userId, action, quantity);
      if (!canAfford) {
        throw new Error('크레딧이 부족합니다.');
      }

      // 현재 잔액 조회
      const currentBalance = await this.getCreditBalance(userId);

      // Firestore 트랜잭션 (크레딧 차감)
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'credits.free': increment(-requiredSCrd),
        'credits.paid': increment(-requiredECrd),
        'lastCreditUpdate': serverTimestamp()
      });

      // 트랜잭션 기록
      const transactionData: Omit<CreditTransaction, 'id' | 'createdAt'> = {
        userId,
        type: 'spend',
        amount: requiredSCrd + requiredECrd,
        creditType: requiredECrd > 0 ? 'E-CRD' : 'S-CRD',
        description: `${cost.description} (${quantity}개)`,
        category: this.getCategoryFromAction(action),
        metadata: {
          ...metadata,
          action,
          quantity,
          cost breakdown: cost.cost
        },
        balance: {
          'S-CRD': currentBalance['S-CRD'] - requiredSCrd,
          'E-CRD': currentBalance['E-CRD'] - requiredECrd
        }
      };

      const transactionRef = collection(db, 'credit_transactions');
      const docRef = await addDoc(transactionRef, {
        ...transactionData,
        createdAt: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...transactionData,
        createdAt: serverTimestamp()
      };

    } catch (error) {
      console.error('크레딧 차감 오류:', error);
      throw error;
    }
  }

  // 크레딧 지급
  static async addCredits(
    userId: string,
    amount: number,
    creditType: 'S-CRD' | 'E-CRD',
    reason: string,
    metadata?: any
  ): Promise<CreditTransaction> {
    try {
      // 현재 잔액 조회
      const currentBalance = await this.getCreditBalance(userId);

      // Firestore 트랜잭션 (크레딧 지급)
      const userRef = doc(db, 'users', userId);
      const updateField = creditType === 'S-CRD' ? 'credits.free' : 'credits.paid';

      await updateDoc(userRef, {
        [updateField]: increment(amount),
        'lastCreditUpdate': serverTimestamp()
      });

      // 트랜잭션 기록
      const transactionData: Omit<CreditTransaction, 'id' | 'createdAt'> = {
        userId,
        type: 'earn',
        amount,
        creditType,
        description: reason,
        category: metadata?.category || 'bonus',
        metadata,
        balance: {
          'S-CRD': creditType === 'S-CRD'
            ? currentBalance['S-CRD'] + amount
            : currentBalance['S-CRD'],
          'E-CRD': creditType === 'E-CRD'
            ? currentBalance['E-CRD'] + amount
            : currentBalance['E-CRD']
        }
      };

      const transactionRef = collection(db, 'credit_transactions');
      const docRef = await addDoc(transactionRef, {
        ...transactionData,
        createdAt: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...transactionData,
        createdAt: serverTimestamp()
      };

    } catch (error) {
      console.error('크레딧 지급 오류:', error);
      throw error;
    }
  }

  // 트랜잭션 내역 조회
  static async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<CreditTransaction[]> {
    try {
      const transactionsRef = collection(db, 'credit_transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CreditTransaction[];

    } catch (error) {
      console.error('트랜잭션 내역 조회 오류:', error);
      return [];
    }
  }

  // 액션으로 카테고리 변환
  private static getCategoryFromAction(action: string): string {
    const categoryMap: Record<string, string> = {
      'generate_script': 'script',
      'generate_images': 'image',
      'render_video': 'video',
      'download_youtube': 'video',
      'export_high_quality': 'video'
    };

    return categoryMap[action] || 'other';
  }

  // 사용 가능한 액션 목록
  static getAvailableActions(): Record<string, CreditUsage> {
    return { ...this.COSTS };
  }

  // 일일 로그인 보너스 지급
  static async giveDailyLoginBonus(userId: string): Promise<boolean> {
    try {
      // 오늘 이미 보너스를 받았는지 확인
      const today = new Date().toDateString();
      const transactionsRef = collection(db, 'credit_transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        where('type', '==', 'bonus'),
        where('description', '==', '일일 로그인 보너스'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const lastTransaction = querySnapshot.docs[0].data();
        const lastDate = lastTransaction.createdAt?.toDate?.()?.toDateString();

        if (lastDate === today) {
          return false; // 오늘 이미 받음
        }
      }

      // 보너스 지급
      await this.addCredits(
        userId,
        1, // S-CRD 1개
        'S-CRD',
        '일일 로그인 보너스',
        { category: 'bonus', type: 'daily_login' }
      );

      return true;
    } catch (error) {
      console.error('일일 로그인 보너스 지급 오류:', error);
      return false;
    }
  }
}