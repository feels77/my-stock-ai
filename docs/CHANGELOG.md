# 📝 CHANGELOG — 황금거위 (Golden Goose)

모든 주요 변경 사항을 기록합니다.  
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/) 기준을 따릅니다.

---

## [미출시] — 개발 중

### 예정
- JSON 파일 내보내기 / 가져오기 (Phase 4)
- Google Drive 동기화 (Phase 4)
- 현재가 실시간 API 연결 (Phase 5)

---

## [Phase 3+] — 2026-06-13

### 추가 (Added)
- `addAssetAndBuy()` 함수 (`useAssets.js`) 신규 추가
  - 신규 종목 매수 시 자산 등록 + 거래 이력을 원자적(atomic)으로 동시 처리
  - React state 타이밍 문제 없이 단일 렌더 사이클에서 처리
- 매매기록 탭 종목 선택 드롭다운 상단에 **"✏️ 신규 종목 직접 입력"** 옵션 추가
- 신규 종목 선택 시 입력 패널 표시: 종목명 / 자산군 선택 / ticker(선택)
- 매매기록 폼에 **계좌 선택 드롭다운** 추가 (6개 ACCOUNTS 상수 재사용)
- 기존 종목 선택 시 해당 종목의 계좌 자동 반영

### 변경 (Changed)
- `buyAsset(assetId, qty, price, date, memo, account)` — account 파라미터 추가
- `sellAsset(assetId, qty, price, date, memo, account)` — account 파라미터 추가
- Transaction 모델 확장: `{ ..., account }` 필드 추가 (기존 거래는 account = '' 처리)
- `submitTrade()` 전면 재작성: isNewAsset 분기 처리 + account 전달
- 거래 이력 목록 항목 UI 개선: 계좌명 소문자 표시 (종목명 아래)

### 유지 (Unchanged)
- 기존 자산/거래 데이터 구조 호환 유지 (기존 거래의 account = undefined → '' 자동 처리)
- localStorage 키 동일 (`golden_goose_assets`, `golden_goose_logs`)
- Phase 1~3 모든 기능 유지

---

## [Phase 3] — 2026-06-13

### 추가 (Added)
- `generateWeeklyReport()` 함수 추가 (`App.jsx` 내부)
  - 포트폴리오 요약 (총 평가금액 / 매수금액 / 손익 / 수익률 / 자산수)
  - 자산군별 현황 테이블 (현재비중 / 목표비중 / 괴리 / 신호등)
  - 집중 투자 위험 점검 (단일 종목 30% 초과 시 경고 문구 자동 포함)
  - 최근 30일 거래 내역 (매수/매도 건수, 거래 종목명)
  - AI 프롬프트 고정 문구: "황금거위 투자 원칙에 따라 진단해줘"
- `🤖 AI 주간 점검 리포트 생성` 버튼 (내자산 탭 하단, 자산 추가 버튼 위)
- 리포트 표시 패널 (다크 테마 / 코드 블록 스타일)
  - `📋 복사하기` 버튼 → 클립보드 복사 + "✅ 복사됨!" 2.5초 피드백
  - ✕ 버튼으로 패널 닫기
  - 복사 유도 안내 문구: "ChatGPT / Claude에 붙여넣기"

### 유지 (Unchanged)
- 기존 모든 기능 유지
- 기존 데이터 구조 / localStorage 키 동일

---

## [Phase 2 - 부분] — 2026-06-13

### 추가 (Added)
- `src/hooks/useTargetAllocation.js` 신규 생성
  - 자산군별 목표 비중 관리 + localStorage(`golden_goose_target`) 저장/복원
  - `getSignal(group, currentPct, targetPct)` 신호등 판정 함수 export
  - 기본값: 연금형 40% / 성장형 20% / 방어형 20% / 파킹형 15% / 현금 5%
