"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";

export interface UseWebGLOptions {
  vertexShader: string;
  fragmentShader: string;
  uniforms: {
    uSeed: number;
    uCausticCount: number;
    uGemType: number;
    uCutType: number;
    uRarity: number;
    uMotionStyle: number;
    uMotionCadence: number;
    uLightCadence: number;
    uSparkleCadence: number;
    uGlowCadence: number;
    uColorCadence: number;
    uMotionIntensity: number;
    uSparkleIntensity: number;
    uGlowIntensity: number;
    uMotionPhase: number;
    size: number;
    /** Explicit canvas pixel resolution. When omitted, defaults to size × devicePixelRatio. */
    resolution?: number;
  };
  /** Render a single frame and stop. Default: false */
  isStatic?: boolean;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "HashedGem shader compile error:",
      gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// ── Shared offscreen renderer ─────────────────────────────────────────────

interface SharedRenderer {
  gl: WebGL2RenderingContext;
  canvas: OffscreenCanvas | HTMLCanvasElement;
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  locs: {
    uTime: WebGLUniformLocation | null;
    uSeed: WebGLUniformLocation | null;
    uCausticCount: WebGLUniformLocation | null;
    uResolution: WebGLUniformLocation | null;
    uGemType: WebGLUniformLocation | null;
    uCutType: WebGLUniformLocation | null;
    uRarity: WebGLUniformLocation | null;
    uMotionStyle: WebGLUniformLocation | null;
    uMotionCadence: WebGLUniformLocation | null;
    uLightCadence: WebGLUniformLocation | null;
    uSparkleCadence: WebGLUniformLocation | null;
    uGlowCadence: WebGLUniformLocation | null;
    uColorCadence: WebGLUniformLocation | null;
    uMotionIntensity: WebGLUniformLocation | null;
    uSparkleIntensity: WebGLUniformLocation | null;
    uGlowIntensity: WebGLUniformLocation | null;
    uMotionPhase: WebGLUniformLocation | null;
  };
}

let shared: SharedRenderer | null = null;
let sharedRefCount = 0;

function getShared(
  vertexShader: string,
  fragmentShader: string,
): SharedRenderer | null {
  if (shared) {
    sharedRefCount++;
    return shared;
  }

  let canvas: OffscreenCanvas | HTMLCanvasElement;
  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(1, 1);
  } else {
    canvas = document.createElement("canvas");
  }

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  }) as WebGL2RenderingContext | null;
  if (!gl) return null;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const vert = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  if (!vert || !frag) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      "HashedGem program link error:",
      gl.getProgramInfoLog(program),
    );
    gl.deleteProgram(program);
    return null;
  }

  const positions = new Float32Array([-1, -1, 3, -1, -1, 3]);
  const vao = gl.createVertexArray();
  if (!vao) return null;
  const vbo = gl.createBuffer();

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  shared = {
    gl,
    canvas,
    program,
    vao,
    locs: {
      uTime: gl.getUniformLocation(program, "uTime"),
      uSeed: gl.getUniformLocation(program, "uSeed"),
      uCausticCount: gl.getUniformLocation(program, "uCausticCount"),
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uGemType: gl.getUniformLocation(program, "uGemType"),
      uCutType: gl.getUniformLocation(program, "uCutType"),
      uRarity: gl.getUniformLocation(program, "uRarity"),
      uMotionStyle: gl.getUniformLocation(program, "uMotionStyle"),
      uMotionCadence: gl.getUniformLocation(program, "uMotionCadence"),
      uLightCadence: gl.getUniformLocation(program, "uLightCadence"),
      uSparkleCadence: gl.getUniformLocation(program, "uSparkleCadence"),
      uGlowCadence: gl.getUniformLocation(program, "uGlowCadence"),
      uColorCadence: gl.getUniformLocation(program, "uColorCadence"),
      uMotionIntensity: gl.getUniformLocation(program, "uMotionIntensity"),
      uSparkleIntensity: gl.getUniformLocation(program, "uSparkleIntensity"),
      uGlowIntensity: gl.getUniformLocation(program, "uGlowIntensity"),
      uMotionPhase: gl.getUniformLocation(program, "uMotionPhase"),
    },
  };
  sharedRefCount = 1;
  return shared;
}

