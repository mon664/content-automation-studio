'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingBag,
  CreditCard,
  Smartphone,
  Crown,
  Zap,
  Star,
  Check,
  X,
  TrendingUp,
  Users,
  Shield,
  Gift,
  Package,
  Download,
  Clock,
  RefreshCw,
  Plus,
  Minus,
  ShoppingCart,
  Receipt,
  History,
  Gift as GiftIcon,
  Sparkles,
  Diamond,
  Award,
  Trophy,
  Target,
  Rocket,
  FiCreditCard,
  DollarSign,
  PiggyBank,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  type: 'subscription' | 'credits' | 'template' | 'font' | 'music' | 'addon';
  price: number;
  currency: string;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
  discount?: number;
  icon: React.ReactNode;
  color: string;
  pricingType: 'monthly' | 'yearly' | 'once';
  credits?: number;
  duration?: number;
}

interface PurchaseHistory {
  id: string;
  productId: string;
  productName: string;
  type: string;
  price: number;
  currency: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
}

interface CartItem extends Product {
  quantity: number;
  total: number;
}

const PRODUCTS: Product[] = [
  {
    id: 'basic_monthly',
    name: 'Basic',
    description: '기본 기능이 필요한 분들을 위한 요금제',
    type: 'subscription',
    price: 9.99,
    currency: 'USD',
    features: [
      '월 100개 영상 생성',
      '720p HD 품질',
      '기본 템플릿',
      '5GB 저장 공간',
      '이메일 지원'
    ],
    icon: <Package className="w-6 h-6" />,
    color: 'gray',
    pricingType: 'monthly'
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    description: '가장 인기 있는 요금제',
    type: 'subscription',
    price: 29.99,
    currency: 'USD',
    originalPrice: 39.99,
    features: [
      '무제한 영상 생성',
      '1080p Full HD 품질',
      '모든 프리미엄 템플릿',
      '50GB 저장 공간',
      '우선순위 지원',
      'AI 고급 기능',
      '워터마크 제거'
    ],
    popular: true,
    discount: 25,
    icon: <Crown className="w-6 h-6" />,
    color: 'blue',
    pricingType: 'monthly'
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    description: '전문가를 위한 최고의 기능',
    type: 'subscription',
    price: 79.99,
    currency: 'USD',
    features: [
      '무제한 영상 생성',
      '4K Ultra HD 품질',
      '모든 프리미엄 템플릿 + 독점',
      '200GB 저장 공간',
      '24/7 우선 지원',
      '모든 AI 고급 기능',
      '워터마크 제거',
      'API 액세스',
      '팀 협업 기능',
      '브랜드 제거'
    ],
    icon: <Diamond className="w-6 h-6" />,
    color: 'purple',
    pricingType: 'monthly'
  },
  {
    id: 'credits_100',
    name: '100 크레딧',
    description: '추가 영상 생성을 위한 크레딧',
    type: 'credits',
    price: 19.99,
    currency: 'USD',
    credits: 100,
    features: [
      '100개 영상 생성 가능',
      '한도 없이 사용 가능',
      '유효기간 없음'
    ],
    icon: <Zap className="w-6 h-6" />,
    color: 'yellow',
    pricingType: 'once'
  },
  {
    id: 'credits_500',
    name: '500 크레딧',
    description: '대량 사용자를 위한 크레딧 팩',
    type: 'credits',
    price: 79.99,
    currency: 'USD',
    originalPrice: 99.99,
    credits: 500,
    discount: 20,
    features: [
      '500개 영상 생성 가능',
      '한도 없이 사용 가능',
      '유효기간 없음',
      '추가 20% 보너스'
    ],
    icon: <Sparkles className="w-6 h-6" />,
    color: 'yellow',
    pricingType: 'once'
  },
  {
    id: 'template_pack_premium',
    name: '프리미엄 템플릿 팩',
    description: '전문가 수준의 50+ 템플릿',
    type: 'template',
    price: 49.99,
    currency: 'USD',
    originalPrice: 99.99,
    discount: 50,
    features: [
      '50+ 프리미엄 템플릿',
      '매월 5개 새 템플릿 업데이트',
      '상업적 사용 허가',
      '무제한 다운로드'
    ],
    icon: <Gift className="w-6 h-6" />,
    color: 'green',
    pricingType: 'once'
  }
];

