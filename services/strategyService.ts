
import { LOFFund, ArbitrageSignal, UserSettings } from '../types';

export const calculateSignal = (fund: LOFFund, settings: UserSettings): ArbitrageSignal => {
  const premium = (fund.price / fund.iopv) - 1;
  const { strategy } = settings;
  
  // Costs
  const subCost = settings.capital * settings.subscriptionFee;
  const sellVolume = settings.capital * (1 + premium);
  const commission = Math.max(settings.minCommission, sellVolume * settings.commissionRate);
  const totalCost = subCost + commission;
  
  const expectedNetProfit = (settings.capital * premium) - totalCost;
  
  const warnings: string[] = [];
  if (fund.assets < strategy.minAssets) warnings.push('规模过小');
  if (fund.volume < strategy.minVolume) warnings.push('成交不足');
  if (fund.quota > strategy.maxQuota) warnings.push('限购过松');
  if (fund.price <= fund.ma5) warnings.push('均线压制');
  if (fund.isLimitDown) warnings.push('近期跌停');
  if (fund.gap < -0.02) warnings.push('跳空大缺口');

  const isGoodCake = 
    fund.assets >= strategy.minAssets &&
    fund.volume >= strategy.minVolume &&
    fund.quota <= strategy.maxQuota &&
    fund.price > fund.ma5 &&
    !fund.isLimitDown &&
    fund.gap >= -0.02 &&
    expectedNetProfit >= strategy.minNetProfit;

  // Simple scoring logic 0-100
  let score = 50;
  if (isGoodCake) score += 30;
  score += Math.min(20, premium * 500); // Higher premium = higher score up to 20

  return {
    ...fund,
    premium,
    expectedNetProfit,
    isGoodCake,
    warnings,
    score
  };
};

export const runBacktest = (
  history: { date: string; price: number; iopv: number; assets: number; quota: number; volume: number; ma5: number }[],
  settings: UserSettings
) => {
  let capital = settings.capital;
  const results: any[] = [];
  let currentHoldings: { buyPrice: number; buyDate: string; amount: number; t: number } | null = null;

  history.forEach((day, index) => {
    // T+2 Logic simulation
    if (currentHoldings) {
      currentHoldings.t += 1;
      if (currentHoldings.t === 2) {
        // T+2 Sell at close price
        const sellVolume = currentHoldings.amount * day.price;
        const commission = Math.max(settings.minCommission, sellVolume * settings.commissionRate);
        capital = sellVolume - commission;
        currentHoldings = null;
      }
    } else {
      // Check signal on T
      const fund: LOFFund = {
        ...day,
        name: 'Backtest Target',
        code: 'TEST',
        premium: (day.price / day.iopv) - 1,
        isLimitDown: false,
        gap: 0,
      };
      
      const sig = calculateSignal(fund, settings);
      
      if (sig.isGoodCake) {
        // Buy on T at IOPV (simulating subscription)
        const subCost = settings.capital * settings.subscriptionFee;
        const netCapital = settings.capital - subCost;
        const amount = netCapital / day.iopv;
        currentHoldings = { buyPrice: day.iopv, buyDate: day.date, amount, t: 0 };
      }
    }

    results.push({
      date: day.date,
      equity: currentHoldings ? currentHoldings.amount * day.price : capital,
      signal: !!currentHoldings && currentHoldings.t === 0
    });
  });

  return results;
};
