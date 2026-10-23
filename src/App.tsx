import { useEffect, useRef, useState, type RefObject } from "react";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiPause,
  FiPlay,
} from "react-icons/fi";
import { portfolio, projects } from "./content";
import certificate from "./assets/general-assembly-certificate.png";
import "./App.css";

type View =
  | "home"
  | "projects"
  | "anaconda"
  | "trivia"
  | "about"
  | "story"
  | "skills"
  | "education"
  | "contact"
  | "github";
type Mood = "electric" | "sunset" | "cosmic";
const roots = [
  { id: "projects", label: "Projects", x: 0.3, y: 0.64, phase: 0 },
  { id: "about", label: "About me", x: 0.68, y: 0.32, phase: 1.7 },
  { id: "contact", label: "Contact", x: 0.74, y: 0.72, phase: 3.2 },
  { id: "github", label: "GitHub", x: 0.34, y: 0.83, phase: 4.9 },
] as const;
const ambient = Array.from({ length: 9 }, (_, i) => ({
  x: [0.06, 0.94, 0.49, 0.13, 0.86, 0.52, 0.04, 0.96, 0.57][i],
  y: [0.9, 0.35, 1.04, -0.22, 0.94, -0.18, 0.7, 0.7, 0.53][i],
  r: [70, 49, 115, 30, 87, 62, 28, 23, 24][i],
}));
function preference(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function savePreference(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Optional browser storage. */
  }
}
function rootFor(view: View) {
  if (view === "home") return null;
  if (view === "anaconda" || view === "trivia") return "projects";
  if (["story", "skills", "education"].includes(view)) return "about";
  return view;
}

