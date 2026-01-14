
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, DashboardData, HistoryItem } from './types';
import { transformNotesToTaskSystem, refineTaskSystem, syncDailyTasks } from './services/geminiService';
import InputForm from './components/InputForm';
import DashboardView from './components/DashboardView';
import HistoryLibrary from './components/HistoryLibrary';
import { ShieldCheck, Loader2, AlertCircle, Bookmark, Clock, Key, Settings, Layers } from 'lucide-react';

const STORAGE_KEY = 'risk_zero_history_v2';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    rawInput: '',
    rawImages: [],
    processedData: null,
    history: [],
    isLoading: false,
    error: null,
  });

  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasKey(true);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(prev => ({ ...prev, history: JSON.parse(saved) }));
      } catch (e) { console.error(e); }
    }
  }, []);

  const saveToHistory = useCallback((data: DashboardData, input: string) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      rawInput: input,
      data: data
    };
    setState(prev => {
      const updatedHistory = [newItem, ...prev.history].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return { ...prev, history: updatedHistory };
    });
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setState(prev => {
      const updatedHistory = prev.history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return { ...prev, history: updatedHistory };
    });
  }, []);

  const loadHistoryItem = useCallback((item: HistoryItem) => {
    setState(prev => ({ ...prev, processedData: item.data, rawInput: item.rawInput, error: null }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleProcessInput = useCallback(async (input: string, images: { data: string; mimeType: string }[]) => {
    if (!input.trim() && images.length === 0) return;
    setState(prev => ({ ...prev, isLoading: true, error: null, rawInput: input, rawImages: images }));
    try {
      const nowString = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      const data = await transformNotesToTaskSystem(input, nowString, images);
      setState(prev => ({ ...prev, processedData: data, isLoading: false }));
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasKey(false);
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  }, []);

  const handleRefineData = useCallback(async (instruction: string) => {
    if (!state.processedData) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const updatedData = await refineTaskSystem(state.processedData, instruction);
      setState(prev => ({ ...prev, processedData: updatedData, isLoading: false }));
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasKey(false);
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  }, [state.processedData]);

  const handleDailySync = useCallback(async (yesterday: string, today: string) => {
    if (!state.processedData) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const syncedData = await syncDailyTasks(state.processedData, yesterday, today);
      setState(prev => ({ ...prev, processedData: syncedData, isLoading: false }));
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasKey(false);
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  }, [state.processedData]);

  const handleReset = () => setState(prev => ({ ...prev, processedData: null, error: null }));

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-8">
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
            <Key size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Gemini API 키 활성화 필요</h1>
          <button onClick={handleOpenKeySelector} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl">API 키 선택하기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><ShieldCheck size={24} /></div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-slate-900">Risk-Zero Architect</h1>
            <p className="text-xs text-slate-500">지능형 업무 설계 시스템</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-mono text-xs border border-slate-200">
            <Clock size={14} className="text-indigo-500" />
            <span>{currentTime.toLocaleTimeString('ko-KR')}</span>
          </div>
          <button onClick={handleOpenKeySelector} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
        {!state.processedData && !state.isLoading && !state.error && (
          <div className="max-w-4xl mx-auto py-6 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black text-slate-900">현장의 파편을<br/>정교한 시스템으로.</h2>
              <p className="text-slate-500 font-medium text-lg">메모, 메신저 대화, 이미지 기록을 통해 실장님만의 관리 아키텍처를 구축합니다.</p>
            </div>
            <InputForm onSubmit={handleProcessInput} />
            {state.history.length > 0 && (
              <div className="pt-8 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-6 text-slate-800">
                  <Bookmark size={20} className="text-indigo-600" />
                  <h3 className="text-lg font-bold">아키텍처 라이브러리</h3>
                </div>
                <HistoryLibrary history={state.history} onLoad={loadHistoryItem} onDelete={deleteHistoryItem} />
              </div>
            )}
          </div>
        )}

        {state.isLoading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <Loader2 size={64} className="text-indigo-600 animate-spin" />
            <h3 className="text-lg font-bold text-slate-900">지능형 아키텍처 연산 중...</h3>
          </div>
        )}

        {state.error && (
          <div className="max-w-2xl mx-auto py-12 text-center bg-red-50 rounded-3xl p-10 space-y-6 border border-red-100">
            <AlertCircle size={48} className="text-red-500 mx-auto" />
            <p className="text-red-700 font-bold">{state.error}</p>
            <button onClick={() => handleReset()} className="bg-red-600 text-white px-8 py-3 rounded-xl font-black">새로 시작</button>
          </div>
        )}

        {state.processedData && !state.isLoading && (
          <DashboardView 
            data={state.processedData} 
            rawInput={state.rawInput}
            history={state.history}
            onSave={() => saveToHistory(state.processedData!, state.rawInput)}
            onRefine={handleRefineData}
            onSync={handleDailySync}
          />
        )}
      </main>
    </div>
  );
};

export default App;
