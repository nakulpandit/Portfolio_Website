import { Billboard, Text } from '@react-three/drei';
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
    float pulse = 0.76 + 0.24 * sin(uTime * 2.1 + length(vPosition) * 4.5);
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.8);
    vec3 core = uColor * (pulse + uHover * 0.65);
    vec3 rim = vec3(1.0) * fresnel * (0.6 + uHover * 0.5);
    gl_FragColor = vec4(core + rim, 1.0);
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
  const haloRef = useRef();
  const lightRef = useRef();
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
      const scale = size * (hovered || active ? 1.36 : 1) + Math.sin(state.clock.elapsedTime * 2.8) * 0.01;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y += delta * 0.9;
    }

    if (haloRef.current) {
      haloRef.current.rotation.z += delta * 0.4;
      haloRef.current.material.opacity = THREE.MathUtils.lerp(
        haloRef.current.material.opacity,
        hovered || active ? 0.7 : 0.22,
        0.12,
      );
      const haloScale = hovered || active ? size * 5.2 : size * 4.1;
      haloRef.current.scale.lerp(new THREE.Vector3(haloScale, haloScale, haloScale), 0.12);
    }

    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, hovered || active ? 1.9 : 0.95, 0.08);
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
      <pointLight ref={lightRef} color={color} intensity={0.95} distance={4.2} decay={2} />
      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]} scale={[size * 4.1, size * 4.1, size * 4.1]}>
        <torusGeometry args={[1, 0.08, 12, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
      </mesh>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.(item);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          handlePointerEnter();
        }}
        onPointerOut={handlePointerLeave}
      >
        <sphereGeometry args={[size * 2.7, 24, 24]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>
      {hovered || active ? (
        <Billboard position={[0, size * 2.5, 0]}>
          <Text fontSize={0.18} maxWidth={2.8} anchorX="center" anchorY="bottom" color="#f6f7fb">
            {label}
          </Text>
        </Billboard>
      ) : null}
    </group>
  );
}