// SVG wax and HTML hit areas share the same coordinates. Shapes can merge while
// their labels remain crisp, keyboard accessible, and easy to tap.
function useLava(
  stage: RefObject<HTMLDivElement | null>,
  active: string | null,
  motion: boolean,
  hovered: RefObject<string | null>,
) {
  const positions = useRef(
    roots.map((root) => ({
      x: Number(root.x),
      y: Number(root.y),
      tx: Number(root.x),
      ty: Number(root.y),
      rx: 80,
      ry: 90,
      next: 0,
    })),
  );
  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    let width = host.clientWidth,
      height = host.clientHeight,
      frame = 0,
      last = 0;
    const observer = new ResizeObserver(() => {
      width = host.clientWidth;
      height = host.clientHeight;
      if (!motion) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      }
    });
    observer.observe(host);
    const tick = (now: number) => {
      const dt = Math.min(now - (last || now - 16), 40);
      last = now;
      const mobile = width < 600;
      const radius = Math.max(55, Math.min(width * 0.105, height * 0.145, 105));
      roots.forEach((root, i) => {
        const p = positions.current[i];
        if (motion && !active && now > p.next) {
          p.tx = Math.max(
            0.15,
            Math.min(
              0.85,
              root.x + (Math.random() - 0.5) * (mobile ? 0.22 : 0.36),
            ),
          );
          p.ty = Math.max(
            0.29,
            Math.min(0.86, root.y + (Math.random() - 0.5) * 0.28),
          );
          p.next = now + 4500 + Math.random() * 7500;
        }
        if (!active) {
          // Leave a calm corner for the introduction, and let wax overlap
          // without letting two navigation labels occupy the same space.
          if (p.tx * width - radius < (mobile ? width * 0.75 : 330))
            p.ty = Math.max(
              p.ty,
              Math.min(0.84, ((mobile ? 250 : 270) + radius) / height),
            );
          positions.current.forEach((other, j) => {
            if (i === j || !motion) return;
            const dx = (p.x - other.x) * width,
              dy = (p.y - other.y) * height;
            const distance = Math.hypot(dx, dy);
            const gap = radius * 1.6;
            if (distance > 0 && distance < gap) {
              p.x += ((dx / distance) * (gap - distance) * 0.012) / width;
              p.y += ((dy / distance) * (gap - distance) * 0.012) / height;
            }
          });
        }
        const isActive = active === root.id;
        const gx = isActive ? 0.5 : active ? root.x : motion ? p.tx : root.x;
        const gy = isActive ? 0.54 : active ? root.y : motion ? p.ty : root.y;
        const follow = motion ? 1 - Math.exp(-dt / (active ? 185 : 2200)) : 1;
        p.x += (gx - p.x) * follow;
        p.y += (gy - p.y) * follow;
        const t = motion ? now * 0.00055 + root.phase : root.phase;
        const hover = hovered.current === root.id && !active ? 1.1 : 1;
        const goalRx = isActive
          ? Math.min(width * (mobile ? 0.495 : 0.42), 470) * (1 + Math.sin(t) * 0.015)
          : active
            ? 6
            : radius * hover * (i === 3 ? 0.79 : 1) * (1 + Math.sin(t) * 0.12);
        const goalRy = isActive
          ? height * (mobile ? 0.445 : 0.43) * (1 + Math.cos(t) * 0.015)
          : active
            ? 7
            : radius *
              hover *
              (i === 3 ? 0.8 : 1) *
              (1 + Math.cos(t * 1.2) * 0.14);
        const grow = motion ? 1 - Math.exp(-dt / 185) : 1;
        p.rx += (goalRx - p.rx) * grow;
        p.ry += (goalRy - p.ry) * grow;
        const shape = host.querySelector(`#wax-${root.id}`);
        shape?.setAttribute("cx", String(p.x * width));
        shape?.setAttribute("cy", String(p.y * height));
        shape?.setAttribute("rx", String(p.rx));
        shape?.setAttribute("ry", String(p.ry));
        const hit = host.querySelector<HTMLButtonElement>(`#hit-${root.id}`);
        if (hit) {
          hit.style.left = `${p.x * width}px`;
          hit.style.top = `${p.y * height}px`;
          hit.style.width = `${p.rx * 1.9}px`;
          hit.style.height = `${p.ry * 1.9}px`;
        }
      });
      ambient.forEach((blob, i) => {
        const t = motion ? now * 0.00013 + i * 1.8 : i * 1.8;
        const shape = host.querySelector(`#ambient-${i}`);
        const scale = Math.min(width / 900, 1);
        shape?.setAttribute(
          "cx",
          String((blob.x + Math.sin(t) * 0.075) * width),
        );
        shape?.setAttribute(
          "cy",
          String((blob.y + Math.cos(t * 0.8) * 0.17) * height),
        );
        shape?.setAttribute(
          "rx",
          String(blob.r * Math.max(0.6, scale) * (1 + Math.sin(t) * 0.2)),
        );
        shape?.setAttribute(
          "ry",
          String(blob.r * Math.max(0.65, scale) * (1.1 + Math.cos(t) * 0.23)),
        );
      });
      if (motion) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [stage, active, motion, hovered]);
}

