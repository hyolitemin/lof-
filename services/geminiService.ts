
import { GoogleGenAI } from "@google/genai";
import { ArbitrageSignal } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeOpportunities(signals: ArbitrageSignal[]) {
    const context = signals.map(s => 
      `代码:${s.code}, 名称:${s.name}, 溢价:${(s.premium*100).toFixed(2)}%, 规模:${s.assets}亿, 限购:${s.quota}, 评分:${s.score}, 预期收益:${s.expectedNetProfit.toFixed(2)}元`
    ).join('\n');

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一个专业的LOF套利专家。请基于以下实时扫描信号（蛋糕理论策略），为用户提供简要的操作建议。
        
核心策略（蛋糕理论）：
1. 蛋糕大：规模 > 2亿。
2. 蛋糕结实：价格在MA5上方，无大缺口，无跌停。
3. 按人头分：限购 <= 5000。
4. 有肉吃：预期净收益 > 10元（扣除成本后）。

信号列表：
${context}

请指出最值得关注的前2个机会，并解释原因。如果风险较高，请红字警告。请使用中文回答。`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "暂时无法获取AI分析，请手动检查信号。";
    }
  }
}
