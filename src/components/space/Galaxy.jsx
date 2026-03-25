import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import galaxyFragment from '../../shaders/galaxy.glsl?raw';

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const dummy = new THREE.Object3D();

export default function Galaxy({ galaxy, active, dimmed = false, onFocus }) {
  const coreRef = useRef();
  const haloRef = useRef();
  const pulseRingRef = useRef();
  const materialRef = useRef();
  const dustRef = useRef();
  const glowRef = useRef();
  const labelRef = useRef();
  const [hovered, setHovered] = useState(false);
  const setHoveredItem = useStore((state) => state.setHoveredItem);
  const dragThresholdPx = useStore((state) => state.dragThresholdPx);
  const isDragging = useStore((state) => state.interactionState.isDragging);

  const radius = galaxy.radius ?? 1.5;
  const dustCount = galaxy.particleCount ?? 24;
  const spinSpeed = galaxy.spinSpeed ?? 0.06;
  const interactionRadius = galaxy.interactionRadius ?? radius * 2.25;
  const interactive = hovered || active;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uColor: { value: new THREE.Color(galaxy.color) },
    }),
    [galaxy.color],
  );

  const dustPositions = useMemo(
    () =>
      Array.from({ length: dustCount }, (_, index) => {
        const angle = (index / dustCount) * Math.PI * 2;
        const spread = radius * (1.2 + Math.random() * 0.95);

        return {
          position: new THREE.Vector3(
            Math.cos(angle) * spread,
            (Math.random() - 0.5) * radius * 0.7,
            Math.sin(angle) * spread * (0.55 + Math.random() * 0.45),
          ),
          scale: 0.05 + Math.random() * 0.12,
        };
      }),
    [dustCount, radius],
  );

  useLayoutEffect(() => {
    if (!dustRef.current) {
      return;
    }

    dustPositions.forEach((item, index) => {
      dummy.position.copy(item.position);
      dummy.scale.setScalar(item.scale);
      dummy.updateMatrix();
      dustRef.current.setMatrixAt(index, dummy.matrix);
    });

    dustRef.current.instanceMatrix.needsUpdate = true;
  }, [dustPositions]);

  useFrame((state, delta) => {
    if (dustRef.current) {
      dustRef.current.rotation.y += delta * (spinSpeed * 0.6);
      dustRef.current.rotation.z += delta * (spinSpeed * 0.35);
    }

    if (coreRef.current) {
      coreRef.current.rotation.z += delta * spinSpeed;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.06;

      const activeScale = interactive ? 1.1 : 1;
      coreRef.current.scale.lerp(
        new THREE.Vector3(radius * activeScale, radius * 0.82 * activeScale, radius * 0.76 * activeScale),
        0.1,
      );
    }

    if (haloRef.current) {
      haloRef.current.rotation.z -= delta * (spinSpeed * 1.8);
      haloRef.current.material.opacity = THREE.MathUtils.lerp(
        haloRef.current.material.opacity,
        interactive ? 0.5 : dimmed ? 0.08 : 0.2,
        0.1,
      );
    }

    if (pulseRingRef.current) {
      pulseRingRef.current.rotation.z += delta * (0.28 + spinSpeed * 1.6);
      const ringScale = interactive ? radius * 2.2 : radius * 1.75;
      pulseRingRef.current.scale.lerp(new THREE.Vector3(ringScale, ringScale, ringScale), 0.08);
      pulseRingRef.current.material.opacity = THREE.MathUtils.lerp(
        pulseRingRef.current.material.opacity,
        interactive ? 0.38 : 0.08,
        0.1,
      );
    }

    if (glowRef.current) {
      glowRef.current.intensity = THREE.MathUtils.lerp(
        glowRef.current.intensity,
        interactive ? 1.75 : dimmed ? 0.35 : 0.95,
        0.1,
      );
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHover.value,
        interactive ? 1 : 0,
        0.12,
      );
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, dimmed && !interactive ? 0.45 : 1, 0.1);
    }

    if (labelRef.current) {
      labelRef.current.material.opacity = THREE.MathUtils.lerp(
        labelRef.current.material.opacity,
        interactive ? 0.74 : dimmed ? 0.14 : 0.32,
        0.1,
      );
      const scale = interactive ? 1.08 : 1;
      labelRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
    }
  });

  return (
    <group position={galaxy.position}>
      <pointLight
        ref={glowRef}
        position={[0, 0, 0]}
        intensity={0.95}
        distance={10 + radius * 8}
        decay={2}
        color={galaxy.color}
      />

      <instancedMesh ref={dustRef} args={[null, null, dustPositions.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={galaxy.color} transparent opacity={dimmed ? 0.16 : 0.42} depthWrite={false} />
      </instancedMesh>

      <mesh ref={pulseRingRef} rotation={[Math.PI / 2, 0, 0]} scale={[radius * 1.75, radius * 1.75, radius * 1.75]}>
        <torusGeometry args={[1, 0.03, 12, 96]} />
        <meshBasicMaterial color={galaxy.color} transparent opacity={0.08} depthWrite={false} />
      </mesh>

      <mesh ref={haloRef} rotation={[Math.PI / 2, 0.24, 0]} scale={[radius * 1.45, radius * 1.45, radius * 1.45]}>
        <torusGeometry args={[1, 0.045, 16, 120]} />
        <meshBasicMaterial color={galaxy.color} transparent opacity={0.2} depthWrite={false} />
      </mesh>

      <mesh ref={coreRef} scale={[radius, radius * 0.82, radius * 0.76]}>
        <sphereGeometry args={[1, 56, 56]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={galaxyFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh scale={[0.28, 0.28, 0.28]}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshBasicMaterial color={galaxy.color} />
      </mesh>

      <mesh
        onClick={(event) => {
          if (isDragging || event.delta > dragThresholdPx) {
            return;
          }

          event.stopPropagation();
          onFocus?.(galaxy);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          setHoveredItem({ title: galaxy.label, kind: 'galaxy', summary: galaxy.description });
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          setHoveredItem(null);
          document.body.style.cursor = 'none';
        }}
      >
        <sphereGeometry args={[interactionRadius, 32, 32]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>

      <Billboard position={[0, radius + 1.0, 0]}>
        <group>
          <mesh ref={labelRef} position={[0, 0, -0.02]}>
            <planeGeometry args={[2.7, 0.52]} />
            <meshBasicMaterial color="#050915" transparent opacity={interactive ? 0.62 : 0.34} />
          </mesh>
          <Text fontSize={interactive ? 0.245 : 0.2} color="#f6f7fb" anchorX="center">
            {galaxy.label.toUpperCase()}
          </Text>
        </group>
      </Billboard>
    </group>
  );
}
