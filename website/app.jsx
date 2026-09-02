// Shoeab Shaikh - Lead Visual Strategist & Art Director Portfolio
// Built with React 18, Tailwind CSS, Matter.js Physics Engine, Lucide Icons, and Web Audio SFX.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// -------------------------------------------------------------
// 1. Web Audio API Sound Synthesizer
// -------------------------------------------------------------
const AudioController = {
  ctx: null,
  enabled: true,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  },
  play(type) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.04);
      } else if (type === 'pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(900, t + 0.06);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.start(t);
        osc.stop(t + 0.06);
      } else if (type === 'toss') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(520, t + 0.12);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
      } else if (type === 'success') {
        [440, 554.37, 659.25, 880].forEach((freq, i) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(this.ctx.destination);
          g.gain.setValueAtTime(0.06, t + i * 0.07);
          g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.15);
          o.start(t + i * 0.07);
          o.stop(t + i * 0.07 + 0.15);
        });
      } else if (type === 'bounce') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
      }
    } catch (e) {
      console.warn("Audio feedback error:", e);
    }
  }
};

// -------------------------------------------------------------
// 2. Custom Kinetic Cursor Component
// -------------------------------------------------------------
function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const [cursorText, setCursorText] = useState('');
  const [cursorActive, setCursorActive] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let animId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const render = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      animId = requestAnimationFrame(render);
    };

    const onMouseEnter = () => setHidden(false);
    const onMouseLeave = () => setHidden(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    animId = requestAnimationFrame(render);

    // Global cursor hover triggers
    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-cursor]');
      if (target) {
        const text = target.getAttribute('data-cursor');
        setCursorText(text || '');
        setCursorActive(true);
      } else if (e.target.closest('button, a, input, textarea, select, .interactive-card')) {
        setCursorText('');
        setCursorActive(true);
      } else {
        setCursorText('');
        setCursorActive(false);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null; // Disable on touch devices
  }

  return (
    <React.Fragment>
      {/* Precision Center Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 bg-accent rounded-full pointer-events-none z-[9999] transition-opacity duration-150 ${
          hidden ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ willChange: 'transform' }}
      />
      {/* Smooth Trailing Magnetic Ring */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] flex items-center justify-center -ml-6 -mt-6 rounded-full border border-accent/70 transition-all duration-200 ease-out ${
          cursorActive
            ? 'w-16 h-16 -ml-8 -mt-8 bg-accent/15 border-accent shadow-[0_0_20px_rgba(0,255,102,0.4)] scale-110'
            : 'w-12 h-12 bg-transparent opacity-60'
        } ${hidden ? 'opacity-0 scale-50' : 'opacity-100'}`}
        style={{ willChange: 'transform' }}
      >
        {cursorText && (
          <span className="text-[9px] font-mono font-black text-black bg-accent px-1.5 py-0.5 rounded tracking-tighter uppercase shadow-sm">
            {cursorText}
          </span>
        )}
      </div>
    </React.Fragment>
  );
}

// -------------------------------------------------------------
// 2.5 SvgOutlinedWord - Clean Boolean Union Stroked Typography (Zero Overlapping Glyph Lines)
// -------------------------------------------------------------
function SvgOutlinedWord({ text, color = '#00FF66', className = '' }) {
  const [hovered, setHovered] = useState(false);
  const maskId = useMemo(
    () => 'svg-stroke-mask-' + text.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.random().toString(36).substr(2, 6),
    [text]
  );

  const charWidthMap = {
    'DESIGNER': 585,
    'WORKS': 415,
    'PHYSICS': 515,
    'PROCESS': 525,
    'STRATEGIST': 710
  };
  const width = charWidthMap[text] || text.length * 75;

  return (
    <span
      className={`inline-block relative cursor-pointer align-baseline select-none transition-transform duration-300 hover:scale-[1.02] ${className}`}
      onMouseEnter={() => {
        setHovered(true);
        AudioController.play('pop');
      }}
      onMouseLeave={() => setHovered(false)}
      data-cursor="GLOW"
    >
      <svg
        viewBox={`0 0 ${width} 110`}
        className="h-[0.85em] w-auto inline-block align-baseline overflow-visible"
        style={{ verticalAlign: '-0.07em' }}
      >
        <defs>
          <mask id={maskId}>
            {/* White outer dilated stroke (4.5px stroke width) */}
            <text
              x="0"
              y="88"
              fontFamily="'Hanken Grotesk', 'Syne', sans-serif"
              fontWeight="900"
              fontSize="96"
              letterSpacing="0.05em"
              fill="white"
              stroke="white"
              strokeWidth="5"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              {text}
            </text>

            {/* Black united knockout (removes all interior glyph stroke overlaps when not hovered) */}
            {!hovered && (
              <text
                x="0"
                y="88"
                fontFamily="'Hanken Grotesk', 'Syne', sans-serif"
                fontWeight="900"
                fontSize="96"
                letterSpacing="0.05em"
                fill="black"
                stroke="none"
              >
                {text}
              </text>
            )}
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill={color}
          mask={`url(#${maskId})`}
          className="transition-colors duration-300"
        />
      </svg>
    </span>
  );
}

// -------------------------------------------------------------
// 3. Navbar Component
// -------------------------------------------------------------
function Navbar({ soundEnabled, setSoundEnabled, onOpenUpload, totalCount }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollTo = (id) => {
    AudioController.play('click');
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/85 backdrop-blur-xl border-b border-white/15 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
          : 'bg-transparent border-b border-white/10 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => scrollTo('hero')}
          data-cursor="TOP"
          className="group cursor-pointer flex items-center gap-3 select-none"
        >
          <div className="w-3 h-3 bg-accent rounded-sm rotate-45 group-hover:rotate-180 transition-transform duration-500 shadow-[0_0_12px_#00FF66]" />
          <div>
            <span className="font-black text-xl sm:text-2xl tracking-tighter uppercase text-white group-hover:text-accent transition-colors font-sans">
              SHOEAB AHMED
            </span>
            <div className="flex items-center gap-2 font-mono text-[10px] text-white/50 tracking-wider">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>{timeStr || 'MUMBAI // IST'} • 9+ YRS</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 font-mono text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => scrollTo('projects')}
            data-cursor="VIEW"
            className="text-white/80 hover:text-accent transition-colors flex items-center gap-1.5 group"
          >
            <span className="text-accent/60 group-hover:text-accent">//01</span> ARCHIVE
          </button>
          <button
            onClick={() => scrollTo('playground')}
            data-cursor="PHYSICS"
            className="text-white/80 hover:text-accent transition-colors flex items-center gap-1.5 group"
          >
            <span className="text-accent/60 group-hover:text-accent">//02</span> PLAYGROUND
          </button>
          <button
            onClick={() => scrollTo('timeline')}
            data-cursor="ROADMAP"
            className="text-white/80 hover:text-accent transition-colors flex items-center gap-1.5 group"
          >
            <span className="text-accent/60 group-hover:text-accent">//03</span> PROCESS
          </button>
          <button
            onClick={() => scrollTo('about')}
            data-cursor="BIO"
            className="text-white/80 hover:text-accent transition-colors flex items-center gap-1.5 group"
          >
            <span className="text-accent/60 group-hover:text-accent">//04</span> ABOUT
          </button>
          <button
            onClick={() => scrollTo('contact')}
            data-cursor="HELLO"
            className="text-white/80 hover:text-accent transition-colors flex items-center gap-1.5 group"
          >
            <span className="text-accent/60 group-hover:text-accent">//05</span> CONTACT
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* LinkedIn Direct Link */}
          <a
            href="https://www.linkedin.com/in/shaikhshoeab/"
            target="_blank"
            rel="noreferrer"
            data-cursor="LINKEDIN"
            className="p-2 sm:px-3 sm:py-1.5 rounded border border-white/20 hover:border-accent bg-white/5 hover:bg-accent hover:text-black text-white/80 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Shoeab Ahmed LinkedIn Profile"
          >
            <i data-lucide="linkedin" className="w-3.5 h-3.5"></i>
            <span className="hidden lg:inline">LINKEDIN</span>
          </a>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              AudioController.enabled = next;
              if (next) AudioController.play('pop');
            }}
            data-cursor={soundEnabled ? 'MUTE' : 'UNMUTE'}
            className={`p-2 sm:px-3 sm:py-1.5 rounded border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              soundEnabled
                ? 'border-accent/40 bg-accent/10 text-accent shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                : 'border-white/20 bg-white/5 text-white/40 hover:text-white hover:border-white/40'
            }`}
            title="Toggle Audio Feedback"
          >
            <i data-lucide={soundEnabled ? "volume-2" : "volume-x"} className="w-3.5 h-3.5"></i>
            <span className="hidden sm:inline">{soundEnabled ? 'SFX ON' : 'MUTED'}</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => {
              AudioController.play('pop');
              setMobileOpen(!mobileOpen);
            }}
            className="md:hidden p-2 text-white hover:text-accent border border-white/20 rounded bg-white/5"
            aria-label="Toggle Navigation"
          >
            <i data-lucide={mobileOpen ? "x" : "menu"} className="w-5 h-5"></i>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] bg-black/95 backdrop-blur-2xl z-40 p-6 flex flex-col justify-between border-t border-white/15 animate-fade-in">
          <div className="flex flex-col gap-6 pt-4">
            <button
              onClick={() => scrollTo('projects')}
              className="text-left text-2xl font-black uppercase text-white hover:text-accent border-b border-white/10 pb-4 flex items-center justify-between"
            >
              <span>01 // ARCHIVE</span>
            </button>
            <button
              onClick={() => scrollTo('playground')}
              className="text-left text-2xl font-black uppercase text-white hover:text-accent border-b border-white/10 pb-4"
            >
              02 // PHYSICS PLAYGROUND
            </button>
            <button
              onClick={() => scrollTo('timeline')}
              className="text-left text-2xl font-black uppercase text-white hover:text-accent border-b border-white/10 pb-4"
            >
              03 // PROCESS &amp; TIMELINE
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="text-left text-2xl font-black uppercase text-white hover:text-accent border-b border-white/10 pb-4"
            >
              04 // BIO &amp; MANIFESTO
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="text-left text-2xl font-black uppercase text-white hover:text-accent border-b border-white/10 pb-4"
            >
              05 // GET IN TOUCH
            </button>
          </div>

          <div className="pt-6 border-t border-white/10 font-mono text-xs text-white/50 flex flex-col gap-2">
            <div className="flex items-center justify-between text-white/80">
              <span>AVAILABLE FOR COMMISSIONS</span>
              <span className="text-accent font-bold">Q2 / Q3 2026</span>
            </div>
            <div>MUMBAI, INDIA • GLOBAL REMOTE</div>
          </div>
        </div>
      )}
    </header>
  );
}

// =============================================================
// REACT BITS: AeroShards WebGPU Wind Sculpture Component
// =============================================================
let vgpuBundle = null;
const loadVgpu = async () => {
  if (!vgpuBundle) {
    vgpuBundle = await import('https://esm.sh/vgpu@0.3.1/es2022/vgpu.bundle.mjs');
  }
  return vgpuBundle;
};

const PLACEMENTS = { right: 0, left: 1, center: 2, full: 3 };
const MATERIALS = { pearl: 0, chrome: 1, satin: 2 };
const INTERACTIONS = { none: 0, repel: 1, attract: 2 };
const FLOWS = { stream: 0, vortex: 1, ribbon: 2 };
const RIPPLE_SPEED = 4.2;
const RIPPLE_TAIL = 1.8;
const MATERIAL_PRESETS = {
  pearl: { roughness: 0.46, brightness: 0.92, glow: 0.54, highlightMix: 0.78 },
  chrome: { roughness: 0.1, brightness: 1.12, glow: 0.38, highlightMix: 0.9 },
  satin: { roughness: 0.74, brightness: 0.84, glow: 0.42, highlightMix: 0.66 }
};
const DETAIL_PRESETS = {
  bold: { count: 0.58, size: 1.32 },
  balanced: { count: 1, size: 0.96 },
  fine: { count: 1.15, size: 0.7 }
};
const QUALITY_PRESETS = {
  low: { count: 1900, dpr: 1.5, supersamplePixels: 3000000 },
  medium: { count: 3200, dpr: 2, supersamplePixels: 6000000 },
  high: { count: 4600, dpr: 2, supersamplePixels: 8000000 }
};
const RUNTIME_QUALITY = [{ countScale: 1 }, { countScale: 0.86 }, { countScale: 0.72 }];
const BLOOM_SCALES = [0.25, 0.22, 0.18];
const FRAME_STATES = {
  interactive: { interval: 1000 / 60, continuous: true },
  settling: { interval: 1000 / 60, continuous: true },
  ambient: { interval: 1000 / 60, continuous: true },
  partial: { interval: 1000 / 12, continuous: false }
};

const resolveFrameInterval = (frameState, refreshInterval) =>
  frameState.continuous ? Math.max(frameState.interval, refreshInterval) : frameState.interval;