const PURCHASE_HISTORY: PurchaseHistory[] = [
  {
    id: 'purchase_1',
    productId: 'premium_monthly',
    productName: 'Premium (월간)',
    type: 'subscription',
    price: 29.99,
    currency: 'USD',
    date: '2024-11-01',
    status: 'completed',
    paymentMethod: '카드',
    transactionId: 'TXN_123456789'
  },
  {
    id: 'purchase_2',
    productId: 'credits_100',
    productName: '100 크레딧',
    type: 'credits',
    price: 19.99,
    currency: 'USD',
    date: '2024-10-15',
    status: 'completed',
    paymentMethod: '카드',
    transactionId: 'TXN_123456790'
  }
];

export default function ShopPaymentSystem() {
  const [products] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [purchaseHistory] = useState<PurchaseHistory[]>(PURCHASE_HISTORY);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // 카트에 상품 추가
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, total: product.price }];
    });
  };

  // 카트에서 상품 제거
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // 수량 변경
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === productId
        ? { ...item, quantity, total: quantity * item.price }
        : item
    ));
  };

  // 총 금액 계산
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  // 결제 처리
  const processPayment = async () => {
    setPaymentProcessing(true);
    try {
      // 실제 결제 처리 로직
      // const response = await fetch('/api/payment/process', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     items: cart,
      //     paymentMethod,
      //     promoCode: promoApplied ? promoCode : null
      //   })
      // });

      await new Promise(resolve => setTimeout(resolve, 2000)); // 데모용
      console.log('결제 성공');
      setCart([]);
      setSelectedProduct(null);
    } catch (error) {
      console.error('결제 실패:', error);
    } finally {
      setPaymentProcessing(false);
    }
  };

  // 프로모션 코드 적용
  const applyPromoCode = () => {
    if (promoCode === 'WELCOME20') {
      setPromoApplied(true);
      console.log('프로모션 코드 적용됨: 20% 할인');
    } else {
      console.log('유효하지 않은 프로모션 코드');
    }
  };

  // 결제 방법 렌더링
  const renderPaymentMethod = (method: string) => {
    const methods = {
      card: { icon: <CreditCard className="w-5 h-5" />, label: '신용카드' },
      kakaopay: { icon: <Smartphone className="w-5 h-5" />, label: '카카오페이' },
      naverpay: { icon: <Smartphone className="w-5 h-5" />, label: '네이버페이' },
      paypal: { icon: <DollarSign className="w-5 h-5" />, label: 'PayPal' }
    };

    const selected = methods[method as keyof typeof methods];
    return selected ? (
      <div className="flex items-center gap-2">
        {selected.icon}
        <span>{selected.label}</span>
      </div>
    ) : null;
  };

  // 상품 카드 렌더링
  const renderProductCard = (product: Product) => {
    const isInCart = cart.some(item => item.id === product.id);

    return (
      <Card key={product.id} className={`relative hover:shadow-lg transition-all ${
        product.popular ? 'border-blue-500 border-2' : ''
      }`}>
        {product.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-500">가장 인기</Badge>
          </div>
        )}

        <CardHeader className="text-center pb-3">
          <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-${product.color}-100`}>
            <div className={`text-${product.color}-600`}>{product.icon}</div>
          </div>
          <CardTitle className="text-xl">{product.name}</CardTitle>
          <p className="text-sm text-gray-600">{product.description}</p>

          <div className="flex items-center justify-center gap-2">
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                ${product.originalPrice}
              </span>
            )}
            <span className="text-3xl font-bold">
              ${product.price}
            </span>
            <span className="text-gray-600">
              {product.pricingType === 'monthly' ? '/월' :
               product.pricingType === 'yearly' ? '/년' : ''}
            </span>
          </div>

          {product.discount && (
            <Badge variant="destructive" className="text-xs">
              {product.discount}% 할인
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            {product.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            variant={isInCart ? "outline" : "default"}
            onClick={() => {
              if (isInCart) {
                removeFromCart(product.id);
              } else {
                addToCart(product);
              }
            }}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                카트에 추가됨
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                카트에 추가
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const cartTotal = calculateTotal();

  return (
    <div className="h-screen bg-gray-50">
      <div className="flex h-full">
        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold">상점</h1>
                  <p className="text-gray-600">SurvivingVid의 프리미엄 기능을 구매하세요</p>
                </div>

                <Tabs defaultValue="subscriptions" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="subscriptions">구독</TabsTrigger>
                    <TabsTrigger value="credits">크레딧</TabsTrigger>
                    <TabsTrigger value="addons">애드온</TabsTrigger>
                    <TabsTrigger value="history">구매 내역</TabsTrigger>
                  </TabsList>

                  {/* 구독 */}
                  <TabsContent value="subscriptions">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {products.filter(p => p.type === 'subscription').map(renderProductCard)}
                    </div>
                  </TabsContent>

                  {/* 크레딧 */}
                  <TabsContent value="credits">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.filter(p => p.type === 'credits').map(renderProductCard)}
                    </div>
                  </TabsContent>

                  {/* 애드온 */}
                  <TabsContent value="addons">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.filter(p => p.type === 'template').map(renderProductCard)}
                    </div>
                  </TabsContent>

                  {/* 구매 내역 */}
                  <TabsContent value="history">
                    <Card>
                      <CardHeader>
                        <CardTitle>구매 내역</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {purchaseHistory.map(purchase => (
                            <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium">{purchase.productName}</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div>날짜: {new Date(purchase.date).toLocaleDateString('ko-KR')}</div>
                                  <div>결제 수단: {purchase.paymentMethod}</div>
                                  <div>거래 ID: {purchase.transactionId}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold">${purchase.price}</div>
                                <Badge variant={
                                  purchase.status === 'completed' ? 'default' :
                                  purchase.status === 'pending' ? 'secondary' :
                                  purchase.status === 'failed' ? 'destructive' : 'outline'
                                }>
                                  {purchase.status === 'completed' ? '완료' :
                                   purchase.status === 'pending' ? '대기 중' :
                                   purchase.status === 'failed' ? '실패' : '환불'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* 카트 사이드바 */}
        <div className="w-96 border-l bg-white flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <h2 className="text-xl font-semibold">장바구니</h2>
              <Badge variant="outline">{cart.length}</Badge>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4" />
                <p>장바구니가 비어있습니다</p>
                <p className="text-sm">상품을 추가해주세요</p>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${item.total.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">${item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t p-6 space-y-4">
                {/* 프로모션 코드 */}
                <div className="space-y-2">
                  <Label>프로모션 코드</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="코드 입력"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromoCode}
                      disabled={promoApplied || !promoCode}
                    >
                      {promoApplied ? '적용됨' : '적용'}
                    </Button>
                  </div>
                </div>

                {/* 결제 방법 */}
                <div className="space-y-2">
                  <Label>결제 수단</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">
                        {renderPaymentMethod('card')}
                      </SelectItem>
                      <SelectItem value="kakaopay">
                        {renderPaymentMethod('kakaopay')}
                      </SelectItem>
                      <SelectItem value="naverpay">
                        {renderPaymentMethod('naverpay')}
                      </SelectItem>
                      <SelectItem value="paypal">
                        {renderPaymentMethod('paypal')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* 합계 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>소계:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>할인 (20%):</span>
                      <span>-${(cartTotal * 0.2).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold">
                    <span>총계:</span>
                    <span>${(promoApplied ? cartTotal * 0.8 : cartTotal).toFixed(2)}</span>
                  </div>
                </div>

                {/* 결제 버튼 */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={processPayment}
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      안전 결제
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Shield className="w-3 h-3" />
                    <span>안전한 결제 처리</span>
                  </div>
                  <div>모든 거래는 SSL로 암호화됩니다</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}