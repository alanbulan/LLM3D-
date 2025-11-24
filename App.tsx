import React, { useState, useEffect } from 'react';
import Visualizer3D from './components/Visualizer3D';
import { AppStage } from './types';
import { getExplanation } from './services/geminiService';

// Icons
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const Sparkles = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>;

const STAGES = [
  { 
    id: AppStage.INTRO, 
    title: "LLM 全景概览", 
    subtitle: "Architecture Overview",
    desc: "Large Language Models (LLM) 并非魔法，而是一个巨大的数学函数。它接收文本，将其转换为数字序列，通过数十亿参数的计算，预测下一个最可能的字。本可视化将带您深入其内部工作流。" 
  },
  { 
    id: AppStage.TOKENIZATION, 
    title: "1. 词元化与编码", 
    subtitle: "Tokenization & Encoding",
    desc: "输入：“The quick brown fox”。计算机不认识单词，只认识数字。Tokenizer（分词器）使用 BPE 算法将文本切分为 Token，并查表赋予每个 Token 一个唯一的整数 ID（如 464, 2048）。这是模型的入口。" 
  },
  { 
    id: AppStage.EMBEDDING, 
    title: "2. 嵌入层 (Embedding)", 
    subtitle: "Vector Lookup Table",
    desc: "整数 ID 没有任何语义信息（ID 2048 并不比 ID 1024 大两倍）。模型使用一个巨大的“查找表”（Embedding Matrix），将每个 ID 映射为一个稠密向量（Dense Vector）。在这个高维空间中，语义相似的词位置更接近。这是模型理解词义的基础。" 
  },
  { 
    id: AppStage.TRANSFORMER, 
    title: "3. Transformer 模块", 
    subtitle: "Attention & Feed Forward",
    desc: "这是 LLM 的大脑。数据流经多个层：\n(1) Self-Attention（自注意力）：Token 之间互相“交流”，捕捉上下文依赖（如 'fox' 关注 'quick'）。\n(2) Feed Forward（前馈网络）：处理信息，提取更高级的特征。\n(3) Residual Connection：防止信息在深层网络中丢失。" 
  },
  { 
    id: AppStage.PREDICTION, 
    title: "4. 输出与概率采样", 
    subtitle: "Logits & Softmax",
    desc: "经过所有层处理后，最后一个 Token 的向量包含了对“接下来会发生什么”的理解。它通过 Unembedding 层映射回词表大小，再经由 Softmax 函数转化为概率分布。最后，根据概率（通常结合 Temperature 参数）采样选出下一个词（如 'jumps'）。" 
  }
];

