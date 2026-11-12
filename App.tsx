
import React, { useState } from 'react';
import { UserSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import Dashboard from './components/Dashboard';
import Backtest from './components/Backtest';
import Settings from './components/Settings';
import { LayoutGrid, BarChart3, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'backtest' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
              LOF-Hunter <span className="text-indigo-400 font-normal">v1.0</span>
            </span>
          </div>
          
          <nav className="flex items-center gap-1 sm:gap-4">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">机会看板</span>
            </button>
            <button 
              onClick={() => setActiveTab('backtest')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'backtest' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">回测引擎</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">系统设置</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'dashboard' && <Dashboard settings={settings} />}
          {activeTab === 'backtest' && <Backtest settings={settings} />}
          {activeTab === 'settings' && <Settings settings={settings} onSave={(s) => { setSettings(s); setActiveTab('dashboard'); }} />}
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="border-t border-slate-800 bg-slate-900/30 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              系统在线
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              数据源: AKSHARE
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            © 2024 LOF-Hunter 套利系统 | 仅供学习研究，实盘风险自担
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
