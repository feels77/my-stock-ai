import React, { useState } from 'react';
import { GROUPS, DEFAULT_TARGET, getSignal } from '../hooks/useTargetAllocation';

// ─── 자산군별 색상 팔레트 ──────────────────────────────────────────────────
const PALETTE = {
  연금형: { bg: 'bg-indigo-50',  text: 'text-indigo-700',  bar: '#6366f1' },
  성장형: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: '#10b981' },
  방어형: { bg: 'bg-amber-50',   text: 'text-amber-700',   bar: '#f59e0b' },
  파킹형: { bg: 'bg-blue-50',    text: 'text-blue-700',    bar: '#3b82f6' },
  현금:   { bg: 'bg-gray-50',    text: 'text-gray-600',    bar: '#94a3b8' },
};

const fmtNum = n => n?.toLocaleString('ko-KR') ?? '-';

/**
 * AllocationPanel — 내자산 탭 상단 자산배분 신호등 (Phase 2)
 *
 * Props
 *   groupSummary : [{ group, evalAmt, pct }]  — useAssets.getGroupSummary() 결과
 *   target       : { 연금형: 40, ... }          — 목표 비중 (%)
 *   onUpdateTarget : (newTargetObj) => void      — 목표 저장 콜백
 */
export default function AllocationPanel({ groupSummary, target, onUpdateTarget }) {
  const [showSettings, setShowSettings] = useState(false);
  const [pending, setPending]           = useState({ ...target });

  // 슬라이더 패널 열 때 현재 target으로 초기화
  const openSettings = () => {
    setPending({ ...target });
    setShowSettings(true);
  };

  const totalPending = GROUPS.reduce((s, g) => s + (pending[g] || 0), 0);
  const isValid      = totalPending === 100;

  const handleSave = () => {
    if (!isValid) {
      alert(`합계가 ${totalPending}%입니다. 정확히 100%가 되어야 저장됩니다.`);
      return;
    }
    onUpdateTarget(pending);
    setShowSettings(false);
  };

  const handleReset = () => setPending({ ...DEFAULT_TARGET });

  return (
    <div className="mb-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-bold text-gray-800">🟡 자산배분 신호등</p>
        <button
          onClick={showSettings ? () => setShowSettings(false) : openSettings}
          className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg"
        >
          {showSettings ? '✕ 닫기' : '⚙️ 목표 조정'}
        </button>
      </div>

      {/* ── 슬라이더 설정 패널 ──────────────────────────────────────────── */}
      {showSettings && (
        <div className="bg-white border border-indigo-100 rounded-2xl p-4 mb-3 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold text-indigo-700">목표 비중 설정</p>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
              isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
            }`}>
              합계 {totalPending}%{isValid ? ' ✓' : ' ← 100% 필요'}
            </span>
          </div>

          <div className="space-y-3">
            {GROUPS.map(g => {
              const c = PALETTE[g];
              return (
                <div key={g}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs font-semibold ${c.text}`}>{g}</span>
                    <span className={`text-xs font-black ${c.text}`}>{pending[g]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="100" step="1"
                    value={pending[g] || 0}
                    onChange={e => setPending(p => ({ ...p, [g]: Number(e.target.value) }))}
                    className="w-full h-2 rounded-full cursor-pointer"
                    style={{ accentColor: c.bar }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                isValid
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              💾 저장
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 text-xs text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
            >
              초기화
            </button>
          </div>
        </div>
      )}

      {/* ── 신호등 카드 리스트 ──────────────────────────────────────────── */}
      <div className="space-y-2">
        {GROUPS.map(g => {
          const summary   = groupSummary.find(s => s.group === g) || { pct: 0, evalAmt: 0 };
          const targetPct = target[g] || 0;
          const signal    = getSignal(g, summary.pct, targetPct);
          const c         = PALETTE[g];

          // 게이지: 현재비중 / max(현재, 목표) 로 상대적 표시
          const maxPct = Math.max(summary.pct, targetPct, 1);

          return (
            <div key={g} className={`${c.bg} rounded-xl px-3 py-2.5`}>
              {/* 상단: 신호등 + 이름 + 퍼센트 */}
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base flex-shrink-0">{signal.emoji}</span>
                  <span className={`text-xs font-bold flex-shrink-0 ${c.text}`}>{g}</span>
                  <span className="text-xs text-gray-400 truncate">{signal.msg}</span>
                </div>
                <div className="flex items-baseline gap-1 flex-shrink-0 ml-2">
                  <span className={`text-sm font-black ${c.text}`}>
                    {summary.pct.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-400">/ 목표 {targetPct}%</span>
                </div>
              </div>

              {/* 게이지 바 (이중: 현재 + 목표 마커) */}
              <div className="relative h-2 bg-white bg-opacity-70 rounded-full overflow-visible">
                {/* 현재 비중 바 */}
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((summary.pct / maxPct) * 100, 100)}%`,
                    backgroundColor: c.bar,
                    opacity: 0.8,
                  }}
                />
                {/* 목표 비중 마커 (세로 선) */}
                <div
                  className="absolute top-0 h-full w-0.5 rounded-full"
                  style={{
                    left: `${Math.min((targetPct / maxPct) * 100, 100)}%`,
                    backgroundColor: '#374151',
                    opacity: 0.4,
                  }}
                />
              </div>

              {/* 평가금액 */}
              <p className="text-xs text-gray-400 mt-1">
                ₩{fmtNum(Math.round(summary.evalAmt))}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
