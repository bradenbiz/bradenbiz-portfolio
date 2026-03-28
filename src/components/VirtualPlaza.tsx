"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

interface PortfolioItem {
  title: string;
  description: string;
  url: string;
  color: string;
  accentColor: string;
}

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    title: "Weather Dashboard",
    description: "Real-time weather data visualization with interactive maps and forecasts",
    url: "https://example.com/weather",
    color: "#1a1a2e",
    accentColor: "#e94560",
  },
  {
    title: "Task Manager Pro",
    description: "A minimal, keyboard-driven task management app with Kanban boards",
    url: "https://example.com/tasks",
    color: "#0f3460",
    accentColor: "#16c79a",
  },
  {
    title: "Music Visualizer",
    description: "WebGL audio visualizer that reacts to microphone input in real-time",
    url: "https://example.com/music",
    color: "#2b2024",
    accentColor: "#ff6b6b",
  },
  {
    title: "Dev Blog",
    description: "Personal blog about web development, creative coding, and open source",
    url: "https://example.com/blog",
    color: "#1b1b2f",
    accentColor: "#e2a63b",
  },
  {
    title: "Pixel Art Editor",
    description: "Browser-based pixel art tool with layers, animation, and export to GIF",
    url: "https://example.com/pixels",
    color: "#162447",
    accentColor: "#c780fa",
  },
];

// Mall dimensions
const MALL_WIDTH = 60;
const MALL_HEIGHT = 35;
const STOREFRONT_SPACING = 70;
const STOREFRONT_WIDTH = 45;
const STOREFRONT_HEIGHT = 25;
const ALCOVE_DEPTH = 8;
const WALL_X = MALL_WIDTH / 2;

function createScreenTexture(item: PortfolioItem): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = item.color;
  ctx.fillRect(0, 0, 512, 384);

  // Browser chrome
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, 0, 512, 36);
  const dotColors = ["#ff5f57", "#ffbd2e", "#28c840"];
  dotColors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(18 + i * 22, 18, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.roundRect(90, 8, 330, 20, 4);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "11px monospace";
  ctx.fillText(item.url, 100, 23);

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, 36, 512, 32);
  ctx.fillStyle = item.accentColor;
  ctx.fillRect(0, 67, 512, 2);

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  for (let i = 0; i < 4; i++) {
    ctx.roundRect(20 + i * 80, 44, 55, 14, 3);
    ctx.fill();
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText(item.title, 30, 120);

  ctx.fillStyle = item.accentColor;
  ctx.fillRect(30, 130, 120, 3);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "14px sans-serif";
  const words = item.description.split(" ");
  let line = "";
  let y = 160;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > 440) {
      ctx.fillText(line, 30, y);
      line = word + " ";
      y += 22;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, 30, y);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.roundRect(30, y + 30, 200, 100, 8);
  ctx.fill();
  ctx.roundRect(250, y + 30, 230, 100, 8);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let i = 0; i < 4; i++) {
    ctx.roundRect(45, y + 50 + i * 18, 170 - i * 30, 8, 2);
    ctx.fill();
  }
  for (let i = 0; i < 4; i++) {
    ctx.roundRect(265, y + 50 + i * 18, 195 - i * 25, 8, 2);
    ctx.fill();
  }

  ctx.fillStyle = item.accentColor;
  ctx.roundRect(30, 340, 130, 28, 6);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("CLICK TO VISIT \u2192", 42, 359);

  ctx.strokeStyle = item.accentColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, 509, 381);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createSignTexture(title: string, accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, 512, 64);

  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 58, 512, 6);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, 256, 40);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function createFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Checkerboard tile pattern
  const tileSize = 64;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const light = (row + col) % 2 === 0;
      ctx.fillStyle = light ? "#c4a882" : "#b09070";
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      // Grout lines
      ctx.strokeStyle = "#8a7560";
      ctx.lineWidth = 1;
      ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 40);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function createCeilingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#d4c8b8";
  ctx.fillRect(0, 0, 128, 128);
  // Ceiling panel grid
  ctx.strokeStyle = "#c0b4a4";
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 124, 124);

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

  ctx.fillStyle = "#e8ddd0";
  ctx.fillRect(0, 0, 128, 128);
  // Subtle vertical stripe pattern
  ctx.fillStyle = "#e0d5c8";
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
  isShifting: boolean;
  prevTime: number;
}