- `src/components/AllocationPanel.jsx` 신규 생성
  - 내자산 탭 상단 자산배분 신호등 UI
  - 자산군별 현재 비중 / 목표 비중 / 게이지 바 표시
  - 신호등 로직: 🟢 비중 확대 / 🔴 비중 축소 / 🟡 유지 (허용오차 ±5%p)
  - 현금 자산군 신호 반전 적용
  - ⚙️ 목표 조정 패널: 슬라이더 + 합계 100% 검증 + localStorage 저장
- `ACCOUNTS` 상수 추가 (`App.jsx` 모듈 레벨)
  - 6개 계좌 고정: KB증권 CMA/ISA/신연금저축/신연금저축2/개인퇴직연금(IRP), 토스증권 미국주식
- `useAssets.js`에 `getGroupSummary()` 추가
  - 자산군별 평가금액 및 비중(%) 계산, 공개 인터페이스 export

### 변경 (Changed)
- `App.jsx` 자산 추가 폼 계좌 입력 방식 변경
  - 버튼 선택 방식 → `<select>` 드롭다운 (6개 고정 계좌)
  - 기본 계좌: `KB증권 - ISA`
- `App.jsx` 내자산 탭 그룹별 요약 그리드 → `AllocationPanel` 컴포넌트로 교체
  - 기존: 단순 비중 % 표시 (3열 그리드)
  - 변경: 신호등 + 게이지 바 + 목표 조정 슬라이더

### 유지 (Unchanged)
- 기존 자산/거래 데이터 구조 동일
- localStorage `golden_goose_assets`, `golden_goose_logs` 키 동일
- Phase 1.5A/1.5B 모든 기능 유지

---

## [Phase 1.5B] — 2026-06-12

### 추가 (Added)
- `updateAsset(id, changes)` 함수 신규 추가 (`useAssets.js`)
  - 수량 / 평단가 / 현재가 직접 수정 가능
  - 거래이력(`transactions`)은 수정하지 않음 — 원본 보존
  - localStorage 자동 저장 (기존 `useEffect` 활용)
  - 공개 인터페이스에 `updateAsset` 추가

### 변경 (Changed)
- `AssetDetailModal.jsx` 자산 수정 기능 활성화
  - 입력 필드: `defaultValue` → `value` + `onChange` 제어 컴포넌트 전환
  - 실시간 미리보기: 수량/평단가/현재가 입력 즉시 요약 카드 재계산
  - 저장 확인 메시지: `"✅ 자산 정보가 저장되었습니다."` 3초 표시
  - 수정 후 모달 닫히지 않음 — 현재 화면 유지
  - "비활성화" 안내 문구 제거 → 실제 저장 버튼으로 교체
  - 유효성 검사 추가 (수량 0 미만 / 단가 0 이하 차단)
- `App.jsx` `onUpdate` prop 추가
  - `updateAsset()` 호출 후 `setSelectedAsset()` 동기화 → 모달 즉시 갱신

### 유지 (Unchanged)
- 기존 매수/매도 로직 (`buyAsset`, `sellAsset`) 영향 없음
- 기존 거래이력 보존
- localStorage 저장/복원 구조 동일

---

## [Phase 1.5A] — 2026-06-11

### 추가 (Added)
- `src/components/` 디렉토리 신규 생성
- `src/components/AssetDetailModal.jsx` 신규 생성 (215 라인)
  - Bottom Sheet 형태 오버레이 모달
  - 자산 요약 카드 (그라디언트) — 보유수량/평단가/현재가/평가금액/손익
  - 자산 수정 버튼 + 폼 구조 (Phase 1.5B에서 활성화)
  - 거래 요약 — 누적 매수/매도 횟수 및 금액
  - 종목별 거래이력 필터링 (`assetId` 기준, 최신순)
  - 거래 단건 삭제 버튼
  - 자산 삭제 버튼 (모달 내부)
  - 외부 클릭 / X 버튼 → 닫기

