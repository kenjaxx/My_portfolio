import { useEffect, useRef, useState } from "react";
import styles from "./CareerTimeline.module.css";

const svgProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const BriefcaseIcon = () => (
  <svg {...svgProps}>
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </svg>
);

const GraduationIcon = () => (
  <svg {...svgProps}>
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </svg>
);

const CodeIcon = () => (
  <svg {...svgProps}>
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </svg>
);

const SparklesIcon = () => (
  <svg {...svgProps}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
);

// Listed top to bottom, exactly as they appear on screen.
// The newest entry is at the top; the animation still builds from the bottom up.
const ENTRIES = [
  {
    id: "now",
    Icon: SparklesIcon,
    label: "Now",
    title: "Open to job opportunities",
    
    current: true,
  },
  {
    id: "projects",
    Icon: CodeIcon,
    label: "Projects",
    title: "Tons of live apps",
    text: "Billify, Rehearse, Closet, House Selling Site, and more.",
  },
  {
    id: "education",
    Icon: GraduationIcon,
    label: "Education",
    title: "Graduate, Bachelor's degree",
    text: "BS Information Technology, Cebu Institute of Technology, University.",
  },
  {
    id: "internship",
    Icon: BriefcaseIcon,
    label: "2026",
    title: "Internship (OJT)",
    text: "IT Intern at Knowles Training Institute, remote, Singapore.",
  },
];

// Share of the panel that must be on screen before the animation starts.
const REVEAL_RATIO = 0.25;

export default function CareerTimeline() {
  const panelRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    // Plays when the panel scrolls into view and resets when it leaves,
    // so the animation runs again on every visit to the section.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= REVEAL_RATIO) {
          setVisible(true);
        } else if (!entry.isIntersecting) {
          setVisible(false);
        }
      },
      { threshold: [0, REVEAL_RATIO] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.panel} ref={panelRef} data-visible={visible}>
      <h3 className={styles.title}>Career timeline</h3>
      <p className={styles.subtitle}>Where I am and how I got here.</p>

      <ol className={styles.list}>
        {ENTRIES.map(({ id, Icon, label, title, text, current }, i) => (
          <li
            key={id}
            className={`${styles.item} ${current ? styles.current : ""}`}
            // --j is the reveal order: 0 is the bottom entry and animates first.
            style={{ "--j": ENTRIES.length - 1 - i }}
          >
            <span className={styles.node}>
              <Icon />
            </span>
            <div className={styles.card}>
              <span className={styles.label}>{label}</span>
              <h4 className={styles.cardTitle}>{title}</h4>
              <p className={styles.cardText}>{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}