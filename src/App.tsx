import { useEffect, useRef, useState, useCallback } from 'react';

/* ─── Horizontal Scroll Hook (with momentum drag) ─── */
function useHorizontalScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const hasMoved = useRef(false);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const animFrame = useRef(0);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);

    const momentumScroll = () => {
      if (Math.abs(velocity.current) < 0.5) return;
      el.scrollLeft += velocity.current;
      velocity.current *= 0.92;
      animFrame.current = requestAnimationFrame(momentumScroll);
    };

    const onMouseDown = (e: MouseEvent) => {
      cancelAnimationFrame(animFrame.current);
      isDragging.current = true;
      hasMoved.current = false;
      startX.current = e.pageX;
      lastX.current = e.pageX;
      lastTime.current = Date.now();
      scrollStart.current = el.scrollLeft;
      velocity.current = 0;
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.pageX - startX.current;
      if (Math.abs(dx) > 5) hasMoved.current = true;

      const now = Date.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        velocity.current = (lastX.current - e.pageX) / dt * 16;
      }
      lastX.current = e.pageX;
      lastTime.current = now;

      el.scrollLeft = scrollStart.current - dx;
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      el.style.cursor = 'grab';
      el.style.userSelect = '';
      if (Math.abs(velocity.current) > 1) {
        animFrame.current = requestAnimationFrame(momentumScroll);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (hasMoved.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.style.cursor = 'grab';
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('click', onClick, true);

    return () => {
      cancelAnimationFrame(animFrame.current);
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('click', onClick, true);
    };
  }, [checkScroll]);

  const scrollBy = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(':scope > div:first-child')?.clientWidth ?? 400;
    el.scrollBy({ left: dir === 'right' ? cardWidth + 16 : -(cardWidth + 16), behavior: 'smooth' });
  }, []);

  return { scrollRef, canScrollLeft, canScrollRight, scrollBy };
}

/* ─── Scroll Navigation Arrows ─── */
function ScrollArrows({ canScrollLeft, canScrollRight, onScroll }: {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScroll: (dir: 'left' | 'right') => void;
}) {
  return (
    <div className="hidden sm:flex items-center gap-2">
      <button
        onClick={() => onScroll('left')}
        disabled={!canScrollLeft}
        className={`w-8 h-8 rounded border flex items-center justify-center transition-colors font-mono text-sm
          ${canScrollLeft
            ? 'border-[#333] text-[#888] hover:border-[#00ff41]/50 hover:text-[#00ff41] cursor-pointer'
            : 'border-[#1a1a1a] text-[#333] cursor-not-allowed'}`}
        aria-label="이전"
      >
        {'<'}
      </button>
      <button
        onClick={() => onScroll('right')}
        disabled={!canScrollRight}
        className={`w-8 h-8 rounded border flex items-center justify-center transition-colors font-mono text-sm
          ${canScrollRight
            ? 'border-[#333] text-[#888] hover:border-[#00ff41]/50 hover:text-[#00ff41] cursor-pointer'
            : 'border-[#1a1a1a] text-[#333] cursor-not-allowed'}`}
        aria-label="다음"
      >
        {'>'}
      </button>
    </div>
  );
}

/* ─── Intersection Observer Hook ─── */
function useFadeIn() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Typing Effect Hook ─── */
function useTyping(text: string, speed = 50, delay = 300) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return { displayed, done };
}

