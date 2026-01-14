
import React from 'react';
import { Task, ViewMode } from '../types';
import { ShieldAlert, CornerDownRight, AlertCircle, CheckCircle2, Search, User, Calendar, Flag, Users, Copy, Activity, ArrowUpRight, AlertTriangle } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  mode: ViewMode;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, mode }) => {
  // 리스크 순 정렬 또는 이월 업무 우선 정렬
  const filteredTasks = mode === ViewMode.RISK 
    ? [...tasks].sort((a, b) => b.riskScore - a.riskScore) 
    : [...tasks].sort((a, b) => (b.isRolledOver ? 1 : 0) - (a.isRolledOver ? 1 : 0));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1300px]">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200">
            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">소속 팀 / 유형</th>
            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Action (실장 MASTER)</th>
            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">목적 / 리스크 포인트</th>
            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">점검기준 / 결과요약</th>
            {mode === ViewMode.LEADER && (
              <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">리더 하위 TO DO</th>
            )}
            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">진행/진척도</th>
            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">마감/주기</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {filteredTasks.map((task, idx) => (
            <tr key={idx} className={`group hover:bg-slate-50/50 transition-colors ${task.isRolledOver ? 'bg-red-50/30' : !task.isManageable ? 'bg-red-50/10' : ''}`}>
              <td className="px-6 py-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                    <Users size={12} />
                    {task.teamName}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <CategoryBadge category={task.category} />
                    {task.isRolledOver && (
                      <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md bg-red-600 text-white border border-red-700 shadow-sm animate-pulse">
                        <AlertTriangle size={10} />
                        지연/이월
                      </span>
                    )}
                    {task.isTemplateable && (
                      <span className="flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded-md bg-slate-800 text-white border border-slate-900">
                        <Copy size={8} />
                        템플릿
                      </span>
                    )}
                  </div>
                  <ManageabilityBadge isManageable={task.isManageable} />
                </div>
              </td>
              <td className="px-6 py-5 max-w-xs">
                <p className={`text-[15px] font-extrabold leading-tight group-hover:text-indigo-600 transition-colors ${task.isRolledOver ? 'text-red-700' : 'text-slate-900'}`}>
                    {task.taskName}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <PriorityDots priority={task.priority} />
                  {task.realName && <span className="text-[10px] text-slate-400 font-bold">[{task.realName}]</span>}
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="space-y-1.5">
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">🎯 {task.purpose}</p>
                  <p className="text-[10px] text-red-500 font-bold bg-red-50/50 px-2 py-1 rounded border border-red-100/50">⚠️ {task.missingRiskPoint}</p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                    <User size={12} />
                    <span>{task.assigneeLeader}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="space-y-3">
                  <div className={`flex items-start gap-2 p-3 rounded-xl border ${task.isRolledOver ? 'bg-red-50 border-red-200' : 'bg-indigo-50/40 border-indigo-100/50'}`}>
                    <Search size={14} className={task.isRolledOver ? 'text-red-400 mt-0.5 shrink-0' : 'text-indigo-400 mt-0.5 shrink-0'} />
                    <div>
                        <p className={`text-[10px] font-black uppercase mb-1 ${task.isRolledOver ? 'text-red-500' : 'text-indigo-400'}`}>
                            {task.isRolledOver ? '교정된 점검 기준 (Next Action)' : '실장 점검 기준'}
                        </p>
                        <p className={`text-xs font-bold leading-relaxed italic ${task.isRolledOver ? 'text-red-900' : 'text-indigo-900'}`}>
                            {task.executiveCheckCriteria}
                        </p>
                    </div>
                  </div>
                  {task.resultSummary && (
                    <div className="flex items-start gap-2 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/50">
                      <Activity size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase mb-1 text-[8px]">Previous Outcome (누적 결과)</p>
                        <p className="text-xs font-medium text-emerald-900 leading-relaxed">{task.resultSummary}</p>
                      </div>
                    </div>
                  )}
                </div>
              </td>
              {mode === ViewMode.LEADER && (
                <td className="px-6 py-5">
                  <div className="space-y-2">
                    {task.leaderSubTasks.map((st, si) => (
                      <div key={si} className="flex flex-col bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                          <CornerDownRight size={12} className="text-indigo-500" />
                          <span>{st.leaderAction}</span>
                          <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400 ml-auto">{st.assignee}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              )}
              <td className="px-6 py-5 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black border ${
                    task.progress === 100 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                    task.isRolledOver ? 'bg-red-600 text-white border-red-700' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {task.isRolledOver ? '지연/이월' : task.status}
                  </span>
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full transition-all duration-500 ${task.progress === 100 ? 'bg-emerald-500' : task.isRolledOver ? 'bg-red-500' : 'bg-indigo-500'}`} 
                      style={{ width: `${task.progress}%` }} 
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${task.isRolledOver ? 'text-red-600' : 'text-slate-400'}`}>{task.progress}%</span>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className={`flex items-center gap-2 text-[11px] font-black bg-white border px-3 py-1.5 rounded-xl shadow-sm ${task.isRolledOver ? 'border-red-400 text-red-600 ring-2 ring-red-500/10' : 'border-slate-200 text-slate-900'}`}>
                  <Calendar size={12} className={task.isRolledOver ? 'text-red-500' : 'text-slate-400'} />
                  {task.deadline}
                  {task.isRolledOver && <span className="text-[9px] bg-red-100 px-1 rounded ml-1">Overdue</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ManageabilityBadge: React.FC<{ isManageable: boolean }> = ({ isManageable }) => (
  <span className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md border ${isManageable ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-200'}`}>
    {isManageable ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
    {isManageable ? '관리가능' : '관리불가'}
  </span>
);

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const styles: Record<string, string> = {
    'Action': 'bg-amber-100 text-amber-700 border-amber-200',
    'Check': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Trigger': 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border text-center tracking-tighter ${styles[category] || 'bg-slate-100'}`}>
      {category}
    </span>
  );
};

const PriorityDots: React.FC<{ priority: string }> = ({ priority }) => {
  const styles: Record<string, string> = { 'High': 'bg-red-500', 'Medium': 'bg-orange-400', 'Low': 'bg-slate-300' };
  const count = priority === 'High' ? 3 : priority === 'Medium' ? 2 : 1;
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map(v => (
        <div key={v} className={`w-1.5 h-1.5 rounded-full ${v <= count ? styles[priority] : 'bg-slate-100'}`} />
      ))}
    </div>
  );
};

export default TaskTable;
