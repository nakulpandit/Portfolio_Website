import { OrbitControls, Sparkles } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { galaxies } from '../../data/galaxies';
import { useStore } from '../../store/useStore';
import starfieldFragment from '../../shaders/starfield.glsl?raw';
import Galaxy from './Galaxy';
import GalaxyInterior from './GalaxyInterior';
import WarpEffect from './WarpEffect';

const basicVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const postFxFragment = `
  uniform float uTime;
  uniform float uWarp;
  uniform float uTransition;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv - 0.5;
    float radius = length(centered * vec2(1.08, 0.92));
    float vignette = smoothstep(1.02, 0.18, radius);
    float noise = (hash(uv * vec2(1024.0, 768.0) + uTime) - 0.5) * 0.04;
    float pulse = 0.5 + 0.5 * sin(uTime * 3.2 + radius * 18.0);
    float streak = 0.5 + 0.5 * sin(radius * 28.0 - uTime * 11.0);
    float haze = smoothstep(0.9, 0.25, radius) * (0.4 + 0.6 * sin(uTime * 0.6));

    vec3 base = vec3(0.01, 0.03, 0.06) * vignette;
    vec3 warpGlow = vec3(0.18, 0.35, 0.55) * uWarp * streak * 0.24;
    vec3 travelGlow = vec3(0.14, 0.28, 0.42) * uTransition * pulse * 0.24;
    vec3 aurora = vec3(0.04, 0.08, 0.12) * haze;

    float alpha = 0.1 + vignette * 0.16 + uWarp * 0.18 + uTransition * 0.14 + noise;

    gl_FragColor = vec4(base + warpGlow + travelGlow + aurora, clamp(alpha, 0.0, 0.38));
  }
`;

const UNIVERSE_TRAVEL_BOUNDS = { x: 60, y: 36, z: 80 };

function StarfieldDome() {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.007;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} scale={[120, 120, 120]}>
      <sphereGeometry args={[1, 80, 80]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={basicVertexShader}
        fragmentShader={starfieldFragment}
        uniforms={{ uTime: { value: 0 } }}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function ParallaxStarLayer({ count, spread, color, size, depth, rotation = [0, 0], opacity = 0.72 }) {
  const groupRef = useRef();
  const materialRef = useRef();
  const warpActive = useStore((state) => state.ui.warpActive);

  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      values[index * 3] = (Math.random() - 0.5) * spread[0];
      values[index * 3 + 1] = (Math.random() - 0.5) * spread[1];
      values[index * 3 + 2] = (Math.random() - 0.5) * spread[2];
    }

    return values;
  }, [count, spread]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotation[0];
      groupRef.current.rotation.x += delta * rotation[1];
      groupRef.current.position.x = state.camera.position.x * depth;
      groupRef.current.position.y = state.camera.position.y * depth;
      groupRef.current.position.z = state.camera.position.z * depth * 0.2;
    }

    if (materialRef.current) {
      materialRef.current.size = THREE.MathUtils.lerp(materialRef.current.size, warpActive ? size * 1.9 : size, 0.08);
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, warpActive ? 0.95 : opacity, 0.08);
    }
  });

  return (
    <points ref={groupRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  );
}

function SceneSafety() {
  const { camera, gl, size } = useThree();

  useEffect(() => {
    const resizeScene = () => {
      const width = window.innerWidth || size.width || 1;
      const height = window.innerHeight || size.height || 1;

      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      gl.setSize(width, height, false);
    };

    const handleContextLost = (event) => {
      event.preventDefault();
    };

    const handleContextRestored = () => {
      resizeScene();
    };

    resizeScene();
    window.addEventListener('resize', resizeScene);
    window.addEventListener('orientationchange', resizeScene);

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost, { passive: false });
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      window.removeEventListener('resize', resizeScene);
      window.removeEventListener('orientationchange', resizeScene);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [camera, gl, size.height, size.width]);

  return null;
}

