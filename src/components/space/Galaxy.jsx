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

export default function Galaxy({ galaxy, active, children, onFocus }) {
  const meshRef = useRef();
  const haloRef = useRef();
  const materialRef = useRef();
  const dustRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  const setHoveredItem = useStore((state) => state.setHoveredItem);

  const radius = galaxy.radius ?? 1.5;
  const dustCount = galaxy.particleCount ?? 24;

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
      Array.from({ length: dustCount }, () => ({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * radius * 2.8,
          (Math.random() - 0.5) * radius * 1.8,
          (Math.random() - 0.5) * radius * 2.4,
        ),
        scale: 0.03 + Math.random() * 0.09,
      })),
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
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.024;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.16) * 0.04;
      meshRef.current.scale.lerp(
        new THREE.Vector3(
          radius * (hovered || active ? 1.08 : 1),
          radius * 0.82 * (hovered || active ? 1.06 : 1),
          radius * 0.76 * (hovered || active ? 1.04 : 1),
        ),
        0.08,
      );
    }

    if (haloRef.current) {
      haloRef.current.rotation.z -= delta * 0.04;
      const haloScale = hovered || active ? radius * 1.55 : radius * 1.35;
      haloRef.current.scale.lerp(new THREE.Vector3(haloScale, haloScale, haloScale), 0.08);
    }

    if (glowRef.current) {
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, hovered || active ? 1.6 : 0.75, 0.08);
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHover.value,
        hovered || active ? 1 : 0,
        0.12,
      );
    }
  });

  return (
    <group position={galaxy.position}>
      <pointLight
        ref={glowRef}
        position={[0, 0, 0]}
        intensity={0.75}
        distance={8 + radius * 5}
        decay={2.1}
        color={galaxy.color}
      />
      <instancedMesh ref={dustRef} args={[null, null, dustPositions.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={galaxy.color} transparent opacity={0.55} />
      </instancedMesh>

      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]} scale={[radius * 1.35, radius * 1.35, radius * 1.35]}>
        <torusGeometry args={[1, 0.03, 16, 120]} />
        <meshBasicMaterial color={galaxy.color} transparent opacity={hovered || active ? 0.45 : 0.18} />
      </mesh>

      <mesh
        ref={meshRef}
        scale={[radius, radius * 0.82, radius * 0.76]}
        onClick={(event) => {
          event.stopPropagation();
          onFocus?.(galaxy);
        }}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
          setHoveredItem({ title: galaxy.label, kind: 'galaxy' });
        }}
        onPointerLeave={() => {
          setHovered(false);
          setHoveredItem(null);
        }}
      >
        <sphereGeometry args={[1, 48, 48]} />
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

      <mesh scale={[0.22, 0.22, 0.22]}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshBasicMaterial color={galaxy.color} />
      </mesh>

      <Billboard position={[0, radius + 0.7, 0]}>
        <Text fontSize={hovered || active ? 0.26 : 0.22} color="#f6f7fb" anchorX="center">
          {galaxy.label.toUpperCase()}
        </Text>
      </Billboard>

      {children}
    </group>
  );
}
