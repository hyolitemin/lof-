
export enum CommissionMode {
  STANDARD = 'STANDARD', // 5元最低
  MIN_01 = 'MIN_01',    // 免五 (0.1元)
}

export interface StrategyConfig {
  minAssets: number;     // 规模阈值 (亿元)
  minVolume: number;     // 成交额阈值 (万元)
  maxQuota: number;      // 限购上限 (元)
  minNetProfit: number;  // 最小期望净利 (元)
}

export interface UserSettings {
  capital: number;
  minCommission: number;
  commissionRate: number; // e.g., 0.00025 for 0.025%
  subscriptionFee: number; // e.g., 0.0015 for 0.15%
  strategy: StrategyConfig; // Dynamic strategy parameters
}

export interface LOFFund {
  code: string;
  name: string;
  price: number;
  iopv: number;
  premium: number; // 溢价率
  assets: number; // 基金规模 (亿元)
  volume: number; // 日均成交 (万元)
  quota: number;  // 限购额度
  ma5: number;
  isLimitDown: boolean;
  gap: number; // 缺口 %
}

export interface BacktestResult {
  date: string;
  equity: number;
  signal: boolean;
  return: number;
}

export interface ArbitrageSignal extends LOFFund {
  score: number;
  expectedNetProfit: number;
  isGoodCake: boolean;
  warnings: string[];
}
