
import React, { useState, useEffect } from 'react';
import { DashboardData, ViewMode, Task, HistoryItem } from '../types';
import TaskTable from './TaskTable';
import MessengerKit from './MessengerKit';
import RiskHeatmap from './RiskHeatmap';
import MaturityDashboard from './MaturityDashboard';
import DailySyncView from './DailySyncView';
import { LayoutDashboard, FileOutput, FileSpreadsheet, BookmarkPlus, SendHorizontal, RefreshCw, BarChart3, Send } from 'lucide-react';

interface DashboardViewProps {
  data: DashboardData;
  rawInput: string;
  history: HistoryItem[];
  onSave: () => void;
  onRefine: (instruction: string) => void;
  onSync: (yesterday: string, today: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data, rawInput, history, onSave, onRefine, onSync }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.EXECUTIVE);
  const [syncTime, setSyncTime] = useState("");
  const [refineInput, setRefineInput] = useState("");

  useEffect(() => {
    setSyncTime(new Date().toLocaleTimeString('ko-KR'));
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      
      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100">
            <BookmarkPlus size={18} /> 설계 저장
          </button>
          <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
            최종 업데이트: {syncTime}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50">
             <FileOutput size={18} /> 복사
          </button>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-lg hover:bg-slate-800">
            <FileSpreadsheet size={18} className="text-emerald-400" /> Excel 내보내기
          </button>
        </div>
      </div>

      {/* Main Grid Views */}
      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="flex justify-center border-b border-slate-100 p-2">
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
             {[
               { mode: ViewMode.EXECUTIVE, icon: LayoutDashboard, label: 'MASTER' },
               { mode: ViewMode.DAILY_SYNC, icon: RefreshCw, label: 'DAILY SYNC' },
               { mode: ViewMode.MATURITY, icon: BarChart3, label: 'MATURITY' },
               { mode: ViewMode.MESSENGER, icon: Send, label: 'MESSENGER' }
             ].map(item => (
               <button 
                 key={item.mode} 
                 onClick={() => setViewMode(item.mode)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === item.mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <item.icon size={14} /> {item.label}
               </button>
             ))}
          </div>
        </div>

        {viewMode === ViewMode.MESSENGER ? (
          <MessengerKit briefings={data.messengerBriefings} />
        ) : viewMode === ViewMode.MATURITY ? (
          <MaturityDashboard currentData={data} history={history} />
        ) : viewMode === ViewMode.DAILY_SYNC ? (
          <DailySyncView onSync={onSync} />
        ) : (
          <TaskTable tasks={data.tasks} mode={viewMode} />
        )}
      </section>

      {/* Refine Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6">
        <form onSubmit={(e) => { e.preventDefault(); onRefine(refineInput); setRefineInput(""); }} className="bg-white/90 backdrop-blur-xl border-2 border-indigo-500/20 rounded-2xl shadow-2xl p-2 flex items-center gap-2">
          <input
            type="text"
            value={refineInput}
            onChange={(e) => setRefineInput(e.target.value)}
            placeholder="AI에게 아키텍처 수정 또는 필터링 요청..."
            className="flex-grow bg-transparent border-none outline-none py-3 px-4 text-sm font-medium"
          />
          <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all"><SendHorizontal size={18} /></button>
        </form>
      </div>
    </div>
  );
};

export default DashboardView;
