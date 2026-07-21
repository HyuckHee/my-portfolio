# 이혁희 — 풀스택 개발자

Email leehh4864@gmail.com · Phone 010-5541-4864 · GitHub github.com/HyuckHee · Portfolio my-portfolio-hyuckhees-projects.vercel.app

## 요약

만 3년 7개월 실무 경험의 풀스택 개발자입니다. CJ 제조 시스템(MES/HACCP)과 삼성화재 보험 서비스라는 서로 다른 도메인에서 신규 구축과 운영을 모두 경험했습니다. jQuery→React, React→Vue 두 차례의 프레임워크 마이그레이션을 수행했으며, React와 Vue를 모두 실무에서 운영할 수 있습니다. 퇴사 후에는 방송통신대학교 컴퓨터과학과 학위를 마무리(2026.02 졸업)하고, Next.js·NestJS 기반 서비스를 설계부터 배포·운영까지 직접 완주하며 설계 역량을 보강했습니다.

## 경력

### 본도 (삼성화재 파견) — 프론트엔드 개발자

2023.11 ~ 2025.01 (1년 2개월)

**삼성화재 다이렉트 착 앱 운영 / 보험 계약관리**

- 다이렉트 착(현 My 삼성화재) 앱과 보험 계약관리, 자동차 보험 서비스의 프론트엔드 운영 담당
- 기획 요건에 따른 계약관리 화면 수정·개선 대응
- 약 15개 화면의 React→Vue 점진적 마이그레이션 수행
- 펫보험 등록 화면 개발 — VeeValidate 폼 검증, Vue 내장 반응형 상태로 단계별 폼 데이터 관리
- Atomic Design(atoms·molecules·organisms) 컴포넌트 구조로 재사용성 확보

환경: JavaScript, React, Vue, VeeValidate

### 크로니즈 시스템 (CJ올리브네트웍스 파견) — 풀스택 개발자

2020.10 ~ 2023.03 (2년 5개월)

**CJ제일제당 식품 MES 고도화 (2022.05 ~ 2022.12)**

- 실적 관리 및 모바일(PDA) 품질 기능 담당
- jQuery 기반 레거시를 React 기반 구조로 전환 리팩토링

환경: Java, Oracle, React, MSA

**쟈뎅 MES 시스템 구축 (2021.12 ~ 2022.05)**

- BOM, 재고 현황, 자재 이동 등 생산관리 핵심 화면 개발
- 품질관리 및 결재 프로세스 구현, UbiReport 기반 일지/레포트 전산화

환경: Java, JavaScript, MSSQL, React, Syncfusion, UbiReport

**제일제당 컬티 BIO HACCP 구축 (2021.06 ~ 2021.11)**

- 잔당 실적 처리, 품질관리, 일지 입력 및 레포트 출력 기능 개발
- JasperReport 기반 법적 요구사항 충족 자동 리포트 생성

환경: Java, JavaScript, MSSQL, Micube Framework, JasperReport

**화요 HACCP 솔루션 구축 (2021.01 ~ 2021.06)**

- CCP 모니터링(증류·용기세척), 발효, 종국 수불 등 공정별 관리 일지 화면 및 결재 프로세스 개발
- 수기로 관리되던 생산·품질 일지를 시스템으로 전환하는 프로세스 구현
- 현업(양조·생산·품질 담당자)과 매주 정기 회의를 진행하며 활발한 커뮤니케이션으로 현장의 요구사항을 파악하고, 실제 업무 흐름에 맞춰 반영하여 현업의 니즈를 충족
- SMART HACCP 인증 획득에 기여

환경: Java, MSSQL, Vue.js, Spring Framework

## 개인 프로젝트

### PCPriceTrack — PC 부품 실시간 가격 추적 서비스 (2026.03 ~)

github.com/HyuckHee/PCPriceTrack · pc-price-track-web.vercel.app

- NestJS + Bull Queue 기반 분산 크롤링 파이프라인 설계 (Scheduler → Queue → Processor 3단 분리)
- Playwright 헤드리스 브라우저로 6개 쇼핑몰 자동 수집, 30분~2시간 주기
- Redis 기반 서킷브레이커로 스토어별 장애 자동 격리, 지수 백오프 재시도
- append-only 가격 이력 테이블로 30일 가격 히스토리 차트·목표가 알림 구현
- Vercel·Render·Supabase·Upstash 조합으로 운영 비용 월 $0 달성

기술: Next.js 15, NestJS, PostgreSQL, Drizzle ORM, Bull + Redis, Playwright, Turborepo

### KTX 자동 예매 도우미 — Chrome 확장 (2026.03 ~)

github.com/HyuckHee/ktx-extension

- Chrome Extension Manifest V3, Service Worker + Content Script 2계층 설계
- MAIN world 스크립트 주입으로 React 렌더링 DOM의 이벤트 핸들러 직접 호출
- MutationObserver로 동적 팝업 실시간 감지, 좌석 감지→선택→예매 확인 자동화

기술: Manifest V3, Vanilla JavaScript, MutationObserver, Web Audio API

## 기술 스택

| 분류 | 기술 |
| --- | --- |
| Frontend | React, Vue 3, Next.js, TypeScript, JavaScript, Tailwind CSS |
| Backend | Java, Spring, NestJS, Node.js |
| Database | PostgreSQL, MSSQL, Oracle, MySQL |
| Infra / Tools | Docker, Redis, Git, Figma |

## 학력 및 교육

- **방송통신대학교 컴퓨터과학과** 졸업 (2026.02)
- **비트캠프** Java 기반 웹앱 개발자 양성 과정 수료 (2019.12 ~ 2020.06)
- **동서울대학교 기계자동차과** 졸업
