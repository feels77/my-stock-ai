import React, { useState, useRef, useEffect } from 'react';
import { useAssets } from './hooks/useAssets';
import AssetDetailModal from './components/AssetDetailModal';

// 종목 데이터
const KOREA_STOCKS = ['삼성전자', 'SK하이닉스', 'NAVER', '카카오', 'LG에너지솔루션', '현대차', '셀트리온', '삼성SDI', '기아', 'POSCO홀딩스'];
const US_STOCKS = ['Apple', 'Microsoft', 'NVIDIA', 'Tesla', 'Google', 'Amazon', 'Meta', 'Netflix', 'AMD', 'Intel'];
const ETF_LIST = [
  { name: 'SPY', desc: 'S&P500 추종 (미국 대표)', country: '🇺🇸', region: '미국' },
  { name: 'QQQ', desc: '나스닥100 (기술주 중심)', country: '🇺🇸', region: '미국' },
  { name: 'VOO', desc: 'S&P500 (뱅가드, 저비용)', country: '🇺🇸', region: '미국' },
  { name: 'VTI', desc: '미국 전체시장 3,500종목', country: '🇺🇸', region: '미국' },
  { name: 'SCHD', desc: '배당성장 (10년 연속 배당)', country: '🇺🇸', region: '미국' },
  { name: 'JEPI', desc: '월배당 커버드콜 (7-10%)', country: '🇺🇸', region: '미국' },
  { name: 'VWO', desc: '신흥국 전체', country: '🇺🇸', region: '글로벌' },
  { name: 'VEA', desc: '선진국 (미국 제외)', country: '🇺🇸', region: '글로벌' },
  { name: 'KODEX 200', desc: 'KOSPI200 추종', country: '🇰🇷', region: '한국' },
  { name: 'KODEX 코스닥150', desc: '코스닥 대표 150종목', country: '🇰🇷', region: '한국' },
  { name: 'TIGER 미국S&P500', desc: 'S&P500 원화투자', country: '🇰🇷', region: '미국' },
  { name: 'TIGER 미국나스닥100', desc: '나스닥100 원화투자', country: '🇰🇷', region: '미국' },
  { name: 'TIGER 미국배당다우존스', desc: 'SCHD 한국판 월배당', country: '🇰🇷', region: '미국' },
  { name: 'KODEX 미국배당프리미엄액티브', desc: 'JEPI 한국판 월배당', country: '🇰🇷', region: '미국' },
  { name: 'ARIRANG 고배당주', desc: '국내 고배당 우량주', country: '🇰🇷', region: '한국' },
];

const SECTORS = [
  { id: 'ai', name: 'AI', full: 'AI 인공지능', keywords: 'AI, 머신러닝, LLM, GPU' },
  { id: 'semiconductor', name: '반도체', full: '반도체', keywords: 'HBM, 메모리, 파운드리' },
  { id: 'battery', name: '2차전지', full: '2차전지', keywords: '전기차 배터리, ESS' },
  { id: 'bio', name: '바이오', full: '바이오/제약', keywords: '신약, CDMO, 임상' },
  { id: 'platform', name: 'IT플랫폼', full: 'IT 플랫폼', keywords: '포털, 커머스, 핀테크' },
  { id: 'defense', name: '방산', full: '방산', keywords: 'K-방산, 수출' },
  { id: 'energy', name: '에너지', full: '에너지', keywords: '수소, 원자력, 신재생' },
  { id: 'finance', name: '금융', full: '금융', keywords: '은행, 증권, 보험' },
  { id: 'consumer', name: '소비재', full: '소비재', keywords: '화장품, 식품, 유통' },
  { id: 'auto', name: '자동차', full: '자동차', keywords: '전기차, 자율주행' },
  { id: 'shipbuilding', name: '조선/해운', full: '조선/해운', keywords: 'LNG선, 컨테이너선, 해운' },
  { id: 'entertainment', name: '엔터/게임', full: '엔터테인먼트/게임', keywords: 'K-POP, 드라마, 게임' },
  { id: 'robot', name: '로봇', full: '로봇/자동화', keywords: '산업용로봇, 휴머노이드' },
  { id: 'travel', name: '항공/여행', full: '항공/여행', keywords: '항공사, 여행사, 면세점' },
  { id: 'construction', name: '건설', full: '건설/인프라', keywords: '아파트, SOC, 플랜트' },
  { id: 'telecom', name: '통신', full: '통신', keywords: '5G, 인터넷, 배당' }
];

