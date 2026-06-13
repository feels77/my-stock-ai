import { readFileSync, writeFileSync } from 'fs';

const filePath = 'D:/5 AI/my stock ai/src/App.jsx';
let code = readFileSync(filePath, 'utf8');

// Old submitTrade — unique marker: the comment line + function signature
const OLD = `  // ─── 거래 제출 (유효성 검사 → buyAsset / sellAsset 호출) ───────
  const submitTrade = () => {
    const { date, type, assetId, quantity, price, memo } = tradeForm;
    if (!date || !assetId || !quantity || !price) {
      setTradeMsg('❗ 날짜, 종목, 수량, 단가를 입력해주세요.');
      return;
    }
    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    if (isNaN(qty) || isNaN(prc) || qty <= 0 || prc <= 0) {
      setTradeMsg('❗ 수량과 단가는 양수여야 합니다.');
      return;
    }

    if (type === '매수') {
      buyAsset(assetId, qty, prc, date, memo);
    } else {
      sellAsset(assetId, qty, prc, date, memo);
    }

    setTradeForm(prev => ({ ...prev, quantity: '', price: '', memo: '' }));
    setTradeMsg(\`✅ \${type} 거래가 등록됐습니다!\`);
    setTimeout(() => setTradeMsg(''), 3000);
  };`;

const NEW = `  // ─── 거래 제출 (유효성 검사 → buyAsset / sellAsset / addAssetAndBuy 호출) ──
  const submitTrade = () => {
    const {
      date, type, assetId, isNewAsset,
      newAssetName, newAssetGroup, newAssetTicker,
      account, quantity, price, memo,
    } = tradeForm;

    if (!date || !quantity || !price) {
      setTradeMsg('❗ 날짜, 수량, 단가를 입력해주세요.');
      return;
    }
    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    if (isNaN(qty) || isNaN(prc) || qty <= 0 || prc <= 0) {
      setTradeMsg('❗ 수량과 단가는 양수여야 합니다.');
      return;
    }

    if (isNewAsset) {
      // ── 신규 종목: 자산 자동 등록 + 매수 동시 처리
      if (!newAssetName.trim()) {
        setTradeMsg('❗ 신규 종목명을 입력해주세요.');
        return;
      }
      if (type !== '매수') {
        setTradeMsg('❗ 신규 종목은 매수만 가능합니다. (먼저 매수 후 매도)');
        return;
      }
      addAssetAndBuy(
        { group: newAssetGroup, account, name: newAssetName.trim(), ticker: newAssetTicker.trim() },
        qty, prc, date, memo, account
      );
      setTradeForm(prev => ({
        ...prev, quantity: '', price: '', memo: '',
        newAssetName: '', newAssetTicker: '',
      }));
      setTradeMsg(\`✅ [\${newAssetName.trim()}] 내자산 자동 등록 + 매수 완료!\`);
    } else {
      // ── 기존 자산: 기존 방식
      if (!assetId) {
        setTradeMsg('❗ 종목을 선택해주세요.');
        return;
      }
      if (type === '매수') {
        buyAsset(assetId, qty, prc, date, memo, account);
      } else {
        sellAsset(assetId, qty, prc, date, memo, account);
      }
      setTradeForm(prev => ({ ...prev, quantity: '', price: '', memo: '' }));
      setTradeMsg(\`✅ \${type} 거래가 등록됐습니다!\`);
    }

    setTimeout(() => setTradeMsg(''), 3500);
  };`;

// Normalize line endings for comparison
const normalizeLE = s => s.replace(/\r\n/g, '\n');

const codeNorm = normalizeLE(code);
const oldNorm  = normalizeLE(OLD);

if (!codeNorm.includes(oldNorm)) {
  console.error('❌ OLD pattern NOT FOUND in file');
  process.exit(1);
}

const updated = codeNorm.replace(oldNorm, normalizeLE(NEW));
// Write back with CRLF (Windows)
writeFileSync(filePath, updated.replace(/\n/g, '\r\n'), 'utf8');
console.log('✅ submitTrade replaced successfully');
