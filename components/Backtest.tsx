
import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { UserSettings } from '../types';
import { runBacktest } from '../services/strategyService';
import { Play, TrendingUp, Wallet, Award, ShieldAlert } from 'lucide-react';

interface Props {
  settings: UserSettings;
}

const Backtest: React.FC<Props> = ({ settings }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [target, setTarget] = useState('161325');

  const startBacktest = () => {
    setLoading(true);
    // Simulate complex backtesting calculation
    setTimeout(() => {
      const history: any[] = [];
      let basePrice = 1.0;
      let baseIopv = 1.0;
      
      for (let i = 0; i < 60; i++) {
        const volatility = 0.02;
        basePrice *= (1 + (Math.random() - 0.45) * volatility); // Slight upward bias
        baseIopv *= (1 + (Math.random() - 0.48) * (volatility * 0.8));
        
        history.push({
          date: `Day ${i + 1}`,
          price: basePrice,
          iopv: baseIopv,
          assets: 5 + Math.random() * 2,
          quota: 500 + Math.random() * 500,
          volume: 100 + Math.random() * 50,
          ma5: basePrice * (0.95 + Math.random() * 0.05)
        });
      }
      
      const res = runBacktest(history, settings);
      setResults(res);
      setLoading(false);
    }, 1200);
  };

  const calculateStats = () => {
    if (!results) return null;
    const initial = results[0].equity;
    const final = results[results.length - 1].equity;
    const totalReturn = ((final - initial) / initial) * 100;
    const trades = results.filter(r => r.signal).length;
    const winningTrades = 0; // Simulated logic
    
    return {
      finalEquity: final.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      tradeCount: trades,
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-indigo-400" />
          策略历史回测
        </h1>
        <button 
          onClick={startBacktest}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          开始回测
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
          <label className="text-slate-500 text-xs block mb-1">回测标的</label>
          <input 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="bg-transparent text-white font-medium w-full outline-none focus:text-indigo-400 transition-colors" 
            placeholder="输入基金代码..."
          />
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
          <label className="text-slate-500 text-xs block mb-1">时间范围</label>
          <select className="bg-transparent text-white font-medium w-full outline-none">
            <option className="bg-slate-800">最近3个月</option>
            <option className="bg-slate-800">最近6个月</option>
            <option className="bg-slate-800">最近1年</option>
          </select>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
          <label className="text-slate-500 text-xs block mb-1">本金金额</label>
          <div className="text-white font-medium">￥{settings.capital}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
          <label className="text-slate-500 text-xs block mb-1">佣金模式</label>
          <div className="text-white font-medium">{settings.minCommission === 5 ? '模式A (最低5元)' : '模式B (免五)'}</div>
        </div>
      </div>

      {results && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">期末资产</p>
                <p className="text-2xl font-bold text-white">￥{stats.finalEquity}</p>
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">累计回报</p>
                <p className="text-2xl font-bold text-emerald-400">+{stats.totalReturn}%</p>
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">交易次数 (T+2)</p>
                <p className="text-2xl font-bold text-white">{stats.tradeCount} 次</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-[400px]">
            <h3 className="text-slate-300 font-bold mb-6">资金净值曲线 (Equity Curve)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorEquity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {Number(stats.totalReturn) < 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-4">
              <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
              <div>
                <p className="text-red-400 font-bold">避坑提示</p>
                <p className="text-red-300/80 text-sm">该标的波动过大或手续费相对 2000 元本金过高，不建议在此阶段进行套利操作。请考虑切换到“免五”券商或选择波动率更稳定的标的。</p>
              </div>
            </div>
          )}
        </>
      )}

      {!results && !loading && (
        <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl h-[400px] flex flex-col items-center justify-center text-slate-500">
          <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
          <p>输入参数并点击“开始回测”查看模拟收益</p>
        </div>
      )}
    </div>
  );
};

export default Backtest;