// 용어 사전 데이터 (대폭 확장 + 상세 설명)
const TERMS = {
  basic: [
    { term: 'PER', full: '주가수익비율 (Price Earning Ratio)', 
      desc: '주가를 주당순이익(EPS)으로 나눈 값입니다.',
      detail: '예: 주가 50,000원, EPS 5,000원이면 PER = 10배\n\n📌 해석법:\n• 10배 이하: 저평가 가능성 (싸게 살 기회)\n• 10~20배: 적정 수준\n• 20배 이상: 고평가 (성장 기대 반영)\n\n⚠️ 주의: 업종마다 기준이 다릅니다!\n• 은행: 5~8배가 정상\n• IT/바이오: 30배 이상도 흔함',
      example: '삼성전자 PER 12배 vs 네이버 PER 25배\n→ 네이버가 비싸 보이지만, IT는 원래 PER이 높음' },
    { term: 'PBR', full: '주가순자산비율 (Price Book Ratio)', 
      desc: '주가를 주당순자산(BPS)으로 나눈 값입니다.',
      detail: '회사를 청산할 때 받을 수 있는 돈 대비 현재 주가를 비교합니다.\n\n📌 해석법:\n• 1 미만: 청산가치보다 주가가 낮음 (매우 저평가)\n• 1~2: 적정 수준\n• 3 이상: 브랜드/기술력 프리미엄\n\n💡 활용: 가치투자자들이 PBR 1 미만 종목을 "안전마진이 있다"고 봅니다.',
      example: '현대차 PBR 0.5배\n→ 회사 자산이 10조인데 시총은 5조\n→ 회사를 사서 청산해도 2배 이익 (이론상)' },
    { term: 'ROE', full: '자기자본이익률 (Return On Equity)', 
      desc: '내 돈(자본)으로 얼마나 벌었는지 보여주는 수익성 지표입니다.',
      detail: '계산: 순이익 ÷ 자기자본 × 100\n\n📌 해석법:\n• 10% 미만: 부진\n• 10~15%: 양호\n• 15% 이상: 우수 (워런 버핏 기준)\n• 20% 이상: 매우 우수\n\n💡 워런 버핏: "ROE 15% 이상을 꾸준히 유지하는 기업에 투자하라"\n\n⚠️ 주의: 부채를 늘려도 ROE가 올라갈 수 있어서, 부채비율과 함께 봐야 합니다.',
      example: '삼성전자 ROE 8% vs 애플 ROE 150%\n→ 애플이 훨씬 효율적으로 돈을 벌고 있음' },
    { term: 'EPS', full: '주당순이익 (Earnings Per Share)', 
      desc: '주식 1주당 회사가 벌어들인 순이익입니다.',
      detail: '계산: 순이익 ÷ 발행주식수\n\n📌 해석법:\n• EPS가 매년 증가 → 성장하는 기업\n• EPS가 급락 → 실적 악화 신호\n\n💡 활용:\n• PER 계산의 기본 (주가 ÷ EPS = PER)\n• 배당 여력 판단 (EPS의 일부가 배당)',
      example: '삼성전자 EPS 6,000원, 주가 72,000원\n→ PER = 72,000 ÷ 6,000 = 12배' },
    { term: '시가총액', full: 'Market Capitalization', 
      desc: '회사의 총 가치를 나타내는 지표입니다.',
      detail: '계산: 주가 × 발행주식수\n\n📌 규모 분류 (한국):\n• 대형주: 10조 이상 (삼성, SK하이닉스)\n• 중형주: 1~10조 (한화에어로, 두산에너빌리티)\n• 소형주: 1조 미만\n\n📌 규모 분류 (미국):\n• 메가캡: $2000억 이상 (애플, MS)\n• 라지캡: $100억~$2000억\n• 미드캡: $20억~$100억\n• 스몰캡: $3억~$20억',
      example: '삼성전자 시총 400조원\n= 한국 GDP의 약 20%\n= 코스피 전체의 약 20%' },
    { term: '배당수익률', full: 'Dividend Yield', 
      desc: '주가 대비 1년간 받는 배당금의 비율입니다.',
      detail: '계산: 주당배당금 ÷ 주가 × 100\n\n📌 해석법:\n• 1~2%: 낮음 (성장주에 흔함)\n• 3~5%: 적정 (배당주 기준)\n• 5% 이상: 고배당 (지속가능성 확인 필요)\n\n⚠️ 주의: 배당수익률이 너무 높으면?\n→ 주가가 급락해서 높아진 경우 많음 (배당컷 위험)',
      example: 'SK텔레콤 배당수익률 6%\n→ 1억 투자 시 연 600만원 배당\n→ 은행 이자(3%)의 2배!' },
    { term: '거래량', full: 'Trading Volume', 
      desc: '하루 동안 거래된 주식의 수량입니다.',
      detail: '📌 해석법:\n• 거래량 급증 + 주가 상승 → 강한 매수세 (긍정적)\n• 거래량 급증 + 주가 하락 → 대량 매도 (부정적)\n• 거래량 감소 + 횡보 → 관심 감소, 돌파 대기\n\n💡 "거래량은 주가에 선행한다"\n→ 거래량이 먼저 늘고, 주가가 따라 움직이는 경우 많음',
      example: '평소 10만주 거래 → 오늘 100만주\n→ 무슨 일이 있는지 확인 필요!' },
    { term: '52주 신고가/신저가', full: '52-Week High/Low', 
      desc: '최근 1년간 가장 높았던/낮았던 주가입니다.',
      detail: '📌 활용법:\n• 신고가 돌파: 강한 상승 신호, 추가 상승 기대\n• 신저가 갱신: 약세 지속, 반등 타이밍 탐색\n\n💡 투자 격언:\n"신고가에서 사라" (추세 추종)\n"신저가에서 사라" (역발상 투자)\n→ 자신의 투자 스타일에 맞게 선택',
      example: '삼성전자 52주 최고 88,000원, 최저 59,000원\n현재가 72,000원 → 중간 정도 위치' },
  ],
  financial: [
    { term: '부채비율', full: 'Debt to Equity Ratio', 
      desc: '자기자본 대비 빚이 얼마나 있는지 보여주는 안정성 지표입니다.',
      detail: '계산: 총부채 ÷ 자기자본 × 100\n\n📌 해석법:\n• 50% 이하: 매우 안전\n• 100% 이하: 양호 (일반적 기준)\n• 200% 이상: 위험 (금융업 제외)\n\n💡 업종별 기준:\n• 제조업: 100% 이하 권장\n• 금융업: 1000% 이상도 정상 (예금이 부채)\n• 유틸리티: 200%까지 허용',
      example: '현대차 부채비율 180%\n→ 자본 10조, 부채 18조\n→ 제조업치고 높은 편 (설비투자 때문)' },
    { term: '유동비율', full: 'Current Ratio', 
      desc: '1년 내 갚아야 할 빚을 갚을 능력이 있는지 보여줍니다.',
      detail: '계산: 유동자산 ÷ 유동부채 × 100\n\n📌 해석법:\n• 100% 미만: 위험! 단기 부채 상환 어려움\n• 100~150%: 주의 필요\n• 150~200%: 양호\n• 200% 이상: 매우 안전\n\n💡 유동자산: 1년 내 현금화 가능 (현금, 재고, 매출채권)\n💡 유동부채: 1년 내 갚아야 할 돈',
      example: '유동비율 80%인 회사\n→ 1년 내 갚을 돈 100억, 가진 돈 80억\n→ 20억이 부족! 부도 위험' },
    { term: '영업이익률', full: 'Operating Profit Margin', 
      desc: '매출에서 영업이익이 차지하는 비율로, 본업의 수익성을 보여줍니다.',
      detail: '계산: 영업이익 ÷ 매출 × 100\n\n📌 해석법:\n• 5% 미만: 낮음 (박리다매형)\n• 5~10%: 보통\n• 10~20%: 우수\n• 20% 이상: 탁월 (독점적 지위)\n\n💡 업종별 특성:\n• 유통/항공: 2~5% (박리다매)\n• 제조업: 8~15%\n• IT/제약: 20~40% (고부가가치)',
      example: '네이버 영업이익률 15% vs 이마트 3%\n→ 네이버가 훨씬 남는 장사\n→ 하지만 이마트는 유통업 특성상 낮은 게 정상' },
    { term: 'CAGR', full: '연평균성장률 (Compound Annual Growth Rate)', 
      desc: '여러 해에 걸친 성장률을 연간 복리로 환산한 값입니다.',
      detail: '📌 해석법:\n• 10% 미만: 저성장 (성숙기업)\n• 10~20%: 양호한 성장\n• 20~30%: 고성장\n• 30% 이상: 초고성장 (지속가능성 확인)\n\n💡 복리의 마법:\nCAGR 15%로 5년 성장 시\n100 → 201 (약 2배)\n\nCAGR 25%로 5년 성장 시\n100 → 305 (약 3배)',
      example: '삼성전자 매출 CAGR (5년): 8%\n애플 매출 CAGR (5년): 12%\n엔비디아 매출 CAGR (5년): 45%' },
    { term: 'FCF', full: '잉여현금흐름 (Free Cash Flow)', 
      desc: '영업으로 번 돈에서 투자비용을 뺀, 진짜 남는 현금입니다.',
      detail: '계산: 영업현금흐름 - 자본적지출(CAPEX)\n\n📌 해석법:\n• FCF 양수: 건전한 기업 (배당/자사주 여력)\n• FCF 음수: 투자기 기업 (성장을 위해 돈 쓰는 중)\n\n💡 중요한 이유:\n• 회계상 이익 ≠ 실제 현금\n• FCF가 진짜 주주에게 돌아올 수 있는 돈\n• 워런 버핏: "FCF가 진정한 기업가치"',
      example: '테슬라: 순이익 100억, FCF 50억\n→ 공장 건설에 50억 투자 중\n→ 실제 남는 돈은 50억뿐' },
    { term: '이자보상배율', full: 'Interest Coverage Ratio', 
      desc: '영업이익으로 이자비용을 몇 번 갚을 수 있는지 보여줍니다.',
      detail: '계산: 영업이익 ÷ 이자비용\n\n📌 해석법:\n• 1 미만: 위험! 영업이익으로 이자도 못 갚음\n• 1~3: 주의 필요\n• 3~5: 양호\n• 5 이상: 안전\n\n⚠️ 금리 상승기에 중요:\n이자보상배율 낮은 기업 → 금리 오르면 위험',
      example: '영업이익 100억, 이자비용 50억\n→ 이자보상배율 = 2배\n→ 이자 갚고 50억만 남음 (주의 필요)' },
    { term: 'ROA', full: '총자산이익률 (Return On Assets)', 
      desc: '회사의 모든 자산을 얼마나 효율적으로 활용했는지 보여줍니다.',
      detail: '계산: 순이익 ÷ 총자산 × 100\n\n📌 해석법:\n• 5% 미만: 자산 활용 비효율\n• 5~10%: 양호\n• 10% 이상: 우수\n\n💡 ROE vs ROA:\n• ROE: 내 돈 대비 수익 (주주 관점)\n• ROA: 전체 자산 대비 수익 (경영 관점)\n• ROE > ROA 격차가 크면 → 레버리지 사용 중',
      example: '은행 ROA 0.5~1%\n→ 은행은 자산(예금)이 커서 ROA가 낮음\n→ 은행은 ROE로 비교해야 함' },
    { term: '매출채권회전율', full: 'Accounts Receivable Turnover', 
      desc: '외상매출금을 얼마나 빨리 현금으로 회수하는지 보여줍니다.',
      detail: '계산: 매출 ÷ 평균 매출채권\n\n📌 해석법:\n• 회전율 높음 → 현금 회수 빠름 (좋음)\n• 회전율 낮음 → 외상이 오래 쌓임 (위험)\n\n💡 회전일수로 환산:\n365 ÷ 회전율 = 평균 회수 기간\n• 30일 이하: 우수\n• 60일 이하: 양호\n• 90일 이상: 주의',
      example: '회전율 12 → 365÷12 = 약 30일\n→ 물건 팔고 30일 만에 현금 회수' },
    { term: '듀퐁 분석', full: 'DuPont Analysis', 
      desc: 'ROE(수익성)가 높은 이유를 세 가지로 쪼개서 진짜 잘 버는 건지 확인하는 분석법입니다.',
      detail: '📌 핵심 질문 3가지:\nROE = 순이익률 × 자산회전율 × 레버리지\n\n• 순이익률: 물건을 비싸게 잘 파는가? (마진)\n• 자산회전율: 자산을 쉴 틈 없이 효율적으로 굴리는가?\n• 레버리지: 빚을 얼마나 썼는가?\n\n💡 왜 중요한가?\n같은 ROE 20%라도 속을 보면 다릅니다:\n\n✅ A회사 ROE 20% (건전한 ROE):\n→ 마진 20% × 회전 1.0 × 레버리지 1.0\n→ 진짜 잘 버는 거!\n\n⚠️ B회사 ROE 20% (위험한 ROE):\n→ 마진 5% × 회전 0.8 × 레버리지 5.0\n→ 빚으로 쌓아올린 모래성!\n→ 금리 오르면 무너질 수 있음',
      example: '삼성전자 듀퐁 분해:\n순이익률 12%, 자산회전율 0.6, 레버리지 1.3\n→ 높은 마진으로 ROE를 만듦 (건전!)' },
    { term: 'SWOT 분석', full: '강점/약점/기회/위협 분석', 
      desc: '기업을 강점, 약점, 기회, 위협 4가지로 나눠서 투자 판단하는 방법입니다.',
      detail: '📌 4가지 요소 (외우기 쉬움!):\n• S (Strength) 강점: 이 회사가 잘하는 것\n• W (Weakness) 약점: 이 회사의 부족한 점\n• O (Opportunity) 기회: 외부에서 오는 호재\n• T (Threat) 위협: 외부에서 오는 악재\n\n💡 투자 판단법:\n✅ 강점 + 기회가 크면 → 매수 고려\n⚠️ 약점 + 위협이 심하면 → 매도 고려\n\n📌 질문 예시:\n• 강점: 경쟁사보다 뭐가 나은가?\n• 약점: 어디가 불안한가?\n• 기회: 시장 환경이 유리한가?\n• 위협: 어떤 위험이 있는가?',
      example: '엔비디아 SWOT:\nS 강점: AI칩 시장 점유율 80%\nW 약점: 게임 매출 의존\nO 기회: AI 수요 폭발\nT 위협: AMD, 인텔 추격\n→ S+O가 압도적 → 매수 관점' },
  ],
  valuation: [
    { term: 'DCF', full: '현금흐름할인법 (Discounted Cash Flow)', 
      desc: '미래에 벌 돈을 오늘 가치로 환산해서 기업의 진짜 가치를 계산하는 방법입니다.',
      detail: '📌 핵심 개념 (이것만 기억!):\n"오늘의 100만원 > 1년 후 100만원"\n\n왜? 오늘 100만원을 은행에 넣으면\n1년 후 105만원이 되니까요. (이자 5%)\n\n그래서 1년 후 100만원은\n오늘 가치로 약 95만원인 거예요.\n\n📌 기업 가치 계산:\n"이 회사가 앞으로 벌 돈을 다 더하면\n오늘 얼마짜리 회사인가?"\n\n💡 장점:\n• 가장 이론적으로 정확한 방법\n• 기업의 본질 가치 산출\n\n⚠️ 단점:\n• 미래 예측이 어려움\n• 가정에 따라 결과가 크게 달라짐',
      example: '앞으로 5년간 매년 100억 벌 예상\n할인율 10% 적용\n→ DCF 적정가치 = 약 380억\n→ 현재 시총 300억이면 저평가!' },
    { term: 'WACC', full: '가중평균자본비용 (Weighted Average Cost of Capital)', 
      desc: '회사가 자금을 조달하는 데 드는 평균 비용으로, DCF 할인율로 사용됩니다.',
      detail: '📌 구성요소:\n• 자기자본비용: 주주가 기대하는 수익률 (보통 8~15%)\n• 타인자본비용: 대출 이자율 (보통 4~8%)\n\n📌 일반적 WACC:\n• 대기업: 7~10%\n• 중소기업: 10~15%\n• 스타트업: 15~25%\n\n💡 WACC가 낮으면?\n→ DCF 가치가 높아짐\n→ 금리 하락기에 성장주 유리한 이유',
      example: 'WACC 10%일 때 적정가 10만원\nWACC 8%로 낮아지면 → 적정가 12만원\n→ 금리 인하 = 주가 상승 요인' },
    { term: 'EV/EBITDA', full: '기업가치/EBITDA', 
      desc: '기업가치를 영업이익+감가상각비로 나눈 값으로, 인수합병(M&A)에 많이 사용됩니다.',
      detail: '📌 용어 설명:\n• EV(기업가치) = 시총 + 순부채\n• EBITDA = 영업이익 + 감가상각비\n\n📌 해석법:\n• 6배 이하: 저평가\n• 6~10배: 적정\n• 10배 이상: 고평가\n\n💡 PER보다 좋은 이유:\n• 감가상각 방식 차이 제거\n• 국가별 세금 차이 제거\n• 자본구조 차이 제거',
      example: 'EV 1조원, EBITDA 1,000억원\n→ EV/EBITDA = 10배\n→ "이 회사를 사면 10년 만에 본전"' },
    { term: 'PSR', full: '주가매출비율 (Price Sales Ratio)', 
      desc: '시가총액을 매출로 나눈 값으로, 적자 기업 평가에 사용됩니다.',
      detail: '📌 사용 이유:\n• 적자 기업은 PER 계산 불가\n• 매출은 조작이 어려움\n\n📌 해석법:\n• 1배 이하: 저평가 (매출만큼 가치 인정 못 받음)\n• 1~3배: 적정\n• 10배 이상: 고평가 (엄청난 성장 기대)\n\n💡 업종별 PSR:\n• 유통: 0.3~0.5배\n• 제조: 1~2배\n• SaaS/플랫폼: 5~20배',
      example: '쿠팡: 적자지만 PSR 1.5배\n→ 매출 30조, 시총 45조\n→ "매출 대비 적정하게 평가받는 중"' },
    { term: '적정주가', full: 'Fair Value / Intrinsic Value', 
      desc: '기업의 내재가치를 기반으로 계산한 "있어야 할" 주가입니다.',
      detail: '📌 산출 방법:\n1. PER 기반: 적정PER × EPS\n2. PBR 기반: 적정PBR × BPS\n3. DCF 기반: 미래현금흐름 현재가치\n4. 종합: 여러 방법의 평균\n\n💡 활용:\n• 적정가 > 현재가 → 매수 기회\n• 적정가 < 현재가 → 고평가, 관망',
      example: '삼성전자 적정가 산출:\n• PER 기반: 78,000원\n• PBR 기반: 65,000원\n• 평균 적정가: 71,500원' },
    { term: '안전마진', full: 'Margin of Safety', 
      desc: '적정가 대비 얼마나 싸게 사는지를 나타내는 할인율입니다.',
      detail: '📌 벤저민 그레이엄의 개념:\n"실수에 대비한 완충장치"\n\n📌 적용 방법:\n• 매수가 = 적정가 × (1 - 안전마진)\n• 안전마진 20%: 적정가 10만원 → 8만원에 매수\n• 안전마진 30%: 적정가 10만원 → 7만원에 매수\n\n💡 워런 버핏:\n"안전마진이 투자의 초석이다"\n→ 분석이 틀려도 손실 최소화',
      example: '적정가 100,000원, 안전마진 25%\n→ 매수 목표가: 75,000원\n→ 현재가 80,000원이면 아직 비쌈' },
    { term: 'PEG', full: 'PER to Growth Ratio', 
      desc: 'PER을 이익성장률로 나눈 값으로, 성장주의 적정 PER을 판단합니다.',
      detail: '📌 계산: PER ÷ 이익성장률\n\n📌 해석법:\n• 1 미만: 저평가 (성장 대비 싸다)\n• 1: 적정\n• 1 초과: 고평가 (성장 대비 비싸다)\n\n💡 핵심 인사이트:\nA회사: PER 30배, 성장률 30% → PEG 1.0\nB회사: PER 15배, 성장률 5% → PEG 3.0\n\n→ PER만 보면 B가 싸 보이지만\n→ 성장성까지 고려하면 A가 훨씬 매력적!\n\n📌 피터 린치: "PEG 1 이하인 성장주를 찾아라"',
      example: '엔비디아: PER 60배, 이익성장률 80%\n→ PEG = 0.75\n→ 성장률 고려하면 오히려 저평가!' },
    { term: '경제적 해자', full: 'Economic Moat', 
      desc: '경쟁자가 쉽게 넘볼 수 없는 기업의 방어막으로, 장기 경쟁우위를 의미합니다.',
      detail: '📌 워런 버핏이 즐겨 쓰는 개념!\n"해자가 넓은 성이 오래 버틴다"\n\n📌 해자의 5가지 종류:\n\n1️⃣ 브랜드 파워\n비싸도 사게 만드는 힘\n예: 코카콜라, 나이키, 애플\n\n2️⃣ 전환비용\n한번 쓰면 바꾸기 어려운 것\n예: 엑셀, 어도비, SAP\n\n3️⃣ 네트워크 효과\n쓰는 사람이 많을수록 가치 상승\n예: 카카오톡, 페이스북, 비자카드\n\n4️⃣ 원가 우위\n경쟁사보다 싸게 만드는 능력\n예: 월마트, 코스트코, TSMC\n\n5️⃣ 무형자산\n특허, 라이선스, 규제 장벽\n예: 제약사 특허, 통신사 주파수\n\n💡 투자 원칙:\n해자가 넓고 깊은 기업 = 장기 투자 적합',
      example: '엔비디아 해자 분석:\n✅ 브랜드: AI칩 = 엔비디아 인식\n✅ 전환비용: CUDA 생태계 종속\n✅ 네트워크: 개발자 커뮤니티\n→ 해자 매우 강력!' },
  ],
  etf: [
    { term: 'ETF', full: '상장지수펀드 (Exchange Traded Fund)', 
      desc: '주식처럼 거래되는 펀드로, 지수나 자산을 추종합니다.',
      detail: '📌 장점:\n• 분산투자: 1주로 수백 종목 투자\n• 저비용: 펀드보다 보수 저렴\n• 편리함: 주식처럼 실시간 매매\n• 투명성: 구성종목 매일 공개\n\n📌 종류:\n• 지수 ETF: S&P500, 코스피200\n• 섹터 ETF: 반도체, 바이오\n• 채권 ETF: 국채, 회사채\n• 원자재 ETF: 금, 원유',
      example: 'SPY 1주 = S&P500 500개 기업에 분산투자\n→ 애플, MS, 아마존 등 자동 포함\n→ 개별주 리스크 없이 미국 시장 투자' },
    { term: '운용보수', full: 'Expense Ratio / Total Expense Ratio', 
      desc: 'ETF 운용에 드는 연간 비용으로, 수익에서 자동 차감됩니다.',
      detail: '📌 해석법:\n• 0.03~0.10%: 매우 저렴 (VOO, VTI)\n• 0.10~0.30%: 저렴\n• 0.30~0.50%: 보통\n• 0.50% 이상: 비쌈 (액티브/테마)\n\n💡 복리 효과:\n10년간 1억 투자 시 (연 7% 수익 가정)\n• 보수 0.03%: 1억9,626만원\n• 보수 0.50%: 1억8,771만원\n→ 855만원 차이!',
      example: 'VOO 보수 0.03% vs 국내펀드 1.5%\n→ 50배 차이!\n→ 장기투자 시 수천만원 차이 발생' },
    { term: 'NAV', full: '순자산가치 (Net Asset Value)', 
      desc: 'ETF가 보유한 자산의 실제 가치를 1주당으로 환산한 것입니다.',
      detail: '📌 계산:\n(보유자산 총액 - 부채) ÷ 발행주식수\n\n📌 활용:\n• ETF 시장가와 NAV 비교\n• 시장가 > NAV: 프리미엄 (비싸게 거래)\n• 시장가 < NAV: 디스카운트 (싸게 거래)\n\n💡 정상적인 ETF는 시장가 ≈ NAV\n→ 차익거래로 가격 수렴',
      example: 'ETF NAV: 50,000원\n시장가: 50,100원 (프리미엄 0.2%)\n→ 거의 정상, 매수해도 OK' },
    { term: '괴리율', full: 'Premium / Discount', 
      desc: 'ETF 시장가격과 실제 자산가치(NAV)의 차이를 비율로 나타낸 것입니다.',
      detail: '📌 계산: (시장가 - NAV) ÷ NAV × 100\n\n📌 해석법:\n• ±0.5% 이내: 정상\n• ±1% 초과: 주의\n• ±3% 초과: 매매 자제\n\n⚠️ 괴리율 높은 경우:\n• 해외 ETF (시차로 NAV 지연)\n• 거래량 적은 ETF\n• 시장 급변동 시',
      example: '한국 상장 미국 ETF\n미국 휴장일에 괴리율 커질 수 있음\n→ 미국 개장 후 정상화' },
    { term: '추적오차', full: 'Tracking Error', 
      desc: 'ETF 수익률과 추종 지수 수익률의 차이입니다.',
      detail: '📌 발생 원인:\n• 운용보수\n• 배당 재투자 시차\n• 환율 변동 (해외 ETF)\n• 샘플링 (전 종목 안 살 때)\n\n📌 해석법:\n• 0.1% 이하: 우수\n• 0.1~0.3%: 양호\n• 0.5% 이상: 불량\n\n💡 장기투자 시 추적오차 누적\n→ 낮을수록 좋음',
      example: 'S&P500 수익률 10%\nETF 수익률 9.7%\n→ 추적오차 0.3% (양호)' },
    { term: '배당재투자', full: 'DRIP (Dividend Reinvestment Plan)', 
      desc: '받은 배당금으로 자동으로 ETF를 추가 매수하는 것입니다.',
      detail: '📌 장점:\n• 복리 효과 극대화\n• 매매 수수료 절약\n• 자동화로 편리\n\n📌 한국 vs 미국:\n• 한국: 대부분 배당 현금 지급\n• 미국: DRIP 설정 가능한 증권사 있음\n\n💡 배당재투자 효과:\n연 3% 배당 + 7% 주가상승\n→ 단순 합산: 10%\n→ 재투자 복리: 10.2%\n→ 30년 차이: 수천만원',
      example: 'SCHD 100주 보유, 분기 배당 $50\n→ DRIP 설정 시 자동으로 0.6주 추가 매수\n→ 30년 후 주식 수 크게 증가' },
    { term: '분배금', full: 'Distribution', 
      desc: 'ETF가 보유 종목에서 받은 배당금을 투자자에게 나눠주는 것입니다.',
      detail: '📌 분배금 종류:\n• 보통 배당: 주식 배당금\n• 이자 소득: 채권 이자\n• 자본 이득: 매매 차익\n\n📌 분배 주기:\n• 월배당: JEPI, SCHD(한국판)\n• 분기배당: SPY, QQQ, SCHD\n• 연배당: 일부 ETF\n\n💡 세금:\n• 국내 ETF: 배당소득세 15.4%\n• 해외 ETF: 배당세 15% + 금융소득종합과세 가능',
      example: 'JEPI 월 분배금 약 0.5%\n→ 1억 투자 시 월 50만원\n→ 연 600만원 (세전)' },
    { term: '환헤지', full: 'Currency Hedging', 
      desc: '환율 변동 위험을 제거하는 것입니다. (H) 표시가 붙은 ETF가 해당됩니다.',
      detail: '📌 환헤지 ETF (H):\n• 환율 변동 영향 제거\n• 지수 수익률만 추종\n• 헤지 비용 발생 (연 1~2%)\n\n📌 환노출 ETF:\n• 환율 변동 영향 받음\n• 원화 약세 시 유리\n• 원화 강세 시 불리\n\n💡 선택 기준:\n• 단기 투자: 환헤지 고려\n• 장기 투자: 환노출 (달러 자산 분산)',
      example: 'S&P500 +10%, 환율 -5%\n→ 환노출 ETF: +5%\n→ 환헤지 ETF: +10%\n(반대 상황도 가능!)' },
  ],
  trading: [
    { term: '손절', full: 'Stop Loss', 
      desc: '손실을 제한하기 위해 일정 금액/비율 하락 시 매도하는 것입니다.',
      detail: '📌 손절 기준 설정:\n• 보수적: -5~7%\n• 일반적: -10~15%\n• 공격적: -20~25%\n\n📌 손절의 중요성:\n• -50% 손실 → 원금 회복에 +100% 필요\n• -30% 손실 → 원금 회복에 +43% 필요\n• -10% 손실 → 원금 회복에 +11% 필요\n\n💡 투자 격언:\n"첫 번째 손실이 가장 작은 손실이다"\n"손절은 비용이 아니라 보험료다"',
      example: '100만원에 매수, 손절 -10% 설정\n→ 90만원 되면 자동 매도\n→ 최대 손실 10만원으로 제한' },
    { term: '익절', full: 'Take Profit', 
      desc: '이익을 실현하기 위해 목표가 도달 시 매도하는 것입니다.',
      detail: '📌 익절 전략:\n• 전량 매도: 목표가에 100% 매도\n• 분할 매도: 50% → 30% → 20%\n• 트레일링 스탑: 고점 대비 -5% 하락 시\n\n📌 익절 타이밍:\n• 목표 수익률 달성 시\n• 매수 이유가 사라졌을 때\n• 더 좋은 기회가 있을 때\n\n💡 "이익은 달리게, 손실은 빨리 끊어라"',
      example: '목표 수익률 +30%\n→ +20% 도달: 50% 매도 (일부 확정)\n→ +30% 도달: 나머지 매도\n→ 심리적 부담 감소' },
    { term: '물타기', full: 'Averaging Down', 
      desc: '주가 하락 시 추가 매수하여 평균 매수단가를 낮추는 전략입니다.',
      detail: '📌 조건 (반드시 확인!):\n• 기업 펀더멘털 변화 없음\n• 일시적 하락 (시장 전체 조정 등)\n• 추가 매수 여력 있음\n\n⚠️ 위험한 물타기:\n• 실적 악화로 하락 중인 종목\n• 이미 과도하게 물탄 상태\n• "무한 물타기"는 파산의 지름길\n\n💡 "물타기는 우량주에만, 반토막 나면 손절"',
      example: '10,000원에 100주 매수 (100만원)\n8,000원에 100주 추가 (80만원)\n→ 평단가: 9,000원 (180만원/200주)\n→ 9,000원만 회복해도 본전' },
    { term: '불타기', full: 'Averaging Up / Pyramiding', 
      desc: '주가 상승 시 추가 매수하여 수익을 극대화하는 전략입니다.',
      detail: '📌 핵심 원리:\n"강한 종목에 돈을 더 태워라"\n→ 추세 추종 전략\n\n📌 불타기 방법:\n• 신고가 돌파 시 추가 매수\n• 지지선 확인 후 추가 매수\n• 실적 서프라이즈 후 추가 매수\n\n📌 비중 조절:\n1차 매수: 30%\n불타기: 20% → 20% → 20% → 10%\n→ 평단가는 올라가지만 수익 극대화',
      example: '10,000원에 30% 매수\n12,000원 돌파 시 20% 추가 (확신 증가)\n15,000원 돌파 시 20% 추가\n→ 상승 추세에 올라탐' },
    { term: '분할매수', full: 'DCA (Dollar Cost Averaging)', 
      desc: '정기적으로 일정 금액을 매수하여 타이밍 리스크를 줄이는 전략입니다.',
      detail: '📌 방법:\n매월 같은 날 같은 금액 매수\n(예: 매월 1일 50만원)\n\n📌 장점:\n• 타이밍 고민 불필요\n• 고점 매수 위험 분산\n• 심리적 부담 감소\n• 꾸준한 투자 습관\n\n📌 효과:\n• 주가 높을 때: 적게 삼\n• 주가 낮을 때: 많이 삼\n→ 평균 매수가 자연스럽게 낮아짐',
      example: '매월 100만원 SPY 매수 (12개월)\n→ 고점에 사기도, 저점에 사기도 함\n→ 평균적으로 중간 가격에 매수\n→ 타이밍 스트레스 없음' },
    { term: '리밸런싱', full: 'Rebalancing', 
      desc: '목표 비중에서 벗어난 포트폴리오를 원래대로 조정하는 것입니다.',
      detail: '📌 예시:\n목표: 주식 60% + 채권 40%\n1년 후: 주식 70% + 채권 30% (주식 상승)\n→ 주식 일부 매도, 채권 매수\n→ 다시 60:40으로 조정\n\n📌 리밸런싱 주기:\n• 정기: 분기/반기/연 1회\n• 비중 기준: ±5%p 이탈 시\n\n💡 효과:\n• 자동으로 "비싸면 팔고, 싸면 사는" 효과\n• 위험 관리\n• 수익률 안정화',
      example: '연초: 삼성전자 30%, 애플 30%, 현금 40%\n연말: 삼성전자 25%, 애플 45%, 현금 30%\n→ 애플 15% 매도, 삼성 5% 매수, 현금 10% 확보' },
    { term: '레버리지', full: 'Leverage', 
      desc: '빚을 내거나 파생상품을 이용해 투자 원금보다 큰 금액을 투자하는 것입니다.',
      detail: '📌 레버리지 종류:\n• 신용거래: 증권사에서 돈 빌림\n• 레버리지 ETF: 2배, 3배 수익 추종\n• 선물/옵션: 증거금만으로 큰 금액 거래\n\n📌 2배 레버리지:\n• 지수 +10% → 내 수익 +20%\n• 지수 -10% → 내 손실 -20%\n\n⚠️ 위험:\n• 횡보장에서 손실 누적 (복리 효과 역작용)\n• 급락 시 원금 전액 손실 가능\n• 장기 보유 비추천',
      example: 'TQQQ (나스닥 3배 레버리지)\n나스닥 +1% → TQQQ +3%\n나스닥 -1% → TQQQ -3%\n→ 단기 트레이딩용, 장기 보유 금지' },
    { term: '공매도', full: 'Short Selling', 
      desc: '주식을 빌려서 먼저 팔고, 나중에 싸게 사서 갚아 수익을 얻는 투자 방법입니다.',
      detail: '📌 공매도 과정:\n1. 증권사에서 주식 차입\n2. 현재가에 매도\n3. 주가 하락 기다림\n4. 낮은 가격에 매수\n5. 차입 주식 상환\n→ 매도가 - 매수가 = 수익\n\n⚠️ 위험:\n• 주가 상승 시 손실 무제한\n• 대차료(빌리는 비용) 발생\n• 개인은 조건 까다로움',
      example: '10,000원에 공매도 → 7,000원에 매수\n→ 수익 3,000원 (30%)\n\n반대로 15,000원으로 상승 시\n→ 손실 5,000원 (50%)' },
    { term: '골든크로스/데드크로스', full: 'Golden Cross / Dead Cross', 
      desc: '이동평균선이 교차할 때 나오는 매수/매도 신호입니다.',
      detail: '📌 먼저! 이동평균선이란?\n"최근 며칠간 주가의 평균을 이은 선"\n• 5일선: 최근 5일 평균 (단기 추세)\n• 20일선: 최근 20일 평균 (중기 추세)\n• 60일선: 최근 60일 평균 (장기 추세)\n\n📌 골든크로스 (Golden Cross):\n단기선(5일)이 장기선(20일)을 아래→위로 뚫고 올라감\n→ 🟢 매수 신호! 상승 추세 시작\n\n📌 데드크로스 (Dead Cross):\n단기선(5일)이 장기선(20일)을 위→아래로 뚫고 내려감\n→ 🔴 매도 신호! 하락 추세 시작\n\n💡 신뢰도:\n• 5일 & 20일: 자주 발생, 신뢰도 낮음\n• 50일 & 200일: 드물게 발생, 신뢰도 높음\n\n⚠️ 주의: 이미 어느 정도 움직인 후 신호가 나와요 (후행 지표)',
      example: '삼성전자 5일선이 20일선 상향 돌파!\n→ 골든크로스 발생\n→ 단기 상승 추세 시작 신호\n→ 매수 타이밍 고려' },
    { term: '지지선/저항선', full: 'Support / Resistance', 
      desc: '주가가 더 이상 내려가지 않는 바닥(지지)과 더 이상 올라가지 않는 천장(저항)입니다.',
      detail: '📌 지지선 (Support):\n주가가 하락하다 멈추는 가격대\n→ 매수세가 강해지는 구간\n→ 반등 기대, 매수 타이밍\n\n📌 저항선 (Resistance):\n주가가 상승하다 멈추는 가격대\n→ 매도세가 강해지는 구간\n→ 돌파 실패 시 하락, 돌파 시 급등\n\n💡 역할 전환:\n저항선 돌파 → 지지선으로 변환\n지지선 이탈 → 저항선으로 변환\n\n📌 찾는 방법:\n• 과거 고점/저점 연결\n• 거래량 많았던 가격대\n• 심리적 가격 (10,000원, 50,000원 등)',
      example: '삼성전자 70,000원 저항\n→ 3번 돌파 시도 실패\n→ 4번째 돌파 성공\n→ 70,000원이 지지선으로 전환' },
    { term: '시나리오 분석', full: 'Scenario Analysis', 
      desc: '최악/보통/최상 세 가지 상황을 가정하고, 투자할 만한 가치가 있는지 판단하는 방법입니다.',
      detail: '📌 세 가지 시나리오:\n🐂 Bull (낙관): 모든 게 잘 풀릴 때\n📈 Base (기본): 가장 현실적인 경우\n🐻 Bear (비관): 최악의 상황\n\n📌 기대수익률 계산법 (쉬움!):\n각 상황의 (확률 × 수익률)을 더하면 됩니다.\n\n예시:\n• 🐂 Bull: 20% 확률로 +40% 수익\n• 📈 Base: 50% 확률로 +15% 수익\n• 🐻 Bear: 30% 확률로 -30% 손실\n\n계산:\n(0.2 × 40) + (0.5 × 15) + (0.3 × -30)\n= 8 + 7.5 + (-9) = 6.5%\n\n💡 투자 판단:\n"최악의 경우 -30% 손실 위험을 감수하면서\n고작 6.5% 기대수익을 노릴 가치가 있나?"\n\n→ 기대수익 < 리스크 감당 → 투자 보류\n→ 기대수익 > 리스크 감당 → 투자 검토',
      example: '테슬라 시나리오:\n🐂 FSD 대성공 → +50% (20%)\n📈 현상 유지 → +10% (50%)\n🐻 경쟁 심화 → -30% (30%)\n→ 기대수익률 약 6%\n→ 변동성 대비 낮은 기대수익' },
    { term: '블랙스완', full: 'Black Swan', 
      desc: '도저히 일어날 것 같지 않았지만 일어나면 엄청난 충격을 주는 사건입니다.',
      detail: '📌 블랙스완의 3가지 특징:\n1. 극히 드묾 (Rarity): 과거 경험으로 예측 불가\n2. 극심한 충격 (Extreme Impact): 발생 시 엄청난 파급\n3. 사후 예측 (Retrospective Predictability): 나중에 보면 "예상했어야 했다"고 느낌\n\n📌 투자에서 블랙스완:\n• 2008년 금융위기\n• 2020년 코로나 팬데믹\n• 2022년 러시아-우크라이나 전쟁\n\n💡 대비 방법:\n• 분산투자 (한 바구니에 담지 않기)\n• 현금 비중 유지 (급락 시 매수 기회)\n• 레버리지 최소화 (빚투 금지)\n• 손절 라인 설정\n\n⚠️ 핵심 교훈:\n"일어날 리 없다"고 생각한 일이 실제로 일어납니다.\n항상 최악의 상황을 대비하세요.',
      example: '2020년 3월 코로나 블랙스완:\n• S&P500 한 달 만에 -34% 폭락\n• 서킷브레이커 4회 발동\n• 하지만 대비한 투자자는 저점 매수로 대박' },
  ],
  technical: [
    { term: 'CFA', full: '국제재무분석사 (Chartered Financial Analyst)', 
      desc: '금융 투자 분야에서 가장 권위 있는 국제 자격증입니다.',
      detail: '📌 CFA란?\n미국 CFA Institute가 주관하는 금융 전문가 자격증\n월스트리트 애널리스트의 "필수 스펙"\n\n📌 시험 구성:\n• Level 1: 투자 기초, 재무제표 분석\n• Level 2: 자산 평가, 포트폴리오 관리\n• Level 3: 포트폴리오 운용, 자산배분\n\n📌 취득 조건:\n• 3개 레벨 모두 합격 (각 레벨 합격률 40~50%)\n• 4년 이상 관련 경력\n• 평균 취득 기간: 4~5년\n\n💡 CFA 보유자의 강점:\n• 재무제표 분석 전문\n• 밸류에이션 모델 숙달\n• 포트폴리오 이론 이해\n• 윤리 기준 준수',
      example: 'CFA 3레벨 합격자\n→ 글로벌 투자은행, 자산운용사 선호\n→ 연봉 프리미엄 20~30%\n→ "금융계의 사법고시"라 불림' },
    { term: '이동평균선', full: 'Moving Average (MA)', 
      desc: '일정 기간 동안의 주가 평균을 이은 선으로, 추세를 파악하는 기본 지표입니다.',
      detail: '📌 종류별 의미:\n• 5일선: 1주일 평균 (초단기 추세)\n• 20일선: 1개월 평균 (단기 추세)\n• 60일선: 3개월 평균 (중기 추세)\n• 120일선: 6개월 평균 (장기 추세)\n• 200일선: 1년 평균 (대세 추세)\n\n📌 배열 상태:\n✅ 정배열: 5일 > 20일 > 60일 > 120일\n→ 상승 추세, 매수 유리\n\n❌ 역배열: 5일 < 20일 < 60일 < 120일\n→ 하락 추세, 매수 불리\n\n📌 활용법:\n• 이평선 위에 있으면 → 상승 추세\n• 이평선 아래에 있으면 → 하락 추세\n• 이평선 수렴 → 큰 움직임 예고',
      example: '삼성전자가 60일선 위로 올라옴\n→ 중기 추세 상승 전환 신호\n→ 60일선이 지지선 역할 기대' },
    { term: '그랜빌의 법칙', full: "Granville's 8 Rules", 
      desc: '이동평균선을 이용한 8가지 매매 기법으로, 기술적 분석의 기초입니다.',
      detail: '📌 조셉 그랜빌이 개발한 매매 법칙\n\n🟢 매수 신호 4가지:\n1. 이평선 상향 돌파\n   주가가 하락하던 이평선을 뚫고 상승\n2. 눌림목 매수\n   상승 중 이평선까지 조정 후 반등\n3. 이평선 지지\n   하락하다 이평선에서 반등\n4. 급락 후 이격\n   이평선에서 너무 멀리 떨어진 후 반등\n\n🔴 매도 신호 4가지:\n5. 이평선 하향 돌파\n   주가가 상승하던 이평선 아래로 추락\n6. 반등 후 재하락\n   하락 중 이평선까지 반등 후 다시 하락\n7. 이평선 저항\n   상승하다 이평선에서 막힘\n8. 급등 후 이격\n   이평선에서 너무 멀리 올라간 후 조정',
      example: '현재 주가가 20일선 아래에서\n20일선을 뚫고 올라옴\n→ 그랜빌 매수신호 1번!\n→ 상승 추세 전환 기대' },
    { term: 'RSI', full: '상대강도지수 (Relative Strength Index)', 
      desc: '주가의 상승/하락 강도를 0~100 사이 숫자로 나타내, 과매수·과매도를 판단하는 지표입니다.',
      detail: '📌 개발자: 웰스 와일더 (1978년)\n\n📌 해석법:\n• 70 이상: 과매수 (너무 많이 올랐다)\n  → 조정/하락 가능성, 매도 고려\n• 30 이하: 과매도 (너무 많이 떨어졌다)\n  → 반등 가능성, 매수 고려\n• 50 기준: 상승추세(50↑) vs 하락추세(50↓)\n\n📌 다이버전스 (중요!):\n• 상승 다이버전스: 주가↓ but RSI↑ → 매수\n• 하락 다이버전스: 주가↑ but RSI↓ → 매도\n\n⚠️ 주의:\n• 강한 상승장에서는 70 이상 유지 가능\n• RSI만으로 매매하면 안 됨 (보조 지표)',
      example: '삼성전자 RSI 25\n→ 과매도 구간 진입\n→ 단기 반등 가능성\n→ 다른 지표와 함께 매수 검토' },
    { term: 'MACD', full: '이동평균수렴확산지수 (Moving Average Convergence Divergence)', 
      desc: '단기와 장기 이동평균선의 차이를 이용해 추세 전환을 포착하는 지표입니다.',
      detail: '📌 개발자: 제럴드 아펠 (1970년대)\n\n📌 구성요소:\n• MACD선: 12일 이평 - 26일 이평\n• 시그널선: MACD의 9일 이평\n• 히스토그램: MACD - 시그널 (막대그래프)\n\n📌 매매 신호:\n🟢 골든크로스: MACD가 시그널선 상향 돌파 → 매수\n🔴 데드크로스: MACD가 시그널선 하향 돌파 → 매도\n\n📌 제로라인 돌파:\n• 0선 상향 돌파: 중기 상승 전환\n• 0선 하향 돌파: 중기 하락 전환\n\n📌 히스토그램:\n• 막대 증가: 추세 강화\n• 막대 감소: 추세 약화',
      example: 'MACD가 시그널선 위로 교차\n+ 히스토그램 양수 전환\n+ 제로라인 위에 위치\n→ 강력한 매수 신호!' },
    { term: '스토캐스틱', full: 'Stochastic Oscillator', 
      desc: '일정 기간의 최고가와 최저가 사이에서 현재 주가의 위치를 백분율로 나타낸 지표입니다.',
      detail: '📌 구성요소:\n• %K: 현재가의 상대적 위치 (빠른 선)\n• %D: %K의 이동평균 (느린 선)\n\n📌 해석법:\n• 80 이상: 과매수 구간\n• 20 이하: 과매도 구간\n\n📌 매매 신호:\n🟢 매수: %K가 %D를 상향 돌파 (20 이하에서)\n🔴 매도: %K가 %D를 하향 돌파 (80 이상에서)\n\n💡 RSI vs 스토캐스틱:\n• RSI: 상승/하락 강도 측정\n• 스토캐스틱: 가격 범위 내 위치 측정\n→ 함께 사용하면 신뢰도 상승',
      example: '스토캐스틱 %K: 15, %D: 18\n%K가 %D를 상향 돌파 중\n→ 과매도 구간에서 매수 신호\n→ 반등 기대' },
    { term: '다이버전스', full: 'Divergence', 
      desc: '주가의 방향과 보조지표의 방향이 반대로 가는 현상으로, 추세 전환의 강력한 신호입니다.',
      detail: '📌 핵심 개념:\n주가와 지표(RSI, MACD 등)가 서로 다른 방향\n→ "뭔가 이상하다" → 추세 전환 임박\n\n📌 상승 다이버전스 (매수 신호):\n• 주가: 저점을 낮추는 중 (하락)\n• 지표: 저점을 높이는 중 (상승)\n→ 주가는 떨어지는데 힘은 빠지고 있다\n→ 곧 반등할 가능성!\n\n📌 하락 다이버전스 (매도 신호):\n• 주가: 고점을 높이는 중 (상승)\n• 지표: 고점을 낮추는 중 (하락)\n→ 주가는 오르는데 힘이 빠지고 있다\n→ 곧 조정받을 가능성!\n\n💡 다이버전스는 가장 신뢰도 높은 기술적 신호 중 하나',
      example: '테슬라 주가: 200 → 180 (신저점)\nRSI: 30 → 35 (저점 상승)\n→ 상승 다이버전스!\n→ 매수 타이밍 탐색' },
    { term: 'OBV', full: '거래량 누적 지표 (On Balance Volume)', 
      desc: '거래량을 누적해서 세력의 매집/분산을 파악하는 지표입니다.',
      detail: '📌 개발자: 조셉 그랜빌 (1963년)\n\n📌 계산 방법:\n• 오늘 상승 → 오늘 거래량을 더함\n• 오늘 하락 → 오늘 거래량을 뺌\n→ 이걸 매일 누적\n\n📌 해석법:\n✅ OBV 상승 + 주가 횡보\n→ 세력이 몰래 매집 중 (상승 예고)\n\n❌ OBV 하락 + 주가 횡보\n→ 세력이 몰래 분산 중 (하락 예고)\n\n📌 다이버전스:\n• 주가↓ + OBV↑: 매집 중, 반등 예상\n• 주가↑ + OBV↓: 분산 중, 조정 예상\n\n💡 "거래량은 주가에 선행한다"\n→ OBV가 먼저 움직이고 주가가 따라감',
      example: '주가는 3주째 횡보\nOBV는 계속 상승 중\n→ 누군가 조용히 매집 중\n→ 곧 상승 돌파 기대' },
    { term: '볼린저밴드', full: 'Bollinger Bands', 
      desc: '이동평균선을 중심으로 상하에 표준편차 밴드를 그려 주가의 변동 범위를 나타내는 지표입니다.',
      detail: '📌 개발자: 존 볼린저 (1980년대)\n\n📌 구성:\n• 중심선: 20일 이동평균\n• 상단밴드: 중심선 + (2 × 표준편차)\n• 하단밴드: 중심선 - (2 × 표준편차)\n\n📌 해석법:\n• 상단밴드 터치: 과매수, 조정 가능\n• 하단밴드 터치: 과매도, 반등 가능\n• 밴드 수축: 변동성 감소, 큰 움직임 예고\n• 밴드 확장: 변동성 증가, 추세 진행 중\n\n📌 볼린저밴드 스퀴즈:\n밴드가 극도로 좁아짐\n→ 폭발적 움직임 임박!\n(방향은 모름, 돌파 방향 추종)',
      example: '볼린저밴드 수축 후\n상단밴드 돌파 + 거래량 급증\n→ 상승 추세 시작!\n→ 상단밴드 따라 상승 기대' },
    { term: '모멘텀', full: 'Momentum', 
      desc: '주가의 상승 또는 하락 추세가 가진 힘과 속도를 나타내는 개념입니다.',
      detail: '📌 모멘텀이란?\n"추세의 가속도"\n오르는 주식은 더 오르고, 내리는 주식은 더 내린다\n\n📌 모멘텀 투자 전략:\n• 상승 모멘텀: 최근 많이 오른 주식 매수\n• "강한 것은 더 강해진다"\n\n📌 모멘텀 지표들:\n• RSI: 상승/하락 강도\n• MACD: 추세 전환\n• ROC: 가격 변화율\n\n📌 모멘텀 vs 가치투자:\n• 모멘텀: 비싸도 더 오를 것 같으면 산다\n• 가치투자: 싸면 산다\n\n💡 단기 트레이딩에 유용\n장기투자는 펀더멘털이 중요',
      example: '엔비디아 3개월 +50% 상승\n모멘텀 매우 강함\n→ 모멘텀 투자자: 추가 상승 기대\n→ 가치투자자: 비싸서 관망' },
    { term: '과매수/과매도', full: 'Overbought / Oversold', 
      desc: '주가가 지나치게 많이 사지거나(과매수) 팔린(과매도) 과열 상태를 의미합니다.',
      detail: '📌 과매수 (Overbought):\n• 단기간 너무 많이 올랐다\n• 매수세가 과열됨\n• 조정/하락 가능성 높음\n• RSI 70 이상, 스토캐스틱 80 이상\n\n📌 과매도 (Oversold):\n• 단기간 너무 많이 떨어졌다\n• 매도세가 과열됨\n• 반등 가능성 높음\n• RSI 30 이하, 스토캐스틱 20 이하\n\n⚠️ 주의:\n• 강한 추세에서는 과매수/과매도 유지 가능\n• RSI 70 → 더 오를 수도 있음\n• RSI 30 → 더 떨어질 수도 있음\n→ 신호일 뿐, 절대적 기준 아님',
      example: 'RSI 28 + 스토캐스틱 18\n→ 과매도 구간 진입\n→ 단기 반등 가능성 높음\n→ 매수 타이밍 탐색' },
    { term: 'ESG', full: '환경·사회·지배구조 (Environmental, Social, Governance)', 
      desc: '기업의 비재무적 성과를 평가하는 기준으로, 지속가능한 투자의 핵심 요소입니다.',
      detail: '📌 ESG 3가지 영역:\n\n🌱 E (환경):\n• 탄소배출량, 재생에너지 사용\n• 환경 규제 준수, 친환경 투자\n• 기후변화 대응\n\n👥 S (사회):\n• 근로환경, 산업재해율\n• 다양성 (여성 임원, 장애인 고용)\n• 공급망 관리, 지역사회 기여\n\n🏛️ G (지배구조):\n• 이사회 독립성, 사외이사 비율\n• 경영진 보상 체계\n• 소수주주 보호, 회계 투명성\n\n📌 ESG 등급:\n• MSCI: AAA ~ CCC (7등급)\n• Sustainalytics: 리스크 점수\n• KCGS (한국): A+ ~ D\n\n💡 ESG가 중요한 이유:\n• 장기 리스크 관리\n• 기관투자자 투자 기준\n• 규제 강화 추세',
      example: '삼성전자 ESG 등급: A\n애플 ESG 등급: BBB\n→ 장기투자 시 ESG 우수 기업 선호\n→ ESG 부실 기업은 리스크 존재' },
    { term: '순이익률', full: 'Net Profit Margin', 
      desc: '매출에서 모든 비용을 제외한 순이익의 비율로, 최종적인 수익성을 보여줍니다.',
      detail: '📌 계산:\n순이익 ÷ 매출 × 100\n\n📌 해석법:\n• 5% 미만: 낮음 (박리다매형)\n• 5~10%: 보통\n• 10~20%: 우수\n• 20% 이상: 탁월\n\n📌 업종별 특성:\n• 유통: 1~3%\n• 제조: 5~10%\n• IT/SW: 15~30%\n• 제약: 20~40%\n\n💡 듀퐁 분석에서:\nROE = 순이익률 × 자산회전율 × 레버리지\n→ 순이익률이 높으면 "마진이 좋다"\n→ 가격 결정력 or 비용 효율성',
      example: '애플 순이익률 25%\n삼성전자 순이익률 12%\n→ 애플이 같은 매출 대비 2배 더 남김\n→ 브랜드 프리미엄의 힘' },
    { term: '자산회전율', full: 'Asset Turnover', 
      desc: '보유 자산 대비 얼마나 많은 매출을 올렸는지 보여주는 효율성 지표입니다.',
      detail: '📌 계산:\n매출 ÷ 총자산\n\n📌 해석법:\n• 0.5 미만: 자산 활용 비효율\n• 0.5~1.0: 보통\n• 1.0 이상: 효율적\n• 2.0 이상: 매우 효율적\n\n📌 업종별 특성:\n• 유통 (월마트): 2.5 (자산 대비 매출 많음)\n• 제조 (자동차): 0.6~0.8\n• IT (SW): 0.5~1.0\n• 금융 (은행): 0.05 (자산이 매우 큼)\n\n💡 듀퐁 분석에서:\nROE = 순이익률 × 자산회전율 × 레버리지\n→ 회전율 높으면 "자산을 쉴 틈 없이 굴린다"',
      example: '코스트코 자산회전율 3.5\n백화점 자산회전율 1.2\n→ 코스트코가 자산을 3배 더 효율적으로 활용' },
    { term: '인덱스 펀드', full: 'Index Fund', 
      desc: '특정 지수(S&P500, 코스피200 등)의 수익률을 그대로 따라가는 것을 목표로 하는 펀드입니다.',
      detail: '📌 핵심 철학:\n"시장을 이기려 하지 말고, 시장에 올라타라"\n\n📌 장점:\n• 저비용: 운용보수 0.03~0.2%\n• 분산투자: 지수 구성 종목 전체 투자\n• 투명성: 구성 종목 공개\n• 단순함: 종목 선택 고민 없음\n\n📌 대표 인덱스 펀드/ETF:\n• SPY, VOO: S&P500\n• QQQ: 나스닥100\n• KODEX 200: 코스피200\n\n💡 워런 버핏의 유언:\n"내 유산의 90%는 S&P500 인덱스 펀드에 투자하라"\n\n📌 vs 액티브 펀드:\n10년 기준 80% 이상의 액티브 펀드가\n인덱스 펀드 수익률을 못 이김',
      example: 'S&P500 인덱스 펀드 투자\n= 애플, MS, 아마존 등 500개 기업에 자동 분산\n= 미국 경제 성장에 올라탐' },
    { term: '액티브 펀드', full: 'Active Fund', 
      desc: '펀드매니저가 종목을 직접 선택해 시장 평균보다 높은 수익을 추구하는 펀드입니다.',
      detail: '📌 핵심 철학:\n"좋은 종목만 골라 시장을 이기겠다"\n\n📌 특징:\n• 펀드매니저의 역량 의존\n• 운용보수 높음 (1~2%)\n• 시장 초과수익(알파) 추구\n• 벤치마크 대비 성과 측정\n\n📌 장점:\n• 하락장에서 방어 가능\n• 특정 테마/섹터 집중 가능\n• 전문가의 분석 활용\n\n📌 단점:\n• 높은 보수\n• 장기적으로 인덱스에 밀리는 경우 많음\n• 펀드매니저 리스크\n\n📌 성과 현실:\n10년 기준 약 85%의 액티브 펀드가\n인덱스 펀드 수익률을 하회',
      example: '액티브 펀드 A:\n운용보수 1.5%, 수익률 12%\n실질 수익: 10.5%\n\n인덱스 펀드:\n운용보수 0.03%, 수익률 10%\n실질 수익: 9.97%\n\n→ 2% 초과수익 내야 본전' },
    { term: '헤지펀드', full: 'Hedge Fund', 
      desc: '다양한 전략으로 시장 상황과 관계없이 절대 수익을 추구하는 사모펀드입니다.',
      detail: '📌 헤지(Hedge)의 의미:\n"위험을 회피하다"\n→ 시장이 오르든 내리든 수익 추구\n\n📌 주요 전략:\n• 롱숏: 매수(롱) + 공매도(숏) 동시\n• 이벤트 드리븐: M&A, 구조조정 활용\n• 글로벌 매크로: 금리, 환율 방향 베팅\n• 퀀트: 알고리즘 자동매매\n\n📌 특징:\n• 최소 투자금 높음 (수억~수십억)\n• 운용보수 2% + 성과보수 20%\n• 레버리지, 공매도 적극 활용\n• 규제 적음 (사모펀드)\n\n📌 유명 헤지펀드:\n• 브리지워터 (레이 달리오)\n• 르네상스 테크놀로지\n• 시타델',
      example: '헤지펀드 전형적 수수료:\n"2 and 20"\n= 운용보수 2% + 수익의 20%\n\n10% 수익 시:\n투자자 몫: 6.4%\n펀드 몫: 3.6%' },
  ]
};



