"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

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
  const sceneRef = useRef<{
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    controls: PointerLockControls;
    objects: THREE.Mesh[];
    raycaster: THREE.Raycaster;
    velocity: THREE.Vector3;
    direction: THREE.Vector3;
  } | null>(null);
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
    const vertex = new THREE.Vector3();
    const color = new THREE.Color();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      (window.innerHeight * (4 / 3)) / window.innerHeight,
      0.1,
      1500
    );
    camera.position.y = 10;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7996e);
    scene.fog = new THREE.Fog(0xb89fa5, 0, 1000);

    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    // Controls
    const controls = new PointerLockControls(camera, document.body);

    controls.addEventListener("lock", () => {
      state.isMenuClosed = true;
      if (menuRef.current) menuRef.current.style.display = "none";
    });

    controls.addEventListener("unlock", () => {
      state.isMenuClosed = false;
      if (menuRef.current) menuRef.current.style.display = "";
      if (ghostCanvasRef.current)
        ghostCanvasRef.current.style.display = "";
      if (state.hasClicked) {
        state.canLock = false;
        setTimeout(() => {
          state.canLock = true;
        }, 1500);
      }
    });

    scene.add(controls.getObject());

    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      10
    );

    // Floor
    let floorGeometry: THREE.BufferGeometry = new THREE.PlaneGeometry(2000, 1000, 100, 100);
    floorGeometry.rotateX(-Math.PI / 2);

    let position = floorGeometry.attributes.position;
    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);
      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 2;
      vertex.z += Math.random() * 20 - 10;
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    floorGeometry = floorGeometry.toNonIndexed();
    position = floorGeometry.attributes.position;
    const colorsFloor: number[] = [];
    for (let i = 0, l = position.count; i < l; i++) {
      color.setHSL(
        Math.random() * 0.3 + 0.5,
        0.75,
        Math.random() * 0.25 + 0.75
      );
      colorsFloor.push(color.r, color.g, color.b);
    }
    floorGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colorsFloor, 3)
    );

    const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);

    // Boxes
    const objects: THREE.Mesh[] = [];
    const boxGeometry = new THREE.BoxGeometry(20, 20, 20).toNonIndexed();

    for (let i = 0; i < 500; i++) {
      const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x8aaf5f });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
      box.position.y = Math.floor(Math.random() * 20) * 20 + 10;
      box.position.z = Math.floor(Math.random() * 20 - 10) * 20;
      scene.add(box);
      objects.push(box);
    }

    // Text
    const loader = new FontLoader();
    loader.load("/fonts/FiraMono-Regular.json", (font: Font) => {
      const textGeometry = new TextGeometry("whats up!", {
        font,
        size: 10,
        height: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 5,
      });
      const textMaterial = new THREE.MeshBasicMaterial({
        color: 0x392f5a,
        wireframe: true,
      });
      const text = new THREE.Mesh(textGeometry, textMaterial);
      text.position.set(10, 10, 10);
      scene.add(text);
    });

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio / 4);
    renderer.setSize(window.innerHeight * (4 / 3), window.innerHeight);
    renderer.domElement.style.margin = "0 auto";
    renderer.domElement.style.display = "block";
    containerRef.current.appendChild(renderer.domElement);

    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    sceneRef.current = {
      camera,
      scene,
      renderer,
      controls,
      objects,
      raycaster,
      velocity,
      direction,
    };

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
        case "ArrowUp":
        case "w":
        case "W":
          state.moveForward = true;
          if (state.isShifting) state.isSprinting = true;
          break;
        case "ArrowLeft":
        case "a":
          state.moveLeft = true;
          break;
        case "ArrowDown":
        case "s":
          state.moveBackward = true;
          break;
        case "ArrowRight":
        case "d":
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
        case "ArrowUp":
        case "w":
        case "W":
          state.moveForward = false;
          state.isSprinting = false;
          break;
        case "ArrowLeft":
        case "a":
          state.moveLeft = false;
          break;
        case "ArrowDown":
        case "s":
          state.moveBackward = false;
          break;
        case "ArrowRight":
        case "d":
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
    function animate() {
      animFrameRef.current = requestAnimationFrame(() => {
        setTimeout(animate, 1000 / 30);
      });

      const time = performance.now();

      if (controls.isLocked) {
        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        const intersections = raycaster.intersectObjects(objects);
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
        controls.getObject().position.y += velocity.y * delta;

        if (controls.getObject().position.y < 10) {
          velocity.y = 0;
          controls.getObject().position.y = 10;
          state.canJump = true;
        }
      }

      state.prevTime = time;
      renderer.render(scene, camera);
    }

    animate();

    // Ghost cursor
    const cleanupGhost = initGhostCursor();

    // Click handler
    function onClick() {
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
            Live out your wildest dreams in the endless, sunset landscape.
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
      <div
        ref={menuRef}
        style={{ display: "none" }}
      >
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
      <div ref={containerRef} />
    </>
  );
}