### 변경 (Changed)
- `App.jsx` 3곳 수정
  - `import AssetDetailModal` 추가
  - 자산 카드: `cursor-pointer`, `hover:shadow-lg`, `onClick={() => setSelectedAsset(a)}` 추가
  - 카드 내 ✕ 버튼: `e.stopPropagation()` 추가 (카드 클릭 충돌 방지)
  - 최하단에 `{selectedAsset && <AssetDetailModal ... />}` 렌더 블록 추가

### 유지 (Unchanged)
- `selectedAsset` 상태 (L365에 이미 선언되어 있었음, 신규 추가 없음)
- 기존 자산 카드 ✕ 버튼 삭제 기능 유지
- 기존 모든 탭 및 기능 동일

---

## [Phase R1] — 2026-06-06

### 변경 (Changed)
- `App.jsx` 내 자산관리 로직 전체를 `src/hooks/useAssets.js`로 분리
  - `assets` / `transactions` 상태
  - localStorage 저장 및 복원 (`golden_goose_assets`, `golden_goose_logs`)
  - `addAsset` / `removeAsset` / `buyAsset` / `sellAsset`
  - `removeTrade` / `clearTransactions`
  - `updateAllPrices` / `updatePrice` (Mock ±2%)
  - `totalAssetValue` / `totalCost` / `totalPnL` / `totalPnLPct` 계산값

### 추가 (Added)
- `src/hooks/` 디렉토리 신규 생성
- `src/hooks/useAssets.js` 신규 생성 (197 라인)
  - 공개 인터페이스: `assets, transactions, addAsset, removeAsset, buyAsset, sellAsset, removeTrade, clearTransactions, updateAllPrices, isUpdatingPrices, lastUpdated, totalAssetValue, totalCost, totalPnL, totalPnLPct`
  - localStorage 키 상수화: `STORAGE_ASSETS`, `STORAGE_LOGS`
  - JSDoc 주석 추가

### 유지 (Unchanged)
- 모든 UI 화면 및 탭 구조 동일 유지
- 기존 동작 100% 유지 (자산 추가, 삭제, 매수, 매도, 저장, 복원)
- `App.jsx` 총 라인: 2,935 → **2,859 라인** (−76라인)

### 내부 (Internal)
- `App.jsx`의 `submitTrade()`: `setTransactions`/`setAssets` 직접 호출 → `buyAsset()` / `sellAsset()` 호출로 변경
- `App.jsx`의 `submitAsset()`: `setAssets` 직접 호출 → `addAsset()` 호출로 변경
- `App.jsx`의 `deleteAsset()` / `deleteTrade()`: UI confirm 래퍼로 축소 (`removeAsset`, `removeTrade` 호출)
- JSX 내 `setTransactions([])` → `clearTransactions()` 변경

---

## [Phase 1] — 2026-06-05

### 추가 (Added)

#### 데이터 모델
- **Asset 모델** 정의
  ```javascript
  { id, group, account, name, ticker, quantity, avgPrice, currentPrice }
  ```
  - `group`: 연금형 / 성장형 / 방어형 / 파킹형 / 현금
  - `account`: 연금저축 / IRP / ISA / 일반계좌 / CMA
  - `ticker`: 종목코드 (한국 ETF 숫자코드 또는 미국 티커)

- **Transaction 모델** 정의
  ```javascript
  { id, date, type, assetId, quantity, price, memo }
  ```
  - `type`: 매수 / 매도

#### 상태 관리
- `assets` 상태 (useState + localStorage lazy initializer)
- `transactions` 상태 (useState + localStorage lazy initializer)
- `selectedAsset` 상태 (상세 모달용, 미사용 준비)
- `isUpdatingPrices`, `lastUpdated` 상태

#### localStorage 저장/복원
- 자동 저장: `assets` / `transactions` 변경 시 즉시 반영
- 복원: 앱 시작 시 저장된 데이터 복원, 없으면 샘플 데이터 사용
- 저장 키: `golden_goose_assets`, `golden_goose_logs`

