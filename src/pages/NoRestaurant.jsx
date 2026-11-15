import styles from './NoRestaurant.module.css'

/**
 * Landing page for a URL with no restaurant in it (the site root).
 *
 * Deliberately not a directory of restaurants: every tenant is reached by its
 * own link, and guests arrive by scanning the QR code on their table. So this
 * page only explains how to get started — scan the code.
 */

const STEPS = [
  {
    title: 'Scan the code',
    text: 'Point your phone camera at the QR code on your table.',
    icon: (
      <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M8 12h8" />
    ),
  },
  {
    title: 'Browse the menu',
    text: 'See today’s dishes and tell us about any allergies.',
    icon: (
      <path d="M6 4h9l3 3v13H6zM9 10h6M9 14h6M9 18h3" />
    ),
  },
  {
    title: 'Order & relax',
    text: 'Your order goes straight to the kitchen. Track it live.',
    icon: (
      <path d="M4 15h16M6 15a6 6 0 0 1 12 0M12 7V5M3 19h18" />
    ),
  },
]

/* A deterministic, decorative QR-like grid. It is not a scannable code. */
const GRID = 21
function isFinder(r, c) {
  const inBox = (r0, c0) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7
  return inBox(0, 0) || inBox(0, GRID - 7) || inBox(GRID - 7, 0)
}
function moduleOn(r, c) {
  // Quiet ring around each finder pattern
  const nearFinder =
    (r < 8 && c < 8) || (r < 8 && c >= GRID - 8) || (r >= GRID - 8 && c < 8)
  if (nearFinder) return false
  const h = (r * 73 + c * 151 + r * c * 17) % 11
  return h < 5
}

function Finder({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0.5" y="0.5" width="6" height="6" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="2" y="2" width="3" height="3" rx="0.7" fill="currentColor" />
    </g>
  )
}

function QrArt() {
  const cells = []
  for (let r = 0; r < GRID; r += 1) {
    for (let c = 0; c < GRID; c += 1) {
      if (!isFinder(r, c) && moduleOn(r, c)) {
        cells.push(<rect key={`${r}-${c}`} x={c + 0.12} y={r + 0.12} width="0.76" height="0.76" rx="0.22" />)
      }
    }
  }
  return (
    <svg viewBox={`0 0 ${GRID} ${GRID}`} className={styles.qrSvg} aria-hidden="true">
      <g fill="currentColor">{cells}</g>
      <Finder x={0} y={0} />
      <Finder x={GRID - 7} y={0} />
      <Finder x={0} y={GRID - 7} />
    </svg>
  )
}

export default function NoRestaurant() {
  return (
    <main className={styles.root}>
      <div className={styles.glowA} aria-hidden="true" />
      <div className={styles.glowB} aria-hidden="true" />

      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>
            <span className={styles.dot} aria-hidden="true" />
            Order from your table
          </p>

          <h1 className={styles.title}>
            Scan. Order.
            <br />
            <span className={styles.titleAccent}>Enjoy.</span>
          </h1>

          <p className={styles.lead}>
            Find the QR code on your table and scan it with your phone camera. The menu for your
            table opens right away. No app and no sign-up.
          </p>

          <ol className={styles.steps}>
            {STEPS.map((step, i) => (
              <li key={step.title} className={styles.step} style={{ '--i': i }}>
                <span className={styles.stepIcon}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">{step.icon}</svg>
                </span>
                <span>
                  <span className={styles.stepTitle}>
                    <span className={styles.stepNo}>{i + 1}</span>
                    {step.title}
                  </span>
                  <span className={styles.stepText}>{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.visual} aria-label="Scan the QR code on your table">
          <div className={styles.card}>
            <div className={styles.frame}>
              <span className={`${styles.corner} ${styles.tl}`} />
              <span className={`${styles.corner} ${styles.tr}`} />
              <span className={`${styles.corner} ${styles.bl}`} />
              <span className={`${styles.corner} ${styles.br}`} />
              <div className={styles.qr}>
                <QrArt />
              </div>
              <span className={styles.scanLine} aria-hidden="true" />
            </div>
            <p className={styles.cardLabel}>Look for this on your table</p>
            <p className={styles.cardHint}>Usually on a table stand or card</p>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        Can’t find a code? Ask a member of staff and they’ll help you get started.
      </footer>
    </main>
  )
}
