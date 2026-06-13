import React, { useState, useEffect } from 'react';

// ─── 그룹별 색상 ───────────────────────────────────────────────────────────────
const GROUP_COLORS = {
  '연금형': '#6366f1',
  '성장형': '#10b981',
  '방어형': '#f59e0b',
  '파킹형': '#3b82f6',
  '현금':   '#94a3b8',
};

const fmtNum = (n) => (typeof n === 'number' ? n.toLocaleString('ko-KR') : '-');
const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

/**
 * AssetDetailModal — 자산 상세 Bottom Sheet (Phase 1.5B)
 *
 * Props
 *   asset          : 선택된 자산 객체 (Asset 모델)
 *   transactions   : 전체 거래 배열 (내부에서 assetId로 필터)
 *   onClose        : () => void — 모달 닫기
 *   onDelete       : (id) => void — 자산 삭제
 *   onDeleteTrade  : (id) => void — 거래 단건 삭제
 *   onUpdate       : (id, changes) => void — 자산 수정 저장
 */
export default function AssetDetailModal({
  asset,
  transactions,
  onClose,
  onDelete,
  onDeleteTrade,
  onUpdate,
}) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [saveMsg, setSaveMsg]           = useState('');

  // ─── 수정 폼 상태 (제어 컴포넌트) ─────────────────────────────────────────
  const [editValues, setEditValues] = useState({
    quantity:     String(asset.quantity),
    avgPrice:     String(asset.avgPrice),
    currentPrice: String(asset.currentPrice),
  });

  // asset prop이 바뀔 때(저장 후 selectedAsset 갱신) 폼 초기화
  useEffect(() => {
    setEditValues({
      quantity:     String(asset.quantity),
      avgPrice:     String(asset.avgPrice),
      currentPrice: String(asset.currentPrice),
    });
  }, [asset.id, asset.quantity, asset.avgPrice, asset.currentPrice]);

  // ─── 거래이력 필터 (이 종목만, 최신순) ────────────────────────────────────
  const assetTxs = [...transactions]
    .filter(t => t.assetId === asset.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const buyTxs       = assetTxs.filter(t => t.type === '매수');
  const sellTxs      = assetTxs.filter(t => t.type === '매도');
  const totalBuyAmt  = buyTxs.reduce((s, t) => s + t.quantity * t.price, 0);
  const totalSellAmt = sellTxs.reduce((s, t) => s + t.quantity * t.price, 0);

  // ─── 요약 카드 표시값 (편집 중에는 실시간 미리보기) ───────────────────────
  const displayQty   = showEditForm ? (parseFloat(editValues.quantity)     || asset.quantity)     : asset.quantity;
  const displayAvg   = showEditForm ? (parseFloat(editValues.avgPrice)     || asset.avgPrice)     : asset.avgPrice;
  const displayPrice = showEditForm ? (parseFloat(editValues.currentPrice) || asset.currentPrice) : asset.currentPrice;

  const evalAmt = displayQty * displayPrice;
  const costAmt = displayQty * displayAvg;
  const pnl     = evalAmt - costAmt;
  const pnlPct  = costAmt > 0 ? (pnl / costAmt) * 100 : 0;

  // ─── 수정 저장 ────────────────────────────────────────────────────────────
  const handleSave = () => {
    const parsed = {
      quantity:     parseFloat(editValues.quantity),
      avgPrice:     parseFloat(editValues.avgPrice),
      currentPrice: parseFloat(editValues.currentPrice),
    };
    if (isNaN(parsed.quantity) || parsed.quantity < 0) {
      alert('수량을 올바르게 입력해주세요. (0 이상)');
      return;
    }
    if (isNaN(parsed.avgPrice) || parsed.avgPrice <= 0) {
      alert('평단가를 올바르게 입력해주세요. (0 초과)');
      return;
    }
    if (isNaN(parsed.currentPrice) || parsed.currentPrice <= 0) {
      alert('현재가를 올바르게 입력해주세요. (0 초과)');
      return;
    }
    onUpdate(asset.id, parsed);           // 저장 (거래이력 보존)
    setShowEditForm(false);               // 폼 닫기 (모달은 유지)
    setSaveMsg('✅ 자산 정보가 저장되었습니다.');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  // ─── 자산 삭제 ────────────────────────────────────────────────────────────
  const handleDeleteAsset = () => {
    if (window.confirm(`"${asset.name}"을(를) 삭제하시겠습니까?\n관련 거래이력은 유지됩니다.`)) {
      onDelete(asset.id);
    }
  };

  // ─── 거래 단건 삭제 ──────────────────────────────────────────────────────
  const handleDeleteTrade = (id) => {
    if (window.confirm('이 거래 내역을 삭제하시겠습니까?')) {
      onDeleteTrade(id);
    }
  };

  return (
    // 오버레이 — 외부 클릭 시 닫기
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      {/* Bottom Sheet */}
      <div
        className="w-full bg-white rounded-t-3xl overflow-y-auto"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* ── 헤더 ────────────────────────────────────────────────────────── */}
        <div className="flex justify-between items-start px-5 pt-3 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: GROUP_COLORS[asset.group] || '#94a3b8' }}
              />
              <span className="text-xs text-gray-500">{asset.group} · {asset.account}</span>
              {asset.ticker && (
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-mono font-semibold">
                  {asset.ticker}
                </span>
              )}
            </div>
            <p className="text-lg font-black text-gray-900">{asset.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none mt-1 ml-2 flex-shrink-0"
          >✕</button>
        </div>

        {/* ── 본문 ────────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 space-y-4">

          {/* 저장 확인 메시지 */}
          {saveMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl px-4 py-3 text-center animate-pulse">
              {saveMsg}
            </div>
          )}

          {/* 1. 자산 요약 카드 — 편집 중 실시간 미리보기 */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-4">
            {showEditForm && (
              <p className="text-indigo-300 text-xs mb-2 font-medium">👁 수정 중 실시간 미리보기</p>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <p className="text-indigo-200 text-xs mb-0.5">보유수량</p>
                <p className="font-bold">{fmtNum(displayQty)}주</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs mb-0.5">평균단가</p>
                <p className="font-bold">₩{fmtNum(displayAvg)}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs mb-0.5">현재가</p>
                <p className="font-bold">₩{fmtNum(displayPrice)}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs mb-0.5">평가금액</p>
                <p className="font-bold">₩{fmtNum(Math.round(evalAmt))}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-white border-opacity-20 flex justify-between items-center">
              <span className="text-indigo-200 text-xs">평가손익</span>
              <span className={`font-black text-base ${pnl >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {pnl >= 0 ? '+' : ''}₩{fmtNum(Math.round(pnl))} ({fmtPct(pnlPct)})
              </span>
            </div>
          </div>

          {/* 2. 자산 수정 버튼 + 폼 */}
          <div>
            <button
              onClick={() => setShowEditForm(v => !v)}
              className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border-2 transition ${
                showEditForm
                  ? 'border-gray-300 text-gray-500 bg-gray-50'
                  : 'border-indigo-300 text-indigo-600 bg-white'
              }`}
            >
              ✏️ {showEditForm ? '수정 취소' : '자산 수정'}
            </button>

            {showEditForm && (
              <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-indigo-700 mb-3">수정할 항목 입력 (입력 즉시 위 카드에 반영)</p>
                <div className="space-y-3">
                  {/* 수량 */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">수량 (주)</p>
                    <input
                      type="number"
                      value={editValues.quantity}
                      onChange={e => setEditValues(v => ({ ...v, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none bg-white"
                      placeholder="보유 수량"
                      min="0"
                    />
                  </div>
                  {/* 평단가 */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">평균단가 (원)</p>
                    <input
                      type="number"
                      value={editValues.avgPrice}
                      onChange={e => setEditValues(v => ({ ...v, avgPrice: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none bg-white"
                      placeholder="평균단가"
                      min="1"
                    />
                  </div>
                  {/* 현재가 */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">현재가 (원)</p>
                    <input
                      type="number"
                      value={editValues.currentPrice}
                      onChange={e => setEditValues(v => ({ ...v, currentPrice: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none bg-white"
                      placeholder="현재가"
                      min="1"
                    />
                  </div>
                </div>
                {/* 저장 버튼 */}
                <button
                  onClick={handleSave}
                  className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition"
                >
                  💾 수정 저장
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  ※ 거래이력은 수정되지 않으며 원본이 보존됩니다.
                </p>
              </div>
            )}
          </div>

          {/* 3. 거래 요약 */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-2">📊 거래 요약</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-500 mb-0.5">누적 매수횟수</p>
                <p className="text-2xl font-black text-blue-700">
                  {buyTxs.length}<span className="text-sm font-normal ml-0.5">회</span>
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-xs text-red-400 mb-0.5">누적 매도횟수</p>
                <p className="text-2xl font-black text-red-600">
                  {sellTxs.length}<span className="text-sm font-normal ml-0.5">회</span>
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-500 mb-0.5">총 매수금액</p>
                <p className="text-sm font-bold text-blue-700">₩{fmtNum(Math.round(totalBuyAmt))}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs text-red-400 mb-0.5">총 매도금액</p>
                <p className="text-sm font-bold text-red-600">₩{fmtNum(Math.round(totalSellAmt))}</p>
              </div>
            </div>
          </div>

          {/* 4. 거래이력 */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-2">
              📒 거래이력{' '}
              <span className="text-gray-400 font-normal">({assetTxs.length}건)</span>
            </p>
            {assetTxs.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400">
                <p className="text-3xl mb-1">📭</p>
                <p className="text-sm">거래 이력이 없습니다.</p>
                <p className="text-xs mt-1">매매기록 탭에서 거래를 입력해보세요.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {assetTxs.map(tx => (
                  <div
                    key={tx.id}
                    className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-2"
                  >
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold flex-shrink-0 ${
                      tx.type === '매수' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {tx.type}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{tx.date}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700">
                        {fmtNum(tx.quantity)}주 × ₩{fmtNum(tx.price)}
                      </p>
                      {tx.memo && (
                        <p className="text-xs text-gray-400 truncate">{tx.memo}</p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-800 flex-shrink-0">
                      ₩{fmtNum(Math.round(tx.quantity * tx.price))}
                    </span>
                    <button
                      onClick={() => handleDeleteTrade(tx.id)}
                      className="text-gray-300 hover:text-red-400 text-base flex-shrink-0 leading-none"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. 자산 삭제 버튼 */}
          <button
            onClick={handleDeleteAsset}
            className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-sm font-bold border border-red-200 hover:bg-red-100 transition"
          >
            🗑️ 이 자산 삭제
          </button>

          {/* 하단 여백 */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
