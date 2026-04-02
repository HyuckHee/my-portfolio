import { useEffect, useRef, useState } from 'react';

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
    period: { start: '2025-02', end: '2025-03' },
    company: null as string | null,
    role: '개인 프로젝트',
    liveUrl: 'https://pc-price-track-web.vercel.app/' as string | null,
    githubUrl: 'https://github.com/HyuckHee' as string | null,
    desc: '국내외 PC 부품 가격을 비교하려면 여러 쇼핑몰을 직접 돌아다녀야 하고, 가격 변동 추이를 확인할 방법이 없었습니다.',
    solution: [
      'NestJS + Bull Queue 기반의 분산 크롤링 파이프라인 설계',
      'Playwright 헤드리스 브라우저로 6개 쇼핑몰(11번가, Amazon, Newegg 등) 자동 수집',
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
    desc: '삼성화재 다이렉트착 앱과 보험 계약관리, 자동차 보험 관련 서비스의 프론트엔드 운영을 담당했습니다. 실서비스 환경에서 화면 유지보수와 기능 개선을 수행하며, 보험 서비스 특성상 높은 정확도와 안정성이 요구되는 업무를 지속적으로 지원했습니다.',
    solution: [
      '다이렉트착 앱과 보험 계약관리, 자동차 보험 관련 서비스의 프론트엔드 운영 담당',
      '실서비스 환경에서 화면 유지보수와 기능 개선 수행',
      '보험 도메인 특성에 맞는 정확도 높은 UI 개발',
    ],
    result: '서비스 운영 안정성을 유지하며 사용자 경험 개선에 기여. 프론트엔드 유지보수 역량과 보험 도메인 이해도를 함께 높였습니다.',
    tags: ['JavaScript', 'React', 'Vue'],
    highlights: [
      { label: '기간', value: '1년 2개월' },
      { label: '역할', value: '프론트엔드 운영 및 기능 개선' },
      { label: '도메인', value: '자동차보험 / 장기계약 / 계약관리' },
    ],
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
      'jQuery 기반 프로젝트를 React 기반 구조로 전환하는 리팩토링 작업 참여',
      '레거시 구조를 개선하며 확장성과 유지보수성 향상',
    ],
    result: '기존 프론트엔드 구조를 현대화하여 유지보수 효율과 개발 생산성을 향상. 모바일 품질관리 기능 대응 경험으로 PDA 환경 UI 역량 확보.',
    tags: ['Java', 'React', 'Oracle', 'MSA'],
    highlights: [
      { label: '전환', value: 'jQuery → React 마이그레이션' },
      { label: '모바일', value: 'PDA 품질관리 기능 대응' },
      { label: '환경', value: 'MSA 구조' },
    ],
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
      'UbiReport 기반 일지·레포트 전산화',
    ],
    result: '생산 및 품질관리 업무를 시스템 중심으로 운영 가능하게 하여 현장 운영 편의성과 데이터 접근성을 개선했습니다.',
    tags: ['Java', 'JavaScript', 'React', 'MSSQL', 'Syncfusion', 'UbiReport'],
    highlights: [
      { label: '범위', value: 'BOM / 재고 / 자재이동 / 품질관리' },
      { label: '리포트', value: 'UbiReport 전산화' },
      { label: '환경', value: '제조 현장 운영 시스템' },
    ],
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
      '현장 데이터의 체계적 축적을 위한 입력/조회/출력 프로세스 구축',
    ],
    result: '수작업으로 관리되던 품질 관련 업무를 시스템화하여 운영 효율을 높이고, 품질관리 프로세스를 체계화했습니다.',
    tags: ['Java', 'JavaScript', 'MSSQL', 'Micube Framework', 'JasperReport'],
    highlights: [
      { label: '리포트', value: 'JasperReport 자동 출력' },
      { label: '범위', value: '잔당 실적 / 품질관리 / 일지' },
      { label: '환경', value: 'BIO 생산 현장' },
    ],
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
      '수기 중심으로 운영되던 업무를 시스템으로 전환하는 프로세스 구현',
      '현장 사용성을 고려한 기능 개발 진행',
    ],
    result: 'SMART HACCP 인증 획득에 기여. 수기 일지 전산화로 업무 효율성과 데이터 관리 정확도를 높였습니다.',
    tags: ['Java', 'Vue.js', 'MSSQL', 'Spring Framework'],
    highlights: [
      { label: '성과', value: 'SMART HACCP 인증 기여' },
      { label: '전환', value: '수기 일지 → 전산화' },
      { label: '범위', value: '일지 결재 / 상품일지' },
    ],
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
  'project-haccp-hwayo':  'bg-emerald-500',
  'project-haccp-culti':  'bg-teal-500',
  'project-mes-jadein':   'bg-amber-500',
  'project-mes-cj':       'bg-orange-500',
  'project-samsung':      'bg-blue-500',
  'project-pcpricetrack': 'bg-violet-500',
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
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all ${scrolled ? 'bg-gray-950/80 backdrop-blur-lg border-b border-gray-800/50' : ''}`}>
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-lg font-bold tracking-tight">
          <span className="text-accent">H</span>H.Lee
        </a>
        <div className="hidden sm:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-gray-400 hover:text-white transition-colors">
              {item}
            </a>
          ))}
          <a href="/이혁희_이력서.pdf" target="_blank" className="text-sm bg-accent hover:bg-accent-dark text-white px-4 py-1.5 rounded-lg transition-colors">
            Resume
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center pt-16">
      <div className="max-w-5xl mx-auto px-6 w-full">
        <p className="text-accent font-medium mb-4 tracking-wide text-sm">안녕하세요, 저는</p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-4">
          이혁희<span className="text-gray-500">.</span>
        </h1>
        <h2 className="text-2xl sm:text-3xl text-gray-400 font-medium mb-8">
          실무형 풀스택 개발자
        </h2>
        <p className="text-gray-400 max-w-xl leading-relaxed text-lg mb-10">
          4년간 <span className="text-gray-200">삼성화재 보험 서비스</span>, <span className="text-gray-200">CJ 제조 시스템</span>을 개발하며
          레거시 개선부터 신규 서비스 구축까지 경험했습니다.
          <br />
          <span className="text-gray-200">React/Vue 프론트엔드</span>와 <span className="text-gray-200">Java/Node.js 백엔드</span>를 넘나드는 풀스택 역량으로
          비즈니스 문제를 기술로 해결합니다.
        </p>
        <div className="flex gap-4">
          <a href="#projects" className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
            프로젝트 보기
          </a>
          <a href="#contact" className="border border-gray-700 hover:border-gray-500 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors">
            연락하기
          </a>
        </div>
      </div>
    </section>
  );
}

function About() {
  const ref = useFadeIn();
  return (
    <section id="about" ref={ref} className="fade-section py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-10">About</h2>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4 text-gray-400 leading-relaxed">
            <p>
              동서울대학교 기계자동차과를 졸업하고, 개발자로의 전환을 위해 비트캠프에서 Java 기반 웹앱 개발 과정을 수료했습니다.
              이후 방송통신대학교 컴퓨터과학과를 졸업하며 CS 기초를 다졌습니다.
            </p>
            <p>
              <span className="text-gray-200 font-medium">크로니즈 시스템</span>에서 2년 반 동안 CJ올리브네트웍스 파견으로
              HACCP 솔루션과 MES 시스템을 처음부터 구축하며 풀스택 역량을 키웠습니다.
            </p>
            <p>
              <span className="text-gray-200 font-medium">삼성화재</span>에서는 다이렉트 보험 서비스의 프론트엔드를 담당하며
              대규모 사용자 대상 서비스 운영 경험과 Vue→React 마이그레이션 경험을 쌓았습니다.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">Quick Facts</h3>
            {[
              ['경력', '4년차 풀스택 개발자'],
              ['강점', 'React/Vue 듀얼 프레임워크 경험'],
              ['특기', '레거시 → 모던 스택 마이그레이션'],
              ['학력', '방송통신대 컴퓨터과학과 졸업 (2026)'],
              ['교육', '비트캠프 Java 웹앱 개발 과정 (2020)'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <span className="text-accent text-sm font-medium shrink-0 w-12">{k}</span>
                <span className="text-gray-300 text-sm">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Experience() {
  const ref = useFadeIn();
  return (
    <section id="experience" ref={ref} className="fade-section py-24 bg-gray-900/30">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-10">Experience</h2>
        <div className="space-y-12">
          {EXPERIENCE.map((exp) => (
            <div key={exp.period} className="relative pl-8 border-l-2 border-gray-800">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-accent border-4 border-gray-950" />
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
                <h3 className="text-xl font-semibold">{exp.company}</h3>
                <span className="text-sm text-gray-500">{exp.role}</span>
                <span className="text-sm text-accent">{exp.period}</span>
              </div>
              <div className="space-y-3">
                {exp.items.map((item, i) => (
                  <div key={i} className="bg-gray-900/60 border border-gray-800/60 rounded-xl px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1.5">
                          <h4 className="text-gray-100 font-semibold text-sm">{item.title}</h4>
                          <span className="text-xs text-gray-600">{item.period}</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                        <p className="text-xs text-gray-600 mt-2">🛠 {item.env}</p>
                      </div>
                      {item.projectId && (
                        <a
                          href={`#${item.projectId}`}
                          className="shrink-0 flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-accent/20 border border-gray-700 hover:border-accent/50 text-gray-400 hover:text-accent px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          상세 보기
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {exp.tags.map((t) => (
                  <span key={t} className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Gantt Chart ─── */
function ProjectGantt() {
  const ref = useFadeIn();

  const rangeStart = new Date(2020, 9);  // 2020-10
  const rangeEnd   = new Date(2025, 5);  // 2025-06
  const totalMonths = (rangeEnd.getFullYear() - rangeStart.getFullYear()) * 12
    + (rangeEnd.getMonth() - rangeStart.getMonth());

  const toPercent = (dateStr: string) => {
    const [y, m] = dateStr.split('-').map(Number);
    const months = (y - rangeStart.getFullYear()) * 12 + (m - 1 - rangeStart.getMonth());
    return (months / totalMonths) * 100;
  };

  const years = [2021, 2022, 2023, 2024, 2025];
  const sorted = [...PROJECTS].sort((a, b) => a.period.start.localeCompare(b.period.start));

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="fade-section bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-10">
      <h3 className="text-sm font-semibold text-gray-400 mb-6 uppercase tracking-wider">Project Timeline</h3>

      {/* Year axis */}
      <div className="relative h-6 mb-2 ml-[120px] sm:ml-[168px]">
        {years.map((y) => {
          const left = ((y - rangeStart.getFullYear()) * 12 - rangeStart.getMonth()) / totalMonths * 100;
          return (
            <span key={y} className="absolute text-xs text-gray-500 -translate-x-1/2" style={{ left: `${left}%` }}>
              {y}
            </span>
          );
        })}
      </div>

      {/* Bars */}
      <div className="space-y-2.5">
        {sorted.map((project) => {
          const left  = toPercent(project.period.start);
          const right = toPercent(project.period.end);
          const width = right - left;
          const color = GANTT_COLOR[project.id] ?? 'bg-gray-500';

          const [sy, sm] = project.period.start.split('-');
          const [ey, em] = project.period.end.split('-');
          const label = `${sy}.${sm} - ${ey}.${em}`;

          return (
            <a key={project.id} href={`#${project.id}`} className="flex items-center gap-3 group">
              <div className="w-[108px] sm:w-[156px] shrink-0 text-right pr-3">
                <span className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-200 font-medium leading-tight block transition-colors">
                  {project.title}
                </span>
              </div>
              <div className="flex-1 relative h-8 bg-gray-800/40 rounded">
                {years.map((y) => {
                  const pos = ((y - rangeStart.getFullYear()) * 12 - rangeStart.getMonth()) / totalMonths * 100;
                  return <div key={y} className="absolute top-0 bottom-0 w-px bg-gray-700/50" style={{ left: `${pos}%` }} />;
                })}
                <div
                  className={`absolute top-1 bottom-1 rounded ${color} opacity-80 group-hover:opacity-100 transition-opacity flex items-center overflow-visible`}
                  style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                >
                  <span className="text-[10px] sm:text-xs text-white font-medium px-2 whitespace-nowrap drop-shadow-sm">
                    {label}
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 pt-5 border-t border-gray-800">
        {[
          { color: 'bg-violet-500', label: '개인 프로젝트' },
          { color: 'bg-blue-500',   label: '삼성화재 파견' },
          { color: 'bg-orange-500 bg-amber-500', label: 'CJ올리브네트웍스 파견' },
        ].map(({ label }) => {
          const colors: Record<string, string> = {
            '개인 프로젝트': 'bg-violet-500',
            '삼성화재 파견': 'bg-blue-500',
            'CJ올리브네트웍스 파견': 'bg-amber-500',
          };
          return (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-sm ${colors[label]}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Project Card ─── */
function ProjectCard({ project }: { project: typeof PROJECTS[0] }) {
  const ref = useFadeIn();
  const [sy, sm] = project.period.start.split('-');
  const [ey, em] = project.period.end.split('-');
  const periodLabel = `${sy}.${sm} ~ ${ey}.${em}`;
  const color = GANTT_COLOR[project.id] ?? 'bg-gray-500';

  return (
    <article id={project.id} ref={ref} className="fade-section bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden scroll-mt-20">
      {/* Colored top accent */}
      <div className={`h-1 ${color}`} />
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-5">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-xl sm:text-2xl font-bold">{project.title}</h3>
            {project.company ? (
              <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700/50 px-2 py-0.5 rounded-full">{project.role}</span>
            ) : (
              <span className="text-xs bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded-full">Personal</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mb-3">
            {project.company
              ? <span className="text-gray-400">{project.company}</span>
              : <span className="text-gray-400">{project.subtitle}</span>
            }
            <span className="text-gray-600">{periodLabel}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono bg-gray-800/80 border border-gray-700 hover:border-accent/60 hover:text-accent text-gray-400 pl-2 pr-2.5 py-1 rounded-full transition-colors">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </span>
                <span className="text-gray-500">https://</span>{new URL(project.liveUrl).hostname}
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/></svg>
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono bg-gray-800 border border-gray-700 hover:border-gray-500 hover:text-white text-gray-400 px-2.5 py-1 rounded-md transition-colors">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
                github.com
              </a>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">{project.desc}</p>
          <div>
            <h4 className="text-sm font-semibold text-accent mb-2">What I Did</h4>
            <ul className="space-y-1">
              {project.solution.map((s, i) => (
                <li key={i} className="text-gray-400 text-sm leading-relaxed flex gap-2">
                  <span className="text-accent shrink-0">-</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-1.5">Result</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{project.result}</p>
          </div>
          {project.note && (
            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 mt-2">
              <span className="text-yellow-400 text-base shrink-0">⚠</span>
              <p className="text-yellow-300/80 text-xs leading-relaxed">{project.note}</p>
            </div>
          )}
        </div>

        {/* Highlights */}
        {project.highlights && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {project.highlights.map((h) => (
              <div key={h.label} className="bg-gray-800/50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-500 mb-0.5">{h.label}</div>
                <div className="text-sm text-gray-200">{h.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-5">
          {project.tags.map((t) => (
            <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full border border-gray-700/50">{t}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function Projects() {
  return (
    <section id="projects" className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-10">Projects</h2>
        <ProjectGantt />
        <div className="space-y-8">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Skills ─── */
function Skills() {
  const ref = useFadeIn();
  return (
    <section id="skills" ref={ref} className="fade-section py-24 bg-gray-900/30">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-10">Skills</h2>
        <div className="space-y-8">
          {SKILL_GROUPS.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-accent mb-4 uppercase tracking-wider">{group.category}</h3>
              <div className="flex flex-wrap gap-4">
                {group.skills.map((skill) => (
                  <div key={skill.name}
                    className="flex flex-col items-center gap-2 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-5 py-4 w-[88px] transition-colors group cursor-default">
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                      loading="lazy"
                    />
                    <span className="text-xs text-gray-400 group-hover:text-gray-200 text-center leading-tight transition-colors">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 차별화 포인트 */}
        <div className="mt-12 bg-gray-900 border border-accent/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-accent">✦</span> 차별화 포인트
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'React + Vue 듀얼 경험', desc: '삼성화재에서 Vue→React 마이그레이션을 직접 수행. 두 프레임워크의 차이와 전환 전략을 체득.' },
              { title: '레거시 → 모던 전환 전문', desc: 'jQuery→React, Vue→React 두 번의 대규모 마이그레이션 경험. 점진적 전환 전략 수립 가능.' },
              { title: '제조 도메인 + 보험 도메인', desc: '서로 다른 산업군(제조 MES, 보험 서비스)에서의 실무 경험으로 빠른 도메인 학습 능력 보유.' },
              { title: '사이드 프로젝트로 증명하는 설계 역량', desc: 'PCPriceTrack으로 분산 크롤링, 서킷브레이커, 모노레포 등 실무에서 다루기 어려운 아키텍처를 직접 설계/구현.' },
            ].map((item) => (
              <div key={item.title}>
                <h4 className="text-sm font-medium text-gray-200 mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const ref = useFadeIn();
  return (
    <section id="contact" ref={ref} className="fade-section py-24">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Contact</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          함께 일할 기회를 찾고 있습니다. 편하게 연락주세요.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="mailto:leehh4864@gmail.com" className="bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-lg font-medium transition-colors">
            leehh4864@gmail.com
          </a>
          <a href="tel:010-5541-4864" className="border border-gray-700 hover:border-gray-500 text-gray-300 px-8 py-3 rounded-lg font-medium transition-colors">
            010-5541-4864
          </a>
        </div>
        <div className="flex items-center justify-center gap-6 mt-8">
          <a href="https://github.com/HyuckHee" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-800/50 py-8">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <span>&copy; {new Date().getFullYear()} 이혁희. All rights reserved.</span>
        <span>Built with React + Vite + Tailwind CSS</span>
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
