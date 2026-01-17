
import React, { useState, useRef, useCallback } from 'react';
import { ViewType, AnalysisResult, Severity } from './types';
import { analyzeBodyPosture } from './services/geminiService';

// --- Icons (Inline SVG) ---
const UploadIcon = () => (
  <svg className="w-12 h-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const App: React.FC = () => {
  const [viewType, setViewType] = useState<ViewType>(ViewType.FRONT);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        setResult(null);
        setError(null);
        startAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (imageData: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeBodyPosture(imageData, viewType);
      setResult(data);
    } catch (err) {
      setError("AI 分析失败，请检查网络并重试。");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.SEVERE: return 'bg-red-100 text-red-600 border-red-200';
      case Severity.MODERATE: return 'bg-orange-100 text-orange-600 border-orange-200';
      case Severity.MILD: return 'bg-blue-100 text-blue-600 border-blue-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 p-4 rounded-3xl custom-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">形体美容技术 · 数字化评估实训</h1>
            <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">Smart Aesthetic Diagnostic Lab</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setViewType(ViewType.FRONT)}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${viewType === ViewType.FRONT ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            正面（对称性与受力）
          </button>
          <button 
            onClick={() => setViewType(ViewType.SIDE)}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${viewType === ViewType.SIDE ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            侧面（生理曲度与姿态）
          </button>
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          上传素材
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept="image/*"
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Section: Upload & Preview */}
        <section className="bg-white rounded-[40px] p-8 aspect-square lg:aspect-auto lg:h-[700px] flex flex-col items-center justify-center relative border border-gray-100 custom-shadow overflow-hidden group">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center text-center cursor-pointer group-hover:scale-105 transition-transform duration-500"
            >
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <UploadIcon />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">待分析样本上传</h2>
              <p className="text-gray-400 max-w-sm text-sm leading-relaxed px-4">
                请上传学生的标准形体照片。系统将利用 AI 卷积神经网络进行全维度的形体扫描。
              </p>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={image} alt="Preview" className="max-w-full max-h-full object-contain rounded-2xl shadow-xl shadow-indigo-100" />
              {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-indigo-600 font-bold tracking-widest animate-pulse">正在利用AI进行数字化评估...</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Section: Results */}
        <section className="bg-white rounded-[40px] p-8 flex flex-col h-[700px] custom-shadow border border-gray-100">
          {!result && !loading && !error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-600 mb-2">评估结果待生成</h2>
              <p className="text-gray-400 text-sm max-w-xs">诊断报告将包含：严重问题预警、形态学定量描述及个性化处方建议。</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-red-500">
               <p className="font-medium">{error}</p>
               <button onClick={() => image && startAnalysis(image)} className="mt-4 text-indigo-600 underline text-sm">点击重试</button>
            </div>
          ) : result ? (
            <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">评估诊断报告</h2>
                  <p className="text-sm text-gray-400 font-medium">评估时间：{new Date().toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-4xl font-black text-indigo-600 leading-none">{result.overallScore}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Health Score</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="mb-8 p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"></path></svg>
                    专家综合评估
                  </h3>
                  <p className="text-sm text-indigo-800 leading-relaxed">{result.summary}</p>
                </div>

                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">检出形体问题 ({result.issues.length})</h3>
                
                <div className="space-y-4">
                  {result.issues.map((issue, idx) => (
                    <div key={idx} className="group p-5 bg-white border border-gray-100 rounded-3xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-gray-800 text-lg">{issue.issueName}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(issue.severity as Severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4 leading-relaxed">{issue.description}</p>
                      <div className="bg-gray-50/80 p-4 rounded-2xl">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">专业矫正建议</h4>
                        <p className="text-sm text-gray-700 leading-relaxed italic">“{issue.suggestion}”</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
               <div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          )}
        </section>
      </main>

      {/* Footer Info Cards */}
      <footer className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[32px] custom-shadow border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-800">医学影像算法</h4>
            <p className="text-xs text-gray-400">基于百万级形体数据库比对，提供符合行业标准的专业实训诊断。</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] custom-shadow border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-800">动态偏差捕捉</h4>
            <p className="text-xs text-gray-400">捕捉毫米级的姿态偏移，预防长期性骨骼变形风险。</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