#### 자산관리 기능
- **자산 추가 폼**: 그룹/계좌 버튼 선택, 종목명/ticker/수량/평단가/현재가 입력
- **매수 처리**: 거래 기록 추가 + 수량 누적 + 평단가 가중평균 재계산
- **매도 처리**: 거래 기록 추가 + 수량 차감 (0 미만 방지)
- **자산 삭제**: confirm 다이얼로그 후 삭제
- **거래 단건 삭제**: confirm 다이얼로그 후 삭제
- **전체 거래 삭제**: confirm 다이얼로그 후 전체 삭제
- **거래금액 미리보기**: 수량 × 단가 실시간 계산 표시

#### 계산 기능
- 종목별: 평가금액, 매입금액, 평가손익, 수익률(%)
- 전체: `totalAssetValue`, `totalCost`, `totalPnL`, `totalPnLPct`

#### UI
- **내자산 탭** 신규 추가
  - 포트폴리오 총괄 카드 (그라디언트, 총평가금액/손익/수익률)
  - 그룹별 비중 요약 바 (5그룹 컬러 도트)
  - 자산 카드 목록 (종목별 수량/평단가/현재가/평가금액/손익)
  - 자산 추가 버튼 / 폼
- **매매기록 탭** 신규 추가
  - 매수/매도 선택 버튼
  - 날짜/종목/수량/단가/메모 입력 폼
  - 거래금액 실시간 미리보기
  - 최근 거래 10건 간략 요약

#### 현재가 업데이트 구조
- `updatePrice()`: 향후 API 연결을 위한 비동기 구조. 현재 Mock ±2% 변동
- `updateAllPrices()`: 전체 자산 일괄 업데이트 + 로딩 상태 관리

#### 샘플 데이터
- 5종 기본 자산 제공 (TIGER S&P500, 나스닥100, 배당다우존스, KODEX 단기채권, 현금)

### 변경 (Changed)
- 기존 메뉴 배열에 `내자산(assets)`, `매매기록(trades)` 탭 추가 (총 13개)
- `assetForm`에 `ticker` 필드 추가

---

## [초기 버전] — 2026-06 이전

### 포함 기능 (기존 프롬프트 생성기)
- **종목발굴** — 섹터/스타일/기간/수익률/개수 선택 후 RICE 프롬프트 생성
- **내종목** — 관심 종목 직접 선택 후 심층 분석 프롬프트 생성
- **모닝브리핑** — 단타용 뉴스/시장 선택 후 프롬프트 생성
- **재무분석** — ROE/안정성/성장성 중심 재무 분석 프롬프트
- **밸류에이션** — PER/PBR/DCF 적정 주가 산출 프롬프트
- **기술적 분석** — 일봉/주봉/월봉 차트 분석 프롬프트
- **질적 분석** — 경쟁우위/경영진/ESG 분석 프롬프트
- **리스크 분석** — 시나리오별 손익 관리 프롬프트
- **포트폴리오** — 금액/배분 전략별 프롬프트
- **ETF 분석** — ETF 비교 및 포트폴리오 프롬프트
- **용어 사전** — 주식 기본/재무/밸류/ETF/매매/기술적 용어 설명
- **프롬프트 히스토리** — 최근 10개 저장 및 불러오기
- **복사 기능** — 생성된 프롬프트 클립보드 복사
- **RICE 프레임워크** — Role/Instruction/Context/Execution 구조 적용
- **시간 기반 지시문** — 프롬프트 앞에 현재 시각 자동 삽입 (최신 데이터 요청)

---

## 버전 규칙

| 태그 | 설명 |
|------|------|
| `[Phase X]` | 기능 추가 Phase 완료 |
| `[Phase RX]` | 리팩터링 Phase 완료 |
| `[Hotfix]` | 긴급 버그 수정 |
| `[미출시]` | 현재 개발 중인 변경사항 |

---

*© 리얼리더십 | 퇴사한아빠 신주일*
