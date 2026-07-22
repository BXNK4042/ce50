"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface Room3DViewerProps {
  roomId: string;
  lang: string;
}

export default function Room3DViewer({ roomId, lang }: Room3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [glowingMode, setGlowingMode] = useState(false);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const isTh = lang === "th";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(roomId === "server-room" ? 0x070c18 : 0x0f172a);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(12, 10, 16);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go below floor
    controls.minDistance = 5;
    controls.maxDistance = 35;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(
      roomId === "server-room" ? 0x1e293b : 0xf8fafc,
      roomId === "server-room" ? 0.8 : 1.2
    );
    scene.add(ambientLight);

    // Main Directional Light
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(15, 25, 15);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    // Point lights for ambient mood
    const bluePointLight = new THREE.PointLight(0x0284c7, 3, 20);
    bluePointLight.position.set(-6, 6, -4);
    scene.add(bluePointLight);

    const cyanPointLight = new THREE.PointLight(roomId === "server-room" ? 0x06b6d4 : 0x3b82f6, 3, 20);
    cyanPointLight.position.set(6, 6, 4);
    scene.add(cyanPointLight);

    // -------------------------------------------------------------
    // BUILD 3D ROOM SCENE BASED ON ROOM ID
    // -------------------------------------------------------------
    if (roomId === "server-room") {
      // SERVER ROOM (DATA CENTER)
      // Floor (Dark metallic grid)
      const floorGeo = new THREE.PlaneGeometry(24, 24);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        roughness: 0.2,
        metalness: 0.8,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // Floor Grid helper
      const gridHelper = new THREE.GridHelper(24, 24, 0x0284c7, 0x1e293b);
      gridHelper.position.y = 0.01;
      scene.add(gridHelper);

      // Back Wall
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 10, 0.4), wallMat);
      backWall.position.set(0, 5, -12);
      scene.add(backWall);

      // Server Racks Rows (2 parallel rows of 4 racks each)
      const rackGeo = new THREE.BoxGeometry(2.2, 7, 2.5);
      const rackMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.7 });

      const serverUnitGeo = new THREE.BoxGeometry(2.0, 0.4, 2.3);
      const ledGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);

      const ledGreenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const ledBlueMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
      const ledAmberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

      [-5, 5].forEach((xPos) => {
        [-7, -2.5, 2.5, 7].forEach((zPos) => {
          // Rack Cabinet
          const rack = new THREE.Mesh(rackGeo, rackMat);
          rack.position.set(xPos, 3.5, zPos);
          rack.castShadow = true;
          rack.receiveShadow = true;
          scene.add(rack);

          // Server Units inside Rack
          for (let y = 1; y <= 6; y += 0.8) {
            const serverUnitMat = new THREE.MeshStandardMaterial({
              color: y % 2 === 0 ? 0x1f2937 : 0x374151,
              metalness: 0.9,
              roughness: 0.2,
            });
            const unit = new THREE.Mesh(serverUnitGeo, serverUnitMat);
            unit.position.set(xPos, y + 0.3, zPos);
            scene.add(unit);

            // Blinking Status LEDs on server front
            const ledCount = 3;
            for (let i = 0; i < ledCount; i++) {
              const ledMat = i === 0 ? ledGreenMat : i === 1 ? ledBlueMat : ledAmberMat;
              const led = new THREE.Mesh(ledGeo, ledMat);
              const xOffset = xPos > 0 ? -1.05 : 1.05;
              led.position.set(xPos + xOffset, y + 0.3, zPos - 0.6 + i * 0.4);
              scene.add(led);
            }
          }
        });
      });

      // Overhead Cable Trays
      const trayGeo = new THREE.BoxGeometry(24, 0.2, 0.8);
      const trayMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.8 });
      const tray1 = new THREE.Mesh(trayGeo, trayMat);
      tray1.position.set(0, 7.5, -5);
      scene.add(tray1);

      const tray2 = new THREE.Mesh(trayGeo, trayMat);
      tray2.position.set(0, 7.5, 5);
      scene.add(tray2);
    } else {
      // CLASSROOM 113 (COMPUTER LAB)
      // Floor (Light clean lab floor)
      const floorGeo = new THREE.PlaneGeometry(24, 20);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.4,
        metalness: 0.1,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // Floor Grid helper
      const gridHelper = new THREE.GridHelper(24, 20, 0x94a3b8, 0xcbd5e1);
      gridHelper.position.y = 0.01;
      scene.add(gridHelper);

      // Front Wall & Whiteboard
      const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(24, 9, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc })
      );
      backWall.position.set(0, 4.5, -10);
      scene.add(backWall);

      // Interactive Projector / Whiteboard Screen
      const boardGeo = new THREE.BoxGeometry(10, 5, 0.1);
      const boardMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(0, 5, -9.7);
      scene.add(board);

      // Teacher Podium Desk
      const podDesk = new THREE.Mesh(
        new THREE.BoxGeometry(4, 2.5, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      podDesk.position.set(0, 1.25, -7);
      podDesk.castShadow = true;
      scene.add(podDesk);

      // Student Computer Desks & Workstations (3 rows of 3 desks)
      const deskGeo = new THREE.BoxGeometry(5.5, 2.2, 2);
      const deskMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

      const monitorGeo = new THREE.BoxGeometry(1.4, 1.0, 0.1);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const standGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
      const standMat = new THREE.MeshStandardMaterial({ color: 0x334155 });

      const chairGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });

      [-6, 0, 6].forEach((xPos) => {
        [-3, 2, 7].forEach((zPos) => {
          // Desk
          const desk = new THREE.Mesh(deskGeo, deskMat);
          desk.position.set(xPos, 1.1, zPos);
          desk.castShadow = true;
          desk.receiveShadow = true;
          scene.add(desk);

          // 2 Workstations per desk
          [-1.5, 1.5].forEach((mOffset) => {
            // Monitor Screen
            const screen = new THREE.Mesh(monitorGeo, screenMat);
            screen.position.set(xPos + mOffset, 2.7, zPos - 0.4);
            scene.add(screen);

            // Monitor Stand
            const stand = new THREE.Mesh(standGeo, standMat);
            stand.position.set(xPos + mOffset, 2.35, zPos - 0.4);
            scene.add(stand);

            // Chair
            const chair = new THREE.Mesh(chairGeo, chairMat);
            chair.position.set(xPos + mOffset, 0.8, zPos + 1.4);
            chair.castShadow = true;
            scene.add(chair);
          });
        });
      });
    }

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [roomId]);

  const handleToggleAutoRotate = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !autoRotate;
      setAutoRotate(!autoRotate);
    }
  };

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(12, 10, 16);
    }
  };

  const handleToggleGlowing = () => {
    if (sceneRef.current) {
      setGlowingMode(!glowingMode);
      sceneRef.current.background = new THREE.Color(
        !glowingMode ? 0x030712 : roomId === "server-room" ? 0x070c18 : 0x0f172a
      );
    }
  };

  return (
    <div className="relative w-full h-[450px] md:h-[520px] rounded-3xl overflow-hidden border border-blue-200/80 dark:border-zinc-800 bg-slate-950 shadow-2xl group">
      {/* 3D Canvas Mount Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Badge & Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-xs font-bold text-white border border-white/10 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {isTh ? "โมเดล 3D จำลองห้อง interactive" : "Interactive 3D Room Model"}
        </span>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md text-xs text-zinc-300 border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-sky-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
          </svg>
          {isTh ? "ลากเพื่อหมุน 360° | ซูมเพื่อขยาย" : "Drag to rotate 360° | Scroll to zoom"}
        </span>
      </div>

      {/* Top Right Action Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={handleToggleAutoRotate}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all border ${
            autoRotate
              ? "bg-blue-600/80 text-white border-blue-400/50 shadow-lg shadow-blue-500/20"
              : "bg-black/50 text-zinc-300 border-white/10 hover:bg-black/80"
          }`}
        >
          {autoRotate ? (isTh ? "⏸️ หมุนอัตโนมัติ" : "⏸️ Auto-Rotate") : (isTh ? "▶️ หมุนอัตโนมัติ" : "▶️ Auto-Rotate")}
        </button>

        <button
          type="button"
          onClick={handleToggleGlowing}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all border ${
            glowingMode
              ? "bg-amber-500/80 text-white border-amber-400/50"
              : "bg-black/50 text-zinc-300 border-white/10 hover:bg-black/80"
          }`}
        >
          {isTh ? "💡 โหมดมืด/สว่าง" : "💡 Night/Glow Mode"}
        </button>

        <button
          type="button"
          onClick={handleResetView}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/50 hover:bg-black/80 text-zinc-200 border border-white/10 backdrop-blur-md transition-all"
        >
          {isTh ? "🔄 มุมมองเริ่มต้น" : "🔄 Reset View"}
        </button>
      </div>

      {/* Bottom Floating Hint Overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-medium text-zinc-300 border border-white/10 shadow-lg text-center">
          {isTh ? "หมุนเพื่อรับชมบรรยากาศและโครงสร้างภายในห้องแบบ 3 มิติ" : "Rotate to view 3D room interior and layout from any angle"}
        </div>
      </div>
    </div>
  );
}
