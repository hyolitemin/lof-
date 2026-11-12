
import React from 'react';
import { UserSettings, StrategyConfig } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { Settings as SettingsIcon, Save, Info, Zap, LayoutPanelTop, RotateCcw, Target } from 'lucide-react';

interface Props {
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

const Settings: React.FC<Props> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleStrategyChange = (key: keyof StrategyConfig, value: number) => {
    setLocalSettings({
      ...localSettings,
      strategy: {
        ...localSettings.strategy,
        [key]: value
      }
    });
  };

  const resetStrategyToDefault = () => {
    setLocalSettings({
      ...localSettings,
      strategy: { ...DEFAULT_SETTINGS.strategy }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 p-2 rounded-lg">
            <SettingsIcon className="text-indigo-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">系统参数配置</h1>
            <p className="text-slate-500 text-xs mt-0.5">定制您的专属套利雷达过滤规则</p>
          </div>
        </div>
        <button 
          onClick={() => onSave(localSettings)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/40 font-bold active:scale-95"
        >
          <Save className="w-4 h-4" />
          保存全局配置
        </button>
      </div>

      <div className="grid gap-8">
        {/* Section 1: Custom Strategy Parameters */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="bg-slate-800/60 px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              自定义策略参数 (Custom Strategy Parameters)
            </h3>
            <button 
              onClick={resetStrategyToDefault}
              className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-indigo-400 flex items-center gap-1.5 transition-colors group"
            >
              <RotateCcw className="w-3 h-3 group-hover:rotate-[-45deg] transition-transform" />
              恢复策略默认值
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-slate-300">最小基金规模 (亿元)</label>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Min Assets</span>
              </div>
              <div className="relative group">
                <input 
                  type="number" 
                  step="0.1"
                  value={localSettings.strategy.minAssets}
                  onChange={(e) => handleStrategyChange('minAssets', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 outline-none text-white font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                <span className="text-indigo-400">蛋糕要大：</span> 规模过小的基金容易在卖出时由于流动性不足产生剧烈滑点。建议不低于 2.0 亿。
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-slate-300">日均成交额阈值 (万元)</label>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Min Volume</span>
              </div>
              <input 
                type="number" 
                step="5"
                value={localSettings.strategy.minVolume}
                onChange={(e) => handleStrategyChange('minVolume', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 outline-none text-white font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                <span className="text-indigo-400">必须能卖：</span> 成交额决定了您的 2000 元本金能否在二级市场瞬间出局而不影响价格。
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-slate-300">申购限额上限 (元)</label>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Max Quota</span>
              </div>
              <input 
                type="number" 
                step="100"
                value={localSettings.strategy.maxQuota}
                onChange={(e) => handleStrategyChange('maxQuota', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 outline-none text-white font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                <span className="text-indigo-400">按人头分：</span> 超过此额度的基金说明大资金也能进入，高溢价会被迅速摊薄，失去对小资金的保护。
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-slate-300">最小触发收益 (元)</label>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Min Profit</span>
              </div>
              <input 
                type="number" 
                step="1"
                value={localSettings.strategy.minNetProfit}
                onChange={(e) => handleStrategyChange('minNetProfit', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 outline-none text-white font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                <span className="text-indigo-400">有肉才吃：</span> 系统会自动计算申购费及卖出佣金，若扣除后纯利低于此值则判定为“无效机会”。
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Capital & Fees */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            资金规模与成本
          </h3>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-sm font-medium text-slate-400">单笔申购本金 (RMB)</span>
                <span className="text-2xl font-bold text-indigo-400 font-mono">￥{localSettings.capital}</span>
              </div>
              <input 
                type="range"
                min="500"
                max="10000"
                step="100"
                value={localSettings.capital}
                onChange={(e) => setLocalSettings({...localSettings, capital: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-bold tracking-tighter uppercase px-1">
                <span>微小博弈 (500)</span>
                <span>最佳实践 (2000)</span>
                <span>上限阈值 (10000)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700/30">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">券商最低佣金 (元)</label>
                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-xl p-3">
                  <span className="text-slate-600 font-bold">￥</span>
                  <input 
                    type="number" 
                    step="0.1"
                    value={localSettings.minCommission}
                    onChange={(e) => setLocalSettings({...localSettings, minCommission: parseFloat(e.target.value) || 0})}
                    className="bg-transparent outline-none text-white w-full font-mono font-bold"
                  />
                </div>
                <p className="text-[10px] text-slate-600 italic">若您的账户为“免五”，请输入 0.1 或 0</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">基础申购费率 (%)</label>
                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-xl p-3">
                  <input 
                    type="number" 
                    step="0.01"
                    value={Number((localSettings.subscriptionFee * 100).toFixed(2))}
                    onChange={(e) => setLocalSettings({...localSettings, subscriptionFee: (parseFloat(e.target.value) || 0) / 100})}
                    className="bg-transparent outline-none text-white w-full font-mono font-bold text-right"
                  />
                  <span className="text-slate-600 font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-600 italic">大部分互联网券商为一折申购 (0.1%~0.15%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Notification (Optional) */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-400" />
            自动化与消息推送
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Server酱 SendKey (微信推送)</label>
              <input 
                type="password" 
                placeholder="在此输入您的 SendKey..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 outline-none text-white focus:border-indigo-500 transition-all font-mono"
              />
            </div>
            <div className="flex items-center gap-3 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
              <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
              <div>
                <label className="text-sm text-slate-200 font-semibold cursor-pointer">启用 15:00 前尾盘机会强力提醒</label>
                <p className="text-[10px] text-slate-500">当发现评分超过 85 分的信号时，自动通过 API 发送通知</p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Banner */}
        <div className="bg-amber-900/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
          <div className="text-xs text-amber-200/70 leading-relaxed">
            <strong className="text-amber-400 block mb-1">小资金博弈必读：</strong> 
            当前本金 <span className="text-amber-300 font-bold">￥{localSettings.capital}</span> 配合 <span className="text-amber-300 font-bold">￥{localSettings.minCommission}</span> 的最低佣金，意味着您的卖出成本占比高达 <span className="text-amber-400 font-bold font-mono">{(localSettings.minCommission / localSettings.capital * 100).toFixed(2)}%</span>。
            若加上申购费，单次套利的确定性摩擦成本约为 <span className="text-rose-400 font-bold font-mono">{((localSettings.minCommission / localSettings.capital + localSettings.subscriptionFee) * 100).toFixed(2)}%</span>。
            这意味着溢价率必须高于此值，且持有期间净值波动需在可控范围内方可实现盈利。
          </div>
        </div>
      </div>
    </div>
  );
};

// Supporting Icons
const AlertTriangle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

export default Settings;
