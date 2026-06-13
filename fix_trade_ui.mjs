import { readFileSync, writeFileSync } from 'fs';

const filePath = 'D:/5 AI/my stock ai/src/App.jsx';
let code = readFileSync(filePath, 'utf8');

const normalizeLE = s => s.replace(/\r\n/g, '\n');
let c = normalizeLE(code);

// ── 1. Replace asset selector section (L2673-2689 area) ──────────────────────
const OLD_ASSET_SEL = `                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">종목 선택</p>
                  <select value={tradeForm.assetId}
                    onChange={e => setTradeForm(f => ({...f, assetId: e.target.value}))}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none bg-white"
                  >
                    <option value="">종목을 선택하세요</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name}{a.ticker ? \` (\${a.ticker})\` : ''} — {a.account}
                      </option>
                    ))}
                  </select>
                  {assets.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">⚠️ 내자산 탭에서 먼저 자산을 추가해주세요.</p>
                  )}
                </div>`;

const NEW_ASSET_SEL = `                {/* ── 종목 선택 (기존 종목 / 신규 직접 입력) ── */}
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">종목 선택</p>
                  <select
                    value={tradeForm.isNewAsset ? '__NEW__' : tradeForm.assetId}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === '__NEW__') {
                        setTradeForm(f => ({ ...f, assetId: '', isNewAsset: true }));
                      } else {
                        const sel = assets.find(a => a.id === v);
                        setTradeForm(f => ({
                          ...f, assetId: v, isNewAsset: false,
                          account: sel?.account || f.account,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none bg-white"
                  >
                    <option value="">종목을 선택하세요</option>
                    <option value="__NEW__">✏️ 신규 종목 직접 입력</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name}{a.ticker ? \` (\${a.ticker})\` : ''} — {a.account}
                      </option>
                    ))}
                  </select>

                  {/* 신규 종목 입력 패널 */}
                  {tradeForm.isNewAsset && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-blue-700">📝 신규 종목 정보 입력</p>
                      <input
                        type="text"
                        value={tradeForm.newAssetName}
                        onChange={e => setTradeForm(f => ({ ...f, newAssetName: e.target.value }))}
                        placeholder="종목명 (예: TIGER 미국나스닥100)"
                        className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <select
                          value={tradeForm.newAssetGroup}
                          onChange={e => setTradeForm(f => ({ ...f, newAssetGroup: e.target.value }))}
                          className="flex-1 px-2 py-2 border-2 border-blue-200 rounded-lg text-xs bg-white focus:border-blue-400 focus:outline-none"
                        >
                          {['연금형','성장형','방어형','파킹형','현금'].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={tradeForm.newAssetTicker}
                          onChange={e => setTradeForm(f => ({ ...f, newAssetTicker: e.target.value }))}
                          placeholder="Ticker (선택)"
                          className="flex-1 px-2 py-2 border-2 border-blue-200 rounded-lg text-xs focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                      <p className="text-xs text-blue-600">💡 매수 완료 시 내자산 탭에 자동 등록됩니다</p>
                    </div>
                  )}

                  {assets.length === 0 && !tradeForm.isNewAsset && (
                    <p className="text-xs text-amber-500 mt-1">
                      ⚠️ 내자산 탭에서 자산을 추가하거나, "신규 종목 직접 입력"을 선택하세요.
                    </p>
                  )}
                </div>

                {/* ── 계좌 선택 ── */}
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">계좌</p>
                  <select
                    value={tradeForm.account}
                    onChange={e => setTradeForm(f => ({ ...f, account: e.target.value }))}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none bg-white"
                  >
                    {ACCOUNTS.map(ac => (
                      <option key={ac} value={ac}>{ac}</option>
                    ))}
                  </select>
                </div>`;

if (!c.includes(normalizeLE(OLD_ASSET_SEL))) {
  console.error('❌ OLD_ASSET_SEL pattern NOT FOUND');
  process.exit(1);
}
c = c.replace(normalizeLE(OLD_ASSET_SEL), normalizeLE(NEW_ASSET_SEL));
console.log('✅ Asset selector + account dropdown replaced');

// ── 2. Update transaction list item to show account ────────────────────────
const OLD_TX_ITEM = `                      <div key={tx.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-50">
                        <span className={\`px-1.5 py-0.5 rounded font-bold \${
                          tx.type === '매수' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'
                        }\`}>{tx.type}</span>
                        <span className="text-gray-400">{tx.date}</span>
                        <span className="flex-1 font-medium text-gray-700 truncate">{a2?.name ?? '-'}</span>
                        <span className="text-gray-600 font-bold">₩{fmtNum(Math.round(tx.quantity * tx.price))}</span>
                      </div>`;

const NEW_TX_ITEM = `                      <div key={tx.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-50">
                        <span className={\`px-1.5 py-0.5 rounded font-bold flex-shrink-0 \${
                          tx.type === '매수' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'
                        }\`}>{tx.type}</span>
                        <span className="text-gray-400 flex-shrink-0">{tx.date}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-700 truncate">{a2?.name ?? '-'}</p>
                          {(tx.account || a2?.account) && (
                            <p className="text-gray-400 truncate text-[10px]">{tx.account || a2?.account}</p>
                          )}
                        </div>
                        <span className="text-gray-600 font-bold flex-shrink-0">₩{fmtNum(Math.round(tx.quantity * tx.price))}</span>
                      </div>`;

if (!c.includes(normalizeLE(OLD_TX_ITEM))) {
  console.error('❌ OLD_TX_ITEM pattern NOT FOUND');
  process.exit(1);
}
c = c.replace(normalizeLE(OLD_TX_ITEM), normalizeLE(NEW_TX_ITEM));
console.log('✅ Transaction list item updated with account display');

// Write back with CRLF
writeFileSync(filePath, c.replace(/\n/g, '\r\n'), 'utf8');
console.log('✅ All changes written successfully');
