import { useEffect, useRef, useState } from 'react';

/* ─── Intersection Observer Hook ─── */
function useFadeIn() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.15 },
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
      { title: '다이렉트 착 운영 - 자동차보험/장기계약', period: '2024.11 ~ 2025.01', desc: '삼성화재 다이렉트 보험 서비스의 프론트엔드 운영 및 기능 개발. 보험료 계산, 계약 관리 등 핵심 화면 유지보수.', env: 'JavaScript, Visual Studio' },
      { title: '다이렉트 착 펫보험 리뉴얼 (Vue3 → React 마이그레이션)', period: '2024.08 ~ 2024.11', desc: '기존 Vue 기반 펫보험 서비스를 React로 전면 리뉴얼. 컴포넌트 설계부터 API 연동까지 전 과정 담당.', env: 'React, Vue3, Visual Studio' },
      { title: '다이렉트 착 운영 - 자동차보험/장기계약', period: '2023.11 ~ 2024.08', desc: '삼성화재 다이렉트 보험 서비스 프론트엔드 운영. 자동차보험 및 장기계약 화면 개발 및 유지보수.', env: 'JavaScript, Visual Studio' },
    ],
    tags: ['React', 'Vue3', 'JavaScript', 'Visual Studio'],
  },
  {
    period: '2020.10 - 2023.03',
    company: '크로니즈 시스템 (CJ올리브네트웍스 파견)',
    role: '풀스택 개발자',
    items: [
      { title: 'CJ 제일제당 식품 MES 고도화 (솔루션 마이그레이션)', period: '2022.05 ~ 2022.12', desc: '레거시 jQuery 기반 MES 솔루션을 React로 마이그레이션. BOM, 재고, 자재 이동 핵심 화면 재설계. UbiReport 기반 리포트 시스템 재구축.', env: 'Java, React, Oracle, Visual Studio, UbiReport' },
      { title: '쟈뎅공장 MES 시스템 구축 (수기일지 전산화)', period: '2021.12 ~ 2022.05', desc: 'BOM, 재고, 자재 이동 등 제조실행시스템 핵심 화면 개발. 데이터 기반 리포트 시스템 구축.', env: 'Java, Vue, MSSQL, Visual Studio, UbiReport' },
      { title: 'CJ 제일제당 BIO 컬티 HACCP 구축 (수기일지 전산화)', period: '2021.06 ~ 2021.11', desc: 'CJ BIO 공장의 HACCP 공정 관리 솔루션 개발. JasperReport 기반 법적 요구사항 충족 자동 리포트 생성.', env: 'Java, JavaScript, MSSQL, Eclipse, JasperReport' },
      { title: '화요공장 HACCP 솔루션 구축 (수기일지 전산화)', period: '2021.01 ~ 2021.06', desc: '제조 공정의 수기 작성 일지를 전산화하는 HACCP 솔루션 설계/개발. SMART HACCP 인증에 기여.', env: 'Java, Vue, MSSQL, WebStorm, IntelliJ' },
    ],
    tags: ['Java', 'Spring', 'Vue', 'React', 'JavaScript', 'MSSQL', 'Oracle', 'JasperReport', 'UbiReport'],
  },
  {
    period: '2019.12 - 2020.06',
    company: '비트캠프',
    role: '교육 수료',
    items: [
      { title: 'Java 기반 웹앱 개발자 양성 과정', period: '2019.12 ~ 2020.06', desc: 'Java, Spring, JSP/Servlet, RDBMS 기반 웹 애플리케이션 개발 교육 과정 수료. 팀 프로젝트를 통한 실전 경험.', env: 'Java, Spring, JSP, MySQL' },
    ],
    tags: ['Java', 'Spring', 'JSP', 'MySQL'],
  },
];