export default function App() {
  const [currentMenu, setCurrentMenu] = useState('recommend');
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState([]);
  const [isLoadingFromHistory, setIsLoadingFromHistory] = useState(false);

  // ─── 자산관리 (useAssets 훅) ─────────────────────────────────────────
  const {
    assets,
    transactions,
    addAsset,
    removeAsset,
    updateAsset,
    buyAsset,
    sellAsset,
    removeTrade,
    clearTransactions,
    updateAllPrices,
    isUpdatingPrices,
    lastUpdated,
    totalAssetValue,
    totalCost,
    totalPnL,
    totalPnLPct,
  } = useAssets();

  // ─── 거래 입력 폼 상태 (UI 전용) ────────────────────────────────
  const [tradeForm, setTradeForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: '매수',
    assetId: '',
    quantity: '',
    price: '',
    memo: '',
  });
  const [tradeMsg, setTradeMsg] = useState('');

  // ─── 자산 추가 폼 상태 (UI 전용) ────────────────────────────────
  const [assetForm, setAssetForm] = useState({
    group: '연금형',
    account: '연금저축',
    name: '',
    ticker: '',
    quantity: '',
    avgPrice: '',
    currentPrice: '',
  });
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [assetMsg, setAssetMsg] = useState('');

  // ─── 상세 모달 상태 (UI 전용) ────────────────────────────────────
  const [selectedAsset, setSelectedAsset] = useState(null);

  // ─── 거래 제출 (유효성 검사 → buyAsset / sellAsset 호출) ───────
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
    setTradeMsg(`✅ ${type} 거래가 등록됐습니다!`);
    setTimeout(() => setTradeMsg(''), 3000);
  };

  // ─── 자산 추가 (유효성 검사 → addAsset 호출) ───────────────────
  const submitAsset = () => {
    const { group, account, name, ticker, quantity, avgPrice, currentPrice } = assetForm;
    if (!name || !quantity || !avgPrice || !currentPrice) {
      setAssetMsg('❗ 종목명, 수량, 평단가, 현재가를 입력해주세요.');
      return;
    }
    addAsset({ group, account, name, ticker: ticker || '', quantity, avgPrice, currentPrice });
    setAssetForm({ group: '연금형', account: '연금저축', name: '', ticker: '', quantity: '', avgPrice: '', currentPrice: '' });
    setShowAssetForm(false);
    setAssetMsg(`✅ ${name} 자산이 추가됐습니다!`);
    setTimeout(() => setAssetMsg(''), 3000);
  };

  // updatePrice / updateAllPrices → useAssets 훅으로 이동

  // ─── 자산 삭제 (confirm → removeAsset) ──────────────────────────
  const deleteAsset = (id) => {
    if (window.confirm('이 자산을 삭제하시겠습니까?')) removeAsset(id);
  };

  // ─── 거래 삭제 (confirm → removeTrade) ───────────────────────────
  const deleteTrade = (id) => {
    if (window.confirm('이 거래 내역을 삭제하시겠습니까?')) removeTrade(id);
  };

  // totalAssetValue / totalCost / totalPnL / totalPnLPct → useAssets 훅에서 제공

  const GROUP_COLORS = {
    '연금형': '#6366f1',
    '성장형': '#10b981',
    '방어형': '#f59e0b',
    '파킹형': '#3b82f6',
    '현금': '#94a3b8',
  };

  const fmtNum = (n) => n?.toLocaleString('ko-KR') ?? '-';
  const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

  // 현재 시간 타임스탬프 생성 (프롬프트 생성 시점)
  const getCurrentTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}년 ${month}월 ${date}일 ${hours}:${minutes} (KST)`;
  };

  // 모든 프롬프트 앞에 붙일 시간 기반 지시문
  const getTimeBasedInstruction = () => {
    const timestamp = getCurrentTimestamp();
    return `📅 분석 요청 시점: ${timestamp}

