"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { demoImages, categoryMeta, imageUrl, type DemoImage } from "@/lib/demoImages";

const SCALE = 1.35; // spreads the hand-placed cluster coordinates out a bit

// A neutral white radial falloff. Category color is applied afterwards via
// SpriteMaterial.color so each cluster's glow reads as its own hue.
function makeGlowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.65)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.25)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

interface SpriteEntry {
  image: DemoImage;
  sprite: THREE.Sprite;
  glow: THREE.Sprite;
  basePosition: THREE.Vector3;
  phase: number;
}

interface EmbeddingVisualizerProps {
  highlightedIds: string[];
  onSelect?: (image: DemoImage | null) => void;
}

export function EmbeddingVisualizer({ highlightedIds, onSelect }: EmbeddingVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const entriesRef = useRef<SpriteEntry[]>([]);
  const highlightedRef = useRef<Set<string>>(new Set());
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    highlightedRef.current = new Set(highlightedIds);
  }, [highlightedIds]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      48,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.6, 8.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 13;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.35;

    const glowTexture = makeGlowTexture();
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";

    const entries: SpriteEntry[] = [];
    let loaded = 0;

    demoImages.forEach((image, i) => {
      const basePosition = new THREE.Vector3(
        image.position[0] * SCALE,
        image.position[1] * SCALE,
        image.position[2] * SCALE
      );

      // Category-tinted glow, sits behind the photo sprite.
      const glowMat = new THREE.SpriteMaterial({
        map: glowTexture,
        color: new THREE.Color(categoryMeta[image.category].color),
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const glow = new THREE.Sprite(glowMat);
      glow.scale.set(1.9, 1.9, 1);
      glow.position.copy(basePosition);
      scene.add(glow);

      const material = new THREE.SpriteMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(1, 1, 1);
      sprite.position.copy(basePosition);
      sprite.userData.image = image;
      scene.add(sprite);

      loader.load(imageUrl(image.seed, 200), (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
        loaded += 1;
        setLoadedCount(loaded);
      });

      entries.push({ image, sprite, glow, basePosition, phase: i * 0.7 });
    });
    entriesRef.current = entries;

    // Faint lines between images that share a category, hinting at
    // nearest-neighbor structure without cluttering the scene.
    const linePositions: number[] = [];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        if (entries[i].image.category !== entries[j].image.category) continue;
        linePositions.push(
          entries[i].basePosition.x,
          entries[i].basePosition.y,
          entries[i].basePosition.z,
          entries[j].basePosition.x,
          entries[j].basePosition.y,
          entries[j].basePosition.z
        );
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(linePositions), 3)
    );
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Interaction: hover + click to inspect a single image.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered: SpriteEntry | null = null;

    function spriteAtPointer(clientX: number, clientY: number): SpriteEntry | null {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(entries.map((e) => e.sprite));
      if (hits.length === 0) return null;
      return entries.find((e) => e.sprite === hits[0].object) ?? null;
    }

    const handlePointerMove = (e: PointerEvent) => {
      hovered = spriteAtPointer(e.clientX, e.clientY);
      renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
    };
    const handleClick = (e: PointerEvent) => {
      const hit = spriteAtPointer(e.clientX, e.clientY);
      onSelectRef.current?.(hit ? hit.image : null);
    };
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("click", handleClick);

    const focusTarget = new THREE.Vector3(0, 0, 0);
    let frameId: number;
    let t = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.016;

      const activeHighlights = highlightedRef.current;
      const hasActive = activeHighlights.size > 0;

      if (hasActive) {
        const sum = new THREE.Vector3();
        let count = 0;
        for (const entry of entries) {
          if (activeHighlights.has(entry.image.id)) {
            sum.add(entry.basePosition);
            count += 1;
          }
        }
        if (count > 0) sum.divideScalar(count);
        focusTarget.copy(count > 0 ? sum : new THREE.Vector3());
      } else {
        focusTarget.set(0, 0, 0);
      }
      controls.target.lerp(focusTarget, 0.04);
      controls.autoRotate = !reduceMotion && !hasActive;

      for (const entry of entries) {
        const isHighlighted = activeHighlights.has(entry.image.id);
        const isHovered = hovered === entry;
        const bob = reduceMotion
          ? 0
          : Math.sin(t * 0.6 + entry.phase) * 0.05;
        entry.sprite.position.set(
          entry.basePosition.x,
          entry.basePosition.y + bob,
          entry.basePosition.z
        );
        entry.glow.position.copy(entry.sprite.position);

        const targetScale = isHighlighted ? 1.5 : isHovered ? 1.2 : 1;
        entry.sprite.scale.x += (targetScale - entry.sprite.scale.x) * 0.15;
        entry.sprite.scale.y += (targetScale - entry.sprite.scale.y) * 0.15;

        const mat = entry.sprite.material as THREE.SpriteMaterial;
        const targetOpacity = hasActive && !isHighlighted ? 0.28 : 1;
        mat.opacity += (targetOpacity - mat.opacity) * 0.12;

        const glowMat = entry.glow.material as THREE.SpriteMaterial;
        const targetGlowOpacity = isHighlighted ? 1 : 0;
        glowMat.opacity += (targetGlowOpacity - glowMat.opacity) * 0.12;
        const targetGlowScale = isHighlighted ? 2.2 : 1.9;
        entry.glow.scale.x += (targetGlowScale - entry.glow.scale.x) * 0.15;
        entry.glow.scale.y += (targetGlowScale - entry.glow.scale.y) * 0.15;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    setReady(true);

    const updateSize = () => {
      const { clientWidth, clientHeight } = mount;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(mount);

    // The very first layout pass can still report a 0-size container (a
    // known race between hydration and CSS grid/flex layout), which would
    // otherwise leave the canvas permanently sized at 0. Re-check across a
    // couple of frames once layout has definitely settled.
    requestAnimationFrame(() => requestAnimationFrame(updateSize));

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("click", handleClick);
      controls.dispose();
      glowTexture.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      for (const entry of entries) {
        entry.sprite.material.map?.dispose();
        (entry.sprite.material as THREE.Material).dispose();
        (entry.glow.material as THREE.Material).dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
      {(!ready || loadedCount < demoImages.length) && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-raised">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-accent-warm/30" />
            <p className="font-mono text-[12px] text-fg-faint">
              Loading demo images{ready ? ` (${loadedCount}/${demoImages.length})` : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
