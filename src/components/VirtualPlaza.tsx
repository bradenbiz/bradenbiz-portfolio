"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

interface PortfolioItem {
  title: string;
  description: string;
  url: string;
  color: string;
  accentColor: string;
  screenshot: string;
}

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    title: "Drone Drop Delivery",
    description: "Drone-based gift delivery service for last-minute Christmas shoppers",
    url: "https://drone-drop-delivery.vercel.app/",
    color: "#1a1a2e",
    accentColor: "#e94560",
    screenshot: "/screenshots/drone-drop-delivery.png",
  },
  {
    title: "Right Hand",
    description: "Automated charitable giving platform — give without knowing",
    url: "https://right-hand-nine.vercel.app",
    color: "#0f3460",
    accentColor: "#16c79a",
    screenshot: "/screenshots/right-hand.png",
  },
  {
    title: "Bravo Painting",
    description: "Professional paint job estimation tool for contractors and painters",
    url: "https://bravo-painting-estimator.vercel.app/",
    color: "#2b2024",
    accentColor: "#ff6b6b",
    screenshot: "/screenshots/bravo-painting.png",
  },
  {
    title: "DPC Easy",
    description: "Connect patients with Direct Primary Care doctors for affordable healthcare",
    url: "https://dpceasy.com",
    color: "#1b1b2f",
    accentColor: "#e2a63b",
    screenshot: "/screenshots/dpc-easy.png",
  },
  {
    title: "Fill My DPC",
    description: "Patient acquisition and marketing platform for DPC practices",
    url: "https://fillmydpc.com",
    color: "#162447",
    accentColor: "#c780fa",
    screenshot: "/screenshots/fill-my-dpc.png",
  },
  {
    title: "Priced in Gold",
    description: "Chrome extension that converts USD prices to their equivalent in gold",
    url: "https://chromewebstore.google.com/detail/priced-in-gold/fedgkhdmbjfedgfjiadialikalpfoikc",
    color: "#1a2e1a",
    accentColor: "#ffd700",
    screenshot: "/screenshots/priced-in-gold.png",
  },
];

// Mall dimensions
const MALL_WIDTH = 60;
const MALL_HEIGHT = 45;
const STOREFRONT_SPACING = 70;
const STOREFRONT_WIDTH = 45;
const STOREFRONT_HEIGHT = 25;
const ALCOVE_DEPTH = 8;
const WALL_X = MALL_WIDTH / 2;

// Dead mall color palette
const PALETTE = {
  floor1: 0x1a1028,     // dark purple-black tile
  floor2: 0x120e1e,     // slightly darker tile
  grout: 0x2a1f3d,      // purple grout lines
  ceiling: 0x0d0a14,    // very dark ceiling
  wall: 0x1e1630,       // dark purple walls
  wallAccent: 0x2a1f45,  // slightly lighter wall
  pillar: 0x2d2245,     // pillars
  neonPink: 0xff69b4,
  neonTeal: 0x00e5cc,
  neonPurple: 0xb366ff,
  fluorescent: 0xeeffdd, // yellowish fluorescent panel
  bench: 0x00bfa5,      // teal Memphis bench
  planter: 0x2d1b4e,    // dark purple planter
  plant: 0x00d4aa,      // teal-green plant
  truss: 0x1a1428,      // dark exposed ceiling truss
};

function createNeonSignTexture(title: string, accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 80;
  const ctx = canvas.getContext("2d")!;

  // Transparent-ish dark background
  ctx.fillStyle = "rgba(10,6,20,0.85)";
  ctx.fillRect(0, 0, 512, 80);

  // Neon glow effect
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 20;
  ctx.fillStyle = accentColor;
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title.toUpperCase(), 256, 52);
  // Double pass for extra glow
  ctx.fillText(title.toUpperCase(), 256, 52);

  ctx.shadowBlur = 0;

  // Thin neon border line at bottom
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 10;
  ctx.fillStyle = accentColor;
  ctx.fillRect(20, 70, 472, 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function createFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Dark checkerboard with purple/teal accents
  const tileSize = 64;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const light = (row + col) % 2 === 0;
      ctx.fillStyle = light ? "#1e1535" : "#120e20";
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      // Thin teal grout lines
      ctx.strokeStyle = "#2a1f4a";
      ctx.lineWidth = 1;
      ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }

  // Occasional teal accent tile
  ctx.fillStyle = "rgba(0,229,204,0.06)";
  ctx.fillRect(0, 0, tileSize, tileSize);
  ctx.fillStyle = "rgba(255,105,180,0.04)";
  ctx.fillRect(tileSize * 2, tileSize * 2, tileSize, tileSize);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 40);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function createCeilingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Very dark ceiling panels
  ctx.fillStyle = "#0d0a14";
  ctx.fillRect(0, 0, 256, 256);

  // Panel grid lines
  ctx.strokeStyle = "#1a1428";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      ctx.strokeRect(i * 64, j * 64, 64, 64);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 40);
  return texture;
}

function createWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#1e1630";
  ctx.fillRect(0, 0, 128, 128);
  // Subtle vertical ribbing
  ctx.fillStyle = "#221a38";
  for (let i = 0; i < 128; i += 16) {
    ctx.fillRect(i, 0, 8, 128);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

interface PlazaState {
  hasClicked: boolean;
  isMenuClosed: boolean;
  canLock: boolean;
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  canJump: boolean;
  isSprinting: boolean;
  lastWTap: number;
  prevTime: number;
  // Mobile touch state
  isMobile: boolean;
  isPlaying: boolean;
  touchYaw: number;
  touchPitch: number;
  joystickX: number;
  joystickZ: number;
}

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function createAmbientAudio(): { start: () => void; stop: () => void } {
  let audioCtx: AudioContext | null = null;
  let gainNode: GainNode | null = null;
  let started = false;

  function start() {
    if (started) return;
    started = true;
    audioCtx = new AudioContext();
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 3);
    gainNode.connect(audioCtx.destination);

    // Dreamy vaporwave pad: layered detuned oscillators through a low-pass filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    filter.Q.value = 2;
    filter.connect(gainNode);

    const chordFreqs = [130.81, 164.81, 196.0, 246.94]; // C3, E3, G3, B3 (Cmaj7)
    const detunes = [-8, 5, -3, 7, -12, 10];

    for (const freq of chordFreqs) {
      for (const detune of detunes) {
        const osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.detune.value = detune;

        const oscGain = audioCtx.createGain();
        oscGain.gain.value = 0.03;
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
      }
    }

    // Subtle sub bass
    const sub = audioCtx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 65.41; // C2
    const subGain = audioCtx.createGain();
    subGain.gain.value = 0.06;
    sub.connect(subGain);
    subGain.connect(gainNode);
    sub.start();

    // Slow LFO on filter for movement
    const lfo = audioCtx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
  }

  function stop() {
    if (audioCtx) {
      if (gainNode) {
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
      }
      setTimeout(() => {
        audioCtx?.close();
        audioCtx = null;
      }, 1200);
    }
    started = false;
  }

  return { start, stop };
}