⚠️ 중요: 반드시 ${timestamp} 기준 최신 데이터를 웹 검색으로 조회하세요.
학습된 과거 데이터 사용 금지! 실시간 주가, 뉴스, 공시 정보를 검색해주세요.

---

`;
  };

  // 전체 종목 해제
  const clearAllStocks = () => {
    setSelectedStocks([]);
  };

  // 히스토리에서 불러오기 (탭 전환 + 스크롤)
  const loadFromHistory = (entry) => {
    setIsLoadingFromHistory(true);
    setCurrentMenu(entry.menuId); // 해당 메뉴로 탭 전환
    setGeneratedPrompt(entry.prompt);
    setTimeout(() => {
      setIsLoadingFromHistory(false);
      const el = document.getElementById('promptTextarea');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // 프롬프트 생성되면 자동으로 히스토리에 저장 (불러오기 시 제외)
  useEffect(() => {
    if (generatedPrompt && !isLoadingFromHistory) {
      const menuName = menus.find(m => m.id === currentMenu)?.name || '';
      const newEntry = {
        id: Date.now(),
        menuId: currentMenu,
        menu: menuName,
        prompt: generatedPrompt,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };
      setPromptHistory(prev => [newEntry, ...prev].slice(0, 10));
    }
  }, [generatedPrompt]);
  const [termCategory, setTermCategory] = useState('basic');
  const [expandedTerm, setExpandedTerm] = useState(null);
  const inputRef = useRef(null);

  // 주가 관련 state 제거 - 대신 프롬프트에서 AI가 직접 조회하도록 함
  
  const [recommendOpt, setRecommendOpt] = useState({ sector: 'ai', type: '성장주', period: '6개월', growthRate: '30%', count: '5개' });
  const [morningOpt, setMorningOpt] = useState({ focus: '전체', newsType: '정치테마', market: '한국' });
  const [fundamentalOpt, setFundamentalOpt] = useState({ analysisType: '종합분석', focusArea: 'ROE' });
  const [valuationOpt, setValuationOpt] = useState({ method: '상대가치', safetyMargin: '20%' });
  const [qualitativeOpt, setQualitativeOpt] = useState({ focus: '경쟁우위' });
  const [riskOpt, setRiskOpt] = useState({ scenario: '3가지', stopLoss: '15%' });
  const [portfolioOpt, setPortfolioOpt] = useState({ totalAmount: '1000만원', strategy: '균등분산' });
  const [etfOpt, setEtfOpt] = useState({ goal: '장기투자', style: '패시브', region: '글로벌' });
  const [technicalOpt, setTechnicalOpt] = useState({ timeframe: '일봉', indicator: '이동평균', pattern: '추세' });

  const menus = [
    { id: 'assets', name: '내자산', icon: '🏦' },
    { id: 'trades', name: '매매기록', icon: '📒' },
    { id: 'morning', name: '모닝브리핑', icon: '🌅' },
    { id: 'recommend', name: '종목발굴', icon: '💡' },
    { id: 'discovery', name: '내종목', icon: '🔍' },
    { id: 'fundamental', name: '재무', icon: '📊' },
    { id: 'valuation', name: '밸류', icon: '💰' },
    { id: 'technical', name: '기술적', icon: '📈' },
    { id: 'qualitative', name: '질적', icon: '🧠' },
    { id: 'risk', name: '리스크', icon: '⚠️' },
    { id: 'portfolio', name: '포트폴리오', icon: '💼' },
    { id: 'etf', name: 'ETF', icon: '🏦' },
    { id: 'terms', name: '용어', icon: '📖' },
  ];

  // ETF 선택 시 자동 지역 설정
  useEffect(() => {
    const selectedETFs = selectedStocks.map(s => ETF_LIST.find(e => e.name === s)).filter(Boolean);
    if (selectedETFs.length > 0) {
      const regions = [...new Set(selectedETFs.map(e => e.region))];
      if (regions.length === 1) {
        setEtfOpt(prev => ({ ...prev, region: regions[0] }));
      } else if (regions.length > 1) {
        setEtfOpt(prev => ({ ...prev, region: '글로벌' }));
      }
    }
  }, [selectedStocks, currentMenu]);

  const toggleStock = (name) => {
    if (selectedStocks.includes(name)) {
      setSelectedStocks(selectedStocks.filter(s => s !== name));
    } else {
      setSelectedStocks([...selectedStocks, name]);
    }
  };

  const addCustomStock = () => {
    if (inputRef.current) {
      const value = inputRef.current.value.trim();
      if (value && !selectedStocks.includes(value)) {
        setSelectedStocks([...selectedStocks, value]);
        inputRef.current.value = '';
      }
    }
  };

  const clearStocks = () => setSelectedStocks([]);

  // ========== RICE 프롬프트 생성 함수들 ==========
  
  const generateMorningPrompt = () => {
    const newsTypeGuide = {
      '정치테마': '대통령/장관/국회의원 발언, 정책 발표, 외교 이슈 (예: 정상회담 선물, 정책 수혜주)',
      '기업공시': '실적발표, 대규모 계약, M&A, 유상증자, 자사주 매입, 임원 변동',
      '글로벌이슈': '미국 증시, 중국 정책, 환율, 원자재, 지정학 리스크',
      '테마급등': 'SNS/커뮤니티 화제, 급등 테마, 작전주 의심 종목, 거래량 급증'
    };
    
    const marketGuide = {
      '한국': '코스피/코스닥 상장 종목 중심, 한국 정치/경제 뉴스',
      '미국': '나스닥/NYSE 상장 종목, 미국 프리마켓/애프터마켓 동향',
      '전체': '한국 + 미국 + 글로벌 전체 시장'
    };
    
    setGeneratedPrompt(`${getTimeBasedInstruction()}🌅 오늘의 단타 모닝브리핑

R (Role) - 역할
당신은 10년 경력의 단기 트레이딩 전문가입니다.
- 매일 새벽 글로벌 뉴스와 공시를 분석
- 테마주/이슈 선점 투자 전문
- 정치/경제 이벤트 → 수혜주 연결 분석 능력

I (Instruction) - 지시사항
오늘 주식장 시작 전, 단타 매매에 활용할 수 있는 핵심 정보를 분석해주세요.

🔴 필수 - 실시간 데이터 조회:
1. 뉴스: 최근 24시간 이내의 최신 뉴스를 Web Search로 검색
2. 주가: 각 종목의 현재가는 반드시 Web Search로 실시간 조회
3. 절대로 학습 데이터에 있는 과거 주가를 사용하지 마세요
4. 주가 검색 시 "[종목명] 주가" 또는 "[종목명] 현재가"로 검색

분석 조건:
- 뉴스 유형: ${morningOpt.newsType}
- ${newsTypeGuide[morningOpt.newsType]}
- 시장: ${morningOpt.market} (${marketGuide[morningOpt.market]})

찾아야 할 정보:
1. 정치인 발언/행동 → 관련 수혜주 (예: 대통령이 특정 기업 방문, 선물 증정 등)
2. 새벽 공시 중 주가에 영향 줄 내용 (계약, 실적, 인수합병)
3. 해외 시장 마감 후 나온 뉴스 중 국내 영향
4. SNS/커뮤니티에서 화제되는 테마
5. 전일 시간외 거래에서 급등/급락한 종목

C (Context) - 맥락
- 장 시작 전 30분~1시간 내 빠른 의사결정 필요
- 단타 매매 (당일~2-3일 보유) 관점
- 뉴스 → 종목 연결이 핵심 (왜 이 종목이 움직일지)

E (Example) - 출력 형식

📰 오늘의 핵심 뉴스 & 수혜주

---
🔥 1순위: [뉴스 헤드라인]
| 항목 | 내용 |
|------|------|
| 뉴스 요약 | [1-2줄 요약] |
| 수혜 종목 | [종목명] (종목코드) |
| 연결 고리 | [왜 이 뉴스가 이 종목에 영향?] |
| 현재가/등락 | [Web Search로 조회한 실시간 가격] ([전일대비]) |
| 예상 영향 | 상승/하락, 강도(상/중/하) |
| 매매 전략 | 시초가 매수 / 눌림목 매수 / 관망 |
| 목표가 | [단기 목표] |
| 손절가 | [리스크 관리] |

---
🔥 2순위: [뉴스 헤드라인]
(동일 형식)

---
🔥 3순위: [뉴스 헤드라인]
(동일 형식)

---
📊 테마별 정리

| 테마 | 관련 뉴스 | 핵심 종목 | 강도 |
|------|-----------|-----------|------|
| 정치 테마 | | | ⭐⭐⭐ |
| 실적 서프라이즈 | | | ⭐⭐ |
| 글로벌 연동 | | | ⭐⭐ |
| SNS 화제 | | | ⭐ |

---
⚠️ 주의 종목 (급락 위험)
| 종목 | 사유 | 예상 영향 |
|------|------|-----------|
| | | |

---
🎯 오늘의 단타 전략 요약
1. 최우선 관심: [종목] - [한줄 이유]
2. 차선 관심: [종목] - [한줄 이유]  
3. 시장 분위기: 강세/약세/혼조
4. 주의사항: [오늘 특별히 조심할 점]

---
📅 오늘 주요 일정
| 시간 | 이벤트 | 관련 종목 |
|------|--------|-----------|
| | | |

---
⚠️ 주가 확인 필수: 위 현재가는 Web Search로 조회한 값입니다. 
   실제 매매 전 증권사 앱에서 반드시 다시 확인하세요!

💡 Tip: 이 정보는 참고용입니다. 단타는 리스크가 높으니 손절가를 꼭 지키세요!`);
  };

  const generateRecommendPrompt = () => {
    const sector = SECTORS.find(s => s.id === recommendOpt.sector);
    const typeGuide = {
      '성장주': { filter: 'PEG 1.5 이하, 매출 CAGR 15%+, 영업이익률 개선', focus: '시장점유율 확대, 신사업 진출' },
      '가치주': { filter: 'PER 업종평균 -30%, PBR 1 미만, ROE 10%+', focus: '저평가 해소 촉매, 자산가치' },
      '배당주': { filter: '배당수익률 3%+, 배당성향 40% 이하, 10년 연속 배당', focus: 'FCF 여력, 배당 지속가능성' }
    };
    setGeneratedPrompt(`${getTimeBasedInstruction()}${sector.full} ${recommendOpt.type} 발굴

R (Role) - 역할
당신은 20년 경력의 ${sector.full} 섹터 전문 애널리스트입니다.
- CFA, 공인회계사 자격 보유
- ${sector.full} 산업 리서치 센터장 경력
- 연평균 수익률 상위 10% 달성 실적

I (Instruction) - 지시사항
다음 조건에 맞는 ${recommendOpt.count}을 발굴해주세요:

스크리닝 조건:
- 섹터: ${sector.full} (${sector.keywords})
- 투자 스타일: ${recommendOpt.type}
- 스크리닝 필터: ${typeGuide[recommendOpt.type].filter}
- 중점 분석: ${typeGuide[recommendOpt.type].focus}
- 투자 기간: ${recommendOpt.period}
- 목표 수익률: ${recommendOpt.growthRate} 이상

제외 조건:
- 최근 2년 연속 적자 기업
- 감사의견 비적정 기업
- 시가총액 1,000억 미만

C (Context) - 맥락
- 현재 시장 상황과 ${sector.full} 업황을 고려하여 분석
- 글로벌 경쟁사 대비 국내 기업의 경쟁력 평가
- 단기 모멘텀보다 ${recommendOpt.period} 관점의 구조적 성장 중시

E (Example) - 출력 형식

🏆 ${sector.full} ${recommendOpt.type} TOP ${recommendOpt.count}

---
1순위: [종목명] - [핵심 투자포인트 한 줄]

| 항목 | 내용 |
|------|------|
| 기본 정보 | 현재가, 시가총액, 52주 최고/최저 |
| 밸류에이션 | PER, PBR, ${recommendOpt.type === '배당주' ? '배당수익률' : 'PEG'} |
| 수익성 | ROE, 영업이익률, 순이익률 |
| 성장성 | 매출 CAGR(3년), 이익 CAGR(3년) |

투자 포인트:
1. [핵심 성장동력]
2. [경쟁우위/해자]
3. [실적 모멘텀]

리스크 요인:
1. [주요 위험]
2. [모니터링 포인트]

매매 전략:
- 적정가: [산출 근거 포함]
- 목표가: [+${recommendOpt.growthRate}]
- 1차 매수: [가격/비중]
- 2차 매수: [가격/비중]
- 손절가: [가격/사유]

---
(2순위 ~ ${recommendOpt.count} 동일 형식)

---
📊 종합 비교표

| 순위 | 종목 | 현재가 | 목표가 | 기대수익 | PER | ROE | 핵심 투자포인트 |
|------|------|--------|--------|----------|-----|-----|-----------------|
| 1 | | | | | | | |

🎯 최종 추천
- 가장 확신 높은 종목: [종목] - [이유]
- 리스크 대비 수익 최고: [종목] - [이유]`);
  };

  const generateDiscoveryPrompt = () => {
    if (selectedStocks.length === 0) return alert('종목을 선택해주세요!');
    const list = selectedStocks.join(', ');
    
    setGeneratedPrompt(`${getTimeBasedInstruction()}관심종목 심층 분석

R (Role) - 역할
당신은 글로벌 투자은행의 수석 리서치 애널리스트입니다.
- 10년 이상 기업 분석 경력
- 다수의 베스트 애널리스트 수상 경력
- 정량적 분석과 정성적 분석 모두 전문

I (Instruction) - 지시사항
다음 종목들을 심층 분석해주세요:
분석 대상: ${list}

🔴 필수 - 실시간 데이터 조회:
각 종목의 현재 주가, 시가총액, 52주 최고/최저가를 웹에서 실시간 조회하여 분석에 포함해주세요.

분석 항목:
1. 기업 개요 및 사업 모델
2. 현재 주가 및 밸류에이션 (실시간 조회)
3. 재무 건전성 (수익성/안정성/성장성)
4. SWOT 분석
5. 투자 매력도 평가
6. 매수/매도 타이밍 제안

C (Context) - 맥락
- 투자 기간: 6개월 ~ 1년
- 투자자 성향: 중위험 중수익 추구
- 시장 대비 초과 수익 목표

E (Example) - 출력 형식

📋 종목별 분석

---
1. [종목명]

기업 개요 (2줄)
[사업 모델, 시장 위치, 핵심 경쟁력]

핵심 지표
| 지표 | 수치 | 업종 평균 | 평가 |
|------|------|-----------|------|
| PER | | | |
| PBR | | | |
| ROE | | | |
| 부채비율 | | | |
| 매출성장률 | | | |

SWOT 분석
- S (강점): 
- W (약점): 
- O (기회): 
- T (위협): 

투자 판단
| 항목 | 평가 |
|------|------|
| 현재 밸류에이션 | 저평가 / 적정 / 고평가 |
| 적정 주가 | 원 |
| 목표 주가 (1년) | 원 (+__%) |
| 투자 매력도 | ⭐⭐⭐⭐☆ (4/5) |
| 투자 의견 | 강력매수 / 매수 / 중립 / 매도 |

---
(나머지 종목 동일 형식)

---
📊 종합 비교표

| 종목 | 평가 | 매력도 | 목표수익 | 리스크 | 추천순위 |
|------|------|--------|----------|--------|----------|
${selectedStocks.map(s => `| ${s} | | ⭐⭐⭐☆☆ | +__% | 상/중/하 | |`).join('\n')}