function releaseShared(): void {
  sharedRefCount--;
  if (sharedRefCount <= 0 && shared) {
    const { gl, program, vao } = shared;
    gl.deleteProgram(program);
    gl.deleteVertexArray(vao);
    shared = null;
    sharedRefCount = 0;
  }
}

// ── Centralized render loop ───────────────────────────────────────────────
// ONE rAF callback renders ALL registered gem instances.
// Benefits:
// - 1 rAF instead of N (eliminates callback overhead)
// - Throttled to ~24fps (animation is slow, 60fps is waste)
// - Gems sorted by canvas size to minimize offscreen canvas resizes
// - Skips off-screen gems via IntersectionObserver

interface GemInstance {
  canvas: HTMLCanvasElement;
  ctx2d: CanvasRenderingContext2D;
  w: number;
  h: number;
  uSeed: number;
  uCausticCount: number;
  uGemType: number;
  uCutType: number;
  uRarity: number;
  uMotionStyle: number;
  uMotionCadence: number;
  uLightCadence: number;
  uSparkleCadence: number;
  uGlowCadence: number;
  uColorCadence: number;
  uMotionIntensity: number;
  uSparkleIntensity: number;
  uGlowIntensity: number;
  uMotionPhase: number;
  startTime: number;
  isVisible: boolean;
}

const instances = new Set<GemInstance>();
let loopId = 0;
let lastFrameTime = 0;
const TARGET_FPS = 24;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

function renderInstance(
  renderer: SharedRenderer,
  inst: GemInstance,
  now: number,
): void {
  const { gl, canvas, program, vao, locs } = renderer;
  const { w, h } = inst;

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // biome-ignore lint/correctness/useHookAtTopLevel: false positive - gl.useProgram is WebGL API
  gl.useProgram(program);
  gl.bindVertexArray(vao);

  const time = (now - inst.startTime) / 1000;
  gl.uniform1f(locs.uTime, time);
  gl.uniform1f(locs.uSeed, inst.uSeed);
  gl.uniform1i(locs.uCausticCount, inst.uCausticCount);
  gl.uniform2f(locs.uResolution, w, h);
  gl.uniform1i(locs.uGemType, inst.uGemType);
  gl.uniform1i(locs.uCutType, inst.uCutType);
  gl.uniform1i(locs.uRarity, inst.uRarity);
  gl.uniform1i(locs.uMotionStyle, inst.uMotionStyle);
  gl.uniform1f(locs.uMotionCadence, inst.uMotionCadence);
  gl.uniform1f(locs.uLightCadence, inst.uLightCadence);
  gl.uniform1f(locs.uSparkleCadence, inst.uSparkleCadence);
  gl.uniform1f(locs.uGlowCadence, inst.uGlowCadence);
  gl.uniform1f(locs.uColorCadence, inst.uColorCadence);
  gl.uniform1f(locs.uMotionIntensity, inst.uMotionIntensity);
  gl.uniform1f(locs.uSparkleIntensity, inst.uSparkleIntensity);
  gl.uniform1f(locs.uGlowIntensity, inst.uGlowIntensity);
  gl.uniform1f(locs.uMotionPhase, inst.uMotionPhase);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindVertexArray(null);

  inst.ctx2d.clearRect(0, 0, w, h);
  inst.ctx2d.drawImage(canvas as CanvasImageSource, 0, 0);
}

function renderLoop(now: number): void {
  if (instances.size === 0) {
    loopId = 0;
    return;
  }
  loopId = requestAnimationFrame(renderLoop);

  // Throttle: skip frame if too soon
  if (now - lastFrameTime < FRAME_INTERVAL) return;
  lastFrameTime = now;

  if (!shared) return;

  // Sort by canvas size to minimize offscreen canvas resizes
  // (most gems are the same size, so this is often a no-op)
  const visible: GemInstance[] = [];
  for (const inst of instances) {
    if (inst.isVisible) visible.push(inst);
  }
  if (visible.length === 0) return;

  visible.sort((a, b) => a.w * a.h - b.w * b.h);

  // Set GL state once for the entire batch
  const { gl, program, vao } = shared;
  // biome-ignore lint/correctness/useHookAtTopLevel: false positive - gl.useProgram is WebGL API
  gl.useProgram(program);
  gl.bindVertexArray(vao);

  for (const inst of visible) {
    renderInstance(shared, inst, now);
  }

  gl.bindVertexArray(null);
}