/* ─── Terminal Window Chrome ─── */
function TerminalWindow({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111] border-b border-[#1a1a1a]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs font-mono text-[#666]">{title}</span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

/* ─── Data ─── */
const NAV_ITEMS = ['About', 'Experience', 'Projects', 'Skills', 'Contact'];

const EXPERIENCE = [
  {
    period: '2023.11 - 2025.01',
    company: '본도 (삼성화재 파견)',
    role: '프론트엔드 개발자',
    items: [
      {
        title: '삼성화재 다이렉트착 앱 운영 / 보험 계약관리',
        period: '2023.11 ~ 2025.01',
        desc: '삼성화재 다이렉트착 앱과 보험 계약관리, 자동차 보험 관련 서비스의 프론트엔드 운영을 담당했습니다.',
        env: 'JavaScript, React, Vue',
        projectId: 'project-samsung',
      },
    ],
    tags: ['React', 'Vue', 'JavaScript'],
  },
  {
    period: '2020.10 - 2023.03',
    company: '크로니즈 시스템 (CJ올리브네트웍스 파견)',
    role: '풀스택 개발자',
    items: [
      {
        title: 'CJ제일제당 식품 MES 고도화',
        period: '2022.05 ~ 2022.12',
        desc: '실적 관리 및 모바일(PDA) 품질 기능 담당, jQuery → React 기반 구조 전환 리팩토링.',
        env: 'Java, Oracle, React, MSA',
        projectId: 'project-mes-cj',
      },
      {
        title: '쟈뎅 MES 시스템 구축',
        period: '2021.12 ~ 2022.05',
        desc: 'BOM, 재고 현황, 자재 이동 등 생산관리 핵심 화면 개발 및 품질관리/결재 프로세스 구현.',
        env: 'Java, JavaScript, MSSQL, React, Syncfusion, UbiReport',
        projectId: 'project-mes-jadein',
      },
      {
        title: '제일제당 컬티 BIO HACCP 구축',
        period: '2021.06 ~ 2021.11',
        desc: '잔당 실적 처리, 품질관리, 일지 입력 및 레포트 출력 기능 개발.',
        env: 'Java, JavaScript, MSSQL, Micube Framework, JasperReport',
        projectId: 'project-haccp-culti',
      },
      {
        title: '화요 HACCP 솔루션 구축',
        period: '2021.01 ~ 2021.06',
        desc: '일지 결재 및 상품일지 기능 개발, 수기 업무를 시스템으로 전환하는 프로세스 구현.',
        env: 'Java, MSSQL, Vue.js, Spring Framework',
        projectId: 'project-haccp-hwayo',
      },
    ],
    tags: ['Java', 'Spring', 'Vue', 'React', 'JavaScript', 'MSSQL', 'Oracle', 'JasperReport', 'UbiReport'],
  },
  {
    period: '2019.12 - 2020.06',
    company: '비트캠프',
    role: '교육 수료',
    items: [
      {
        title: 'Java 기반 웹앱 개발자 양성 과정',
        period: '2019.12 ~ 2020.06',
        desc: 'Java, Spring, JSP/Servlet, RDBMS 기반 웹 애플리케이션 개발 교육 과정 수료. 팀 프로젝트를 통한 실전 경험.',
        env: 'Java, Spring, JSP, MySQL',
        projectId: null,
      },
    ],
    tags: ['Java', 'Spring', 'JSP', 'MySQL'],
  },
];

const PROJECTS = [
  {
    id: 'project-pcpricetrack',
    title: 'PCPriceTrack',
    subtitle: 'PC 부품 실시간 가격 추적 서비스',
    period: { start: '2026-03', end: null },
    company: null as string | null,
    role: '개인 프로젝트',
    liveUrl: 'https://pc-price-track-web.vercel.app/' as string | null,
    githubUrl: 'https://github.com/HyuckHee' as string | null,
    desc: '국내외 PC 부품 가격을 비교하려면 여러 쇼핑몰을 직접 돌아다녀야 하고, 가격 변동 추이를 확인할 방법이 없었습니다.',
    solution: [
      'NestJS + Bull Queue 기반의 분산 크롤링 파이프라인 설계',
      'Playwright 헤드리스 브라우저로 6개 쇼핑몰 자동 수집',
      'Redis 기반 서킷브레이커로 스토어별 장애 자동 격리',
      'append-only 가격 이력 테이블로 시계열 분석 기반 구축',
      'Next.js App Router SSR + 인터랙티브 환율 전환',
    ],
    result: '6개 스토어에서 30분~2시간 주기로 가격 자동 수집, 30일 가격 히스토리 차트, 목표가 알림 기능 구현.',
    note: 'Oracle Cloud 인스턴스 생성 자체 오류로 인해 완전 무료 스택으로 서버 전환 완료. Frontend(Vercel) · Backend API(Render) · DB(Supabase) · Redis(Upstash) · 크롤러(로컬 노트북) 구성으로 운영 비용 $0/월 달성.',
    tags: ['Next.js 15', 'NestJS', 'PostgreSQL', 'Drizzle ORM', 'Bull + Redis', 'Playwright', 'Tailwind CSS', 'Docker'],
    highlights: [
      { label: '아키텍처', value: 'Scheduler → Queue → Processor 3단 분리' },
      { label: '데이터', value: 'append-only 설계로 가격 이력 무손실 보존' },
      { label: '안정성', value: '서킷브레이커 + 지수 백오프 재시도' },
      { label: '모노레포', value: 'Turborepo + pnpm 워크스페이스' },
    ],
    diagram: `┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Scheduler  │────▶│  Bull Queue  │────▶│  Processor  │
│  (Cron)     │     │  (Redis)     │     │ (Playwright)│
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                    ┌──────────────┐             │
                    │ Circuit      │◀────────────┘
                    │ Breaker      │
                    └──────┬───────┘
                           │
              ┌────────────▼────────────┐
              │   PostgreSQL (Supabase) │
              │   append-only prices    │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  Next.js SSR (Vercel)   │
              │  가격 차트 + 환율 전환    │
              └─────────────────────────┘`,
  },
  {
    id: 'project-ktx-helper',
    title: 'KTX 자동 예매 도우미',
    subtitle: 'KTX 빈자리 자동 감지 & 예매 Chrome 확장',
    period: { start: '2026-03', end: null },
    company: null as string | null,
    role: '개인 프로젝트',
    liveUrl: null,
    githubUrl: 'https://github.com/HyuckHee' as string | null,
    desc: 'KTX 인기 노선은 매진이 잦아 취소표를 잡으려면 수동으로 새로고침을 반복해야 합니다.',
    solution: [
      'Chrome Extension Manifest V3 기반 설계',
      'MAIN world 스크립트 주입으로 React 렌더링 DOM의 이벤트 핸들러 직접 호출',
      'MutationObserver로 동적 팝업 실시간 감지 및 자동 처리',
      '시간대 필터링 및 입석/예약대기 옵션 지원',
      '드래그 가능한 플로팅 퀵바 UI',
    ],
    result: '5초 간격 자동 탐색으로 취소표 발생 즉시 좌석 선택부터 예매 확인까지 전 과정 자동화.',
    tags: ['Chrome Extension', 'Manifest V3', 'JavaScript', 'Web Audio API', 'MutationObserver'],
    highlights: [
      { label: '아키텍처', value: 'Service Worker + Content Script 2계층' },
      { label: '핵심 기술', value: 'React DOM 이벤트 직접 호출' },
      { label: '자동화', value: '좌석 감지 → 클릭 → 팝업 확인 → 예매' },
      { label: 'UX', value: '드래그 퀵바 + 시간 프리셋 + 실시간 로그' },
    ],
    diagram: `┌──────────────────┐     ┌──────────────────┐
│ Service Worker   │────▶│  Content Script  │
│ (Background)     │     │  (MAIN world)    │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         │  chrome.runtime        │  DOM 이벤트
         │  .sendMessage          │  직접 호출
         │                        ▼
         │               ┌──────────────────┐
         │               │  KTX 예매 페이지  │
         │               │  React DOM       │
         │               └────────┬─────────┘
         │                        │
         │               MutationObserver
         │                        │
         ▼                        ▼
┌──────────────────┐     ┌──────────────────┐
│  퀵바 UI         │     │  자동 예매 Flow   │
│  (Floating)      │     │  감지→클릭→확인   │
└──────────────────┘     └──────────────────┘`,
  },
  {
    id: 'project-samsung',
    title: '삼성화재 다이렉트착 앱 운영',
    subtitle: '보험 계약관리 프론트엔드 운영',
    period: { start: '2023-11', end: '2025-01' },
    company: '본도 (삼성화재 파견)',
    role: '프론트엔드 개발자',
    liveUrl: null,
    githubUrl: null,
    desc: '삼성화재 다이렉트착 앱과 보험 계약관리, 자동차 보험 관련 서비스의 프론트엔드 운영을 담당했습니다.',
    solution: [
      '다이렉트착 앱과 보험 계약관리, 자동차 보험 서비스 프론트엔드 운영',
      '실서비스 환경에서 화면 유지보수와 기능 개선',
      '보험 도메인 특성에 맞는 정확도 높은 UI 개발',
    ],
    result: '서비스 운영 안정성을 유지하며 사용자 경험 개선에 기여.',
    tags: ['JavaScript', 'React', 'Vue'],
    highlights: [
      { label: '기간', value: '1년 2개월' },
      { label: '역할', value: '프론트엔드 운영 및 기능 개선' },
      { label: '도메인', value: '자동차보험 / 장기계약 / 계약관리' },
    ],
    diagram: `┌─────────────────────────────────────┐
│         다이렉트착 앱 (Mobile)       │
├──────────┬──────────┬───────────────┤
│ 자동차   │ 장기     │ 계약관리       │
│ 보험     │ 보험     │               │
├──────────┴──────────┴───────────────┤
│  Frontend: React + Vue              │
│  Vue → React 점진적 마이그레이션     │
├─────────────────────────────────────┤
│  API Gateway / Backend              │
└─────────────────────────────────────┘`,
  },
  {
    id: 'project-mes-cj',
    title: 'CJ제일제당 식품 MES 고도화',
    subtitle: 'CJ 식품 제조실행시스템 모던화',
    period: { start: '2022-05', end: '2022-12' },
    company: '크로니즈 시스템 (CJ올리브네트웍스 파견)',
    role: '풀스택 개발자',
    liveUrl: null,
    githubUrl: null,
    desc: 'jQuery 기반 레거시 MES 시스템의 유지보수가 어렵고, 신규 기능 추가 시 개발 속도가 현저히 느렸습니다.',
    solution: [
      '실적 관리 및 모바일(PDA) 품질 관련 기능 담당',
      'jQuery 기반 프로젝트를 React 기반 구조로 전환',
      '레거시 구조 개선으로 확장성과 유지보수성 향상',
    ],
    result: '기존 프론트엔드 구조를 현대화하여 유지보수 효율과 개발 생산성을 향상.',
    tags: ['Java', 'React', 'Oracle', 'MSA'],
    highlights: [
      { label: '전환', value: 'jQuery → React 마이그레이션' },
      { label: '모바일', value: 'PDA 품질관리 기능 대응' },
      { label: '환경', value: 'MSA 구조' },
    ],
    diagram: `┌────────────┐          ┌────────────┐
│  jQuery    │ ──────▶  │   React    │
│  (Legacy)  │ 전환     │  (Modern)  │
└────────────┘          └─────┬──────┘
                              │
         ┌────────────────────┼────────────┐
         │                    │            │
    ┌────▼─────┐    ┌────────▼──┐   ┌─────▼────┐
    │ 실적관리  │    │ 품질관리   │   │ PDA 모바일│
    │ 화면     │    │ 화면      │   │ 품질기능  │
    └──────────┘    └───────────┘   └──────────┘
         │                │              │
         └────────────────┼──────────────┘
                     ┌────▼────┐
                     │ Oracle  │
                     │   DB    │
                     └─────────┘`,
  },
  {
    id: 'project-mes-jadein',
    title: '쟈뎅 MES 시스템 구축',
    subtitle: '식음료 공장 제조실행시스템 신규 구축',
    period: { start: '2021-12', end: '2022-05' },
    company: '크로니즈 시스템 (CJ올리브네트웍스 파견)',
    role: '풀스택 개발자',
    liveUrl: null,
    githubUrl: null,
    desc: '쟈뎅 공장은 생산관리 시스템이 없었고, 수작업으로 관리되던 생산/품질 업무를 전산화해야 했습니다.',
    solution: [
      'BOM, 재고 현황, 자재 이동 등 생산관리 핵심 화면 개발',
      '품질관리 및 결재 프로세스 기능 구현',
      'UbiReport 기반 일지/레포트 전산화',
    ],
    result: '생산 및 품질관리 업무를 시스템 중심으로 운영 가능하게 하여 현장 운영 편의성과 데이터 접근성을 개선.',
    tags: ['Java', 'JavaScript', 'React', 'MSSQL', 'Syncfusion', 'UbiReport'],
    highlights: [
      { label: '범위', value: 'BOM / 재고 / 자재이동 / 품질관리' },
      { label: '리포트', value: 'UbiReport 전산화' },
      { label: '환경', value: '제조 현장 운영 시스템' },
    ],
    diagram: `┌──────────────────────────────────┐
│        쟈뎅 MES System           │
├────────┬────────┬────────┬───────┤
│  BOM   │  재고  │ 자재   │ 품질  │
│  관리  │  현황  │ 이동   │ 관리  │
├────────┴────────┴────────┴───────┤
│  React + Syncfusion Grid         │
├──────────────────────────────────┤
│  Java / Spring Backend           │
├──────────────────────────────────┤
│  MSSQL  │  UbiReport (일지출력)  │
└─────────┴────────────────────────┘`,
  },
  {
    id: 'project-haccp-culti',
    title: '제일제당 컬티 BIO HACCP',
    subtitle: 'CJ BIO 생산 품질관리 시스템',
    period: { start: '2021-06', end: '2021-11' },
    company: '크로니즈 시스템 (CJ올리브네트웍스 파견)',
    role: '풀스택 개발자',
    liveUrl: null,
    githubUrl: null,
    desc: 'CJ BIO 공장의 생산 품질관리 업무가 수기로 이루어져 데이터 관리와 법적 인증 요건 충족이 어려웠습니다.',
    solution: [
      '잔당 실적 처리, 품질관리 기능 개발',
      '일지 입력 및 레포트 출력 기능 구현',
      'JasperReport 기반 법적 요구사항 충족 자동 리포트 생성',
    ],
    result: '수작업으로 관리되던 품질 관련 업무를 시스템화하여 운영 효율을 높이고, 품질관리 프로세스를 체계화.',
    tags: ['Java', 'JavaScript', 'MSSQL', 'Micube Framework', 'JasperReport'],
    highlights: [
      { label: '리포트', value: 'JasperReport 자동 출력' },
      { label: '범위', value: '잔당 실적 / 품질관리 / 일지' },
      { label: '환경', value: 'BIO 생산 현장' },
    ],
    diagram: `┌──────────────────────────────┐
│    컬티 BIO HACCP System     │
├──────────┬───────┬───────────┤
│ 잔당실적 │ 품질  │  일지입력  │
│ 처리     │ 관리  │           │
├──────────┴───────┴───────────┤
│  Micube Framework            │
├──────────────────────────────┤
│  MSSQL   │  JasperReport    │
│  (Data)  │  (법적 리포트)    │
└──────────┴───────────────────┘`,
  },
  {
    id: 'project-haccp-hwayo',
    title: '화요 HACCP 솔루션',
    subtitle: '식품 제조 공정 관리 시스템',
    period: { start: '2021-01', end: '2021-06' },
    company: '크로니즈 시스템 (CJ올리브네트웍스 파견)',
    role: '풀스택 개발자',
    liveUrl: null,
    githubUrl: null,
    desc: '생산 현장에서 HACCP 관련 일지를 수기로 작성하여 데이터 추적과 인증 관리가 비효율적이었습니다.',
    solution: [
      '일지 결재 및 상품일지 기능 개발',
      '수기 업무를 시스템으로 전환하는 프로세스 구현',
      '현장 사용성을 고려한 기능 개발',
    ],
    result: 'SMART HACCP 인증 획득에 기여. 수기 일지 전산화로 업무 효율성과 데이터 관리 정확도를 높임.',
    tags: ['Java', 'Vue.js', 'MSSQL', 'Spring Framework'],
    highlights: [
      { label: '성과', value: 'SMART HACCP 인증 기여' },
      { label: '전환', value: '수기 일지 → 전산화' },
      { label: '범위', value: '일지 결재 / 상품일지' },
    ],
    diagram: `┌──────────────────────────────┐
│    화요 HACCP Solution       │
├──────────────┬───────────────┤
│  일지 결재    │  상품일지     │
│  프로세스     │  기능         │
├──────────────┴───────────────┤
│  수기 ──────▶ 전산화         │
├──────────────────────────────┤
│  Vue.js + Spring Framework   │
├──────────────────────────────┤
│  MSSQL                       │
├──────────────────────────────┤
│  ✓ SMART HACCP 인증 획득     │
└──────────────────────────────┘`,
  },
];

/* ─── Skills ─── */
const CDN = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';
const SKILL_GROUPS = [
  {
    category: 'Frontend',
    skills: [
      { name: 'React', icon: `${CDN}/react/react-original.svg` },
      { name: 'Vue 3', icon: `${CDN}/vuejs/vuejs-original.svg` },
      { name: 'Next.js', icon: `${CDN}/nextjs/nextjs-original.svg` },
      { name: 'TypeScript', icon: `${CDN}/typescript/typescript-original.svg` },
      { name: 'JavaScript', icon: `${CDN}/javascript/javascript-original.svg` },
      { name: 'Tailwind CSS', icon: `${CDN}/tailwindcss/tailwindcss-original.svg` },
      { name: 'HTML / CSS', icon: `${CDN}/html5/html5-original.svg` },
    ],
  },
  {
    category: 'Backend',
    skills: [
      { name: 'Java', icon: `${CDN}/java/java-original.svg` },
      { name: 'Spring', icon: `${CDN}/spring/spring-original.svg` },
      { name: 'NestJS', icon: `${CDN}/nestjs/nestjs-original.svg` },
      { name: 'Node.js', icon: `${CDN}/nodejs/nodejs-original.svg` },
    ],
  },
  {
    category: 'Database',
    skills: [
      { name: 'PostgreSQL', icon: `${CDN}/postgresql/postgresql-original.svg` },
      { name: 'MSSQL', icon: `${CDN}/microsoftsqlserver/microsoftsqlserver-original.svg` },
      { name: 'Oracle', icon: `${CDN}/oracle/oracle-original.svg` },
      { name: 'MySQL', icon: `${CDN}/mysql/mysql-original.svg` },
    ],
  },
  {
    category: 'Infra / Tools',
    skills: [
      { name: 'Docker', icon: `${CDN}/docker/docker-original.svg` },
      { name: 'Redis', icon: `${CDN}/redis/redis-original.svg` },
      { name: 'Git', icon: `${CDN}/git/git-original.svg` },
      { name: 'VS Code', icon: `${CDN}/vscode/vscode-original.svg` },
      { name: 'IntelliJ', icon: `${CDN}/intellij/intellij-original.svg` },
      { name: 'Figma', icon: `${CDN}/figma/figma-original.svg` },
    ],
  },
];

/* ─── Gantt Colors ─── */
const GANTT_COLOR: Record<string, string> = {
  'project-haccp-hwayo':  'bg-green-500',
  'project-haccp-culti':  'bg-green-600',
  'project-mes-jadein':   'bg-green-400',
  'project-mes-cj':       'bg-emerald-500',
  'project-samsung':      'bg-[#00ff41]',
  'project-pcpricetrack': 'bg-lime-400',
  'project-ktx-helper':   'bg-teal-400',
};

/* ═══════════════════════════════════════════
   Components
═══════════════════════════════════════════ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all font-mono ${scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-[#1a1a1a]' : ''}`}>
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#" className="text-sm font-bold tracking-tight text-[#00ff41]">
          ~/hyuckhee.dev
        </a>
        <div className="hidden sm:flex items-center gap-5">
          {NAV_ITEMS.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-xs text-[#666] hover:text-[#00ff41] transition-colors">
              <span className="text-[#444]">./</span>{item.toLowerCase()}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const { displayed: line1, done: done1 } = useTyping('안녕하세요, 저는', 40, 500);
  const { displayed: line2, done: done2 } = useTyping('이혁희', 80, 1200);
  const { displayed: line3 } = useTyping('실무형 풀스택 개발자입니다.', 30, 2000);

  return (
    <section className="min-h-[90vh] flex items-center pt-14">
      <div className="max-w-5xl mx-auto px-6 w-full">
        <TerminalWindow title="hyuckhee@dev ~ % intro">
          <div className="font-mono space-y-2">
            <div className="text-[#666] text-xs mb-4">Last login: {new Date().toLocaleDateString('ko-KR')} on ttys001</div>

            <div className="flex items-start gap-2">
              <span className="text-[#00ff41] shrink-0">$</span>
              <span className="text-[#ccc]">{line1}{!done1 && <span className="animate-pulse text-[#00ff41]">_</span>}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-[#00ff41] shrink-0">$</span>
              <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {line2}{done1 && !done2 && <span className="animate-pulse text-[#00ff41]">_</span>}
                <span className="text-[#333]">.</span>
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-[#00ff41] shrink-0">$</span>
              <span className="text-lg sm:text-xl text-[#888]">
                {line3}{done2 && <span className="animate-pulse text-[#00ff41]">_</span>}
              </span>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1a1a1a]">
              <p className="text-[#777] text-sm leading-relaxed font-sans">
                4년간 <span className="text-[#00ff41]">삼성화재 보험 서비스</span>, <span className="text-[#00ff41]">CJ 제조 시스템</span>을 개발하며
                레거시 개선부터 신규 서비스 구축까지 경험했습니다.
              </p>
              <p className="text-[#777] text-sm leading-relaxed font-sans mt-2">
                <span className="text-[#ccc]">React/Vue 프론트엔드</span>와 <span className="text-[#ccc]">Java/Node.js 백엔드</span>를 넘나드는 풀스택 역량으로
                비즈니스 문제를 기술로 해결합니다.
              </p>
            </div>

            <div className="flex gap-3 mt-6 font-mono">
              <a href="#projects" className="bg-[#00ff41] hover:bg-[#00cc33] text-black px-5 py-2.5 rounded text-sm font-semibold transition-colors">
                ls ./projects
              </a>
              <a href="#contact" className="border border-[#333] hover:border-[#00ff41]/50 text-[#888] hover:text-[#00ff41] px-5 py-2.5 rounded text-sm transition-colors">
                cat contact.txt
              </a>
            </div>
          </div>
        </TerminalWindow>
      </div>
    </section>
  );
}

function About() {
  const ref = useFadeIn();
  return (
    <section id="about" ref={ref} className="fade-section py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold font-mono mb-8 flex items-center gap-2">
          <span className="text-[#00ff41]">#</span> About
          <span className="text-[#333] text-sm font-normal ml-2">// 소개</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <TerminalWindow title="about.md">
            <div className="space-y-3 text-[#999] text-sm leading-relaxed font-sans">
              <p className="text-[#555] font-mono text-xs">/* 경력 요약 */</p>
              <p>
                동서울대학교 기계자동차과를 졸업하고, 개발자로의 전환을 위해 비트캠프에서 Java 기반 웹앱 개발 과정을 수료했습니다.
                이후 방송통신대학교 컴퓨터과학과를 졸업하며 CS 기초를 다졌습니다.
              </p>
              <p>
                <span className="text-[#ccc]">크로니즈 시스템</span>에서 2년 반 동안 CJ올리브네트웍스 파견으로
                HACCP 솔루션과 MES 시스템을 처음부터 구축하며 풀스택 역량을 키웠습니다.
              </p>
              <p>
                <span className="text-[#ccc]">삼성화재</span>에서는 다이렉트 보험 서비스의 프론트엔드를 담당하며
                대규모 사용자 대상 서비스 운영 경험과 Vue→React 마이그레이션 경험을 쌓았습니다.
              </p>
            </div>
          </TerminalWindow>

          <TerminalWindow title="profile.json">
            <pre className="text-sm font-mono leading-relaxed">
              <span className="text-[#555]">{'{'}</span>{'\n'}
              {'  '}<span className="text-[#00ff41]">"경력"</span><span className="text-[#555]">:</span> <span className="text-[#e5c07b]">"4년차 풀스택 개발자"</span><span className="text-[#555]">,</span>{'\n'}
              {'  '}<span className="text-[#00ff41]">"강점"</span><span className="text-[#555]">:</span> <span className="text-[#e5c07b]">"React/Vue 듀얼 프레임워크"</span><span className="text-[#555]">,</span>{'\n'}
              {'  '}<span className="text-[#00ff41]">"특기"</span><span className="text-[#555]">:</span> <span className="text-[#e5c07b]">"레거시 → 모던 스택 전환"</span><span className="text-[#555]">,</span>{'\n'}
              {'  '}<span className="text-[#00ff41]">"학력"</span><span className="text-[#555]">:</span> <span className="text-[#e5c07b]">"방송통신대 컴퓨터과학과"</span><span className="text-[#555]">,</span>{'\n'}
              {'  '}<span className="text-[#00ff41]">"교육"</span><span className="text-[#555]">:</span> <span className="text-[#e5c07b]">"비트캠프 Java 웹앱 (2020)"</span>{'\n'}
              <span className="text-[#555]">{'}'}</span>
            </pre>
          </TerminalWindow>
        </div>
      </div>
    </section>
  );
}

