import { useState, useEffect } from 'react';

// ─── 상수 ─────────────────────────────────────────────────────────────────────
const STORAGE_TARGET = 'golden_goose_target';

export const GROUPS = ['연금형', '성장형', '방어형', '파킹형', '현금'];

/** 기본 목표 비중 (%) */
export const DEFAULT_TARGET = {
  연금형: 40,
  성장형: 20,
  방어형: 20,
  파킹형: 15,
  현금:    5,
};

/**
 * 신호등 판정
 * @param {string} group  자산군명
 * @param {number} currentPct  현재 비중 (%)
 * @param {number} targetPct   목표 비중 (%)
 * @returns {{ emoji: string, msg: string }}
 */
export function getSignal(group, currentPct, targetPct) {
  const diff = currentPct - targetPct;
  if (group === '현금') {
    if (diff < -5) return { emoji: '🔴', msg: '현금 부족 (확보 필요)' };
    if (diff >  5) return { emoji: '🟢', msg: '총알 장전 (투자처 탐색)' };
    return            { emoji: '🟡', msg: '유지 (완벽해요!)' };
  }
  if (diff < -5) return { emoji: '🟢', msg: '비중 확대 (매수)' };
  if (diff >  5) return { emoji: '🔴', msg: '비중 축소 (매도)' };
  return            { emoji: '🟡', msg: '유지 (완벽해요!)' };
}

/**
 * useTargetAllocation
 * 자산군별 목표 비중을 localStorage(golden_goose_target)에 저장/복원.
 */
export default function useTargetAllocation() {
  const [target, setTarget] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TARGET);
      return saved ? { ...DEFAULT_TARGET, ...JSON.parse(saved) } : DEFAULT_TARGET;
    } catch {
      return DEFAULT_TARGET;
    }
  });

  // target 변경 시 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_TARGET, JSON.stringify(target));
  }, [target]);

  /** 개별 그룹 목표 비중 업데이트 */
  const updateTarget = (groupOrAll, value) => {
    if (typeof groupOrAll === 'object') {
      // 전체 객체 일괄 업데이트 (슬라이더 저장 시)
      setTarget({ ...DEFAULT_TARGET, ...groupOrAll });
    } else {
      setTarget(prev => ({ ...prev, [groupOrAll]: value }));
    }
  };

  /** 기본값으로 초기화 */
  const resetTarget = () => setTarget(DEFAULT_TARGET);

  return { target, updateTarget, resetTarget };
}