🏆 투자 우선순위
1. 1순위: [종목] - [핵심 이유]
2. 2순위: [종목] - [핵심 이유]
3. ...`);
  };

  const generateFundamentalPrompt = () => {
    if (selectedStocks.length === 0) return alert('종목을 선택해주세요!');
    const list = selectedStocks.join(', ');
    
    const analysisGuide = {
      '종합분석': '수익성, 안정성, 성장성을 균형있게 평가하여 기업의 전반적인 재무 건전성을 진단',
      '비교분석': '동종 업계 경쟁사들과 주요 재무지표를 비교하여 상대적 위치와 경쟁력을 평가',
      '심층분석': '5개년 재무제표 트렌드, 회계 품질, 숨겨진 리스크까지 심층적으로 분석'
    };
    
    const focusGuide = {
      'ROE': `ROE 듀퐁 분석 (DuPont Analysis)
ROE = 순이익률 × 자산회전율 × 재무레버리지

- 순이익률: 마진 관리 능력
- 자산회전율: 자산 활용 효율성  
- 재무레버리지: 부채 활용도

→ 어떤 요소가 ROE를 견인하는지 분해 분석
→ 지속가능한 ROE인지 판단
→ ROE vs ROIC 비교로 레버리지 효과 확인`,
      '안정성': `재무 안정성 심층 분석

- 부채비율 추이 (3년)
- 이자보상배율 (EBIT/이자비용) - 3배 이상 권장
- 순부채/EBITDA - 3배 이하 권장
- 유동비율/당좌비율 - 150% 이상 권장
- 현금흐름 안정성 (OCF/부채)
- 차입금 만기 구조 및 금리 민감도`,
      '성장성': `성장성 심층 분석

- 매출/영업이익/순이익 CAGR (3년, 5년)
- 분기별 YoY 성장률 추이
- 신사업/신시장 매출 비중 및 성장 기여도
- R&D 투자율 및 CAPEX 효율성
- TAM(시장규모) 대비 침투율과 성장 여력
- 경쟁사 대비 성장률 비교`
    };
    
    setGeneratedPrompt(`${getTimeBasedInstruction()}재무 분석: ${fundamentalOpt.analysisType}

R (Role) - 역할
당신은 CFA 자격을 보유한 재무분석 전문가입니다.
- Big 4 회계법인 10년 근무 경력
- 기업 실사(Due Diligence) 다수 수행
- 재무제표 분석 및 회계 품질 평가 전문

I (Instruction) - 지시사항
다음 종목의 재무 건전성을 분석해주세요:
분석 대상: ${list}

⚠️ 중요: 각 종목의 현재 주가와 최신 재무지표(PER, PBR, ROE 등)를 웹에서 실시간 조회하여 분석에 포함해주세요.

분석 유형: ${fundamentalOpt.analysisType}
${analysisGuide[fundamentalOpt.analysisType]}

중점 분석 영역: ${fundamentalOpt.focusArea}
${focusGuide[fundamentalOpt.focusArea]}

C (Context) - 맥락
- 최근 3~5년 재무제표 기반 분석
- 업종 평균 및 경쟁사 대비 상대 평가 병행
- 단순 수치보다 추세와 질적 요소 중시

E (Example) - 출력 형식

📊 재무 분석 결과

---
[종목명] 재무 분석

1. 수익성 분석 ${fundamentalOpt.focusArea === 'ROE' ? '🔍 중점' : ''}
| 지표 | 최근 | 전년 | 3년평균 | 업종평균 | 평가 |
|------|------|------|---------|----------|------|
| ROE | | | | | |
| ROA | | | | | |
| 영업이익률 | | | | | |
| 순이익률 | | | | | |

${fundamentalOpt.focusArea === 'ROE' ? `
ROE 듀퐁 분해
| 구성요소 | 수치 | 평가 |
|----------|------|------|
| 순이익률 | | |
| 자산회전율 | | |
| 재무레버리지 | | |
→ ROE 견인 요인: [분석]
` : ''}

2. 안정성 분석 ${fundamentalOpt.focusArea === '안정성' ? '🔍 중점' : ''}
| 지표 | 수치 | 기준 | 평가 |
|------|------|------|------|
| 부채비율 | | 100% 이하 | |
| 유동비율 | | 150% 이상 | |
| 이자보상배율 | | 3배 이상 | |
| 순부채/EBITDA | | 3배 이하 | |

3. 성장성 분석 ${fundamentalOpt.focusArea === '성장성' ? '🔍 중점' : ''}
| 지표 | CAGR(3년) | 최근 YoY | 업종평균 | 평가 |
|------|-----------|----------|----------|------|
| 매출 | | | | |
| 영업이익 | | | | |
| 순이익 | | | | |
| EPS | | | | |

---
📈 종합 재무 점수

| 종목 | 수익성 | 안정성 | 성장성 | 종합 | 등급 |
|------|--------|--------|--------|------|------|
${selectedStocks.map(s => `| ${s} | /30 | /30 | /40 | /100 | |`).join('\n')}

💡 투자 시사점
- 재무 우수: [종목] - [근거]
- 개선 필요: [종목] - [근거]
- 주의 필요: [종목] - [리스크 요인]`);
  };

  const generateValuationPrompt = () => {
    if (selectedStocks.length === 0) return alert('종목을 선택해주세요!');
    const list = selectedStocks.join(', ');
    
    const methodDetail = {
      '상대가치': `상대가치 평가 방법론
1. PER 기반: 적정 PER × 예상 EPS
2. PBR 기반: 적정 PBR × BPS (PBR = ROE ÷ 요구수익률)
3. EV/EBITDA 기반: 업종 평균 배수 적용
4. PSR 기반: 적자 기업 또는 고성장 기업용`,
      '절대가치': `절대가치 평가 방법론 (DCF)
1. 향후 5년 FCF 추정
2. WACC(가중평균자본비용) 산출: 8~12% 가정
3. 영구성장률 가정: 2~3% (GDP 성장률)
4. 터미널 가치 산출
5. 현재가치로 할인하여 기업가치 산출`,
      '종합': `멀티플 밸류에이션
- 상대가치(PER, PBR, EV/EBITDA)와 절대가치(DCF) 병행
- 각 방법별 적정가 산출 후 가중 평균
- 시장 상황에 따른 적정 배수 조정`
    };
    
    setGeneratedPrompt(`${getTimeBasedInstruction()}밸류에이션 분석: ${valuationOpt.method}

R (Role) - 역할
당신은 밸류에이션 전문 퀀트 애널리스트입니다.
- M&A 자문 및 기업가치 평가 전문
- DCF, 상대가치 등 다양한 밸류에이션 모델 전문
- 10년 이상 기업가치 평가 경력

I (Instruction) - 지시사항
다음 종목의 적정 주가를 산출해주세요:
분석 대상: ${list}

⚠️ 중요: 각 종목의 현재 주가, PER, PBR, EPS, BPS 등을 웹에서 실시간 조회하여 밸류에이션에 활용해주세요.

평가 방법: ${valuationOpt.method}
${methodDetail[valuationOpt.method]}

안전마진: ${valuationOpt.safetyMargin}
- 적정가 대비 ${valuationOpt.safetyMargin} 할인된 가격을 매수 목표가로 제시

C (Context) - 맥락
- 보수적 가정 하에 적정가치 산출
- 업종 특성과 성장 단계 고려
- 시장 상황(금리, 유동성) 반영

E (Example) - 출력 형식

💰 밸류에이션 분석

---
[종목명]

${valuationOpt.method === '상대가치' || valuationOpt.method === '종합' ? `
PER 기반 밸류에이션
| 항목 | 수치 | 비고 |
|------|------|------|
| 현재 PER | | |
| 3년 평균 PER | | |
| 업종 평균 PER | | |
| 적정 PER | | 근거: |
| 예상 EPS | | |
| PER 적정가 | | |

PBR 기반 밸류에이션
| 항목 | 수치 | 비고 |
|------|------|------|
| 현재 PBR | | |
| ROE | | |
| 요구수익률 | 10% | |
| 적정 PBR | | ROE ÷ 요구수익률 |
| BPS | | |
| PBR 적정가 | | |
` : ''}

${valuationOpt.method === '절대가치' || valuationOpt.method === '종합' ? `
DCF 밸류에이션
| 항목 | 가정 | 비고 |
|------|------|------|
| 예상 FCF (5년) | | |
| WACC | 9% | |
| 영구성장률 | 2% | |
| 터미널 가치 | | |
| 기업가치 | | |
| 순부채 | | |
| 주주가치 | | |
| 발행주식수 | | |
| DCF 적정가 | | |
` : ''}

종합 밸류에이션
| 방법 | 적정가 | 비중 | 가중 적정가 |
|------|--------|------|-------------|
| PER | | 40% | |
| PBR | | 30% | |
| ${valuationOpt.method === '절대가치' || valuationOpt.method === '종합' ? 'DCF' : 'EV/EBITDA'} | | 30% | |
| 가중평균 적정가 | | | |

---
📊 최종 밸류에이션 요약

| 종목 | 현재가 | 적정가 | 안전마진 적용(-${valuationOpt.safetyMargin}) | 목표가 | 상승여력 | 투자의견 |
|------|--------|--------|-------------------------------|--------|----------|----------|
${selectedStocks.map(s => `| ${s} | | | | | | |`).join('\n')}

🎯 결론
- 가장 저평가: [종목] (괴리율 __%)
- 매수 적기: [종목] - 현재가 < 안전마진 적용가
- 관망 필요: [종목] - [사유]`);
  };

  const generateTechnicalPrompt = () => {
    if (selectedStocks.length === 0) return alert('종목을 선택해주세요!');
    const list = selectedStocks.join(', ');
    
    const roleByIndicator = {
      '이동평균': `당신은 이동평균선 분석의 대가인 그랜빌(Granville) 이론 전문가입니다.
- 20년간 이동평균선 기반 매매 전략 연구
- 골든크로스/데드크로스 신호 정확도 분석 전문
- 정배열/역배열 추세 판단 전문가`,
      '모멘텀': `당신은 RSI와 MACD 개발자의 원리를 깊이 이해한 모멘텀 분석 전문가입니다.
- 웰스 와일더(RSI), 제럴드 아펠(MACD) 이론 숙지
- 다이버전스 패턴 인식 전문
- 과매수/과매도 구간 매매 전략 전문가`,
      '거래량': `당신은 거래량 분석의 대가 조셉 그랜빌(OBV 개발자) 이론 전문가입니다.
- 20년간 거래량-가격 관계 분석 연구
- 세력 수급 및 매집/분산 패턴 인식 전문
- 거래량 선행 신호 포착 전문가`
    };
    
    const instructionByIndicator = {
      '이동평균': `이동평균선 심층 분석

⚠️ 중요: 현재 주가와 5일/20일/60일/120일/200일 이동평균선 값을 웹에서 실시간 조회하여 분석해주세요.

🔴 필수 - 가격 표기 원칙:
모든 이동평균선 언급 시 반드시 구체적인 가격을 함께 표기해주세요.
예시: "5일선(72,000원)이 20일선(70,500원)을 상향 돌파"
예시: "현재가 75,000원은 60일선(68,000원) 위에서 지지받는 중"
→ 차트를 보지 않아도 숫자만으로 상황을 완전히 이해할 수 있게 해주세요.

📌 분석 포인트:

1. 그랜빌의 8가지 매매 법칙 적용
- 4가지 매수 신호 / 4가지 매도 신호 확인

2. 이평선 배열 분석
- 정배열: 5일 > 20일 > 60일 > 120일 (상승 추세)
- 역배열: 5일 < 20일 < 60일 < 120일 (하락 추세)
- 수렴 구간: 이평선들이 모이는 중 (큰 움직임 예고)

3. 골든크로스/데드크로스
- 5일선 & 20일선: 단기 신호 (빈번, 신뢰도 낮음)
- 20일선 & 60일선: 중기 신호 (적절한 빈도)
- 50일선 & 200일선: 장기 신호 (드물지만 신뢰도 높음)

4. 이격도 분석
- (현재가/이평선) × 100
- 5일 이격도: 95~105% 정상, 밖이면 과열/침체
- 20일 이격도: 90~110% 정상`,
      '모멘텀': `모멘텀 지표 심층 분석

⚠️ 중요: RSI(14), MACD(12,26,9), 스토캐스틱(14,3,3) 값을 웹에서 실시간 조회하여 분석해주세요.

🔴 필수 - 가격 표기 원칙:
지표값과 함께 해당 시점의 주가를 반드시 함께 표기해주세요.
예시: "RSI 72 (현재가 85,000원) - 과매수 구간"
예시: "MACD 골든크로스 발생 (발생 시점 주가 78,000원 → 현재 85,000원)"
예시: "하락 다이버전스: 주가 고점 90,000원 → 92,000원 상승, RSI 고점 75 → 68 하락"
→ 차트를 보지 않아도 숫자만으로 상황을 완전히 이해할 수 있게 해주세요.

📌 RSI (Relative Strength Index) 분석:
1. 기본 해석
- 70 이상: 과매수 (조정 가능성)
- 30 이하: 과매도 (반등 가능성)
- 50 기준: 상승 추세(50↑) vs 하락 추세(50↓)

2. 다이버전스 (중요!)
- 상승 다이버전스: 가격 저점↓ + RSI 저점↑ → 매수 신호
- 하락 다이버전스: 가격 고점↑ + RSI 고점↓ → 매도 신호

📌 MACD 분석:
1. MACD 크로스
- 골든크로스: MACD가 시그널선 상향 돌파 → 매수
- 데드크로스: MACD가 시그널선 하향 돌파 → 매도

2. 제로라인 돌파
- 0 상향 돌파: 중기 상승 전환
- 0 하향 돌파: 중기 하락 전환

3. 히스토그램 분석
- 히스토그램 증가: 모멘텀 강화
- 히스토그램 감소: 모멘텀 약화

📌 스토캐스틱 분석:
- %K가 %D 상향 돌파 (20 이하): 매수 신호
- %K가 %D 하향 돌파 (80 이상): 매도 신호`,
      '거래량': `거래량 심층 분석

⚠️ 중요: 일별 거래량, 거래량 이동평균(20일), OBV 값을 웹에서 실시간 조회하여 분석해주세요.

🔴 필수 - 가격 표기 원칙:
거래량 분석 시 해당 시점의 주가를 반드시 함께 표기해주세요.
예시: "거래량 급증 (평소 대비 300%) + 주가 75,000원 → 82,000원 상승"
예시: "OBV 상승 중이나 주가 68,000원~70,000원 박스권 횡보 → 매집 신호"
예시: "대량 거래 발생일: 1월 15일 (주가 72,000원, 거래량 500만주)"
→ 차트를 보지 않아도 숫자만으로 상황을 완전히 이해할 수 있게 해주세요.

📌 거래량-가격 관계 분석:

1. 거래량 4가지 패턴
- 가격↑ + 거래량↑: 건전한 상승 (추세 지속)
- 가격↑ + 거래량↓: 약한 상승 (반전 주의)
- 가격↓ + 거래량↑: 강한 하락 (투매)
- 가격↓ + 거래량↓: 약한 하락 (바닥 근접 가능)

2. OBV (On Balance Volume) 분석
- OBV 상승 + 가격 횡보: 매집 (상승 예고)
- OBV 하락 + 가격 횡보: 분산 (하락 예고)
- OBV-가격 다이버전스 확인

3. 거래량 이동평균 분석
- 현재 거래량 vs 20일 평균 거래량
- 150% 이상: 거래량 급증 (관심 증가)
- 50% 이하: 거래량 급감 (관심 감소)

4. 세력 수급 분석
- 대량 매집 패턴: 하락 중 거래량↑ + 긴 아래꼬리
- 대량 분산 패턴: 상승 중 거래량↑ + 긴 위꼬리`
    };
    
    const outputByIndicator = {
      '이동평균': `📊 이동평균선 심층 분석 결과

---
[종목명] (${technicalOpt.timeframe} 기준)

📍 현재가: ￦______ (반드시 조회한 실제 가격 기재)

1. 이동평균선 현황 (모든 가격 필수 기재)
| 이평선 | 현재 가격 | 현재가 위치 | 이격도 | 상태 |
|--------|-----------|-------------|--------|------|
| 5일선 | ￦______ | 위/아래 | __% | |
| 20일선 | ￦______ | 위/아래 | __% | |
| 60일선 | ￦______ | 위/아래 | __% | |
| 120일선 | ￦______ | 위/아래 | __% | |
| 200일선 | ￦______ | 위/아래 | __% | |

2. 배열 상태 분석
| 항목 | 상태 | 의미 |
|------|------|------|
| 현재 배열 | 정배열/역배열/혼조 | |
| 배열 강도 | 강함/보통/약함 | |
| 수렴/발산 | 수렴 중/발산 중 | |

📝 배열 요약 (가격 포함):
"현재가 ￦______은 5일선(￦______) > 20일선(￦______) > 60일선(￦______) 정배열 상태에서 5일선 위에 위치"

3. 크로스 신호 분석
| 크로스 유형 | 발생일 | 발생 가격 | 현재 유효성 |
|-------------|--------|-----------|-------------|
| 5일-20일 | | ￦______ | 유효/소멸 |
| 20일-60일 | | ￦______ | 유효/소멸 |
| 50일-200일 | | ￦______ | 유효/소멸 |

📝 크로스 요약 (가격 포함):
"5일선(￦______)이 20일선(￦______)을 ○월 ○일 상향 돌파 (골든크로스)"

4. 그랜빌 8법칙 현재 위치
| 법칙 | 상태 | 매매 신호 |
|------|------|-----------|
| 매수1: 이평선 상향돌파 | 해당/비해당 | |
| 매수2: 눌림목 | 해당/비해당 | |
| 매수3: 이평선 지지 | 해당/비해당 | |
| 매수4: 급락 후 이격 | 해당/비해당 | |
| 매도1: 이평선 하향돌파 | 해당/비해당 | |
| 매도2: 반등 후 재하락 | 해당/비해당 | |
| 매도3: 이평선 저항 | 해당/비해당 | |
| 매도4: 급등 후 이격 | 해당/비해당 | |

---
🎯 이동평균 기반 매매 전략

| 종목 | 현재가 | 배열 | 주요 지지선 | 주요 저항선 | 매매 판단 | 목표가 | 손절가 |
|------|--------|------|-------------|-------------|-----------|--------|--------|
${selectedStocks.map(s => `| ${s} | ￦______ | 정/역배열 | ￦______(○일선) | ￦______(○일선) | 매수/매도/관망 | ￦______ | ￦______ |`).join('\n')}

