export type BootstrapKycStatus = 'verified' | 'pending' | 'unverified';
export type BootstrapCardStatus = 'active' | 'inactive' | 'closed';
export type BootstrapCardType = 'reusable' | 'one_time';
export type BootstrapTransactionType = 'credit' | 'debit';

export interface BootstrapCurrency {
  symbol: string;
  code: string;
}

export interface BootstrapUser {
  id: number;
  name: string;
  initials: string;
  email: string;
  balance: number;
  formattedBalance: string;
  countryName: string | null;
  mobileNumber: string | null;
  imageSrc: string | null;
  kycStatus: BootstrapKycStatus;
  joinedAt: string | null;
}

export interface BootstrapCard {
  id: number;
  name: string;
  type: BootstrapCardType;
  brand: string;
  maskedNumber: string;
  expiry: string;
  balance: number;
  formattedBalance: string;
  status: BootstrapCardStatus;
  cardholderName: string | null;
}

export interface BootstrapTransaction {
  id: number;
  trx: string;
  remark: string;
  type: BootstrapTransactionType;
  amount: number;
  formattedAmount: string;
  details: string;
  createdAt: string | null;
  postBalance: number;
}

export interface BootstrapMetrics {
  activeCardCount: number;
  totalCardCount: number;
  totalCardBalance: number;
  formattedTotalCardBalance: string;
  transactionCount: number;
  topUpCount: number;
}

export interface AppBootstrap {
  siteName: string;
  currency: BootstrapCurrency;
  user: BootstrapUser;
  cards: BootstrapCard[];
  transactions: BootstrapTransaction[];
  metrics: BootstrapMetrics;
  isDemo: boolean;
}

interface RuntimeBootstrap {
  siteName?: string;
  currency?: Partial<BootstrapCurrency>;
  user?: BootstrapUser | null;
  cards?: BootstrapCard[];
  transactions?: BootstrapTransaction[];
  metrics?: Partial<BootstrapMetrics>;
}

declare global {
  interface Window {
    __DEEPAY_BOOTSTRAP__?: RuntimeBootstrap;
  }
}

const demoCurrency: BootstrapCurrency = {
  symbol: '€',
  code: 'EUR',
};

const demoUser: BootstrapUser = {
  id: 0,
  name: 'DeePay Demo',
  initials: 'DD',
  email: 'demo@deepay.com',
  balance: 18420.15,
  formattedBalance: '€18,420.15',
  countryName: 'Global Account',
  mobileNumber: '+0000000000',
  imageSrc: null,
  kycStatus: 'verified',
  joinedAt: new Date().toISOString(),
};

const demoCards: BootstrapCard[] = [
  {
    id: 1,
    name: '主运营卡',
    type: 'reusable',
    brand: 'Visa',
    maskedNumber: '4532 **** **** 8901',
    expiry: '12/28',
    balance: 1245,
    formattedBalance: '€1,245.00',
    status: 'active',
    cardholderName: 'DeePay Demo',
  },
  {
    id: 2,
    name: '差旅卡',
    type: 'reusable',
    brand: 'Mastercard',
    maskedNumber: '5412 **** **** 3456',
    expiry: '09/27',
    balance: 3890.5,
    formattedBalance: '€3,890.50',
    status: 'active',
    cardholderName: 'DeePay Demo',
  },
];

const demoTransactions: BootstrapTransaction[] = [
  {
    id: 1,
    trx: 'DEMO-ADD-001',
    remark: 'add_money',
    type: 'credit',
    amount: 5000,
    formattedAmount: '+5,000.00',
    details: 'Demo funding completed',
    createdAt: new Date().toISOString(),
    postBalance: 18420.15,
  },
  {
    id: 2,
    trx: 'DEMO-CARD-001',
    remark: 'virtual_card_add_fund',
    type: 'debit',
    amount: 1200,
    formattedAmount: '-1,200.00',
    details: 'Card balance allocated',
    createdAt: new Date().toISOString(),
    postBalance: 13420.15,
  },
  {
    id: 3,
    trx: 'DEMO-SEND-001',
    remark: 'send_money',
    type: 'debit',
    amount: 320,
    formattedAmount: '-320.00',
    details: 'Vendor payout prepared',
    createdAt: new Date().toISOString(),
    postBalance: 13100.15,
  },
];

