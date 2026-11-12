
import { UserSettings } from './types';

export const DEFAULT_SETTINGS: UserSettings = {
  capital: 2000,
  minCommission: 5,
  commissionRate: 0.00025,
  subscriptionFee: 0.0015,
  strategy: {
    minAssets: 2, // 2亿元
    minVolume: 50, // 50万元
    maxQuota: 5000, // 限购上限
    minNetProfit: 10, // 净赚10元
  }
};

export interface LOFMetadata {
  code: string;
  name: string;
  assets: number;
  quota: number;
  volume: number;
  category: '指数型' | '股票型' | '商品型';
}

export const MOCK_LOF_LIST: LOFMetadata[] = [
  { code: '161126', name: '标普500LOF', assets: 15.4, quota: 100, volume: 800, category: '指数型' },
  { code: '161226', name: '纳指100LOF', assets: 22.1, quota: 300, volume: 1200, category: '指数型' },
  { code: '162411', name: '华宝油气LOF', assets: 45.2, quota: 1000, volume: 1500, category: '商品型' },
  { code: '160216', name: '国泰精选LOF', assets: 5.1, quota: 5000, volume: 120, category: '股票型' },
  { code: '161028', name: '富国中证红利', assets: 8.9, quota: 1000000, volume: 300, category: '指数型' },
  { code: '161725', name: '招商白酒LOF', assets: 120.5, quota: 2000, volume: 5000, category: '指数型' },
  { code: '161325', name: '大宗商品LOF', assets: 1.2, quota: 500, volume: 30, category: '商品型' },
  { code: '501018', name: '南方原油LOF', assets: 22.3, quota: 500, volume: 2100, category: '商品型' },
  { code: '160723', name: '嘉实原油LOF', assets: 3.5, quota: 100, volume: 450, category: '商品型' },
  { code: '164824', name: '工银印度LOF', assets: 2.1, quota: 300, volume: 60, category: '指数型' },
  { code: '160133', name: '南方天元股票', assets: 4.8, quota: 2000, volume: 85, category: '股票型' },
  { code: '160645', name: '鹏华精选股票', assets: 3.2, quota: 5000, volume: 45, category: '股票型' },
];
