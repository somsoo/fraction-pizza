# 🍕 fraction-pizza (분수 피자 슬라이서) - Kiro 검수 및 인계 안내서

이 저장소(웹앱)는 2026-10-02 사용자 요청에 따라 Deep Research 에듀테크 보고서 1순위 과제로 독립 제작된 정식 웹앱입니다.
기존 166개 사이트 및 홈서버 시스템과의 충돌을 방지하기 위해 완전히 독립된 구성으로 패키징되었습니다.

## 1. 사이트 개요
* **서비스명:** 분수 피자 슬라이서 (Fraction Visualizer & Equal Slicer)
* **목표 도메인:** `https://fraction-pizza.enjoy-onepage.com/` (CNAME 등록 완료)
* **학습 대상:** 초등학교 3~6학년 분수 단원
* **핵심 기능:**
  1. 원형 피자 인터랙티브 SVG 분할 (삼각함수 호 계산 로직)
  2. 동치분수 판정 및 크기 비교 저울 (예: 1/2 == 2/4 == 4/8)
  3. 분수 덧셈 및 최소공배수(LCM) 기반 자동 통분 시뮬레이터
  4. Web Audio API 기반 오디오 피드백 (펜타토닉 음계 차임벨 및 성공 화음)
  5. 100% 클라이언트 사이드 로컬 연산 (서버 미전송 보증)

## 2. 준수된 아키텍처 및 표준 (WEBAPP_BUILD_STANDARD)
* **외부 의존성 제로:** Tailwind CDN 일체 배제, 순수 Vanilla CSS (`style.css`)
* **골드 스탠다드 3단 광고 파이프라인 탑재:**
  * 상단 슬림 배너 (`data-ad-slot="3824727725"`, 60px)
  * 중간 반응형 배너 (`data-ad-slot="1186914926"`)
  * 하단 대형 배너 (`data-ad-slot="3416334507"`)
  * 1:1 인라인 푸시 원칙 완벽 준수
* **신뢰성 페이지 구비:** `about.html`(교육과정 기준), `privacy.html`(프라이버시 보증)
* **SEO 및 메타데이터:** JSON-LD (`WebApplication`, `FAQPage`), OpenGraph, `robots.txt`, `sitemap.xml`, `rss.xml`, `manifest.json`

## 3. Kiro 사후 조치 옵션
* **옵션 A (정식 채택 및 영구 편입 시):**
  * `Webapp_Upgrade\repos\fraction-pizza`로 위치를 유지하거나 등록.
  * 홈서버가 2시간마다 돌 때 자동으로 대시보드와 허브 카드에 수집됩니다.
* **옵션 B (원클릭 롤백 및 흔적 없는 삭제 시):**
  * GitHub 저장소(`somsoo/fraction-pizza`)만 삭제하거나, 로컬 폴더를 삭제하면 기존 시스템에 단 1바이트의 영향도 남기지 않고 즉시 정리됩니다.
