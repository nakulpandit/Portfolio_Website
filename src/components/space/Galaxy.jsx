import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
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
  const materialRef = useRef();
  const dustRef = useRef();
  const [hovered, setHovered] = useState(false);

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
      Array.from({ length: 24 }, () => ({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 3.8,
          (Math.random() - 0.5) * 2.4,
          (Math.random() - 0.5) * 2.5,
        ),
        scale: 0.04 + Math.random() * 0.08,
      })),
    [],
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
      meshRef.current.rotation.z += delta * 0.03;
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
      <instancedMesh ref={dustRef} args={[null, null, dustPositions.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={galaxy.color} transparent opacity={0.6} />
      </instancedMesh>
      <mesh
        ref={meshRef}
        onClick={(event) => {
          event.stopPropagation();
          onFocus?.(galaxy);
        }}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[1.45, 48, 48]} />
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

      <mesh>
        <sphereGeometry args={[0.18, 18, 18]} />
        <meshBasicMaterial color={galaxy.color} />
      </mesh>

      <Billboard position={[0, 1.95, 0]}>
        <Text fontSize={0.24} color="#f6f7fb" anchorX="center" className="tracking-[0.3em]">
          {galaxy.label.toUpperCase()}
        </Text>
      </Billboard>

      {children}
    </group>
  );
}
