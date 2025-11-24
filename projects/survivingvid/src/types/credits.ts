export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'purchase' | 'bonus' | 'refund';
  amount: number;
  creditType: 'S-CRD' | 'E-CRD';
  description: string;
  category: 'script' | 'image' | 'video' | 'subscription' | 'bonus' | 'purchase';
  metadata?: {
    scriptId?: string;
    imageCount?: number;
    videoId?: string;
    planId?: string;
    [key: string]: any;
  };
  createdAt: any;
  balance: {
    'S-CRD': number;
    'E-CRD': number;
  };
}

export interface CreditPackage {
  id: string;
  name: string;
  amount: number;
  price: number;
  currency: 'KRW';
  creditType: 'E-CRD';
  description: string;
  bonus?: number;
  popular?: boolean;
}

export interface CreditBalance {
  'S-CRD': number;
  'E-CRD': number;
  total: number;
  lastUpdated: any;
}

export interface CreditUsage {
  action: string;
  cost: {
    'S-CRD': number;
    'E-CRD': number;
  };
  description: string;
}