function LavaAction({
  children,
  onClick,
  href,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const content = (
    <>
      <span className="action-wax" aria-hidden="true" />
      <span className="action-label">{children}</span>
    </>
  );
  return href ? (
    <a
      className={`lava-action ${className}`}
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
    >
      {content}
    </a>
  ) : (
    <button className={`lava-action ${className}`} onClick={onClick}>
      {content}
    </button>
  );
}

function App() {
  const [view, setView] = useState<View>("home");
  const [mood, setMood] = useState<Mood>(() => {
    const saved = preference("michelle-lava-mood");
    return ["electric", "sunset", "cosmic"].includes(saved || "")
      ? (saved as Mood)
      : "electric";
  });
  const [motion, setMotion] = useState(() => {
    const saved = preference("michelle-motion");
    return saved
      ? saved === "on"
      : !matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const stage = useRef<HTMLDivElement>(null);
  const hovered = useRef<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const lastRoot = useRef<string | null>(null);
  const active = rootFor(view);
  useLava(stage, active, motion, hovered);
  useEffect(() => {
    savePreference("michelle-lava-mood", mood);
    savePreference("michelle-motion", motion ? "on" : "off");
  }, [mood, motion]);
  useEffect(() => {
    if (active) {
      lastRoot.current = active;
      panel.current?.focus({ preventScroll: true });
    } else if (lastRoot.current)
      document
        .getElementById(`hit-${lastRoot.current}`)
        ?.focus({ preventScroll: true });
  }, [view, active]);
  const back = () =>
    setView(
      view === "anaconda" || view === "trivia"
        ? "projects"
        : ["story", "skills", "education"].includes(view)
          ? "about"
          : "home",
    );
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape")
        setView((current) =>
          current === "anaconda" || current === "trivia"
            ? "projects"
            : ["story", "skills", "education"].includes(current)
              ? "about"
              : "home",
        );
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, []);
  const project = view === "anaconda" ? projects[0] : projects[1];
  return (
    <div
      className="lava-world"
      data-mood={mood}
      data-motion={motion ? "on" : "off"}
    >
      <a className="skip-link" href="#lava-stage">
        Skip to the lava
      </a>
      <header className="world-header">
        <a
          className="world-brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setView("home");
          }}
        >
          michelle<span>.</span>
        </a>
        <div className="identity">
          <span>MICHELLE LOUDENCLOS</span>
          <span>
            FULL-STACK DEVELOPER <i /> RENO, NV
          </span>
        </div>
        <span className="header-note">
          A CURIOUS MIND.
          <br />
          AN EVER-CHANGING STATE.
        </span>
      </header>
      <main
        className="lava-stage"
        id="lava-stage"
        ref={stage}
        tabIndex={-1}
        aria-label="Interactive lava lamp portfolio"
      >
        <div className="liquid-depth" aria-hidden="true" />
        <div className="glass-reflection" aria-hidden="true" />
        <svg className="wax-canvas" aria-hidden="true">
          <defs>
            <radialGradient id="molten" cx=".43" cy=".35" r=".7">
              <stop offset="0" stopColor="var(--wax-core)" />
              <stop offset=".6" stopColor="var(--wax)" />
              <stop offset="1" stopColor="var(--wax-edge)" />
            </radialGradient>
            <filter
              id="liquid-goo"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur stdDeviation="11" result="blur" />
              <feColorMatrix
                in="blur"
                values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 24 -10"
                result="goo"
              />
              <feGaussianBlur in="goo" stdDeviation=".7" />
            </filter>
            <filter id="soft-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="19" />
            </filter>
          </defs>
          <g
            className="ambient-glow"
            fill="var(--wax)"
            filter="url(#soft-glow)"
          >
            <ellipse cx="50%" cy="110%" rx="45%" ry="15%" />
          </g>
          <g
            className={`all-wax ${active ? "wax-focused" : ""}`}
            fill="url(#molten)"
            filter="url(#liquid-goo)"
          >
            {ambient.map((_, i) => (
              <ellipse
                id={`ambient-${i}`}
                key={i}
                cx="0"
                cy="0"
                rx="0"
                ry="0"
                className="ambient-wax"
              />
            ))}
            {roots.map((root) => (
              <ellipse
                id={`wax-${root.id}`}
                key={root.id}
                cx="50%"
                cy="50%"
                rx="0"
                ry="0"
                className="nav-wax"
              />
            ))}
          </g>
        </svg>
        <div
          className={`stage-intro ${active ? "intro-hidden" : ""}`}
          aria-hidden={!!active}
        >
          <p className="eyebrow">THOUGHTFUL CODE. PLAYFUL POSSIBILITIES.</p>
          <h1>
            Ideas in
            <br />
            <em>motion.</em>
          </h1>
          <p>
            This is my little corner of the internet.
            <br />
            Tap the lava. Find your own way around.
          </p>
        </div>
        <nav
          className={`lava-navigation ${active ? "navigation-hidden" : ""}`}
          aria-label="Lava lamp navigation"
          aria-hidden={!!active}
        >
          {roots.map((root) => (
            <button
              key={root.id}
              id={`hit-${root.id}`}
              className={`glob-hit glob-${root.id}`}
              disabled={!!active}
              onPointerEnter={() => {
                hovered.current = root.id;
              }}
              onPointerLeave={() => {
                hovered.current = null;
              }}
              onClick={() => {
                hovered.current = null;
                setView(root.id);
              }}
            >
              <span>{root.label}</span>
              <FiArrowUpRight />
              <small>
                {root.id === "projects"
                  ? "THINGS I’VE MADE"
                  : root.id === "about"
                    ? "THE HUMAN"
                    : root.id === "contact"
                      ? "SAY HELLO"
                      : "EXPLORE THE CODE"}
              </small>
            </button>
          ))}
        </nav>
        {active && (
          <>
            <button className="flow-back" onClick={back}>
              <span aria-hidden="true" />
              <FiArrowLeft />{" "}
              {["anaconda", "trivia", "story", "skills", "education"].includes(
                view,
              )
                ? "Back"
                : "Back to the flow"}
            </button>
            <div
              ref={panel}
              key={view}
              className={`lava-panel panel-${view}`}
              tabIndex={-1}
              role="region"
              aria-label={
                view === "anaconda" || view === "trivia" ? project.name : view
              }
            >
              {view === "projects" && (
                <>
                  <p className="eyebrow">01 / SELECTED WORK</p>
                  <h2>
                    Made of curiosity.
                    <br />
                    Built to play.
                  </h2>
                  <p className="panel-intro">
                    A couple of ideas I’ve brought to life.
                    <br />
                    Pick a glob and get into it.
                  </p>
                  <div className="sub-globs project-globs">
                    <LavaAction onClick={() => setView("anaconda")}>
                      <span className="sub-index">01 / BROWSER GAME</span>
                      <strong>Anaconda</strong>
                      <span>
                        One more bite. <FiArrowUpRight />
                      </span>
                    </LavaAction>
                    <LavaAction onClick={() => setView("trivia")}>
                      <span className="sub-index">02 / WEB APP</span>
                      <strong>Trivia Trove</strong>
                      <span>
                        Stay curious. <FiArrowUpRight />
                      </span>
                    </LavaAction>
                  </div>
                </>
              )}
              {(view === "anaconda" || view === "trivia") && (
                <>
                  <p className="eyebrow">{project.kind}</p>
                  <h2>{project.name}</h2>
                  <p className="detail-copy">{project.description}</p>
                  <div className="skill-cloud">
                    {project.tech.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                  <div className="sub-globs compact-globs">
                    <LavaAction href={project.live}>
                      <FiArrowUpRight />
                      <strong>
                        {view === "anaconda" ? "Play the game" : "Try the app"}
                      </strong>
                    </LavaAction>
                    <LavaAction href={project.source}>
                      <FiGithub />
                      <strong>View code</strong>
                    </LavaAction>
                  </div>
                </>
              )}
              {view === "about" && (
                <>
                  <p className="eyebrow">02 / THE HUMAN IN THE LAMP</p>
                  <h2>Hi, I’m Michelle.</h2>
                  <p className="panel-intro">
                    Full-stack developer. Reno, Nevada.
                    <br />A little logic, a lot of curiosity.
                  </p>
                  <div className="sub-globs about-globs">
                    <LavaAction onClick={() => setView("story")}>
                      <strong>My story</strong>
                      <span>
                        A little about me <FiArrowUpRight />
                      </span>
                    </LavaAction>
                    <LavaAction onClick={() => setView("skills")}>
                      <strong>My toolkit</strong>
                      <span>
                        What I build with <FiArrowUpRight />
                      </span>
                    </LavaAction>
                    <LavaAction onClick={() => setView("education")}>
                      <strong>Education</strong>
                      <span>
                        Where it started <FiArrowUpRight />
                      </span>
                    </LavaAction>
                  </div>
                </>
              )}
              {view === "story" && (
                <>
                  <p className="eyebrow">ALWAYS A WORK IN PROGRESS</p>
                  <h2>
                    Stay curious.
                    <br />
                    Keep growing.
                  </h2>
                  <p className="detail-copy">
                    I’m Michelle Loudenclos, a full-stack developer based in
                    Reno, Nevada. I like the space where logic meets creativity:
                    taking an idea, figuring out how it works, and giving it a
                    little character along the way.
                  </p>
                  <p className="detail-copy secondary-copy">
                    My General Assembly training turned that curiosity into
                    hands-on experience building for the web. Now I’m putting it
                    into motion, one project at a time.
                  </p>
                </>
              )}
              {view === "skills" && (
                <>
                  <p className="eyebrow">THE INGREDIENTS</p>
                  <h2>In my toolkit.</h2>
                  <p className="panel-intro">
                    The tools I use to turn “what if” into something you can
                    click.
                  </p>
                  <div className="skill-cloud big-cloud">
                    {portfolio.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </>
              )}
              {view === "education" && (
                <>
                  <p className="eyebrow">THE FOUNDATION</p>
                  <h2>General Assembly</h2>
                  <p className="panel-intro">
                    Software Engineering Immersive Remote Flex.
                    <br />
                    420 hours of project-based training.
                  </p>
                  <a
                    className="certificate-link"
                    href={certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={certificate}
                      alt="General Assembly software engineering certificate for Michelle Loudenclos"
                    />
                    <span>
                      Open the certificate <FiArrowUpRight />
                    </span>
                  </a>
                </>
              )}
              {view === "contact" && (
                <>
                  <p className="eyebrow">03 / GOOD THINGS START WITH A HELLO</p>
                  <h2>
                    Let’s make
                    <br />
                    something flow.
                  </h2>
                  <a
                    className="email-address"
                    href={`mailto:${portfolio.email}`}
                  >
                    {portfolio.email}
                  </a>
                  <div className="sub-globs contact-globs">
                    <LavaAction href={`mailto:${portfolio.email}`}>
                      <FiMail />
                      <strong>Email</strong>
                    </LavaAction>
                    <LavaAction href={portfolio.linkedin}>
                      <FiLinkedin />
                      <strong>LinkedIn</strong>
                    </LavaAction>
                    <LavaAction href={portfolio.github}>
                      <FiGithub />
                      <strong>GitHub</strong>
                    </LavaAction>
                  </div>
                  {portfolio.resume && (
                    <a
                      className="resume-link"
                      href={portfolio.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      My résumé <FiArrowUpRight />
                    </a>
                  )}
                </>
              )}
              {view === "github" && (
                <>
                  <p className="eyebrow">BEHIND THE GLOW</p>
                  <h2>
                    Open source.
                    <br />
                    Open curiosity.
                  </h2>
                  <p className="detail-copy">
                    Take a look around the repositories behind my projects.
                    You’ll find the code, the experiments, and the things I’m
                    figuring out along the way.
                  </p>
                  <div className="sub-globs compact-globs">
                    <LavaAction href={portfolio.github}>
                      <FiGithub />
                      <strong>DeathsSong</strong>
                      <span>
                        Find me on GitHub <FiArrowUpRight />
                      </span>
                    </LavaAction>
                  </div>
                </>
              )}
            </div>
          </>
        )}
        <div
          className={`stage-caption ${active ? "caption-hidden" : ""}`}
          aria-hidden={!!active}
        >
          <span className="tiny-orbit" /> NOTHING HERE STAYS STILL. NEITHER DO
          IDEAS.
        </div>
        <span className="tank-mark" aria-hidden="true">
          ML / NO. 001
        </span>
      </main>
      <footer className="world-footer">
        <span className="footer-instruction">
          {active
            ? "FOLLOW YOUR CURIOSITY.  ·  ESC TO GO BACK"
            : "DRIFT. CLICK. DISCOVER."}
        </span>
        <div className="lamp-controls">
          <div
            className="palette-controls"
            role="group"
            aria-label="Lamp color palette"
          >
            {(["electric", "sunset", "cosmic"] as const).map((color) => (
              <button
                key={color}
                aria-label={`${color} palette`}
                aria-pressed={mood === color}
                className={`palette-dot palette-${color}`}
                onClick={() => setMood(color)}
              >
                <span />
                {mood === color && <i>✓</i>}
              </button>
            ))}
          </div>
          <button
            className="motion-control"
            aria-pressed={motion}
            onClick={() => setMotion(!motion)}
          >
            {motion ? <FiPause /> : <FiPlay />}
            <span>Motion {motion ? "on" : "off"}</span>
          </button>
        </div>
        <span className="footer-copyright">
          © {new Date().getFullYear()} MICHELLE LOUDENCLOS
        </span>
      </footer>
    </div>
  );
}
export default App;
