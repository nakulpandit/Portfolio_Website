import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

export default function Planet({
  label,
  color = '#72f7ff',
  orbitRadius = 1.6,
  orbitSpeed = 0.4,
  size = 0.22,
  initialAngle = 0,
  onSelect,
  data,
}) {
  const orbitRef = useRef();
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const setHoveredItem = useStore((state) => state.setHoveredItem);

  useFrame((state) => {
    const angle = initialAngle + state.clock.elapsedTime * orbitSpeed;
    if (orbitRef.current) {
      orbitRef.current.position.set(Math.cos(angle) * orbitRadius, Math.sin(angle * 0.7) * 0.35, Math.sin(angle) * orbitRadius);
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.012;
      const scale = hovered ? 1.18 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
    }
  });

  return (
    <group>
      <mesh rotation={[Math.PI / 2.8, 0, 0]}>
        <torusGeometry args={[orbitRadius, 0.005, 8, 80]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      <group ref={orbitRef}>
        <mesh
          ref={meshRef}
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.(data);
          }}
          onPointerEnter={(event) => {
            event.stopPropagation();
            setHovered(true);
            setHoveredItem(data);
          }}
          onPointerLeave={() => {
            setHovered(false);
            setHoveredItem(null);
          }}
        >
          <sphereGeometry args={[size, 24, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.8 : 0.9} roughness={0.3} />
        </mesh>
        {hovered ? (
          <Text position={[0, size + 0.24, 0]} fontSize={0.16} color="#f6f7fb" anchorX="center">
            {label}
          </Text>
        ) : null}
      </group>
    </group>
  );
}