function CameraRig({ controlsRef }) {
  const cameraTarget = useStore((state) => state.cameraTarget);
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const warpActive = useStore((state) => state.ui.warpActive);
  const transitionState = useStore((state) => state.transitionState);
  const isDragging = useStore((state) => state.interactionState.isDragging);
  const setTransitionProgress = useStore((state) => state.setTransitionProgress);
  const completeTransition = useStore((state) => state.completeTransition);
  const syncCameraFromControls = useStore((state) => state.syncCameraFromControls);

  const focusRef = useRef(new THREE.Vector3(...cameraTarget.focus));
  const distanceRef = useRef(cameraTarget.distance);
  const yawRef = useRef(cameraTarget.yaw);
  const pitchRef = useRef(cameraTarget.pitch);
  const syncRef = useRef({ focus: new THREE.Vector3(), distance: cameraTarget.distance, yaw: cameraTarget.yaw, pitch: cameraTarget.pitch });
  const lastSyncAtRef = useRef(0);

  useFrame((state) => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    if (transitionState.active) {
      const elapsed = Date.now() - transitionState.startedAt;
      const progress = THREE.MathUtils.clamp(elapsed / Math.max(transitionState.duration, 1), 0, 1);

      if (Math.abs(progress - transitionState.progress) > 0.02) {
        setTransitionProgress(progress);
      }

      if (progress >= 1 && transitionState.progress >= 0.98) {
        completeTransition();
      }
    }

    if (isDragging) {
      let offset = state.camera.position.clone().sub(controls.target);
      let distance = offset.length();
      let yaw = Math.atan2(offset.x, offset.z);
      let pitch = Math.asin(THREE.MathUtils.clamp(offset.y / Math.max(distance, 0.0001), -1, 1));
      const distanceDelta = syncRef.current.distance - distance;
      const shouldTravel = !currentGalaxy && !selectedItem && Math.abs(distanceDelta) > 0.002;

      if (shouldTravel) {
        const forward = new THREE.Vector3();
        state.camera.getWorldDirection(forward);
        controls.target.addScaledVector(forward, THREE.MathUtils.clamp(distanceDelta * 0.85, -0.6, 0.6));
        controls.target.set(
          THREE.MathUtils.clamp(controls.target.x, -UNIVERSE_TRAVEL_BOUNDS.x, UNIVERSE_TRAVEL_BOUNDS.x),
          THREE.MathUtils.clamp(controls.target.y, -UNIVERSE_TRAVEL_BOUNDS.y, UNIVERSE_TRAVEL_BOUNDS.y),
          THREE.MathUtils.clamp(controls.target.z, -UNIVERSE_TRAVEL_BOUNDS.z, UNIVERSE_TRAVEL_BOUNDS.z),
        );
        offset = state.camera.position.clone().sub(controls.target);
        distance = offset.length();
        yaw = Math.atan2(offset.x, offset.z);
        pitch = Math.asin(THREE.MathUtils.clamp(offset.y / Math.max(distance, 0.0001), -1, 1));
      }
      const now = performance.now();
      const focusDelta = syncRef.current.focus.distanceTo(controls.target);
      const changed =
        focusDelta > 0.025 ||
        Math.abs(distance - syncRef.current.distance) > 0.025 ||
        Math.abs(yaw - syncRef.current.yaw) > 0.0025 ||
        Math.abs(pitch - syncRef.current.pitch) > 0.0025;

      if (changed && now - lastSyncAtRef.current > 45) {
        syncCameraFromControls({
          focus: controls.target.toArray(),
          distance,
          yaw,
          pitch,
          framing: selectedItem ? 'detail' : currentGalaxy ? 'galaxy' : 'universe',
        });

        syncRef.current.focus.copy(controls.target);
        syncRef.current.distance = distance;
        syncRef.current.yaw = yaw;
        syncRef.current.pitch = pitch;
        lastSyncAtRef.current = now;
      }

      const activeFov = selectedItem ? 44 : currentGalaxy ? 47 : 51;
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, activeFov, 0.1);
      state.camera.updateProjectionMatrix();
      return;
    }

    const targetFocus = new THREE.Vector3(...cameraTarget.focus);
    const driftStrength = selectedItem ? 0.08 : currentGalaxy ? 0.12 : cameraTarget.drift ?? 0.36;
    const pointerDrift = new THREE.Vector3(state.pointer.x * driftStrength, state.pointer.y * driftStrength * 0.6, 0);
    const idleDrift = new THREE.Vector3(
      Math.sin(state.clock.elapsedTime * 0.11) * driftStrength * 0.95,
      Math.cos(state.clock.elapsedTime * 0.14) * driftStrength * 0.7,
      Math.sin(state.clock.elapsedTime * 0.08) * driftStrength * 0.4,
    );

    const transitionBlend = transitionState.intent === 'exit-galaxy' ? 0.14 : 0.17;
    const blend = transitionState.active ? transitionBlend : warpActive ? 0.14 : 0.11;

    focusRef.current.lerp(targetFocus, blend);
    distanceRef.current = THREE.MathUtils.lerp(distanceRef.current, cameraTarget.distance, blend + 0.02);
    yawRef.current = THREE.MathUtils.lerp(yawRef.current, cameraTarget.yaw, blend);
    pitchRef.current = THREE.MathUtils.lerp(pitchRef.current, cameraTarget.pitch, blend);

    const orbit = new THREE.Vector3(
      Math.sin(yawRef.current) * Math.cos(pitchRef.current),
      Math.sin(pitchRef.current),
      Math.cos(yawRef.current) * Math.cos(pitchRef.current),
    ).multiplyScalar(distanceRef.current);

    const transitionBoost = transitionState.active ? Math.sin(Math.PI * transitionState.progress) * 0.55 : 0;
    const cameraPosition = focusRef.current.clone().add(orbit).add(pointerDrift).add(idleDrift.multiplyScalar(1 + transitionBoost));

    state.camera.position.lerp(cameraPosition, blend);
    controls.target.lerp(focusRef.current, blend);
    if (controls._spherical) {
      const offset = state.camera.position.clone().sub(controls.target);
      controls._spherical.setFromVector3(offset);
      if (controls._sphericalDelta) {
        controls._sphericalDelta.set(0, 0, 0);
      }
      if (controls._panOffset) {
        controls._panOffset.set(0, 0, 0);
      }
      if (typeof controls._scale === 'number') {
        controls._scale = 1;
      }
    }
    controls.update();

    const travelFovBoost = transitionState.active ? Math.sin(Math.PI * transitionState.progress) * 6.8 : 0;
    const baseFov = selectedItem ? 44 : currentGalaxy ? 48 : 52;
    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, baseFov + travelFovBoost, 0.12);
    state.camera.updateProjectionMatrix();
  });

  return null;
}