const advanceFrameDeadline = (timestamp, deadline, interval, reset) => {
  const nextDeadline = deadline + interval;
  return reset || nextDeadline <= timestamp - 0.5 ? timestamp + interval : nextDeadline;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const layoutVector = placement => [0, 1, 2, 3].map(index => (index === placement ? 1 : 0));

const createFormation = flow => ({ weights: layoutVector(flow), velocity: [0, 0, 0, 0] });

const advanceFormation = (state, flow, elapsed, duration, frozen) => {
  const goal = layoutVector(flow);
  if (frozen) {
    state.weights = goal;
    state.velocity.fill(0);
    return;
  }
  const response = 6 / duration;
  const decay = Math.exp(-response * elapsed);
  for (let i = 0; i < 4; i += 1) {
    const offset = state.weights[i] - goal[i];
    const momentum = state.velocity[i] + response * offset;
    state.weights[i] = goal[i] + (offset + momentum * elapsed) * decay;
    state.velocity[i] = (state.velocity[i] - response * momentum * elapsed) * decay;
  }
  if (state.weights.every((value, i) => Math.abs(value - goal[i]) < 0.0001 && Math.abs(state.velocity[i]) < 0.001)) {
    state.weights = goal;
    state.velocity.fill(0);
  }
};

const resolvePathLength = (aspect, weights) => {
  const side = 2.65 + 0.61 * aspect + 0.09 * aspect * aspect;
  const center = 2.3 + 2 * aspect + 0.35 * aspect * aspect;
  const full = Math.hypot(2.44 * aspect, Math.sqrt(5));
  const mobile = Math.hypot(2.56 * aspect, 1);
  return aspect < 0.82
    ? mobile * (weights[0] + weights[1] + weights[2]) + full * weights[3]
    : side * (weights[0] + weights[1]) + center * weights[2] + full * weights[3];
};

const createHold = () => ({ pointerId: null, elapsed: 0, amount: 0, velocity: 0, phase: 0 });

const advanceHold = (hold, elapsed, disabled) => {
  if (disabled) {
    hold.pointerId = null;
    hold.elapsed = 0;
    hold.amount = 0;
    hold.velocity = 0;
    return;
  }
  const previousElapsed = hold.elapsed;
  hold.elapsed = hold.pointerId === null ? 0 : hold.elapsed + elapsed;
  const engaging = hold.pointerId !== null && hold.elapsed > 0.15;
  const step = engaging && previousElapsed < 0.15 ? hold.elapsed - 0.15 : elapsed;
  const target = engaging ? 1 : 0;
  const response = engaging ? 3.8 : 3.2;
  const decay = Math.exp(-response * step);
  const offset = hold.amount - target;
  const momentum = hold.velocity + response * offset;
  hold.amount = target + (offset + momentum * step) * decay;
  hold.velocity = (hold.velocity - response * momentum * step) * decay;
  if (Math.abs(hold.amount - target) < 0.0001 && Math.abs(hold.velocity) < 0.001) {
    hold.amount = target;
    hold.velocity = 0;
  }
  if (hold.amount > 0) hold.phase += elapsed * (0.35 + hold.amount * 0.5);
};

const resetPointerMotion = pointer => {
  pointer.velocity = pointer.velocity || [0, 0];
  pointer.velocity[0] = 0;
  pointer.velocity[1] = 0;
  pointer.presenceVelocity = 0;
};

const advancePointer = (pointer, elapsed) => {
  if (elapsed <= 0) return;
  const response = 26;
  const decay = Math.exp(-response * elapsed);
  for (let axis = 0; axis < 2; axis += 1) {
    const offset = pointer.position[axis] - pointer.raw[axis];
    const momentum = pointer.velocity[axis] + response * offset;
    pointer.position[axis] = pointer.raw[axis] + (offset + momentum * elapsed) * decay;
    pointer.velocity[axis] = (pointer.velocity[axis] - response * momentum * elapsed) * decay;
  }
  const presenceTarget = pointer.active ? 1 : 0;
  const presenceResponse = pointer.active ? 24 : 12;
  const presenceDecay = Math.exp(-presenceResponse * elapsed);
  const presenceOffset = pointer.presence - presenceTarget;
  const presenceMomentum = pointer.presenceVelocity + presenceResponse * presenceOffset;
  const nextPresence = presenceTarget + (presenceOffset + presenceMomentum * elapsed) * presenceDecay;
  pointer.presence = clamp(nextPresence, 0, 1);
  pointer.presenceVelocity = (pointer.presenceVelocity - presenceResponse * presenceMomentum * elapsed) * presenceDecay;

  if (nextPresence !== pointer.presence) pointer.presenceVelocity = 0;
  if (Math.abs(pointer.presence - presenceTarget) < 0.001 && Math.abs(pointer.presenceVelocity) < 0.01) {
    pointer.presence = presenceTarget;
    pointer.presenceVelocity = 0;
  }
};

const createRipples = () => Array.from({ length: 4 }, () => ({ origin: [0.5, 0.5], age: 0, duration: 0, strength: 0 }));

const startRipple = (ripples, origin, aspect, strength = 1) => {
  const ripple = ripples.find(value => value.strength === 0);
  if (!ripple) return false;
  ripple.origin = [...origin];
  ripple.age = 0;
  const farthestX = (1 + Math.abs(origin[0] * 2 - 1)) * aspect;
  const farthestY = 1 + Math.abs(origin[1] * 2 - 1);
  ripple.duration = Math.hypot(farthestX, farthestY) / RIPPLE_SPEED + RIPPLE_TAIL;
  ripple.strength = strength;
  return true;
};

const advanceRipples = (ripples, elapsed, disabled) => {
  for (const ripple of ripples) {
    if (disabled) ripple.strength = 0;
    if (!ripple.strength) continue;
    ripple.age += elapsed;
    if (ripple.age >= ripple.duration) ripple.strength = 0;
  }
};

const mixColor = (from, to, amount) => [
  from[0] + (to[0] - from[0]) * amount,
  from[1] + (to[1] - from[1]) * amount,
  from[2] + (to[2] - from[2]) * amount,
  1
];

const SHARD_SHADER = `
struct ViewParams {
  viewport: vec4f,
  shape: vec4f,
  effects: vec4f,
  composition: vec4f,
  transport: vec4f,
  formation: vec4f,
  gather: vec4f,
  pointer: vec4f,
  shock: vec4f,
  shockB: vec4f,
  shockC: vec4f,
  shockD: vec4f,
  material: vec4f,
  light: vec4f,
  environment: vec4f,
  baseColor: vec4f,
  highlightColor: vec4f,
  accentColor: vec4f,
}

struct PathSample {
  position: vec3f,
  tangent: vec3f,
  phase: f32,
}

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) @interpolate(flat, first) baseAlpha: vec4f,
  @location(1) @interpolate(flat, first) creaseColor: vec3f,
  @location(2) localCoord: vec2f,
}

@group(0) @binding(0) var<uniform> view: ViewParams;

fn hashU32(value: u32) -> u32 {
  var state = value * 747796405u + 2891336453u;
  let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}

fn unitFloat(value: u32) -> f32 {
  return f32(hashU32(value)) * (1.0 / 4294967296.0);
}

fn safeNormalize(value: vec3f) -> vec3f {
  return value / max(length(value), 0.0001);
}

fn safeNormalize2(value: vec2f) -> vec2f {
  return value / max(length(value), 0.0001);
}

fn cubic(p0: f32, p1: f32, p2: f32, p3: f32, t: f32) -> f32 {
  let oneMinusT = 1.0 - t;
  return oneMinusT * oneMinusT * oneMinusT * p0
    + 3.0 * oneMinusT * oneMinusT * t * p1
    + 3.0 * oneMinusT * t * t * p2
    + t * t * t * p3;
}

fn cubicDerivative(p0: f32, p1: f32, p2: f32, p3: f32, t: f32) -> f32 {
  let oneMinusT = 1.0 - t;
  return 3.0 * oneMinusT * oneMinusT * (p1 - p0)
    + 6.0 * oneMinusT * t * (p2 - p1)
    + 3.0 * t * t * (p3 - p2);
}

fn sideArc(phase: f32) -> f32 {
  let lookup = array<f32, 32>(
    0.000000, 0.052475, 0.097829, 0.135121, 0.166845, 0.195164, 0.221458, 0.246639,
    0.271368, 0.296184, 0.321577, 0.348019, 0.375973, 0.405832, 0.437746, 0.471327,
    0.505474, 0.538781, 0.570323, 0.599945, 0.628000, 0.655048, 0.681734, 0.708795,
    0.737169, 0.768244, 0.804295, 0.848010, 0.894805, 0.935083, 0.969270, 1.000000,
  );
  let scaled = clamp(phase, 0.0, 0.999999) * 31.0;
  let index = min(u32(floor(scaled)), 30u);
  return mix(lookup[index], lookup[index + 1u], fract(scaled));
}

fn fullArc(phase: f32) -> f32 {
  let lookup = array<f32, 32>(
    0.000000, 0.028092, 0.055939, 0.083892, 0.112291, 0.141449, 0.171637, 0.203033,
    0.235650, 0.269282, 0.303537, 0.337982, 0.372308, 0.406392, 0.440263, 0.474026,
    0.507794, 0.541636, 0.575553, 0.609470, 0.643257, 0.676761, 0.709855, 0.742465,
    0.774594, 0.806319, 0.837790, 0.869218, 0.900862, 0.933020, 0.965991, 1.000000,
  );
  let scaled = clamp(phase, 0.0, 0.999999) * 31.0;
  let index = min(u32(floor(scaled)), 30u);
  return mix(lookup[index], lookup[index + 1u], fract(scaled));
}

fn centerArc(phase: f32) -> f32 {
  let lookup = array<f32, 32>(
    0.000000, 0.028692, 0.059794, 0.096620, 0.140315, 0.179839, 0.212476, 0.241834,
    0.270282, 0.299332, 0.329968, 0.362347, 0.395341, 0.427241, 0.457283, 0.485900,
    0.514192, 0.543773, 0.577230, 0.618093, 0.661144, 0.696770, 0.727388, 0.756064,
    0.784657, 0.814415, 0.845979, 0.878880, 0.911508, 0.942489, 0.971712, 1.000000,
  );
  let scaled = clamp(phase, 0.0, 0.999999) * 31.0;
  let index = min(u32(floor(scaled)), 30u);
  return mix(lookup[index], lookup[index + 1u], fract(scaled));
}

fn mobileArc(phase: f32) -> f32 {
  let lookup = array<f32, 32>(
    0.000000, 0.028885, 0.057970, 0.087431, 0.117400, 0.147935, 0.179017, 0.210560,
    0.242467, 0.274689, 0.307272, 0.340367, 0.374193, 0.408970, 0.444794, 0.481483,
    0.518517, 0.555206, 0.591030, 0.625807, 0.659633, 0.692728, 0.725311, 0.757533,
    0.789440, 0.820983, 0.852065, 0.882600, 0.912569, 0.942030, 0.971115, 1.000000,
  );
  let scaled = clamp(phase, 0.0, 0.999999) * 31.0;
  let index = min(u32(floor(scaled)), 30u);
  return mix(lookup[index], lookup[index + 1u], fract(scaled));
}

fn sidePath(seedPhase: f32, distance: f32, aspect: f32, mirror: f32) -> PathSample {
  let pi = 3.14159265359;
  let pathLength = 2.65 + 0.61 * aspect + 0.09 * aspect * aspect;
  let phase = fract(seedPhase + distance / pathLength);
  let t = sideArc(phase);
  let x = cubic(1.24, 1.02, -0.28, 0.12, t) + sin(t * pi * 4.0 + 0.34) * 0.055;
  let y = cubic(1.38, 0.72, -0.56, -1.38, t) + sin(t * pi * 2.0 - 0.6) * 0.04;
  let z = sin(t * pi * 3.0) * 0.18;
  let derivative = vec3f(
    mirror * aspect * (
      cubicDerivative(1.24, 1.02, -0.28, 0.12, t)
        + cos(t * pi * 4.0 + 0.34) * pi * 4.0 * 0.055
    ),
    cubicDerivative(1.38, 0.72, -0.56, -1.38, t)
      + cos(t * pi * 2.0 - 0.6) * pi * 2.0 * 0.04,
    cos(t * pi * 3.0) * pi * 3.0 * 0.18,
  );
  var sample: PathSample;
  sample.position = vec3f(mirror * aspect * x, y, z);
  sample.tangent = safeNormalize(derivative);
  sample.phase = phase;
  return sample;
}

fn centerPath(seedPhase: f32, distance: f32, aspect: f32) -> PathSample {
  let pi = 3.14159265359;
  let pathLength = 2.3 + 2.0 * aspect + 0.35 * aspect * aspect;
  let phase = fract(seedPhase + distance / pathLength);
  let t = centerArc(phase);
  let angle = mix(-0.25 * pi, 1.75 * pi, t);
  let angleDerivative = 2.0 * pi;
  let radius = 0.72 + sin(t * pi * 4.0) * 0.12;
  let radiusDerivative = cos(t * pi * 4.0) * pi * 4.0 * 0.12;
  let derivative = vec3f(
    aspect * (
      -sin(angle) * angleDerivative * radius
        + cos(angle) * radiusDerivative
    ),
    cos(angle) * angleDerivative * radius
      + sin(angle) * radiusDerivative,
    cos(t * pi * 2.0) * pi * 2.0 * 0.16,
  );
  var sample: PathSample;
  sample.position = vec3f(
    cos(angle) * radius * aspect,
    sin(angle) * radius,
    sin(t * pi * 2.0) * 0.16,
  );
  sample.tangent = safeNormalize(derivative);
  sample.phase = phase;
  return sample;
}

fn fullPath(seedPhase: f32, distance: f32, aspect: f32) -> PathSample {
  let pi = 3.14159265359;
  let pathWidth = 2.44 * aspect;
  let pathLength = sqrt(pathWidth * pathWidth + 5.0);
  let phase = fract(seedPhase + distance / pathLength);
  let t = fullArc(phase);
  let derivative = vec3f(
    aspect * 2.44,
    cos((t * 1.72 - 0.2) * pi) * 1.72 * pi * 0.54
      + cos(t * pi * 3.0) * pi * 3.0 * 0.12,
    -sin(t * pi * 2.0 - 0.7) * pi * 2.0 * 0.22,
  );
  var sample: PathSample;
  sample.position = vec3f(
    mix(-aspect * 1.22, aspect * 1.22, t),
    sin((t * 1.72 - 0.2) * pi) * 0.54 + sin(t * pi * 3.0) * 0.12,
    cos(t * pi * 2.0 - 0.7) * 0.22,
  );
  sample.tangent = safeNormalize(derivative);
  sample.phase = phase;
  return sample;
}

fn mobilePath(seedPhase: f32, distance: f32, aspect: f32) -> PathSample {
  let pi = 3.14159265359;
  let pathWidth = 2.56 * aspect;
  let pathLength = sqrt(pathWidth * pathWidth + 1.0);
  let phase = fract(seedPhase + distance / pathLength);
  let t = mobileArc(phase);
  let derivative = vec3f(
    aspect * 2.56,
    cos(t * pi) * pi * 0.28 + cos(t * pi * 3.0) * pi * 3.0 * 0.06,
    -sin(t * pi * 2.0) * pi * 2.0 * 0.16,
  );
  var sample: PathSample;
  sample.position = vec3f(
    mix(-aspect * 1.28, aspect * 1.28, t),
    -0.86 + sin(t * pi) * 0.28 + sin(t * pi * 3.0) * 0.06,
    cos(t * pi * 2.0) * 0.16,
  );
  sample.tangent = safeNormalize(derivative);
  sample.phase = phase;
  return sample;
}

fn weightedPath(seedPhase: f32, phaseOffset: f32, aspect: f32, weights: vec4f) -> PathSample {
  let phase = fract(seedPhase + phaseOffset);
  var result: PathSample;
  result.position = vec3f(0.0);
  result.tangent = vec3f(0.0);
  result.phase = phase;

  if (aspect < 0.82) {
    let compactWeight = weights.x + weights.y + weights.z;
    if (compactWeight > 0.0001) {
      let compact = mobilePath(phase, 0.0, aspect);
      result.position += compact.position * compactWeight;
      result.tangent += compact.tangent * compactWeight;
    }
    if (weights.w > 0.0001) {
      let wide = fullPath(phase, 0.0, aspect);
      result.position += wide.position * weights.w;
      result.tangent += wide.tangent * weights.w;
    }
  } else {
    if (weights.x > 0.0001) {
      let right = sidePath(phase, 0.0, aspect, 1.0);
      result.position += right.position * weights.x;
      result.tangent += right.tangent * weights.x;
    }
    if (weights.y > 0.0001) {
      let left = sidePath(phase, 0.0, aspect, -1.0);
      result.position += left.position * weights.y;
      result.tangent += left.tangent * weights.y;
    }
    if (weights.z > 0.0001) {
      let center = centerPath(phase, 0.0, aspect);
      result.position += center.position * weights.z;
      result.tangent += center.tangent * weights.z;
    }
    if (weights.w > 0.0001) {
      let wide = fullPath(phase, 0.0, aspect);
      result.position += wide.position * weights.w;
      result.tangent += wide.tangent * weights.w;
    }
  }

  result.tangent = safeNormalize(result.tangent + vec3f(0.0001, 0.0, 0.0));
  return result;
}

fn pointerField(delta: vec2f, radius: f32, flow: vec2f, depth: f32) -> vec2f {
  let offset = delta / max(radius, 0.001);
  let along = dot(offset, flow);
  let across = dot(offset, vec2f(-flow.y, flow.x));
  let alongSquared = along * along;
  let layer = depth * inverseSqrt(1.0 + depth * depth);
  let bend = (0.22 * alongSquared + 0.12 * layer * along) / (1.0 + alongSquared);
  let curvedAcross = (across + bend) / (1.0 + layer * 0.18);
  let falloff = exp(-0.28 * alongSquared - 1.2 * curvedAcross * curvedAcross);
  return offset * falloff;
}

fn rippleWave(age: f32) -> f32 {
  if (age <= 0.0 || age >= 1.8) { return 0.0; }
  let attack = smoothstep(0.0, 0.14, age);
  let release = 1.0 - smoothstep(1.4, 1.8, age);
  return sin(age * 10.0) * exp(-age * 3.2) * attack * release;
}

fn rippleDisplacement(position: vec3f, pulse: vec4f) -> vec4f {
  if (pulse.w <= 0.0001) { return vec4f(0.0); }
  let perspective = 1.0 / max(0.62, 1.0 - position.z * 0.34);
  let delta = (position.xy * perspective - pulse.xy) * view.viewport.z;
  let distance = sqrt(dot(delta, delta) + 0.0016) - 0.04;
  let wave = rippleWave(pulse.z - distance / 4.2) * pulse.w;
  let radial = delta / (distance + 0.12);
  return vec4f(radial * wave * 0.28, wave * 0.12, abs(wave));
}

fn shardVertex(index: u32) -> vec3f {
  let fold = 0.34;
  let vertices = array<vec3f, 6>(
    vec3f(0.0, 1.0, fold),
    vec3f(-0.72, 0.0, 0.0),
    vec3f(0.0, -1.0, fold),
    vec3f(0.0, 1.0, fold),
    vec3f(0.0, -1.0, fold),
    vec3f(0.72, 0.0, 0.0)
  );
  return vertices[index % 6u];
}

fn softbox(direction: vec3f, center: vec2f, size: vec2f) -> f32 {
  let q = abs((direction.xy - center) / size);
  let q2 = q * q;
  let q4 = q2 * q2;
  return exp(-(q4.x + q4.y));
}

fn aces(color: vec3f) -> vec3f {
  let a = 2.51;
  let b = 0.03;
  let c = 2.43;
  let d = 0.59;
  let e = 0.14;
  return clamp((color * (a * color + b)) / (color * (c * color + d) + e), vec3f(0.0), vec3f(1.0));
}

@vertex
fn vs_main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOut {
  let seedPhase = unitFloat(instanceIndex * 1664525u + 1013904223u);
  let seedLane = unitFloat(instanceIndex * 2246822519u + 3266489917u);
  let seedDepth = unitFloat(instanceIndex * 668265263u + 374761393u);
  let seedScale = unitFloat(instanceIndex * 1597334677u + 3812015801u);
  let aspect = view.viewport.x;
  let path = weightedPath(seedPhase, view.transport.x, aspect, view.composition);
  var direction = path.tangent;
  var planarNormal = safeNormalize2(vec2f(-direction.y, direction.x));

  let signedLane = seedLane * 2.0 - 1.0;
  let lane = sign(signedLane) * pow(abs(signedLane), 0.72);
  let widthProfile = 0.46 + pow(max(sin(path.phase * 3.14159265359), 0.0), 0.72) * 0.54;
  let looseSeed = unitFloat(instanceIndex * 3266489917u + 668265263u);
  let loose = smoothstep(0.92, 1.0, looseSeed);
  let flowWave = sin(path.phase * 37.6991118431 + seedDepth * 12.0);
  let laneWidth = (lane * 0.56 + flowWave * 0.055 * view.shape.z) * view.shape.x
    * widthProfile * (1.0 + loose * 0.72);
  let depthLane = (seedDepth * 2.0 - 1.0) * view.shape.y
    + cos(path.phase * 31.4159265359 + seedLane * 8.0) * 0.06 * view.shape.z;
  var renderPosition = path.position + vec3f(planarNormal * laneWidth, depthLane);

  if (view.formation.y + view.formation.z > 0.00001) {
    let center = vec2f((view.composition.x - view.composition.y) * aspect * 0.56, 0.0);
    var formedPosition = renderPosition * view.formation.x;
    var formedDirection = direction * view.formation.x;
    if (view.formation.y > 0.00001) {
      let radius = 0.16 + sqrt(seedLane) * 0.74 * (0.45 + view.shape.x * 0.55);
      let angle = seedPhase * 6.28318530718 + view.viewport.w / radius;
      let radial = vec2f(cos(angle), sin(angle));
      let position = vec3f(center + radial * radius, (seedDepth - 0.5) * view.shape.y * 0.65 + radial.y * 0.2);
      formedPosition += position * view.formation.y;
      formedDirection += safeNormalize(vec3f(-radial.y, radial.x, radial.x * 0.2)) * view.formation.y;
    }
    if (view.formation.z > 0.00001) {
      let phase = fract(seedPhase + view.viewport.w / (aspect * 3.0 + 2.0));
      let angle = phase * 6.28318530718;
      let ribbonWidth = (seedLane - 0.5) * 0.54 * view.shape.x;
      let position = vec3f(
        mix(-aspect * 1.35, aspect * 1.35, phase) + center.x * 0.5,
        sin(angle) * 0.42 + cos(angle * 2.0) * ribbonWidth,
        (cos(angle) * 0.35 + sin(angle * 2.0) * ribbonWidth + (seedDepth - 0.5) * 0.12) * view.shape.y
      );
      let tangent = safeNormalize(vec3f(aspect * 2.7, cos(angle) * 2.638938, -sin(angle) * 2.199115 * view.shape.y));
      formedPosition += position * view.formation.z;
      formedDirection += tangent * view.formation.z;
    }
    renderPosition = formedPosition;
    direction = safeNormalize(formedDirection + vec3f(0.0, 0.0, 0.02 * view.formation.x * (1.0 - view.formation.x)));
    planarNormal = safeNormalize2(vec2f(-direction.y, direction.x));
  }

  if (abs(view.pointer.w) > 0.0001) {
    let field = pointerField(
      view.pointer.xy - renderPosition.xy,
      view.pointer.z,
      vec2f(planarNormal.y, -planarNormal.x),
      renderPosition.z,
    );
    let lateral = field - direction.xy * dot(field, direction.xy);
    renderPosition += vec3f(lateral * view.pointer.w * 0.36, 0.0);
    direction = safeNormalize(vec3f(direction.xy + lateral * view.pointer.w * 0.65, direction.z));
  }

  if (view.gather.z > 0.00001) {
    let relative = (renderPosition.xy - view.gather.xy) * view.viewport.z;
    let reach = length(relative);
    let radius = sqrt(-2.0 * log(max(seedLane, 0.0001)));
    let angle = seedPhase * 6.28318530718 + view.gather.w * (0.3 + seedDepth * 0.18);
    let orbit = vec2f(cos(angle), sin(angle));
    let layer = seedDepth * 6.28318530718;
    let drift = vec2f(sin(layer + view.gather.w * 0.22), cos(layer * 1.7 - view.gather.w * 0.18)) * 0.055;
    let cloud = orbit * radius * vec2f(0.2, 0.16) + drift;
    let cluster = vec3f(view.gather.xy + cloud / view.viewport.z, (seedDepth - 0.5) * 0.42);
    let amount = pow(view.gather.z, 1.0 + seedDepth * 0.65 + min(reach, 4.0) * 0.12);
    let curledDirection = safeNormalize(vec3f(-orbit.y, orbit.x, sin(layer) * 0.35));
    renderPosition = mix(renderPosition, cluster, amount);
    direction = safeNormalize(mix(direction, curledDirection, amount));
  }

  var rippleLight = 0.0;
  if (view.shock.w + view.shockB.w + view.shockC.w + view.shockD.w > 0.0001) {
    let displacement = rippleDisplacement(renderPosition, view.shock)
      + rippleDisplacement(renderPosition, view.shockB)
      + rippleDisplacement(renderPosition, view.shockC)
      + rippleDisplacement(renderPosition, view.shockD);
    rippleLight = min(displacement.w, 1.5);
    if (dot(displacement.xyz, displacement.xyz) > 0.0) {
      renderPosition += displacement.xyz;
      direction = safeNormalize(direction + displacement.xyz * 0.7);
    }
  }

  let shapeLocal = shardVertex(vertexIndex);
  var local = shapeLocal;
  local.x *= mix(0.72, 1.08, seedLane);
  local.y *= mix(0.82, 1.12, seedDepth);
  local.x += (seedDepth - 0.5) * (1.0 - abs(local.y)) * 0.16;

  var side = cross(vec3f(0.0, 0.0, 1.0), direction);
  let sideLengthSquared = dot(side, side);
  if (sideLengthSquared > 0.0001) {
    side *= inverseSqrt(sideLengthSquared);
  } else {
    side = vec3f(1.0, 0.0, 0.0);
  }
  let facing = cross(direction, side);
  let rollDirection = mix(-1.5, 1.7, seedDepth);
  let roll = seedLane * 6.28318530718 + view.viewport.w * rollDirection * view.effects.x * 2.4;
  let rollSin = sin(roll);
  let rollCos = cos(roll);
  let bankedSide = side * rollCos + facing * rollSin;
  let bankedFacing = facing * rollCos - side * rollSin;
  let depthScale = mix(0.56, 1.58, clamp(renderPosition.z * 0.62 + 0.5, 0.0, 1.0));
  let scaleShape = 0.46 + seedScale * 0.58 + pow(seedScale, 12.0) * 1.55;
  let size = view.viewport.y * scaleShape * depthScale * (1.0 - view.gather.z * 0.3);
  let width = size * 0.72;
  let lengthScale = size * 1.26 * view.effects.z;
  let world = renderPosition
    + direction * local.y * lengthScale
    + bankedSide * local.x * width
    + bankedFacing * local.z * width;

  let perspective = 1.0 / max(0.62, 1.0 - world.z * 0.34);
  let ndc = world.xy * view.viewport.z / vec2f(aspect, 1.0) * perspective;
  let depth = clamp(0.56 - world.z * 0.24, 0.03, 0.97);
  let triangle = vertexIndex / 3u;
  let corner = vertexIndex % 3u;
  var mapped = vec3f(0.0);
  var mappedCrease = vec3f(0.0);
  var shardAlpha = 0.0;

  if (corner == 0u) {
    let facetSide = select(-1.0, 1.0, triangle == 1u);
    let localNormal = vec3f(facetSide * 0.394903, 0.0, 0.918723);
    let normal = bankedSide * localNormal.x + bankedFacing * localNormal.z;
    let viewDirection = normalize(vec3f(-renderPosition.xy * 0.08, 1.0));
    let pointerShift = vec2f(view.light.w, view.shape.w);
    let keyDirection = view.light.xyz;
    let halfDirection = normalize(keyDirection + viewDirection);
    let roughness = clamp(view.material.x, 0.04, 0.96);
    let materialKind = view.material.y;
    let glow = view.material.w;
    let reflection = reflect(-viewDirection, normal);
    let broad = softbox(
      reflection,
      vec2f(-0.34, 0.28) + pointerShift * 0.36,
      vec2f(0.52, 0.22) + roughness * 0.3,
    );
    let strip = softbox(
      reflection,
      vec2f(0.48, -0.08) - pointerShift * 0.2,
      vec2f(0.12, 0.72),
    );
    let diffuse = max(dot(normal, keyDirection), 0.0);
    let specularPower = mix(92.0, 9.0, roughness);
    let specular = pow(max(dot(normal, halfDirection), 0.0), specularPower);
    let fresnelBase = 1.0 - max(dot(normal, viewDirection), 0.0);
    let fresnelSquared = fresnelBase * fresnelBase;
    let fresnel = fresnelSquared * fresnelSquared;
    let facet = mix(0.76, 1.0, smoothstep(-0.08, 0.08, normal.x));
    let depthFog = smoothstep(-0.68, 0.58, renderPosition.z);
    let depthTint = mix(view.accentColor.rgb * 0.52, view.baseColor.rgb, depthFog);
    var color = depthTint * (0.1 + diffuse * 0.3) * facet;
    color += view.highlightColor.rgb * (broad * mix(0.3, 0.86, 1.0 - roughness)) * (1.0 + glow * 0.14);
    color += view.accentColor.rgb * strip * (0.12 + fresnel * 0.42);
    color += view.highlightColor.rgb * specular * mix(0.82, 1.0, seedDepth);
    color += mix(view.baseColor.rgb, view.accentColor.rgb, seedLane) * fresnel * (0.15 + glow * 0.16);
    color += view.accentColor.rgb * (broad * 0.045 + fresnel * 0.075) * glow;
    var creaseColor = color + view.highlightColor.rgb * (0.08 + specular * 0.22);

    if (materialKind > 0.5 && materialKind < 1.5) {
      let materialLight = view.highlightColor.rgb * (broad + specular) * 0.32;
      color = color * 1.1 + materialLight;
      creaseColor = creaseColor * 1.1 + materialLight;
    } else if (materialKind >= 1.5) {
      let satinColor = view.baseColor.rgb * (0.46 + diffuse * 0.46);
      color = mix(color, satinColor, 0.56);
      creaseColor = mix(creaseColor, satinColor, 0.56);
    }

    let fill = mix(view.accentColor.rgb, view.baseColor.rgb, depthFog)
      * (0.38 + diffuse * 0.12) * facet * view.environment.x;
    color += fill;
    creaseColor += fill;

    let pulseColor = mix(view.accentColor.rgb, view.highlightColor.rgb, 0.18);
    color += pulseColor * rippleLight * (0.85 + fresnel * 0.45);
    creaseColor += pulseColor * rippleLight * 1.35;

    let fog = mix(0.42, 1.0, depthFog);
    let exposure = fog * view.material.z * view.effects.w;
    mapped = aces(color * exposure);
    mappedCrease = aces(creaseColor * exposure);
    shardAlpha = mix(0.58, 0.97, depthFog);
    let seam = smoothstep(0.0, 0.035, path.phase) * (1.0 - smoothstep(0.965, 1.0, path.phase));
    shardAlpha *= mix(1.0, seam, view.transport.y * view.formation.x * (1.0 - view.gather.z));
  }

  var out: VertexOut;
  out.position = vec4f(ndc, depth, 1.0);
  out.baseAlpha = vec4f(mapped, shardAlpha);
  out.creaseColor = mappedCrease - mapped;
  out.localCoord = shapeLocal.xy;
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let crease = (1.0 - smoothstep(0.015, 0.11, abs(in.localCoord.x)))
    * (1.0 - smoothstep(0.78, 1.0, abs(in.localCoord.y)));
  var coverage = 1.0;
  if (view.effects.y > 0.001) {
    let diamondDistance = 1.0 - abs(in.localCoord.y) - abs(in.localCoord.x) / 0.72;
    let edgeWidth = max(fwidth(diamondDistance) * view.effects.y, 0.0001);
    coverage = smoothstep(0.0, edgeWidth, diamondDistance);
  }
  let mapped = in.baseAlpha.rgb + in.creaseColor * crease;
  let coveredAlpha = in.baseAlpha.a * coverage;
  return vec4f(mapped * coveredAlpha, coveredAlpha);
}
`;

const BLOOM_SHADER = `
struct PostParams {
  viewport: vec4f,
  bloomInfo: vec4f,
  finishing: vec4f,
  background: vec4f,
  temporal: vec4f,
  tint: vec4f,
}

@group(0) @binding(0) var sceneTexture: texture_2d<f32>;
@group(0) @binding(1) var sceneSampler: sampler;
@group(0) @binding(2) var<uniform> post: PostParams;

fn visibleResidual(uv: vec2f) -> vec4f {
  let scene = textureSampleLevel(sceneTexture, sceneSampler, uv, 0.0).rgb;
  let residual = scene - post.background.rgb;
  let energy = dot(abs(residual), vec3f(0.2126, 0.7152, 0.0722));
  let threshold = post.bloomInfo.z;
  let knee = post.bloomInfo.w;
  let contribution = smoothstep(threshold - knee, threshold + knee, energy);
  let coverage = energy * contribution;
  return vec4f(mix(residual * contribution, post.tint.rgb * coverage, post.finishing.w), coverage);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let offset = post.bloomInfo.xy * 0.25;
  var glow = visibleResidual(uv + offset);
  glow += visibleResidual(uv - offset);
  glow += visibleResidual(uv + vec2f(offset.x, -offset.y));
  glow += visibleResidual(uv + vec2f(-offset.x, offset.y));
  return glow * 0.25;
}
`;

const BLOOM_BLUR_SHADER = `
struct BlurParams {
  direction: vec4f,
}

@group(0) @binding(0) var bloomTexture: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> blur: BlurParams;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let nearOffset = blur.direction.xy * 1.3846153846;
  let farOffset = blur.direction.xy * 3.2307692308;
  var color = textureSampleLevel(bloomTexture, linearSampler, uv, 0.0) * 0.2270270270;
  color += textureSampleLevel(bloomTexture, linearSampler, uv + nearOffset, 0.0) * 0.3162162162;
  color += textureSampleLevel(bloomTexture, linearSampler, uv - nearOffset, 0.0) * 0.3162162162;
  color += textureSampleLevel(bloomTexture, linearSampler, uv + farOffset, 0.0) * 0.0702702703;
  color += textureSampleLevel(bloomTexture, linearSampler, uv - farOffset, 0.0) * 0.0702702703;
  return color;
}
`;

const FINISH_SHADER = `
struct PostParams {
  viewport: vec4f,
  bloomInfo: vec4f,
  finishing: vec4f,
  background: vec4f,
  temporal: vec4f,
  tint: vec4f,
}

@group(0) @binding(0) var sceneTexture: texture_2d<f32>;
@group(0) @binding(1) var bloomTexture: texture_2d<f32>;
@group(0) @binding(2) var linearSampler: sampler;
@group(0) @binding(3) var<uniform> post: PostParams;

fn hash12(value: vec2f) -> f32 {
  let p = fract(value * vec2f(0.1031, 0.1030));
  let mixed = p + dot(p, p.yx + 33.33);
  return fract((mixed.x + mixed.y) * mixed.x);
}

@fragment
fn fs_main(@location(0) uv: vec2f, @builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let background = post.background.rgb;
  var scene = textureLoad(sceneTexture, vec2i(pixel.xy), 0).rgb;

  if (post.finishing.z > 0.000001) {
    let aspect = post.viewport.x / max(post.viewport.y, 1.0);
    let centered = (uv - vec2f(0.5)) * vec2f(aspect, 1.0);
    let radius = clamp(length(centered) / 0.78, 0.0, 1.0);
    let radialDirection = centered / max(length(centered), 0.0001);
    let minResolution = min(post.viewport.x, post.viewport.y);
    let pixelOffset = radialDirection * (post.finishing.z * minResolution * radius * radius);
    let uvOffset = pixelOffset * post.viewport.zw;
    let positive = textureSampleLevel(sceneTexture, linearSampler, uv + uvOffset, 0.0).rgb;
    let negative = textureSampleLevel(sceneTexture, linearSampler, uv - uvOffset, 0.0).rgb;
    scene = vec3f(positive.r, scene.g, negative.b);
  }

  var foreground = scene - background;
  if (post.finishing.x > 0.0001) {
    let bloom = textureSampleLevel(bloomTexture, linearSampler, uv, 0.0);
    let haloMask = 1.0 - smoothstep(0.04, 0.4, length(foreground));
    let haloOpacity = min(bloom.a * post.finishing.x * 1.8, 0.65) * haloMask;
    let haloColor = bloom.rgb / max(bloom.a, 0.00001);
    let lightForeground = mix(foreground, haloColor - background, haloOpacity);
    foreground = mix(foreground + bloom.rgb * post.finishing.x, lightForeground, post.finishing.w);
  }

  let signal = smoothstep(0.008, 0.18, length(foreground));
  if (post.finishing.y > 0.0001) {
    let grainSeed = floor(post.temporal.x * 60.0);
    let noise = hash12(floor(pixel.xy) + vec2f(grainSeed, grainSeed * 1.6180339)) - 0.5;
    foreground += vec3f(noise * post.finishing.y * signal);
  }

  return vec4f(clamp(background + foreground, vec3f(0.0), vec3f(1.0)), 1.0);
}
`;

const parseColor = (value, fallback) => {
  const match = /^#?([\\da-f]{2})([\\da-f]{2})([\\da-f]{2})$/i.exec(value);
  const source = match || /^#?([\\da-f]{2})([\\da-f]{2})([\\da-f]{2})$/i.exec(fallback);
  return [parseInt(source[1], 16) / 255, parseInt(source[2], 16) / 255, parseInt(source[3], 16) / 255, 1];
};

const resolveQuality = canvas => {
  const memory = (navigator && navigator.deviceMemory) || 6;
  const cores = (navigator && navigator.hardwareConcurrency) || 6;
  const cssPixels = Math.max(1, canvas.clientWidth * canvas.clientHeight);
  if (canvas.clientWidth < 640 || memory <= 4 || cores <= 4) return 'low';
  if (cssPixels <= 360000 && memory >= 8 && cores >= 12) return 'high';
  return 'medium';
};

const resolveDpr = (preset, canvas) => {
  const cssPixels = Math.max(1, canvas.clientWidth * canvas.clientHeight);
  const budgetDpr = Math.sqrt(preset.supersamplePixels / cssPixels);
  return Math.max(1, Math.min(window.devicePixelRatio || 1, preset.dpr, budgetDpr));
};

const resolveBloomSize = (size, qualityLevel = 0) => {
  const bloomScale = BLOOM_SCALES[qualityLevel] || BLOOM_SCALES[0];
  return [Math.max(1, Math.round(size[0] * bloomScale)), Math.max(1, Math.round(size[1] * bloomScale))];
};

const createRenderGraph = (vgpu, gpu, outputSize, bloomSize = resolveBloomSize(outputSize)) => {
  const { uniforms, draw, target, sampler, effect } = vgpu;
  const viewParams = uniforms(gpu, {
    viewport: [1, 0.0132, 1, 0],
    shape: [1, 1, 0.36, 0],
    effects: [1, 2, 1, 1.12],
    composition: [0, 0, 0, 1],
    transport: [0, 0, 0, 0],
    formation: [1, 0, 0, 0],
    gather: [0, 0, 0, 0],
    pointer: [0, 0, 0.54, 0],
    shock: [0, 0, 4, 0],
    shockB: [0, 0, 0, 0],
    shockC: [0, 0, 0, 0],
    shockD: [0, 0, 0, 0],
    material: [0.46, MATERIALS.pearl, 0.92, 0.54],
    light: [-0.321, 0.49, 0.845, 0],
    environment: [0, 0, 0, 0],
    baseColor: [137 / 255, 106 / 255, 189 / 255, 1],
    highlightColor: mixColor([168 / 255, 85 / 255, 247 / 255, 1], [1, 1, 1, 1], MATERIAL_PRESETS.pearl.highlightMix),
    accentColor: [168 / 255, 85 / 255, 247 / 255, 1]
  });
  const postParams = uniforms(gpu, {
    viewport: [outputSize[0], outputSize[1], 1 / outputSize[0], 1 / outputSize[1]],
    bloomInfo: [1 / bloomSize[0], 1 / bloomSize[1], 0.2, 0.12],
    finishing: [0.5, 0.05, 0.0075, 0],
    background: [0.071, 0.059, 0.09, 1],
    temporal: [0, 0, 0, 0],
    tint: [137 / 255, 106 / 255, 189 / 255, 1]
  });
  const shardDraw = draw(gpu, {
    shader: SHARD_SHADER,
    vertices: 6,
    blend: 'premultiplied',
    cull: 'none',
    depth: false,
    label: 'aero-shards-procedural'
  });
  shardDraw.set({ view: viewParams });
  const sceneTarget = target(gpu, {
    size: outputSize,
    format: 'rgba8unorm',
    label: 'aero-shards-scene'
  });
  const bloomTarget = target(gpu, {
    size: bloomSize,
    format: 'rgba16float',
    label: 'aero-shards-bloom'
  });
  const bloomScratchTarget = target(gpu, {
    size: bloomSize,
    format: 'rgba16float',
    label: 'aero-shards-bloom-scratch'
  });
  const linearSampler = sampler(gpu, {
    minFilter: 'linear',
    magFilter: 'linear',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge'
  });
  const bloomEffect = effect(gpu, BLOOM_SHADER, {
    label: 'aero-shards-bloom-prefilter',
    set: {
      sceneTexture: sceneTarget,
      sceneSampler: linearSampler,
      post: postParams
    }
  });
  const blurParamsX = uniforms(gpu, { direction: [1 / bloomSize[0], 0, 0, 0] });
  const blurParamsY = uniforms(gpu, { direction: [0, 1 / bloomSize[1], 0, 0] });
  const bloomBlurX = effect(gpu, BLOOM_BLUR_SHADER, {
    label: 'aero-shards-bloom-horizontal',
    set: { bloomTexture: bloomTarget, linearSampler, blur: blurParamsX }
  });
  const bloomBlurY = effect(gpu, BLOOM_BLUR_SHADER, {
    label: 'aero-shards-bloom-vertical',
    set: { bloomTexture: bloomScratchTarget, linearSampler, blur: blurParamsY }
  });
  const finishEffect = effect(gpu, FINISH_SHADER, {
    label: 'aero-shards-finish',
    set: {
      sceneTexture: sceneTarget,
      bloomTexture: bloomTarget,
      linearSampler,
      post: postParams
    }
  });

  return {
    viewParams,
    postParams,
    shardDraw,
    sceneTarget,
    bloomTarget,
    bloomScratchTarget,
    bloomEffect,
    blurParamsX,
    blurParamsY,
    bloomBlurX,
    bloomBlurY,
    finishEffect
  };
};

const prepareRenderGraph = async (graph, outputFormat) => {
  await Promise.all([
    graph.shardDraw.compile({ colors: [outputFormat] }),
    graph.shardDraw.compile(graph.sceneTarget),
    graph.bloomEffect.compile(graph.bloomTarget),
    graph.bloomBlurX.compile(graph.bloomScratchTarget),
    graph.bloomBlurY.compile(graph.bloomTarget),
    graph.finishEffect.compile({ colors: [outputFormat] })
  ]);
};

function AeroShards({
  backgroundColor = '#120F17',
  shardColor = '#a6ff6b',
  accentColor = '#020345',
  placement = 'full',
  flow = 'stream',
  material = 'pearl',
  detail = 'balanced',
  effect = 'none',
  scale = 1,
  spread = 1,
  depth = 1,
  speed = 1,
  spin = 1,
  interaction = 'repel',
  density = 1.5,
  shardSize = 1.1,
  stretch = 1,
  turbulence = 1,
  glow = 1,
  edgeSoftness = 2,
  bloom = 0.5,
  grain = 0.05,
  chromaticAberration = 0.0075,
  transitionDuration = 1,
  interactionRadius = 1.5,
  interactionStrength = 0.5,
  rippleIntensity = 1,
  holdToGather = true,
  paused = false,
  className = '',
  onError
}) {
  const rootRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const onErrorRef = React.useRef(onError);
  const settingsRef = React.useRef(null);
  const wakeRef = React.useRef(() => {});
  const pointerRef = React.useRef({
    raw: [0.5, 0.5],
    position: [0.5, 0.5],
    velocity: [0, 0],
    active: 0,
    presence: 0,
    presenceVelocity: 0,
    initialized: false
  });
  const ripplesRef = React.useRef(createRipples());
  const holdRef = React.useRef(createHold());
  const [ready, setReady] = React.useState(false);

  const resolvedMaterial = MATERIAL_PRESETS[material] || MATERIAL_PRESETS.pearl;
  const resolvedDetail = DETAIL_PRESETS[detail] || DETAIL_PRESETS.balanced;
  const resolvedScale = clamp(scale, 0.5, 2.5);
  const resolvedBackground = parseColor(backgroundColor, '#120F17');
  const resolvedShardColor = parseColor(shardColor, '#a6ff6b');
  const resolvedAccentColor = parseColor(accentColor, '#020345');
  const resolvedSpread = clamp(spread, 0.15, 1.1);
  const resolvedDepth = clamp(depth, 0, 1.25);
  const resolvedSpeed = clamp(speed, 0, 2);
  const resolvedSpin = clamp(spin, 0, 2);
  const resolvedInteraction = INTERACTIONS[interaction] ?? INTERACTIONS.repel;
  const resolvedDensity = clamp(density, 0.5, 1.5);
  const resolvedShardSize = clamp(shardSize, 0.5, 1.5);
  const resolvedStretch = clamp(stretch, 0.6, 1.8);
  const resolvedTurbulence = clamp(turbulence, 0, 2);
  const resolvedGlow = clamp(glow, 0, 2);
  const resolvedEdgeSoftness = clamp(edgeSoftness, 0, 2);
  const resolvedBloom = clamp(bloom, 0, 3);
  const resolvedGrain = clamp(grain, 0, 0.12);
  const resolvedChromaticAberration = clamp(chromaticAberration, 0, 0.01);
  const resolvedTransitionDuration = clamp(transitionDuration, 0.2, 2);
  const resolvedInteractionRadius = clamp(interactionRadius, 0.5, 2);
  const resolvedInteractionStrength = clamp(interactionStrength, 0, 2);
  const backgroundLuma =
    resolvedBackground[0] * 0.2126 + resolvedBackground[1] * 0.7152 + resolvedBackground[2] * 0.0722;
  const lightBackground = clamp((backgroundLuma - 0.58) / 0.24, 0, 1);
  const lightSurface = lightBackground * lightBackground * (3 - 2 * lightBackground);

  settingsRef.current = {
    background: resolvedBackground,
    shard: resolvedShardColor,
    highlight: mixColor(resolvedAccentColor, [1, 1, 1, 1], resolvedMaterial.highlightMix),
    accent: resolvedAccentColor,
    composition: PLACEMENTS[placement] ?? PLACEMENTS.full,
    flow: FLOWS[flow] ?? FLOWS.stream,
    material: MATERIALS[material] ?? MATERIALS.pearl,
    effect: 0,
    detailCount: resolvedDetail.count * resolvedDensity,
    shardSize: resolvedDetail.size * resolvedShardSize,
    scale: resolvedScale,
    stretch: resolvedStretch * (1 + Math.min(resolvedSpeed * 0.34, 1.2) * 0.1),
    speed: resolvedSpeed,
    spin: resolvedSpin,
    turbulence: 0.36 * resolvedTurbulence,
    spread: resolvedSpread,
    depth: resolvedDepth,
    roughness: resolvedMaterial.roughness,
    brightness: resolvedMaterial.brightness,
    glow: resolvedMaterial.glow * resolvedGlow,
    edgeSoftness: resolvedEdgeSoftness,
    bloom: resolvedBloom,
    grain: resolvedGrain,
    chromaticAberration: resolvedChromaticAberration,
    exposure: 1.12 + (0.96 - 1.12) * lightSurface,
    lightSurface,
    transitionDuration: resolvedTransitionDuration,
    interaction: resolvedInteraction,
    interactionRadius: (interaction === 'attract' ? 0.27 : 0.18) * resolvedInteractionRadius,
    interactionStrength: resolvedInteractionStrength,
    rippleIntensity: clamp(rippleIntensity, 0, 2),
    holdToGather,
    paused,
    signature: [
      backgroundColor,
      shardColor,
      accentColor,
      placement,
      flow,
      material,
      detail,
      resolvedScale,
      resolvedSpread,
      resolvedDepth,
      resolvedSpeed,
      resolvedSpin,
      interaction,
      resolvedDensity,
      resolvedShardSize,
      resolvedStretch,
      resolvedTurbulence,
      resolvedGlow,
      resolvedEdgeSoftness,
      resolvedBloom,
      resolvedGrain,
      resolvedChromaticAberration,
      resolvedTransitionDuration,
      resolvedInteractionRadius,
      resolvedInteractionStrength,
      rippleIntensity,
      holdToGather,
      paused
    ].join('|')
  };
  const settingsSignature = settingsRef.current.signature;
  onErrorRef.current = onError;

  React.useEffect(() => {
    wakeRef.current();
  }, [settingsSignature]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    resetPointerMotion(pointerRef.current);
    ripplesRef.current = createRipples();
    holdRef.current = createHold();

    let disposed = false;
    let runtimeFailed = false;
    let gpu;
    let animationFrameId = 0;
    let timeoutId = 0;
    let unsubscribeResize;
    let unsubscribeGpuError;
    let visibilityObserver;
    let resizeObserver;
    let visible = true;
    let visibilityRatio = 1;
    let needsRender = true;
    let interactionDeadline = 0;
    let settlingDeadline = 0;
    let bounds = root.getBoundingClientRect();
    let boundsDirty = false;
    let resumePending = true;
    let wakeRenderer = () => {
      needsRender = true;
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const reportFailure = error => {
      if (disposed || runtimeFailed) return;
      runtimeFailed = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (timeoutId) window.clearTimeout(timeoutId);
      resizeObserver && resizeObserver.disconnect();
      visibilityObserver && visibilityObserver.disconnect();
      unsubscribeResize && unsubscribeResize();
      unsubscribeGpuError && unsubscribeGpuError();
      const failedGpu = gpu;
      gpu = undefined;
      failedGpu && failedGpu.dispose && failedGpu.dispose();
      const resolved = error instanceof Error ? error : new Error(String(error));
      onErrorRef.current && onErrorRef.current(resolved);
    };

    const updateBounds = () => {
      bounds = root.getBoundingClientRect();
      boundsDirty = false;
    };

    const pointFromClient = (clientX, clientY) => {
      if (boundsDirty) updateBounds();
      if (bounds.width <= 0 || bounds.height <= 0) return null;
      const x = (clientX - bounds.left) / bounds.width;
      const y = (clientY - bounds.top) / bounds.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return null;
      return [x, y];
    };

    const updatePointerTarget = next => {
      const pointer = pointerRef.current;
      if (!pointer.initialized || (!pointer.active && pointer.presence === 0)) {
        pointer.raw = [...next];
        pointer.position = [...next];
        pointer.presence = 0;
        resetPointerMotion(pointer);
        pointer.initialized = true;
      } else {
        pointer.raw[0] = next[0];
        pointer.raw[1] = next[1];
      }
      pointer.active = 1;
    };

    const deactivatePointer = () => {
      pointerRef.current.active = 0;
      holdRef.current.pointerId = null;
      const now = performance.now();
      interactionDeadline = now + 140;
      settlingDeadline = now + 680;
      wakeRenderer();
    };

    const handlePointerMove = event => {
      const settings = settingsRef.current;
      if (!event.isPrimary || !visible || settings.interaction === INTERACTIONS.none) return;
      const next = pointFromClient(event.clientX, event.clientY);
      if (!next) {
        const pointer = pointerRef.current;
        if (pointer.active || pointer.presence > 0) deactivatePointer();
        return;
      }
      updatePointerTarget(next);
      const now = performance.now();
      interactionDeadline = now + 140;
      settlingDeadline = now + 680;
      wakeRenderer();
    };

    const handlePointerDown = event => {
      const settings = settingsRef.current;
      if (!event.isPrimary || event.button !== 0 || !visible || settings.interaction === INTERACTIONS.none) return;
      if (
        event.target instanceof Element &&
        event.target.closest('a, button, input, textarea, select, [role="button"], [contenteditable="true"]')
      )
        return;
      const next = pointFromClient(event.clientX, event.clientY);
      if (!next) return;
      if (!settings.paused && !reduceMotion.matches && settings.speed > 0.0001) {
        startRipple(ripplesRef.current, next, bounds.width / Math.max(bounds.height, 1));
        if (settings.holdToGather) {
          holdRef.current.pointerId = event.pointerId;
          holdRef.current.elapsed = 0;
        }
      }
      updatePointerTarget(next);
      const now = performance.now();
      interactionDeadline = now + 220;
      settlingDeadline = now + 800;
      wakeRenderer();
    };

    const handlePointerEnd = event => {
      const hold = holdRef.current;
      if (hold.pointerId === event.pointerId) {
        hold.pointerId = null;
        const settings = settingsRef.current;
        if (
          hold.amount > 0.1 &&
          !settings.paused &&
          !reduceMotion.matches &&
          settings.interaction !== INTERACTIONS.none
        ) {
          startRipple(
            ripplesRef.current,
            pointerRef.current.raw,
            bounds.width / Math.max(bounds.height, 1),
            1 + hold.amount * 0.8
          );
        }
        wakeRenderer();
      }
      if (event.pointerType !== 'mouse') deactivatePointer();
    };

    const markBoundsDirty = () => {
      boundsDirty = true;
    };

    const handleVisibilityChange = () => {
      resumePending = true;
      holdRef.current.pointerId = null;
      resetPointerMotion(pointerRef.current);
      wakeRenderer();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerEnd, { passive: true });
    window.addEventListener('pointercancel', deactivatePointer, { passive: true });
    window.addEventListener('blur', deactivatePointer);
    window.addEventListener('scroll', markBoundsDirty, { passive: true, capture: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    reduceMotion.addEventListener('change', handleVisibilityChange);

    visibilityObserver = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        visibilityRatio = (entry && entry.intersectionRatio) ?? 1;
        visible = entry ? entry.isIntersecting && visibilityRatio >= 0.02 : true;
        if (visible) {
          resumePending = true;
        } else {
          interactionDeadline = 0;
          settlingDeadline = 0;
          const pointer = pointerRef.current;
          pointer.active = 0;
          pointer.presence = 0;
          holdRef.current.pointerId = null;
          resetPointerMotion(pointer);
        }
        wakeRenderer();
      },
      { threshold: [0, 0.02, 0.25] }
    );
    visibilityObserver.observe(root);

    void (async () => {
      try {
        setReady(false);
        if (typeof navigator === 'undefined' || !navigator.gpu) {
          // WebGPU is not supported on this browser/hardware
          return;
        }

        const vgpu = await loadVgpu();
        if (disposed) return;
        const { init, surface, frame } = vgpu;

        const resolvedQuality = resolveQuality(canvas);
        const preset = QUALITY_PRESETS[resolvedQuality] || QUALITY_PRESETS.medium;
        gpu = await init({ powerPreference: 'low-power' });
        if (disposed) return gpu.dispose();
        unsubscribeGpuError = gpu.onError(reportFailure);

        const outputFormat = navigator.gpu.getPreferredCanvasFormat();
        const output = surface(gpu, canvas, {
          dpr: resolveDpr(preset, canvas),
          autoResize: false,
          format: outputFormat
        });
        const graph = createRenderGraph(vgpu, gpu, output.size, resolveBloomSize([canvas.clientWidth, canvas.clientHeight]));
        await prepareRenderGraph(graph, outputFormat);
        if (disposed) return;

        let lastSettingsSignature = '';
        let previousRenderTimestamp = 0;
        let lastPresentationTimestamp = 0;
        let nextPresentationTimestamp = 0;
        let flowDistance = 0;
        let travelPhase = 0;
        let grainTime = 0;
        let firstFrame = true;
        const placementMotion = createFormation(settingsRef.current.composition);
        let layoutWeights = placementMotion.weights;
        let layoutTransitioning = false;
        const formation = createFormation(settingsRef.current.flow);
        let renderScale = settingsRef.current.scale;
        let runtimeQualityLevel = 0;
        let appliedBloomLevel = 0;
        let pendingBloomResize = false;
        let pressureStartedAt = 0;
        let stableStartedAt = performance.now();
        let lastQualityChange = 0;
        let encodeAverage = 0;
        let renderTimestamp = 0;
        let previousRafTimestamp = 0;
        let refreshInterval = 1000 / 60;
        const refreshSamples = new Float32Array(30);
        let refreshSampleCount = 0;
        let refreshSampleIndex = 0;

        const resolveFrameState = now => {
          const pointer = pointerRef.current;
          const pointerTransitioning = Math.abs(pointer.presence - pointer.active) > 0.004;
          if (
            now < interactionDeadline ||
            pointerTransitioning ||
            ripplesRef.current.some(ripple => ripple.strength > 0) ||
            layoutTransitioning ||
            holdRef.current.pointerId !== null ||
            holdRef.current.amount > 0 ||
            formation.weights[settingsRef.current.flow] < 1 ||
            Math.abs(settingsRef.current.scale - renderScale) > 0.001
          ) {
            return FRAME_STATES.interactive;
          }
          if (now < settlingDeadline) return FRAME_STATES.settling;
          if (visibilityRatio < 0.25) return FRAME_STATES.partial;
          return FRAME_STATES.ambient;
        };

        const resizePostTargets = (qualityLevel = appliedBloomLevel) => {
          const width = Math.max(1, output.size[0]);
          const height = Math.max(1, output.size[1]);
          const bloomSize = resolveBloomSize([canvas.clientWidth, canvas.clientHeight], qualityLevel);
          graph.sceneTarget.resize([width, height]);
          graph.bloomTarget.resize(bloomSize);
          graph.bloomScratchTarget.resize(bloomSize);
          graph.blurParamsX.set({ direction: [1 / bloomSize[0], 0, 0, 0] });
          graph.blurParamsY.set({ direction: [0, 1 / bloomSize[1], 0, 0] });
          graph.postParams.set({
            viewport: [width, height, 1 / width, 1 / height],
            bloomInfo: [1 / bloomSize[0], 1 / bloomSize[1], 0.2, 0.12]
          });
        };

        const resizeOutput = () => {
          updateBounds();
          const dpr = resolveDpr(preset, canvas);
          const nextSize = [
            Math.max(1, Math.round(canvas.clientWidth * dpr)),
            Math.max(1, Math.round(canvas.clientHeight * dpr))
          ];
          if (nextSize[0] !== output.size[0] || nextSize[1] !== output.size[1]) output.resize(nextSize);
          resizePostTargets();
        };

        unsubscribeResize = output.onResize(() => {
          resizePostTargets();
          needsRender = true;
          wakeRenderer();
        });
        resizeObserver = new ResizeObserver(() => {
          resizeOutput();
          wakeRenderer();
        });
        resizeObserver.observe(canvas);

        const setRuntimeQuality = (nextLevel, now, frameState) => {
          const clampedLevel = Math.max(0, Math.min(RUNTIME_QUALITY.length - 1, nextLevel));
          if (clampedLevel === runtimeQualityLevel) return;
          runtimeQualityLevel = clampedLevel;
          pressureStartedAt = 0;
          stableStartedAt = now;
          lastQualityChange = now;
          if (frameState === FRAME_STATES.interactive || frameState === FRAME_STATES.settling) {
            pendingBloomResize = true;
          } else {
            appliedBloomLevel = runtimeQualityLevel;
            pendingBloomResize = false;
            resizePostTargets();
          }
        };

        const renderFrame = currentFrame => {
          const settings = settingsRef.current;
          const frozen = settings.paused || reduceMotion.matches || settings.speed <= 0.0001;
          const elapsed =
            resumePending || !previousRenderTimestamp
              ? 0
              : Math.min(0.05, Math.max(0, (renderTimestamp - previousRenderTimestamp) / 1000));
          resumePending = false;
          previousRenderTimestamp = renderTimestamp;
          lastSettingsSignature = settings.signature;
          needsRender = false;

          if (!frozen) {
            flowDistance += elapsed * settings.speed * 0.34;
            grainTime += elapsed;
          }
          if (frozen) {
            renderScale = settings.scale;
          } else {
            renderScale += (settings.scale - renderScale) * (1 - Math.exp(-elapsed * 12));
          }

          advanceFormation(placementMotion, settings.composition, elapsed, settings.transitionDuration, frozen);
          layoutWeights = placementMotion.weights;
          layoutTransitioning = layoutWeights[settings.composition] !== 1;
          if (!frozen) {
            const travelAspect = output.size[0] / Math.max(output.size[1], 1);
            travelPhase =
              (travelPhase + (elapsed * settings.speed * 0.34) / resolvePathLength(travelAspect, layoutWeights)) % 1;
          }

          const pointer = pointerRef.current;
          advanceFormation(formation, settings.flow, elapsed, settings.transitionDuration, frozen);
          advanceHold(
            holdRef.current,
            elapsed,
            frozen || !settings.holdToGather || settings.interaction === INTERACTIONS.none
          );
          if (settings.interaction === INTERACTIONS.none) {
            pointer.active = 0;
            pointer.presence = 0;
            resetPointerMotion(pointer);
          } else if (frozen) {
            pointer.position = [...pointer.raw];
            pointer.presence = pointer.active;
            resetPointerMotion(pointer);
          } else if (pointer.initialized) {
            advancePointer(pointer, elapsed);
          }

          advanceRipples(ripplesRef.current, elapsed, frozen || settings.interaction === INTERACTIONS.none);

          const runtimeQuality = RUNTIME_QUALITY[runtimeQualityLevel];
          const activeCount = Math.max(
            700,
            Math.round(preset.count * settings.detailCount * runtimeQuality.countScale)
          );
          const densityCompensation = Math.pow(1 / runtimeQuality.countScale, 0.2);
          const shardWorldSize = 0.0125 * settings.shardSize * densityCompensation;
          const aspect = output.size[0] / Math.max(output.size[1], 1);
          const lightPresence = settings.interaction === INTERACTIONS.none ? 0 : pointer.presence;
          const pointerShiftX = (pointer.position[0] - 0.5) * 0.38 * lightPresence;
          const pointerShiftY = (pointer.position[1] - 0.5) * -0.24 * lightPresence;
          const lightX = -0.38 + pointerShiftX;
          const lightY = 0.58 + pointerShiftY;
          const lightLength = Math.hypot(lightX, lightY, 1);
          const interactionSign = settings.interaction === INTERACTIONS.attract ? 1 : -1;
          const interactionPresence =
            settings.interaction === INTERACTIONS.none
              ? 0
              : pointer.presence * settings.interactionStrength * interactionSign * (1 - holdRef.current.amount);
          const pointerWorldX = ((pointer.position[0] * 2 - 1) * aspect) / renderScale;
          const pointerWorldY = (1 - pointer.position[1] * 2) / renderScale;
          const inverseScale = 1 / renderScale;
          const rippleUniforms = ripplesRef.current.map(ripple => [
            (ripple.origin[0] * 2 - 1) * aspect * inverseScale,
            (1 - ripple.origin[1] * 2) * inverseScale,
            ripple.age,
            ripple.strength * settings.interactionStrength * settings.rippleIntensity * inverseScale
          ]);

          graph.viewParams.set({
            viewport: [aspect, shardWorldSize, renderScale, flowDistance],
            shape: [settings.spread, settings.depth, settings.turbulence, pointerShiftY],
            effects: [settings.spin, settings.edgeSoftness, settings.stretch, settings.exposure],
            composition: layoutWeights,
            transport: [travelPhase, Math.min(1, (1 - Math.max(...layoutWeights)) * 12), 0, 0],
            formation: formation.weights,
            gather: [pointerWorldX, pointerWorldY, holdRef.current.amount, holdRef.current.phase],
            pointer: [
              pointerWorldX,
              pointerWorldY,
              settings.interactionRadius * 2 * inverseScale,
              interactionPresence * inverseScale
            ],
            shock: rippleUniforms[0],
            shockB: rippleUniforms[1],
            shockC: rippleUniforms[2],
            shockD: rippleUniforms[3],
            material: [settings.roughness, settings.material, settings.brightness, settings.glow],
            light: [lightX / lightLength, lightY / lightLength, 1 / lightLength, pointerShiftX],
            environment: [settings.lightSurface, 0, 0, 0],
            baseColor: settings.shard,
            highlightColor: settings.highlight,
            accentColor: settings.accent
          });
          graph.postParams.set({
            finishing: [settings.bloom, settings.grain, settings.chromaticAberration, settings.lightSurface],
            background: settings.background,
            tint: mixColor(settings.shard, settings.accent, 0.4),
            temporal: [grainTime, 0, 0, 0]
          });

          const postEnabled =
            settings.bloom > 0.0001 ||
            settings.grain > 0.0001 ||
            settings.chromaticAberration > 0.000001;

          if (!postEnabled) {
            currentFrame.pass({ target: output, clear: settings.background }, pass => {
              pass.draw(graph.shardDraw, { instances: activeCount });
            });
          } else {
            currentFrame.pass({ target: graph.sceneTarget, clear: settings.background }, pass => {
              pass.draw(graph.shardDraw, { instances: activeCount });
            });
            if (settings.bloom > 0.0001) {
              currentFrame.pass({ target: graph.bloomTarget, clear: [0, 0, 0, 1] }, pass => {
                pass.draw(graph.bloomEffect);
              });
              currentFrame.pass({ target: graph.bloomScratchTarget, clear: [0, 0, 0, 1] }, pass => {
                pass.draw(graph.bloomBlurX);
              });
              currentFrame.pass({ target: graph.bloomTarget, clear: [0, 0, 0, 1] }, pass => {
                pass.draw(graph.bloomBlurY);
              });
            }
            currentFrame.pass({ target: output, clear: settings.background }, pass => {
              pass.draw(graph.finishEffect);
            });
          }

          if (firstFrame) {
            firstFrame = false;
            requestAnimationFrame(() => {
              if (!disposed) setReady(true);
            });
          }
        };

        const scheduleRaf = () => {
          if (disposed || runtimeFailed || animationFrameId || !visible || document.hidden) return;
          animationFrameId = requestAnimationFrame(scheduleFrame);
        };

        const scheduleSleep = targetTimestamp => {
          if (disposed || runtimeFailed || timeoutId || animationFrameId || !visible || document.hidden) return;
          const delay = Math.max(0, targetTimestamp - performance.now() - 10);
          timeoutId = window.setTimeout(() => {
            timeoutId = 0;
            scheduleRaf();
          }, delay);
        };

        const scheduleFrame = timestamp => {
          animationFrameId = 0;
          if (disposed || runtimeFailed || !visible || document.hidden) return;

          if (previousRafTimestamp) {
            const refreshSample = timestamp - previousRafTimestamp;
            if (refreshSample > 3 && refreshSample < 35) {
              refreshSamples[refreshSampleIndex] = refreshSample;
              refreshSampleIndex = (refreshSampleIndex + 1) % refreshSamples.length;
              refreshSampleCount = Math.min(refreshSampleCount + 1, refreshSamples.length);
              refreshInterval = refreshSamples[0];
              for (let index = 1; index < refreshSampleCount; index += 1) {
                refreshInterval = Math.min(refreshInterval, refreshSamples[index]);
              }
            }
          }
          previousRafTimestamp = timestamp;

          const settings = settingsRef.current;
          const settingsChanged = settings.signature !== lastSettingsSignature;
          const frozen = settings.paused || reduceMotion.matches || settings.speed <= 0.0001;
          if (frozen && !firstFrame && !settingsChanged && !needsRender) return;

          const forceFrame = firstFrame || settingsChanged || !lastPresentationTimestamp;
          const frameState = resolveFrameState(performance.now());
          const presentationInterval = resolveFrameInterval(frameState, refreshInterval);
          const cadenceDeadline = lastPresentationTimestamp + presentationInterval;
          const dueTimestamp = nextPresentationTimestamp
            ? Math.min(nextPresentationTimestamp, cadenceDeadline)
            : cadenceDeadline;
          if (!forceFrame && timestamp < dueTimestamp - 0.5) {
            if (frameState.continuous) scheduleRaf();
            else scheduleSleep(dueTimestamp);
            return;
          }

          if (pendingBloomResize && frameState !== FRAME_STATES.interactive && frameState !== FRAME_STATES.settling) {
            appliedBloomLevel = runtimeQualityLevel;
            pendingBloomResize = false;
            resizePostTargets();
          }

          const sincePresentation = lastPresentationTimestamp ? timestamp - lastPresentationTimestamp : Infinity;
          renderTimestamp = timestamp;
          const encodeStart = performance.now();
          try {
            frame(gpu, renderFrame);
          } catch (error) {
            reportFailure(error);
            return;
          }
          lastPresentationTimestamp = timestamp;

          const monitorNow = performance.now();
          const encodeDuration = monitorNow - encodeStart;
          encodeAverage = encodeAverage ? encodeAverage * 0.9 + encodeDuration * 0.1 : encodeDuration;
          const missedDeadline = Number.isFinite(sincePresentation) && sincePresentation > presentationInterval * 1.65;
          const underPressure = encodeAverage > 4 || missedDeadline;

          if (underPressure) {
            if (!pressureStartedAt) pressureStartedAt = monitorNow;
          } else {
            pressureStartedAt = 0;
          }
          if (underPressure || frameState !== FRAME_STATES.ambient) stableStartedAt = monitorNow;

          const sustainedPressure = pressureStartedAt > 0 && monitorNow - pressureStartedAt > 1800;
          const qualityCooldownComplete = monitorNow - lastQualityChange > 2200;
          if (runtimeQualityLevel < RUNTIME_QUALITY.length - 1 && qualityCooldownComplete && sustainedPressure) {
            setRuntimeQuality(runtimeQualityLevel + 1, monitorNow, frameState);
          } else if (
            runtimeQualityLevel > 0 &&
            frameState === FRAME_STATES.ambient &&
            !underPressure &&
            monitorNow - stableStartedAt > 15000 &&
            monitorNow - lastQualityChange > 15000
          ) {
            setRuntimeQuality(runtimeQualityLevel - 1, monitorNow, frameState);
          }

          const nextState = resolveFrameState(performance.now());
          nextPresentationTimestamp = advanceFrameDeadline(
            timestamp,
            dueTimestamp,
            resolveFrameInterval(nextState, refreshInterval),
            forceFrame || nextState.continuous !== frameState.continuous
          );
          if (frozen) return;
          if (nextState.continuous) scheduleRaf();
          else scheduleSleep(nextPresentationTimestamp);
        };

        wakeRenderer = () => {
          needsRender = true;
          if (!animationFrameId) nextPresentationTimestamp = 0;
          if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = 0;
          }
          scheduleRaf();
        };
        wakeRef.current = wakeRenderer;
        wakeRenderer();
      } catch (error) {
        reportFailure(error);
      }
    })();

    return () => {
      disposed = true;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', deactivatePointer);
      window.removeEventListener('blur', deactivatePointer);
      window.removeEventListener('scroll', markBoundsDirty, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      reduceMotion.removeEventListener('change', handleVisibilityChange);
      visibilityObserver && visibilityObserver.disconnect();
      resizeObserver && resizeObserver.disconnect();
      unsubscribeResize && unsubscribeResize();
      unsubscribeGpuError && unsubscribeGpuError();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (timeoutId) window.clearTimeout(timeoutId);
      wakeRef.current = () => {};
      gpu && gpu.dispose && gpu.dispose();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`aero-shards ${className}`}
      data-ready={ready}
      style={{ backgroundColor }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="aero-shards__canvas" />
    </div>
  );
}

// -------------------------------------------------------------
// 4. Hero Section & Matter.js Floating Gravity Pills
// -------------------------------------------------------------
// 4. Hero Section
// -------------------------------------------------------------
function HeroSection({ totalCount, onExplore }) {
  return (
    <section id="hero" className="relative min-h-[85vh] sm:min-h-[90vh] pt-28 pb-16 flex flex-col justify-between overflow-hidden">
      {/* Background AeroShards WebGPU Wind Sculpture (Top Section Only) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <AeroShards
          backgroundColor="#000000"
          shardColor="#a6ff6b"
          accentColor="#020345"
          placement="full"
          flow="stream"
          material="pearl"
          detail="balanced"
          effect="none"
          scale={1}
          spread={1}
          depth={1}
          speed={1}
          spin={1}
          interaction="repel"
          density={1.5}
          shardSize={1.1}
          stretch={1}
          turbulence={1}
          glow={1}
          edgeSoftness={2}
          bloom={0.5}
          grain={0.05}
          chromaticAberration={0.0075}
          transitionDuration={1}
          interactionRadius={1.5}
          interactionStrength={0.5}
          rippleIntensity={1}
          holdToGather={true}
        />
      </div>

      {/* Background Cyber Grid Lines & Ambient Glow */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:48px_48px] opacity-25 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-grow flex flex-col justify-center">
        {/* Availability Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-darkcard border border-white/15 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-white/90">
              AVAILABLE FOR Q2 / Q3 2026 PROJECTS • 9+ YEARS EXP
            </span>
          </div>
          <span className="hidden sm:inline-block font-mono text-xs text-white/40">
            // BRAND IDENTITY • SOCIAL MEDIA • PHOTOGRAPHY
          </span>
        </div>

        {/* Giant Kinetic Headline */}
        <div className="space-y-2 mb-8">
          <h1 className="font-black text-5xl sm:text-7xl md:text-8xl lg:text-[7.2rem] uppercase tracking-normal text-white leading-[0.92] select-none flex flex-wrap items-baseline gap-x-5 sm:gap-x-7 gap-y-1">
            <span className="tracking-tight">GRAPHIC</span> <SvgOutlinedWord text="DESIGNER" />
            <br className="w-full hidden sm:block" />
            <span className="text-accent tracking-tight">&amp; VISUAL</span> <span className="tracking-tight">STRATEGIST</span>
          </h1>
        </div>

        {/* Subtitle & Manifesto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          <p className="lg:col-span-8 font-mono text-sm sm:text-base md:text-lg text-white/80 uppercase border-l-2 border-accent pl-5 leading-relaxed">
            Specializing in brand identity, social media design, photography, and video editing. Over <span className="text-accent font-bold">9+ years</span> of turning marketing goals into visuals that ship on time across commercial campaigns, live music events, and brand rollouts.
          </p>

          {/* Action CTAs */}
          <div className="lg:col-span-4 flex flex-wrap gap-3 items-center">
            <button
              onClick={() => {
                AudioController.play('pop');
                onExplore();
              }}
              data-cursor="EXPLORE"
              className="flex-1 min-w-[170px] bg-accent hover:bg-white text-black font-mono text-xs font-black uppercase py-4 px-6 rounded transition-all duration-300 shadow-[0_0_25px_rgba(0,255,102,0.4)] hover:shadow-[0_0_35px_rgba(255,255,255,0.6)] flex items-center justify-center gap-2 group"
            >
              <span>EXPLORE ARCHIVE</span>
              <i data-lucide="arrow-down-right" className="w-4 h-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform"></i>
            </button>

            <a
              href="#contact"
              onClick={() => AudioController.play('click')}
              data-cursor="CONNECT"
              className="flex-1 min-w-[140px] bg-darkcard hover:bg-white/10 text-white border border-white/20 font-mono text-xs font-black uppercase py-4 px-6 rounded transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>GET IN TOUCH</span>
              <i data-lucide="mail" className="w-4 h-4"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Down Scroll Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-6 flex justify-between items-center text-white/40 font-mono text-xs uppercase">
        <div className="flex items-center gap-2">
          <span>SCROLL TO EXPLORE</span>
          <i data-lucide="arrow-down" className="w-3.5 h-3.5 animate-bounce"></i>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <span>CURATED WORKS 2025 - 2026</span>
          <span>HIGH-OCTANE KINETIC DESIGN</span>
        </div>
      </div>
    </section>
  );
}

// Helper component to trigger smooth 60fps scroll animations on viewport entry
function ScrollRevealWrapper({ children, index = 0, className = "" }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reset visibility if element changed
    setVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -25px 0px'
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delay = `${(index % 4) * 65}ms`;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: delay }}
      className={`scroll-reveal ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// -------------------------------------------------------------
// 5.4 Single Vimeo Video Integration Helper & Player
// -------------------------------------------------------------
function parseVimeoId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (/^\d{6,12}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  return match ? match[1] : null;
}

function VimeoEmbed({ vimeoId, autoplay = true, loop = true, muted = false, className = '' }) {
  if (!vimeoId) return null;
  const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&autopause=0&title=0&byline=0&portrait=0&dnt=1`;

  return (
    <div className={`relative w-full h-full min-h-[350px] max-h-[580px] flex items-center justify-center bg-black overflow-hidden rounded-xl ${className}`}>
      <iframe
        src={embedUrl}
        className="w-full h-full min-h-[350px] max-h-[560px] border-0 rounded-xl"
        allow="autoplay; fullscreen; picture-in-picture; gyroscope; accelerometer; clipboard-write; encrypted-media; web-share"
        allowFullScreen
        title="Vimeo Single Video Player"
      />
    </div>
  );
}

// -------------------------------------------------------------
// 5.5 High-Performance Lazy-Loading Video Streamer
// -------------------------------------------------------------
function LazyVideo({ src, poster = '', className = '', loop = true, muted = true, playsInline = true }) {
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setInView(entry.isIntersecting);
        });
      },
      { rootMargin: '250px 0px', threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (inView || isHovered) {
      if (!el.src && src) {
        el.src = src;
      }
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [inView, isHovered, src]);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden group/vid bg-black/60"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        poster={poster}
        preload="none"
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        className={className}
      />
    </div>
  );
}

