import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    float pulse = 0.75 + 0.25 * sin(uTime * 2.0 + length(vPosition) * 4.0);
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
    vec3 color = uColor * (pulse + uHover * 0.7) + vec3(1.0) * fresnel * 0.7;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function Star({
  item,
  color = '#ffffff',
  size = 0.16,
  label,
  onSelect,
  onHover,
  active = false,
}) {
  const setHoveredItem = useStore((state) => state.setHoveredItem);
  const meshRef = useRef();
  const materialRef = useRef();
  const [hovered, setHovered] = useState(false);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    [color],
  );

  useFrame((state, delta) => {
    if (meshRef.current) {
      const scale = size * (hovered || active ? 1.35 : 1) + Math.sin(state.clock.elapsedTime * 2.5) * 0.01;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y += delta * 0.8;
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

  const handlePointerEnter = () => {
    setHovered(true);
    setHoveredItem(item);
    onHover?.(item);
  };

  const handlePointerLeave = () => {
    setHovered(false);
    setHoveredItem(null);
    onHover?.(null);
  };

  return (
    <group position={item.position}>
      <mesh
        ref={meshRef}
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.(item);
        }}
        onPointerEnter={(event) => {
          event.stopPropagation();
          handlePointerEnter();
        }}
        onPointerLeave={handlePointerLeave}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
      </mesh>
      {(hovered || active) && label ? (
        <Text
          position={[0, size * 2.2, 0]}
          fontSize={0.18}
          maxWidth={2.5}
          anchorX="center"
          anchorY="bottom"
          color="#f6f7fb"
        >
          {label}
        </Text>
      ) : null}
    </group>
  );
}