function CinematicOverlay() {
  const meshRef = useRef();
  const materialRef = useRef();
  const { camera } = useThree();
  const warpActive = useStore((state) => state.ui.warpActive);
  const transitionState = useStore((state) => state.transitionState);
  const isMobile = useStore((state) => state.isMobile);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) {
      return;
    }

    meshRef.current.position.copy(camera.position);
    meshRef.current.quaternion.copy(camera.quaternion);
    meshRef.current.translateZ(-2.45);

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uWarp.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uWarp.value,
      warpActive ? 1 : 0,
      0.08,
    );
    materialRef.current.uniforms.uTransition.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uTransition.value,
      transitionState.active ? transitionState.progress : 0,
      0.1,
    );
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={isMobile ? [5.5, 8.5] : [7.2, 4.8]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={basicVertexShader}
        fragmentShader={postFxFragment}
        uniforms={{
          uTime: { value: 0 },
          uWarp: { value: 0 },
          uTransition: { value: 0 },
        }}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function SelectedBeacon({ item }) {
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.9;
      ringRef.current.material.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 2.4) * 0.12;
    }
  });

  return (
    <group position={item.worldPosition}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.03, 16, 72]} />
        <meshBasicMaterial color={item.color ?? '#ffffff'} transparent opacity={0.65} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function UniverseCluster() {
  const groupRef = useRef();
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const focusGalaxy = useStore((state) => state.focusGalaxy);
  const isMobile = useStore((state) => state.isMobile);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const rotationX = currentGalaxy ? state.pointer.y * 0.025 : state.pointer.y * 0.05;
    const rotationY = currentGalaxy ? state.pointer.x * 0.03 : state.pointer.x * 0.07;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -rotationX, 0.03);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationY, 0.03);
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      Math.sin(state.clock.elapsedTime * 0.12) * (isMobile ? 0.12 : 0.24),
      0.02,
    );
  });

  return (
    <group ref={groupRef}>
      {galaxies.map((galaxy) => (
        <Galaxy
          key={galaxy.id}
          galaxy={galaxy}
          active={currentGalaxy === galaxy.id}
          dimmed={Boolean(currentGalaxy) && currentGalaxy !== galaxy.id}
          onFocus={focusGalaxy}
        />
      ))}
    </group>
  );
}

