import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { FiFileText, FiGithub, FiLinkedin, FiMail, FiPause, FiPlay } from "react-icons/fi";
import { portfolio, projects } from "./content";
import { lavaOutline } from "./lava-shape";
import certificate from "./assets/general-assembly-certificate.png";
import "./App.css";
import "./viewport.css";

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
type InkPoint = { x: number; y: number };
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
const bubbleSlots = Array.from({ length: 24 }, (_, i) => i);
const bubbleReleaseProgress = 0.3;
type LavaBubble = {
  born: number;
  life: number;
  angle: number;
  radius: number;
  speed: number;
  wobble: number;
  pace: number;
};
// A soft, filled arrow with rounded lobes that matches the lava controls.
function BubblyArrow({
  direction = "up-right",
}: {
  direction?: "up-right" | "left";
}) {
  return (
    <svg
      className={`bubbly-arrow${direction === "left" ? " arrow-back" : ""}`}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M7.1 27.2C4.1 27.2 2.6 23.8 4.8 21.5L16.4 9.8L10.2 10.1C5.8 10.3 5.5 3.7 9.9 3.5L23.2 2.9C27 2.7 29.2 5 29 8.7L28.4 22C28.2 26.4 21.6 26.2 21.8 21.7L22.1 15.6L10.5 26.2C9.5 27.1 8.3 27.6 7.1 27.2Z"
      />
    </svg>
  );
}

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
  ink: RefObject<InkPoint[]>,
) {
  const activeRef = useRef(active);
  const requestDraw = useRef(() => {});
  useLayoutEffect(() => {
    activeRef.current = active;
    requestDraw.current();
  }, [active]);
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
      height = host.clientHeight;
    let frame = 0,
      last = 0,
      layoutChanged = true;
    let introRight = 0,
      introBottom = 0;
    let previousActive = activeRef.current;
    let expansion: {
      start: number;
      x: number;
      y: number;
      rx: number;
      ry: number;
      released: boolean;
    } | null = null;
    const bubbles: (LavaBubble | null)[] = bubbleSlots.map(() => null);
    const bubbleShapes = bubbleSlots.map((i) =>
      host.querySelector<SVGEllipseElement>(`#release-${i}`),
    );
    let nextBubble =
      previousActive && motion ? performance.now() + 5000 : Infinity;
    // Start just inside the diagonal edges, where there is room for wax to
    // stretch into a neck, separate, and float away even on narrow screens.
    const emitBubbles = (now: number, count: number, pace = 1) => {
      const scale = Math.max(0.62, Math.min(width / 900, height / 600, 1.15));
      const angles = [-2.5, -2.15, -1, -0.65, 0.65, 1, 2.15, 2.5];
      const settled = pace < 1;
      const idleArc = settled ? Math.floor(Math.random() * angles.length) : 0;
      for (let i = 0; i < count; i++) {
        const slot = bubbles.findIndex((bubble) => !bubble);
        if (slot < 0) break;
        const radiusRange = settled
          ? i % 2 === 0 ? [18, 12] : [32, 20]
          : [20, 13];
        bubbles[slot] = {
          born: now + (settled ? i * 180 : count > 1 ? i * 22 : 0),
          life: (2300 + Math.random() * 1100) / pace,
          angle:
            angles[
              settled
                ? (idleArc + i * 3) % angles.length
                : count > 1
                ? i % angles.length
                : Math.floor(Math.random() * angles.length)
            ] + (Math.random() - 0.5) * 0.18,
          radius: (radiusRange[0] + Math.random() * radiusRange[1]) * scale,
          speed: (39 + Math.random() * 23) * scale,
          wobble: Math.random() * Math.PI * 2,
          pace,
        };
      }
    };
    const measure = () => {
      width = host.clientWidth;
      height = host.clientHeight;
      const intro = host.querySelector<HTMLElement>(".stage-intro");
      introRight = intro ? intro.offsetLeft + intro.offsetWidth + 12 : 0;
      introBottom = intro ? intro.offsetTop + intro.offsetHeight + 12 : 0;
      layoutChanged = true;
      if (!motion) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    const tick = (now: number) => {
      const active = activeRef.current;
      const dt = Math.min(now - (last || now - 16), 40);
      last = now;
      if (active !== previousActive) {
        const selected =
          positions.current[roots.findIndex((root) => root.id === active)];
        expansion =
          selected && motion
            ? {
                start: now,
                x: selected.x,
                y: selected.y,
                rx: selected.rx,
                ry: selected.ry,
                released: false,
              }
            : null;
        bubbles.fill(null);
        nextBubble = Infinity;
        previousActive = active;
      }
      const progress = expansion
        ? Math.min(1, (now - expansion.start) / 1000)
        : 1;
      host.dataset.lavaPhase = !active
        ? "flowing"
        : progress < bubbleReleaseProgress
          ? "growing"
          : progress < 1
            ? "releasing"
            : "settled";
      const mobile = width < 600;
      const compact = height < 500;
      const landscape = width >= 600 && height < 440;
      const radius = Math.max(
        compact && mobile ? 42 : 55,
        Math.min(width * 0.105, height * 0.145, 105),
      );
      const shortPortrait = [
        { x: 0.27, y: 0.56 },
        { x: 0.73, y: 0.52 },
        { x: 0.73, y: 0.79 },
        { x: 0.27, y: 0.82 },
      ];
      const shortLandscape = [
        { x: 0.36, y: 0.58 },
        { x: 0.56, y: 0.48 },
        { x: 0.76, y: 0.63 },
        { x: 0.91, y: 0.38 },
      ];
      roots.forEach((root, i) => {
        const p = positions.current[i];
        const home = landscape
          ? shortLandscape[i]
          : compact && mobile
            ? shortPortrait[i]
            : root;
        if (layoutChanged || !motion) {
          p.tx = home.x;
          p.ty = home.y;
          p.next = now + 2000 + Math.random() * 3500;
        } else if (!active && now > p.next) {
          const rangeX = landscape
            ? 0.07
            : compact
              ? 0.12
              : mobile
                ? 0.22
                : 0.36;
          p.tx = home.x + (Math.random() - 0.5) * rangeX;
          p.ty = home.y + (Math.random() - 0.5) * (compact ? 0.12 : 0.28);
          p.next = now + 4500 + Math.random() * 7500;
        }
        const marginX = (radius * 1.15 + 12) / width;
        const marginY = (radius * 1.15 + 12) / height;
        if (!active) {
          p.tx = Math.max(marginX, Math.min(1 - marginX, p.tx));
          p.ty = Math.max(marginY, Math.min(1 - marginY, p.ty));
          if (p.tx * width - radius < introRight)
            p.ty = Math.min(
              1 - marginY,
              Math.max(p.ty, (introBottom + radius) / height),
            );
          positions.current.forEach((other, j) => {
            if (i === j || !motion) return;
            const dx = (p.x - other.x) * width,
              dy = (p.y - other.y) * height;
            const distance = Math.hypot(dx, dy),
              gap = radius * 1.6;
            if (distance > 0 && distance < gap) {
              p.x += ((dx / distance) * (gap - distance) * 0.012) / width;
              p.y += ((dy / distance) * (gap - distance) * 0.012) / height;
            }
          });
        }
        const isActive = active === root.id;
        const gx = isActive ? 0.5 : p.tx;
        const gy = isActive ? 0.54 : p.ty;
        const follow =
          motion && !layoutChanged
            ? 1 - Math.exp(-dt / (active ? 185 : 2200))
            : 1;
        const opening = isActive && progress < 1 ? expansion : null;
        const eased = 1 - Math.pow(1 - progress, 3);
        if (opening) {
          p.x = opening.x + (gx - opening.x) * eased;
          p.y = opening.y + (gy - opening.y) * eased;
        } else {
          p.x += (gx - p.x) * follow;
          p.y += (gy - p.y) * follow;
        }
        if (!active) {
          p.x = Math.max(marginX, Math.min(1 - marginX, p.x));
          p.y = Math.max(marginY, Math.min(1 - marginY, p.y));
        }
        const t = motion ? now * 0.00055 + root.phase : root.phase;
        const hover = hovered.current === root.id && !active ? 1.1 : 1;
        let goalRx = isActive
          ? Math.min(width * (mobile ? 0.495 : 0.44), 500) *
            (1 + Math.sin(t) * 0.015)
          : active
            ? 6
            : radius * hover * (i === 3 ? 0.79 : 1) * (1 + Math.sin(t) * 0.12);
        let goalRy = isActive
          ? height * 0.45 * (1 + Math.cos(t) * 0.015)
          : active
            ? 7
            : radius *
              hover *
              (i === 3 ? 0.8 : 1) *
              (1 + Math.cos(t * 1.2) * 0.14);
        if (isActive) {
          // Protect every text line with a small margin, even in short views.
          const safeScale = ink.current.reduce(
            (safe, point) =>
              Math.max(
                safe,
                Math.hypot(
                  (Math.abs(point.x - gx) * width + 6) / goalRx,
                  (Math.abs(point.y - gy) * height + 6) / goalRy,
                ),
              ),
            1,
          );
          goalRx *= safeScale;
          goalRy *= safeScale;
        }
        const grow = motion && !layoutChanged ? 1 - Math.exp(-dt / 185) : 1;
        const labelRx = mobile ? (i === 3 ? 42 : compact ? 48 : 56) : 0;
        const labelRy = mobile ? (i === 3 ? 40 : compact ? 46 : 52) : 0;
        if (opening) {
          const swell =
            progress > 0.6
              ? Math.sin(((progress - 0.6) / 0.4) * Math.PI)
              : 0;
          p.rx =
            (opening.rx + (goalRx - opening.rx) * eased) * (1 + swell * 0.035);
          p.ry =
            (opening.ry + (goalRy - opening.ry) * eased) * (1 - swell * 0.018);
        } else {
          p.rx += ((active ? goalRx : Math.max(goalRx, labelRx)) - p.rx) * grow;
          p.ry += ((active ? goalRy : Math.max(goalRy, labelRy)) - p.ry) * grow;
        }
        if (isActive && (!opening || progress >= 0.65)) {
          const cover = ink.current.reduce(
            (safe, point) =>
              Math.max(
                safe,
                Math.hypot(
                  (Math.abs(point.x - p.x) * width + 4) / p.rx,
                  (Math.abs(point.y - p.y) * height + 4) / p.ry,
                ),
              ),
            1,
          );
          p.rx *= cover;
          p.ry *= cover;
        }
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
      if (
        active &&
        motion &&
        expansion &&
        !expansion.released &&
        progress >= bubbleReleaseProgress
      ) {
        emitBubbles(now, 16);
        expansion.released = true;
        nextBubble = now + 6200;
      } else if (active && motion && now >= nextBubble) {
        emitBubbles(now, 2, 0.3);
        nextBubble = now + 5000 + Math.random() * 3000;
      }
      const selected =
        positions.current[roots.findIndex((root) => root.id === active)];
      const edge = host.querySelector("#expanded-edge");
      edge?.setAttribute(
        "d",
        selected
          ? lavaOutline(
              selected.x * width,
              selected.y * height,
              selected.rx,
              selected.ry,
              motion ? now * 0.001 : 0,
              Math.min(1, progress * 1.5),
            )
          : "",
      );
      host.querySelectorAll(".action-ripple").forEach((shape, i) => {
        const coreScale = Number(shape.getAttribute("data-core-scale")) || 1;
        shape.setAttribute(
          "d",
          lavaOutline(
            100,
            80,
            94 * coreScale,
            72 * coreScale,
            (motion ? now * 0.001 : 0) + i * 2.1,
            1.8,
          ),
        );
      });
      bubbleShapes.forEach((shape, i) => {
        const bubble = bubbles[i];
        const age = bubble ? now - bubble.born : -1;
        if (!shape) return;
        if (!selected || !motion || !bubble || age < 0 || age >= bubble.life) {
          shape.setAttribute("rx", "0");
          shape.setAttribute("ry", "0");
          if (bubble && age >= bubble.life) bubbles[i] = null;
          return;
        }
        const seconds = (age / 1000) * bubble.pace;
        const life = age / bubble.life;
        const tail = Math.min(1, (1 - life) / 0.32);
        const radius =
          bubble.radius *
          (0.8 + Math.sin(Math.min(1, life * 4) * Math.PI) * 0.2) *
          tail;
        // Burst particles retain their opening push. Settled particles follow
        // the same fluid path at a slower pace, including their separation.
        const outward =
          seconds * bubble.speed +
          (1 - Math.exp(-seconds * 5)) * bubble.radius * 3.5;
        const dx = Math.cos(bubble.angle), dy = Math.sin(bubble.angle);
        shape.setAttribute(
          "cx",
          String(
            selected.x * width +
              dx * (selected.rx * 0.94 + outward) +
              Math.sin(seconds * 2 + bubble.wobble) * seconds * 6,
          ),
        );
        shape.setAttribute(
          "cy",
          String(
            selected.y * height +
              dy * (selected.ry * 0.94 + outward) -
              seconds * seconds * 8,
          ),
        );
        shape.setAttribute(
          "rx",
          String(radius * (1 + Math.sin(seconds * 3 + bubble.wobble) * 0.14)),
        );
        shape.setAttribute(
          "ry",
          String(radius * (1.1 + Math.cos(seconds * 2 + bubble.wobble) * 0.18)),
        );
      });
      host.dataset.lavaBubbles = String(
        bubbles.filter((bubble) => bubble && now >= bubble.born).length,
      );
      layoutChanged = false;
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
    requestDraw.current = () => {
      if (!motion) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      }
    };
    measure();
    if (motion) frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      requestDraw.current = () => {};
    };
  }, [stage, motion, hovered, ink]);
  return requestDraw;
}

