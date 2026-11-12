
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ArbitrageSignal, UserSettings } from '../types';
import { MOCK_LOF_LIST, LOFMetadata } from '../constants';
import { calculateSignal } from '../services/strategyService';
import { GeminiService } from '../services/geminiService';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCcw,
  Info,
  BrainCircuit,
  Search,
  Database,
  X,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Layers
} from 'lucide-react';

interface Props {
  settings: UserSettings;
}

// Custom Tooltip for the K-Line chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-[10px] space-y-1">
        <p className="text-slate-400 mb-1 border-b border-slate-700 pb-1 font-mono">{data.date}</p>
        <p className="flex justify-between gap-4">
          <span className="text-slate-500">开盘:</span>
          <span className="text-white mono">{data.open.toFixed(3)}</span>
        </p>
        <p className="flex justify-between gap-4">
          <span className="text-slate-500">最高:</span>
          <span className="text-white mono">{data.high.toFixed(3)}</span>
        </p>
        <p className="flex justify-between gap-4">
          <span className="text-slate-500">最低:</span>
          <span className="text-white mono">{data.low.toFixed(3)}</span>
        </p>
        <p className="flex justify-between gap-4">
          <span className="text-slate-500 font-bold">收盘:</span>
          <span className="text-white mono font-bold">{data.close.toFixed(3)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<Props> = ({ settings }) => {
  const [signals, setSignals] = useState<(ArbitrageSignal & { category: string })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('--:--:--');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<(ArbitrageSignal & { category: string }) | null>(null);

  const scan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const newSignals = MOCK_LOF_LIST.map(mock => {
        // 模拟实时价格
        const mockPrice = 1 + (Math.random() * 0.15);
        const mockIopv = 1 + (Math.random() * 0.08);
        const signal = calculateSignal({
          code: mock.code,
          name: mock.name,
          price: mockPrice,
          iopv: mockIopv,
          premium: 0, 
          assets: mock.assets,
          volume: mock.volume,
          quota: mock.quota,
          ma5: mockPrice * (0.95 + Math.random() * 0.1),
          isLimitDown: false,
          gap: -0.005,
        }, settings);
        return { ...signal, category: mock.category };
      });
      setSignals(newSignals.sort((a, b) => b.score - a.score));
      setIsScanning(false);
      setLastUpdate(new Date().toLocaleTimeString());
    }, 800);
  };

  const getAIAnalysis = async () => {
    setIsAnalyzing(true);
    const gemini = new GeminiService();
    const analysis = await gemini.analyzeOpportunities(signals);
    setAiAnalysis(analysis || "暂时无法生成分析报表。");
    setIsAnalyzing(false);
  };

  useEffect(() => {
    scan();
  }, [settings]);

  const filteredSignals = useMemo(() => {
    if (!searchTerm) return signals;
    const lower = searchTerm.toLowerCase();
    return signals.filter(s => 
      s.code.toLowerCase().includes(lower) || 
      s.name.toLowerCase().includes(lower)
    );
  }, [signals, searchTerm]);

  /**
   * 基于当日实时价格（selectedSignal.price）逆向生成 30 天价格走势
   */
  const kLineData = useMemo(() => {
    if (!selectedSignal) return [];
    
    const data = [];
    const days = 30;
    const today = new Date();
    
    // 算法：从今日(T)开始，反向推导(T-1, T-2...)
    // 今日收盘价 = selectedSignal.price
    let currentDayClose = selectedSignal.price;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // 生成当日波动
      const volatility = 0.025; // 假设日波动率
      const close = currentDayClose;
      // 随机生成当日涨跌方向，用于确定开盘价
      const returnRate = (Math.random() - 0.48) * volatility; 
      const open = close / (1 + returnRate);
      
      const high = Math.max(open, close) * (1 + Math.random() * 0.008);
      const low = Math.min(open, close) * (1 - Math.random() * 0.008);
      
      data.unshift({ // unshift 确保数组按日期正序排列（左旧右新）
        date: dateStr,
        open,
        close,
        high,
        low,
        body: [Math.min(open, close), Math.max(open, close)],
        wick: [low, high],
        isUp: close >= open
      });
      
      // 前一日的收盘价 = 今日的开盘价 (简化模型)
      currentDayClose = open;
    }
    
    return data;
  }, [selectedSignal]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-indigo-400" />
            机会看板 (指数+股票 LOF)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            覆盖全市场 {MOCK_LOF_LIST.length} 只主流 LOF 基金，按“蛋糕理论”实时筛选
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text"
              placeholder="搜索名称或代码 (如 161226)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={scan}
              disabled={isScanning}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-900/20"
            >
              <RefreshCcw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              刷新行情
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">基金标的</th>
                    <th className="px-6 py-4 font-medium">实时溢价</th>
                    <th className="px-6 py-4 font-medium">限额 / 规模</th>
                    <th className="px-6 py-4 font-medium">预估净赚</th>
                    <th className="px-6 py-4 font-medium">状态评分</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredSignals.length > 0 ? filteredSignals.map((sig) => (
                    <tr 
                      key={sig.code} 
                      onClick={() => setSelectedSignal(sig)}
                      className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-8 rounded-full ${sig.category === '指数型' ? 'bg-indigo-500' : sig.category === '股票型' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <div className="flex flex-col">
                            <span className="text-white font-medium group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                              {sig.name}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 font-normal">
                                {sig.category}
                              </span>
                            </span>
                            <span className="text-slate-500 text-xs mono">{sig.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`font-semibold ${(sig.premium > 0.01) ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {(sig.premium * 100).toFixed(2)}%
                          </span>
                          <span className="text-[10px] text-slate-500">IOPV: {sig.iopv.toFixed(3)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">限:</span>
                            <span className={sig.quota <= settings.strategy.maxQuota ? 'text-indigo-300' : 'text-slate-400'}>
                              {sig.quota >= 1000000 ? '无限额' : sig.quota.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">规:</span>
                            <span className={sig.assets >= settings.strategy.minAssets ? 'text-emerald-400/80' : 'text-slate-400'}>{sig.assets}亿</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-lg font-bold ${sig.expectedNetProfit >= settings.strategy.minNetProfit ? 'text-emerald-400' : 'text-slate-500'}`}>
                          ￥{sig.expectedNetProfit.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              {sig.isGoodCake ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                              )}
                              <span className={`text-xs font-bold ${sig.score > 70 ? 'text-emerald-400' : 'text-slate-400'}`}>{sig.score}分</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm italic">
                        未找到匹配 "{searchTerm}" 的 LOF 基金
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-900/80 px-6 py-3 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                当前分类: 指数、股票、商品全覆盖
              </span>
              <span className="hidden sm:inline">上次同步: {lastUpdate}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-5 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <BrainCircuit className="w-16 h-16 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2 mb-3">
              <BrainCircuit className="w-5 h-5" />
              AI 专家点评
            </h3>
            {aiAnalysis ? (
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {aiAnalysis}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-slate-400 text-sm mb-4">分析当日行情波动，寻找“蛋糕”裂缝</p>
                <button 
                  onClick={getAIAnalysis}
                  disabled={isAnalyzing || signals.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/40"
                >
                  {isAnalyzing ? '分析中...' : '生成智能简报'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-sm">
            <h3 className="text-slate-300 font-bold mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              数据来源
            </h3>
            <div className="space-y-3 text-[11px] leading-relaxed">
              <p className="text-slate-400">底层数据对接 <span className="text-emerald-400 font-mono">AkShare</span> 接口：</p>
              <ul className="space-y-2">
                <li className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700/50">
                  <span className="text-slate-300">标普/纳指/股票行情</span>
                  <span className="text-slate-500 italic">Sina/Eastmoney</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700/50">
                  <span className="text-slate-300">实时估值 IOPV</span>
                  <span className="text-slate-500 italic">CN Index</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal with K-Line */}
      {selectedSignal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${selectedSignal.category === '指数型' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedSignal.name}
                    <span className="text-slate-500 font-mono text-sm font-normal">({selectedSignal.code})</span>
                  </h2>
                  <div className="flex gap-3 mt-1">
                    <span className={`text-sm font-bold flex items-center gap-1 ${selectedSignal.premium > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedSignal.premium > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      溢价: {(selectedSignal.premium * 100).toFixed(2)}%
                    </span>
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      分类: {selectedSignal.category}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSignal(null)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">当前本金预估收益</p>
                  <p className={`text-2xl font-bold ${selectedSignal.expectedNetProfit >= settings.strategy.minNetProfit ? 'text-emerald-400' : 'text-slate-300'}`}>
                    ￥{selectedSignal.expectedNetProfit.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 italic">扣除申购及卖出总成本</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">限额 / 规模</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold text-white">￥{selectedSignal.quota >= 1000000 ? '不限' : selectedSignal.quota.toLocaleString()}</p>
                    <p className="text-slate-400 text-sm pb-1">/ {selectedSignal.assets}亿</p>
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">策略符合度评分</p>
                  <div className="flex items-center gap-3">
                    <p className={`text-2xl font-bold ${selectedSignal.score > 70 ? 'text-indigo-400' : 'text-slate-400'}`}>{selectedSignal.score}</p>
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${selectedSignal.score > 70 ? 'bg-indigo-500' : 'bg-slate-500'}`} 
                        style={{ width: `${selectedSignal.score}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Candlestick Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-[360px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-300 text-sm font-bold flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    最近30个交易日模拟趋势 (锚定当前价格)
                  </h3>
                  <div className="flex gap-4 text-[9px] uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-sm"></div>上涨</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-rose-500 rounded-sm"></div>下跌</div>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height="85%">
                  <ComposedChart data={kLineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      fontSize={8} 
                      tickMargin={10} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(val) => val.split('-').slice(1).join('/')}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      stroke="#475569" 
                      fontSize={8} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(val) => val.toFixed(2)}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.05 }} />
                    
                    {/* Candle Shadow */}
                    <Bar dataKey="wick" barSize={1} isAnimationActive={false}>
                      {kLineData.map((entry, index) => (
                        <Cell key={`wick-${index}`} fill={entry.isUp ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                    
                    {/* Candle Body */}
                    <Bar dataKey="body" barSize={10} isAnimationActive={true}>
                      {kLineData.map((entry, index) => (
                        <Cell key={`body-${index}`} fill={entry.isUp ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs text-slate-400 leading-relaxed">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-indigo-300 font-bold mb-1 underline decoration-indigo-500/30">套利风控提示</p>
                  如果您在 15:00 前申购，确认价格为今日收盘净值。T+2 日份额到账后可卖出。
                  {selectedSignal.category === '指数型' ? ' 指数基金受跟踪标的影响大，需关注外部市场波动。' : ' 股票型基金波动率通常更高，注意回撤风险。'}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
              <button 
                onClick={() => setSelectedSignal(null)}
                className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
              >
                关闭详情
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