const demoMetrics: BootstrapMetrics = {
  activeCardCount: 2,
  totalCardCount: 2,
  totalCardBalance: 5135.5,
  formattedTotalCardBalance: '€5,135.50',
  transactionCount: 38,
  topUpCount: 6,
};

export function getDemoBootstrap(): AppBootstrap {
  return {
    siteName: 'DeePay',
    currency: demoCurrency,
    user: demoUser,
    cards: demoCards,
    transactions: demoTransactions,
    metrics: demoMetrics,
    isDemo: true,
  };
}

export function getAppBootstrap(): AppBootstrap {
  const runtime = typeof window !== 'undefined' ? window.__DEEPAY_BOOTSTRAP__ : undefined;
  const demo = getDemoBootstrap();
  const hasRealUser = Boolean(runtime?.user);

  return {
    siteName: runtime?.siteName || demo.siteName,
    currency: {
      symbol: runtime?.currency?.symbol || demo.currency.symbol,
      code: runtime?.currency?.code || demo.currency.code,
    },
    user: hasRealUser ? runtime!.user! : demo.user,
    cards: hasRealUser ? runtime?.cards || [] : demo.cards,
    transactions: hasRealUser ? runtime?.transactions || [] : demo.transactions,
    metrics: {
      activeCardCount: runtime?.metrics?.activeCardCount ?? demo.metrics.activeCardCount,
      totalCardCount: runtime?.metrics?.totalCardCount ?? demo.metrics.totalCardCount,
      totalCardBalance: runtime?.metrics?.totalCardBalance ?? demo.metrics.totalCardBalance,
      formattedTotalCardBalance: runtime?.metrics?.formattedTotalCardBalance ?? demo.metrics.formattedTotalCardBalance,
      transactionCount: runtime?.metrics?.transactionCount ?? demo.metrics.transactionCount,
      topUpCount: runtime?.metrics?.topUpCount ?? demo.metrics.topUpCount,
    },
    isDemo: !hasRealUser,
  };
}

export function formatMoney(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function maskEmailAddress(email: string): string {
  const [localPart, domain = ''] = email.split('@');
  if (!localPart) {
    return email;
  }

  const visiblePrefix = localPart.slice(0, 3);
  const hiddenLength = Math.max(localPart.length - visiblePrefix.length, 2);
  return `${visiblePrefix}${'*'.repeat(hiddenLength)}@${domain}`;
}

export function formatDateLabel(value: string | null): string {
  if (!value) {
    return '刚刚';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '刚刚';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTimeLabel(value: string | null): string {
  if (!value) {
    return '刚刚';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '刚刚';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getKycStatusLabel(status: BootstrapKycStatus): string {
  switch (status) {
    case 'verified':
      return '审核通过';
    case 'pending':
      return '审核中';
    default:
      return '待完成';
  }
}

export function getTransactionTitle(transaction: BootstrapTransaction): string {
  switch (transaction.remark) {
    case 'add_money':
      return '入金成功';
    case 'send_money':
      return '发起转账';
    case 'receive_money':
      return '收款到账';
    case 'virtual_card_add_fund':
      return '卡片充值';
    case 'withdraw':
      return '提现申请';
    case 'cash_in':
      return '代理入金';
    case 'cash_out':
      return '现金支出';
    case 'make_payment':
      return '商户付款';
    case 'receive_payment':
      return '商户收款';
    default:
      return transaction.details || '账户变动';
  }
}

export function getTransactionSubtitle(transaction: BootstrapTransaction): string {
  if (transaction.details) {
    return transaction.details;
  }

  return transaction.trx;
}

export function getCardTypeLabel(type: BootstrapCardType): string {
  return type === 'one_time' ? '一次性虚拟卡' : '可复用虚拟卡';
}

export function getCardStatusLabel(status: BootstrapCardStatus): string {
  switch (status) {
    case 'active':
      return '已激活';
    case 'inactive':
      return '未激活';
    default:
      return '已关闭';
  }
}