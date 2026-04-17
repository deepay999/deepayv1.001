const BASE_URL = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

/* ── Types ─────────────────────────────────────────────────── */
export interface DashboardOverview {
  total_balance: number;
  currency: string;
  today_in: number;
  today_out: number;
}

export interface Wallet {
  currency: string;
  available: number;
  frozen: number;
}

export interface TransferRequest {
  to_user_id: string;
  amount: number;
  currency: string;
}

export interface TransferResponse {
  status: string;
  transfer_id: string;
}

export interface IbanInfo {
  iban: string;
  bic: string;
  balance: number;
}

export interface IbanTransaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  date: string;
}

export interface PaymentCreateRequest {
  amount: number;
  currency: string;
}

export interface PaymentCreateResponse {
  payment_link: string;
  payment_id: string;
  status: string;
}

export interface WithdrawRequest {
  amount: number;
  currency: string;
  method: string;
}

export interface WithdrawResponse {
  status: string;
  withdraw_id: string;
}

export interface Transaction {
  id: number;
  type: 'credit' | 'debit' | 'transfer' | 'withdraw';
  amount: number;
  description: string;
  date: string;
}

/* ── API calls ─────────────────────────────────────────────── */
export const api = {
  getDashboardOverview: () =>
    request<DashboardOverview>('/dashboard/overview'),

  getWallets: () =>
    request<Wallet[]>('/wallets'),

  createTransfer: (data: TransferRequest) =>
    request<TransferResponse>('/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getIban: () =>
    request<IbanInfo>('/iban'),

  getIbanTransactions: () =>
    request<IbanTransaction[]>('/iban/transactions'),

  createPayment: (data: PaymentCreateRequest) =>
    request<PaymentCreateResponse>('/payments/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createWithdraw: (data: WithdrawRequest) =>
    request<WithdrawResponse>('/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTransactions: () =>
    request<Transaction[]>('/transactions'),
};