function Controls() {
  const controlsRef = useRef();
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const cameraTarget = useStore((state) => state.cameraTarget);
  const setDragging = useStore((state) => state.setDragging);

  const mouseButtons = useMemo(
    () =>
      currentGalaxy
        ? {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }
        : {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          },
    [currentGalaxy],
  );

  const touches = useMemo(
    () =>
      currentGalaxy
        ? {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }
        : {
            ONE: THREE.TOUCH.PAN,
            TWO: THREE.TOUCH.DOLLY_PAN,
          },
    [currentGalaxy],
  );

  useEffect(() => {
    if (!controlsRef.current) {
      return;
    }

    controlsRef.current.minDistance = cameraTarget.minDistance;
    controlsRef.current.maxDistance = cameraTarget.maxDistance;
    controlsRef.current.zoomToCursor = !currentGalaxy;
  }, [cameraTarget.maxDistance, cameraTarget.minDistance, currentGalaxy]);

  useEffect(() => () => setDragging(false), [setDragging]);

  return (
    <>
      <CameraRig controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.085}
        zoomSpeed={currentGalaxy ? 0.7 : 0.9}
        rotateSpeed={currentGalaxy ? 0.5 : 0.34}
        panSpeed={currentGalaxy ? 0.5 : 0.78}
        screenSpacePanning
        enableZoom
        enableRotate
        enablePan={!currentGalaxy || !selectedItem}
        minDistance={cameraTarget.minDistance}
        maxDistance={cameraTarget.maxDistance}
        mouseButtons={mouseButtons}
        touches={touches}
        zoomToCursor={!currentGalaxy}
        onStart={() => {
          setDragging(true);
        }}
        onEnd={() => {
          window.setTimeout(() => {
            setDragging(false);
          }, 70);
        }}
      />
    </>
  );
}

export default function Universe() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const isMobile = useStore((state) => state.isMobile);
  const activeGalaxy = galaxies.find((entry) => entry.id === currentGalaxy) ?? null;

  return (
    <>
      <SceneSafety />
      <Controls />
      <StarfieldDome />
      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.65} color="#dcecff" groundColor="#070a15" />
      <pointLight position={[0, 6, 18]} intensity={1.45} color="#72f7ff" />
      <pointLight position={[20, 14, -16]} intensity={1.65} color="#ff7df2" />
      <pointLight position={[-18, -10, 20]} intensity={1.25} color="#a4ff86" />
      {activeGalaxy ? <pointLight position={activeGalaxy.position} intensity={1.9} distance={14} color={activeGalaxy.color} /> : null}

      <ParallaxStarLayer count={620} spread={[240, 170, 280]} color="#7fbcff" size={0.08} depth={0.012} rotation={[0.0025, 0.001]} opacity={0.48} />
      <ParallaxStarLayer count={420} spread={[160, 110, 180]} color="#d8f1ff" size={0.12} depth={0.032} rotation={[0.005, 0.002]} opacity={0.68} />
      <ParallaxStarLayer count={220} spread={[96, 72, 108]} color="#fff1c6" size={0.2} depth={0.07} rotation={[0.01, 0.0036]} opacity={0.88} />
      <ParallaxStarLayer count={80} spread={[42, 32, 48]} color="#ffffff" size={0.28} depth={0.11} rotation={[0.014, 0.0048]} opacity={0.92} />

      <Sparkles count={isMobile ? 110 : 220} scale={[92, 66, 108]} size={2.6} speed={0.14} color="#b9d8ff" />
      <Sparkles count={isMobile ? 44 : 90} scale={[46, 36, 50]} size={4.8} speed={0.22} color="#fff1dc" />

      <UniverseCluster />
      <GalaxyInterior galaxy={activeGalaxy} selectedItem={selectedItem} />
      {selectedItem?.worldPosition && selectedItem.kind !== 'about' ? <SelectedBeacon item={selectedItem} /> : null}
      <WarpEffect />
      <CinematicOverlay />
    </>
  );
}
