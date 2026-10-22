import { useEffect, useRef, useState } from "react";
import CareerTimeline from "./CareerTimeline";
import styles from "./Contact.module.css";

const EMAIL = "kenjiermita2020@gmail.com";

const SOCIALS = [
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "/in/kenji-ermita-1375b1392",
    href: "https://www.linkedin.com/in/kenji-ermita-1375b1392/",
  },
  {
    id: "github",
    name: "GitHub",
    handle: "/kenjaxx",
    href: "https://github.com/kenjaxx",
  },
];

// The headline reads "Reach out, let's {word}". The first word is repeated
// at the end of the list so the loop restarts without a visible jump.
// If you add or remove words, update the keyframes named "rotate"
// in Contact.module.css to match.
const ROTATING_WORDS = ["talk", "build", "collab"];

// Share of the label + heading block that must be visible before the
// "Let's connect" line draws itself.
const REVEAL_RATIO = 0.6;

// How long the button says "Copied" before it goes back to "Copy email".
const COPIED_MS = 2000;

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const MailIcon = () => (
  <svg {...svgProps}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const CopyIcon = () => (
  <svg {...svgProps} width={17} height={17}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = () => (
  <svg {...svgProps} width={17} height={17}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg {...svgProps} width={17} height={17}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const LinkedinIcon = () => (
  <svg {...svgProps}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = () => (
  <svg {...svgProps}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg {...svgProps} width={18} height={18}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

const SOCIAL_ICONS = {
  linkedin: LinkedinIcon,
  github: GithubIcon,
};

// Fallback for browsers or contexts where the Clipboard API is unavailable
// (for example pages served over plain http).
function legacyCopy(text) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "-1000px";
  document.body.appendChild(field);
  field.select();

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  document.body.removeChild(field);
  return ok;
}

export default function Contact() {
  const headerRef = useRef(null);
  const emailRef = useRef(null);
  const copyTimer = useRef(null);
  const [visible, setVisible] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle"); // idle | copied | failed

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    // Plays when the label scrolls into view and resets when it leaves,
    // so the line draws again on every visit to the section.
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

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const selectEmailText = () => {
    const node = emailRef.current;
    if (!node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleCopy = async () => {
    let ok = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(EMAIL);
        ok = true;
      }
    } catch {
      ok = false;
    }

    if (!ok) ok = legacyCopy(EMAIL);

    clearTimeout(copyTimer.current);

    if (ok) {
      setCopyStatus("copied");
    } else {
      // Copying was blocked: select the text so the visitor can press Ctrl+C.
      selectEmailText();
      setCopyStatus("failed");
    }

    copyTimer.current = setTimeout(() => setCopyStatus("idle"), COPIED_MS);
  };

  const copied = copyStatus === "copied";

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.card}>
        <div className={styles.header} ref={headerRef} data-visible={visible}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowText}>Let's connect</span>
            <span className={styles.eyebrowLine} aria-hidden="true">
              <span className={styles.eyebrowFill} />
              <span className={styles.eyebrowHead} />
            </span>
          </div>
          <h2 className={styles.heading}>Contact me</h2>
        </div>

        <div className={styles.grid}>
          <div className={styles.info}>
            <h3
              className={styles.subheading}
              aria-label={`Reach out, let's ${ROTATING_WORDS[0]}`}
            >
              <span aria-hidden="true">Reach out, let's </span>
              <span className={styles.rotator} aria-hidden="true">
                <span className={styles.rotatorList}>
                  {[...ROTATING_WORDS, ROTATING_WORDS[0]].map((word, i) => (
                    <span key={`${word}-${i}`} className={styles.word}>
                      {word}
                    </span>
                  ))}
                </span>
              </span>
            </h3>

            <p className={styles.desc}>
              <span className={styles.neon} aria-hidden="true">
                OPEN
              </span>
              <span>I'm open to job opportunities.</span>
            </p>

            <p className={styles.microLabel}>Email me at</p>
            <div className={styles.emailRow}>
              <MailIcon />
              <span ref={emailRef} className={styles.emailText}>
                {EMAIL}
              </span>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
                onClick={handleCopy}
              >
                <span className={styles.labelIdle}>
                  <CopyIcon />
                  {copyStatus === "failed" ? "Press Ctrl+C" : "Copy email"}
                </span>
                <span className={styles.labelDone} aria-hidden="true">
                  <CheckIcon />
                  Copied
                </span>
              </button>
              <a className={styles.mailBtn} href={`mailto:${EMAIL}`}>
                <ExternalLinkIcon />
                Open mail app
              </a>
            </div>
            <span className={styles.srOnly} role="status" aria-live="polite">
              {copied ? "Email copied to clipboard" : ""}
            </span>

            <p className={styles.microLabel}>Or find me online</p>
            <div className={styles.tiles}>
              {SOCIALS.map(({ id, name, handle, href }) => {
                const Icon = SOCIAL_ICONS[id];
                return (
                  <a
                    key={id}
                    className={styles.tile}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className={styles.tileIcon}>
                      <Icon />
                    </span>
                    <span className={styles.tileText}>
                      <span className={styles.tileName}>{name}</span>
                      <span className={styles.tileHandle}>{handle}</span>
                    </span>
                    <span className={styles.tileArrow}>
                      <ArrowUpRightIcon />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          <CareerTimeline />
        </div>
      </div>
    </section>
  );
}