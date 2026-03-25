import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import warpFragment from '../../shaders/warp.glsl?raw';

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export default function WarpEffect() {
  const active = useStore((state) => state.ui.warpActive);
  const transitionState = useStore((state) => state.transitionState);
  const isMobile = useStore((state) => state.isMobile);
  const meshRef = useRef();
  const materialRef = useRef();
  const { camera } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) {
      return;
    }

    meshRef.current.position.copy(camera.position);
    meshRef.current.quaternion.copy(camera.quaternion);
    meshRef.current.translateZ(-2.8);

    const transitionPulse = transitionState.active ? Math.sin(Math.PI * transitionState.progress) : 0;
    const targetIntensity = active ? (isMobile ? 0.55 : 1) : transitionPulse * (isMobile ? 0.26 : 0.48);

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uIntensity.value,
      targetIntensity,
      0.08,
    );
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={isMobile ? [4.8, 7.8] : [6.8, 4.4]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={warpFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