const App = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);

  const currentStage = STAGES[currentStageIndex];

  const handleNext = () => {
    if (currentStageIndex < STAGES.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(prev => prev - 1);
    }
  };

  // Fetch AI explanation when stage changes
  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingTip(true);
      setAiTip(null);
      // Construct a concept to ask Gemini about based on the current stage title
      const concept = currentStage.title.split('.')[1]?.trim() || currentStage.title; 
      const insight = await getExplanation(concept);
      setAiTip(insight);
      setLoadingTip(false);
    };

    // Debounce slightly to avoid rapid clicking api calls
    const timer = setTimeout(() => {
        fetchInsight();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentStageIndex, currentStage.title]);

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* Left Panel: 3D Visualization */}
      <div className="flex-1 h-full p-0 relative bg-gradient-to-br from-black to-gray-900">
         <Visualizer3D stage={currentStage.id} />
         
         {/* Floating Stage Indicator in 3D view area */}
         <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700 text-sm font-mono text-gray-300 pointer-events-none select-none">
            PIPELINE STAGE: {currentStage.id}
         </div>
      </div>

      {/* Right Panel: Controls & Explanation */}
      <div className="w-[420px] h-full flex flex-col border-l border-gray-800 bg-[#0a0a0a] z-10 shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-[#0c0c0c]">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            LLM Inside: 核心原理
          </h1>
          <p className="text-xs text-gray-500 mt-1">Deep Dive Visualization</p>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Main Stage Text */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{currentStage.title}</h2>
            <h3 className="text-sm font-bold text-purple-400 mb-4 uppercase tracking-widest">{currentStage.subtitle}</h3>
            <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
              {currentStage.desc}
            </p>
          </div>

          {/* AI Insight Section (Gemini) */}
          <div className="bg-blue-900/10 rounded-xl p-5 border border-blue-900/30">
            <div className="flex items-center gap-2 mb-3 text-blue-400">
              <Sparkles />
              <span className="text-xs font-bold uppercase tracking-widest">Gemini 深度解析</span>
            </div>
            <div className="min-h-[60px] text-sm text-gray-300 leading-relaxed">
               {loadingTip ? (
                   <div className="flex space-x-1 animate-pulse py-2">
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                   </div>
               ) : (
                   aiTip
               )}
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-3 pt-4 border-t border-gray-800">
             <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Technical Specifications</h4>
             
             {currentStage.id === AppStage.TOKENIZATION && (
                 <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 font-mono">
                     <div className="bg-gray-900 border border-gray-800 p-2 rounded">Vocab: ~50,257</div>
                     <div className="bg-gray-900 border border-gray-800 p-2 rounded">Algo: Byte-Pair Encoding</div>
                 </div>
             )}
             {currentStage.id === AppStage.EMBEDDING && (
                 <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 font-mono">
                     <div className="bg-gray-900 border border-gray-800 p-2 rounded">Dim (d_model): 768/4096</div>
                     <div className="bg-gray-900 border border-gray-800 p-2 rounded">Positional Encoding: Rotary/Sinusoidal</div>
                 </div>
             )}
             {currentStage.id === AppStage.TRANSFORMER && (
                 <div className="grid grid-cols-1 gap-2 text-xs text-gray-400 font-mono">
                     <div className="bg-gray-900 border border-gray-800 p-2 rounded flex justify-between"><span>Attention:</span> <span>Multi-Head (Q,K,V)</span></div>
                     <div className="bg-gray-900 border border-gray-800 p-2 rounded flex justify-between"><span>Activation:</span> <span>GeLU / SwiGLU</span></div>
                     <div className="bg-gray-900 border border-gray-800 p-2 rounded flex justify-between"><span>Norm:</span> <span>RMSNorm / LayerNorm</span></div>
                 </div>
             )}
             {currentStage.id === AppStage.PREDICTION && (
                 <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 font-mono">
                     <div className="bg-gray-900 border border-gray-800 p-2 rounded">Temp: 0.7 - 1.0</div>
                     <div className="bg-gray-900 border border-gray-800 p-2 rounded">Top-P / Top-K</div>
                 </div>
             )}
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-gray-800 bg-[#0c0c0c]">
          <div className="flex items-center justify-between gap-4">
            <button 
              onClick={handlePrev}
              disabled={currentStageIndex === 0}
              className={`flex items-center justify-center w-12 h-12 rounded-full border border-gray-700 transition-all ${
                currentStageIndex === 0 
                ? 'opacity-30 cursor-not-allowed text-gray-600' 
                : 'hover:bg-blue-600 hover:border-blue-500 text-white shadow-lg shadow-blue-900/20'
              }`}
            >
              <ChevronLeft />
            </button>

            <div className="flex-1 flex justify-center gap-1.5">
                {STAGES.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx <= currentStageIndex ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-gray-800'}`}
                    />
                ))}
            </div>

            <button 
              onClick={handleNext}
              disabled={currentStageIndex === STAGES.length - 1}
              className={`flex items-center justify-center w-12 h-12 rounded-full border border-gray-700 transition-all ${
                currentStageIndex === STAGES.length - 1
                ? 'opacity-30 cursor-not-allowed text-gray-600' 
                : 'hover:bg-blue-600 hover:border-blue-500 text-white shadow-lg shadow-blue-900/20'
              }`}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
