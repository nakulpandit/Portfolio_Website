import { Billboard, Text } from '@react-three/drei';
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
  anchorPosition = [0, 0, 0],
  active = false,
  orbitTilt = 0.22,
}) {
  const orbitRef = useRef();
  const meshRef = useRef();
  const haloRef = useRef();
  const pointLightRef = useRef();
  const currentPosition = useRef(new THREE.Vector3());
  const [hovered, setHovered] = useState(false);
  const setHoveredItem = useStore((state) => state.setHoveredItem);
  const dragThresholdPx = useStore((state) => state.dragThresholdPx);
  const isDragging = useStore((state) => state.interactionState.isDragging);

  useFrame((state, delta) => {
    const angle = initialAngle + state.clock.elapsedTime * orbitSpeed;
    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;
    const y = Math.sin(angle * 1.6) * orbitTilt;

    currentPosition.current.set(x, y, z);

    if (orbitRef.current) {
      orbitRef.current.position.copy(currentPosition.current);
      orbitRef.current.rotation.y += delta * 0.24;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
      meshRef.current.rotation.z += delta * 0.3;
      const scale = hovered || active ? 1.22 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
    }

    if (haloRef.current) {
      const haloScale = hovered || active ? 1.8 : 1.4;
      haloRef.current.scale.lerp(new THREE.Vector3(haloScale, haloScale, haloScale), 0.1);
      haloRef.current.material.opacity = THREE.MathUtils.lerp(
        haloRef.current.material.opacity,
        hovered || active ? 0.75 : 0.25,
        0.12,
      );
    }

    if (pointLightRef.current) {
      pointLightRef.current.intensity = THREE.MathUtils.lerp(
        pointLightRef.current.intensity,
        hovered || active ? 1.6 : 0.75,
        0.08,
      );
    }
  });

  const worldPosition = [
    anchorPosition[0] + currentPosition.current.x,
    anchorPosition[1] + currentPosition.current.y,
    anchorPosition[2] + currentPosition.current.z,
  ];

  const handleSelect = () => {
    onSelect?.({
      ...data,
      worldPosition,
      orbitPosition: currentPosition.current.toArray(),
    });
  };

  return (
    <group>
      <mesh rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[orbitRadius, 0.01, 12, 120]} />
        <meshBasicMaterial color={color} transparent opacity={0.16} />
      </mesh>
      <group ref={orbitRef}>
        <pointLight ref={pointLightRef} color={color} intensity={0.75} distance={3.5} decay={2} />
        <mesh ref={haloRef}>
          <sphereGeometry args={[size * 1.45, 20, 20]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} depthWrite={false} />
        </mesh>
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, 28, 28]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered || active ? 1.9 : 1} roughness={0.28} />
        </mesh>
        <mesh
          onClick={(event) => {
            if (isDragging || event.delta > dragThresholdPx) {
              return;
            }
            event.stopPropagation();
            handleSelect();
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            setHoveredItem({ ...data, title: label });
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            setHoveredItem(null);
            document.body.style.cursor = 'none';
          }}
        >
          <sphereGeometry args={[size * 1.95, 22, 22]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
        {hovered || active ? (
          <Billboard position={[0, size + 0.3, 0]}>
            <group>
              <mesh position={[0, 0.06, -0.02]}>
                <planeGeometry args={[1.6, 0.32]} />
                <meshBasicMaterial color="#050915" transparent opacity={0.68} />
              </mesh>
              <Text fontSize={0.16} color="#f6f7fb" anchorX="center">
                {label}
              </Text>
            </group>
          </Billboard>
        ) : null}
      </group>
    </group>
  );
}
