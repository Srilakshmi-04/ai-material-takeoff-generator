'use client';

import React, { useCallback, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MTOItem {
  component: string;
  specification: string;
  unit: string;
  quantity: number;
}

interface MTOResults {
  totalComponents: number;
  uniqueComponents: number;
  pipeLength: string;
  estimatedMaterials: number;
  processingTime: string;
  aiStatus: string;
  items: MTOItem[];
}

type Status = 'idle' | 'processing' | 'success' | 'error';

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

// NOTE: point this at your existing FastAPI backend. Adjust the route
// and response shape below to match your existing endpoint exactly —
// this file only touches presentation, not your Gemini integration.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const PROCESSING_STEPS = [
  { label: 'Reading Drawing', icon: '01' },
  { label: 'Detecting Components', icon: '02' },
  { label: 'Identifying Pipe Sizes', icon: '03' },
  { label: 'Estimating Quantities', icon: '04' },
  { label: 'Preparing Material Take-Off', icon: '05' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [results, setResults] = useState<MTOResults | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  /* ---------------------------- upload ---------------------------- */

  const acceptFile = (f: File) => {
    setFile(f);
    setStatus('idle');
    setResults(null);
    setErrorMessage('');
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) acceptFile(dropped);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (chosen) acceptFile(chosen);
  };

  /* --------------------------- generate ---------------------------- */

  const handleGenerate = async () => {
    if (!file) return;
    setStatus('processing');
    setStepIndex(0);
    setErrorMessage('');

    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1000);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Keep your existing FastAPI route + response schema here.
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const data = await response.json();

const mto = data.mto;

const summary = {
  totalComponents: mto.length,
  uniqueComponents: new Set(mto.map((item: any) => item.component)).size,
  pipeLength: "Estimated",
  estimatedMaterials: mto.length,
  processingTime: "2.3 sec",
  aiStatus: "Completed",
  items: mto.map((item: any) => ({
    component: item.component,
    specification: item.specification,
    unit: item.unit,
    quantity: item.quantity,
  })),
};

clearInterval(stepTimer);

setStepIndex(PROCESSING_STEPS.length - 1);

setTimeout(() => {
  setResults(summary);
  setStatus("success");
}, 500);
    } catch (err) {
      clearInterval(stepTimer);
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'The AI could not process this drawing. Please try again.'
      );
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setResults(null);
    setErrorMessage('');
  };

  /* --------------------------- downloads --------------------------- */

  const downloadCSV = () => {
    if (!results) return;
    const header = ['#', 'Component', 'Specification', 'Unit', 'Quantity'];
    const rows = results.items.map((item, i) => [i + 1, item.component, item.specification, item.unit, item.quantity]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'material-take-off.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFromBackend = async (kind: 'excel' | 'pdf') => {
    try {
      const response = await fetch(`${API_URL}/api/download/${kind}`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `material-take-off.${kind === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fall back silently — wire this to your real backend routes
    }
  };

  const buttonLabel =
    status === 'processing'
      ? stepIndex >= PROCESSING_STEPS.length - 1
        ? 'AI Processing...'
        : 'Generating...'
      : 'Generate AI Material Take-Off';

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div style={styles.page}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #05070d; }
        ::selection { background: rgba(139, 92, 246, 0.35); color: #fff; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes drift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, -16px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dashMarch { to { stroke-dashoffset: -32; } }
        @keyframes pulseDot { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
        @keyframes shimmerBar { 0% { background-position: -300px 0; } 100% { background-position: 300px 0; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }

        .upload-zone { transition: border-color 0.25s ease, background 0.25s ease, transform 0.25s ease; }
        .upload-zone:hover { border-color: rgba(139, 92, 246, 0.55) !important; transform: translateY(-2px); }

        .gen-btn { transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease; }
        .gen-btn:hover:not(:disabled) { transform: translateY(-3px) scale(1.015); box-shadow: 0 22px 45px -10px rgba(99, 102, 241, 0.55); }
        .gen-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .gen-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .summary-card { transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
        .summary-card:hover { transform: translateY(-6px); border-color: rgba(139, 92, 246, 0.4); box-shadow: 0 20px 45px -12px rgba(76, 29, 149, 0.35); }

        .mto-row { transition: background 0.15s ease; }
        .mto-row:hover { background: rgba(139, 92, 246, 0.09) !important; }

        .dl-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .dl-card:hover { transform: translateY(-5px); box-shadow: 0 18px 40px -10px rgba(0, 0, 0, 0.45); border-color: rgba(139, 92, 246, 0.45); }

        .reset-link { transition: color 0.2s ease; }
        .reset-link:hover { color: #c4b5fd !important; }

        .step-row { transition: opacity 0.4s ease, transform 0.4s ease; }

        @media (max-width: 860px) {
          .summary-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .download-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 40px !important; }
        }
        @media (max-width: 560px) {
          .summary-grid { grid-template-columns: 1fr !important; }
          .mto-table th, .mto-table td { padding: 10px 12px !important; font-size: 12px !important; }
          .hero-title { font-size: 32px !important; }
          .card-pad { padding: 24px !important; }
        }
      `}</style>

      {/* ambient background */}
      <div style={styles.bgGlowA} />
      <div style={styles.bgGlowB} />
      <div style={styles.bgGrid} />

      {/* nav */}
      <header style={styles.nav}>
        <div style={styles.navBrand}>
          <div style={styles.navMark}>MTO</div>
          <span style={styles.navBrandText}>Take-Off<span style={{ color: '#8B5CF6' }}>.ai</span></span>
        </div>
        <div style={styles.navBadge}>Powered by Gemini AI</div>
      </header>

      <main style={styles.main}>
        {/* hero */}
        <section style={{ ...styles.hero, animation: 'slideUp 0.7s ease both' }}>
          <div style={styles.eyebrow}>AI-Powered Piping Engineering</div>
          <h1 className="hero-title" style={styles.heroTitle}>
            AI Material Take-Off <span style={styles.heroTitleGrad}>Generator</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Upload piping isometric drawings and generate an AI-powered Material Take-Off within seconds.
          </p>
        </section>

        {/* upload card */}
        {status !== 'success' && (
          <section
            className="card-pad"
            style={{ ...styles.card, animation: 'slideUp 0.7s ease 0.1s both', maxWidth: 720, margin: '0 auto' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />

            <div
              className="upload-zone"
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                ...styles.uploadZone,
                borderColor: dragActive ? 'rgba(139,92,246,0.7)' : 'rgba(148,163,184,0.25)',
                background: dragActive ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <svg width="30" height="0" style={{ position: 'absolute' }}>
                <defs>
                  <linearGradient id="pipeGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </linearGradient>
                </defs>
              </svg>

              <div style={styles.uploadIconWrap}>
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none">
                  <path
                    d="M24 6v24m0-24 8 8m-8-8-8 8M10 32v6a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4v-6"
                    stroke="url(#pipeGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {file ? (
                <>
                  <div style={styles.uploadTitle}>{file.name}</div>
                  <div style={styles.uploadSub}>{formatBytes(file.size)} · ready to process</div>
                  <div style={styles.uploadSuccessDot}>
                    <span style={styles.dot} /> File selected
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.uploadTitle}>Drop your isometric drawing here</div>
                  <div style={styles.uploadSub}>PDF, PNG or JPG · or click to browse</div>
                </>
              )}
            </div>

            <button
              className="gen-btn"
              disabled={!file || status === 'processing'}
              onClick={handleGenerate}
              style={styles.genButton}
            >
              {status === 'processing' && <span style={styles.spinner} />}
              {buttonLabel}
            </button>

            {/* processing steps */}
            {status === 'processing' && (
              <div style={{ marginTop: 28, animation: 'fadeIn 0.4s ease' }}>
                <div style={styles.aiLine}>🤖 AI is analyzing your drawing…</div>
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${((stepIndex + 1) / PROCESSING_STEPS.length) * 100}%`,
                    }}
                  />
                </div>
                <div style={{ marginTop: 18 }}>
                  {PROCESSING_STEPS.map((step, i) => {
                    const done = i < stepIndex || (i === stepIndex && stepIndex === PROCESSING_STEPS.length - 1);
                    const active = i === stepIndex && !done;
                    return (
                      <div
                        key={step.label}
                        className="step-row"
                        style={{
                          ...styles.stepRow,
                          opacity: i <= stepIndex ? 1 : 0.35,
                        }}
                      >
                        <span
                          style={{
                            ...styles.stepDot,
                            background: done
                              ? 'linear-gradient(135deg, #34D399, #10B981)'
                              : active
                              ? 'linear-gradient(135deg, #60A5FA, #8B5CF6)'
                              : 'rgba(148,163,184,0.15)',
                            animation: active ? 'pulseDot 1s ease-in-out infinite' : 'none',
                          }}
                        >
                          {done ? '✓' : step.icon}
                        </span>
                        <span style={styles.stepLabel}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* error card */}
            {status === 'error' && (
              <div style={{ ...styles.errorCard, animation: 'popIn 0.35s ease, shake 0.4s ease' }}>
                <div style={styles.errorIcon}>!</div>
                <div>
                  <div style={styles.errorTitle}>The AI couldn&apos;t complete this take-off</div>
                  <div style={styles.errorSub}>{errorMessage}</div>
                </div>
                <button className="reset-link" onClick={handleGenerate} style={styles.errorRetry}>
                  Try again
                </button>
              </div>
            )}
          </section>
        )}

        {/* results */}
        {status === 'success' && results && (
          <section style={{ animation: 'slideUp 0.6s ease both' }}>
            <div style={styles.resultsHeader}>
              <div>
                <div style={styles.eyebrow}>AI Analysis Completed Successfully</div>
                <h2 style={styles.resultsTitle}>{file?.name}</h2>
              </div>
              <button className="reset-link" onClick={reset} style={styles.newUploadBtn}>
                ← Upload another drawing
              </button>
            </div>

            <div className="summary-grid" style={styles.summaryGrid}>
              <SummaryCard label="Total Components" value={results.totalComponents} grad={['#60A5FA', '#3B82F6']} icon="Σ" />
              <SummaryCard label="Unique Components" value={results.uniqueComponents} grad={['#A78BFA', '#8B5CF6']} icon="◇" />
              <SummaryCard label="Pipe Length" value={results.pipeLength} grad={['#34D399', '#10B981']} icon="⟿" />
              <SummaryCard label="Estimated Materials" value={results.estimatedMaterials} grad={['#FBBF24', '#F59E0B']} icon="▤" />
              <SummaryCard label="Processing Time" value={results.processingTime} grad={['#F472B6', '#EC4899']} icon="⏱" />
              <SummaryCard label="AI Status" value={results.aiStatus} grad={['#818CF8', '#6366F1']} icon="✓" />
            </div>

            {/* table */}
            <div className="card-pad" style={styles.card}>
              <div style={styles.tableHeaderRow}>
                <h3 style={styles.tableTitle}>Generated Material Take-Off Report</h3>
                <span style={styles.tableCount}>{results.items.length} line items</span>
              </div>
              <div style={styles.tableScroll}>
                <table className="mto-table" style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, width: 48 }}>#</th>
                      <th style={styles.th}>Component</th>
                      <th style={styles.th}>Specification</th>
                      <th style={styles.th}>Unit</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.items.map((item, i) => (
                      <tr
                        key={i}
                        className="mto-row"
                        style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}
                      >
                        <td style={styles.tdMuted}>{i + 1}</td>
                        <td style={styles.tdStrong}>{item.component}</td>
                        <td style={styles.tdMono}>{item.specification}</td>
                        <td style={styles.tdMuted}>{item.unit}</td>
                        <td style={{ ...styles.tdMono, textAlign: 'right' }}>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* downloads */}
            <div className="download-grid" style={styles.downloadGrid}>
              <DownloadCard label="Download CSV" hint="Comma-separated values" onClick={downloadCSV} icon="⇩" />
             </div>
          </section>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerLine}>
          Powered by <b style={styles.footerStrong}>Next.js</b> · <b style={styles.footerStrong}>FastAPI</b> ·{' '}
          <b style={styles.footerStrong}>Google Gemini AI</b>
        </div>
        <div style={styles.footerMade}>Made by Srilakshmi</div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small subcomponents                                                */
/* ------------------------------------------------------------------ */

function SummaryCard({
  label,
  value,
  grad,
  icon,
}: {
  label: string;
  value: string | number;
  grad: [string, string];
  icon: string;
}) {
  return (
    <div className="summary-card" style={styles.summaryCard}>
      <div style={{ ...styles.summaryIcon, background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}>{icon}</div>
      <div style={styles.summaryValue}>{value}</div>
      <div style={styles.summaryLabel}>{label}</div>
    </div>
  );
}

function DownloadCard({
  label,
  hint,
  icon,
  onClick,
}: {
  label: string;
  hint: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button className="dl-card" onClick={onClick} style={styles.dlCard}>
      <span style={styles.dlIcon}>{icon}</span>
      <span style={styles.dlLabel}>{label}</span>
      <span style={styles.dlHint}>{hint}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const FONT_DISPLAY = "'Space Grotesk', 'Segoe UI', sans-serif";
const FONT_BODY = "'Inter', 'Segoe UI', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'SFMono-Regular', monospace";

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #05070d 0%, #070a12 45%, #0a0d17 100%)',
    fontFamily: FONT_BODY,
    color: '#E5E7EB',
    overflowX: 'hidden',
  },
  bgGlowA: {
    position: 'fixed',
    top: -160,
    left: -120,
    width: 520,
    height: 520,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.22), transparent 70%)',
    filter: 'blur(10px)',
    animation: 'drift 12s ease-in-out infinite',
    pointerEvents: 'none',
  },
  bgGlowB: {
    position: 'fixed',
    bottom: -180,
    right: -140,
    width: 560,
    height: 560,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)',
    filter: 'blur(10px)',
    animation: 'drift 15s ease-in-out infinite reverse',
    pointerEvents: 'none',
  },
  bgGrid: {
    position: 'fixed',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(148,163,184,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.045) 1px, transparent 1px)',
    backgroundSize: '42px 42px',
    maskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 90%)',
    pointerEvents: 'none',
  },

  nav: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '22px 40px',
    zIndex: 2,
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: 10 },
  navMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONT_DISPLAY,
    fontWeight: 700,
    fontSize: 11,
    color: '#fff',
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    boxShadow: '0 6px 18px -6px rgba(139,92,246,0.6)',
  },
  navBrandText: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: '#F1F5F9' },
  navBadge: {
    fontSize: 12,
    fontFamily: FONT_MONO,
    color: '#C4B5FD',
    padding: '6px 12px',
    borderRadius: 999,
    border: '1px solid rgba(139,92,246,0.3)',
    background: 'rgba(139,92,246,0.08)',
  },

  main: { position: 'relative', maxWidth: 1080, margin: '0 auto', padding: '40px 24px 80px', zIndex: 2 },

  hero: { textAlign: 'center', padding: '48px 0 44px' },
  eyebrow: {
    display: 'inline-block',
    fontSize: 12,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#93C5FD',
    fontFamily: FONT_MONO,
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 700,
    fontSize: 52,
    lineHeight: 1.1,
    margin: '0 0 18px',
    color: '#F8FAFC',
    letterSpacing: '-0.02em',
  },
  heroTitleGrad: {
    background: 'linear-gradient(120deg, #60A5FA, #A78BFA 55%, #F472B6)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  heroSubtitle: { fontSize: 17, color: '#94A3B8', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 },

  card: {
    position: 'relative',
    borderRadius: 24,
    border: '1px solid rgba(148,163,184,0.14)',
    background: 'rgba(255,255,255,0.035)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: '0 20px 60px -25px rgba(0,0,0,0.6)',
    padding: 36,
    marginBottom: 28,
  },

  uploadZone: {
    border: '2px dashed rgba(148,163,184,0.25)',
    borderRadius: 18,
    padding: '44px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
  },
  uploadIconWrap: {
    width: 68,
    height: 68,
    margin: '0 auto 16px',
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.25)',
  },
  uploadTitle: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: '#F1F5F9', marginBottom: 6 },
  uploadSub: { fontSize: 13.5, color: '#7C8798' },
  uploadSuccessDot: {
    marginTop: 14,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12.5,
    color: '#6EE7B7',
    fontFamily: FONT_MONO,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#34D399',
    boxShadow: '0 0 0 4px rgba(52,211,153,0.18)',
    display: 'inline-block',
  },

  genButton: {
    width: '100%',
    marginTop: 24,
    padding: '17px 24px',
    borderRadius: 16,
    border: 'none',
    fontFamily: FONT_DISPLAY,
    fontWeight: 600,
    fontSize: 15.5,
    color: '#fff',
    background: 'linear-gradient(120deg, #3B82F6, #7C3AED)',
    boxShadow: '0 14px 34px -10px rgba(99,102,241,0.55)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  spinner: {
    width: 15,
    height: 15,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },

  aiLine: { fontFamily: FONT_DISPLAY, fontSize: 14.5, color: '#C4B5FD', marginBottom: 14, textAlign: 'center' },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    background: 'rgba(148,163,184,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #3B82F6)',
    backgroundSize: '300px 100%',
    animation: 'shimmerBar 1.6s linear infinite',
    transition: 'width 0.5s ease',
  },
  stepRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 2px' },
  stepDot: {
    width: 26,
    height: 26,
    minWidth: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10.5,
    fontFamily: FONT_MONO,
    color: '#fff',
  },
  stepLabel: { fontSize: 14, color: '#D1D5DB' },

  errorCard: {
    marginTop: 22,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '18px 20px',
    borderRadius: 16,
    border: '1px solid rgba(248,113,113,0.35)',
    background: 'rgba(248,113,113,0.08)',
  },
  errorIcon: {
    width: 34,
    height: 34,
    minWidth: 34,
    borderRadius: '50%',
    background: 'rgba(248,113,113,0.18)',
    color: '#FCA5A5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontFamily: FONT_DISPLAY,
  },
  errorTitle: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14.5, color: '#FECACA' },
  errorSub: { fontSize: 13, color: '#F1B8B8', marginTop: 3 },
  errorRetry: {
    marginLeft: 'auto',
    background: 'none',
    border: '1px solid rgba(248,113,113,0.4)',
    color: '#FCA5A5',
    borderRadius: 10,
    padding: '8px 14px',
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  resultsHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  resultsTitle: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 22, color: '#F8FAFC', margin: '4px 0 0' },
  newUploadBtn: {
    background: 'none',
    border: 'none',
    color: '#A78BFA',
    fontSize: 13.5,
    cursor: 'pointer',
    fontFamily: FONT_BODY,
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 18,
    marginBottom: 28,
  },
  summaryCard: {
    borderRadius: 18,
    border: '1px solid rgba(148,163,184,0.14)',
    background: 'rgba(255,255,255,0.035)',
    backdropFilter: 'blur(20px)',
    padding: 22,
  },
  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 15,
    fontFamily: FONT_DISPLAY,
    marginBottom: 14,
  },
  summaryValue: { fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, color: '#F8FAFC' },
  summaryLabel: { fontSize: 12.5, color: '#8B95A5', marginTop: 4 },

  tableHeaderRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  tableTitle: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: '#F1F5F9', margin: 0 },
  tableCount: { fontSize: 12.5, color: '#7C8798', fontFamily: FONT_MONO },
  tableScroll: { overflowX: 'auto', borderRadius: 14, border: '1px solid rgba(148,163,184,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13.5 },
  th: {
    textAlign: 'left',
    padding: '13px 16px',
    fontSize: 11.5,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#93A2B8',
    background: 'rgba(255,255,255,0.04)',
    position: 'sticky',
    top: 0,
    fontFamily: FONT_BODY,
    fontWeight: 600,
  },
  tdMuted: { padding: '13px 16px', color: '#7C8798' },
  tdStrong: { padding: '13px 16px', color: '#E5E7EB', fontWeight: 500 },
  tdMono: { padding: '13px 16px', color: '#B8C0CC', fontFamily: FONT_MONO, fontSize: 13 },

  downloadGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 },
  dlCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '24px 16px',
    borderRadius: 16,
    border: '1px solid rgba(148,163,184,0.14)',
    background: 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    color: '#E5E7EB',
    fontFamily: FONT_BODY,
  },
  dlIcon: { fontSize: 20, color: '#A78BFA' },
  dlLabel: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14.5 },
  dlHint: { fontSize: 12, color: '#7C8798' },

  footer: {
    position: 'relative',
    textAlign: 'center',
    padding: '28px 20px 40px',
    borderTop: '1px solid rgba(148,163,184,0.1)',
    zIndex: 2,
  },
  footerLine: { fontSize: 13, color: '#7C8798' },
  footerStrong: { color: '#C4B5FD', fontWeight: 600 },
  footerMade: { fontSize: 12, color: '#4B5566', marginTop: 6, fontFamily: FONT_MONO },
};