export default function VirtualPlaza() {
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
    isShifting: false,
    prevTime: performance.now(),
  });
  const instructionsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const ghostCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

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

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd4c8b8);
    scene.fog = new THREE.Fog(0xd4c8b8, 0, mallLength * 0.8);

    // Lighting - warm indoor mall feel
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfff8f0, 0xc4a882, 0.5);
    hemiLight.position.set(0, MALL_HEIGHT, 0);
    scene.add(hemiLight);

    // Controls
    const controls = new PointerLockControls(camera, document.body);

    controls.addEventListener("lock", () => {
      state.isMenuClosed = true;
      if (menuRef.current) menuRef.current.style.display = "none";
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

    // Collision objects
    const collisionObjects: THREE.Mesh[] = [];

    // ── FLOOR ──
    const floorTexture = createFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(MALL_WIDTH, mallLength);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshBasicMaterial({ map: floorTexture });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 0, -mallLength / 2 + 40);
    scene.add(floor);

    // ── CEILING ──
    const ceilingTexture = createCeilingTexture();
    const ceilingGeo = new THREE.PlaneGeometry(MALL_WIDTH, mallLength);
    ceilingGeo.rotateX(Math.PI / 2);
    const ceilingMat = new THREE.MeshBasicMaterial({ map: ceilingTexture });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.set(0, MALL_HEIGHT, -mallLength / 2 + 40);
    scene.add(ceiling);

    // ── WALLS ──
    const wallTexture = createWallTexture();
    const wallMat = new THREE.MeshBasicMaterial({ map: wallTexture });

    // Left wall
    const leftWallTex = wallTexture.clone();
    leftWallTex.repeat.set(40, 4);
    const leftWallGeo = new THREE.PlaneGeometry(mallLength, MALL_HEIGHT);
    const leftWallMat = new THREE.MeshBasicMaterial({ map: leftWallTex });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-WALL_X, MALL_HEIGHT / 2, -mallLength / 2 + 40);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    // Right wall
    const rightWallTex = wallTexture.clone();
    rightWallTex.repeat.set(40, 4);
    const rightWallGeo = new THREE.PlaneGeometry(mallLength, MALL_HEIGHT);
    const rightWallMat = new THREE.MeshBasicMaterial({ map: rightWallTex });
    const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
    rightWall.position.set(WALL_X, MALL_HEIGHT / 2, -mallLength / 2 + 40);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    // Back wall
    const backWallTex = wallTexture.clone();
    backWallTex.repeat.set(6, 4);
    const backWallGeo = new THREE.PlaneGeometry(MALL_WIDTH, MALL_HEIGHT);
    const backWallMat = new THREE.MeshBasicMaterial({ map: backWallTex });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, MALL_HEIGHT / 2, 40);
    backWall.rotation.y = Math.PI;
    scene.add(backWall);

    // End wall
    const endWall = new THREE.Mesh(backWallGeo.clone(), backWallMat.clone());
    endWall.position.set(0, MALL_HEIGHT / 2, -mallLength + 40);
    scene.add(endWall);

    // ── PILLARS between storefronts ──
    const pillarGeo = new THREE.BoxGeometry(3, MALL_HEIGHT, 3);
    const pillarMat = new THREE.MeshBasicMaterial({ color: 0xb8a898 });

    for (let i = 0; i <= PORTFOLIO_ITEMS.length; i++) {
      const z = -i * STOREFRONT_SPACING + 10;
      // Left pillars
      const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
      leftPillar.position.set(-WALL_X + 1.5, MALL_HEIGHT / 2, z);
      scene.add(leftPillar);
      // Right pillars
      const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
      rightPillar.position.set(WALL_X - 1.5, MALL_HEIGHT / 2, z);
      scene.add(rightPillar);
    }

    // ── CEILING LIGHT STRIPS ──
    const lightStripGeo = new THREE.PlaneGeometry(4, mallLength);
    lightStripGeo.rotateX(Math.PI / 2);
    const lightStripMat = new THREE.MeshBasicMaterial({
      color: 0xfffff0,
      transparent: true,
      opacity: 0.9,
    });
    const lightStrip1 = new THREE.Mesh(lightStripGeo, lightStripMat);
    lightStrip1.position.set(-10, MALL_HEIGHT - 0.1, -mallLength / 2 + 40);
    scene.add(lightStrip1);
    const lightStrip2 = new THREE.Mesh(lightStripGeo, lightStripMat);
    lightStrip2.position.set(10, MALL_HEIGHT - 0.1, -mallLength / 2 + 40);
    scene.add(lightStrip2);

    // ── BENCHES down the center ──
    const benchSeatGeo = new THREE.BoxGeometry(12, 1, 4);
    const benchLegGeo = new THREE.BoxGeometry(1, 3, 4);
    const benchMat = new THREE.MeshBasicMaterial({ color: 0x8b7355 });

    for (let i = 0; i < PORTFOLIO_ITEMS.length; i++) {
      const z = -i * STOREFRONT_SPACING - STOREFRONT_SPACING / 2 + 10;
      const seat = new THREE.Mesh(benchSeatGeo, benchMat);
      seat.position.set(0, 3.5, z);
      scene.add(seat);
      collisionObjects.push(seat);

      const leg1 = new THREE.Mesh(benchLegGeo, benchMat);
      leg1.position.set(-5, 1.5, z);
      scene.add(leg1);
      const leg2 = new THREE.Mesh(benchLegGeo, benchMat);
      leg2.position.set(5, 1.5, z);
      scene.add(leg2);
    }

    // ── PLANTERS ──
    const planterGeo = new THREE.CylinderGeometry(2.5, 2, 5, 8);
    const planterMat = new THREE.MeshBasicMaterial({ color: 0xa08060 });
    const plantGeo = new THREE.SphereGeometry(4, 8, 6);
    const plantMat = new THREE.MeshBasicMaterial({ color: 0x6b8f4e });

    for (let i = 0; i <= PORTFOLIO_ITEMS.length; i++) {
      const z = -i * STOREFRONT_SPACING + 10;
      const planter = new THREE.Mesh(planterGeo, planterMat);
      planter.position.set(0, 2.5, z);
      scene.add(planter);
      collisionObjects.push(planter);

      const plant = new THREE.Mesh(plantGeo, plantMat);
      plant.position.set(0, 8, z);
      scene.add(plant);
    }

    // ── STOREFRONTS ──
    const screenMeshes: THREE.Mesh[] = [];
    const screenUrls: Map<string, string> = new Map();

    PORTFOLIO_ITEMS.forEach((item, i) => {
      const side = i % 2 === 0 ? -1 : 1; // alternate left/right
      const z = -i * STOREFRONT_SPACING - STOREFRONT_SPACING / 2 + 10;
      const wallX = side * WALL_X;

      // Storefront alcove - back wall (darker)
      const alcoveBackGeo = new THREE.PlaneGeometry(STOREFRONT_WIDTH, STOREFRONT_HEIGHT);
      const alcoveBackMat = new THREE.MeshBasicMaterial({ color: 0x2a2530 });
      const alcoveBack = new THREE.Mesh(alcoveBackGeo, alcoveBackMat);
      alcoveBack.position.set(
        wallX + side * -ALCOVE_DEPTH,
        STOREFRONT_HEIGHT / 2 + 1,
        z
      );
      alcoveBack.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(alcoveBack);

      // Alcove floor
      const alcoveFloorGeo = new THREE.PlaneGeometry(ALCOVE_DEPTH, STOREFRONT_WIDTH);
      alcoveFloorGeo.rotateX(-Math.PI / 2);
      const alcoveFloorMat = new THREE.MeshBasicMaterial({ color: 0x1a1520 });
      const alcoveFloor = new THREE.Mesh(alcoveFloorGeo, alcoveFloorMat);
      alcoveFloor.position.set(
        wallX + side * (-ALCOVE_DEPTH / 2),
        0.05,
        z
      );
      scene.add(alcoveFloor);

      // Alcove ceiling
      const alcoveCeilGeo = new THREE.PlaneGeometry(ALCOVE_DEPTH, STOREFRONT_WIDTH);
      alcoveCeilGeo.rotateX(Math.PI / 2);
      const alcoveCeilMat = new THREE.MeshBasicMaterial({ color: 0x2a2530 });
      const alcoveCeil = new THREE.Mesh(alcoveCeilGeo, alcoveCeilMat);
      alcoveCeil.position.set(
        wallX + side * (-ALCOVE_DEPTH / 2),
        STOREFRONT_HEIGHT + 1,
        z
      );
      scene.add(alcoveCeil);

      // Alcove side walls
      const alcoveSideGeo = new THREE.PlaneGeometry(ALCOVE_DEPTH, STOREFRONT_HEIGHT);
      const alcoveSideMat = new THREE.MeshBasicMaterial({ color: 0x352f40 });

      const sideWall1 = new THREE.Mesh(alcoveSideGeo, alcoveSideMat);
      sideWall1.position.set(
        wallX + side * (-ALCOVE_DEPTH / 2),
        STOREFRONT_HEIGHT / 2 + 1,
        z + STOREFRONT_WIDTH / 2
      );
      sideWall1.rotation.y = Math.PI;
      scene.add(sideWall1);

      const sideWall2 = new THREE.Mesh(alcoveSideGeo, alcoveSideMat.clone());
      sideWall2.position.set(
        wallX + side * (-ALCOVE_DEPTH / 2),
        STOREFRONT_HEIGHT / 2 + 1,
        z - STOREFRONT_WIDTH / 2
      );
      scene.add(sideWall2);

      // Screen (the portfolio preview)
      const screenW = STOREFRONT_WIDTH - 8;
      const screenH = STOREFRONT_HEIGHT - 6;
      const texture = createScreenTexture(item);
      const screenGeo = new THREE.PlaneGeometry(screenW, screenH);
      const screenMat = new THREE.MeshBasicMaterial({ map: texture });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(
        wallX + side * (-ALCOVE_DEPTH + 0.5),
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

      // Sign above storefront
      const signTexture = createSignTexture(item.title, item.accentColor);
      const signGeo = new THREE.PlaneGeometry(STOREFRONT_WIDTH - 4, 5);
      const signMat = new THREE.MeshBasicMaterial({ map: signTexture, transparent: true });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(wallX + side * -0.5, STOREFRONT_HEIGHT + 4, z);
      sign.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(sign);

      // Accent light strip on floor of alcove
      const accentLightGeo = new THREE.PlaneGeometry(1, STOREFRONT_WIDTH - 4);
      accentLightGeo.rotateX(-Math.PI / 2);
      const accentLightMat = new THREE.MeshBasicMaterial({
        color: item.accentColor,
        transparent: true,
        opacity: 0.6,
      });
      const accentLight = new THREE.Mesh(accentLightGeo, accentLightMat);
      accentLight.position.set(wallX + side * -1, 0.1, z);
      scene.add(accentLight);
    });

    // Welcome text
    const loader = new FontLoader();
    loader.load("/fonts/FiraMono-Regular.json", (font: Font) => {
      const textGeo = new TextGeometry("VIRTUAL PLAZA", {
        font,
        size: 5,
        height: 0.5,
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 3,
      });
      textGeo.computeBoundingBox();
      const textWidth = textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x;
      const textMat = new THREE.MeshBasicMaterial({ color: 0x392f5a });
      const text = new THREE.Mesh(textGeo, textMat);
      text.position.set(-textWidth / 2, MALL_HEIGHT - 8, 39.5);
      text.rotation.y = Math.PI;
      scene.add(text);
    });

    // Crosshair raycaster for clicking screens
    const clickRaycaster = new THREE.Raycaster();
    clickRaycaster.far = 150;

    // Ground raycaster for collision
    const groundRaycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      10
    );

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

    // Keyboard
    function onKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "ArrowUp": case "w": case "W":
          state.moveForward = true;
          if (state.isShifting) state.isSprinting = true;
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
        case "Shift":
          state.isShifting = true;
          if (state.moveForward) state.isSprinting = true;
          break;
        case " ":
          if (state.canJump) velocity.y += 275;
          state.canJump = false;
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
        case "Shift":
          state.isShifting = false;
          state.isSprinting = false;
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

      if (controls.isLocked) {
        const playerPos = controls.getObject().position;

        groundRaycaster.ray.origin.copy(playerPos);
        groundRaycaster.ray.origin.y -= 10;

        const intersections = groundRaycaster.intersectObjects(collisionObjects);
        const onObject = intersections.length > 0;
        const delta = (time - state.prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 90.0 * delta;

        direction.z = Number(state.moveForward) - Number(state.moveBackward);
        direction.x = Number(state.moveRight) - Number(state.moveLeft);
        direction.normalize();

        if (state.moveForward || state.moveBackward) {
          velocity.z -= direction.z * 400.0 * delta;
        }
        if (state.moveLeft || state.moveRight) {
          velocity.x -= direction.x * 400.0 * delta;
        }

        if (onObject) {
          velocity.y = Math.max(0, velocity.y);
          state.canJump = true;
        }

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(
          -velocity.z * delta + Number(state.isSprinting) * 0.75
        );
        playerPos.y += velocity.y * delta;

        if (playerPos.y < 10) {
          velocity.y = 0;
          playerPos.y = 10;
          state.canJump = true;
        }

        // Keep player inside the mall corridor
        playerPos.x = Math.max(-WALL_X + 3, Math.min(WALL_X - 3, playerPos.x));
        playerPos.z = Math.max(-mallLength + 43, Math.min(38, playerPos.z));
      }

      state.prevTime = time;
      renderer.render(scene, camera);
    }

    animate();

    // Ghost cursor
    const cleanupGhost = initGhostCursor();

    // Click handler
    function onClick(e: MouseEvent) {
      if (controls.isLocked) {
        clickRaycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = clickRaycaster.intersectObjects(screenMeshes);
        if (hits.length > 0) {
          const url = screenUrls.get(hits[0].object.uuid);
          if (url) {
            controls.unlock();
            window.open(url, "_blank");
          }
        }
        return;
      }

      if (!containerRef.current?.contains(e.target as Node) &&
          !instructionsRef.current?.contains(e.target as Node) &&
          !menuRef.current?.contains(e.target as Node)) {
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

    return () => {
      disposed = true;
      if (controls.isLocked) {
        controls.unlock();
      }
      controls.dispose();
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("click", onClick);
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
          backgroundColor: "rgba(57, 47, 90, 0.75)",
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
            color: "white",
            fontFamily: "'FiraMono', monospace",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", lineHeight: 1.8 }}>
            Welcome to the virtual plaza.
            <br />
            <br />
            Walk through the mall and explore my portfolio.
          </h2>
          <br />
          <br />
          <br />
          <span style={{ fontSize: "36px" }}>Click to play</span>
          <br />
          <br />
          Move: WASD
          <br />
          Jump: SPACE
          <br />
          Look: MOUSE
          <br />
          Sprint: LShift
        </div>
      </div>
      <div ref={menuRef} style={{ display: "none" }}>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(57, 47, 90, 0.5)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(57, 47, 90, 0.75)",
              height: "50%",
              width: "50%",
              zIndex: 1001,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              color: "#A8C7BB",
              fontFamily: "'FiraMono', monospace",
            }}
          >
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Menu</h1>
            <Link href="/journal" style={{ color: "#A8C7BB", textDecoration: "underline", marginBottom: "0.5rem" }}>
              Journal
            </Link>
            <Link href="/things-i-will-not-do" style={{ color: "#A8C7BB", textDecoration: "underline" }}>
              Things I Will Not Do
            </Link>
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
          <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: "2px", backgroundColor: "rgba(255,255,255,0.6)", transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", left: "50%", top: 0, height: "100%", width: "2px", backgroundColor: "rgba(255,255,255,0.6)", transform: "translateX(-50%)" }} />
        </div>
      </div>
      <div ref={containerRef} />
    </>
  );
}
