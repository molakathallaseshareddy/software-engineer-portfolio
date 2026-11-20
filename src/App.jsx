import { useEffect, useRef, useState } from 'react';

const roles = ['Python Backend Developer', 'API Developer', 'Cloud & AI Enthusiast'];
const navigation = [
  ['Home', 'home'],
  ['About', 'about'],
  ['Skills', 'skills'],
  ['Experience', 'experience'],
  ['Projects', 'projects'],
  ['Education', 'education'],
  ['Contact', 'contact'],
];

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [typedRole, setTypedRole] = useState(roles[0]);
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [backToTopVisible, setBackToTopVisible] = useState(false);
  const [formFeedback, setFormFeedback] = useState('Your message will be sent to Sesha by email. If delivery fails, the form will show an error.');
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [indicator, setIndicator] = useState({ width: 0, left: 0 });
  const navRef = useRef(null);
  const pointerRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loaderTimer = window.setTimeout(() => setLoaderHidden(true), reducedMotion ? 0 : 650);
    const revealItems = document.querySelectorAll('.reveal');
    let revealObserver;

    if ('IntersectionObserver' in window && !reducedMotion) {
      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
      revealItems.forEach((item) => revealObserver.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    let roleIndex = 0;
    let characterIndex = roles[0].length;
    let deleting = true;
    let typingTimer;
    const typeNextCharacter = () => {
      const currentRole = roles[roleIndex];
      characterIndex += deleting ? -1 : 1;
      setTypedRole(currentRole.slice(0, characterIndex));

      if (characterIndex <= 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      } else if (characterIndex >= roles[roleIndex].length) {
        deleting = true;
        typingTimer = window.setTimeout(typeNextCharacter, 1600);
        return;
      }

      typingTimer = window.setTimeout(typeNextCharacter, deleting ? 45 : 75);
    };

    if (!reducedMotion) typingTimer = window.setTimeout(typeNextCharacter, 2200);

    const updateScrollState = () => {
      const sections = document.querySelectorAll('main section[id]');
      let current = sections[0]?.id ?? 'home';
      sections.forEach((section) => {
        if (section.offsetTop <= window.scrollY + 150) current = section.id;
      });
      setActiveSection(current);
      setBackToTopVisible(window.scrollY > 560);
    };

    const updatePointer = (event) => {
      if (!pointerRef.current) return;
      pointerRef.current.style.left = `${event.clientX}px`;
      pointerRef.current.style.top = `${event.clientY}px`;
    };

    window.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();

    if (!reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      window.addEventListener('pointermove', updatePointer, { passive: true });
    }

    return () => {
      window.clearTimeout(loaderTimer);
      window.clearTimeout(typingTimer);
      revealObserver?.disconnect();
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('pointermove', updatePointer);
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 820) return;
    const activeLink = navRef.current?.querySelector(`[href="#${activeSection}"]`);
    if (!activeLink) return;
    setIndicator({ width: activeLink.offsetWidth, left: activeLink.offsetLeft });
  }, [activeSection]);

  useEffect(() => {
    const updateIndicator = () => {
      if (window.innerWidth <= 820) return;
      const activeLink = navRef.current?.querySelector(`[href="#${activeSection}"]`);
      if (activeLink) setIndicator({ width: activeLink.offsetWidth, left: activeLink.offsetLeft });
    };
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeSection]);

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    if (isSending) return;

    const form = event.currentTarget;
    const values = new FormData(form);
    setIsSending(true);
    setFeedbackIsError(false);
    setFormFeedback('Sending your message…');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.get('name'),
          email: values.get('email'),
          subject: values.get('subject'),
          message: values.get('message'),
          website: values.get('website'),
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error('The email service returned an invalid response. Please try again or email Sesha directly.');
      }

      if (!response.ok) {
        throw new Error(result.message || 'Your message could not be sent. Please try again or email Sesha directly.');
      }
      if (result.sent !== true) {
        throw new Error('Email delivery was not confirmed. Please try again or email Sesha directly.');
      }

      setFormFeedback(result.message);
      form.reset();
    } catch (error) {
      console.error('Contact form delivery failed', error);
      setFeedbackIsError(true);
      setFormFeedback(error instanceof Error ? error.message : 'Your message could not be sent. Please email Sesha directly.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className={`page-loader${loaderHidden ? ' is-hidden' : ''}`} aria-hidden="true">
        <div className="loader-mark">
          <span>
            &lt;
          </span>
          sr
          <span>
            /&gt;
          </span>
        </div>
        <p>
          Building something thoughtful
          <span className="loader-dots">
            ...
          </span>
        </p>
        <div className="loader-track">
          <span></span>
        </div>
      </div>
      <div className="pointer-glow" aria-hidden="true" ref={pointerRef}></div>
      <div className="ambient ambient-one" aria-hidden="true"></div>
      <div className="ambient ambient-two" aria-hidden="true"></div>
      <header className="site-header">
        <nav className="nav-shell container" aria-label="Main navigation">
          <a className="brand" href="#home" aria-label="Sesha Reddy home">
            <span className="brand-mark">
              S
            </span>
            <span>
              sesha
              <span className="brand-dot">
                .
              </span>
            </span>
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <span></span>
            <span></span>
          </button>
          <div className={`nav-links${menuOpen ? ' is-open' : ''}`} id="primary-nav" ref={navRef}>
            {navigation.map(([label, id]) => (
              <a
                className={`nav-link${activeSection === id ? ' is-active' : ''}`}
                href={`#${id}`}
                key={id}
                aria-current={activeSection === id ? 'location' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <span
              className="nav-indicator"
              aria-hidden="true"
              style={{ width: `${indicator.width}px`, transform: `translateX(${indicator.left}px)` }}
            ></span>
          </div>
          <a className="nav-cta" href="#contact">
            Let’s talk{' '}
            <span aria-hidden="true">
              ↗
            </span>
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero section-shell" id="home" aria-labelledby="hero-title">
          <div className="hero-grid container">
            <div className="hero-copy">
              <p className="eyebrow hero-eyebrow">
                <span className="status-dot"></span>
                {' '}BASED IN HYDERABAD, INDIA{' '}
                <span className="eyebrow-line"></span>
              </p>
              <h1 id="hero-title">
                <span className="hero-intro">
                  Hi, I’m
                </span>
                <br />
                <span className="gradient-text">
                  Sesha Reddy
                </span>
              </h1>
              <p className="hero-role">
                <span className="role-prefix">
                  I work as a
                </span>
                {' '}
                <span className="typing-text" aria-live="off">{typedRole}</span>
                <span className="typing-cursor" aria-hidden="true">
                  |
                </span>
              </p>
              <p className="hero-description">
                I build scalable backend applications, REST APIs, AI-powered systems, and cloud-based solutions using Python and modern technologies.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#projects">
                  View My Projects{' '}
                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
                <a className="button button-quiet" href={`${import.meta.env.BASE_URL}assets/resume.pdf`} download="Molakathalla-Sesha-Reddy-Resume.pdf">
                  Download Resume{' '}
                  <span aria-hidden="true">
                    ↓
                  </span>
                </a>
              </div>
              <div className="hero-socials" aria-label="Social profiles">
                <a href="https://github.com/molakathallaseshareddy" target="_blank" rel="noopener noreferrer">
                  GitHub{' '}
                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
                <span className="social-divider" aria-hidden="true"></span>
                <a href="https://linkedin.com/in/sesha-reddy-molakathalla-683579322" target="_blank" rel="noopener noreferrer">
                  LinkedIn{' '}
                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
                <span className="social-divider" aria-hidden="true"></span>
                <a href="mailto:mseshareddy48@gmail.com">
                  Email{' '}
                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbit orbit-outer"></div>
              <div className="orbit orbit-inner"></div>
              <div className="orbit-node node-a">
                <span>
                  API
                </span>
              </div>
              <div className="orbit-node node-b">
                <span>
                  AI
                </span>
              </div>
              <div className="orbit-node node-c">
                <span>
                  DB
                </span>
              </div>
              <div className="orbit-node node-d">
                <span>
                  AWS
                </span>
              </div>
              <div className="core-card">
                <div className="core-window">
                  <i></i>
                  <i></i>
                  <i></i>
                  <span>
                    backend.py
                  </span>
                </div>
                <div className="code-lines" aria-hidden="true">
                  <span>
                    <b>
                      01
                    </b>
                    <em className="code-purple">
                      async def
                    </em>
                    {' '}
                    <em className="code-blue">
                      build
                    </em>
                    ():
                  </span>
                  <span>
                    <b>
                      02
                    </b>
                    {' '}
                    <em className="code-purple">
                      return
                    </em>
                    {' '}
                    <em className="code-green">
                      "reliable APIs"
                    </em>
                  </span>
                  <span>
                    <b>
                      03
                    </b>
                  </span>
                  <span>
                    <b>
                      04
                    </b>
                    <em className="code-purple">
                      await
                    </em>
                    {' '}
                    <em className="code-blue">
                      scale
                    </em>
                    (
                    <em className="code-green">
                      with_care=True
                    </em>
                    )
                  </span>
                </div>
                <div className="core-footer">
                  <span className="core-pulse"></span>
                  {' '}API WORKFLOW{' '}
                  <span className="core-footer-right">
                    PYTHON · CLOUD
                  </span>
                </div>
              </div>
              <div className="float-label label-async">
                <span className="label-icon">
                  ⌁
                </span>
                {' '}asynchronous
              </div>
              <div className="float-label label-secure">
                <span className="label-icon">
                  ◇
                </span>
                {' '}production-minded
              </div>
              <div className="art-caption">
                <span className="caption-line"></span>
                <span>
                  ENGINEERED FOR WHAT’S NEXT
                </span>
              </div>
            </div>
          </div>
          <a className="scroll-cue" href="#about">
            <span className="scroll-mouse"></span>
            {' '}SCROLL TO EXPLORE
          </a>
        </section>
        <section className="section section-about" id="about" aria-labelledby="about-title">
          <div className="container">
            <div className="section-heading reveal">
              <p className="eyebrow">
                <span>
                  01
                </span>
                {' '}ABOUT ME
              </p>
              <h2 id="about-title">
                Thoughtful engineering.
                <br />
                <span className="muted-heading">
                  Real-world outcomes.
                </span>
              </h2>
            </div>
            <div className="about-grid">
              <div className="about-copy reveal">
                <p className="lead-copy">
                  I’m a Python Backend Developer with{' '}
                  <strong>
                    2 years of experience
                  </strong>
                  {' '}designing, developing, and deploying scalable backend applications.
                </p>
                <p>
                  At Mavensoft System Private Limited, I work across RESTful API development, AI-powered applications, secure data ingestion, and enterprise automation. My day-to-day toolkit spans FastAPI, Flask, Django, PostgreSQL, SQLAlchemy, AWS, and large language models.
                </p>
                <p>
                  I am focused on building secure, scalable, high-performance cloud-native backend applications.
                </p>
                <a className="text-link" href="#experience">
                  Explore my experience{' '}
                  <span aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
              <aside className="about-aside reveal">
                <div className="aside-topline">
                  <span>
                    AT A GLANCE
                  </span>
                  <span className="aside-symbol">
                    ✳
                  </span>
                </div>
                <div className="about-fact">
                  <span className="fact-index">
                    01
                  </span>
                  <div>
                    <h3>
                      Backend first
                    </h3>
                    <p>
                      Python services, REST APIs &amp; asynchronous workflows
                    </p>
                  </div>
                </div>
                <div className="about-fact">
                  <span className="fact-index">
                    02
                  </span>
                  <div>
                    <h3>
                      AI in the workflow
                    </h3>
                    <p>
                      LLM integrations, semantic search &amp; intelligent automation
                    </p>
                  </div>
                </div>
                <div className="about-fact">
                  <span className="fact-index">
                    03
                  </span>
                  <div>
                    <h3>
                      Cloud connected
                    </h3>
                    <p>
                      AWS services, database integration &amp; production support
                    </p>
                  </div>
                </div>
                <div className="aside-education">
                  <span className="education-icon">
                    ⌂
                  </span>
                  <div>
                    <span>
                      EDUCATION
                    </span>
                    <strong>
                      B.Tech, Electrical &amp; Electronics Engineering
                    </strong>
                    <small>
                      Gates Institute of Technology · 2020—2024
                    </small>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
        <section className="section section-skills" id="skills" aria-labelledby="skills-title">
          <div className="container">
            <div className="section-heading section-heading-row reveal">
              <div>
                <p className="eyebrow">
                  <span>
                    02
                  </span>
                  {' '}TOOLKIT
                </p>
                <h2 id="skills-title">
                  The tools behind
                  <br />
                  <span className="muted-heading">
                    the solutions.
                  </span>
                </h2>
              </div>
              <p className="heading-aside">
                A practical stack for building, connecting, and operating backend systems.
              </p>
            </div>
            <div className="skills-grid">
              <article className="skill-card skill-card-featured reveal">
                <div className="skill-card-top">
                  <span className="skill-index">
                    01 / CORE
                  </span>
                  <span className="skill-glyph glyph-python">
                    Py
                  </span>
                </div>
                <h3>
                  Programming
                </h3>
                <p>
                  Foundations for reliable application logic and data handling.
                </p>
                <div className="skill-tags">
                  <span>
                    Python
                  </span>
                  <span>
                    SQL
                  </span>
                </div>
              </article>
              <article className="skill-card reveal">
                <div className="skill-card-top">
                  <span className="skill-index">
                    02 / SERVER
                  </span>
                  <span className="skill-glyph">
                    ⌘
                  </span>
                </div>
                <h3>
                  Backend
                </h3>
                <p>
                  Frameworks for building and maintaining API services.
                </p>
                <div className="skill-tags">
                  <span>
                    FastAPI
                  </span>
                  <span>
                    Flask
                  </span>
                  <span>
                    Django
                  </span>
                  <span>
                    REST APIs
                  </span>
                </div>
              </article>
              <article className="skill-card reveal">
                <div className="skill-card-top">
                  <span className="skill-index">
                    03 / DATA
                  </span>
                  <span className="skill-glyph">
                    ◈
                  </span>
                </div>
                <h3>
                  Databases &amp; ORM
                </h3>
                <p>
                  Relational persistence and application data access.
                </p>
                <div className="skill-tags">
                  <span>
                    PostgreSQL
                  </span>
                  <span>
                    MySQL
                  </span>
                  <span>
                    SQLAlchemy
                  </span>
                </div>
              </article>
              <article className="skill-card reveal">
                <div className="skill-card-top">
                  <span className="skill-index">
                    04 / CLOUD
                  </span>
                  <span className="skill-glyph">
                    ☁
                  </span>
                </div>
                <h3>
                  AWS
                </h3>
                <p>
                  Cloud services used in application and workflow integrations.
                </p>
                <div className="skill-tags">
                  <span>
                    Lambda
                  </span>
                  <span>
                    EC2
                  </span>
                  <span>
                    S3
                  </span>
                  <span>
                    RDS
                  </span>
                  <span>
                    IAM
                  </span>
                  <span>
                    VPC
                  </span>
                  <span>
                    CloudWatch
                  </span>
                </div>
              </article>
              <article className="skill-card reveal">
                <div className="skill-card-top">
                  <span className="skill-index">
                    05 / INTELLIGENCE
                  </span>
                  <span className="skill-glyph">
                    ✳
                  </span>
                </div>
                <h3>
                  AI &amp; LLM
                </h3>
                <p>
                  AI-assisted extraction, analysis, and application experiences.
                </p>
                <div className="skill-tags">
                  <span>
                    Ollama
                  </span>
                  <span>
                    Google Gemini AI
                  </span>
                  <span>
                    Prompt Engineering
                  </span>
                </div>
              </article>
              <article className="skill-card reveal">
                <div className="skill-card-top">
                  <span className="skill-index">
                    06 / SEARCH
                  </span>
                  <span className="skill-glyph">
                    ⌕
                  </span>
                </div>
                <h3>
                  Vector databases
                </h3>
                <p>
                  Tools for semantic retrieval and similarity search.
                </p>
                <div className="skill-tags">
                  <span>
                    Pinecone
                  </span>
                  <span>
                    FAISS
                  </span>
                </div>
              </article>
              <article className="skill-card skill-card-wide reveal">
                <div className="skill-card-top">
                  <span className="skill-index">
                    07 / EVERYDAY TOOLS
                  </span>
                  <span className="skill-glyph">
                    ⟡
                  </span>
                </div>
                <h3>
                  Tools &amp; technologies
                </h3>
                <p>
                  Daily development, integration, and operating toolkit.
                </p>
                <div className="skill-tags">
                  <span>
                    Git
                  </span>
                  <span>
                    GitHub
                  </span>
                  <span>
                    Postman
                  </span>
                  <span>
                    VS Code
                  </span>
                  <span>
                    Linux
                  </span>
                  <span>
                    Boto3
                  </span>
                  <span>
                    JSON
                  </span>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section className="section section-experience" id="experience" aria-labelledby="experience-title">
          <div className="container">
            <div className="section-heading reveal">
              <p className="eyebrow">
                <span>
                  03
                </span>
                {' '}EXPERIENCE
              </p>
              <h2 id="experience-title">
                Building where
                <br />
                <span className="muted-heading">
                  it matters.
                </span>
              </h2>
            </div>
            <div className="timeline">
              <div className="timeline-rail" aria-hidden="true">
                <span></span>
              </div>
              <article className="timeline-entry reveal">
                <div className="timeline-date">
                  <span>
                    JAN 2025 — PRESENT
                  </span>
                  <small>
                    2 years
                  </small>
                </div>
                <div className="timeline-content">
                  <div className="experience-heading">
                    <div>
                      <p className="eyebrow">
                        PYTHON DEVELOPER
                      </p>
                      <h3>
                        Mavensoft System Private Limited
                      </h3>
                    </div>
                    <span className="company-mark">
                      MS
                    </span>
                  </div>
                  <p className="experience-intro">
                    Developing scalable backend services and AI-enabled enterprise workflows, with a focus on API quality, data integration, and production reliability.
                  </p>
                  <div className="project-work">
                    <h4>
                      <span className="work-number">
                        01
                      </span>
                      {' '}ATS Resume Parser &amp; Semantic Search System
                    </h4>
                    <ul>
                      <li>
                        Designed and developed an enterprise ATS using Python, FastAPI, PostgreSQL, and SQLAlchemy.
                      </li>
                      <li>
                        Built Ollama-powered parsing for PDF, DOCX, DOC, TXT, HTML, and image-based resumes; integrated OCR for scanned files.
                      </li>
                      <li>
                        Extracted candidate skills, experience, education, certifications, designation, and contact details.
                      </li>
                      <li>
                        Developed semantic search with FAISS and Pinecone, plus Boolean AND/OR search, mandatory skill filters, and candidate ranking.
                      </li>
                      <li>
                        Integrated OCR for scanned resumes, achieving 95%+ text extraction accuracy.
                      </li>
                      <li>
                        Designed asynchronous services for long-running AI operations and added centralized logging, request tracking, and exception handling.
                      </li>
                      <li>
                        Collaborated with frontend and QA teams, supported production deployments, and resolved production issues.
                      </li>
                    </ul>
                  </div>
                  <div className="project-work">
                    <h4>
                      <span className="work-number">
                        02
                      </span>
                      {' '}IGOSMART — Background Verification System
                    </h4>
                    <ul>
                      <li>
                        Developed a background verification system for identity verification and risk assessment workflows.
                      </li>
                      <li>
                        Built secure Flask REST APIs with JWT authentication and role-based access control; integrated PostgreSQL (AWS RDS) through SQLAlchemy.
                      </li>
                      <li>
                        Integrated Google Gemini AI for report generation and verification analysis.
                      </li>
                      <li>
                        Automated password-protected PDF reports, secure Amazon S3 storage, AWS Lambda workflows, and SMTP notifications.
                      </li>
                      <li>
                        Improved reliability with asynchronous background services, structured logging, centralized exception handling, and production monitoring.
                      </li>
                    </ul>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section className="section section-projects" id="projects" aria-labelledby="projects-title">
          <div className="container">
            <div className="section-heading section-heading-row reveal">
              <div>
                <p className="eyebrow">
                  <span>
                    04
                  </span>
                  {' '}SELECTED WORK
                </p>
                <h2 id="projects-title">
                  Systems with
                  <br />
                  <span className="muted-heading">
                    purpose.
                  </span>
                </h2>
              </div>
              <p className="heading-aside">
                Two production-focused platforms spanning AI search, verification workflows, and secure integrations.
              </p>
            </div>
            <div className="projects-grid">
              <article className="project-card reveal">
                <div className="project-visual project-visual-ats" role="img" aria-label="Illustration of resume ingestion, semantic search, and candidate matching">
                  <div className="visual-grid" aria-hidden="true"></div>
                  <div className="flow-label flow-input">
                    RESUME INGESTION
                  </div>
                  <div className="flow-doc">
                    <span className="doc-fold"></span>
                    <i></i>
                    <i></i>
                    <i></i>
                    <b>
                      CV
                    </b>
                  </div>
                  <div className="flow-connector connector-one"></div>
                  <div className="flow-engine">
                    <span className="engine-spark">
                      ✳
                    </span>
                    <b>
                      AI
                    </b>
                    <small>
                      PARSE + EMBED
                    </small>
                  </div>
                  <div className="flow-connector connector-two"></div>
                  <div className="flow-results">
                    <span className="result-dot"></span>
                    <i></i>
                    <span className="result-dot"></span>
                    <i></i>
                    <span className="result-dot"></span>
                    <i></i>
                  </div>
                  <div className="flow-label flow-output">
                    SEMANTIC MATCH
                  </div>
                  <span className="visual-id">
                    SYSTEM / 01
                  </span>
                </div>
                <div className="project-body">
                  <div className="project-meta">
                    <span>
                      AI · SEARCH · DATA
                    </span>
                    <span>
                      01 / 02
                    </span>
                  </div>
                  <h3>
                    ATS Resume Parser &amp;
                    <br />
                    Semantic Search System
                  </h3>
                  <p>
                    An AI-powered candidate discovery platform that processes varied resume formats, extracts candidate data, and supports semantic and structured search.
                  </p>
                  <div className="project-highlights">
                    <span>
                      Multi-format parsing + OCR
                    </span>
                    <span>
                      Vector-powered semantic search
                    </span>
                    <span>
                      Boolean filters &amp; candidate ranking
                    </span>
                  </div>
                  <details className="project-details">
                    <summary>
                      Explore system details{' '}
                      <span aria-hidden="true">
                        ＋
                      </span>
                    </summary>
                    <div className="details-content">
                      <p>
                        <strong>
                          Workflow
                        </strong>
                        {' '}Resume files enter an asynchronous FastAPI processing flow, where parsing and OCR extract candidate information. FAISS and Pinecone support semantic retrieval, with Boolean AND/OR search and mandatory skill filters for recruiter queries.
                      </p>
                      <p>
                        <strong>
                          Stack
                        </strong>
                        {' '}Python · FastAPI · PostgreSQL · SQLAlchemy · FAISS · Pinecone · Ollama · OCR
                      </p>
                      <p>
                        <strong>
                          Operational focus
                        </strong>
                        {' '}Centralized logging, request tracking, and exception handling.
                      </p>
                    </div>
                  </details>
                </div>
              </article>
              <article className="project-card reveal">
                <div className="project-visual project-visual-igo" role="img" aria-label="Illustration of secure background verification and report delivery workflow">
                  <div className="visual-grid" aria-hidden="true"></div>
                  <div className="secure-ring ring-outer"></div>
                  <div className="secure-ring ring-inner"></div>
                  <div className="secure-shield">
                    <span>
                      ✓
                    </span>
                  </div>
                  <div className="secure-node secure-node-a">
                    <span>
                      API
                    </span>
                  </div>
                  <div className="secure-node secure-node-b">
                    <span>
                      AI
                    </span>
                  </div>
                  <div className="secure-node secure-node-c">
                    <span>
                      S3
                    </span>
                  </div>
                  <div className="secure-node secure-node-d">
                    <span>
                      PDF
                    </span>
                  </div>
                  <div className="visual-label label-verified">
                    <span className="status-dot"></span>
                    {' '}VERIFICATION FLOW
                  </div>
                  <span className="visual-id">
                    SYSTEM / 02
                  </span>
                </div>
                <div className="project-body">
                  <div className="project-meta">
                    <span>
                      SECURITY · AI · CLOUD
                    </span>
                    <span>
                      02 / 02
                    </span>
                  </div>
                  <h3>
                    IGOSMART — Background
                    <br />
                    Verification System
                  </h3>
                  <p>
                    A background verification platform for automating identity and risk assessment workflows with secure APIs and protected report delivery.
                  </p>
                  <div className="project-highlights">
                    <span>
                      JWT &amp; role-based access
                    </span>
                    <span>
                      AI-assisted reports
                    </span>
                    <span>
                      Secure cloud report storage
                    </span>
                  </div>
                  <details className="project-details">
                    <summary>
                      Explore system details{' '}
                      <span aria-hidden="true">
                        ＋
                      </span>
                    </summary>
                    <div className="details-content">
                      <p>
                        <strong>
                          Workflow
                        </strong>
                        {' '}Flask APIs handle authenticated verification requests backed by PostgreSQL (AWS RDS). Background services and Lambda coordinate report generation; Gemini AI supports analysis, and password-protected PDFs are stored in Amazon S3.
                      </p>
                      <p>
                        <strong>
                          Stack
                        </strong>
                        {' '}Python · Flask · PostgreSQL · AWS Lambda · Amazon S3 · SQLAlchemy · Google Gemini AI
                      </p>
                      <p>
                        <strong>
                          Operational focus
                        </strong>
                        {' '}SMTP notifications, structured logging, and centralized exception handling.
                      </p>
                    </div>
                  </details>
                </div>
              </article>
            </div>
            <p className="projects-note">
              <span className="note-mark">
                ↗
              </span>
              {' '}Project repositories and public demos are not listed because no public URLs were provided.
            </p>
          </div>
        </section>
        <section className="section section-credentials" id="education" aria-labelledby="education-title">
          <div className="container">
            <div className="section-heading reveal">
              <p className="eyebrow">
                <span>
                  05
                </span>
                {' '}BACKGROUND
              </p>
              <h2 id="education-title">
                The foundations
                <br />
                <span className="muted-heading">
                  behind the work.
                </span>
              </h2>
            </div>
            <div className="credentials-grid">
              <article className="education-card reveal">
                <div className="credential-top">
                  <span className="credential-label">
                    EDUCATION
                  </span>
                  <span className="credential-symbol">
                    ⌂
                  </span>
                </div>
                <span className="credential-date">
                  AUG 2020 — MAY 2024
                </span>
                <h3>
                  Bachelor of Technology
                </h3>
                <p className="degree-subtitle">
                  Electrical &amp; Electronics Engineering
                </p>
                <div className="credential-rule"></div>
                <p className="institution">
                  Gates Institute of Technology, Gooty
                </p>
                <p className="affiliation">
                  Jawaharlal Nehru Technological University Anantapur (JNTUA)
                </p>
                <div className="grade-line">
                  <span>
                    Percentage
                  </span>
                  <strong>
                    72.27%
                  </strong>
                </div>
              </article>
              <div className="certifications">
                <p className="eyebrow reveal">
                  CERTIFICATIONS
                </p>
                <article className="cert-card reveal">
                  <span className="cert-icon">
                    ✳
                  </span>
                  <div>
                    <span className="cert-org">
                      IBM SKILLS NETWORK
                    </span>
                    <h3>
                      Prompt Engineering for Everyone
                    </h3>
                    <p>
                      AI0117EN
                    </p>
                  </div>
                  <span className="cert-arrow" aria-hidden="true">
                    ↗
                  </span>
                </article>
                <article className="cert-card reveal">
                  <span className="cert-icon cert-icon-blue">
                    ⌘
                  </span>
                  <div>
                    <span className="cert-org">
                      SALESFORCE
                    </span>
                    <h3>
                      Salesforce Developer Certification
                    </h3>
                  </div>
                  <span className="cert-arrow" aria-hidden="true">
                    ↗
                  </span>
                </article>
                <p className="cert-note">
                  No verification URLs were included in the resume.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="section section-contact" id="contact" aria-labelledby="contact-title">
          <div className="container">
            <div className="contact-panel reveal">
              <div className="contact-heading">
                <p className="eyebrow">
                  <span>
                    06
                  </span>
                  {' '}GET IN TOUCH
                </p>
                <h2 id="contact-title">
                  Let’s build
                  <br />
                  <span className="gradient-text">
                    something meaningful.
                  </span>
                </h2>
                <p>
                  Have an opportunity or a problem worth solving? I’d be glad to hear from you.
                </p>
                <a className="contact-email" href="mailto:mseshareddy48@gmail.com">
                  mseshareddy48@gmail.com{' '}
                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
                <div className="contact-links">
                  <a href="https://linkedin.com/in/sesha-reddy-molakathalla-683579322" target="_blank" rel="noopener noreferrer">
                    LinkedIn{' '}
                    <span aria-hidden="true">
                      ↗
                    </span>
                  </a>
                  <a href="https://github.com/molakathallaseshareddy" target="_blank" rel="noopener noreferrer">
                    GitHub{' '}
                    <span aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </div>
                <p className="contact-location">
                  <span aria-hidden="true">
                    ⌖
                  </span>
                  {' '}Hyderabad, Telangana, India
                </p>
              </div>
              <form className="contact-form" id="contact-form" onSubmit={handleContactSubmit} aria-busy={isSending}>
                <div className="form-title">
                  <span>
                    01 — YOUR NOTE
                  </span>
                  <span className="form-required">
                    * REQUIRED
                  </span>
                </div>
                <label className="contact-honeypot" aria-hidden="true">
                  Leave this field empty
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
                <div className="form-row">
                  <label>
                    Name{' '}
                    <span>
                      *
                    </span>
                    <input name="name" autoComplete="name" maxLength={100} required placeholder="Your name" />
                  </label>
                  <label>
                    Email{' '}
                    <span>
                      *
                    </span>
                    <input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" />
                  </label>
                </div>
                <label>
                  Subject{' '}
                  <span>
                    *
                  </span>
                  <input name="subject" maxLength={150} required placeholder="What would you like to discuss?" />
                </label>
                <label>
                  Message{' '}
                  <span>
                    *
                  </span>
                  <textarea name="message" rows="4" maxLength={5000} required placeholder="A little context goes a long way..."></textarea>
                </label>
                <button className="button button-primary form-submit" type="submit" disabled={isSending}>
                  {isSending ? 'Sending…' : 'Send message'}{' '}
                  <span aria-hidden="true">
                    ↗
                  </span>
                </button>
                <p className={`form-note${feedbackIsError ? ' is-error' : ' is-feedback'}`} id="form-feedback" role={feedbackIsError ? 'alert' : 'status'}>
                  {formFeedback}
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <a className="brand" href="#home">
            <span className="brand-mark">
              S
            </span>
            <span>
              sesha
              <span className="brand-dot">
                .
              </span>
            </span>
          </a>
          <p>
            Designed with intent. Built for the long run.
          </p>
          <span className="footer-copy">
            ©{' '}
            <span id="current-year">
              {new Date().getFullYear()}
            </span>
            {' '}Molakathalla Sesha Reddy
          </span>
        </div>
      </footer>
      <a className={`back-to-top${backToTopVisible ? ' is-visible' : ''}`} href="#home" aria-label="Back to top">
        ↑
      </a>
    </>
  );
}