const PROJECTS = [
  {
    title: 'PCPriceTrack',
    subtitle: 'PC 부품 실시간 가격 추적 서비스',
    liveUrl: 'https://pc-price-track-web.vercel.app/',
    githubUrl: 'https://github.com/HyuckHee',
    problem: '국내외 PC 부품 가격을 비교하려면 여러 쇼핑몰을 직접 돌아다녀야 하고, 가격 변동 추이를 확인할 방법이 없었습니다.',
    solution: [
      'NestJS + Bull Queue 기반의 분산 크롤링 파이프라인 설계',
      'Playwright 헤드리스 브라우저로 6개 쇼핑몰(11번가, Amazon, Newegg 등) 자동 수집',
      'Redis 기반 서킷브레이커로 스토어별 장애 자동 격리',
      'append-only 가격 이력 테이블로 시계열 분석 기반 구축',
      'Next.js App Router 서버/클라이언트 컴포넌트 분리 (SSR + 인터랙티브 환율 전환)',
    ],
    result: '6개 스토어에서 30분~2시간 주기로 가격 자동 수집, 30일 가격 히스토리 차트, 목표가 알림 기능 구현.',
    tags: ['Next.js 15', 'NestJS', 'PostgreSQL', 'Drizzle ORM', 'Bull + Redis', 'Playwright', 'Tailwind CSS', 'Docker'],
    highlights: [
      { label: '아키텍처', value: 'Scheduler → Queue → Processor 3단 분리' },
      { label: '데이터', value: 'append-only 설계로 가격 이력 무손실 보존' },
      { label: '안정성', value: '서킷브레이커 + 지수 백오프 재시도' },
      { label: '모노레포', value: 'Turborepo + pnpm 워크스페이스' },
    ],
  },
  {
    title: 'HACCP 솔루션',
    subtitle: '제조 공정 관리 시스템 (CJ올리브네트웍스)',
    liveUrl: null,
    githubUrl: null,
    problem: '식품 제조 공장에서 HACCP 관련 일지를 수기로 작성하여 데이터 추적과 인증 관리가 비효율적이었습니다.',
    solution: [
      'Java + Spring 백엔드로 HACCP 공정 데이터 관리 API 구축',
      'Vue 기반 프론트엔드로 실시간 모니터링 대시보드 구현',
      'JasperReport / UbiReport로 법적 요구사항을 충족하는 자동 리포트 생성',
      '수기 작성 일지 100% 전산화',
    ],
    result: 'SMART HACCP 인증 획득에 기여. 일지 작성 시간 80% 단축, 데이터 기반 품질 관리 체계 확립.',
    tags: ['Java', 'Spring', 'Vue', 'MSSQL', 'JasperReport'],
    highlights: [
      { label: '성과', value: 'SMART HACCP 인증 기여' },
      { label: '효율', value: '수기 일지 → 전산화 (작성시간 80% 단축)' },
      { label: '범위', value: '화요공장 + CJ BIO 2개 사이트' },
    ],
  },
  {
    title: 'MES 고도화',
    subtitle: 'CJ 식품 제조실행시스템 마이그레이션',
    liveUrl: null,
    githubUrl: null,
    problem: 'jQuery 기반 레거시 MES 시스템의 유지보수가 어렵고, 신규 기능 추가 시 개발 속도가 현저히 느렸습니다.',
    solution: [
      'jQuery → React 단계적 마이그레이션 전략 수립 및 실행',
      'BOM, 재고, 자재 이동 등 핵심 화면을 재사용 가능한 React 컴포넌트로 재설계',
      'Oracle DB 연동 리포트 시스템을 UbiReport로 재구축',
    ],
    result: '컴포넌트 재사용률 향상으로 신규 화면 개발 속도 40% 개선. 레거시 의존성 제거.',
    tags: ['React', 'Java', 'Spring', 'Oracle', 'UbiReport'],
    highlights: [
      { label: '전환', value: 'jQuery → React 마이그레이션' },
      { label: '개선', value: '신규 화면 개발 속도 40% 향상' },
      { label: '설계', value: '재사용 컴포넌트 라이브러리 구축' },
    ],
  },
];

const SKILLS: Record<string, string[]> = {
  Frontend: ['React', 'Vue 3', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML/CSS'],
  Backend: ['Java', 'Spring', 'NestJS', 'Node.js'],
  Database: ['PostgreSQL', 'MSSQL', 'Oracle', 'Drizzle ORM'],
  Infra: ['Docker', 'Redis', 'Bull Queue', 'Playwright', 'Turborepo'],
  Tools: ['Git', 'VS Code', 'IntelliJ', 'WebStorm', 'Figma'],
};

/* ─── Components ─── */

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
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                <h3 className="text-xl font-semibold">{exp.company}</h3>
                <span className="text-sm text-gray-500">{exp.role}</span>
                <span className="text-sm text-accent">{exp.period}</span>
              </div>
              <div className="space-y-4 mt-4">
                {exp.items.map((item, i) => (
                  <div key={i} className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-3">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <h4 className="text-gray-200 font-medium text-sm">{item.title}</h4>
                      {'period' in item && <span className="text-xs text-gray-600">{(item as { period: string }).period}</span>}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                    {'env' in item && <p className="text-xs text-gray-600 mt-1.5">환경: {(item as { env: string }).env}</p>}
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

function ProjectCard({ project }: { project: typeof PROJECTS[0] }) {
  const ref = useFadeIn();
  return (
    <article ref={ref} className="fade-section bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">{project.title}</h3>
            <p className="text-gray-400 text-sm mt-1">{project.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono bg-gray-800 border border-gray-700 hover:border-accent/60 hover:text-accent text-gray-400 px-2.5 py-1 rounded-md transition-colors"
                aria-label="Live Site"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                {new URL(project.liveUrl).hostname}
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono bg-gray-800 border border-gray-700 hover:border-gray-500 hover:text-white text-gray-400 px-2.5 py-1 rounded-md transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
                github.com
              </a>
            )}
          </div>
        </div>

        {/* 문제 → 해결 → 성과 */}
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-1.5">Problem</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{project.problem}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-accent mb-1.5">Solution</h4>
            <ul className="space-y-1">
              {project.solution.map((s, i) => (
                <li key={i} className="text-gray-400 text-sm leading-relaxed flex gap-2">
                  <span className="text-accent shrink-0 mt-0.5">-</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-1.5">Result</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{project.result}</p>
          </div>
        </div>

        {/* Highlights */}
        {project.highlights && (
          <div className="grid grid-cols-2 gap-3 mt-6">
            {project.highlights.map((h) => (
              <div key={h.label} className="bg-gray-800/50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-500 mb-0.5">{h.label}</div>
                <div className="text-sm text-gray-200">{h.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-6">
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
        <div className="space-y-8">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Skills() {
  const ref = useFadeIn();
  return (
    <section id="skills" ref={ref} className="fade-section py-24 bg-gray-900/30">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-10">Skills</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(SKILLS).map(([category, skills]) => (
            <div key={category} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-accent mb-3">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="text-sm text-gray-300 bg-gray-800 px-3 py-1.5 rounded-lg">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 차별화 포인트 */}
        <div className="mt-10 bg-gray-900 border border-accent/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-accent">*</span> 차별화 포인트
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
          <a href="https://github.com/husker" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
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
