import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'
import generalAssemblyCertificate from './assets/general-assembly-certificate.png'
import './App.css'

type LinkBlob = {
  id: string
  label: string
  href: string
}

type ContactBlob = {
  id: string
  label: string
  href: string
}

type ProjectBlob = {
  id: string
  label: string
  href: string
}

type AboutBlob = {
  id: string
  label: string
  href: string
}

type SitePage = {
  id: string
  title: string
  description: string
  href: string
  points: string[]
  certificateImage?: string
}

const blobLinks: LinkBlob[] = [
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/DeathsSong' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'contact', label: 'Contact', href: '#contact' },
]

const projectLinks: ProjectBlob[] = [
  { id: 'anaconda', label: 'Anaconda', href: 'https://deathssong.github.io/Anaconda/' },
  { id: 'trivia-trove', label: 'Trivia Trove', href: 'https://deathssong.github.io/trivia-trove/' },
]

const aboutLinks: AboutBlob[] = [
  { id: 'resume', label: 'Resume', href: '#/resume' },
  { id: 'skills', label: 'Skills', href: '#/skills' },
  { id: 'education', label: 'Education', href: '#/education' },
  { id: 'about-me', label: 'About Me', href: '#/about-me' },
]

const contactLinks: ContactBlob[] = [
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/' },
  { id: 'gmail', label: 'Gmail', href: 'mailto:hello@example.com' },
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/michelleloudenclos' },
]

const sitePages: SitePage[] = [
  {
    id: 'resume',
    title: 'Resume',
    description: 'A dedicated page for a downloadable resume and quick career snapshot.',
    href: '#/resume',
    points: ['Add a PDF resume link here.', 'Highlight strongest projects and technical focus.', 'Include contact details for recruiters.'],
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'A focused overview of the technologies, tools, and strengths you want visitors to notice.',
    href: '#/skills',
    points: ['Frontend: React, TypeScript, CSS, responsive UI.', 'Backend: APIs, databases, authentication, deployment.', 'Tools: Git, GitHub, VS Code/Cursor, testing basics.'],
  },
  {
    id: 'education',
    title: 'Education',
    description: 'My software engineering training includes a 420-hour immersive coding bootcamp through General Assembly.',
    href: '#/education',
    points: ['General Assembly Software Engineering Immersive Remote Flex.', 'Completed 420 hours of project-based software engineering training.', 'Focused on full-stack development, practical applications, and portfolio-ready projects.'],
    certificateImage: generalAssemblyCertificate,
  },
  {
    id: 'about-me',
    title: 'About Me',
    description: 'A more personal page about who you are, what you build, and what kind of role you are seeking.',
    href: '#/about-me',
    points: ['Share your developer story.', 'Mention the kinds of problems and teams you enjoy.', 'Keep the tone friendly, confident, and specific.'],
  },
]

const linkTargets = [
  { x: -245, y: -150 },
  { x: 245, y: -128 },
  { x: -220, y: 146 },
  { x: 230, y: 132 },
]

const fusionTargets = [
  { x: -182, y: -220 },
  { x: 174, y: -234 },
  { x: -255, y: 38 },
  { x: 270, y: 78 },
]

const projectIndex = 0
const projectTargets = [
  { x: -62, y: -70 },
  { x: 92, y: 28 },
]

const aboutIndex = 2
const aboutTargets = [
  { x: -96, y: -68 },
  { x: 92, y: -52 },
  { x: -92, y: 58 },
  { x: 92, y: 66 },
]

const contactIndex = 3
const contactTargets = [
  { x: -82, y: -70 },
  { x: 78, y: -62 },
  { x: -78, y: 68 },
  { x: 82, y: 64 },
]

const getCurrentPage = () => {
  if (typeof window === 'undefined') return null
  return sitePages.find((page) => page.href === window.location.hash) ?? null
}

const fuseDurationMs = 5400
const splitBudMs = 650
const splitStringMs = 4700
const fusionSettleRangeMs = [5200, 10500] as const
const fusionHoldRangeMs = [3600, 7200] as const
const fusionSeparateRangeMs = [3200, 6200] as const
const randomBetween = (min: number, max: number) =>
  Math.round(min + Math.random() * (max - min))