function usePanelFit(
  panel: RefObject<HTMLDivElement | null>,
  view: View,
  stage: RefObject<HTMLDivElement | null>,
  ink: RefObject<InkPoint[]>,
  redraw: RefObject<() => void>,
) {
  useLayoutEffect(() => {
    const frame = panel.current;
    const content = frame?.querySelector<HTMLElement>(".panel-content");
    if (!frame || !content) {
      ink.current = [];
      return;
    }
    let disposed = false;
    const fit = () => {
      if (disposed || !frame.clientWidth || !frame.clientHeight) return;
      content.style.width = `${frame.clientWidth}px`;
      content.style.zoom = "1";
      const scale = Math.min(
        1,
        (frame.clientHeight - 4) / Math.max(1, content.offsetHeight),
      );
      content.style.zoom = String(scale);
      frame.dataset.fit = scale.toFixed(3);
      for (const button of content.querySelectorAll(".lava-action")) {
        const bounds = button.getBoundingClientRect();
        let coreScale = 1;
        for (const label of button.querySelectorAll(
          ".action-label strong, .action-label > span, .action-label > svg",
        )) {
          const rect = label.getBoundingClientRect();
          for (const x of [rect.left, rect.right]) {
            for (const y of [rect.top, rect.bottom]) {
              coreScale = Math.max(
                coreScale,
                Math.hypot(
                  (Math.abs(x - bounds.left - bounds.width / 2) + 3) / (bounds.width * 0.47),
                  (Math.abs(y - bounds.top - bounds.height / 2) + 3) / (bounds.height * 0.45),
                ),
              );
            }
          }
        }
        const core = button.querySelector(".action-wax ellipse");
        core?.setAttribute("rx", String(94 * coreScale));
        core?.setAttribute("ry", String(72 * coreScale));
        button.querySelector(".action-ripple")?.setAttribute("data-core-scale", String(coreScale));
      }
      const host = stage.current;
      if (!host) return;
      // Read the actual text lines, undoing only the entrance transform. Their
      // resting positions define the inner wax that must never move away.
      const bounds = content.getBoundingClientRect();
      const frameBounds = frame.getBoundingClientRect();
      const stageBounds = host.getBoundingClientRect();
      const quietWidth = content.offsetWidth * scale;
      const quietHeight = content.offsetHeight * scale;
      const transformScale = bounds.width / quietWidth || 1;
      const left = frameBounds.left + (frameBounds.width - quietWidth) / 2;
      const top = frameBounds.top + (frameBounds.height - quietHeight) / 2;
      const points: InkPoint[] = [];
      const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent?.trim() || node.parentElement?.closest("svg"))
          continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          for (const x of [rect.left, rect.right]) {
            for (const y of [rect.top, rect.bottom]) {
              points.push({
                x:
                  (left + (x - bounds.left) / transformScale - stageBounds.left - host.clientLeft) /
                  host.clientWidth,
                y:
                  (top + (y - bounds.top) / transformScale - stageBounds.top - host.clientTop) /
                  host.clientHeight,
              });
            }
          }
        }
      }
      ink.current = points;
      frame.dataset.inkPoints = String(points.length);
      redraw.current();
    };
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    observer.observe(content);
    fit();
    document.fonts.ready.then(fit);
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [panel, view, stage, ink, redraw]);
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
      <svg
        className="action-wax"
        viewBox="0 0 200 160"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <g fill="url(#action-molten)">
          <ellipse cx="100" cy="80" rx="94" ry="72" />
          <path
            className="action-ripple"
            d={lavaOutline(100, 80, 94, 72, 0, 1.8)}
          />
        </g>
      </svg>
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
  const ink = useRef<InkPoint[]>([]);
  const active = rootFor(view);
  const redrawLava = useLava(stage, active, motion, hovered, ink);
  usePanelFit(panel, view, stage, ink, redrawLava);
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
            <radialGradient id="action-molten" cx=".35" cy=".25" r=".9">
              <stop offset="0" stopColor="var(--wax)" />
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
            <path id="expanded-edge" d="" />
            {bubbleSlots.map((i) => (
              <ellipse
                id={`release-${i}`}
                key={`release-${i}`}
                className="release-wax"
                cx="0"
                cy="0"
                rx="0"
                ry="0"
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
              <BubblyArrow />
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
              <BubblyArrow direction="left" />{" "}
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
              <div className="panel-content">
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
                          One more bite. <BubblyArrow />
                        </span>
                      </LavaAction>
                      <LavaAction onClick={() => setView("trivia")}>
                        <span className="sub-index">02 / WEB APP</span>
                        <strong>Trivia Trove</strong>
                        <span>
                          Stay curious. <BubblyArrow />
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
                        <BubblyArrow />
                        <strong>
                          {view === "anaconda"
                            ? "Play the game"
                            : "Try the app"}
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
                          A little about me <BubblyArrow />
                        </span>
                      </LavaAction>
                      <LavaAction onClick={() => setView("skills")}>
                        <strong>My toolkit</strong>
                        <span>
                          What I build with <BubblyArrow />
                        </span>
                      </LavaAction>
                      <LavaAction onClick={() => setView("education")}>
                        <strong>Education</strong>
                        <span>
                          Where it started <BubblyArrow />
                        </span>
                      </LavaAction>
                      <LavaAction href={portfolio.resume}>
                        <strong>Résumé</strong>
                        <span>
                          View the PDF <BubblyArrow />
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
                      Reno, Nevada. I like the space where logic meets
                      creativity: taking an idea, figuring out how it works, and
                      giving it a little character along the way.
                    </p>
                    <p className="detail-copy secondary-copy">
                      My General Assembly training turned that curiosity into
                      hands-on experience building for the web. Now I’m putting
                      it into motion, one project at a time.
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
                        Open the certificate <BubblyArrow />
                      </span>
                    </a>
                  </>
                )}
                {view === "contact" && (
                  <>
                    <p className="eyebrow">
                      03 / GOOD THINGS START WITH A HELLO
                    </p>
                    <h2>
                      Let’s make
                      <br />
                      something flow.
                    </h2>
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
                      {portfolio.resume && (
                        <LavaAction href={portfolio.resume}>
                          <FiFileText />
                          <strong>Résumé</strong>
                        </LavaAction>
                      )}
                    </div>
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
                          Find me on GitHub <BubblyArrow />
                        </span>
                      </LavaAction>
                    </div>
                  </>
                )}
              </div>
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
