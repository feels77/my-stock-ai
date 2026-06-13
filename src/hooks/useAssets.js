import { useState, useEffect } from 'react';

// ─── 샘플 자산 데이터 (최초 실행 시 기본값) ───────────────────────────────
const SAMPLE_ASSETS = [
  { id: 'asset_1', group: '연금형', account: '연금저축', name: 'TIGER 미국S&P500',       ticker: '360750', quantity: 10, avgPrice: 10000,  currentPrice: 12000  },
  { id: 'asset_2', group: '성장형', account: 'ISA',      name: 'TIGER 미국나스닥100',     ticker: '133690', quantity: 5,  avgPrice: 20000,  currentPrice: 22500  },
  { id: 'asset_3', group: '방어형', account: 'IRP',      name: 'TIGER 미국배당다우존스', ticker: '458730', quantity: 20, avgPrice: 9500,   currentPrice: 9800   },
  { id: 'asset_4', group: '파킹형', account: 'CMA',      name: 'KODEX 단기채권',          ticker: '153130', quantity: 30, avgPrice: 103000, currentPrice: 103200 },
  { id: 'asset_5', group: '현금',   account: '일반계좌', name: '현금',                    ticker: '',       quantity: 1,  avgPrice: 500000, currentPrice: 500000 },
];

// ─── localStorage 키 ────────────────────────────────────────────────────────
const STORAGE_ASSETS = 'golden_goose_assets';
const STORAGE_LOGS   = 'golden_goose_logs';

/**
 * useAssets — 자산관리 커스텀 훅
 *
 * 분리된 기능
 *   - assets / transactions 상태
 *   - localStorage 저장 및 복원
 *   - 자산 추가(addAsset) / 삭제(removeAsset)
 *   - 매수(buyAsset) / 매도(sellAsset) 처리
 *   - 거래 삭제(removeTrade) / 전체 삭제(clearTransactions)
 *   - 현재가 업데이트 구조(updateAllPrices) — 향후 API 연결 예정
 *   - 포트폴리오 계산값(totalAssetValue, totalCost, totalPnL, totalPnLPct)
 *
 * App.jsx 사용 예시
 *   const { assets, transactions, addAsset, removeAsset, buyAsset, sellAsset } = useAssets();
 */