const jitterLinkTargets = () =>
  linkTargets.map((target) => ({
    x: target.x + randomBetween(-42, 42),
    y: target.y + randomBetween(-36, 36),
  }))

function App() {
  const [isSplit, setIsSplit] = useState(false)
  const [showLinks, setShowLinks] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const [showStrings, setShowStrings] = useState(false)
  const [isFusing, setIsFusing] = useState(false)
  const [hasSplitOnce, setHasSplitOnce] = useState(false)
  const [projectSplit, setProjectSplit] = useState(false)
  const [aboutSplit, setAboutSplit] = useState(false)
  const [contactSplit, setContactSplit] = useState(false)
  const [currentPage, setCurrentPage] = useState<SitePage | null>(getCurrentPage)
  const [fusedLink, setFusedLink] = useState<number | null>(null)
  const [fusionOffsets, setFusionOffsets] = useState(fusionTargets)
  const [restTargets, setRestTargets] = useState(linkTargets)
  const links = useMemo(() => blobLinks, [])
  const fuseTimer = useRef<number | undefined>(undefined)
  const splitTimer = useRef<number | undefined>(undefined)
  const stringTimer = useRef<number | undefined>(undefined)
  const fusionTimers = useRef<number[]>([])
  const projectBase = isSplit
    ? fusedLink === projectIndex
      ? fusionOffsets[projectIndex]
      : restTargets[projectIndex]
    : { x: 0, y: 0 }
  const aboutBase = isSplit
    ? fusedLink === aboutIndex
      ? fusionOffsets[aboutIndex]
      : restTargets[aboutIndex]
    : { x: 0, y: 0 }
  const contactBase = isSplit
    ? fusedLink === contactIndex
      ? fusionOffsets[contactIndex]
      : restTargets[contactIndex]
    : { x: 0, y: 0 }

  useEffect(() => {
    return () => {
      if (fuseTimer.current) {
        window.clearTimeout(fuseTimer.current)
      }
      if (splitTimer.current) {
        window.clearTimeout(splitTimer.current)
      }
      if (stringTimer.current) {
        window.clearTimeout(stringTimer.current)
      }
      fusionTimers.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(getCurrentPage())

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    fusionTimers.current.forEach((timer) => window.clearTimeout(timer))
    fusionTimers.current = []
    setFusedLink(null)

    if (!isSplit) return

    let cancelled = false
    let previousIndex = -1

    const pickNextIndex = () => {
      if (links.length <= 1) return 0
      let next = previousIndex
      while (next === previousIndex) {
        next = Math.floor(Math.random() * links.length)
      }
      previousIndex = next
      return next
    }

    const jitterTargets = () =>
      fusionTargets.map((target) => ({
        x: target.x + randomBetween(-34, 34),
        y: target.y + randomBetween(-28, 28),
      }))

    const queueFusion = () => {
      const arriveTimer = window.setTimeout(() => {
        if (cancelled) return
        const index = pickNextIndex()
        setFusionOffsets(jitterTargets())
        setFusedLink(index)

        const separateTimer = window.setTimeout(() => {
          if (cancelled) return
          setRestTargets((current) =>
            current.map((target, targetIndex) =>
              targetIndex === index
                ? {
                    x: linkTargets[targetIndex].x + randomBetween(-52, 52),
                    y: linkTargets[targetIndex].y + randomBetween(-44, 44),
                  }
                : target,
            ),
          )
          setFusedLink(null)

          const nextTimer = window.setTimeout(() => {
            if (!cancelled) queueFusion()
          }, randomBetween(...fusionSeparateRangeMs))
          fusionTimers.current.push(nextTimer)
        }, randomBetween(...fusionHoldRangeMs))

        fusionTimers.current.push(separateTimer)
      }, randomBetween(...fusionSettleRangeMs))

      fusionTimers.current.push(arriveTimer)
    }

    queueFusion()

    return () => {
      cancelled = true
      fusionTimers.current.forEach((timer) => window.clearTimeout(timer))
      fusionTimers.current = []
    }
  }, [isSplit, links.length])

  const toggleGlobs = () => {
    if (fuseTimer.current) {
      window.clearTimeout(fuseTimer.current)
    }
    if (splitTimer.current) {
      window.clearTimeout(splitTimer.current)
    }
    if (stringTimer.current) {
      window.clearTimeout(stringTimer.current)
    }

    if (isSplit) {
      setIsFusing(true)
      setIsSplit(false)
      setFusedLink(null)
      setProjectSplit(false)
      setAboutSplit(false)
      setContactSplit(false)
      setShowLabels(false)
      setShowStrings(false)
      fuseTimer.current = window.setTimeout(() => {
        setShowLinks(false)
        setIsFusing(false)
      }, fuseDurationMs)
      return
    }

    setIsFusing(false)
    setShowLabels(false)
    splitTimer.current = window.setTimeout(() => {
      setRestTargets(jitterLinkTargets())
      setShowLinks(true)
      setIsSplit(true)
      setShowStrings(hasSplitOnce)
      setHasSplitOnce(true)
      window.setTimeout(() => setShowLabels(true), 520)
      stringTimer.current = window.setTimeout(() => {
        setShowStrings(false)
      }, splitStringMs)
    }, splitBudMs)
  }

  if (currentPage) {
    return (
      <main className="portfolio portfolio-page">
        <section className="page-card">
          <a className="back-link" href="#">
            Back to lava lamp
          </a>
          <h1>{currentPage.title}</h1>
          <p className="page-description">{currentPage.description}</p>
          <ul className="page-points">
            {currentPage.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          {currentPage.certificateImage && (
            <figure className="certificate-frame">
              <img
                src={currentPage.certificateImage}
                alt="General Assembly software engineering certificate for Michelle Loudenclos"
              />
            </figure>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="portfolio">
      <header className="intro">
        <p className="eyebrow">Michelle Loudenclos | Full-Stack Developer | Reno, NV</p>
        <h1>Molten ideas, shipped to production.</h1>
        <p className="subtitle">
          Click the central lava glob to break it into quick paths for projects,
          socials, and contact.
        </p>
      </header>

      <section className="lamp">
        <div className={`lamp-shell ${isSplit ? 'split' : ''} ${isFusing ? 'fusing' : ''}`}>
          <svg className="lava-svg" viewBox="0 0 1000 620" aria-hidden="true">
            <defs>
              <filter id="lava-goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="
                    1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 30 -11
                  "
                  result="goo"
                />
                <feGaussianBlur in="goo" stdDeviation="1.1" />
              </filter>
              <linearGradient id="liquid-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#05284f" />
                <stop offset="48%" stopColor="#0a5aa7" />
                <stop offset="100%" stopColor="#0d7eb5" />
              </linearGradient>
              <radialGradient id="lava-gradient" cx="52%" cy="64%" r="78%">
                <stop offset="0%" stopColor="#ffff74" />
                <stop offset="22%" stopColor="#baff28" />
                <stop offset="48%" stopColor="#55e819" />
                <stop offset="76%" stopColor="#17a927" />
                <stop offset="100%" stopColor="#087446" />
              </radialGradient>
              <radialGradient id="heater-glow" cx="50%" cy="86%" r="52%">
                <stop offset="0%" stopColor="#fff86a" stopOpacity="0.95" />
                <stop offset="32%" stopColor="#bfff27" stopOpacity="0.7" />
                <stop offset="68%" stopColor="#35e355" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#35e355" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="depth-back-gradient" cx="56%" cy="56%" r="78%">
                <stop offset="0%" stopColor="#8de6ff" />
                <stop offset="40%" stopColor="#3f9bff" />
                <stop offset="76%" stopColor="#1d5dbf" />
                <stop offset="100%" stopColor="#153d7f" />
              </radialGradient>
              <radialGradient id="depth-front-gradient" cx="52%" cy="58%" r="78%">
                <stop offset="0%" stopColor="#d9ff8e" />
                <stop offset="30%" stopColor="#86f03c" />
                <stop offset="64%" stopColor="#2eb34d" />
                <stop offset="100%" stopColor="#15714c" />
              </radialGradient>
              <linearGradient id="water-haze" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#bfe7ff" stopOpacity="0.14" />
                <stop offset="45%" stopColor="#8ad0ff" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#5fc8ff" stopOpacity="0.02" />
              </linearGradient>
              <radialGradient id="tank-vignette" cx="50%" cy="50%" r="62%">
                <stop offset="62%" stopColor="#001b3a" stopOpacity="0" />
                <stop offset="100%" stopColor="#001b3a" stopOpacity="0.32" />
              </radialGradient>
              <radialGradient id="foreground-shadow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#001834" stopOpacity="0" />
                <stop offset="100%" stopColor="#001834" stopOpacity="0.28" />
              </radialGradient>
            </defs>

            <rect width="1000" height="620" rx="34" fill="url(#liquid-gradient)" />
            <ellipse className="heater-light" cx="500" cy="638" rx="300" ry="170" fill="url(#heater-glow)" />
            <ellipse className="cool-shadow" cx="500" cy="170" rx="420" ry="180" />
            <rect width="1000" height="620" rx="34" fill="url(#water-haze)" />

            <g className="depth-layer back-depth" fill="url(#depth-back-gradient)">
              <ellipse className="depth-blob db1" cx="92" cy="172" rx="58" ry="46" />
              <ellipse className="depth-blob db2" cx="912" cy="248" rx="66" ry="52" />
              <ellipse className="depth-blob db3" cx="430" cy="74" rx="48" ry="38" />
              <circle className="depth-blob db4" cx="856" cy="520" r="26" />
            </g>

            <g className="ambient-goo" filter="url(#lava-goo)" fill="url(#depth-back-gradient)">
              <path
                className="ambient-string ambient-string-1"
                d="M112 438 C190 400 274 392 352 438"
              />
              <path
                className="ambient-string ambient-string-2"
                d="M660 198 C728 168 812 166 888 204"
              />
              <path
                className="ambient-string ambient-string-3"
                d="M410 112 C478 90 546 94 612 128"
              />
              <ellipse className="ambient-merge am1" cx="126" cy="438" rx="58" ry="44" />
              <ellipse className="ambient-merge am2" cx="332" cy="438" rx="72" ry="50" />
              <ellipse className="ambient-merge am3" cx="680" cy="206" rx="54" ry="44" />
              <ellipse className="ambient-merge am4" cx="866" cy="206" rx="62" ry="46" />
              <ellipse className="ambient-merge am5" cx="430" cy="120" rx="48" ry="38" />
              <ellipse className="ambient-merge am6" cx="598" cy="120" rx="52" ry="40" />
            </g>

            <g filter="url(#lava-goo)" fill="url(#lava-gradient)" opacity="0.96">
              <ellipse className="blob b1" cx="190" cy="620" rx="118" ry="48" />
              <ellipse className="blob b2" cx="505" cy="642" rx="154" ry="62" />
              <ellipse className="blob b3" cx="814" cy="610" rx="110" ry="44" />
              <path
                className="blob lava-neck"
                d="M318 632 C382 576 442 578 496 612 C548 646 614 582 704 626 C728 638 748 656 762 676 L286 676 C292 658 304 644 318 632 Z"
              />
              <ellipse className="bottom-glob bottom-glob-1" cx="365" cy="586" rx="38" ry="30" />
              <ellipse className="bottom-glob bottom-glob-2" cx="468" cy="600" rx="30" ry="24" />
              <ellipse className="bottom-glob bottom-glob-3" cx="594" cy="588" rx="42" ry="32" />
              <circle className="bottom-glob bottom-glob-4" cx="690" cy="604" r="24" />
              <ellipse className="blob b4" cx="500" cy="356" rx="88" ry="78" />
              <ellipse className="blob b5" cx="245" cy="390" rx="56" ry="44" />
              <ellipse className="blob b6" cx="770" cy="430" rx="70" ry="50" />
              <ellipse className="blob b7" cx="318" cy="132" rx="82" ry="72" />
              <ellipse className="blob b8" cx="674" cy="118" rx="76" ry="66" />
              <circle className="tiny t1" cx="380" cy="248" r="10" />
              <circle className="tiny t2" cx="650" cy="292" r="14" />
              <circle className="tiny t3" cx="742" cy="470" r="9" />
              <circle className="tiny t4" cx="265" cy="502" r="8" />

              <circle
                className={`action-lava ${isSplit ? 'split' : ''}`}
                cx="500"
                cy="352"
                r="84"
              />
              {links.map((link, index) => (
                <circle
                  key={link.id}
                  className={`link-lava link-lava-${index + 1}`}
                  cx="500"
                  cy="352"
                  r="48"
                  style={
                    {
                      ['--y' as string]: `${isSplit ? (fusedLink === index ? fusionOffsets[index].y : restTargets[index].y) : 0}px`,
                      ['--x' as string]: `${isSplit ? (fusedLink === index ? fusionOffsets[index].x : restTargets[index].x) : 0}px`,
                      ['--show' as string]: showLinks ? 1 : 0,
                      ['--s' as string]: isSplit ? (fusedLink === index ? 1.55 : 1) : 0.48,
                      opacity: showLinks ? 1 : 0,
                    } as CSSProperties
                  }
                />
              ))}
              {projectLinks.map((link, index) => (
                <circle
                  key={`${link.id}-lava`}
                  className="project-lava"
                  cx="500"
                  cy="352"
                  r="36"
                  style={
                    {
                      ['--x' as string]: `${projectBase.x + (projectSplit ? projectTargets[index].x : 0)}px`,
                      ['--y' as string]: `${projectBase.y + (projectSplit ? projectTargets[index].y : 0)}px`,
                      ['--show' as string]: projectSplit ? 1 : 0,
                      ['--s' as string]: projectSplit ? 1 : 0.12,
                    } as CSSProperties
                  }
                />
              ))}
              {aboutLinks.map((link, index) => (
                <circle
                  key={`${link.id}-lava`}
                  className="about-lava"
                  cx="500"
                  cy="352"
                  r="32"
                  style={
                    {
                      ['--x' as string]: `${aboutBase.x + (aboutSplit ? aboutTargets[index].x : 0)}px`,
                      ['--y' as string]: `${aboutBase.y + (aboutSplit ? aboutTargets[index].y : 0)}px`,
                      ['--show' as string]: aboutSplit ? 1 : 0,
                      ['--s' as string]: aboutSplit ? 1 : 0.12,
                    } as CSSProperties
                  }
                />
              ))}
              {contactLinks.map((link, index) => (
                <circle
                  key={`${link.id}-lava`}
                  className="contact-lava"
                  cx="500"
                  cy="352"
                  r="25"
                  style={
                    {
                      ['--x' as string]: `${contactBase.x + (contactSplit ? contactTargets[index].x : 0)}px`,
                      ['--y' as string]: `${contactBase.y + (contactSplit ? contactTargets[index].y : 0)}px`,
                      ['--show' as string]: contactSplit ? 1 : 0,
                      ['--s' as string]: contactSplit ? 1 : 0.12,
                    } as CSSProperties
                  }
                />
              ))}
              {links.map((link, index) => {
                const target = isSplit ? restTargets[index] : { x: 0, y: 0 }
                return (
                  <path
                    key={`${link.id}-strand`}
                    className="split-strand"
                    d={`M500 352 C ${500 + target.x * 0.18} ${352 + target.y * 0.04}, ${500 + target.x * 0.46} ${352 + target.y * 0.82}, ${500 + target.x} ${352 + target.y}`}
                    style={
                      {
                        ['--strand-show' as string]: showStrings ? 1 : 0,
                      } as CSSProperties
                    }
                  />
                )
              })}
            </g>

            <g className="depth-layer front-depth" fill="url(#depth-front-gradient)">
              <ellipse className="depth-blob fd1" cx="78" cy="548" rx="86" ry="64" />
              <ellipse className="depth-blob fd2" cx="936" cy="388" rx="72" ry="54" />
              <circle className="depth-blob fd3" cx="104" cy="294" r="24" />
            </g>
            <rect width="1000" height="620" rx="34" fill="url(#foreground-shadow)" className="foreground-shadow" />
            <rect width="1000" height="620" rx="34" fill="url(#tank-vignette)" />
          </svg>

          <button
            type="button"
            className="main-glob"
            onClick={toggleGlobs}
            aria-expanded={showLinks}
          >
          </button>

          <div className="split-globs">
            {links.map((link, index) => (
                <a
                  key={link.id}
                  className={`link-glob link-glob-${index + 1}`}
                  style={
                    {
                      ['--x' as string]: `${isSplit ? (fusedLink === index ? fusionOffsets[index].x : restTargets[index].x) : 0}px`,
                      ['--y' as string]: `${isSplit ? (fusedLink === index ? fusionOffsets[index].y : restTargets[index].y) : 0}px`,
                      ['--show' as string]: showLabels ? 1 : 0,
                      ['--s' as string]: isSplit ? 1 : 0.48,
                      ['--label-scale' as string]: fusedLink === index ? 1.28 : 1,
                      pointerEvents: isSplit ? 'auto' : 'none',
                    } as CSSProperties
                  }
                  href={link.href}
                  onClick={(event) => {
                    if (link.id === 'projects') {
                      event.preventDefault()
                      setProjectSplit((current) => !current)
                      setAboutSplit(false)
                      setContactSplit(false)
                      return
                    }
                    if (link.id === 'about') {
                      event.preventDefault()
                      setAboutSplit((current) => !current)
                      setProjectSplit(false)
                      setContactSplit(false)
                      return
                    }
                    if (link.id !== 'contact') return
                    event.preventDefault()
                    setContactSplit((current) => !current)
                    setProjectSplit(false)
                    setAboutSplit(false)
                  }}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={
                    link.href.startsWith('http')
                      ? 'noreferrer noopener'
                      : undefined
                  }
                >
                  <span className="glob-label" data-label={link.label}>
                    {link.label}
                  </span>
                </a>
            ))}
          </div>
          <div className="project-globs">
            {projectLinks.map((link, index) => (
              <a
                key={link.id}
                className="project-link"
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                style={
                  {
                    ['--x' as string]: `${projectBase.x + (projectSplit ? projectTargets[index].x : 0)}px`,
                    ['--y' as string]: `${projectBase.y + (projectSplit ? projectTargets[index].y : 0)}px`,
                    ['--show' as string]: projectSplit ? 1 : 0,
                    ['--s' as string]: projectSplit ? 1 : 0.12,
                    pointerEvents: projectSplit ? 'auto' : 'none',
                  } as CSSProperties
                }
              >
                <span className="glob-label project-label" data-label={link.label}>
                  {link.label}
                </span>
              </a>
            ))}
          </div>
          <div className="about-globs">
            {aboutLinks.map((link, index) => (
              <a
                key={link.id}
                className="about-link"
                href={link.href}
                style={
                  {
                    ['--x' as string]: `${aboutBase.x + (aboutSplit ? aboutTargets[index].x : 0)}px`,
                    ['--y' as string]: `${aboutBase.y + (aboutSplit ? aboutTargets[index].y : 0)}px`,
                    ['--show' as string]: aboutSplit ? 1 : 0,
                    ['--s' as string]: aboutSplit ? 1 : 0.12,
                    pointerEvents: aboutSplit ? 'auto' : 'none',
                  } as CSSProperties
                }
              >
                <span className="glob-label about-label" data-label={link.label}>
                  {link.label}
                </span>
              </a>
            ))}
          </div>
          <div className="contact-globs">
            {contactLinks.map((link, index) => (
              <a
                key={link.id}
                className={`contact-link contact-link-${link.id}`}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                aria-label={link.label}
                style={
                  {
                    ['--x' as string]: `${contactBase.x + (contactSplit ? contactTargets[index].x : 0)}px`,
                    ['--y' as string]: `${contactBase.y + (contactSplit ? contactTargets[index].y : 0)}px`,
                    ['--show' as string]: contactSplit ? 1 : 0,
                    ['--s' as string]: contactSplit ? 1 : 0.12,
                    pointerEvents: contactSplit ? 'auto' : 'none',
                  } as CSSProperties
                }
              >
                <span className="brand-icon" aria-hidden="true">
                  {link.id === 'instagram' && <FaInstagram />}
                  {link.id === 'gmail' && <SiGmail />}
                  {link.id === 'facebook' && <FaFacebookF />}
                  {link.id === 'linkedin' && <FaLinkedinIn />}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