function createSfxEngine() {
  let ctx: AudioContext | null = null;
  let lastStepTime = 0;
  let waterNode: { gain: GainNode; source: AudioBufferSourceNode } | null = null;

  function ensureCtx() {
    if (!ctx) ctx = new AudioContext();
    return ctx;
  }

  // Footstep — short burst of filtered noise
  function playStep(isSprinting: boolean) {
    const now = performance.now();
    const interval = isSprinting ? 280 : 420;
    if (now - lastStepTime < interval) return;
    lastStepTime = now;

    const ac = ensureCtx();
    const duration = 0.06;
    const bufferSize = Math.floor(ac.sampleRate * duration);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ac.createBufferSource();
    source.buffer = buffer;

    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = isSprinting ? 800 : 500;
    filter.Q.value = 1.5;

    const gain = ac.createGain();
    gain.gain.value = isSprinting ? 0.07 : 0.04;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    source.start();
  }

  // Jump — quick rising tone
  function playJump() {
    const ac = ensureCtx();
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.15);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.08, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.2);
  }

  // Land — short thud
  function playLand() {
    const ac = ensureCtx();
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 0.1);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.1, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.12);
  }

  // Fountain water — audible trickle bed + steady gentle drips
  let dripInterval: ReturnType<typeof setInterval> | null = null;
  let waterVolume = 0;

  function startWater() {
    const ac = ensureCtx();
    if (waterNode) return;

    // Dummy node for volume tracking (no trickle bed)
    const gain = ac.createGain();
    gain.gain.value = 0;
    const source = ac.createBufferSource();
    waterNode = { gain, source };

    // Drip sounds only
    dripInterval = setInterval(() => {
      if (waterVolume < 0.005) return;
      playDrip(ac, waterVolume);
    }, 75);
  }

  // Single water drip — gentle, tight pitch range, consistent
  function playDrip(ac: AudioContext, vol: number) {
    if (Math.random() > 0.95) return;

    // Tight pitch range — sounds like water drops, not lasers
    const startFreq = 500 + Math.random() * 150;
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.7, ac.currentTime + 0.04);

    const dripGain = ac.createGain();
    const peakVol = vol * 0.03;
    dripGain.gain.setValueAtTime(peakVol, ac.currentTime);
    dripGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);

    osc.connect(dripGain);
    dripGain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.06);
  }

  // Update fountain volume based on distance
  function updateWaterVolume(distance: number) {
    if (!waterNode) return;
    const maxDist = 30;
    const t = Math.min(distance / maxDist, 1);
    waterVolume = Math.max(0, 1 - t * t * t);
  }

  function stop() {
    if (dripInterval) {
      clearInterval(dripInterval);
      dripInterval = null;
    }
    waterNode = null;
    if (ctx) {
      ctx.close();
      ctx = null;
    }
  }

  return { playStep, playJump, playLand, startWater, updateWaterVolume, stop };
}