function Experience() {
  const ref = useFadeIn();
  const { scrollRef: expScrollRef, canScrollLeft: expLeft, canScrollRight: expRight, scrollBy: expScroll } = useHorizontalScroll();
  return (
    <section id="experience" ref={ref} className="fade-section py-24 bg-[#0d0d0d]/50">
      <div className="max-w-5xl mx-auto px-6 flex items-end justify-between mb-8">
        <h2 className="text-2xl font-bold font-mono flex items-center gap-2">
          <span className="text-[#00ff41]">#</span> Experience
          <span className="text-[#333] text-sm font-normal ml-2">// 경력사항</span>
        </h2>
        <ScrollArrows canScrollLeft={expLeft} canScrollRight={expRight} onScroll={expScroll} />
      </div>
      <div className="pl-6 sm:pl-[max(1.5rem,calc((100vw-64rem)/2+1.5rem))]">
        <div ref={expScrollRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {EXPERIENCE.map((exp) => (
            <div key={exp.period} className="min-w-[320px] sm:min-w-[400px] max-w-[400px] shrink-0 snap-start">
              <TerminalWindow title={`${exp.company} — ${exp.role}`}>
                <div className="space-y-3">
                  <div className="font-mono text-xs text-[#00ff41]">
                    <span className="text-[#555]">period:</span> {exp.period}
                  </div>
                  {exp.items.map((item, i) => (
                    <div key={i} className="border border-[#1a1a1a] rounded-lg p-3 bg-[#080808]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[#ccc] font-mono text-xs font-semibold mb-1">{item.title}</h4>
                          <p className="text-[#555] font-mono text-[10px] mb-1.5">{item.period}</p>
                          <p className="text-[#777] text-xs leading-relaxed font-sans">{item.desc}</p>
                          <p className="text-[#444] font-mono text-[10px] mt-1.5">env: {item.env}</p>
                        </div>
                        {item.projectId && (
                          <a href={`#${item.projectId}`} className="shrink-0 text-[10px] font-mono bg-[#111] border border-[#222] hover:border-[#00ff41]/30 text-[#555] hover:text-[#00ff41] px-2 py-1 rounded transition-colors">
                            goto →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {exp.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono bg-[#00ff41]/5 text-[#00ff41]/70 border border-[#00ff41]/10 px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              </TerminalWindow>
            </div>
          ))}
          <div className="min-w-6 shrink-0" />
        </div>
      </div>
    </section>
  );
}

/* ─── Gantt Chart ─── */
function ProjectGantt() {
  const ref = useFadeIn();

  const rangeStart = new Date(2020, 9);
  const rangeEnd   = new Date(2026, 5);
  const totalMonths = (rangeEnd.getFullYear() - rangeStart.getFullYear()) * 12
    + (rangeEnd.getMonth() - rangeStart.getMonth());

  const toPercent = (dateStr: string) => {
    const [y, m] = dateStr.split('-').map(Number);
    const months = (y - rangeStart.getFullYear()) * 12 + (m - 1 - rangeStart.getMonth());
    return Math.min((months / totalMonths) * 100, 100);
  };

  const nowStr = (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`; })();
  const years = [2021, 2022, 2023, 2024, 2025, 2026];
  const sorted = [...PROJECTS].sort((a, b) => a.period.start.localeCompare(b.period.start));

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="fade-section mb-8">
      <TerminalWindow title="timeline.log">
        <div className="relative h-6 mb-2 ml-[120px] sm:ml-[168px]">
          {years.map((y) => {
            const left = ((y - rangeStart.getFullYear()) * 12 - rangeStart.getMonth()) / totalMonths * 100;
            return (
              <span key={y} className="absolute text-[10px] font-mono text-[#444] -translate-x-1/2" style={{ left: `${left}%` }}>
                {y}
              </span>
            );
          })}
        </div>

        <div className="space-y-2">
          {sorted.map((project) => {
            const endStr = project.period.end ?? nowStr;
            const left  = toPercent(project.period.start);
            const right = toPercent(endStr);
            const width = right - left;
            const color = GANTT_COLOR[project.id] ?? 'bg-[#333]';
            const isOngoing = !project.period.end;

            const [sy, sm] = project.period.start.split('-');
            const [ey, em] = endStr.split('-');
            const label = isOngoing ? `${sy}.${sm} ~ 진행 중` : `${sy}.${sm} - ${ey}.${em}`;

            return (
              <a key={project.id} href={`#${project.id}`} className="flex items-center gap-3 group">
                <div className="w-[108px] sm:w-[156px] shrink-0 text-right pr-3">
                  <span className="text-[10px] sm:text-xs font-mono text-[#555] group-hover:text-[#00ff41] leading-tight block transition-colors">
                    {project.title}
                  </span>
                </div>
                <div className="flex-1 relative h-7 bg-[#111] rounded border border-[#1a1a1a]">
                  {years.map((y) => {
                    const pos = ((y - rangeStart.getFullYear()) * 12 - rangeStart.getMonth()) / totalMonths * 100;
                    return <div key={y} className="absolute top-0 bottom-0 w-px bg-[#1a1a1a]" style={{ left: `${pos}%` }} />;
                  })}
                  <div
                    className={`absolute top-1 bottom-1 rounded ${color} opacity-70 group-hover:opacity-100 transition-opacity flex items-center overflow-visible`}
                    style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                  >
                    <span className="text-[9px] sm:text-[10px] text-black font-mono font-bold px-1.5 whitespace-nowrap">
                      {label}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </TerminalWindow>
    </div>
  );
}

/* ─── Project Card ─── */
function ProjectCard({ project }: { project: typeof PROJECTS[0] }) {
  const ref = useFadeIn();
  const [sy, sm] = project.period.start.split('-');
  const periodLabel = project.period.end
    ? (() => { const [ey, em] = project.period.end!.split('-'); return `${sy}.${sm} ~ ${ey}.${em}`; })()
    : `${sy}.${sm} ~ 진행 중`;

  return (
    <article id={project.id} ref={ref} className="fade-section scroll-mt-20">
      <TerminalWindow title={`${project.title} — ${project.subtitle}`}>
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-lg sm:text-xl font-bold font-mono text-[#ccc]">{project.title}</h3>
            {project.company ? (
              <span className="text-[10px] font-mono bg-[#111] text-[#555] border border-[#222] px-2 py-0.5 rounded">{project.role}</span>
            ) : (
              <span className="text-[10px] font-mono bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/20 px-2 py-0.5 rounded">personal</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono mb-3">
            <span className="text-[#555]">{project.company ?? project.subtitle}</span>
            <span className="text-[#333]">{periodLabel}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-mono bg-[#080808] border border-[#1a1a1a] hover:border-[#00ff41]/30 text-[#555] hover:text-[#00ff41] px-2.5 py-1 rounded transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
                {new URL(project.liveUrl).hostname}
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-mono bg-[#080808] border border-[#1a1a1a] hover:border-[#333] text-[#555] hover:text-[#ccc] px-2.5 py-1 rounded transition-colors">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
                github
              </a>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-[#777] text-sm leading-relaxed font-sans">{project.desc}</p>
          <div>
            <h4 className="text-xs font-mono font-semibold text-[#00ff41] mb-2">// What I Did</h4>
            <ul className="space-y-1">
              {project.solution.map((s, i) => (
                <li key={i} className="text-[#888] text-xs leading-relaxed flex gap-2 font-sans">
                  <span className="text-[#00ff41] font-mono shrink-0">{'>'}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono font-semibold text-[#28c840] mb-1.5">// Result</h4>
            <p className="text-[#888] text-xs leading-relaxed font-sans">{project.result}</p>
          </div>
          {project.note && (
            <div className="flex items-start gap-2 bg-[#1a1a00] border border-[#333300] rounded px-3 py-2.5 mt-2">
              <span className="text-yellow-500 font-mono text-xs shrink-0">WARN:</span>
              <p className="text-yellow-500/70 text-[11px] leading-relaxed font-sans">{project.note}</p>
            </div>
          )}
        </div>

        {/* Highlights */}
        {project.highlights && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {project.highlights.map((h) => (
              <div key={h.label} className="bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2">
                <div className="text-[10px] font-mono text-[#444]">{h.label}</div>
                <div className="text-xs font-mono text-[#aaa]">{h.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Architecture Diagram */}
        {project.diagram && (
          <div className="mt-4 bg-[#080808] border border-[#1a1a1a] rounded p-4 overflow-x-auto">
            <div className="text-[10px] font-mono text-[#444] mb-2">// architecture</div>
            <pre className="text-[11px] sm:text-xs font-mono text-[#00ff41]/70 leading-relaxed whitespace-pre">{project.diagram}</pre>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {project.tags.map((t) => (
            <span key={t} className="text-[10px] font-mono bg-[#0a0a0a] text-[#555] px-2 py-0.5 rounded border border-[#1a1a1a]">{t}</span>
          ))}
        </div>
      </TerminalWindow>
    </article>
  );
}

function Projects() {
  const { scrollRef: projScrollRef, canScrollLeft: projLeft, canScrollRight: projRight, scrollBy: projScroll } = useHorizontalScroll();
  return (
    <section id="projects" className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-bold font-mono flex items-center gap-2">
            <span className="text-[#00ff41]">#</span> Projects
            <span className="text-[#333] text-sm font-normal ml-2">// 프로젝트</span>
          </h2>
          <ScrollArrows canScrollLeft={projLeft} canScrollRight={projRight} onScroll={projScroll} />
        </div>
        <ProjectGantt />
      </div>
      <div className="pl-6 sm:pl-[max(1.5rem,calc((100vw-64rem)/2+1.5rem))]">
        <div ref={projScrollRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {PROJECTS.map((p) => (
            <div key={p.id} className="min-w-[340px] sm:min-w-[520px] max-w-[520px] shrink-0 snap-start">
              <ProjectCard project={p} />
            </div>
          ))}
          <div className="min-w-6 shrink-0" />
        </div>
      </div>
    </section>
  );
}

/* ─── Skills ─── */
function Skills() {
  const ref = useFadeIn();
  return (
    <section id="skills" ref={ref} className="fade-section py-24 bg-[#0d0d0d]/50">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold font-mono mb-8 flex items-center gap-2">
          <span className="text-[#00ff41]">#</span> Skills
          <span className="text-[#333] text-sm font-normal ml-2">// 기술 스택</span>
        </h2>
        <div className="space-y-6">
          {SKILL_GROUPS.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-mono text-[#00ff41]/70 mb-3 uppercase tracking-wider">
                <span className="text-[#333]">$</span> ls ./{group.category.toLowerCase().replace(/ \/ /g, '-')}
              </h3>
              <div className="flex flex-wrap gap-3">
                {group.skills.map((skill) => (
                  <div key={skill.name}
                    className="flex items-center gap-2.5 bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#00ff41]/30 rounded px-3 py-2 transition-colors group cursor-default">
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      className="w-5 h-5 object-contain group-hover:brightness-125 transition"
                      loading="lazy"
                    />
                    <span className="text-xs font-mono text-[#777] group-hover:text-[#ccc] transition-colors">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 차별화 포인트 */}
        <div className="mt-10">
          <TerminalWindow title="differentiators.md">
            <h3 className="text-sm font-mono font-semibold text-[#00ff41] mb-4">// 차별화 포인트</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'React + Vue 듀얼 경험', desc: '삼성화재에서 Vue→React 마이그레이션을 직접 수행. 두 프레임워크의 차이와 전환 전략을 체득.' },
                { title: '레거시 → 모던 전환 전문', desc: 'jQuery→React, Vue→React 두 번의 대규모 마이그레이션 경험. 점진적 전환 전략 수립 가능.' },
                { title: '제조 도메인 + 보험 도메인', desc: '서로 다른 산업군에서의 실무 경험으로 빠른 도메인 학습 능력 보유.' },
                { title: '사이드 프로젝트로 증명하는 설계 역량', desc: 'PCPriceTrack으로 분산 크롤링, 서킷브레이커, 모노레포 등 직접 설계/구현.' },
              ].map((item) => (
                <div key={item.title} className="border border-[#1a1a1a] rounded p-3 bg-[#080808]">
                  <h4 className="text-xs font-mono text-[#ccc] mb-1">
                    <span className="text-[#00ff41]">*</span> {item.title}
                  </h4>
                  <p className="text-[11px] text-[#666] leading-relaxed font-sans">{item.desc}</p>
                </div>
              ))}
            </div>
          </TerminalWindow>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const ref = useFadeIn();
  return (
    <section id="contact" ref={ref} className="fade-section py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold font-mono mb-8 flex items-center gap-2">
          <span className="text-[#00ff41]">#</span> Contact
          <span className="text-[#333] text-sm font-normal ml-2">// 연락처</span>
        </h2>
        <TerminalWindow title="contact.sh" className="max-w-xl mx-auto">
          <div className="font-mono text-sm space-y-3">
            <div className="text-[#555] text-xs">#!/bin/bash</div>
            <div className="text-[#555] text-xs"># 함께 일할 기회를 찾고 있습니다.</div>
            <div className="text-[#555] text-xs"># 편하게 연락주세요.</div>
            <div className="mt-4" />
            <div className="flex items-center gap-2">
              <span className="text-[#00ff41]">$</span>
              <span className="text-[#888]">echo $EMAIL</span>
            </div>
            <a href="mailto:leehh4864@gmail.com" className="block text-[#00ff41] hover:underline pl-4">
              leehh4864@gmail.com
            </a>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#00ff41]">$</span>
              <span className="text-[#888]">echo $PHONE</span>
            </div>
            <a href="tel:010-5541-4864" className="block text-[#ccc] hover:text-[#00ff41] pl-4 transition-colors">
              010-5541-4864
            </a>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#00ff41]">$</span>
              <span className="text-[#888]">open $GITHUB</span>
            </div>
            <a href="https://github.com/HyuckHee" target="_blank" rel="noreferrer" className="block text-[#ccc] hover:text-[#00ff41] pl-4 transition-colors">
              github.com/HyuckHee
            </a>
          </div>
        </TerminalWindow>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] py-6">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-[#333]">
        <span>&copy; {new Date().getFullYear()} 이혁희 // All rights reserved</span>
        <span>built with React + Vite + Tailwind CSS</span>
      </div>
    </footer>
  );
}

/* ─── App ─── */
export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
