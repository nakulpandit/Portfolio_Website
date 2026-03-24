import { Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
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

function StarfieldDome() {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.006;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} scale={[100, 100, 100]}>
      <sphereGeometry args={[1, 72, 72]} />
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

function ParallaxStarLayer({ count, spread, color, size, depth, rotation = [0, 0] }) {
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
      groupRef.current.position.z = state.camera.position.z * depth * 0.18;
    }

    if (materialRef.current) {
      materialRef.current.size = THREE.MathUtils.lerp(materialRef.current.size, warpActive ? size * 1.8 : size, 0.08);
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, warpActive ? 0.95 : 0.72, 0.08);
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
        opacity={0.72}
        depthWrite={false}
      />
    </points>
  );
}

function CameraRig() {
  const cameraTarget = useStore((state) => state.cameraTarget);
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const warpActive = useStore((state) => state.ui.warpActive);
  const focusRef = useRef(new THREE.Vector3(...cameraTarget.focus));
  const distanceRef = useRef(cameraTarget.distance);
  const yawRef = useRef(cameraTarget.yaw);
  const pitchRef = useRef(cameraTarget.pitch);

  useFrame((state) => {
    const targetFocus = new THREE.Vector3(...cameraTarget.focus);
    const driftStrength = selectedItem ? 0.08 : currentGalaxy ? 0.12 : cameraTarget.drift ?? 0.34;
    const pointerDrift = new THREE.Vector3(state.pointer.x * driftStrength, state.pointer.y * driftStrength * 0.65, 0);
    const idleDrift = new THREE.Vector3(
      Math.sin(state.clock.elapsedTime * 0.12) * driftStrength * 0.85,
      Math.cos(state.clock.elapsedTime * 0.15) * driftStrength * 0.6,
      Math.sin(state.clock.elapsedTime * 0.09) * driftStrength * 0.35,
    );

    focusRef.current.lerp(targetFocus, warpActive ? 0.1 : 0.08);
    distanceRef.current = THREE.MathUtils.lerp(distanceRef.current, cameraTarget.distance, warpActive ? 0.12 : 0.1);
    yawRef.current = THREE.MathUtils.lerp(yawRef.current, cameraTarget.yaw, 0.12);
    pitchRef.current = THREE.MathUtils.lerp(pitchRef.current, cameraTarget.pitch, 0.12);

    const orbit = new THREE.Vector3(
      Math.sin(yawRef.current) * Math.cos(pitchRef.current),
      Math.sin(pitchRef.current),
      Math.cos(yawRef.current) * Math.cos(pitchRef.current),
    ).multiplyScalar(distanceRef.current);

    const cameraPosition = focusRef.current.clone().add(orbit).add(pointerDrift).add(idleDrift);
    const lookAt = focusRef.current.clone().add(pointerDrift.multiplyScalar(0.3));
    const desiredFov = warpActive ? 58 : selectedItem ? 44 : currentGalaxy ? 48 : 52;

    state.camera.position.lerp(cameraPosition, warpActive ? 0.16 : 0.11);
    state.camera.lookAt(lookAt);
    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, desiredFov, 0.1);
    state.camera.updateProjectionMatrix();
  });

  return null;
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

    const rotationX = currentGalaxy ? state.pointer.y * 0.03 : state.pointer.y * 0.06;
    const rotationY = currentGalaxy ? state.pointer.x * 0.04 : state.pointer.x * 0.08;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -rotationX, 0.03);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationY, 0.03);
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      Math.sin(state.clock.elapsedTime * 0.12) * (isMobile ? 0.12 : 0.2),
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

export default function Universe() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const isMobile = useStore((state) => state.isMobile);
  const activeGalaxy = galaxies.find((entry) => entry.id === currentGalaxy) ?? null;

  return (
    <>
      <CameraRig />
      <StarfieldDome />
      <ambientLight intensity={0.62} />
      <hemisphereLight intensity={0.55} color="#dcecff" groundColor="#080d14" />
      <pointLight position={[0, 5, 18]} intensity={1.3} color="#72f7ff" />
      <pointLight position={[16, 12, -14]} intensity={1.4} color="#ff7df2" />
      <pointLight position={[-16, -10, 14]} intensity={1.05} color="#a4ff86" />
      {activeGalaxy ? <pointLight position={activeGalaxy.position} intensity={1.5} distance={12} color={activeGalaxy.color} /> : null}

      <ParallaxStarLayer count={360} spread={[140, 100, 160]} color="#7fbcff" size={0.1} depth={0.02} rotation={[0.003, 0.0015]} />
      <ParallaxStarLayer count={220} spread={[90, 70, 100]} color="#d8f1ff" size={0.16} depth={0.04} rotation={[0.006, 0.0025]} />
      <ParallaxStarLayer count={80} spread={[48, 38, 56]} color="#fff1c6" size={0.22} depth={0.07} rotation={[0.012, 0.004]} />

      <Sparkles count={isMobile ? 90 : 160} scale={[68, 48, 78]} size={2.4} speed={0.12} color="#b9d8ff" />
      <Sparkles count={isMobile ? 28 : 56} scale={[28, 22, 30]} size={4.2} speed={0.18} color="#fff1dc" />

      <UniverseCluster />
      <GalaxyInterior galaxy={activeGalaxy} selectedItem={selectedItem} />
      {selectedItem?.worldPosition && selectedItem.kind !== 'about' ? <SelectedBeacon item={selectedItem} /> : null}
      <WarpEffect />
    </>
  );
}