export default function VirtualPlaza() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<PlazaState>({
    hasClicked: false,
    isMenuClosed: true,
    canLock: true,
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    canJump: false,
    isSprinting: false,
    lastWTap: 0,
    prevTime: performance.now(),
    isMobile: false,
    isPlaying: false,
    touchYaw: 0,
    touchPitch: 0,
    joystickX: 0,
    joystickZ: 0,
  });
  const instructionsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const ghostCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const ambientAudioRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const sfxRef = useRef<ReturnType<typeof createSfxEngine> | null>(null);
  const hoverUrlRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const initGhostCursor = useCallback(() => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    const cursor = { x: width / 2, y: height / 2 };
    let particles: Array<{
      initialLifeSpan: number;
      lifeSpan: number;
      position: { x: number; y: number };
      image: HTMLImageElement;
      update: (ctx: CanvasRenderingContext2D) => void;
    }> = [];

    const baseImage = new Image();
    baseImage.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAATCAYAAACk9eypAAAAAXNSR0IArs4c6QAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAhGVYSWZNTQAqAAAACAAFARIAAwAAAAEAAQAAARoABQAAAAEAAABKARsABQAAAAEAAABSASgAAwAAAAEAAgAAh2kABAAAAAEAAABaAAAAAAAAAEgAAAABAAAASAAAAAEAA6ABAAMAAAABAAEAAKACAAQAAAABAAAADKADAAQAAAABAAAAEwAAAAAChpcNAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAABqElEQVQoFY3SPUvDQBgH8BREpRHExYiDgmLFl6WC+AYmWeyLg4i7buJX8DMpOujgyxGvUYeCgzhUQUSKKLUS0+ZyptXh8Z5Ti621ekPyJHl+uftfomhaf9Ei5JyxXKfynyEA6EYcLHpwyflT958GAQ7DTABNHd8EbtDbEH2BD5QEQmi2mM8P/Iq+A0SzszEg+3sPjDnDdVEtQKQbMUidHD3xVzf6A9UDEmEm+8h9KTqTVUjT+vB53aHrCbAPiceYq1dQI1Aqv4EhMll0jzv+Y0yiRgCnLRSYyDQHVoqUXe4uKL9l+L7GXC4vkMhE6eW/AOJs9k583ORDUyXMZ8F5SVHVVnllmPNKSFagAJ5DofaqGXw/gHBYg51dIldkmknY3tguv3jOtHR4+MqAzaraJXbEhqHhcQlwGSOi5pytVQHZLN5s0WNe8HPrLYlFsO20RPHkImxsbmHdLJFI76th7Z4SeuF53hTeFLvhRCJRCTKZKxgdnRDbW+iozFJbBMw14/ElwGYc0egMBMFzT21f5Rog33Z7dX02GBm7WV5ZfT5Nn5bE3zuCDe9UxdTpNvK+5AAAAABJRU5ErkJggg==";

    const canvas = document.createElement("canvas");
    canvas.id = "ghost-pointer-canvas";
    const context = canvas.getContext("2d")!;
    canvas.style.zIndex = "1003";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.position = "fixed";
    document.body.appendChild(canvas);
    canvas.width = width;
    canvas.height = height;
    ghostCanvasRef.current = canvas;

    function onWindowResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function onMouseMove(e: MouseEvent) {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      addParticle(cursor.x, cursor.y);
    }

    function onTouchMove(e: TouchEvent) {
      for (let i = 0; i < e.touches.length; i++) {
        addParticle(e.touches[i].clientX, e.touches[i].clientY);
      }
    }

    function addParticle(x: number, y: number) {
      const lifeSpan = 40;
      particles.push({
        initialLifeSpan: lifeSpan,
        lifeSpan,
        position: { x, y },
        image: baseImage,
        update(ctx: CanvasRenderingContext2D) {
          this.lifeSpan--;
          const opacity = Math.max(this.lifeSpan / this.initialLifeSpan, 0);
          ctx.globalAlpha = opacity;
          ctx.drawImage(this.image, this.position.x, this.position.y);
        },
      });
    }

    function loop() {
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(context);
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].lifeSpan < 0) {
          particles.splice(i, 1);
        }
      }
      requestAnimationFrame(loop);
    }

    document.body.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("touchmove", onTouchMove);
    document.body.addEventListener("touchstart", onTouchMove);
    window.addEventListener("resize", onWindowResize);
    loop();

    return () => {
      document.body.removeEventListener("mousemove", onMouseMove);
      document.body.removeEventListener("touchmove", onTouchMove);
      document.body.removeEventListener("touchstart", onTouchMove);
      window.removeEventListener("resize", onWindowResize);
      canvas.remove();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = stateRef.current;
    const mallLength = PORTFOLIO_ITEMS.length * STOREFRONT_SPACING + 80;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      (window.innerHeight * (4 / 3)) / window.innerHeight,
      0.1,
      1500
    );
    camera.position.set(0, 10, 20);

    // Scene — dark, moody dead mall
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0612);
    scene.fog = new THREE.Fog(0x0a0612, 0, mallLength * 0.7);

    // Dim ambient — dark corridors with light only from storefronts/neons
    const ambientLight = new THREE.AmbientLight(0x221833, 0.4);
    scene.add(ambientLight);

    // Faint purple-ish hemisphere
    const hemiLight = new THREE.HemisphereLight(0x1a0e30, 0x0a0612, 0.3);
    hemiLight.position.set(0, MALL_HEIGHT, 0);
    scene.add(hemiLight);

    // Controls
    state.isMobile = isTouchDevice();
    const controls = new PointerLockControls(camera, document.body);

    // Audio
    const ambientAudio = createAmbientAudio();
    ambientAudioRef.current = ambientAudio;
    const sfx = createSfxEngine();
    sfxRef.current = sfx;

    controls.addEventListener("lock", () => {
      state.isMenuClosed = true;
      state.isPlaying = true;
      if (menuRef.current) menuRef.current.style.display = "none";
      ambientAudio.start();
    });

    controls.addEventListener("unlock", () => {
      state.isMenuClosed = false;
      if (menuRef.current) menuRef.current.style.display = "";
      if (ghostCanvasRef.current) ghostCanvasRef.current.style.display = "";
      if (state.hasClicked) {
        state.canLock = false;
        setTimeout(() => {
          state.canLock = true;
        }, 1500);
      }
    });

    scene.add(controls.getObject());

    // Mobile touch look handler
    let lookTouchId: number | null = null;
    let lastLookX = 0;
    let lastLookY = 0;
    const lookSensitivity = 0.003;

    function onTouchStart(e: TouchEvent) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        // Right half of screen = look control
        if (t.clientX > window.innerWidth / 2 && lookTouchId === null) {
          lookTouchId = t.identifier;
          lastLookX = t.clientX;
          lastLookY = t.clientY;
        }
      }
    }

    function onTouchMove(e: TouchEvent) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === lookTouchId && state.isPlaying) {
          const dx = t.clientX - lastLookX;
          const dy = t.clientY - lastLookY;
          state.touchYaw -= dx * lookSensitivity;
          state.touchPitch -= dy * lookSensitivity;
          state.touchPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, state.touchPitch));
          lastLookX = t.clientX;
          lastLookY = t.clientY;
        }
      }
    }

    function onTouchEnd(e: TouchEvent) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === lookTouchId) {
          lookTouchId = null;
        }
      }
    }

    if (state.isMobile) {
      document.addEventListener("touchstart", onTouchStart, { passive: true });
      document.addEventListener("touchmove", onTouchMove, { passive: true });
      document.addEventListener("touchend", onTouchEnd, { passive: true });
    }

    // Collision objects
    const collisionObjects: THREE.Mesh[] = [];

    // ── FLOOR — dark checkerboard ──
    const floorTexture = createFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(MALL_WIDTH, mallLength);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshBasicMaterial({ map: floorTexture });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 0, -mallLength / 2 + 40);
    scene.add(floor);

    // ── CEILING — dark panels ──
    const ceilingTexture = createCeilingTexture();
    const ceilingGeo = new THREE.PlaneGeometry(MALL_WIDTH, mallLength);
    ceilingGeo.rotateX(Math.PI / 2);
    const ceilingMat = new THREE.MeshBasicMaterial({ map: ceilingTexture });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.set(0, MALL_HEIGHT, -mallLength / 2 + 40);
    scene.add(ceiling);

    // ── EXPOSED CEILING TRUSSES ──
    const trussMat = new THREE.MeshBasicMaterial({ color: PALETTE.truss });
    for (let tz = 30; tz > -mallLength + 40; tz -= 35) {
      // Cross beam
      const beamGeo = new THREE.BoxGeometry(MALL_WIDTH - 4, 1.5, 1.5);
      const beam = new THREE.Mesh(beamGeo, trussMat);
      beam.position.set(0, MALL_HEIGHT - 2, tz);
      scene.add(beam);

      // Diagonal supports
      for (const side of [-1, 1]) {
        const diagGeo = new THREE.BoxGeometry(1, 8, 1);
        const diag = new THREE.Mesh(diagGeo, trussMat);
        diag.position.set(side * (MALL_WIDTH / 2 - 6), MALL_HEIGHT - 5, tz);
        diag.rotation.z = side * 0.3;
        scene.add(diag);
      }
    }

    // ── WALLS — dark purple ──
    const wallTexture = createWallTexture();

    const leftWallTex = wallTexture.clone();
    leftWallTex.repeat.set(40, 4);
    const leftWallGeo = new THREE.PlaneGeometry(mallLength, MALL_HEIGHT);
    const leftWallMat = new THREE.MeshBasicMaterial({ map: leftWallTex });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-WALL_X, MALL_HEIGHT / 2, -mallLength / 2 + 40);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    const rightWallTex = wallTexture.clone();
    rightWallTex.repeat.set(40, 4);
    const rightWallGeo = new THREE.PlaneGeometry(mallLength, MALL_HEIGHT);
    const rightWallMat = new THREE.MeshBasicMaterial({ map: rightWallTex });
    const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
    rightWall.position.set(WALL_X, MALL_HEIGHT / 2, -mallLength / 2 + 40);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    // Back + end walls
    const backWallGeo = new THREE.PlaneGeometry(MALL_WIDTH, MALL_HEIGHT);
    const backWallMat = new THREE.MeshBasicMaterial({ color: PALETTE.wall });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, MALL_HEIGHT / 2, 40);
    backWall.rotation.y = Math.PI;
    scene.add(backWall);

    const endWall = new THREE.Mesh(backWallGeo.clone(), backWallMat.clone());
    endWall.position.set(0, MALL_HEIGHT / 2, -mallLength + 40);
    scene.add(endWall);

    // ── NEON WALL STRIPS running along both walls ──
    const neonColors = [PALETTE.neonPink, PALETTE.neonTeal];
    for (const side of [-1, 1]) {
      for (let stripIdx = 0; stripIdx < 2; stripIdx++) {
        const stripGeo = new THREE.PlaneGeometry(mallLength, 0.4);
        const stripMat = new THREE.MeshBasicMaterial({
          color: neonColors[(side + 1) / 2 + stripIdx],
          transparent: true,
          opacity: 0.7,
        });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        const h = stripIdx === 0 ? 1 : STOREFRONT_HEIGHT + 2;
        strip.position.set(side * (WALL_X - 0.1), h, -mallLength / 2 + 40);
        strip.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
        scene.add(strip);
      }
    }

    // ── PILLARS — dark with neon accent strips ──
    const pillarGeo = new THREE.BoxGeometry(3, MALL_HEIGHT, 3);
    const pillarMat = new THREE.MeshBasicMaterial({ color: PALETTE.pillar });
    const neonStripGeo = new THREE.BoxGeometry(0.3, MALL_HEIGHT, 0.3);

    for (let i = 0; i <= PORTFOLIO_ITEMS.length; i++) {
      const z = -i * STOREFRONT_SPACING + 10;
      for (const side of [-1, 1]) {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(side * (WALL_X - 1.5), MALL_HEIGHT / 2, z);
        scene.add(pillar);

        // Teal neon strip on pillar face
        const nStrip = new THREE.Mesh(
          neonStripGeo,
          new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? PALETTE.neonTeal : PALETTE.neonPink,
            transparent: true,
            opacity: 0.8,
          })
        );
        nStrip.position.set(side * (WALL_X - 1.5) + side * -1.6, MALL_HEIGHT / 2, z);
        scene.add(nStrip);
      }
    }

    // ── FLUORESCENT CEILING LIGHT PANELS ──
    const panelGeo = new THREE.PlaneGeometry(6, 12);
    panelGeo.rotateX(Math.PI / 2);
    const panelMat = new THREE.MeshBasicMaterial({
      color: PALETTE.fluorescent,
      transparent: true,
      opacity: 0.15,
    });
    for (let pz = 25; pz > -mallLength + 40; pz -= 35) {
      for (const px of [-12, 12]) {
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(px, MALL_HEIGHT - 0.2, pz);
        scene.add(panel);
      }
    }

    // ── STRING LIGHTS along center of ceiling ──
    const stringLightMat = new THREE.MeshBasicMaterial({
      color: 0xffeedd,
      transparent: true,
      opacity: 0.9,
    });
    const bulbGeo = new THREE.SphereGeometry(0.3, 4, 4);
    for (let sz = 30; sz > -mallLength + 40; sz -= 8) {
      const bulb = new THREE.Mesh(bulbGeo, stringLightMat);
      bulb.position.set(
        Math.sin(sz * 0.1) * 3,
        MALL_HEIGHT - 4,
        sz
      );
      scene.add(bulb);
    }

    // Wire for string lights
    const wireGeo = new THREE.BoxGeometry(0.1, 0.1, mallLength);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x1a1428 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.set(0, MALL_HEIGHT - 4, -mallLength / 2 + 40);
    scene.add(wire);

    // ── FOUNTAIN in the center of the mall ──
    const fountainZ = -STOREFRONT_SPACING * Math.floor(PORTFOLIO_ITEMS.length / 2) + 10;

    // Basin — dark teal octagonal
    const basinGeo = new THREE.CylinderGeometry(8, 9, 3, 8);
    const basinMat = new THREE.MeshBasicMaterial({ color: 0x0d3d3d });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.set(0, 1.5, fountainZ);
    scene.add(basin);
    collisionObjects.push(basin);

    // Basin rim — neon teal edge
    const rimGeo = new THREE.TorusGeometry(8.5, 0.4, 4, 8);
    const rimMat = new THREE.MeshBasicMaterial({
      color: PALETTE.neonTeal,
      transparent: true,
      opacity: 0.6,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.set(0, 3, fountainZ);
    rim.rotation.x = -Math.PI / 2;
    scene.add(rim);

    // Water surface
    const waterGeo = new THREE.CircleGeometry(7.5, 8);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshBasicMaterial({
      color: 0x1a4a6e,
      transparent: true,
      opacity: 0.6,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 2.8, fountainZ);
    scene.add(water);

    // Center column
    const colGeo = new THREE.CylinderGeometry(0.8, 1.2, 8, 8);
    const colMat = new THREE.MeshBasicMaterial({ color: 0x1a3040 });
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(0, 6, fountainZ);
    scene.add(col);

    // Fountain "spray" particles (small white spheres)
    const sprayMat = new THREE.MeshBasicMaterial({
      color: 0xcceeff,
      transparent: true,
      opacity: 0.5,
    });
    const sprayGeo = new THREE.SphereGeometry(0.2, 3, 3);
    const sprayParticles: THREE.Mesh[] = [];
    for (let s = 0; s < 24; s++) {
      const spray = new THREE.Mesh(sprayGeo, sprayMat);
      const angle = (s / 24) * Math.PI * 2;
      const r = 2 + Math.random() * 3;
      spray.position.set(
        Math.cos(angle) * r,
        8 + Math.random() * 4,
        fountainZ + Math.sin(angle) * r
      );
      scene.add(spray);
      sprayParticles.push(spray);
    }

    // Colored neon glow under fountain
    const fountainGlowGeo = new THREE.CircleGeometry(10, 8);
    fountainGlowGeo.rotateX(-Math.PI / 2);
    const fountainGlowMat = new THREE.MeshBasicMaterial({
      color: PALETTE.neonPink,
      transparent: true,
      opacity: 0.08,
    });
    const fountainGlow = new THREE.Mesh(fountainGlowGeo, fountainGlowMat);
    fountainGlow.position.set(0, 0.05, fountainZ);
    scene.add(fountainGlow);

    // ── BENCHES — Memphis-style teal/pink ──
    const benchSeatGeo = new THREE.BoxGeometry(12, 1.2, 4);
    const benchLegGeo = new THREE.BoxGeometry(1, 3, 4);
    const memphisColors = [PALETTE.neonTeal, PALETTE.neonPink, PALETTE.neonPurple];

    for (let i = 0; i < PORTFOLIO_ITEMS.length; i++) {
      const z = -i * STOREFRONT_SPACING - STOREFRONT_SPACING / 2 + 10;
      if (Math.abs(z - fountainZ) < 20) continue; // skip near fountain

      const benchColor = memphisColors[i % memphisColors.length];
      const bMat = new THREE.MeshBasicMaterial({ color: benchColor, transparent: true, opacity: 0.7 });

      const seat = new THREE.Mesh(benchSeatGeo, bMat);
      seat.position.set(0, 3.5, z);
      scene.add(seat);
      collisionObjects.push(seat);

      const legMat = new THREE.MeshBasicMaterial({ color: PALETTE.pillar });
      const leg1 = new THREE.Mesh(benchLegGeo, legMat);
      leg1.position.set(-5, 1.5, z);
      scene.add(leg1);
      const leg2 = new THREE.Mesh(benchLegGeo, legMat);
      leg2.position.set(5, 1.5, z);
      scene.add(leg2);
    }

    // ── PLANTERS with neon-glow plants ──
    const planterGeo = new THREE.CylinderGeometry(2.5, 2, 5, 8);
    const planterMat = new THREE.MeshBasicMaterial({ color: PALETTE.planter });
    const plantGeo = new THREE.SphereGeometry(4, 8, 6);

    for (let i = 0; i <= PORTFOLIO_ITEMS.length; i++) {
      const z = -i * STOREFRONT_SPACING + 10;
      if (Math.abs(z - fountainZ) < 15) continue; // skip near fountain

      const planter = new THREE.Mesh(planterGeo, planterMat);
      planter.position.set(0, 2.5, z);
      scene.add(planter);
      collisionObjects.push(planter);

      const pMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? PALETTE.plant : PALETTE.neonPurple,
        transparent: true,
        opacity: 0.5,
      });
      const plant = new THREE.Mesh(plantGeo, pMat);
      plant.position.set(0, 8, z);
      scene.add(plant);
    }

    // ── STOREFRONTS ──
    const screenMeshes: THREE.Mesh[] = [];
    const screenUrls: Map<string, string> = new Map();
    const textureLoader = new THREE.TextureLoader();

    PORTFOLIO_ITEMS.forEach((item, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const z = -i * STOREFRONT_SPACING - STOREFRONT_SPACING / 2 + 10;
      const wallX = side * WALL_X;

      // Screen (the portfolio preview) — flush with the corridor wall like a display window
      const screenW = STOREFRONT_WIDTH - 6;
      const screenH = STOREFRONT_HEIGHT - 4;

      // Load actual screenshot of the site
      const screenshotTexture = textureLoader.load(item.screenshot);
      screenshotTexture.minFilter = THREE.LinearFilter;
      screenshotTexture.magFilter = THREE.LinearFilter;

      const screenGeo = new THREE.PlaneGeometry(screenW, screenH);
      const screenMat = new THREE.MeshBasicMaterial({ map: screenshotTexture });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(
        wallX + side * -0.2,
        STOREFRONT_HEIGHT / 2 + 1,
        z
      );
      screen.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(screen);
      screenMeshes.push(screen);
      screenUrls.set(screen.uuid, item.url);

      // Neon frame around screen
      const frameGeo = new THREE.EdgesGeometry(
        new THREE.PlaneGeometry(screenW + 1, screenH + 1)
      );
      const frameMat = new THREE.LineBasicMaterial({ color: item.accentColor });
      const frame = new THREE.LineSegments(frameGeo, frameMat);
      frame.position.copy(screen.position);
      frame.position.x += side * -0.1;
      frame.rotation.copy(screen.rotation);
      scene.add(frame);

      // Neon sign above storefront — mounted on the wall face, well above the alcove ceiling
      const signTexture = createNeonSignTexture(item.title, item.accentColor);
      const signGeo = new THREE.PlaneGeometry(STOREFRONT_WIDTH - 4, 6);
      const signMat = new THREE.MeshBasicMaterial({
        map: signTexture,
        transparent: true,
      });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(wallX + side * -0.3, STOREFRONT_HEIGHT + 8, z);
      sign.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(sign);

      // Neon accent light strip on floor of alcove entrance
      const accentLightGeo = new THREE.PlaneGeometry(1.5, STOREFRONT_WIDTH - 4);
      accentLightGeo.rotateX(-Math.PI / 2);
      const accentLightMat = new THREE.MeshBasicMaterial({
        color: item.accentColor,
        transparent: true,
        opacity: 0.4,
      });
      const accentLight = new THREE.Mesh(accentLightGeo, accentLightMat);
      accentLight.position.set(wallX + side * -1, 0.1, z);
      scene.add(accentLight);

      // Colored glow spill on the main corridor floor
      const glowSpillGeo = new THREE.PlaneGeometry(10, STOREFRONT_WIDTH * 0.6);
      glowSpillGeo.rotateX(-Math.PI / 2);
      const glowSpillMat = new THREE.MeshBasicMaterial({
        color: item.accentColor,
        transparent: true,
        opacity: 0.05,
      });
      const glowSpill = new THREE.Mesh(glowSpillGeo, glowSpillMat);
      glowSpill.position.set(wallX + side * -8, 0.06, z);
      scene.add(glowSpill);
    });

    // ── CRT TV WALL — retro X/Twitter display at end of corridor ──
    const tvWallZ = -mallLength + 45;
    const xProfileUrl = "https://x.com/bispingbraden";

    function createCRTTexture(lines: string[], accentHue: number): THREE.CanvasTexture {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 192;
      const ctx = canvas.getContext("2d")!;

      // CRT background
      ctx.fillStyle = `hsl(${accentHue}, 40%, 5%)`;
      ctx.fillRect(0, 0, 256, 192);

      // Scanlines
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      for (let sy = 0; sy < 192; sy += 3) {
        ctx.fillRect(0, sy, 256, 1);
      }

      // Phosphor glow
      const grd = ctx.createRadialGradient(128, 96, 20, 128, 96, 140);
      grd.addColorStop(0, `hsla(${accentHue}, 80%, 50%, 0.08)`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 256, 192);

      // Text — word-wrapped tweet content
      ctx.textAlign = "left";
      ctx.shadowColor = `hsl(${accentHue}, 90%, 60%)`;
      ctx.shadowBlur = 6;
      ctx.fillStyle = `hsl(${accentHue}, 80%, 65%)`;
      ctx.font = "14px monospace";

      let drawY = 28;
      for (const rawLine of lines) {
        // Word-wrap each line to fit canvas width
        const words = rawLine.split(" ");
        let currentLine = "";
        for (const word of words) {
          const test = currentLine + word + " ";
          if (ctx.measureText(test).width > 230) {
            ctx.fillText(currentLine.trim(), 14, drawY);
            currentLine = word + " ";
            drawY += 18;
            if (drawY > 170) break;
          } else {
            currentLine = test;
          }
        }
        if (drawY <= 170) {
          ctx.fillText(currentLine.trim(), 14, drawY);
          drawY += 22;
        }
        if (drawY > 170) break;
      }

      ctx.shadowBlur = 0;

      // CRT edge vignette
      const vignette = ctx.createRadialGradient(128, 96, 60, 128, 96, 150);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, 256, 192);

      // Screen border
      ctx.strokeStyle = `hsla(${accentHue}, 60%, 40%, 0.5)`;
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 252, 188);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      return texture;
    }

    // CRT TV housing
    const tvBodyGeo = new THREE.BoxGeometry(13, 10, 8);
    const tvBodyMat = new THREE.MeshBasicMaterial({ color: 0x2a2230 });
    const tvScreenGeo = new THREE.PlaneGeometry(10, 7.5);

    // Layout: 3 columns x 2 rows of TVs on the end wall
    const tvCols = 3;
    const tvRows = 2;
    const tvSpacingX = 16;
    const tvSpacingY = 13;
    const tvStartX = -((tvCols - 1) * tvSpacingX) / 2;
    const tvStartY = 8;
    const tvHues = [200, 180, 280, 320, 200, 180];
    const tvScreenMaterials: THREE.MeshBasicMaterial[] = [];
    const tvScreenUuids: string[] = [];

    // Placeholder content before tweets load
    const placeholderLines = [
      ["@bispingbraden", "loading tweets..."],
      ["@bispingbraden", "loading tweets..."],
      ["@bispingbraden", "loading tweets..."],
      ["@bispingbraden", "loading tweets..."],
      ["@bispingbraden", "loading tweets..."],
      ["@bispingbraden", "loading tweets..."],
    ];

    for (let row = 0; row < tvRows; row++) {
      for (let col = 0; col < tvCols; col++) {
        const idx = row * tvCols + col;
        const tx = tvStartX + col * tvSpacingX;
        const ty = tvStartY + row * tvSpacingY;

        // TV body (the bulky CRT casing)
        const tvBody = new THREE.Mesh(tvBodyGeo, tvBodyMat);
        tvBody.position.set(tx, ty, tvWallZ + 4);
        scene.add(tvBody);

        // TV screen with placeholder
        const hue = tvHues[idx % tvHues.length];
        const crtTexture = createCRTTexture(placeholderLines[idx], hue);
        const mat = new THREE.MeshBasicMaterial({ map: crtTexture });
        tvScreenMaterials.push(mat);
        const tvScreen = new THREE.Mesh(tvScreenGeo, mat);
        tvScreen.position.set(tx, ty, tvWallZ + 8.1);
        scene.add(tvScreen);
        screenMeshes.push(tvScreen);
        screenUrls.set(tvScreen.uuid, xProfileUrl);
        tvScreenUuids.push(tvScreen.uuid);

        // Neon glow around screen
        const tvFrameGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(11, 8.5));
        const tvFrameMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(`hsl(${hue}, 70%, 50%)`),
        });
        const tvFrame = new THREE.LineSegments(tvFrameGeo, tvFrameMat);
        tvFrame.position.copy(tvScreen.position);
        tvFrame.position.z += 0.05;
        scene.add(tvFrame);
      }
    }

    // Fetch real tweets and update TV screens
    const brandingFills: string[][] = [
      ["\ud835\udd4F  @bispingbraden", "", "FOLLOW ME"],
      ["THOUGHTS &", "HOT TAKES", "", "@bispingbraden"],
      ["\ud835\udd4F", "", "CLICK TO VIEW", "my posts"],
    ];
    fetch("/api/tweets")
      .then((res) => res.json())
      .then((data: { tweets?: { id: string; text: string; created_at?: string }[] }) => {
        if (!data.tweets || data.tweets.length === 0) return;
        const tweets = data.tweets;
        for (let i = 0; i < tvScreenMaterials.length; i++) {
          const hue = tvHues[i % tvHues.length];
          let lines: string[];
          if (i < tweets.length) {
            const tweet = tweets[i];
            const dateStr = tweet.created_at
              ? new Date(tweet.created_at).toLocaleDateString()
              : "";
            lines = dateStr
              ? [`@bispingbraden  ${dateStr}`, "", tweet.text]
              : ["@bispingbraden", "", tweet.text];
            // Link this TV to the specific tweet
            screenUrls.set(tvScreenUuids[i], `https://x.com/bispingbraden/status/${tweet.id}`);
          } else {
            lines = brandingFills[(i - tweets.length) % brandingFills.length];
            // Branding TVs still link to the profile
          }
          const newTexture = createCRTTexture(lines, hue);
          tvScreenMaterials[i].map?.dispose();
          tvScreenMaterials[i].map = newTexture;
          tvScreenMaterials[i].needsUpdate = true;
        }
      })
      .catch(() => {
        // Keep placeholders on error
      });

    // "CONNECT" sign above the TV wall
    const connectSignTex = createNeonSignTexture("@bispingbraden", "#1da1f2");
    const connectSignGeo = new THREE.PlaneGeometry(40, 5);
    const connectSignMat = new THREE.MeshBasicMaterial({ map: connectSignTex, transparent: true });
    const connectSign = new THREE.Mesh(connectSignGeo, connectSignMat);
    connectSign.position.set(0, tvStartY + tvRows * tvSpacingY + 2, tvWallZ + 8.2);
    scene.add(connectSign);

    // Glow on the floor in front of the TV wall
    const tvGlowGeo = new THREE.PlaneGeometry(MALL_WIDTH * 0.6, 15);
    tvGlowGeo.rotateX(-Math.PI / 2);
    const tvGlowMat = new THREE.MeshBasicMaterial({
      color: 0x1da1f2,
      transparent: true,
      opacity: 0.06,
    });
    const tvGlow = new THREE.Mesh(tvGlowGeo, tvGlowMat);
    tvGlow.position.set(0, 0.05, tvWallZ + 12);
    scene.add(tvGlow);

    // Crosshair raycaster
    const clickRaycaster = new THREE.Raycaster();
    clickRaycaster.far = 150;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio / 2);
    renderer.setSize(window.innerHeight * (4 / 3), window.innerHeight);
    renderer.domElement.style.margin = "0 auto";
    renderer.domElement.style.display = "block";
    containerRef.current.appendChild(renderer.domElement);

    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    // Resize
    function onWindowResize() {
      camera.aspect = (window.innerHeight * (4 / 3)) / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerHeight * (4 / 3), window.innerHeight);
    }
    window.addEventListener("resize", onWindowResize);

    // Keyboard — Minecraft-style sprint: double-tap W or hold Ctrl+W
    function onKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "ArrowUp": case "w": case "W":
          if (!state.moveForward) {
            // Double-tap W detection (within 300ms)
            const now = performance.now();
            if (now - state.lastWTap < 300) {
              state.isSprinting = true;
            }
            state.lastWTap = now;
          }
          state.moveForward = true;
          // Ctrl+W sprint
          if (event.ctrlKey) state.isSprinting = true;
          break;
        case "ArrowLeft": case "a":
          state.moveLeft = true;
          break;
        case "ArrowDown": case "s":
          state.moveBackward = true;
          break;
        case "ArrowRight": case "d":
          state.moveRight = true;
          break;
        case "Control":
          if (state.moveForward) state.isSprinting = true;
          break;
        case " ":
          if (state.canJump) {
            velocity.y += 100;
            state.canJump = false;
            sfx.playJump();
          }
          break;
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      switch (event.key) {
        case "ArrowUp": case "w": case "W":
          state.moveForward = false;
          state.isSprinting = false;
          break;
        case "ArrowLeft": case "a":
          state.moveLeft = false;
          break;
        case "ArrowDown": case "s":
          state.moveBackward = false;
          break;
        case "ArrowRight": case "d":
          state.moveRight = false;
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Animation loop
    let disposed = false;
    function animate() {
      if (disposed) return;
      animFrameRef.current = requestAnimationFrame(animate);

      const time = performance.now();

      // Animate fountain spray
      for (let s = 0; s < sprayParticles.length; s++) {
        const sp = sprayParticles[s];
        const angle = (s / 24) * Math.PI * 2 + time * 0.001;
        const r = 2 + Math.sin(time * 0.002 + s) * 2;
        sp.position.x = Math.cos(angle) * r;
        sp.position.y = 8 + Math.sin(time * 0.003 + s * 0.5) * 3;
        sp.position.z = fountainZ + Math.sin(angle) * r;
      }

      // Pulse fountain glow color between pink and teal
      const pulse = Math.sin(time * 0.001) * 0.5 + 0.5;
      fountainGlowMat.color.setHex(pulse > 0.5 ? PALETTE.neonPink : PALETTE.neonTeal);
      fountainGlowMat.opacity = 0.06 + Math.sin(time * 0.002) * 0.03;

      const isActive = state.isMobile ? state.isPlaying : controls.isLocked;

      // Crosshair hover check
      if (isActive) {
        clickRaycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hoverHits = clickRaycaster.intersectObjects(screenMeshes);
        if (hoverUrlRef.current) {
          if (hoverHits.length > 0) {
            const url = screenUrls.get(hoverHits[0].object.uuid);
            hoverUrlRef.current.textContent = url ? new URL(url).hostname : "";
            hoverUrlRef.current.style.display = url ? "" : "none";
          } else {
            hoverUrlRef.current.style.display = "none";
          }
        }
      }

      if (isActive) {
        const playerPos = controls.getObject().position;
        const delta = (time - state.prevTime) / 1000;

        // Mobile: apply touch look rotation
        if (state.isMobile) {
          const euler = new THREE.Euler(state.touchPitch, state.touchYaw, 0, "YXZ");
          camera.quaternion.setFromEuler(euler);
        }

        // Apply friction and gravity
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 40.0 * delta;

        // Apply input forces — keyboard or joystick
        if (state.isMobile) {
          direction.z = -state.joystickZ;
          direction.x = state.joystickX;
        } else {
          direction.z = Number(state.moveForward) - Number(state.moveBackward);
          direction.x = Number(state.moveRight) - Number(state.moveLeft);
        }
        direction.normalize();

        const hasInput = state.isMobile
          ? Math.abs(state.joystickX) > 0.1 || Math.abs(state.joystickZ) > 0.1
          : state.moveForward || state.moveBackward || state.moveLeft || state.moveRight;

        if (hasInput) {
          velocity.z -= direction.z * 400.0 * delta;
          velocity.x -= direction.x * 400.0 * delta;
        }

        // Apply movement
        if (state.isMobile) {
          // Manual movement based on camera direction
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          forward.y = 0;
          forward.normalize();
          const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
          const moveZ = -velocity.z * delta + Number(state.isSprinting) * 0.3;
          const moveX = -velocity.x * delta;
          playerPos.add(forward.multiplyScalar(moveZ));
          playerPos.add(right.multiplyScalar(moveX));
        } else {
          controls.moveRight(-velocity.x * delta);
          controls.moveForward(
            -velocity.z * delta + Number(state.isSprinting) * 0.3
          );
        }
        playerPos.y += velocity.y * delta;

        // Player collision radius
        const playerRadius = 2.5;
        const playerFeetY = playerPos.y - 10; // feet position (camera is at eye level)
        const playerHeadY = playerPos.y;

        // Check horizontal collision against all collision objects (AABB)
        for (const obj of collisionObjects) {
          obj.geometry.computeBoundingBox();
          const box = obj.geometry.boundingBox!.clone();
          box.translate(obj.position);

          // Expand box by player radius for collision
          const expandedMin = box.min.clone().addScalar(-playerRadius);
          const expandedMax = box.max.clone().addScalar(playerRadius);

          // Check if player overlaps this object horizontally and vertically
          if (
            playerPos.x > expandedMin.x && playerPos.x < expandedMax.x &&
            playerPos.z > expandedMin.z && playerPos.z < expandedMax.z &&
            playerFeetY < box.max.y && playerHeadY > box.min.y
          ) {
            // Find the shortest push-out axis (X or Z only)
            const pushLeft = playerPos.x - expandedMin.x;
            const pushRight = expandedMax.x - playerPos.x;
            const pushBack = playerPos.z - expandedMin.z;
            const pushFront = expandedMax.z - playerPos.z;
            const minPush = Math.min(pushLeft, pushRight, pushBack, pushFront);

            if (minPush === pushLeft) {
              playerPos.x = expandedMin.x;
              velocity.x = 0;
            } else if (minPush === pushRight) {
              playerPos.x = expandedMax.x;
              velocity.x = 0;
            } else if (minPush === pushBack) {
              playerPos.z = expandedMin.z;
              velocity.z = 0;
            } else {
              playerPos.z = expandedMax.z;
              velocity.z = 0;
            }
          }
        }

        // Floor collision
        if (playerPos.y < 10) {
          if (!state.canJump && velocity.y < -50) sfx.playLand();
          velocity.y = 0;
          playerPos.y = 10;
          state.canJump = true;
        }

        // Footstep sounds when moving on ground
        if (state.canJump && hasInput) {
          sfx.playStep(state.isSprinting);
        }

        // Fountain water — spatial audio based on distance
        sfx.startWater();
        const dx = playerPos.x;
        const dz = playerPos.z - fountainZ;
        sfx.updateWaterVolume(Math.sqrt(dx * dx + dz * dz));

        // Ceiling collision
        if (playerPos.y > MALL_HEIGHT - 2) {
          velocity.y = 0;
          playerPos.y = MALL_HEIGHT - 2;
        }

        // Keep player inside the mall corridor (walls)
        playerPos.x = Math.max(-WALL_X + 3, Math.min(WALL_X - 3, playerPos.x));
        playerPos.z = Math.max(-mallLength + 43, Math.min(38, playerPos.z));
      }

      state.prevTime = time;
      renderer.render(scene, camera);
    }

    animate();

    // Ghost cursor
    const cleanupGhost = initGhostCursor();

    // Click/tap handler
    function onClick(e: MouseEvent | TouchEvent) {
      const isLocked = state.isMobile ? state.isPlaying : controls.isLocked;

      if (isLocked) {
        clickRaycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = clickRaycaster.intersectObjects(screenMeshes);
        if (hits.length > 0) {
          const url = screenUrls.get(hits[0].object.uuid);
          if (url) {
            if (!state.isMobile) controls.unlock();
            window.open(url, "_blank");
          }
        }
        return;
      }

      // Start playing
      if (state.isMobile) {
        state.isPlaying = true;
        state.hasClicked = true;
        ambientAudio.start();
        if (instructionsRef.current)
          instructionsRef.current.style.display = "none";
        if (ghostCanvasRef.current)
          ghostCanvasRef.current.style.display = "none";
        return;
      }

      const target = (e as MouseEvent).target as Node | null;
      if (target &&
          !containerRef.current?.contains(target) &&
          !instructionsRef.current?.contains(target) &&
          !menuRef.current?.contains(target)) {
        return;
      }
      if (state.canLock) {
        controls.lock();
        state.hasClicked = true;
        if (instructionsRef.current)
          instructionsRef.current.style.display = "none";
        if (ghostCanvasRef.current)
          ghostCanvasRef.current.style.display = "none";
      }
    }
    document.addEventListener("click", onClick);

    // ── MOBILE CONTROLS SETUP ──
    let joystickTouchId: number | null = null;
    const joystickZone = document.getElementById("joystick-zone");
    const joystickKnob = document.getElementById("joystick-knob");
    const jumpBtn = document.getElementById("jump-btn");
    const interactBtn = document.getElementById("interact-btn");
    const mobileControls = document.getElementById("mobile-controls");

    if (state.isMobile && joystickZone && joystickKnob) {
      // Show mobile controls after entering
      const showMobileUI = () => {
        if (mobileControls && state.isPlaying) mobileControls.style.display = "";
      };

      // Joystick
      joystickZone.addEventListener("touchstart", (e: TouchEvent) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        joystickTouchId = t.identifier;
        showMobileUI();
      }, { passive: false });

      joystickZone.addEventListener("touchmove", (e: TouchEvent) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === joystickTouchId) {
            const rect = joystickZone.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            let dx = (t.clientX - cx) / (rect.width / 2);
            let dy = (t.clientY - cy) / (rect.height / 2);
            // Clamp to circle
            const mag = Math.sqrt(dx * dx + dy * dy);
            if (mag > 1) { dx /= mag; dy /= mag; }
            state.joystickX = dx;
            state.joystickZ = dy;
            // Move the knob visually
            joystickKnob.style.transform = `translate(calc(-50% + ${dx * 35}px), calc(-50% + ${dy * 35}px))`;
          }
        }
      }, { passive: false });

      const resetJoystick = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === joystickTouchId) {
            joystickTouchId = null;
            state.joystickX = 0;
            state.joystickZ = 0;
            joystickKnob.style.transform = "translate(-50%, -50%)";
          }
        }
      };
      joystickZone.addEventListener("touchend", resetJoystick, { passive: true });
      joystickZone.addEventListener("touchcancel", resetJoystick, { passive: true });

      // Jump button
      if (jumpBtn) {
        jumpBtn.addEventListener("touchstart", (e: TouchEvent) => {
          e.preventDefault();
          if (state.canJump) {
            velocity.y += 100;
            state.canJump = false;
            sfx.playJump();
          }
        }, { passive: false });
      }

      // Interact button — simulates crosshair click
      if (interactBtn) {
        interactBtn.addEventListener("touchstart", (e: TouchEvent) => {
          e.preventDefault();
          clickRaycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
          const hits = clickRaycaster.intersectObjects(screenMeshes);
          if (hits.length > 0) {
            const url = screenUrls.get(hits[0].object.uuid);
            if (url) window.open(url, "_blank");
          }
        }, { passive: false });
      }
    }

    // Show mobile controls when game starts
    if (state.isMobile) {
      const origOnClick = onClick;
      const mobileStartCheck = setInterval(() => {
        if (state.isPlaying && mobileControls) {
          mobileControls.style.display = "";
          clearInterval(mobileStartCheck);
        }
      }, 200);
    }

    // Update instructions text for mobile
    if (state.isMobile && instructionsRef.current) {
      const controlsText = instructionsRef.current.querySelector("span:last-child");
      if (controlsText) {
        controlsText.innerHTML =
          "Move: Left joystick<br/>Look: Drag right side<br/>Jump: JUMP button<br/>Interact: CLICK button";
      }
    }

    return () => {
      disposed = true;
      if (controls.isLocked) {
        controls.unlock();
      }
      controls.dispose();
      ambientAudio.stop();
      sfx.stop();
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("click", onClick);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      renderer.domElement.remove();
      cleanupGhost();
    };
  }, [initGhostCursor]);

  return (
    <>
      <div
        ref={instructionsRef}
        style={{
          zIndex: 1002,
          backgroundColor: "rgba(10, 6, 18, 0.85)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            flexDirection: "column",
            color: "#ff69b4",
            fontFamily: "'FiraMono', monospace",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", lineHeight: 1.8, color: "#00e5cc" }}>
            Welcome to the dead mall.
            <br />
            <br />
            <span style={{ color: "#b366ff" }}>
              Walk the empty corridors. Visit the storefronts.
            </span>
          </h2>
          <br />
          <br />
          <br />
          <span style={{ fontSize: "36px", color: "#ff69b4" }}>Click to enter</span>
          <br />
          <br />
          <span style={{ color: "#00e5cc" }}>
            Move: WASD
            <br />
            Jump: SPACE
            <br />
            Look: MOUSE
            <br />
            Sprint: Double-tap W or Ctrl
          </span>
        </div>
      </div>
      <div ref={menuRef} style={{ display: "none" }}>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(10, 6, 18, 0.7)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(30, 22, 48, 0.9)",
              border: "1px solid rgba(0, 229, 204, 0.3)",
              height: "50%",
              width: "50%",
              zIndex: 1001,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              color: "#00e5cc",
              fontFamily: "'FiraMono', monospace",
            }}
          >
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#ff69b4" }}>Menu</h1>
            <Link href="/journal" style={{ color: "#00e5cc", textDecoration: "underline", marginBottom: "0.5rem" }}>
              Journal
            </Link>
            <Link href="/things-i-will-not-do" style={{ color: "#b366ff", textDecoration: "underline", marginBottom: "0.5rem" }}>
              Things I Will Not Do
            </Link>
            <a
              href="https://x.com/bispingbraden"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1da1f2", textDecoration: "underline" }}
            >
              @bispingbraden
            </a>
          </div>
        </div>
      </div>
      {/* Crosshair */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 999,
          pointerEvents: "none",
        }}
      >
        <div style={{ width: "24px", height: "24px", position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: "2px", backgroundColor: "rgba(0,229,204,0.6)", transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", left: "50%", top: 0, height: "100%", width: "2px", backgroundColor: "rgba(0,229,204,0.6)", transform: "translateX(-50%)" }} />
        </div>
      </div>
      {/* Hover URL indicator — positioned below crosshair without affecting it */}
      {mounted && (
        <div
          ref={hoverUrlRef}
          style={{
            display: "none",
            position: "fixed",
            top: "calc(50% + 20px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            pointerEvents: "none",
            padding: "4px 10px",
            backgroundColor: "rgba(10, 6, 18, 0.8)",
            border: "1px solid rgba(0, 229, 204, 0.4)",
            color: "#00e5cc",
            fontFamily: "'FiraMono', monospace",
            fontSize: "12px",
            whiteSpace: "nowrap",
            borderRadius: "4px",
          }}
        />
      )}
      {/* Mobile touch controls */}
      {mounted && (
        <div
          id="mobile-controls"
          style={{
            display: "none",
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 998,
            pointerEvents: "none",
          }}
        >
          {/* Virtual joystick area — bottom left */}
          <div
            id="joystick-zone"
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "2px solid rgba(0, 229, 204, 0.3)",
              backgroundColor: "rgba(10, 6, 18, 0.4)",
              pointerEvents: "auto",
              touchAction: "none",
            }}
          >
            <div
              id="joystick-knob"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(0, 229, 204, 0.5)",
              }}
            />
          </div>
          {/* Jump button — bottom right */}
          <div
            id="jump-btn"
            style={{
              position: "absolute",
              bottom: "30px",
              right: "30px",
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              border: "2px solid rgba(255, 105, 180, 0.4)",
              backgroundColor: "rgba(255, 105, 180, 0.15)",
              pointerEvents: "auto",
              touchAction: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#ff69b4",
              fontFamily: "'FiraMono', monospace",
              fontSize: "11px",
            }}
          >
            JUMP
          </div>
          {/* Interact button — above jump */}
          <div
            id="interact-btn"
            style={{
              position: "absolute",
              bottom: "115px",
              right: "30px",
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              border: "2px solid rgba(0, 229, 204, 0.4)",
              backgroundColor: "rgba(0, 229, 204, 0.15)",
              pointerEvents: "auto",
              touchAction: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#00e5cc",
              fontFamily: "'FiraMono', monospace",
              fontSize: "10px",
            }}
          >
            CLICK
          </div>
        </div>
      )}
      <div ref={containerRef} />
    </>
  );
}