export function useAssets() {

  // ─── 자산 상태 (localStorage 복원) ────────────────────────────────────────
  const [assets, setAssets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ASSETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SAMPLE_ASSETS;
  });

  // ─── 거래 상태 (localStorage 복원) ────────────────────────────────────────
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // ─── 현재가 업데이트 상태 ─────────────────────────────────────────────────
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ─── localStorage 자동 저장 ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_ASSETS, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_LOGS, JSON.stringify(transactions));
  }, [transactions]);

  // ─── 포트폴리오 계산값 ────────────────────────────────────────────────────
  const totalAssetValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
  const totalCost       = assets.reduce((sum, a) => sum + a.quantity * a.avgPrice, 0);
  const totalPnL        = totalAssetValue - totalCost;
  const totalPnLPct     = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  // ─── 자산 추가 ────────────────────────────────────────────────────────────
  // assetData: { group, account, name, ticker, quantity, avgPrice, currentPrice }
  // quantity / avgPrice / currentPrice 는 string 또는 number 모두 허용
  const addAsset = (assetData) => {
    const newAsset = {
      id: `asset_${Date.now()}`,
      group:        assetData.group,
      account:      assetData.account,
      name:         assetData.name,
      ticker:       assetData.ticker ?? '',
      quantity:     parseFloat(assetData.quantity),
      avgPrice:     parseFloat(assetData.avgPrice),
      currentPrice: parseFloat(assetData.currentPrice),
    };
    setAssets(prev => [...prev, newAsset]);
  };

  // ─── 자산 삭제 ────────────────────────────────────────────────────────────
  // confirm 다이얼로그는 호출부(App.jsx)에서 처리
  const removeAsset = (id) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  // ─── 자산 수정 (Phase 1.5B) ────────────────────────────────────
  // changes: { quantity?, avgPrice?, currentPrice? } — 변경할 필드만 전달
  // • 거래이력(transactions)은 수정하지 않음 — 원본 보존
  // • localStorage는 기존 useEffect에 의해 자동 저장
  const updateAsset = (id, changes) => {
    setAssets(prev => prev.map(a => {
      if (a.id !== id) return a;
      return {
        ...a,
        quantity:     changes.quantity     !== undefined ? parseFloat(changes.quantity)     : a.quantity,
        avgPrice:     changes.avgPrice     !== undefined ? parseFloat(changes.avgPrice)     : a.avgPrice,
        currentPrice: changes.currentPrice !== undefined ? parseFloat(changes.currentPrice) : a.currentPrice,
      };
    }));
  };

  // ─── 매수 처리 ────────────────────────────────────────────────────────────
  // qty, price: 이미 parseFloat된 숫자
  const buyAsset = (assetId, qty, price, date, memo = '') => {
    const newTx = {
      id: `tx_${Date.now()}`,
      date,
      type: '매수',
      assetId,
      quantity: qty,
      price,
      memo,
    };
    setTransactions(prev => [newTx, ...prev]);
    setAssets(prev => prev.map(a => {
      if (a.id !== assetId) return a;
      const totalQty = a.quantity + qty;
      const newAvg   = ((a.quantity * a.avgPrice) + (qty * price)) / totalQty;
      return { ...a, quantity: totalQty, avgPrice: Math.round(newAvg) };
    }));
  };

  // ─── 매도 처리 ────────────────────────────────────────────────────────────
  const sellAsset = (assetId, qty, price, date, memo = '') => {
    const newTx = {
      id: `tx_${Date.now()}`,
      date,
      type: '매도',
      assetId,
      quantity: qty,
      price,
      memo,
    };
    setTransactions(prev => [newTx, ...prev]);
    setAssets(prev => prev.map(a => {
      if (a.id !== assetId) return a;
      return { ...a, quantity: Math.max(0, a.quantity - qty) };
    }));
  };

  // ─── 거래 단건 삭제 ───────────────────────────────────────────────────────
  // confirm 다이얼로그는 호출부(App.jsx)에서 처리
  const removeTrade = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // ─── 전체 거래 삭제 ───────────────────────────────────────────────────────
  const clearTransactions = () => setTransactions([]);

  // ─── 현재가 자동 업데이트 구조 ───────────────────────────────────────────
  // 향후 Yahoo Finance / 한국투자증권 API / 네이버금융 연결 예정
  const updatePrice = async (asset) => {
    // TODO: 실제 API 연결 시 아래 주석 해제 후 구현
    // if (asset.ticker) {
    //   const res = await fetch(`/api/price?ticker=${asset.ticker}`);
    //   const data = await res.json();
    //   return data.currentPrice;
    // }
    // 현재는 ±2% 범위 Mock 변동으로 구조 검증
    const fluctuation = 1 + (Math.random() * 0.04 - 0.02);
    return Math.round(asset.currentPrice * fluctuation);
  };

  const updateAllPrices = async () => {
    setIsUpdatingPrices(true);
    try {
      const updated = await Promise.all(
        assets.map(async (a) => {
          const newPrice = await updatePrice(a);
          return { ...a, currentPrice: newPrice };
        })
      );
      setAssets(updated);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('가격 업데이트 오류:', e);
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  // ─── 공개 인터페이스 ──────────────────────────────────────────────────────
  return {
    // 상태
    assets,
    transactions,
    // 자산 CRUD
    addAsset,
    removeAsset,
    updateAsset,
    buyAsset,
    sellAsset,
    // 거래 관리
    removeTrade,
    clearTransactions,
    // 현재가 업데이트
    updateAllPrices,
    isUpdatingPrices,
    lastUpdated,
    // 포트폴리오 계산값
    totalAssetValue,
    totalCost,
    totalPnL,
    totalPnLPct,
  };
}