📝 최종 요약 (문장으로):
"[종목명] 현재가 ￦______은 20일선(￦______)을 지지선으로, 60일선(￦______) 위에서 정배열 상승 추세 유지 중.
단기 목표가 ￦______, 손절가 ￦______(20일선 이탈 시)."`,

      '모멘텀': `📈 모멘텀 지표 심층 분석 결과

---
[종목명] (${technicalOpt.timeframe} 기준)

📍 현재가: ￦______ (반드시 조회한 실제 가격 기재)

1. RSI (14) 분석
| 항목 | 값 | 해당 시점 주가 | 해석 |
|------|-----|---------------|------|
| 현재 RSI | __ | ￦______ | 과매수/중립/과매도 |
| 이전 고점 RSI | __ | ￦______ | (다이버전스 확인용) |
| 이전 저점 RSI | __ | ￦______ | (다이버전스 확인용) |
| RSI 추세 | 상승/하락/횡보 | | |

📌 RSI 다이버전스 (가격 필수 포함)
| 유형 | 발생 여부 | 가격 변화 | RSI 변화 | 신호 |
|------|-----------|-----------|----------|------|
| 상승 다이버전스 | 발생/미발생 | ￦______ → ￦______ (↓) | __ → __ (↑) | 매수 |
| 하락 다이버전스 | 발생/미발생 | ￦______ → ￦______ (↑) | __ → __ (↓) | 매도 |

2. MACD (12, 26, 9) 분석
| 항목 | 값 | 해석 |
|------|-----|------|
| MACD 선 | __ | |
| 시그널 선 | __ | |
| 히스토그램 | __ | 양수/음수 |
| 제로라인 위치 | 위/아래 | |

📌 MACD 신호 (가격 필수 포함)
| 신호 유형 | 상태 | 발생일 | 발생 시 주가 | 현재가 | 강도 |
|-----------|------|--------|-------------|--------|------|
| 골든크로스 | 발생/미발생 | | ￦______ | ￦______ | 강/중/약 |
| 데드크로스 | 발생/미발생 | | ￦______ | ￦______ | 강/중/약 |
| 제로라인 돌파 | 상향/하향/- | | ￦______ | | |
| 다이버전스 | 발생/미발생 | | | | |

3. 스토캐스틱 (14, 3, 3) 분석
| 항목 | 값 | 해석 |
|------|-----|------|
| %K | __ | |
| %D | __ | |
| 위치 | 과매수/중립/과매도 | 80↑ 과매수, 20↓ 과매도 |

📌 스토캐스틱 신호
| 신호 | 상태 | 발생 시 주가 | 신뢰도 |
|------|------|-------------|--------|
| %K > %D (상향돌파) | 발생/미발생 | ￦______ | |
| %K < %D (하향돌파) | 발생/미발생 | ￦______ | |
| 20 이하 상향반전 | 발생/미발생 | ￦______ | 높음 |
| 80 이상 하향반전 | 발생/미발생 | ￦______ | 높음 |

---
🎯 모멘텀 종합 판단

| 종목 | 현재가 | RSI | MACD | 스토캐스틱 | 종합 신호 | 신뢰도 |
|------|--------|-----|------|------------|-----------|--------|
${selectedStocks.map(s => `| ${s} | ￦______ | __/100 | +/- | __/100 | 매수/매도/관망 | 높음/중간/낮음 |`).join('\n')}

📝 최종 요약 (문장으로):
"[종목명] 현재가 ￦______에서 RSI __로 과매수/과매도 구간.
MACD 골든크로스가 ￦______에서 발생 후 현재 ￦______까지 상승.
단기 조정 시 ￦______ 부근 매수 기회."

💡 다이버전스 경고
- [발생 종목 및 상세 설명 - 가격 포함]`,

      '거래량': `📊 거래량 심층 분석 결과

---
[종목명] (${technicalOpt.timeframe} 기준)

📍 현재가: ￦______ (반드시 조회한 실제 가격 기재)

1. 거래량 현황
| 항목 | 값 | 비교 |
|------|-----|------|
| 오늘 거래량 | __주 | |
| 20일 평균 | __주 | |
| 거래량 비율 | __% | 평균 대비 |
| 거래대금 | __억원 | |

2. 거래량-가격 패턴 분석 (가격 필수 포함)
| 최근 5일 | 종가 | 가격 변동 | 거래량 | 패턴 | 의미 |
|----------|------|-----------|--------|------|------|
| D-4 | ￦______ | +/-__% | __주 | | |
| D-3 | ￦______ | +/-__% | __주 | | |
| D-2 | ￦______ | +/-__% | __주 | | |
| D-1 | ￦______ | +/-__% | __주 | | |
| Today | ￦______ | +/-__% | __주 | | |

📌 패턴 해석:
| 패턴 | 발생 여부 | 발생 시 가격대 | 의미 |
|------|-----------|---------------|------|
| 상승 + 거래량↑ | 해당/비해당 | ￦______~￦______ | 건전한 상승, 추세 지속 |
| 상승 + 거래량↓ | 해당/비해당 | ￦______~￦______ | 약한 상승, 반전 주의 |
| 하락 + 거래량↑ | 해당/비해당 | ￦______~￦______ | 강한 매도세, 투매 |
| 하락 + 거래량↓ | 해당/비해당 | ￦______~￦______ | 매도세 약화, 바닥 근접 |

3. OBV (On Balance Volume) 분석
| 항목 | 상태 | 해당 기간 가격 범위 | 해석 |
|------|------|-------------------|------|
| OBV 추세 | 상승/하락/횡보 | ￦______~￦______ | |
| 가격 추세 | 상승/하락/횡보 | ￦______~￦______ | |
| OBV-가격 관계 | 동행/다이버전스 | | |

📌 OBV 다이버전스 (가격 필수 포함)
| 유형 | 발생 여부 | 가격 범위 | 의미 |
|------|-----------|-----------|------|
| 가격↓ but OBV↑ | 발생/미발생 | ￦______ → ￦______ | 매집 중 (상승 예고) |
| 가격↑ but OBV↓ | 발생/미발생 | ￦______ → ￦______ | 분산 중 (하락 예고) |

4. 세력 수급 패턴
| 패턴 | 발생 여부 | 발생 가격대 | 상세 |
|------|-----------|-------------|------|
| 매집 신호 | 감지/미감지 | ￦______ 부근 | 하락 중 거래량↑ + 긴 아래꼬리 |
| 분산 신호 | 감지/미감지 | ￦______ 부근 | 상승 중 거래량↑ + 긴 위꼬리 |
| 거래량 바닥 | 감지/미감지 | ￦______ 부근 | 극도로 적은 거래량 후 증가 |

---
🎯 거래량 기반 판단

| 종목 | 현재가 | 거래량 추세 | OBV 신호 | 세력 동향 | 매매 판단 | 주요 가격대 |
|------|--------|-------------|----------|-----------|-----------|-------------|
${selectedStocks.map(s => `| ${s} | ￦______ | 증가/감소/보합 | 매집/분산/중립 | | 매수/매도/관망 | 지지 ￦______ / 저항 ￦______ |`).join('\n')}

📝 최종 요약 (문장으로):
"[종목명] 현재가 ￦______에서 거래량 평균 대비 __% 수준.
OBV 상승 중이나 주가 ￦______~￦______ 박스권 횡보 → 매집 가능성.
￦______ 돌파 시 상승 추세 전환 기대, 손절가 ￦______."

💡 핵심 인사이트
- 거래량 급증 종목: [종목] (￦______) - [이유]
- 세력 매집 의심: [종목] (￦______~￦______ 구간) - [근거]`
    };
    
    setGeneratedPrompt(`${getTimeBasedInstruction()}기술적 분석: ${technicalOpt.indicator}

R (Role) - 역할
${roleByIndicator[technicalOpt.indicator]}

I (Instruction) - 지시사항
다음 종목의 기술적 분석을 수행해주세요:
분석 대상: ${list}

${instructionByIndicator[technicalOpt.indicator]}

C (Context) - 맥락
- 타임프레임: ${technicalOpt.timeframe}
- 패턴 분석: ${technicalOpt.pattern}
- 현재 시장 추세와 연계 분석
- 매매 타이밍 포착에 집중

E (Example) - 출력 형식

${outputByIndicator[technicalOpt.indicator]}`);
  };

  const generateQualitativePrompt = () => {
    if (selectedStocks.length === 0) return alert('종목을 선택해주세요!');
    const list = selectedStocks.join(', ');
    
    const roleByFocus = {
      '경쟁우위': `당신은 워런 버핏의 "경제적 해자(Moat)" 분석 방법론을 전문으로 하는 기업 전략 컨설턴트입니다.
- 20년간 기업 경쟁우위 분석 전문
- 모닝스타 경제적 해자 평가 방법론 숙지
- 장기 경쟁력 평가 및 산업 분석 전문`,
      '경영진': `당신은 CEO/경영진 평가를 전문으로 하는 헤드헌터 출신 기업 분석가입니다.
- Fortune 500 기업 경영진 평가 다수 수행
- 경영진 트랙레코드 및 자본배분 능력 분석 전문
- 지배구조 및 주주가치 창출 평가 전문`,
      'ESG': `당신은 글로벌 ESG 평가기관 출신의 지속가능경영 전문가입니다.
- MSCI ESG, Sustainalytics 평가 방법론 숙지
- 기후변화 리스크 및 사회적 책임 분석 전문
- 지배구조 및 이사회 독립성 평가 전문`
    };
    
    const instructionByFocus = {
      '경쟁우위': `경제적 해자(Moat) 심층 분석

⚠️ 중요: 각 종목의 시장점유율, 경쟁사 현황, 특허/라이선스 정보를 웹에서 실시간 조회하여 분석해주세요.

📌 5가지 해자 유형별 심층 분석:

1. 브랜드 파워 (Brand)
- 가격 프리미엄 책정 능력 (경쟁사 대비 몇 % 비싸게 팔 수 있는가?)
- 브랜드 인지도 및 선호도 순위
- 고객 충성도 지표 (재구매율, NPS)

2. 전환비용 (Switching Cost)
- 고객이 경쟁사로 이탈 시 발생하는 비용/불편함
- 데이터/학습곡선/통합비용 등 이탈 장벽
- 실제 고객 이탈률 데이터

3. 네트워크 효과 (Network Effect)
- 사용자 증가 → 서비스 가치 증가 여부
- 양면 시장(플랫폼) 효과 존재 여부
- 네트워크 규모와 성장률

4. 원가 우위 (Cost Advantage)
- 규모의 경제: 생산량 대비 원가 구조
- 위치 우위: 물류/원재료 접근성
- 공정 혁신: 독자적 생산 기술

5. 무형자산 (Intangible Assets)
- 특허 포트폴리오 (개수, 핵심 특허, 만료 시점)
- 라이선스/인허가 (규제 장벽)
- 영업 비밀/노하우`,
      '경영진': `경영진 심층 평가

⚠️ 중요: CEO 및 핵심 경영진의 프로필, 지분율, 과거 실적, 최근 인터뷰/발언을 웹에서 실시간 조회하여 분석해주세요.

📌 5가지 경영진 평가 기준:

1. 실적 달성력 (Track Record)
- 최근 3년 가이던스 vs 실제 실적 비교
- 약속 이행률 (발표한 계획의 실현 여부)
- 위기 상황 대처 능력

2. 자본배분 능력 (Capital Allocation)
- ROIC vs WACC 비교 (가치 창출 여부)
- M&A 성과 (인수 후 시너지 실현)
- 투자 의사결정의 합리성

3. 주주친화성 (Shareholder Friendly)
- 배당 정책 (배당성향, 배당 성장률)
- 자사주 매입 이력 및 규모
- 소액주주 권익 보호

4. 스킨인더게임 (Skin in the Game)
- CEO/경영진 지분율 (%)
- 스톡옵션 vs 직접 매수 비율
- 최근 내부자 거래 동향

5. 커뮤니케이션 (Transparency)
- IR 품질 및 접근성
- 실적발표 컨퍼런스콜 품질
- 위기 시 소통 방식`,
      'ESG': `ESG 심층 평가

⚠️ 중요: MSCI ESG 등급, CDP 점수, 지속가능경영보고서, 최근 ESG 관련 뉴스를 웹에서 실시간 조회하여 분석해주세요.

📌 ESG 3개 영역 세부 분석:

🌱 E (환경) - Environmental
- 탄소배출량 및 감축 목표 (Scope 1, 2, 3)
- 재생에너지 사용 비율 및 RE100 가입 여부
- 친환경 제품/서비스 매출 비중
- 환경 규제 위반 이력
- 기후변화 리스크 노출도

👥 S (사회) - Social
- 산업재해율 및 근로환경 지표
- 다양성 지표 (여성 임원 비율, 장애인 고용)
- 공급망 관리 (협력사 ESG 평가)
- 지역사회 기여 및 사회공헌
- 제품 안전성 및 고객 데이터 보호

🏛️ G (지배구조) - Governance
- 이사회 독립성 (사외이사 비율)
- 이사회 다양성 (여성, 전문성)
- 경영진 보상 체계의 적정성
- 소수주주 보호 장치
- 감사 품질 및 회계 투명성`
    };
    
    const outputByFocus = {
      '경쟁우위': `🏰 경제적 해자 심층 분석 결과

---
[종목명]

1. 해자 유형별 상세 평가
| 해자 유형 | 보유 | 강도 | 지속성 | 상세 근거 |
|-----------|------|------|--------|-----------|
| 🏷️ 브랜드 파워 | ○/△/✕ | 강/중/약 | __년 | 가격 프리미엄 __%, 시장 인지도 __위 |
| 🔄 전환비용 | ○/△/✕ | 강/중/약 | __년 | 고객 이탈률 __%, 전환 시 비용 __ |
| 🌐 네트워크 효과 | ○/△/✕ | 강/중/약 | __년 | 사용자 수 __, 성장률 __% |
| 💰 원가 우위 | ○/△/✕ | 강/중/약 | __년 | 경쟁사 대비 원가 __% 낮음 |
| 📜 무형자산 | ○/△/✕ | 강/중/약 | __년 | 특허 __건, 핵심 특허 만료 __년 |

2. 해자 강도 종합 평가
| 항목 | 점수 | 설명 |
|------|------|------|
| 해자 넓이 (Moat Width) | /10 | 경쟁자 진입 난이도 |
| 해자 깊이 (Moat Depth) | /10 | 초과수익 크기 |
| 해자 지속성 (Moat Stability) | /10 | 향후 유지 가능성 |
| 해자 추세 (Moat Trend) | 확대/유지/축소 | 최근 변화 방향 |

3. 경쟁 구도 분석
| 경쟁사 | 시장점유율 | 주요 해자 | 위협 수준 |
|--------|------------|-----------|-----------|
| [경쟁사1] | __% | | 상/중/하 |
| [경쟁사2] | __% | | 상/중/하 |

---
🏆 해자 종합 등급

| 종목 | 해자 점수 | 등급 | 투자 관점 |
|------|-----------|------|-----------|
${selectedStocks.map(s => `| ${s} | /30 | Wide/Narrow/None | 장기투자 적합/보통/부적합 |`).join('\n')}

💡 핵심 인사이트
- 가장 강력한 해자: [종목] - [해자 유형]
- 해자 확대 중: [종목] - [이유]
- 해자 위협 요인: [종목] - [위협 요인]`,

      '경영진': `👔 경영진 심층 평가 결과

---
[종목명]

1. CEO/핵심 경영진 프로필
| 직책 | 성명 | 취임일 | 경력 | 지분율 |
|------|------|--------|------|--------|
| CEO | | | | __% |
| CFO | | | | __% |
| 기타 핵심 | | | | __% |

2. 실적 달성력 (Track Record)
| 연도 | 가이던스 | 실제 실적 | 달성률 | 평가 |
|------|----------|-----------|--------|------|
| 2023 | | | __% | ○/△/✕ |
| 2024 | | | __% | ○/△/✕ |
| 2025E | | | - | - |

3. 자본배분 능력
| 항목 | 수치 | 평가 | 근거 |
|------|------|------|------|
| ROIC vs WACC | __% vs __% | 가치창출/파괴 | |
| M&A 성과 | | 성공/실패 | |
| R&D 효율성 | | 상/중/하 | |

4. 주주친화 정책
| 항목 | 최근 3년 | 업종 평균 | 평가 |
|------|----------|-----------|------|
| 배당성향 | __% | __% | |
| 배당성장률 | __% | __% | |
| 자사주 매입 | __억원 | | |
| 총주주환원율 | __% | __% | |

5. 내부자 거래 동향
| 기간 | 매수 | 매도 | 순매수 | 시그널 |
|------|------|------|--------|--------|
| 최근 3개월 | | | | 긍정/중립/부정 |
| 최근 1년 | | | | 긍정/중립/부정 |

---
👔 경영진 종합 평가

| 종목 | 실적달성 | 자본배분 | 주주친화 | 지분율 | 종합 | 등급 |
|------|----------|----------|----------|--------|------|------|
${selectedStocks.map(s => `| ${s} | /20 | /20 | /20 | /20 | /80 | A/B/C/D |`).join('\n')}

💡 핵심 인사이트
- 최고 경영진: [종목] - [강점]
- 주의 필요: [종목] - [우려 사항]
- 내부자 매수 신호: [종목] - [상세]`,

      'ESG': `🌍 ESG 심층 평가 결과

---
[종목명]

1. 🌱 환경 (Environmental) 상세
| 항목 | 현재 | 목표 | 업종평균 | 평가 |
|------|------|------|----------|------|
| 탄소배출량 (tCO2e) | | | | |
| 탄소감축률 (YoY) | __% | __% | __% | ○/△/✕ |
| 재생에너지 비율 | __% | __% | __% | ○/△/✕ |
| RE100 가입 | 가입/미가입 | | | |
| 환경투자 규모 | __억원 | | | |
| 환경 규제 위반 | __건 | 0건 | | ○/△/✕ |

2. 👥 사회 (Social) 상세
| 항목 | 현재 | 목표 | 업종평균 | 평가 |
|------|------|------|----------|------|
| 산업재해율 | __% | __% | __% | ○/△/✕ |
| 여성 임원 비율 | __% | __% | __% | ○/△/✕ |
| 협력사 ESG 평가 | 시행/미시행 | | | |
| 정보보안 사고 | __건 | 0건 | | ○/△/✕ |
| 사회공헌 지출 | __억원 | | | |

3. 🏛️ 지배구조 (Governance) 상세
| 항목 | 현재 | 권고 기준 | 평가 |
|------|------|-----------|------|
| 사외이사 비율 | __% | 50% 이상 | ○/△/✕ |
| 이사회 다양성 | | | ○/△/✕ |
| 감사위원회 독립성 | 독립/비독립 | 독립 | ○/△/✕ |
| 경영진 보상 연계 | ESG연계/미연계 | ESG연계 | ○/△/✕ |
| 소수주주 보호 | | | ○/△/✕ |

4. ESG 등급 비교
| 평가기관 | 등급 | 업종 내 순위 | 변동 |
|----------|------|--------------|------|
| MSCI ESG | | __위/__개사 | ↑/→/↓ |
| Sustainalytics | | 리스크 __점 | ↑/→/↓ |
| CDP (기후) | | | ↑/→/↓ |
| KCGS (한국) | | | ↑/→/↓ |

---
🌍 ESG 종합 평가

| 종목 | E 환경 | S 사회 | G 지배구조 | 종합 | 등급 | ESG 리스크 |
|------|--------|--------|------------|------|------|------------|
${selectedStocks.map(s => `| ${s} | /30 | /30 | /30 | /90 | A/B/C/D | 높음/중간/낮음 |`).join('\n')}

💡 핵심 인사이트
- ESG 우수: [종목] - [강점 영역]
- 개선 필요: [종목] - [취약 영역]
- ESG 모멘텀: [종목] - [최근 개선/악화 사항]`
    };
    
    setGeneratedPrompt(`${getTimeBasedInstruction()}질적 분석: ${qualitativeOpt.focus}

R (Role) - 역할
${roleByFocus[qualitativeOpt.focus]}

I (Instruction) - 지시사항
다음 종목을 분석해주세요:
분석 대상: ${list}

${instructionByFocus[qualitativeOpt.focus]}

C (Context) - 맥락
- 재무제표에 나타나지 않는 질적 가치 평가
- 장기 경쟁력과 지속가능성 관점
- 숫자 이면의 비즈니스 본질 분석

E (Example) - 출력 형식

${outputByFocus[qualitativeOpt.focus]}`);
  };

  const generateRiskPrompt = () => {
    if (selectedStocks.length === 0) return alert('종목을 선택해주세요!');
    const list = selectedStocks.join(', ');
    
    const scenarioByType = {
      '3가지': {
        guide: `3가지 시나리오 (표준)
- Bull (낙관) 20%: 모든 것이 잘 풀릴 때
- Base (기본) 50%: 가장 현실적인 경우
- Bear (비관) 30%: 최악의 상황`,
        output: `| 시나리오 | 확률 | 목표가 | 수익률 | 핵심 조건 |
|----------|------|--------|--------|-----------|
| 🐂 Bull (낙관) | 20% | ￦__ | +__% | |
| 📈 Base (기본) | 50% | ￦__ | +__% | |
| 🐻 Bear (비관) | 30% | ￦__ | -__% | |

📌 기대수익률 계산:
= (0.2 × Bull수익률) + (0.5 × Base수익률) + (0.3 × Bear수익률)
= ___%`
      },
      '5가지': {
        guide: `5가지 시나리오 (상세)
- Strong Bull (극낙관) 10%: 예상 못한 호재 발생
- Bull (낙관) 20%: 긍정적 상황 전개
- Base (기본) 40%: 가장 현실적인 경우
- Bear (비관) 20%: 부정적 상황 전개
- Strong Bear (극비관) 10%: 예상 못한 악재 발생`,
        output: `| 시나리오 | 확률 | 목표가 | 수익률 | 핵심 조건 |
|----------|------|--------|--------|-----------|
| 🚀 Strong Bull | 10% | ￦__ | +__% | 예상 못한 호재 (M&A, 대형계약 등) |
| 🐂 Bull (낙관) | 20% | ￦__ | +__% | 실적 서프라이즈, 업황 호조 |
| 📈 Base (기본) | 40% | ￦__ | +__% | 현 추세 유지 |
| 🐻 Bear (비관) | 20% | ￦__ | -__% | 실적 부진, 경쟁 심화 |
| 💀 Strong Bear | 10% | ￦__ | -__% | 예상 못한 악재 (소송, 규제 등) |

📌 기대수익률 계산:
= (0.1 × S.Bull) + (0.2 × Bull) + (0.4 × Base) + (0.2 × Bear) + (0.1 × S.Bear)
= ___%

📌 최대 예상 손실 (VaR 관점):
- 90% 신뢰구간: Bear 시나리오 = -__% 
- 99% 신뢰구간: Strong Bear = -__%`
      },
      '7가지': {
        guide: `7가지 시나리오 (정밀 분석)
- Extreme Bull (5%): 블랙스완 호재
- Strong Bull (10%): 예상 못한 호재
- Bull (20%): 긍정적 상황
- Base (30%): 현실적 기본 시나리오
- Bear (20%): 부정적 상황
- Strong Bear (10%): 예상 못한 악재
- Extreme Bear (5%): 블랙스완 악재`,
        output: `| 시나리오 | 확률 | 목표가 | 수익률 | 핵심 조건 |
|----------|------|--------|--------|-----------|
| ⭐ Extreme Bull | 5% | ￦__ | +__% | 블랙스완 호재 |
| 🚀 Strong Bull | 10% | ￦__ | +__% | 예상 못한 호재 |
| 🐂 Bull | 20% | ￦__ | +__% | 긍정적 전개 |
| 📈 Base | 30% | ￦__ | +__% | 현 추세 유지 |
| 🐻 Bear | 20% | ￦__ | -__% | 부정적 전개 |
| 💀 Strong Bear | 10% | ￦__ | -__% | 예상 못한 악재 |
| ☠️ Extreme Bear | 5% | ￦__ | -__% | 블랙스완 악재 |

📌 기대수익률 계산:
= Σ(확률 × 수익률)
= ___%

📌 테일 리스크 분석:
- Upside Tail (5%): +__% 이상 가능
- Downside Tail (5%): -__% 이하 가능
- 테일 리스크 비율: __:__`
      }
    };
    
    setGeneratedPrompt(`${getTimeBasedInstruction()}리스크 분석 & 시나리오

R (Role) - 역할
당신은 글로벌 자산운용사의 CRO(최고리스크책임자)입니다.
- 20년간 리스크 관리 및 포트폴리오 헤지 전문
- 시나리오 분석 및 스트레스 테스트 경력
- Monte Carlo 시뮬레이션 및 VaR 모델링 전문

I (Instruction) - 지시사항
다음 종목의 투자 리스크를 분석해주세요:
분석 대상: ${list}

🔴 필수 - 실시간 데이터 조회:
각 종목의 현재 주가, 52주 변동폭, 베타값, 최근 뉴스를 웹에서 실시간 조회하여 리스크 분석에 활용해주세요.

📌 분석 조건:
- 시나리오 수: ${riskOpt.scenario}
- 손절 기준: -${riskOpt.stopLoss}

${scenarioByType[riskOpt.scenario].guide}

📌 리스크 유형 분석:
1. 기업 고유 리스크 (실적, 경쟁, 규제, 재무, 키맨)
2. 섹터/산업 리스크 (업황, 사이클, 기술 변화)
3. 매크로 리스크 (금리, 환율, 경기, 지정학)

C (Context) - 맥락
- 최악의 시나리오까지 고려한 보수적 분석
- 리스크 대비 수익 관점의 평가
- 실행 가능한 리스크 관리 전략 제시
- 투자 결정의 핵심: 기대수익률 vs 감수할 리스크

E (Example) - 출력 형식

⚠️ 리스크 분석 결과

---
[종목명] 리스크 프로파일

1. 변동성 지표
| 지표 | 값 | 해석 |
|------|-----|------|
| 52주 변동폭 | ￦__ ~ ￦__ | 최저 대비 __%  |
| 베타 (β) | __ | 시장 대비 변동성 |
| 표준편차 (연환산) | __% | |
| 최대 낙폭 (MDD) | -__% | 과거 1년 기준 |

2. 기업 고유 리스크
| 리스크 유형 | 수준 | 상세 내용 | 발생 확률 | 영향도 |
|-------------|------|-----------|-----------|--------|
| 📊 실적 리스크 | 상/중/하 | | __% | 상/중/하 |
| ⚔️ 경쟁 리스크 | 상/중/하 | | __% | 상/중/하 |
| ⚖️ 규제 리스크 | 상/중/하 | | __% | 상/중/하 |
| 💰 재무 리스크 | 상/중/하 | | __% | 상/중/하 |
| 👔 키맨 리스크 | 상/중/하 | | __% | 상/중/하 |

3. 시나리오 분석 (${riskOpt.scenario})

${scenarioByType[riskOpt.scenario].output}

4. 손익 관리 전략
| 구분 | 가격 | 현재가 대비 | 조건 |
|------|------|-------------|------|
| 현재가 | ￦__ | - | - |
| 손절가 | ￦__ | -${riskOpt.stopLoss} | 이탈 시 즉시 매도 |
| 1차 익절 | ￦__ | +15% | 50% 물량 매도 |
| 2차 익절 | ￦__ | +30% | 30% 추가 매도 |
| 전량 익절 | ￦__ | 목표가 | 잔여 20% 매도 |

---
📊 리스크 종합 평가

| 종목 | 종합리스크 | 베타 | 최대손실 | 기대수익 | Risk/Reward | 투자등급 |
|------|------------|------|----------|----------|-------------|----------|
${selectedStocks.map(s => `| ${s} | 상/중/하 | __ | -__% | +__% | __:1 | 공격/중립/방어 |`).join('\n')}

🎯 투자 판단 가이드
"기대수익률 __% vs 최대손실 __%"
→ Risk/Reward = __:1
→ 일반적으로 2:1 이상이면 투자 고려, 3:1 이상이면 적극 검토

🛡️ 리스크 관리 권고
- 적정 비중: [종목별 추천 포트폴리오 비중]
- 헤지 전략: [종목별 헤지 방안]
- 모니터링: [주의 깊게 봐야 할 지표]`);
  };

  const generatePortfolioPrompt = () => {
    if (selectedStocks.length === 0) return alert('종목을 선택해주세요!');
    const list = selectedStocks.join(', ');
    
    const strategyGuide = {
      '균등분산': '모든 종목에 동일 비중 배분 → 리스크 분산 극대화, 개별 종목 리스크 최소화',
      '차등배분': '확신도/매력도에 따라 비중 차등 (핵심 35~40%, 주력 20~25%, 관망 10~15%)',
      '집중투자': '상위 2~3개 종목에 60% 이상 집중 → 고확신 전략, 높은 집중 리스크'
    };
    
    setGeneratedPrompt(`${getTimeBasedInstruction()}포트폴리오 구성 전략

R (Role) - 역할
당신은 프라이빗 뱅커 출신의 포트폴리오 매니저입니다.
- 자산배분 및 포트폴리오 최적화 전문
- 리밸런싱 및 리스크 관리 전략 전문
- 개인 투자자 맞춤 자산관리 경력 10년

I (Instruction) - 지시사항
다음 종목으로 포트폴리오를 구성해주세요:
구성 종목: ${list}

🔴 필수 - 실시간 데이터 조회:
각 종목의 현재 주가를 웹에서 실시간 조회하여 실제 매수 가능 수량과 금액을 계산해주세요.

포트폴리오 조건:
- 총 투자금: ${portfolioOpt.totalAmount}
- 종목 수: ${selectedStocks.length}개
- 배분 전략: ${portfolioOpt.strategy}

${portfolioOpt.strategy} 전략:
${strategyGuide[portfolioOpt.strategy]}

C (Context) - 맥락
- 분산투자를 통한 리스크 관리
- 섹터/스타일 균형 고려
- 시장 상황에 맞는 현금 비중 확보

E (Example) - 출력 형식

💼 포트폴리오 구성안

1. 종목별 투자 점수
| 종목 | 매력도 | 리스크 | 확신도 | 종합점수 |
|------|--------|--------|--------|----------|
${selectedStocks.map(s => `| ${s} | /30 | /30 | /40 | /100 |`).join('\n')}

2. 비중 배분
| 순위 | 종목 | 역할 | 비중 | 투자금 | 매수가 | 목표가 |
|------|------|------|------|--------|--------|--------|
${selectedStocks.map((s, i) => `| ${i+1} | ${s} | 핵심/주력/위성 | __% | | | |`).join('\n')}
| | 현금 | 예비자금 | __% | | - | - |
| | 합계 | | 100% | ${portfolioOpt.totalAmount} | | |

3. 섹터 분산
| 섹터 | 종목 | 비중 |
|------|------|------|
| | | |

4. 분할 매수 전략
| 단계 | 비중 | 조건 | 예상 시점 |
|------|------|------|-----------|
| 1차 | 50% | 즉시 매수 | 현재 |
| 2차 | 30% | -5% 조정 시 | |
| 3차 | 20% | -10% 급락 시 | |

5. 리밸런싱 규칙
- 주기: 분기 1회 점검
- 조건: 목표 비중 ±5%p 이탈 시 조정
- 익절: 목표가 도달 시 비중 축소

---
📈 기대 수익 시나리오

| 시나리오 | 확률 | 수익률 | 예상 금액 |
|----------|------|--------|-----------|
| 낙관 | 20% | +__% | ${portfolioOpt.totalAmount} → |
| 기본 | 50% | +__% | ${portfolioOpt.totalAmount} → |
| 비관 | 30% | -__% | ${portfolioOpt.totalAmount} → |
| 기대값 | | +__% | |

✅ 실행 체크리스트
1. [ ] 1차 매수 실행
2. [ ] 손절가 설정
3. [ ] 목표가 알림 설정
4. [ ] 리밸런싱 일정 캘린더 등록`);
  };

  const generateEtfPrompt = () => {
    if (selectedStocks.length === 0) return alert('ETF를 선택해주세요!');
    const list = selectedStocks.join(', ');
    
    setGeneratedPrompt(`${getTimeBasedInstruction()}ETF 분석 & 포트폴리오

R (Role) - 역할
당신은 ETF 전문 투자 자문가입니다.
- 패시브 투자 및 자산배분 전문
- 국내외 ETF 비교 분석 전문가
- 장기 복리 투자 전략 설계 경험 다수

I (Instruction) - 지시사항
다음 ETF를 분석하고 포트폴리오를 제안해주세요:
분석 대상: ${list}

🔴 필수 - 실시간 데이터 조회:
각 ETF의 현재가, 운용보수, 배당수익률, 1년 수익률 등을 웹에서 실시간 조회하여 분석에 포함해주세요.

투자 조건:
- 투자 목적: ${etfOpt.goal}
- 투자 스타일: ${etfOpt.style}
- 투자 지역: ${etfOpt.region}

C (Context) - 맥락
- 장기 복리 효과 극대화 관점
- 운용보수 및 추적오차 중요
- 세금 효율성 고려 (국내 vs 해외)

E (Example) - 출력 형식

🏦 ETF 분석 결과

---
[ETF명]

기본 정보
| 항목 | 내용 |
|------|------|
| 추종 지수 | |
| 운용사 | |
| 설정일 | |
| 순자산(AUM) | |
| 운용보수 | |
| 거래량 | |

수익률 비교
| 기간 | ETF | 벤치마크 | 차이 |
|------|-----|----------|------|
| 1개월 | | | |
| 3개월 | | | |
| 1년 | | | |
| 3년 | | | |
| 5년 | | | |

배당 정보
| 항목 | 내용 |
|------|------|
| 배당수익률 | |
| 배당주기 | 월/분기/연 |
| 최근 배당금 | |

TOP 10 구성종목
| 순위 | 종목 | 비중 |
|------|------|------|
| 1 | | |
| ... | | |

품질 지표
| 지표 | 수치 | 평가 |
|------|------|------|
| 추적오차 | | |
| 괴리율 | | |
| 샤프비율 | | |
| 최대낙폭(MDD) | | |

---
📊 ETF 비교표

| ETF | 보수 | 배당률 | 1년수익 | 추적오차 | 추천도 |
|-----|------|--------|---------|----------|--------|
${selectedStocks.map(s => `| ${s} | | | | | ⭐⭐⭐☆☆ |`).join('\n')}

💼 ETF 포트폴리오 제안

${etfOpt.goal} 목적 포트폴리오
| ETF | 역할 | 비중 | 투자 이유 |
|-----|------|------|-----------|
| | 핵심(Core) | __% | |
| | 위성(Satellite) | __% | |

🎯 추천
- ${etfOpt.goal}에 최적: [ETF] - [이유]
- 비용 효율 최고: [ETF]
- 배당 수익 최고: [ETF]

💡 투자 팁
- 장기 투자 시 운용보수 차이가 수백만원 차이
- 환헤지(H) vs 환노출 선택 기준
- 배당 재투자 복리 효과`);
  };

  const OptionButtons = ({ label, options, value, onChange, cols = 3 }) => (
    <div className="mb-4">
      {label && <p className="text-sm font-semibold mb-2 text-gray-700">{label}</p>}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-3 rounded-xl border-2 text-sm font-medium transition ${
              value === opt
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 active:bg-gray-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const DropdownSelect = ({ label, options, value, onChange }) => (
    <div className="mb-4">
      {label && <p className="text-sm font-semibold mb-2 text-gray-700">{label}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-700 bg-white focus:border-blue-500 focus:outline-none"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  const StockSelector = ({ showETF = false }) => (
    <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-bold">📌 {showETF ? 'ETF' : '종목'} 선택</h3>
        {selectedStocks.length > 0 && (
          <button onClick={clearStocks} className="text-red-500 text-sm font-medium">초기화</button>
        )}
      </div>
      
      <div className="flex gap-2 mb-4">
        <input ref={inputRef} type="text" className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-base" placeholder={showETF ? "ETF명 직접 입력" : "종목명 직접 입력"} />
        <button onClick={addCustomStock} className="px-4 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm">추가</button>
      </div>
      
      {selectedStocks.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-blue-800">✅ 선택됨 ({selectedStocks.length}개)</p>
            <button onClick={clearAllStocks} className="text-xs text-red-500 font-bold px-2 py-1 bg-red-50 rounded-lg">전체 해제</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedStocks.map(stock => (
              <span key={stock} className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                {stock}
                <button onClick={() => toggleStock(stock)} className="ml-1 font-bold">×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {showETF ? (
        <>
          <p className="text-xs font-bold text-gray-500 mb-2">🇺🇸 미국 ETF</p>
          <div className="space-y-2 mb-4">
            {ETF_LIST.filter(e => e.country === '🇺🇸').map(etf => (
              <button
                key={etf.name}
                onClick={() => toggleStock(etf.name)}
                className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-sm border-2 transition ${
                  selectedStocks.includes(etf.name)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                <span className="font-medium">{etf.name}</span>
                <span className={`text-xs ${selectedStocks.includes(etf.name) ? 'text-blue-100' : 'text-gray-500'}`}>{etf.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-gray-500 mb-2">🇰🇷 한국 ETF</p>
          <div className="space-y-2">
            {ETF_LIST.filter(e => e.country === '🇰🇷').map(etf => (
              <button
                key={etf.name}
                onClick={() => toggleStock(etf.name)}
                className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-sm border-2 transition ${
                  selectedStocks.includes(etf.name)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                <span className="font-medium">{etf.name}</span>
                <span className={`text-xs ${selectedStocks.includes(etf.name) ? 'text-blue-100' : 'text-gray-500'}`}>{etf.desc}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-xs font-bold text-gray-500 mb-2">🇰🇷 한국</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {KOREA_STOCKS.map(stock => (
              <button key={stock} onClick={() => toggleStock(stock)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition ${
                  selectedStocks.includes(stock) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-200'
                }`}>{stock}</button>
            ))}
          </div>
          <p className="text-xs font-bold text-gray-500 mb-2">🇺🇸 미국</p>
          <div className="flex flex-wrap gap-2">
            {US_STOCKS.map(stock => (
              <button key={stock} onClick={() => toggleStock(stock)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition ${
                  selectedStocks.includes(stock) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-200'
                }`}>{stock}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // 용어 사전 UI (확장된 버전)
  const TermsView = () => (
    <div>
      <h2 className="text-xl font-bold mb-1">📖 주식 용어 사전</h2>
      <p className="text-gray-500 text-sm mb-4">터치하면 상세 설명이 나와요!</p>
      
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { id: 'basic', name: '기본', icon: '📊' },
          { id: 'financial', name: '재무', icon: '💰' },
          { id: 'valuation', name: '밸류', icon: '🎯' },
          { id: 'etf', name: 'ETF', icon: '🏦' },
          { id: 'trading', name: '매매', icon: '📈' },
          { id: 'technical', name: '기술적', icon: '📉' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => { setTermCategory(cat.id); setExpandedTerm(null); }}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              termCategory === cat.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >{cat.icon} {cat.name}</button>
        ))}
      </div>
      
      <div className="space-y-3">
        {TERMS[termCategory].map((item, i) => (
          <div 
            key={i} 
            className="bg-white rounded-xl shadow overflow-hidden"
          >
            <button 
              onClick={() => setExpandedTerm(expandedTerm === i ? null : i)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-600 text-lg">{item.term}</span>
                  <span className="text-xs text-gray-500 ml-2">({item.full})</span>
                </div>
                <span className="text-gray-400">{expandedTerm === i ? '▲' : '▼'}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{item.desc}</p>
            </button>
            
            {expandedTerm === i && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{item.detail}</p>
                </div>
                {item.example && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs font-bold text-amber-700 mb-1">💡 실제 예시</p>
                    <p className="text-sm text-amber-800 whitespace-pre-line">{item.example}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <p className="text-sm font-bold text-blue-800 mb-2">📚 용어 학습 팁</p>
        <p className="text-xs text-blue-700">
          • 기본 → 재무 → 밸류 → ETF → 매매 순서로 학습하세요{'\n'}
          • 실제 종목에 적용해보면 이해가 빨라요{'\n'}
          • 모르는 용어는 AI에게 추가 질문하세요!
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600">
            🪿 황금거위
          </h1>
        </div>
        <div className="overflow-x-auto">
          <div className="flex px-2 pb-2 gap-1" style={{ width: 'max-content' }}>
            {menus.map(menu => (
              <button
                key={menu.id}
                onClick={() => { setCurrentMenu(menu.id); setGeneratedPrompt(''); }}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  currentMenu === menu.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span>{menu.icon}</span>
                <span>{menu.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 pb-24">

        {/* ══════════════════════════════════════════════════════ */}
        {/* 🏦 내자산 탭                                          */}
        {/* ══════════════════════════════════════════════════════ */}
        {currentMenu === 'assets' && (
          <div>
            <h2 className="text-xl font-bold mb-1">🏦 내 보유 자산</h2>
            <p className="text-gray-500 text-sm mb-4">보유 자산 현황 및 수익률 — 자동 저장됩니다</p>

            {/* 포트폴리오 총괄 카드 */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-5 mb-4 shadow-lg">
              <p className="text-sm text-indigo-200 mb-1">총 평가금액</p>
              <p className="text-3xl font-black mb-3">₩{fmtNum(Math.round(totalAssetValue))}</p>
              <div className="flex gap-4 text-sm">
                <div>
                  <p className="text-indigo-200">총 매입금액</p>
                  <p className="font-bold">₩{fmtNum(Math.round(totalCost))}</p>
                </div>
                <div>
                  <p className="text-indigo-200">평가손익</p>
                  <p className={`font-bold ${totalPnL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {totalPnL >= 0 ? '+' : ''}₩{fmtNum(Math.round(totalPnL))} ({fmtPct(totalPnLPct)})
                  </p>
                </div>
              </div>
            </div>

            {/* 그룹별 요약 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Object.entries(GROUP_COLORS).map(([grp, color]) => {
                const grpAssets = assets.filter(a => a.group === grp);
                const grpVal = grpAssets.reduce((s, a) => s + a.quantity * a.currentPrice, 0);
                const grpPct = totalAssetValue > 0 ? (grpVal / totalAssetValue * 100).toFixed(1) : '0.0';
                return (
                  <div key={grp} className="bg-white rounded-xl p-3 shadow text-center">
                    <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: color }}></div>
                    <p className="text-xs font-bold text-gray-700">{grp}</p>
                    <p className="text-xs text-gray-500">{grpPct}%</p>
                  </div>
                );
              })}
            </div>

            {/* 자산 목록 */}
            {assets.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow text-center text-gray-400">
                <p className="text-4xl mb-2">💼</p>
                <p>보유 자산이 없습니다.</p>
                <p className="text-sm mt-1">아래 버튼으로 추가해보세요!</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {assets.map(a => {
                  const evalAmt = a.quantity * a.currentPrice;
                  const costAmt = a.quantity * a.avgPrice;
                  const pnl = evalAmt - costAmt;
                  const pnlPct = costAmt > 0 ? (pnl / costAmt) * 100 : 0;
                  return (
                    <div key={a.id} className="bg-white rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedAsset(a)}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: GROUP_COLORS[a.group] || '#94a3b8' }}></span>
                            <span className="text-xs text-gray-500">{a.group} · {a.account}</span>
                          </div>
                          <p className="font-bold text-gray-900">{a.name}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteAsset(a.id); }}
                          className="text-gray-300 hover:text-red-400 text-lg leading-none ml-2"
                        >✕</button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">수량</span>
                          <span className="font-medium">{fmtNum(a.quantity)}주</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">평단가</span>
                          <span className="font-medium">₩{fmtNum(a.avgPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">현재가</span>
                          <span className="font-medium">₩{fmtNum(a.currentPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">평가금액</span>
                          <span className="font-medium">₩{fmtNum(Math.round(evalAmt))}</span>
                        </div>
                      </div>
                      <div className={`mt-2 pt-2 border-t border-gray-100 flex justify-between items-center`}>
                        <span className="text-xs text-gray-400">평가손익</span>
                        <span className={`font-bold text-sm ${pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {pnl >= 0 ? '+' : ''}₩{fmtNum(Math.round(pnl))} ({fmtPct(pnlPct)})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 자산 추가 알림 */}
            {assetMsg && (
              <div className="mb-3 px-4 py-3 bg-emerald-50 border border-emerald-300 rounded-xl text-sm text-emerald-700 font-medium">
                {assetMsg}
              </div>
            )}

            {/* 자산 추가 버튼 / 폼 */}
            {!showAssetForm ? (
              <button
                onClick={() => setShowAssetForm(true)}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold shadow"
              >
                + 자산 추가하기
              </button>
            ) : (
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">새 자산 추가</h3>
                  <button onClick={() => setShowAssetForm(false)} className="text-gray-400 text-xl">✕</button>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">그룹</p>
                  <div className="flex flex-wrap gap-2">
                    {['연금형','성장형','방어형','파킹형','현금'].map(g => (
                      <button key={g} onClick={() => setAssetForm(f => ({...f, group: g}))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 ${
                          assetForm.group === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                        }`}>{g}</button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">계좌</p>
                  <div className="flex flex-wrap gap-2">
                    {['연금저축','IRP','ISA','일반계좌','CMA'].map(ac => (
                      <button key={ac} onClick={() => setAssetForm(f => ({...f, account: ac}))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 ${
                          assetForm.account === ac ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                        }`}>{ac}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">종목명</p>
                    <input type="text" value={assetForm.name}
                      onChange={e => setAssetForm(f => ({...f, name: e.target.value}))}
                      placeholder="예: TIGER 미국S&P500"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">수량 (주)</p>
                    <input type="number" value={assetForm.quantity}
                      onChange={e => setAssetForm(f => ({...f, quantity: e.target.value}))}
                      placeholder="0"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">평균단가 (원)</p>
                    <input type="number" value={assetForm.avgPrice}
                      onChange={e => setAssetForm(f => ({...f, avgPrice: e.target.value}))}
                      placeholder="0"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">현재가 (원)</p>
                    <input type="number" value={assetForm.currentPrice}
                      onChange={e => setAssetForm(f => ({...f, currentPrice: e.target.value}))}
                      placeholder="0"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button onClick={submitAsset}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold"
                >자산 추가</button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* 📒 매매기록 탭  (Phase 1.5 — 입력 전용)               */}
        {/* ══════════════════════════════════════════════════════ */}
        {currentMenu === 'trades' && (
          <div>
            <h2 className="text-xl font-bold mb-1">📒 거래 입력</h2>
            <p className="text-gray-500 text-sm mb-4">거래를 입력하면 자산에 즉시 반영됩니다 · 이력 조회는 내자산 탭의 종목 카드를 탭하세요</p>

            <div className="bg-white rounded-2xl p-4 shadow-lg">
              {/* 매수/매도 선택 */}
              <div className="flex gap-2 mb-4">
                {['매수','매도'].map(t => (
                  <button key={t} onClick={() => setTradeForm(f => ({...f, type: t}))}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition ${
                      tradeForm.type === t
                        ? t === '매수'
                          ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                          : 'bg-red-500 border-red-500 text-white shadow-md'
                        : 'border-gray-200 text-gray-400'
                    }`}>{t === '매수' ? '🟢 매수' : '🔴 매도'}</button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">날짜</p>
                  <input type="date" value={tradeForm.date}
                    onChange={e => setTradeForm(f => ({...f, date: e.target.value}))}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">종목 선택</p>
                  <select value={tradeForm.assetId}
                    onChange={e => setTradeForm(f => ({...f, assetId: e.target.value}))}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none bg-white"
                  >
                    <option value="">종목을 선택하세요</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name}{a.ticker ? ` (${a.ticker})` : ''} — {a.account}
                      </option>
                    ))}
                  </select>
                  {assets.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">⚠️ 내자산 탭에서 먼저 자산을 추가해주세요.</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">수량 (주)</p>
                  <input type="number" value={tradeForm.quantity}
                    onChange={e => setTradeForm(f => ({...f, quantity: e.target.value}))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">단가 (원)</p>
                  <input type="number" value={tradeForm.price}
                    onChange={e => setTradeForm(f => ({...f, price: e.target.value}))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>

                {/* 거래금액 자동 계산 미리보기 */}
                {tradeForm.quantity && tradeForm.price && (
                  <div className="col-span-2 bg-blue-50 rounded-xl px-3 py-2 flex justify-between items-center">
                    <span className="text-xs text-blue-600 font-medium">거래 금액</span>
                    <span className="text-sm font-black text-blue-700">
                      ₩{fmtNum(Math.round(parseFloat(tradeForm.quantity||0) * parseFloat(tradeForm.price||0)))}
                    </span>
                  </div>
                )}

                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">메모 <span className="text-gray-400 font-normal">(선택)</span></p>
                  <input type="text" value={tradeForm.memo}
                    onChange={e => setTradeForm(f => ({...f, memo: e.target.value}))}
                    placeholder="예: 분할매수 1차, 배당 재투자"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              {tradeMsg && (
                <div className={`mt-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  tradeMsg.startsWith('✅')
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>{tradeMsg}</div>
              )}

              <button onClick={submitTrade}
                className="mt-4 w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold shadow text-base"
              >
                {tradeForm.type === '매수' ? '🟢' : '🔴'} {tradeForm.type} 등록
              </button>
            </div>

            {/* 전체 거래 이력 간략 요약 */}
            {transactions.length > 0 && (
              <div className="mt-4 bg-white rounded-2xl p-4 shadow">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-gray-900 text-sm">최근 거래 ({transactions.length}건 전체)</p>
                  <button
                    onClick={() => { if (window.confirm('전체 거래 내역을 삭제하시겠습니까?')) clearTransactions(); }}
                    className="text-xs text-red-400 px-2 py-1 bg-red-50 rounded-lg"
                  >전체 삭제</button>
                </div>
                <p className="text-xs text-gray-400 mb-3">종목별 상세 이력 → 내자산 탭에서 카드를 탭하세요</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {transactions.slice(0, 10).map(tx => {
                    const a2 = assets.find(a => a.id === tx.assetId);
                    return (
                      <div key={tx.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-50">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          tx.type === '매수' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'
                        }`}>{tx.type}</span>
                        <span className="text-gray-400">{tx.date}</span>
                        <span className="flex-1 font-medium text-gray-700 truncate">{a2?.name ?? '-'}</span>
                        <span className="text-gray-600 font-bold">₩{fmtNum(Math.round(tx.quantity * tx.price))}</span>
                      </div>
                    );
                  })}
                  {transactions.length > 10 && (
                    <p className="text-center text-xs text-gray-400 pt-1">+ {transactions.length - 10}건 더 있음</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {currentMenu === 'morning' && (
          <div>
            <h2 className="text-xl font-bold mb-1">🌅 모닝브리핑 (단타용)</h2>
            <p className="text-gray-500 text-sm mb-4">장 시작 전 단타 정보 수집 (퍼플렉시티 추천)</p>
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
              <OptionButtons label="📰 뉴스 유형" options={['정치테마','기업공시','글로벌이슈','테마급등']} value={morningOpt.newsType} onChange={v => setMorningOpt({...morningOpt, newsType: v})} cols={2} />
              <OptionButtons label="🌍 시장" options={['한국','미국','전체']} value={morningOpt.market} onChange={v => setMorningOpt({...morningOpt, market: v})} />
              <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl">
                <p className="text-xs text-amber-800">
                  <strong>💡 활용법:</strong> 프롬프트 생성 → <strong>퍼플렉시티(Perplexity)</strong>에 붙여넣기
                  <br/>→ 실시간 뉴스 검색으로 최신 정보 획득!
                </p>
              </div>
              <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-xl">
                <p className="text-xs text-red-700">
                  ⚠️ <strong>주의:</strong> 단타는 고위험 투자입니다. 손절가를 반드시 설정하세요!
                </p>
              </div>
            </div>
            <button onClick={generateMorningPrompt} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold">🌅 모닝브리핑 프롬프트 생성</button>
          </div>
        )}

        {currentMenu === 'recommend' && (
          <div>
            <h2 className="text-xl font-bold mb-1">💡 신규종목 발굴</h2>
            <p className="text-gray-500 text-sm mb-4">RICE 프롬프트로 AI가 종목 발굴</p>
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
              <p className="text-sm font-semibold mb-2">🎯 섹터</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {SECTORS.map(s => (
                  <button key={s.id} onClick={() => setRecommendOpt({...recommendOpt, sector: s.id})}
                    className={`px-2 py-3 rounded-xl border-2 text-xs font-medium ${
                      recommendOpt.sector === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'
                    }`}>{s.name}</button>
                ))}
              </div>
              <OptionButtons label="📊 투자 스타일" options={['성장주','가치주','배당주']} value={recommendOpt.type} onChange={v => setRecommendOpt({...recommendOpt, type: v})} />
              <div className="grid grid-cols-2 gap-3">
                <DropdownSelect 
                  label="📅 투자 기간" 
                  options={['1개월','3개월','6개월','1년','2년','3년','5년','10년']} 
                  value={recommendOpt.period} 
                  onChange={v => setRecommendOpt({...recommendOpt, period: v})} 
                />
                <DropdownSelect 
                  label="📈 목표 수익률" 
                  options={['5%','10%','15%','20%','25%','30%','35%','40%','50%','70%','100%']} 
                  value={recommendOpt.growthRate} 
                  onChange={v => setRecommendOpt({...recommendOpt, growthRate: v})} 
                />
              </div>
              <OptionButtons label="🔢 추천 개수" options={['3개','5개','7개','10개']} value={recommendOpt.count} onChange={v => setRecommendOpt({...recommendOpt, count: v})} cols={4} />
            </div>
            <button onClick={generateRecommendPrompt} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold">✨ RICE 프롬프트 생성</button>
          </div>
        )}

        {currentMenu === 'discovery' && (
          <div>
            <h2 className="text-xl font-bold mb-1">🔍 내 종목 분석</h2>
            <p className="text-gray-500 text-sm mb-4">관심 종목 RICE 심층 분석</p>
            <StockSelector />
            {selectedStocks.length > 0 && (
              <button onClick={generateDiscoveryPrompt} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold">✨ RICE 프롬프트 생성</button>
            )}
          </div>
        )}

        {currentMenu === 'fundamental' && (
          <div>
            <h2 className="text-xl font-bold mb-1">📊 재무 분석</h2>
            <p className="text-gray-500 text-sm mb-4">RICE 재무 건전성 분석</p>
            <StockSelector />
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
              <OptionButtons label="분석 유형" options={['종합분석','비교분석','심층분석']} value={fundamentalOpt.analysisType} onChange={v => setFundamentalOpt({...fundamentalOpt, analysisType: v})} />
              <OptionButtons label="중점 영역" options={['ROE','안정성','성장성']} value={fundamentalOpt.focusArea} onChange={v => setFundamentalOpt({...fundamentalOpt, focusArea: v})} />
              <div className="mt-2 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700">
                  💡 <strong>{fundamentalOpt.analysisType}</strong>: {fundamentalOpt.analysisType === '종합분석' ? '균형있는 전체 평가' : fundamentalOpt.analysisType === '비교분석' ? '경쟁사 대비 비교' : '5년 트렌드 심층분석'}
                  <br/>
                  💡 <strong>{fundamentalOpt.focusArea}</strong>: {fundamentalOpt.focusArea === 'ROE' ? '듀퐁분석으로 수익성 분해' : fundamentalOpt.focusArea === '안정성' ? '부채/유동성 집중 분석' : 'CAGR/성장동력 집중 분석'}
                </p>
              </div>
            </div>
            {selectedStocks.length > 0 && (
              <button onClick={generateFundamentalPrompt} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold">✨ RICE 프롬프트 생성</button>
            )}
          </div>
        )}

        {currentMenu === 'valuation' && (
          <div>
            <h2 className="text-xl font-bold mb-1">💰 밸류에이션</h2>
            <p className="text-gray-500 text-sm mb-4">RICE 적정 주가 산출</p>
            <StockSelector />
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
              <OptionButtons label="평가 방법" options={['상대가치','절대가치','종합']} value={valuationOpt.method} onChange={v => setValuationOpt({...valuationOpt, method: v})} />
              <OptionButtons label="안전마진" options={['10%','20%','30%','40%']} value={valuationOpt.safetyMargin} onChange={v => setValuationOpt({...valuationOpt, safetyMargin: v})} cols={4} />
              <div className="mt-2 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700">
                  💡 <strong>{valuationOpt.method}</strong>: {valuationOpt.method === '상대가치' ? 'PER/PBR 업종비교' : valuationOpt.method === '절대가치' ? 'DCF 현금흐름할인' : 'PER+PBR+DCF 종합'}
                </p>
              </div>
            </div>
            {selectedStocks.length > 0 && (
              <button onClick={generateValuationPrompt} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold">✨ RICE 프롬프트 생성</button>
            )}
          </div>
        )}

        {currentMenu === 'technical' && (
          <div>
            <h2 className="text-xl font-bold mb-1">📈 기술적 분석</h2>
            <p className="text-gray-500 text-sm mb-4">RICE 차트 & 지표 분석</p>
            <StockSelector />
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
              <OptionButtons label="타임프레임" options={['일봉','주봉','월봉']} value={technicalOpt.timeframe} onChange={v => setTechnicalOpt({...technicalOpt, timeframe: v})} />
              <OptionButtons label="주요 지표" options={['이동평균','모멘텀','거래량']} value={technicalOpt.indicator} onChange={v => setTechnicalOpt({...technicalOpt, indicator: v})} />
              <OptionButtons label="패턴 분석" options={['추세','패턴','캔들']} value={technicalOpt.pattern} onChange={v => setTechnicalOpt({...technicalOpt, pattern: v})} />
            </div>
            {selectedStocks.length > 0 && (
              <button onClick={generateTechnicalPrompt} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold">✨ RICE 프롬프트 생성</button>
            )}
          </div>
        )}

        {currentMenu === 'qualitative' && (
          <div>
            <h2 className="text-xl font-bold mb-1">🧠 질적 분석</h2>
            <p className="text-gray-500 text-sm mb-4">RICE 경쟁우위 & 경영진 평가</p>
            <StockSelector />
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
              <OptionButtons label="중점 영역" options={['경쟁우위','경영진','ESG']} value={qualitativeOpt.focus} onChange={v => setQualitativeOpt({focus: v})} />
            </div>
            {selectedStocks.length > 0 && (
              <button onClick={generateQualitativePrompt} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold">✨ RICE 프롬프트 생성</button>
            )}
          </div>
        )}

        {currentMenu === 'risk' && (
          <div>
            <h2 className="text-xl font-bold mb-1">⚠️ 리스크 분석</h2>
            <p className="text-gray-500 text-sm mb-4">RICE 시나리오 & 손익 관리</p>
            <StockSelector />
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
              <OptionButtons label="시나리오 수" options={['3가지','5가지','7가지']} value={riskOpt.scenario} onChange={v => setRiskOpt({...riskOpt, scenario: v})} />
              <OptionButtons label="손절 기준" options={['10%','15%','20%','25%']} value={riskOpt.stopLoss} onChange={v => setRiskOpt({...riskOpt, stopLoss: v})} cols={4} />
            </div>
            {selectedStocks.length > 0 && (
              <button onClick={generateRiskPrompt} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold">✨ RICE 프롬프트 생성</button>
            )}
          </div>
        )}

        {currentMenu === 'portfolio' && (
          <div>
            <h2 className="text-xl font-bold mb-1">💼 포트폴리오</h2>
            <p className="text-gray-500 text-sm mb-4">RICE 종목 배분 & 실행 전략</p>
            <StockSelector />
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
              <OptionButtons label="투자금액" options={['1000만원','3000만원','5000만원','1억원']} value={portfolioOpt.totalAmount} onChange={v => setPortfolioOpt({...portfolioOpt, totalAmount: v})} cols={2} />
              <OptionButtons label="배분 전략" options={['균등분산','차등배분','집중투자']} value={portfolioOpt.strategy} onChange={v => setPortfolioOpt({...portfolioOpt, strategy: v})} />
            </div>
            {selectedStocks.length > 0 && (
              <button onClick={generatePortfolioPrompt} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold">✨ RICE 프롬프트 생성</button>
            )}
          </div>
        )}

        {currentMenu === 'etf' && (
          <div>
            <h2 className="text-xl font-bold mb-1">🏦 ETF 분석</h2>
            <p className="text-gray-500 text-sm mb-4">RICE ETF 비교 & 포트폴리오</p>
            <StockSelector showETF={true} />
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
              <OptionButtons label="투자 목적" options={['장기투자','배당수익','단기트레이딩']} value={etfOpt.goal} onChange={v => setEtfOpt({...etfOpt, goal: v})} />
              <OptionButtons label="투자 스타일" options={['패시브','액티브','테마']} value={etfOpt.style} onChange={v => setEtfOpt({...etfOpt, style: v})} />
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2 text-gray-700">투자 지역</p>
                <div className="grid grid-cols-3 gap-2">
                  {['미국','한국','글로벌'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setEtfOpt({...etfOpt, region: opt})}
                      className={`px-3 py-3 rounded-xl border-2 text-sm font-medium transition ${
                        etfOpt.region === opt
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >{opt}</button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">💡 선택한 ETF에 따라 자동 설정됩니다</p>
              </div>
            </div>
            {selectedStocks.length > 0 && (
              <button onClick={generateEtfPrompt} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold">✨ RICE 프롬프트 생성</button>
            )}
          </div>
        )}

        {currentMenu === 'terms' && <TermsView />}

        {generatedPrompt && (
          <div className="mt-6 bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">✨ RICE 프롬프트</h3>
              <button 
                type="button"
                onClick={() => {
                  const ta = document.getElementById('promptTextarea');
                  ta.focus();
                  ta.select();
                  document.execCommand('copy');
                  alert('✅ 복사 완료!\n\nChatGPT, Claude, Gemini에 붙여넣기 하세요.');
                }}
                className="bg-blue-500 active:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold"
              >
                📋 복사하기
              </button>
            </div>
            <textarea
              id="promptTextarea"
              value={generatedPrompt}
              readOnly
              className="w-full h-80 bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-xs text-gray-700 font-mono leading-relaxed resize-none focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-700 font-medium">💡 복사 후 → ChatGPT/Claude/Gemini에 붙여넣기!</p>
            </div>
          </div>
        )}

        {/* 프롬프트 히스토리 - 제일 하단 */}
        {promptHistory.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">📜 히스토리 (최근 10개)</h3>
              <button 
                onClick={() => setPromptHistory([])}
                className="text-xs text-red-500 font-bold px-2 py-1 bg-red-50 rounded-lg"
              >
                전체 삭제
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {promptHistory.map((entry) => (
                <div 
                  key={entry.id}
                  onClick={() => loadFromHistory(entry)}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 active:bg-blue-100 transition"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-800">{entry.menu}</span>
                    <span className="text-xs text-gray-500 ml-2">{entry.time}</span>
                  </div>
                  <span className="text-xs text-blue-500 font-medium">불러오기 →</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">※ 히스토리는 페이지 새로고침 시 초기화됩니다.</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 mb-3">© 리얼리더십 | 퇴사한아빠 신주일</p>
          <div className="mx-2 p-3 bg-gray-100 rounded-xl">
            <p className="text-xs text-gray-500 leading-relaxed">
              ※ [유의사항] 본 웹앱에 대한 모든 지식재산권은 리얼리더십(신주일)에게 있습니다. 
              공유받으신 구독자님 본인의 개인적인 학습 및 투자 분석 용도로만 사용해 주시길 부탁드립니다. 
              타인에게 무단으로 링크를 재공유하거나 상업적으로 배포하는 행위는 엄격히 금지합니다.
            </p>
          </div>
        </div>
      </div>

      {/* ─── 자산 상세 모달 (Phase 1.5A/B) ───────────────────────────────── */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          transactions={transactions}
          onClose={() => setSelectedAsset(null)}
          onDelete={(id) => { removeAsset(id); setSelectedAsset(null); }}
          onDeleteTrade={removeTrade}
          onUpdate={(id, changes) => {
            updateAsset(id, changes);
            // selectedAsset 상태도 동기화 → 모달 내 요약 카드 즐시 갱신
            setSelectedAsset(prev => ({ ...prev, ...changes }));
          }}
        />
      )}
    </div>
  );
}