// -------------------------------------------------------------
// 6. Featured Projects Bento Grid & Filters
// -------------------------------------------------------------
function BentoProjectsGrid({
  projects,
  onSelectProject,
  activeFilter,
  setActiveFilter,
  viewMode,
  setViewMode
}) {
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [hoveredId, setHoveredId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(24);

  // Reset subcategory whenever main category filter changes
  useEffect(() => {
    setActiveSubcategory('all');
    setVisibleCount(24);
  }, [activeFilter]);

  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'ALL WORKS' },
      { id: 'Gig Posters', label: 'GIG POSTERS' },
      { id: 'Campaigns & Promos', label: 'CAMPAIGNS' },
      { id: 'Event Calendars', label: 'CALENDARS' },
      { id: 'video', label: 'MOTION / VIDEO' },
      { id: 'Brochures', label: 'BROCHURES' },
      { id: 'custom', label: 'CUSTOM UPLOADS' }
    ];
  }, []);

  // Subcategories for Event Calendars
  const calendarSubcategories = useMemo(() => {
    return [
      { id: 'all', label: 'ALL CALENDARS' },
      { id: 'anti_all', label: 'antiSOCIAL' },
      { id: 'khar_all', label: 'KharSOCIAL' },
      { id: 'Anti_Calendar_April', label: 'ANTI • APRIL' },
      { id: 'Anti_Calendar_May', label: 'ANTI • MAY' },
      { id: 'Anti_Calendar_June', label: 'ANTI • JUNE' },
      { id: 'Khar_Calendar_May', label: 'KHAR • MAY' },
      { id: 'Khar_Calendar_June', label: 'KHAR • JUNE' },
      { id: 'Khar_Calendar_March25', label: 'KHAR • MAR 25' }
    ];
  }, []);

  // Subcategories for Campaigns & Promos
  const campaignSubcategories = useMemo(() => {
    const campList = projects.filter((p) => p.category === 'Campaigns & Promos');
    return [
      { id: 'all', label: 'ALL CAMPAIGNS', count: campList.length },
      { id: 'COEUS', label: 'COEUS BRANDING', count: campList.filter((p) => p.subfolder === 'COEUS').length },
      { id: 'MOLO', label: 'MOLO SERIES', count: campList.filter((p) => p.subfolder === 'MOLO').length },
      { id: '2025_Feb_DOP', label: 'DOP FEB', count: campList.filter((p) => p.subfolder === '2025_Feb_DOP').length },
      { id: '2025_April_DOP', label: 'DOP APRIL', count: campList.filter((p) => p.subfolder === '2025_April_DOP').length },
      { id: 'Hospitality', label: 'HOSPITALITY', count: campList.filter((p) => p.subfolder === 'Hospitality').length },
      { id: 'Metaraph', label: 'METARAPH', count: campList.filter((p) => p.subfolder === 'Metaraph').length }
    ];
  }, [projects]);

  // Filtered Projects based on active category and subcategory
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Category filter
      if (activeFilter === 'video') {
        if (p.type !== 'video') return false;
      } else if (activeFilter === 'custom') {
        if (p.is_default) return false;
      } else if (activeFilter && activeFilter !== 'all') {
        if (p.category !== activeFilter) return false;
      }

      // Subcategory filter for Event Calendars
      if (activeFilter === 'Event Calendars' && activeSubcategory !== 'all') {
        if (activeSubcategory === 'anti_all') {
          if (!p.client || !p.client.toLowerCase().includes('anti')) return false;
        } else if (activeSubcategory === 'khar_all') {
          if (!p.client || !p.client.toLowerCase().includes('khar')) return false;
        } else {
          if (p.subfolder !== activeSubcategory) return false;
        }
      }

      // Subcategory filter for Campaigns & Promos
      if (activeFilter === 'Campaigns & Promos' && activeSubcategory !== 'all') {
        if (p.subfolder !== activeSubcategory) return false;
      }

      return true;
    });
  }, [projects, activeFilter, activeSubcategory]);

  const currentDisplaySet = filteredProjects.slice(0, visibleCount);

  return (
    <section id="projects" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6 border-b border-white/15 pb-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-accent uppercase mb-2">
              <span>// ARCHIVE INDEX</span>
              <span>•</span>
              <span>COMMERCIAL &amp; EVENT DELIVERABLES</span>
            </div>
            <h2 className="font-black text-4xl sm:text-6xl uppercase tracking-normal text-white font-sans flex items-baseline gap-3.5 flex-wrap">
              <span className="tracking-tight">FEATURED</span> <SvgOutlinedWord text="WORKS" />
            </h2>
          </div>

          {/* Layout View Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-white/40 uppercase hidden sm:inline">VIEW:</span>
            <div className="flex items-center border border-white/20 rounded bg-darkcard p-0.5">
              <button
                onClick={() => {
                  AudioController.play('click');
                  setViewMode('bento');
                }}
                data-cursor="BENTO"
                className={`p-2 rounded ${
                  viewMode === 'bento' ? 'bg-accent text-black font-bold' : 'text-white/60 hover:text-white'
                } transition-colors`}
                title="Bento Masonry Grid"
              >
                <i data-lucide="layout-grid" className="w-4 h-4"></i>
              </button>
              <button
                onClick={() => {
                  AudioController.play('click');
                  setViewMode('showcase');
                }}
                data-cursor="STREAM"
                className={`p-2 rounded ${
                  viewMode === 'showcase' ? 'bg-accent text-black font-bold' : 'text-white/60 hover:text-white'
                } transition-colors`}
                title="Showcase Stream"
              >
                <i data-lucide="columns" className="w-4 h-4"></i>
              </button>
              <button
                onClick={() => {
                  AudioController.play('click');
                  setViewMode('list');
                }}
                data-cursor="LIST"
                className={`p-2 rounded ${
                  viewMode === 'list' ? 'bg-accent text-black font-bold' : 'text-white/60 hover:text-white'
                } transition-colors`}
                title="Compact List View"
              >
                <i data-lucide="list" className="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                AudioController.play('click');
                setActiveFilter(cat.id);
                setVisibleCount(24);
              }}
              data-cursor={cat.label}
              className={`whitespace-nowrap px-4 py-2 rounded font-mono text-xs font-bold uppercase transition-all duration-200 flex items-center gap-2 ${
                activeFilter === cat.id
                  ? 'bg-accent text-black shadow-[0_0_15px_rgba(0,255,102,0.4)]'
                  : 'bg-darkcard text-white/70 hover:text-white hover:border-white/40 border border-white/15'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Subcategory Filter Ribbon for Event Calendars */}
        {activeFilter === 'Event Calendars' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-white/10 no-scrollbar animate-fade-in">
            <span className="font-mono text-[10px] text-accent font-bold uppercase tracking-wider pl-1 pr-2 flex items-center gap-1">
              <i data-lucide="filter" className="w-3 h-3"></i> EDITIONS:
            </span>
            {calendarSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  AudioController.play('click');
                  setActiveSubcategory(sub.id);
                  setVisibleCount(24);
                }}
                data-cursor={sub.label}
                className={`whitespace-nowrap px-3 py-1.5 rounded font-mono text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                  activeSubcategory === sub.id
                    ? 'bg-accent text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                    : 'bg-black/60 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                }`}
              >
                <span>{sub.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Subcategories Ribbon for Campaigns & Promos */}
        {activeFilter === 'Campaigns & Promos' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar bg-darkcard/80 p-3 rounded-xl border border-cyan-400/30 animate-fade-in">
            <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase pl-2 flex items-center gap-1.5 whitespace-nowrap">
              <i data-lucide="layers" className="w-3.5 h-3.5"></i>
              CAMPAIGN SERIES:
            </span>
            {campaignSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  AudioController.play('click');
                  setActiveSubcategory(sub.id);
                  setVisibleCount(24);
                }}
                data-cursor={sub.label}
                className={`whitespace-nowrap px-3 py-1.5 rounded font-mono text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                  activeSubcategory === sub.id
                    ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                    : 'bg-black/60 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                }`}
              >
                <span>{sub.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* No Results State */}
        {filteredProjects.length === 0 && (
          <div className="py-20 text-center border border-white/15 rounded-xl bg-darkcard">
            <i data-lucide="search-x" className="w-12 h-12 mx-auto text-white/30 mb-4"></i>
            <h3 className="text-xl font-bold uppercase font-sans text-white mb-2">No Artworks Found</h3>
            <p className="font-mono text-xs text-white/50 mb-6">Try clearing your search query or selecting a different category tab.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setActiveSubcategory('all');
                setSelectedYear('all');
              }}
              className="px-5 py-2.5 bg-accent text-black font-mono font-bold text-xs uppercase rounded hover:bg-white transition-colors"
            >
              RESET ALL FILTERS
            </button>
          </div>
        )}

        {/* Bento Grid View Mode */}
        {viewMode === 'bento' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentDisplaySet.map((project, idx) => {
              const isVideo = project.type === 'video';

              return (
                <ScrollRevealWrapper
                  key={project.id}
                  index={idx}
                  className="h-full"
                >
                  <div
                    onClick={() => {
                      AudioController.play('pop');
                      onSelectProject(project);
                    }}
                    onMouseEnter={() => {
                      setHoveredId(project.id);
                    }}
                    onMouseLeave={() => {
                      setHoveredId(null);
                    }}
                    data-cursor={isVideo ? 'PLAY' : 'VIEW'}
                    className="interactive-card group bg-darkcard/90 border border-white/15 hover:border-accent rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between h-full hover:shadow-[0_0_35px_rgba(0,255,102,0.2)] hover:-translate-y-1.5"
                  >
                    {/* Uncropped Artwork Frame */}
                    <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-[#141414] via-[#0a0a0a] to-[#040404] p-3 sm:p-4 flex items-center justify-center overflow-hidden border-b border-white/10">
                      {/* Subtle cyber background grid */}
                      <div className="absolute inset-0 bg-cyber-grid bg-[size:24px_24px] opacity-10 pointer-events-none" />

                      {/* Media (Strictly Uncropped with object-contain) */}
                      <img
                        src={isVideo ? (project.animated_preview || project.thumbnail || project.media) : (project.thumbnail || project.media)}
                        alt={project.client || 'Shoeab Portfolio Artwork'}
                        loading={idx < 6 ? "eager" : "lazy"}
                        decoding="async"
                        fetchpriority={idx < 2 ? "high" : "auto"}
                        className="w-full h-full object-contain object-center group-hover:scale-[1.03] transition-transform duration-500 rounded drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] z-10"
                        onError={(e) => {
                          if (project.thumbnail && e.target.src !== project.media) {
                            e.target.src = project.media;
                          }
                        }}
                      />

                      {/* Floating Category & Format Badges (Top) */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
                        <span className="font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-black/85 border border-white/20 text-accent backdrop-blur-md shadow-sm">
                          {project.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {project.variants && project.variants.length > 1 && (
                            <span className="font-mono text-[9px] uppercase font-black px-2 py-0.5 rounded bg-accent/25 border border-accent/60 text-accent flex items-center gap-1 backdrop-blur-md shadow-[0_0_10px_rgba(0,255,102,0.3)]">
                              ✦ {project.variants.length} SIZES
                            </span>
                          )}
                          <span className="font-mono text-[9px] uppercase text-white/70 px-2 py-0.5 rounded bg-black/85 border border-white/15 backdrop-blur-md">
                            {project.year || '2026'}
                          </span>
                        </div>
                      </div>

                      {/* Video Motion Badge (Bottom Left) */}
                      {isVideo && (
                        <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                          <span className="font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300 flex items-center gap-1 backdrop-blur-md shadow-sm">
                            <i data-lucide="play" className="w-2.5 h-2.5 fill-current"></i> 60FPS REEL
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Clean Metadata Info Strip Below Artwork */}
                    <div className="p-4 space-y-2 flex-grow flex flex-col justify-between bg-darkcard">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-accent tracking-wider uppercase font-bold truncate">
                            {project.client || 'Shoeab Shaikh'}
                          </span>
                          {project.subfolder && (
                            <span className="font-mono text-[10px] uppercase text-cyan-400 truncate max-w-[48%] font-semibold">
                              {project.subfolder.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>

                        {project.strategy && (
                          <p className="font-mono text-xs text-white/70 uppercase line-clamp-2 leading-relaxed pt-0.5 group-hover:text-white transition-colors">
                            {project.strategy}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10 font-mono text-xs">
                        <span className="text-[10px] text-white/40 uppercase truncate max-w-[65%]">
                          {project.tech || 'Photoshop, Illustrator'}
                        </span>

                        <span className="text-[11px] text-accent font-bold uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform flex-shrink-0">
                          <span>SPECS</span>
                          <i data-lucide="arrow-up-right" className="w-3.5 h-3.5"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollRevealWrapper>
              );
            })}
          </div>
        )}

        {/* Showcase View Mode */}
        {viewMode === 'showcase' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentDisplaySet.map((project, idx) => (
              <ScrollRevealWrapper key={project.id} index={idx} className="h-full">
                <div
                  onClick={() => {
                    AudioController.play('pop');
                    onSelectProject(project);
                  }}
                  data-cursor="VIEW"
                  className="group bg-darkcard border border-white/15 hover:border-accent rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full hover:shadow-[0_0_35px_rgba(0,255,102,0.2)] hover:-translate-y-1.5"
                >
                  {/* Showcase Uncropped Frame */}
                  <div className="relative aspect-[16/10] bg-gradient-to-b from-[#141414] via-[#0a0a0a] to-[#040404] p-4 sm:p-6 flex items-center justify-center overflow-hidden border-b border-white/10">
                    <div className="absolute inset-0 bg-cyber-grid bg-[size:24px_24px] opacity-10 pointer-events-none" />

                    <img
                      src={project.type === 'video' ? (project.animated_preview || project.thumbnail || project.media) : (project.thumbnail || project.media)}
                      alt={project.client || 'Shoeab Portfolio'}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain object-center group-hover:scale-[1.02] transition-transform duration-500 drop-shadow-2xl z-10"
                      onError={(e) => {
                        if (project.thumbnail && e.target.src !== project.media) {
                          e.target.src = project.media;
                        }
                      }}
                    />

                    <div className="absolute top-4 left-4 flex gap-2 flex-wrap z-20">
                      <span className="bg-black/85 border border-white/20 text-accent font-mono text-[10px] font-bold px-2.5 py-1 rounded uppercase backdrop-blur-md">
                        {project.category}
                      </span>
                      {project.variants && project.variants.length > 1 && (
                        <span className="bg-accent text-black font-mono text-[10px] font-black px-2.5 py-1 rounded uppercase shadow-[0_0_10px_rgba(0,255,102,0.3)]">
                          ✦ {project.variants.length} SIZES / FORMATS
                        </span>
                      )}
                      {project.subfolder && (
                        <span className="bg-black/85 border border-white/20 text-cyan-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded uppercase backdrop-blur-md">
                          {project.subfolder.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 bg-black/85 border border-white/20 text-white/80 font-mono text-[10px] px-2.5 py-1 rounded backdrop-blur-md z-20">
                      {project.year || '2026'}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-grow space-y-4 bg-darkcard">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs text-accent uppercase font-bold">
                          CLIENT: {project.client || 'Shoeab Shaikh'}
                        </span>
                        {project.subfolder && (
                          <span className="font-mono text-xs uppercase text-cyan-400 font-semibold">
                            {project.subfolder.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-sm text-white/90 uppercase line-clamp-3 leading-relaxed">
                        {project.strategy}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 font-mono text-xs">
                      <span className="text-white/40">{project.tech || 'Photoshop, Illustrator'}</span>
                      <span className="text-accent font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        VIEW CASE STUDY <i data-lucide="arrow-right" className="w-3.5 h-3.5"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollRevealWrapper>
            ))}
          </div>
        )}

        {/* Compact List View Mode */}
        {viewMode === 'list' && (
          <div className="border border-white/15 rounded-xl bg-darkcard divide-y divide-white/10 overflow-hidden">
            {currentDisplaySet.map((project, idx) => (
              <ScrollRevealWrapper key={project.id} index={idx}>
                <div
                  onClick={() => {
                    AudioController.play('pop');
                    onSelectProject(project);
                  }}
                  data-cursor="OPEN"
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/5 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-lg bg-black/90 flex-shrink-0 overflow-hidden border border-white/15 p-1 flex items-center justify-center">
                      <img
                        src={project.type === 'video' ? (project.animated_preview || project.thumbnail || project.media) : (project.thumbnail || project.media)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-white group-hover:text-accent transition-colors">
                        <span className="text-accent">{project.client || 'Shoeab Shaikh'}</span>
                        {project.subfolder && (
                          <>
                            <span className="text-white/30">•</span>
                            <span className="text-cyan-400">{project.subfolder.replace(/_/g, ' ')}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-white/60">{project.category}</span>
                      </div>
                      <p className="font-mono text-xs text-white/70 uppercase truncate max-w-xl mt-1">
                        {project.strategy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0 font-mono text-xs">
                    <span className="hidden md:inline text-white/40">{project.tech}</span>
                    <span className="text-white/70 bg-white/10 px-2.5 py-1 rounded">{project.year || '2026'}</span>
                    <i data-lucide="arrow-right" className="w-4 h-4 text-white/40 group-hover:text-accent group-hover:translate-x-1 transition-all"></i>
                  </div>
                </div>
              </ScrollRevealWrapper>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < filteredProjects.length && (
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                AudioController.play('pop');
                setVisibleCount((prev) => prev + 24);
              }}
              data-cursor="LOAD"
              className="px-8 py-4 bg-darkcard hover:bg-accent text-white hover:text-black border border-white/20 hover:border-accent font-mono text-xs font-black uppercase rounded transition-all duration-300 shadow-md inline-flex items-center gap-2"
            >
              <span>LOAD MORE DELIVERABLES</span>
              <i data-lucide="chevron-down" className="w-4 h-4"></i>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// 7. Interactive Project Detail Modal / Drawer with Multi-Size Suite
// -------------------------------------------------------------
function ProjectDetailModal({ project, onClose, onPrev, onNext }) {
  const [activeVariant, setActiveVariant] = useState(null);

  // Sync active variant when project changes
  useEffect(() => {
    if (project) {
      const defaultVar =
        project.variants && project.variants.length > 0
          ? project.variants[0]
          : {
              id: project.id,
              label: 'Main Artwork',
              media: project.media,
              type: project.type,
              ratio: 'Primary View'
            };
      setActiveVariant(defaultVar);
    }
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!project) return null;

  const currentItem = activeVariant || {
    media: project.media,
    type: project.type,
    label: 'Main Artwork',
    ratio: 'Primary Artwork'
  };

  const isVideo = currentItem.type === 'video';
  const isPdf = currentItem.type === 'pdf';
  const variants = project.variants || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fade-in">
      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-6xl max-h-[92vh] bg-darkcard border border-white/20 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-white/10 bg-black/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase font-bold text-accent px-2.5 py-1 rounded bg-accent/10 border border-accent/30">
              {project.category}
            </span>
            {variants.length > 1 && (
              <span className="font-mono text-xs text-white/80 px-2.5 py-1 rounded bg-white/10 border border-white/15 uppercase flex items-center gap-1">
                <span className="text-accent font-bold">✦ {variants.length} SIZES / FORMATS</span>
              </span>
            )}
            <span className="font-mono text-xs text-white/50 hidden md:inline uppercase">
              ID: {project.id ? project.id.slice(0, 8) : 'PROJ'}
            </span>
          </div>

          {/* Controls: Prev, Next, Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                AudioController.play('click');
                onPrev();
              }}
              data-cursor="PREV"
              className="p-2 text-white/60 hover:text-accent border border-white/15 hover:border-accent rounded bg-white/5 transition-colors"
              title="Previous Project (Left Arrow)"
            >
              <i data-lucide="arrow-left" className="w-4 h-4"></i>
            </button>
            <button
              onClick={() => {
                AudioController.play('click');
                onNext();
              }}
              data-cursor="NEXT"
              className="p-2 text-white/60 hover:text-accent border border-white/15 hover:border-accent rounded bg-white/5 transition-colors"
              title="Next Project (Right Arrow)"
            >
              <i data-lucide="arrow-right" className="w-4 h-4"></i>
            </button>
            <button
              onClick={() => {
                AudioController.play('click');
                onClose();
              }}
              data-cursor="CLOSE"
              className="p-2 text-white hover:text-red-400 border border-white/20 hover:border-red-400 rounded bg-white/10 transition-colors ml-2"
              title="Close (Esc)"
            >
              <i data-lucide="x" className="w-4 h-4"></i>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-grow p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Media Player / Viewer Left Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Active Display Window (Main Artwork on top) */}
            <div className="bg-black rounded-xl overflow-hidden border border-white/15 flex items-center justify-center min-h-[340px] max-h-[580px] relative group shadow-2xl">
              {(() => {
                const vId = currentItem.vimeo_id || parseVimeoId(currentItem.vimeo_url);
                if (vId) {
                  return <VimeoEmbed vimeoId={vId} autoplay={true} loop={true} muted={false} />;
                }
                if (isVideo) {
                  return (
                    <video
                      key={currentItem.media}
                      src={currentItem.media}
                      poster={currentItem.thumbnail || currentItem.animated_preview}
                      controls
                      autoPlay
                      playsInline
                      preload="auto"
                      className="w-full h-full max-h-[550px] object-contain"
                    />
                  );
                }
                if (isPdf) {
                  return (
                    <div className="p-8 text-center space-y-4">
                      <i data-lucide="file-text" className="w-16 h-16 mx-auto text-accent"></i>
                      <h4 className="font-bold text-white uppercase">{project.title}</h4>
                      <a
                        href={currentItem.media}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-black font-mono font-bold text-xs uppercase rounded"
                      >
                        <i data-lucide="download" className="w-4 h-4"></i> OPEN PDF PROFILE
                      </a>
                    </div>
                  );
                }
                return (
                  <img
                    key={currentItem.media}
                    src={currentItem.media}
                    alt={project.title}
                    className="w-full h-full max-h-[550px] object-contain transition-all duration-300"
                  />
                );
              })()}

              {/* Active Format Pill Indicator on Top of Media */}
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1 rounded font-mono text-[11px] font-bold text-accent uppercase flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                <span>{currentItem.label}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/80">{currentItem.ratio}</span>
              </div>
            </div>

            {/* Other Sizes / Formats of the Same Artwork Interactive Selector */}
            {variants.length > 1 && (
              <div className="bg-darkcard border border-white/15 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <i data-lucide="layout-template" className="w-3.5 h-3.5 text-accent"></i>
                    <span>AVAILABLE DELIVERABLE SIZES ({variants.length})</span>
                  </span>
                  <span className="font-mono text-[10px] text-white/40 uppercase">CLICK TO PREVIEW</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {variants.map((v, i) => {
                    const isSelected = currentItem.media === v.media;
                    return (
                      <button
                        key={v.id || i}
                        onClick={() => {
                          AudioController.play('pop');
                          setActiveVariant(v);
                        }}
                        data-cursor="SWITCH"
                        className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all duration-200 flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-accent/15 border-accent text-white shadow-[0_0_15px_rgba(0,255,102,0.25)]'
                            : 'bg-black/60 border-white/10 hover:border-white/30 text-white/70 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`font-bold text-[11px] uppercase truncate ${isSelected ? 'text-accent' : 'text-white'}`}>
                            {v.label}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 animate-ping"></span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-white/50 uppercase">
                          <span>{v.ratio}</span>
                          <span className="text-[9px] px-1 rounded bg-white/10">{v.type}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Project Dossier Right Column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="font-mono text-xs text-accent uppercase font-bold mb-1">
                CLIENT: {project.client || 'Shoeab Shaikh'}
              </div>
              <h2 className="font-black text-2xl sm:text-3xl uppercase tracking-tight text-white font-sans">
                {project.title}
              </h2>
            </div>

            {/* Strategic Intent */}
            <div className="border-l-2 border-accent pl-4 space-y-1">
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block">
                STRATEGIC EXECUTION
              </span>
              <p className="font-mono text-xs sm:text-sm text-white/90 uppercase leading-relaxed">
                {project.strategy || 'High-contrast brutalist design created for premier venue programming and branding.'}
              </p>
            </div>

            {/* Metadata Matrix */}
            <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-4 font-mono text-xs">
              <div>
                <span className="text-white/40 uppercase block text-[10px]">ROLE</span>
                <span className="text-white font-bold uppercase">{project.role || 'Visual Strategist'}</span>
              </div>
              <div>
                <span className="text-white/40 uppercase block text-[10px]">YEAR</span>
                <span className="text-white font-bold">{project.year || '2026'}</span>
              </div>
              <div>
                <span className="text-white/40 uppercase block text-[10px]">ACTIVE FORMAT</span>
                <span className="text-accent font-bold uppercase">{currentItem.label}</span>
              </div>
              <div>
                <span className="text-white/40 uppercase block text-[10px]">EDITION / SUBFOLDER</span>
                <span className="text-cyan-400 font-bold uppercase">{project.subfolder ? project.subfolder.replace(/_/g, ' ') : 'MAIN ARCHIVE'}</span>
              </div>
            </div>

            {/* Tech Stack Chips */}
            <div>
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block mb-2">
                TECHNICAL SOFTWARE STACK
              </span>
              <div className="flex flex-wrap gap-2">
                {(project.tech || 'Photoshop, Illustrator').split(',').map((t, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs px-3 py-1 bg-white/10 border border-white/20 rounded text-white uppercase"
                  >
                    {t.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Raw Asset Actions */}
            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + currentItem.media);
                  AudioController.play('success');
                  if (typeof confetti !== 'undefined') {
                    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
                  }
                }}
                data-cursor="COPY"
                className="w-full bg-accent hover:bg-white text-black font-mono text-xs font-black uppercase py-3.5 px-4 rounded transition-all duration-300 shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2"
                title="Copy Direct Link to Current Format"
              >
                <i data-lucide="share-2" className="w-4 h-4"></i>
                <span>SHARE &amp; COPY ASSET LINK ({currentItem.label.toUpperCase()})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 8. Skills & Matter.js Interactive 2D Sandbox
// -------------------------------------------------------------
function SkillsPlayground() {
  const playgroundRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);

  const [activeTab, setActiveTab] = useState('physics'); // 'physics' or 'proficiencies'
  const [gravityState, setGravityState] = useState('normal'); // 'normal', 'zero', 'invert'

  const TOOL_BADGES = useMemo(
    () => [
      { name: 'PHOTOSHOP', lines: ['PHOTOSHOP'], radius: 48, fill: '#00C8FF', text: '#000000' },
      { name: 'ILLUSTRATOR', lines: ['ILLUSTRATOR'], radius: 50, fill: '#FF9A00', text: '#000000' },
      { name: 'INDESIGN', lines: ['INDESIGN'], radius: 44, fill: '#FF3366', text: '#FFFFFF' },
      { name: 'PREMIERE PRO', lines: ['PREMIERE', 'PRO'], radius: 46, fill: '#EA77FF', text: '#000000' },
      { name: 'AFTER EFFECTS', lines: ['AFTER', 'EFFECTS'], radius: 48, fill: '#9999FF', text: '#000000' },
      { name: 'CORELDRAW', lines: ['COREL', 'DRAW'], radius: 46, fill: '#00E676', text: '#000000' },
      { name: 'CANVA', lines: ['CANVA'], radius: 38, fill: '#00C4CC', text: '#000000' },
      { name: 'FINAL CUT PRO', lines: ['FINAL CUT', 'PRO'], radius: 48, fill: '#00F0FF', text: '#000000' },
      { name: 'BRAND IDENTITY', lines: ['BRAND', 'IDENTITY'], radius: 52, fill: '#00FF66', text: '#000000' },
      { name: 'SOCIAL MEDIA', lines: ['SOCIAL', 'MEDIA'], radius: 50, fill: '#FFCC00', text: '#000000' },
      { name: 'PHOTOGRAPHY', lines: ['PHOTO-', 'GRAPHY'], radius: 48, fill: '#FFFFFF', text: '#000000' },
      { name: 'VIDEO EDITING', lines: ['VIDEO', 'EDITING'], radius: 48, fill: '#FF5500', text: '#FFFFFF' }
    ],
    []
  );

  useEffect(() => {
    if (activeTab !== 'physics' || typeof Matter === 'undefined' || !playgroundRef.current) return;

    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Body } = Matter;

    const container = playgroundRef.current;
    const width = container.clientWidth || 800;
    const height = 380;

    const engine = Engine.create({
      gravity: { x: 0, y: 1.0, scale: 0.001 }
    });
    engineRef.current = engine;

    const render = Render.create({
      element: container,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'transparent',
        showAngleIndicator: false
      }
    });
    renderRef.current = render;
    Render.run(render);

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // Walls
    const wallThick = 60;
    const ground = Bodies.rectangle(width / 2, height + wallThick / 2 - 4, width * 2, wallThick, {
      isStatic: true,
      render: { fillStyle: 'transparent' }
    });
    const ceiling = Bodies.rectangle(width / 2, -wallThick / 2, width * 2, wallThick, {
      isStatic: true,
      render: { fillStyle: 'transparent' }
    });
    const leftWall = Bodies.rectangle(-wallThick / 2, height / 2, wallThick, height * 2, {
      isStatic: true,
      render: { fillStyle: 'transparent' }
    });
    const rightWall = Bodies.rectangle(width + wallThick / 2, height / 2, wallThick, height * 2, {
      isStatic: true,
      render: { fillStyle: 'transparent' }
    });

    Composite.add(engine.world, [ground, ceiling, leftWall, rightWall]);

    // Spawn interactive circular tool bodies with tailored sizes inside canvas bounds
    const cols = Math.min(4, Math.max(2, Math.floor((width - 60) / 125)));
    const toolBodies = TOOL_BADGES.map((tool, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const startX = 65 + col * ((width - 130) / Math.max(1, cols - 1)) + (Math.random() * 20 - 10);
      const startY = 45 + row * 60 + (Math.random() * 10);

      const body = Bodies.circle(startX, startY, tool.radius, {
        restitution: 0.8,
        friction: 0.05,
        frictionAir: 0.012,
        density: 0.002,
        render: {
          fillStyle: tool.fill
        }
      });
      body.customTool = tool;
      body.radius = tool.radius;
      return body;
    });

    Composite.add(engine.world, toolBodies);

    // Custom render loop to draw crisp text centered inside circular badges (1 or 2 lines)
    Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      if (!ctx) return;

      const allBodies = Composite.allBodies(engine.world);
      allBodies.forEach((b) => {
        if (b.customTool) {
          const { x, y } = b.position;
          const angle = b.angle;
          const tool = b.customTool;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);

          // Draw subtle circular border ring
          ctx.beginPath();
          ctx.arc(0, 0, tool.radius - 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Render centered text (1 line or 2 lines)
          ctx.fillStyle = tool.text;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (tool.lines.length === 1) {
            const fontSize = tool.radius >= 48 ? '10px' : '9px';
            ctx.font = `900 ${fontSize} "Space Mono", monospace`;
            ctx.fillText(tool.lines[0], 0, 1);
          } else {
            const fontSize = tool.radius >= 48 ? '9.5px' : '8.5px';
            ctx.font = `900 ${fontSize} "Space Mono", monospace`;
            ctx.fillText(tool.lines[0], 0, -6.5);
            ctx.fillText(tool.lines[1], 0, 7.5);
          }

          ctx.restore();
        }
      });
    });

    // Mouse & Touch interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.25,
        render: { visible: false }
      }
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    Events.on(mouseConstraint, 'startdrag', () => AudioController.play('pop'));
    Events.on(mouseConstraint, 'enddrag', () => AudioController.play('toss'));

    const handleResize = () => {
      if (!container || !render.canvas) return;
      const newW = container.clientWidth;
      render.canvas.width = newW;
      Body.setPosition(ground, { x: newW / 2, y: height + wallThick / 2 - 4 });
      Body.setPosition(rightWall, { x: newW + wallThick / 2, y: height / 2 });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world);
      Engine.clear(engine);
      if (render.canvas) render.canvas.remove();
    };
  }, [activeTab, TOOL_BADGES]);

  const handleExplode = () => {
    AudioController.play('pop');
    if (!engineRef.current) return;
    const { Composite, Body } = Matter;
    const bodies = Composite.allBodies(engineRef.current.world).filter((b) => !b.isStatic);
    bodies.forEach((b) => {
      const angle = Math.random() * Math.PI * 2;
      Body.applyForce(b, b.position, {
        x: Math.cos(angle) * 0.08 * b.mass,
        y: Math.sin(angle) * 0.08 * b.mass - 0.06
      });
      Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.5);
    });
  };

  const setGravity = (type) => {
    AudioController.play('click');
    setGravityState(type);
    if (!engineRef.current) return;
    if (type === 'normal') engineRef.current.gravity.y = 1.0;
    if (type === 'zero') {
      engineRef.current.gravity.y = 0;
      handleExplode();
    }
    if (type === 'invert') engineRef.current.gravity.y = -1.1;
  };

  const proficiencies = [
    { name: 'Brand Identity & Social Media Design', level: 98, desc: 'Logo systems, social media campaigns, marketing collateral & brand guidelines (9+ years).' },
    { name: 'Adobe Creative Suite (Illustrator, Photoshop, InDesign)', level: 98, desc: 'Vector logos, photo manipulation, multi-page brochures, print packaging & prepress.' },
    { name: 'Video Editing & Motion (Premiere Pro, After Effects, Final Cut Pro)', level: 92, desc: 'Photo/video content, on-site live shoot production, sound-synced video reels & teasers.' },
    { name: 'CorelDraw, Canva & Signage Design', level: 94, desc: 'Shop boards, standees, hoardings, US cabinet/directional sign layouts & fast turnarounds.' }
  ];

  return (
    <section id="playground" className="py-24 bg-black/40 border-t border-white/15 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-white/15 pb-6">
          <div>
            <span className="font-mono text-xs text-accent uppercase block mb-1">// INTERACTIVE ARSENAL</span>
            <h2 className="font-black text-4xl sm:text-6xl uppercase tracking-normal text-white font-sans flex items-baseline gap-3.5 flex-wrap">
              <span className="tracking-tight">SKILLS &amp;</span> <SvgOutlinedWord text="PHYSICS" />
            </h2>
          </div>

          {/* Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                AudioController.play('click');
                setActiveTab('physics');
              }}
              data-cursor="PLAY"
              className={`px-4 py-2 font-mono text-xs font-bold uppercase rounded transition-colors ${
                activeTab === 'physics' ? 'bg-accent text-black' : 'bg-darkcard text-white/70 hover:text-white border border-white/15'
              }`}
            >
              2D KINETIC SANDBOX
            </button>
            <button
              onClick={() => {
                AudioController.play('click');
                setActiveTab('proficiencies');
              }}
              data-cursor="METRICS"
              className={`px-4 py-2 font-mono text-xs font-bold uppercase rounded transition-colors ${
                activeTab === 'proficiencies' ? 'bg-accent text-black' : 'bg-darkcard text-white/70 hover:text-white border border-white/15'
              }`}
            >
              PROFICIENCY BREAKDOWN
            </button>
          </div>
        </div>

        {activeTab === 'physics' ? (
          <div className="bg-darkcard border border-white/15 rounded-xl p-5 backdrop-blur-md relative shadow-2xl">
            {/* Sandbox Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
              <div className="font-mono text-xs text-white/70 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>INTERACT WITH TOOL BADGES • DRAG, FLICK &amp; COLLIDE</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setGravity('normal')}
                  className={`px-3 py-1.5 rounded font-mono text-xs uppercase font-bold transition-colors ${
                    gravityState === 'normal' ? 'bg-accent text-black' : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  NORMAL (9.8G)
                </button>
                <button
                  onClick={() => setGravity('zero')}
                  className={`px-3 py-1.5 rounded font-mono text-xs uppercase font-bold transition-colors ${
                    gravityState === 'zero' ? 'bg-accent text-black' : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  ZERO-G
                </button>
                <button
                  onClick={() => setGravity('invert')}
                  className={`px-3 py-1.5 rounded font-mono text-xs uppercase font-bold transition-colors ${
                    gravityState === 'invert' ? 'bg-accent text-black' : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  INVERT
                </button>
                <button
                  onClick={handleExplode}
                  data-cursor="BOOM"
                  className="px-3 py-1.5 bg-accent hover:bg-white text-black rounded font-mono text-xs font-black uppercase transition-colors flex items-center gap-1 shadow-sm"
                >
                  <i data-lucide="sparkles" className="w-3.5 h-3.5"></i>
                  <span>EXPLODE</span>
                </button>
              </div>
            </div>

            {/* Sandbox Canvas */}
            <div
              ref={playgroundRef}
              className="w-full h-[380px] cursor-grab active:cursor-grabbing relative overflow-hidden bg-black/40 rounded-lg border border-white/10"
              data-cursor="TOSS"
            />

            {/* Tool Arsenal Pills Strip */}
            <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between gap-3 flex-wrap">
              <span className="font-mono text-[11px] font-bold text-accent uppercase flex items-center gap-1.5">
                <i data-lucide="cpu" className="w-3.5 h-3.5"></i>
                ACTIVE CREATIVE ARSENAL (12):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {TOOL_BADGES.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      AudioController.play('pop');
                      handleExplode();
                    }}
                    data-cursor="TOSS"
                    style={{ backgroundColor: t.fill, color: t.text }}
                    className="font-mono text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-sm hover:scale-105 transition-transform"
                    title={`Toss ${t.name}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proficiencies.map((p, i) => (
              <div key={i} className="bg-darkcard border border-white/15 rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-white uppercase">{p.name}</span>
                  <span className="text-accent font-black text-base">{p.level}%</span>
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_#00FF66]"
                    style={{ width: `${p.level}%` }}
                  />
                </div>
                <p className="font-mono text-xs text-white/60 uppercase">{p.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// 9. Process & Milestones Timeline
// -------------------------------------------------------------
function ProcessTimeline() {
  const steps = [
    {
      num: '01',
      title: 'RESEARCH & STRATEGIC IMMERSION',
      desc: 'Deconstructing the artist, music tempo, audience demographics, and venue culture to establish an unmistakable visual tone.'
    },
    {
      num: '02',
      title: 'EXPERIMENTAL DECONSTRUCTION',
      desc: 'Exploring brutalist typography, dynamic grid tensions, analog textures, and high-impact color palettes.'
    },
    {
      num: '03',
      title: 'KINETIC MOTION & RIGGING',
      desc: 'Transforming static key-visuals into 60fps kinetic motion graphics, teasers, story reels, and LED stage loops.'
    },
    {
      num: '04',
      title: 'PRODUCTION & MULTI-FORMAT ROLLOUT',
      desc: 'Preparing ultra high-res print files, event calendar sunboard spreads, and digital social kits with zero compromise.'
    }
  ];

  return (
    <section id="timeline" className="py-24 border-t border-white/15 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <span className="font-mono text-xs text-accent uppercase block mb-1">// METHODOLOGY</span>
          <h2 className="font-black text-4xl sm:text-6xl uppercase tracking-normal text-white font-sans flex items-baseline gap-3.5 flex-wrap">
            <span className="tracking-tight">CREATIVE</span> <SvgOutlinedWord text="PROCESS" />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="bg-darkcard border border-white/15 hover:border-accent rounded-xl p-6 space-y-4 group transition-all duration-300 relative overflow-hidden"
            >
              <div className="font-black text-4xl text-white/20 group-hover:text-accent font-sans transition-colors">
                {s.num}
              </div>
              <h3 className="font-bold text-lg uppercase text-white tracking-tight group-hover:text-accent transition-colors font-sans">
                {s.title}
              </h3>
              <p className="font-mono text-xs text-white/70 uppercase leading-relaxed">
                {s.desc}
              </p>
              <div className="w-6 h-1 bg-white/20 group-hover:bg-accent transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// 10. About & Work Experience Timeline
// -------------------------------------------------------------
function AboutSection() {
  const experiences = [
    {
      role: 'Graphic Designer',
      company: 'VCK Brand Communications',
      period: 'OCT 2025 — MAR 2026',
      desc: 'Led social media design output for client brands and produced photo/video content on-site during live shoots. Coordinated with account teams to keep visual assets aligned to each client\'s brand guidelines.'
    },
    {
      role: 'Graphic Designer, Social Media Manager & Photographer',
      company: 'Bin Meshleh Holdings',
      period: 'APR 2025 — SEP 2025',
      desc: 'Designed posters and social campaigns for vehicles going to auction, managing photography end-to-end. Owned the full visual pipeline from shoot to final social post, reducing dependence on outside vendors.'
    },
    {
      role: 'Graphic Designer',
      company: 'AFp.net',
      badge: 'FREELANCE',
      period: 'FEB 2025 — MAR 2025',
      desc: 'Produced posters, social assets, and event tickets for music events across India on tight event timelines.'
    },
    {
      role: 'Graphic Designer',
      company: 'AlBuraq Venture Pvt. Ltd.',
      period: 'MAY 2024 — DEC 2024',
      desc: 'Owned brand consistency across logos, marketing collateral, and brochures for the company\'s visual identity. Partnered with the marketing team on go-to-market visuals for product launches.'
    },
    {
      role: 'Artwork Production Specialist',
      company: 'Unilever Pvt. Ltd. (Remote)',
      badge: 'ENTERPRISE FMCG',
      featured: true,
      period: 'FEB 2022 — AUG 2023',
      desc: 'Managed high-volume print and digital artwork compliance across Unilever\'s major global FMCG portfolio. Enforced strict multi-market brand guidelines, packaging color accuracy, and pre-press production standards.'
    },
    {
      role: 'Graphic Designer',
      company: 'F. Gheewala Human Resources',
      period: 'JUL 2021 — JAN 2022',
      desc: 'In-house designer for social media posts, brochures, and brand guideline documents.'
    },
    {
      role: 'Graphic Designer',
      company: 'Snoop Technologies Pvt. Ltd.',
      period: 'MAY 2019 — DEC 2020',
      desc: 'Designed logos, flyers, product packaging, and brochures using Adobe Creative Suite; edited video in Premiere Pro, After Effects, and Final Cut Pro.'
    },
    {
      role: 'Graphic Designer',
      company: 'Teknovance Pvt. Ltd.',
      badge: 'CONTRACT',
      period: 'DEC 2018 — FEB 2019',
      desc: 'Designed signage, cabinet, and directional sign layouts for a US-based client using CorelDraw and Illustrator.'
    },
    {
      role: 'Graphic Designer',
      company: 'Shabab Digital',
      period: 'JAN 2011 — AUG 2014',
      desc: 'Designed and produced shop boards, standees, and hoardings in CorelDraw and Photoshop per customer requirements.'
    }
  ];

  return (
    <section id="about" className="py-24 border-t border-white/15 bg-black/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Bio & Philosophy */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="flex items-center gap-2 font-mono text-xs text-accent uppercase">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>// PROFILE &amp; PHILOSOPHY</span>
            </div>
            <h2 className="font-black text-4xl sm:text-6xl uppercase tracking-tighter text-white font-sans leading-none">
              SHOEAB <br /><span className="text-accent">AHMED</span>
            </h2>

            {/* Quick Profile Specs */}
            <div className="grid grid-cols-2 gap-2 bg-darkcard border border-white/10 p-3 rounded-xl font-mono text-center">
              <div className="p-2 border-r border-white/10">
                <span className="text-[9px] text-white/40 block uppercase">LOCATION</span>
                <span className="text-xs text-white font-bold uppercase">MUMBAI, INDIA</span>
              </div>
              <div className="p-2">
                <span className="text-[9px] text-white/40 block uppercase">EXPERIENCE</span>
                <span className="text-xs text-accent font-black uppercase">9+ YRS</span>
              </div>
            </div>

            <p className="font-mono text-sm sm:text-base text-white/90 uppercase leading-relaxed border-l-2 border-accent pl-4">
              Graphic Designer specializing in brand identity, social media design &amp; photography. 9+ years turning marketing goals into visuals that ship on time.
            </p>
            <p className="font-mono text-xs sm:text-sm text-white/60 uppercase leading-relaxed">
              A versatile mix of branding, photography, and social content design — built on 9+ years of keeping visual identity consistent across every channel.
            </p>

            {/* Languages Bar */}
            <div className="p-4 bg-darkcard border border-white/10 rounded-xl space-y-2">
              <span className="font-mono text-[10px] text-accent uppercase font-bold tracking-wider flex items-center gap-1.5">
                <i data-lucide="globe" className="w-3.5 h-3.5"></i> SPOKEN LANGUAGES (4):
              </span>
              <div className="flex flex-wrap gap-2">
                {['ENGLISH', 'HINDI', 'MARATHI', 'URDU'].map((lang, idx) => (
                  <span key={idx} className="font-mono text-[10px] uppercase font-bold px-2.5 py-1 bg-white/10 border border-white/15 text-white rounded">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Education Box */}
            <div className="p-4 bg-darkcard border border-white/10 rounded-xl space-y-3">
              <span className="font-mono text-[10px] text-accent uppercase font-bold tracking-wider flex items-center gap-1.5">
                <i data-lucide="graduation-cap" className="w-3.5 h-3.5"></i> EDUCATION &amp; FOUNDATIONS
              </span>
              <div className="space-y-3 divide-y divide-white/10 font-mono text-xs">
                <div className="pt-1">
                  <span className="text-white font-bold uppercase block">Maharashtra College of Arts, Commerce &amp; Science</span>
                  <span className="text-white/50 text-[11px] uppercase block">B.Sc. Computer Science • Graduated 2017</span>
                  <span className="text-accent/80 text-[10px] uppercase block pt-1 leading-relaxed">
                    • 2011–2017: Pursued degree concurrently while executing commercial graphic design, signage, and print production contracts.
                  </span>
                </div>
                <div className="pt-2">
                  <span className="text-white font-bold uppercase block">M.H. Saboo Siddik Junior College</span>
                  <span className="text-white/50 text-[11px] uppercase">HSC — Science • 2011</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Work Experience Timeline */}
          <div className="lg:col-span-7 bg-darkcard border border-white/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-mono text-xs text-accent uppercase tracking-widest font-bold flex items-center gap-2">
                <i data-lucide="briefcase" className="w-4 h-4 text-accent"></i>
                <span>WORK EXPERIENCE &amp; CLIENT ENGAGEMENTS</span>
              </h3>
              <span className="font-mono text-[10px] text-white/40 uppercase">2011 — PRESENT</span>
            </div>

            {/* Featured Enterprise Credential Spotlight Banner */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-950/40 via-darkcard to-darkcard border border-blue-400/40 space-y-2.5 relative overflow-hidden shadow-[0_0_25px_rgba(59,130,246,0.12)]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                  <i data-lucide="shield-check" className="w-3.5 h-3.5 text-blue-400"></i>
                  <span>FEATURED ENTERPRISE CREDENTIAL</span>
                </div>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-blue-400/15 border border-blue-400/40 text-blue-300 font-bold uppercase tracking-wider">
                  18-MONTH ENGAGEMENT
                </span>
              </div>
              <h4 className="font-sans font-black text-base sm:text-lg text-white uppercase tracking-tight">
                Artwork Production Specialist // Unilever Pvt. Ltd.
              </h4>
              <p className="font-mono text-xs text-white/70 uppercase leading-relaxed">
                Managed print &amp; digital artwork compliance across Unilever’s global FMCG portfolio. Demonstrates the technical discipline to execute cleanly and reliably inside enterprise brand guidelines with zero margin for error.
              </p>
            </div>

            <div className="space-y-6 divide-y divide-white/10">
              {experiences.map((exp, idx) => (
                <div key={idx} className={`${idx !== 0 ? 'pt-6' : ''} space-y-2 group ${exp.featured ? 'border-l-2 border-blue-400/80 pl-4 -ml-4 py-2 bg-blue-950/10 rounded-r-lg' : ''}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-lg sm:text-xl text-white uppercase tracking-tight group-hover:text-accent transition-colors font-sans flex items-center gap-2">
                        <span>{exp.role}</span>
                        {exp.featured && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        )}
                      </h4>
                      <div className="font-mono text-xs text-accent/90 uppercase font-bold flex items-center gap-2 mt-0.5">
                        <span>{exp.company}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {exp.badge && (
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          exp.badge === 'CONTRACT'
                            ? 'bg-amber-400/15 border border-amber-400/40 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                            : exp.badge === 'ENTERPRISE FMCG'
                            ? 'bg-blue-400/15 border border-blue-400/40 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                            : 'bg-cyan-400/15 border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                        }`}>
                          {exp.badge}
                        </span>
                      )}
                      <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-accent/15 border border-accent/30 text-accent font-bold uppercase">
                        {exp.period}
                      </span>
                    </div>
                  </div>

                  <p className="font-mono text-xs text-white/70 uppercase leading-relaxed pt-1">
                    {exp.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// 11. Infinite Kinetic Marquee
// -------------------------------------------------------------
function MarqueeBanner() {
  const items = [
    'SHOEAB AHMED',
    'GRAPHIC DESIGNER',
    'BRAND IDENTITY',
    'SOCIAL MEDIA DESIGN',
    'PHOTOGRAPHY',
    'VIDEO EDITING',
    '9+ YEARS EXPERIENCE',
    'MUMBAI // INDIA'
  ];

  return (
    <div className="border-y border-white/20 bg-accent text-black py-4 overflow-hidden select-none">
      <div className="flex gap-8 whitespace-nowrap animate-marquee font-sans font-black text-2xl sm:text-3xl tracking-tighter uppercase">
        {[...items, ...items, ...items].map((t, idx) => (
          <div key={idx} className="flex items-center gap-8">
            <span>{t}</span>
            <span>★</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 12. Contact & Quick Copy Section
// -------------------------------------------------------------
function ContactSection() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const emailAddress = 'shoeab2007@gmail.com';
  const phone1 = '+91 90822 67615';

  const copyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(true);
    AudioController.play('success');
    if (typeof confetti !== 'undefined') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(phone1);
    setCopiedPhone(true);
    AudioController.play('success');
    if (typeof confetti !== 'undefined') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }
    setTimeout(() => setCopiedPhone(false), 3000);
  };

  return (
    <section id="contact" className="py-24 border-t border-white/15 relative overflow-hidden bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Direct Action & Headline */}
          <div className="lg:col-span-6 space-y-8 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="font-mono text-xs text-accent uppercase tracking-widest block font-bold">
                // INITIATE COLLABORATION
              </span>
              <h2 className="font-black text-5xl sm:text-7xl uppercase tracking-tighter text-white font-sans leading-[0.9]">
                LET&apos;S CREATE <br /><span className="text-accent">TOGETHER</span>
              </h2>
              <p className="font-mono text-sm sm:text-base text-white/80 uppercase leading-relaxed pt-2 border-l-2 border-accent pl-4">
                Open to brand identity design, social campaign rollouts, photography, and kinetic motion graphics. Turning marketing goals into visuals that ship on time.
              </p>
            </div>

            {/* Quick 1-Click Copy Contact Pills */}
            <div className="space-y-4 pt-2">
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block">
                DIRECT CONTACT (1-CLICK COPY &amp; CONNECT)
              </span>

              {/* Email 1-Click Copy */}
              <button
                onClick={copyEmail}
                data-cursor={copiedEmail ? 'COPIED!' : 'COPY EMAIL'}
                className="w-full px-6 py-4 rounded-xl bg-darkcard border border-white/20 hover:border-accent font-mono text-sm text-white flex items-center justify-between gap-4 transition-all duration-300 group shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    <i data-lucide="mail" className="w-4 h-4"></i>
                  </div>
                  <span className="font-bold font-sans tracking-wide text-white group-hover:text-accent transition-colors text-base">
                    {emailAddress}
                  </span>
                </div>
                <span
                  className={`text-xs px-3 py-1.5 rounded font-bold uppercase transition-all ${
                    copiedEmail ? 'bg-accent text-black font-black' : 'bg-white/10 text-white/70 group-hover:bg-accent group-hover:text-black'
                  }`}
                >
                  {copiedEmail ? '✓ COPIED' : 'COPY EMAIL'}
                </span>
              </button>

              {/* Phone / WhatsApp 1-Click Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={copyPhone}
                  data-cursor={copiedPhone ? 'COPIED!' : 'COPY NUMBER'}
                  className="px-5 py-3.5 rounded-xl bg-darkcard border border-white/20 hover:border-accent font-mono text-xs text-white flex items-center justify-between transition-colors shadow-md group"
                >
                  <div className="flex items-center gap-2.5">
                    <i data-lucide="phone" className="w-4 h-4 text-accent"></i>
                    <span className="font-bold text-white group-hover:text-accent transition-colors">{phone1}</span>
                  </div>
                  <span className="text-[10px] text-white/50 group-hover:text-white uppercase">
                    {copiedPhone ? '✓' : 'IND'}
                  </span>
                </button>

                <a
                  href="https://wa.me/919082267615"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="WHATSAPP"
                  className="px-5 py-3.5 rounded-xl bg-darkcard border border-white/20 hover:border-emerald-400 font-mono text-xs text-white flex items-center justify-between transition-colors shadow-md group"
                >
                  <div className="flex items-center gap-2.5">
                    <i data-lucide="message-circle" className="w-4 h-4 text-emerald-400"></i>
                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">WHATSAPP CHAT</span>
                  </div>
                  <i data-lucide="arrow-up-right" className="w-3.5 h-3.5 text-white/50 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
                </a>
              </div>
            </div>

            {/* Creative Networks */}
            <div className="space-y-3 pt-2">
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block">
                CREATIVE &amp; PROFESSIONAL NETWORKS
              </span>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.linkedin.com/in/shaikhshoeab/"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="LINKEDIN"
                  className="font-mono text-xs px-5 py-2.5 bg-darkcard border border-white/20 hover:border-accent hover:text-accent rounded-xl text-white/90 transition-all uppercase font-bold flex items-center gap-2 shadow-sm"
                >
                  <i data-lucide="linkedin" className="w-3.5 h-3.5 text-accent"></i>
                  <span>LINKEDIN // SHAIKHSHOEAB</span>
                  <span>↗</span>
                </a>
                <a
                  href="https://behance.net/shoeabshaikh"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="BEHANCE"
                  className="font-mono text-xs px-5 py-2.5 bg-darkcard border border-white/20 hover:border-accent hover:text-accent rounded-xl text-white/90 transition-all uppercase font-bold flex items-center gap-2 shadow-sm"
                >
                  <i data-lucide="sparkles" className="w-3.5 h-3.5 text-accent"></i>
                  <span>BEHANCE // SHOEABSHAIKH</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Collaboration Card */}
          <div className="lg:col-span-6 bg-darkcard border border-white/20 rounded-2xl p-6 sm:p-8 relative backdrop-blur-xl flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 font-mono text-xs text-accent font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span>COMMISSION &amp; WORK SPECS</span>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-accent/15 border border-accent/30 text-accent font-bold uppercase">
                  ACTIVE AVAILABILITY
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 bg-black/60 border border-white/10 rounded-xl space-y-1">
                  <span className="text-[10px] text-white/40 uppercase block">AVAILABILITY STATUS</span>
                  <p className="text-white font-bold text-sm uppercase">OPEN FOR Q3 / Q4 2026 PROJECTS &amp; FULL-TIME ROLES</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] text-white/40 uppercase block">EXPERIENCE</span>
                    <span className="text-accent font-black text-sm uppercase">9+ YEARS VERIFIED</span>
                  </div>
                  <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] text-white/40 uppercase block">LOCATION</span>
                    <span className="text-white font-bold text-sm uppercase">MUMBAI (REMOTE)</span>
                  </div>
                </div>

                <div className="p-4 bg-black/60 border border-white/10 rounded-xl space-y-2">
                  <span className="text-[10px] text-accent uppercase font-bold tracking-wider block">
                    CORE SPECIALIZATIONS &amp; SERVICES:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-white/80 text-[11px] uppercase">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      <span>Brand Identity</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      <span>Social Media Design</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      <span>Commercial Photography</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      <span>Video &amp; Motion Editing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      <span>Print &amp; Packaging</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      <span>Signage / OOH Layouts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Instant Action CTAs */}
            <div className="space-y-3 pt-6 border-t border-white/10">
              <a
                href={`mailto:${emailAddress}?subject=Project%20Inquiry%20//%20Shoeab%20Ahmed`}
                data-cursor="EMAIL"
                className="w-full bg-accent hover:bg-white text-black font-mono text-xs font-black uppercase py-4 px-6 rounded-xl transition-all duration-300 shadow-[0_0_25px_rgba(0,255,102,0.35)] flex items-center justify-center gap-2 group text-center"
              >
                <span>INITIATE EMAIL DIRECTLY</span>
                <i data-lucide="arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
              </a>

              <a
                href="https://www.linkedin.com/in/shaikhshoeab/"
                target="_blank"
                rel="noreferrer"
                data-cursor="LINKEDIN"
                className="w-full bg-white/5 hover:bg-white/15 text-white border border-white/20 font-mono text-xs font-bold uppercase py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-center"
              >
                <i data-lucide="linkedin" className="w-4 h-4 text-accent"></i>
                <span>CONNECT ON LINKEDIN</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// 13. Admin Passkey Auth & Upload Gate
// -------------------------------------------------------------
function AdminUploadModal({ isOpen, onClose, onRefreshProjects }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('shoeab_admin_authenticated') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Gig Posters');
  const [client, setClient] = useState('');
  const [role, setRole] = useState('Visual Strategist & Art Director');
  const [year, setYear] = useState('2026');
  const [strategy, setStrategy] = useState('');
  const [tech, setTech] = useState('Photoshop, Illustrator');
  const [file, setFile] = useState(null);
  const [vimeoUrl, setVimeoUrl] = useState('');

  if (!isOpen) return null;

  const handlePasskeySubmit = (e) => {
    e.preventDefault();
    if (passkeyInput.trim().toUpperCase() === 'SHOEAB2026') {
      setIsAuthenticated(true);
      setAuthError('');
      try {
        localStorage.setItem('shoeab_admin_authenticated', 'true');
      } catch (err) {}
      AudioController.play('success');
    } else {
      setAuthError('INVALID PASSKEY. ACCESS RESTRICTED TO PORTFOLIO OWNER.');
      AudioController.play('pop');
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setPasskeyInput('');
    try {
      localStorage.removeItem('shoeab_admin_authenticated');
    } catch (err) {}
    AudioController.play('click');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file && !vimeoUrl.trim()) {
      setUploadError('Please select a media file OR enter a Vimeo Video Link.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const data = new FormData();
      data.append('title', title);
      data.append('category', category);
      data.append('client', client || 'Shoeab Shaikh');
      data.append('role', role);
      data.append('year', year);
      data.append('strategy', strategy || 'Curated portfolio piece.');
      data.append('tech', tech);
      if (vimeoUrl.trim()) {
        data.append('vimeo_url', vimeoUrl.trim());
      }
      if (file) {
        data.append('file', file);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      });

      if (!res.ok) {
        throw new Error('Upload failed on server. (Note: On static GitHub Pages, uploads are managed via Git repository commits).');
      }

      AudioController.play('success');
      setUploadSuccess(true);
      if (typeof confetti !== 'undefined') {
        confetti({ particleCount: 50, spread: 70 });
      }

      setTimeout(() => {
        setUploadSuccess(false);
        onRefreshProjects();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Failed to upload. Ensure server.py is running locally.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-darkcard border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 font-mono text-xs text-accent font-bold uppercase">
            <i data-lucide={isAuthenticated ? "unlock" : "lock"} className="w-4 h-4 text-accent"></i>
            <span>{isAuthenticated ? 'ADMIN PORTFOLIO UPLOAD' : 'SECURITY GATE // OWNER ACCESS'}</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={handleSignOut}
                className="font-mono text-[10px] text-red-400 hover:text-red-300 uppercase px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10"
              >
                LOCK SESSION
              </button>
            )}
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <i data-lucide="x" className="w-4 h-4"></i>
            </button>
          </div>
        </div>

        {/* Auth Gate Screen */}
        {!isAuthenticated ? (
          <form onSubmit={handlePasskeySubmit} className="space-y-4 font-mono">
            <div className="text-center space-y-2 py-2">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 text-accent flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,255,102,0.2)]">
                <i data-lucide="shield-alert" className="w-6 h-6"></i>
              </div>
              <h3 className="font-sans font-black text-xl text-white uppercase tracking-tight">RESTRICTED ADMIN ACCESS</h3>
              <p className="text-xs text-white/60 uppercase max-w-xs mx-auto leading-relaxed">
                The upload system is restricted to the portfolio owner. Enter your master passkey to unlock.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/15 border border-red-500/50 text-red-300 text-xs rounded-xl font-bold uppercase text-center animate-shake">
                {authError}
              </div>
            )}

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] text-white/50 uppercase tracking-wider block">ENTER MASTER PASSKEY</label>
              <input
                type="password"
                required
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/70 border border-white/20 focus:border-accent rounded-xl p-3.5 text-white font-mono text-sm tracking-widest text-center focus:outline-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              data-cursor="UNLOCK"
              className="w-full bg-accent hover:bg-white text-black font-black uppercase py-4 rounded-xl transition-all duration-300 shadow-[0_0_25px_rgba(0,255,102,0.35)] flex items-center justify-center gap-2 text-xs mt-2"
            >
              <span>AUTHORIZE &amp; UNLOCK</span>
              <i data-lucide="key" className="w-4 h-4"></i>
            </button>
          </form>
        ) : uploadSuccess ? (
          <div className="py-8 text-center space-y-3 font-mono">
            <i data-lucide="check-circle" className="w-12 h-12 text-accent mx-auto"></i>
            <h4 className="text-lg font-bold uppercase text-white font-sans">UPLOAD COMPLETE</h4>
            <p className="text-xs text-white/60 uppercase">Gallery is updating in realtime...</p>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-4 font-mono text-xs">
            {uploadError && (
              <div className="p-2.5 bg-red-500/20 border border-red-500 text-red-300 text-[11px] rounded-xl">
                {uploadError}
              </div>
            )}

            <div className="space-y-3 p-3 bg-black/40 border border-white/10 rounded-xl">
              <div>
                <label className="text-white/70 block mb-1 uppercase text-[10px] font-bold">OPTION A: UPLOAD LOCAL MEDIA FILE</label>
                <input
                  type="file"
                  accept="image/*,video/mp4,application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full bg-black/60 border border-white/20 p-2 rounded-xl text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-accent file:text-black cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase font-bold">
                <div className="flex-grow h-px bg-white/10" />
                <span>OR</span>
                <div className="flex-grow h-px bg-white/10" />
              </div>

              <div>
                <label className="text-cyan-400 block mb-1 uppercase text-[10px] font-bold flex items-center gap-1.5">
                  <i data-lucide="video" className="w-3.5 h-3.5"></i>
                  OPTION B: VIMEO VIDEO LINK / ID
                </label>
                <input
                  type="text"
                  value={vimeoUrl}
                  onChange={(e) => setVimeoUrl(e.target.value)}
                  placeholder="https://vimeo.com/123456789 or Video ID"
                  className="w-full bg-black/60 border border-cyan-400/40 focus:border-cyan-400 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 block mb-1 uppercase text-[10px]">TITLE *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Neon Horizon"
                  className="w-full bg-black/60 border border-white/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-white/50 block mb-1 uppercase text-[10px]">CATEGORY *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl p-2.5 text-white uppercase focus:outline-none"
                >
                  <option>Gig Posters</option>
                  <option>Campaigns &amp; Promos</option>
                  <option>Event Calendars</option>
                  <option>Brochures</option>
                  <option>Branding</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 block mb-1 uppercase text-[10px]">CLIENT</label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="antiSOCIAL, KharSOCIAL..."
                  className="w-full bg-black/60 border border-white/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-white/50 block mb-1 uppercase text-[10px]">YEAR</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="text-white/50 block mb-1 uppercase text-[10px]">STRATEGY / BRIEF NOTES</label>
              <textarea
                rows="2"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder="Visual direction or event brief..."
                className="w-full bg-black/60 border border-white/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-accent"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-accent hover:bg-white text-black font-black uppercase py-3.5 rounded-xl transition-colors disabled:opacity-50 text-xs"
            >
              {uploading ? 'PROCESSING UPLOAD...' : 'CONFIRM & ADD TO ARCHIVE'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 14. Footer Component
// -------------------------------------------------------------
function Footer({ onOpenUpload }) {
  const scrollToTop = () => {
    AudioController.play('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/15 bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-white/50 uppercase">
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              if (onOpenUpload) {
                AudioController.play('pop');
                onOpenUpload();
              }
            }}
            title="System Gateway"
            className="w-2.5 h-2.5 rounded-sm bg-accent rotate-45 cursor-pointer hover:scale-125 transition-transform"
          />
          <span className="font-bold text-white tracking-wider font-sans">
            SHOEAB AHMED // GRAPHIC DESIGNER &amp; VISUAL STRATEGIST
          </span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-6">
          <span>REACT 18 • TAILWIND • MATTER.JS</span>
          <button
            onClick={scrollToTop}
            data-cursor="TOP"
            className="text-white hover:text-accent flex items-center gap-1.5 transition-colors border border-white/20 px-3 py-1.5 rounded"
          >
            <span>BACK TO TOP</span>
            <i data-lucide="arrow-up" className="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    </footer>
  );
}

// -------------------------------------------------------------
// 15. Main Root Application Orchestrator
// -------------------------------------------------------------
function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('bento');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Secret admin shortcut: Ctrl+Shift+A (or Cmd+Shift+A) or URL hash #admin
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        AudioController.play('pop');
        setUploadOpen(true);
      }
    };
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setUploadOpen(true);
      }
    };
    handleHash();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHash);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  // Fetch projects database with relative path normalization for GitHub Pages / Custom Domains
  const loadProjects = useCallback(async () => {
    try {
      const endpoints = [
        `./website/projects.json?t=${Date.now()}`,
        `website/projects.json?t=${Date.now()}`,
        `/website/projects.json?t=${Date.now()}`,
        `./data/projects.json?t=${Date.now()}`,
        `data/projects.json?t=${Date.now()}`,
        `/data/projects.json?t=${Date.now()}`,
        `projects.json?t=${Date.now()}`
      ];
      let data = null;
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch (e) {}
      }
      if (!data) throw new Error('Could not load projects.json from any known endpoint');

      const resolveMedia = (u) => {
        if (!u) return '';
        if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:') || u.startsWith('blob:')) return u;
        const clean = u.startsWith('/') ? u.slice(1) : u;
        return './' + clean;
      };

      const normalized = data
        .filter((p) => !p.media?.includes('_thumb') && !p.media?.includes('_anim'))
        .map((p) => ({
          ...p,
          media: resolveMedia(p.media),
          thumbnail: resolveMedia(p.thumbnail || p.media),
          animated_preview: resolveMedia(p.animated_preview || p.thumbnail || p.media),
          variants: (p.variants || [])
            .filter((v) => !v.media?.includes('_thumb') && !v.media?.includes('_anim'))
            .map((v) => ({
              ...v,
              media: resolveMedia(v.media),
              thumbnail: resolveMedia(v.thumbnail || v.media),
              animated_preview: resolveMedia(v.animated_preview || v.thumbnail || v.media)
            }))
        }));

      setProjects(normalized);
    } catch (err) {
      console.error("Error loading portfolio dataset:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Trigger Lucide icon parsing on every state update
  useEffect(() => {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  });

  const handleNextProject = () => {
    if (!selectedProject || projects.length === 0) return;
    const currIdx = projects.findIndex((p) => p.id === selectedProject.id);
    const nextIdx = (currIdx + 1) % projects.length;
    setSelectedProject(projects[nextIdx]);
  };

  const handlePrevProject = () => {
    if (!selectedProject || projects.length === 0) return;
    const currIdx = projects.findIndex((p) => p.id === selectedProject.id);
    const prevIdx = (currIdx - 1 + projects.length) % projects.length;
    setSelectedProject(projects[prevIdx]);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-black flex flex-col font-sans relative overflow-x-hidden">
      {/* Custom Kinetic Cursor */}
      <CustomCursor />

      {/* Navigation Bar */}
      <Navbar
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenUpload={() => setUploadOpen(true)}
        totalCount={projects.length}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <HeroSection
          totalCount={projects.length}
          onExplore={() => {
            const el = document.getElementById('projects');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <BentoProjectsGrid
          projects={projects}
          onSelectProject={(p) => setSelectedProject(p)}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <SkillsPlayground />

        <ProcessTimeline />

        <AboutSection />

        <MarqueeBanner />

        <ContactSection />
      </main>

      {/* Project Case Study Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onPrev={handlePrevProject}
          onNext={handleNextProject}
        />
      )}

      {/* Admin Upload Modal */}
      <AdminUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onRefreshProjects={loadProjects}
      />

      {/* Brutalist Footer */}
      <Footer onOpenUpload={() => setUploadOpen(true)} />
    </div>
  );
}

// Mount React Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