function startLoop(): void {
  if (loopId) return;
  lastFrameTime = 0;
  loopId = requestAnimationFrame(renderLoop);
}

function stopLoop(): void {
  if (loopId) {
    cancelAnimationFrame(loopId);
    loopId = 0;
  }
}

function registerInstance(inst: GemInstance): void {
  instances.add(inst);
  startLoop();
}

function unregisterInstance(inst: GemInstance): void {
  instances.delete(inst);
  if (instances.size === 0) stopLoop();
}

// Shared IntersectionObserver — one observer for ALL gems
let sharedObserver: IntersectionObserver | null = null;
const observerMap = new WeakMap<HTMLCanvasElement, GemInstance>();

function getSharedObserver(): IntersectionObserver | null {
  if (sharedObserver) return sharedObserver;
  if (typeof IntersectionObserver === "undefined") return null;

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const inst = observerMap.get(entry.target as HTMLCanvasElement);
        if (inst) {
          inst.isVisible = entry.isIntersecting;
        }
      }
    },
    { threshold: 0 },
  );
  return sharedObserver;
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useWebGL(
  options: UseWebGLOptions,
): React.RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const { vertexShader, fragmentShader, uniforms, isStatic = false } = options;
  const {
    uSeed,
    uCausticCount,
    uGemType,
    uCutType,
    uRarity,
    uMotionStyle,
    uMotionCadence,
    uLightCadence,
    uSparkleCadence,
    uGlowCadence,
    uColorCadence,
    uMotionIntensity,
    uSparkleIntensity,
    uGlowIntensity,
    uMotionPhase,
    size,
    resolution,
  } = uniforms;
  const shouldRenderStatic = isStatic || prefersReducedMotion;

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return () => undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => undefined;

    const dpr =
      typeof window !== "undefined" ? (window.devicePixelRatio ?? 1) : 1;
    const w = resolution ?? Math.round(size * dpr);
    const h = resolution ?? Math.round(size * dpr);
    canvas.width = w;
    canvas.height = h;

    const ctx2d = canvas.getContext("2d", { alpha: true });
    if (!ctx2d) return () => undefined;

    const renderer = getShared(vertexShader, fragmentShader);
    if (!renderer) return () => undefined;

    const now = performance.now();

    // ── Static mode: render one frame and stop ──
    if (shouldRenderStatic) {
      renderInstance(
        renderer,
        {
          canvas,
          ctx2d,
          w,
          h,
          uSeed,
          uCausticCount,
          uGemType,
          uCutType,
          uRarity,
          uMotionStyle,
          uMotionCadence,
          uLightCadence,
          uSparkleCadence,
          uGlowCadence,
          uColorCadence,
          uMotionIntensity,
          uSparkleIntensity,
          uGlowIntensity,
          uMotionPhase,
          startTime: now,
          isVisible: true,
        },
        now,
      );
      return () => {
        releaseShared();
      };
    }

    // ── Animated mode: register with centralized loop ──
    const inst: GemInstance = {
      canvas,
      ctx2d,
      w,
      h,
      uSeed,
      uCausticCount,
      uGemType,
      uCutType,
      uRarity,
      uMotionStyle,
      uMotionCadence,
      uLightCadence,
      uSparkleCadence,
      uGlowCadence,
      uColorCadence,
      uMotionIntensity,
      uSparkleIntensity,
      uGlowIntensity,
      uMotionPhase,
      startTime: now,
      isVisible: true,
    };

    // Use shared IntersectionObserver
    const observer = getSharedObserver();
    if (observer) {
      observerMap.set(canvas, inst);
      observer.observe(canvas);
    }

    registerInstance(inst);

    return () => {
      unregisterInstance(inst);
      if (observer) {
        observer.unobserve(canvas);
        observerMap.delete(canvas);
      }
      releaseShared();
    };
  }, [
    vertexShader,
    fragmentShader,
    uSeed,
    uCausticCount,
    uGemType,
    uCutType,
    uRarity,
    uMotionStyle,
    uMotionCadence,
    uLightCadence,
    uSparkleCadence,
    uGlowCadence,
    uColorCadence,
    uMotionIntensity,
    uSparkleIntensity,
    uGlowIntensity,
    uMotionPhase,
    size,
    resolution,
    shouldRenderStatic,
  ]);

  return canvasRef;
}
