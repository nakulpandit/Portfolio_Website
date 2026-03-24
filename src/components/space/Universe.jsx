import { Line, Sparkles, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { about } from '../../data/about';
import { contact } from '../../data/contact';
import { education } from '../../data/education';
import { galaxies } from '../../data/galaxies';
import { projects } from '../../data/projects';
import { paperConnections, researchDomains, researchPapers } from '../../data/research';
import { skillGroups, skills } from '../../data/skills';
import { useStore } from '../../store/useStore';
import starfieldFragment from '../../shaders/starfield.glsl?raw';
import Galaxy from './Galaxy';
import Planet from './Planet';
import Star from './Star';
import WarpEffect from './WarpEffect';

const basicVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const addVectors = (a, b) => a.map((value, index) => value + b[index]);

function StarfieldDome() {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.008;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.03) * 0.04;
    }
  });

  return (
    <mesh ref={meshRef} scale={[90, 90, 90]}>
      <sphereGeometry args={[1, 64, 64]} />
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

function CameraRig() {
  const cameraTarget = useStore((state) => state.cameraTarget);
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const warpActive = useStore((state) => state.ui.warpActive);
  const { camera } = useThree();
  const lookAtRef = useRef(new THREE.Vector3(...cameraTarget.lookAt));
  const positionRef = useRef(new THREE.Vector3(...cameraTarget.position));

  useFrame((state) => {
    const targetPosition = new THREE.Vector3(...cameraTarget.position);
    const targetLookAt = new THREE.Vector3(...cameraTarget.lookAt);
    const pointerDrift = new THREE.Vector3(state.pointer.x * 0.35, state.pointer.y * 0.22, 0);
    const idleDrift = new THREE.Vector3(
      Math.sin(state.clock.elapsedTime * 0.12) * 0.22,
      Math.cos(state.clock.elapsedTime * 0.16) * 0.16,
      Math.sin(state.clock.elapsedTime * 0.08) * 0.12,
    );
    const focusOffset = currentGalaxy ? new THREE.Vector3(-0.18, 0.14, 0) : new THREE.Vector3();
    const composedTarget = targetPosition.clone().add(pointerDrift).add(idleDrift).add(focusOffset);
    const lookAtTarget = targetLookAt.clone().add(pointerDrift.clone().multiplyScalar(0.32));
    const desiredFov = warpActive ? 56 : selectedItem ? 43 : currentGalaxy ? 47 : 50;

    positionRef.current.lerp(composedTarget, warpActive ? 0.11 : 0.06);
    lookAtRef.current.lerp(lookAtTarget, warpActive ? 0.12 : 0.08);
    camera.position.copy(positionRef.current);
    camera.lookAt(lookAtRef.current);
    camera.fov = THREE.MathUtils.lerp(camera.fov, desiredFov, 0.06);
    camera.updateProjectionMatrix();
  });

  return null;
}

function SelectedBeacon({ item }) {
  const ringRef = useRef();

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.8;
    }
  });

  return (
    <group position={item.worldPosition}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.02, 16, 64]} />
        <meshBasicMaterial color={item.color ?? '#ffffff'} transparent opacity={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function PaperSystem({ item }) {
  const orbitRef = useRef();
  const nodes = useMemo(
    () => [
      { id: 'summary', label: 'Summary', offset: [1, 0, 0.25], color: '#72f7ff' },
      { id: 'concepts', label: 'Concepts', offset: [0, 0.9, -0.15], color: '#a4ff86' },
      { id: 'context', label: 'Context', offset: [-0.95, 0, 0.15], color: '#ffd96a' },
      { id: 'link', label: 'Link', offset: [0, -0.95, -0.2], color: '#ff7df2' },
    ],
    [],
  );

  useFrame((state) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.z = state.clock.elapsedTime * 0.35;
      orbitRef.current.rotation.y = state.clock.elapsedTime * 0.18;
    }
  });

  return (
    <group position={item.worldPosition}>
      <mesh>
        <sphereGeometry args={[0.24, 28, 28]} />
        <meshBasicMaterial color={item.color} />
      </mesh>
      <group ref={orbitRef}>
        {nodes.map((node) => (
          <group key={node.id} position={node.offset}>
            <Line
              points={[[0, 0, 0], node.offset.map((value) => value * -1)]}
              color={node.color}
              transparent
              opacity={0.55}
              lineWidth={1}
            />
            <mesh>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshBasicMaterial color={node.color} />
            </mesh>
            <Text position={[0, 0.18, 0]} fontSize={0.1} color="#f6f7fb" anchorX="center">
              {node.label}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );
}

function AboutSystem({ galaxy }) {
  const inspectItem = useStore((state) => state.inspectItem);
  const setCurrentGalaxy = useStore((state) => state.setCurrentGalaxy);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshBasicMaterial color={galaxy.color} />
      </mesh>
      {about.planets.map((item) => (
        <Planet
          key={item.id}
          label={item.title}
          color={item.color}
          orbitRadius={item.orbitRadius}
          orbitSpeed={item.orbitSpeed}
          size={item.size}
          initialAngle={item.initialAngle}
          onSelect={() => {
            setCurrentGalaxy(galaxy.id);
            inspectItem({
              ...item,
              kind: 'about',
              color: item.color,
              worldPosition: galaxy.position,
            });
          }}
          data={item}
        />
      ))}
    </group>
  );
}

function ProjectsSystem({ galaxy, selectedProjectId }) {
  const inspectItem = useStore((state) => state.inspectItem);
  const setCurrentGalaxy = useStore((state) => state.setCurrentGalaxy);

  return (
    <group>
      {projects.map((project) => {
        const worldPosition = addVectors(galaxy.position, project.position);
        return (
          <Star
            key={project.id}
            item={{ ...project, worldPosition }}
            color={project.color}
            size={project.featured ? 0.2 : 0.16}
            label={project.title}
            active={selectedProjectId === project.id}
            onSelect={(item) => {
              setCurrentGalaxy(galaxy.id);
              inspectItem({
                ...item,
                kind: 'project',
                cameraTarget: {
                  position: [worldPosition[0] + 0.2, worldPosition[1] + 0.2, worldPosition[2] + 2.7],
                  lookAt: worldPosition,
                  zoom: 1,
                },
              });
            }}
          />
        );
      })}
    </group>
  );
}

function SkillsSystem({ galaxy }) {
  const inspectItem = useStore((state) => state.inspectItem);
  const setCurrentGalaxy = useStore((state) => state.setCurrentGalaxy);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshBasicMaterial color="#a4ff86" />
      </mesh>
      {skills.map((skill) => {
        const group = skillGroups.find((entry) => entry.id === skill.category);
        return (
          <Planet
            key={skill.id}
            label={skill.name}
            color={group?.color ?? galaxy.color}
            orbitRadius={skill.orbitRadius}
            orbitSpeed={skill.orbitSpeed}
            size={skill.size}
            initialAngle={skill.initialAngle}
            onSelect={() => {
              setCurrentGalaxy(galaxy.id);
              inspectItem({
                ...skill,
                title: skill.name,
                kind: 'skill',
                color: group?.color ?? galaxy.color,
                summary: skill.description,
                levelLabel: `${skill.level}%`,
                groupLabel: group?.label ?? 'Skill',
                worldPosition: galaxy.position,
              });
            }}
            data={{
              ...skill,
              title: skill.name,
            }}
          />
        );
      })}
    </group>
  );
}

function EducationSystem({ galaxy, selectedEducationId }) {
  const inspectItem = useStore((state) => state.inspectItem);
  const setCurrentGalaxy = useStore((state) => state.setCurrentGalaxy);
  const points = education.map((item) => item.position);

  return (
    <group>
      <Line points={points} color="#7e8dff" lineWidth={3} transparent opacity={0.5} />
      {education.map((item, index) => {
        const worldPosition = addVectors(galaxy.position, item.position);
        return (
          <Star
            key={item.id}
            item={{ ...item, worldPosition }}
            color={item.color}
            size={index === 0 ? 0.18 : 0.15}
            label={item.title}
            active={selectedEducationId === item.id}
            onSelect={(selected) => {
              setCurrentGalaxy(galaxy.id);
              inspectItem({
                ...selected,
                kind: 'education',
                cameraTarget: {
                  position: [worldPosition[0] + 0.15, worldPosition[1] + 0.12, worldPosition[2] + 2.8],
                  lookAt: worldPosition,
                  zoom: 1,
                },
              });
            }}
          />
        );
      })}
    </group>
  );
}

function ResearchSystem({ galaxy, selectedResearch }) {
  const inspectItem = useStore((state) => state.inspectItem);
  const setCurrentGalaxy = useStore((state) => state.setCurrentGalaxy);

  return (
    <group>
      {researchDomains.map((domain) => (
        <group key={domain.id} position={domain.position}>
          <mesh>
            <sphereGeometry args={[0.16, 20, 20]} />
            <meshBasicMaterial color={domain.color} />
          </mesh>
          <Text position={[0, 0.28, 0]} fontSize={0.12} color="#f6f7fb" anchorX="center">
            {domain.title}
          </Text>
        </group>
      ))}

      {paperConnections.map(([fromId, toId]) => {
        const fromPaper = researchPapers.find((paper) => paper.id === fromId);
        const toPaper = researchPapers.find((paper) => paper.id === toId);
        if (!fromPaper || !toPaper) {
          return null;
        }

        return (
          <Line
            key={`${fromId}-${toId}`}
            points={[fromPaper.position, toPaper.position]}
            color="#ffffff"
            transparent
            opacity={0.16}
            lineWidth={1}
          />
        );
      })}

      {researchPapers.map((paper) => {
        const domain = researchDomains.find((entry) => entry.id === paper.domain);
        const worldPosition = addVectors(galaxy.position, paper.position);
        return (
          <Star
            key={paper.id}
            item={{ ...paper, worldPosition, color: domain?.color ?? galaxy.color }}
            color={domain?.color ?? galaxy.color}
            size={0.145}
            label={`${paper.title} (${paper.year})`}
            active={selectedResearch?.id === paper.id}
            onSelect={(item) => {
              setCurrentGalaxy(galaxy.id);
              inspectItem({
                ...item,
                kind: 'research',
                domainLabel: domain?.title ?? item.domain,
                cameraTarget: {
                  position: [worldPosition[0] + 0.15, worldPosition[1], worldPosition[2] + 2.7],
                  lookAt: worldPosition,
                  zoom: 1,
                },
              });
            }}
          />
        );
      })}

      {selectedResearch ? <PaperSystem item={selectedResearch} /> : null}
    </group>
  );
}

function ResumeStation({ galaxy }) {
  const inspectItem = useStore((state) => state.inspectItem);
  const setCurrentGalaxy = useStore((state) => state.setCurrentGalaxy);
  const setHoveredItem = useStore((state) => state.setHoveredItem);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) {
      return;
    }

    const scale = hovered ? 1.08 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <group
      ref={groupRef}
      onClick={(event) => {
        event.stopPropagation();
        setCurrentGalaxy(galaxy.id);
        inspectItem({
          id: 'resume-station',
          title: 'Resume Station',
          kind: 'resume',
          color: galaxy.color,
          summary: 'A recruiter-facing hub for profile context and the latest resume PDF.',
          link: '/resume/nakul-pandit-resume.pdf',
          worldPosition: galaxy.position,
        });
      }}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
        setHoveredItem({ title: 'Resume Station', kind: 'resume' });
      }}
      onPointerLeave={() => {
        setHovered(false);
        setHoveredItem(null);
      }}
    >
      <mesh>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#ffd96a" emissive="#ffd96a" emissiveIntensity={hovered ? 1.7 : 1.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.045, 16, 60]} />
        <meshBasicMaterial color="#72f7ff" transparent opacity={hovered ? 0.95 : 0.75} />
      </mesh>
    </group>
  );
}

function ContactSystem({ galaxy }) {
  const inspectItem = useStore((state) => state.inspectItem);
  const setCurrentGalaxy = useStore((state) => state.setCurrentGalaxy);
  const setHoveredItem = useStore((state) => state.setHoveredItem);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.18, 18, 18]} />
        <meshBasicMaterial color={galaxy.color} />
      </mesh>
      {contact.channels.map((channel) => (
        <ContactNode
          key={channel.id}
          channel={channel}
          galaxy={galaxy}
          inspectItem={inspectItem}
          setCurrentGalaxy={setCurrentGalaxy}
          setHoveredItem={setHoveredItem}
        />
      ))}
    </group>
  );
}

function ContactNode({ channel, galaxy, inspectItem, setCurrentGalaxy, setHoveredItem }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += 0.01;
    groupRef.current.position.y = channel.position[1] + Math.sin(state.clock.elapsedTime * 1.3 + channel.position[0]) * 0.06;
    const scale = hovered ? 1.12 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <group
      ref={groupRef}
      position={channel.position}
      onClick={(event) => {
        event.stopPropagation();
        setCurrentGalaxy(galaxy.id);
        inspectItem({
          ...channel,
          kind: 'contact',
          summary: channel.value,
          worldPosition: addVectors(galaxy.position, channel.position),
        });
      }}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
        setHoveredItem({ title: channel.title, kind: 'contact' });
      }}
      onPointerLeave={() => {
        setHovered(false);
        setHoveredItem(null);
      }}
    >
      <mesh>
        <boxGeometry args={[0.18, 0.12, 0.12]} />
        <meshBasicMaterial color={channel.color} />
      </mesh>
      <Text position={[0, 0.2, 0]} fontSize={0.09} color="#f6f7fb" anchorX="center">
        {channel.label}
      </Text>
    </group>
  );
}

export default function Universe() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const focusGalaxy = useStore((state) => state.focusGalaxy);
  const isMobile = useStore((state) => state.isMobile);
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current || isMobile) {
      return;
    }

    const targetX = state.pointer.y * 0.06;
    const targetY = state.pointer.x * 0.08;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetX, 0.03);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.03);
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      Math.sin(state.clock.elapsedTime * 0.16) * 0.22,
      0.02,
    );
  });

  return (
    <>
      <CameraRig />
      <StarfieldDome />
      <ambientLight intensity={0.7} />
      <hemisphereLight intensity={0.55} color="#cce7ff" groundColor="#0a0f18" />
      <pointLight position={[0, 4, 18]} intensity={1.1} color="#72f7ff" />
      <pointLight position={[12, 10, -10]} intensity={1.25} color="#ff7df2" />
      <pointLight position={[-14, -8, 12]} intensity={0.95} color="#a4ff86" />
      <Sparkles count={isMobile ? 80 : 140} scale={[52, 38, 58]} size={2.2} speed={0.12} color="#c1d8ff" />
      <Sparkles count={isMobile ? 30 : 65} scale={[22, 18, 24]} size={3.3} speed={0.18} color="#fff0d7" />
      <Sparkles count={isMobile ? 18 : 36} scale={[70, 52, 72]} size={1.3} speed={0.05} color="#8fb7ff" />

      <group ref={groupRef}>
        {galaxies.map((galaxy) => {
          const active = currentGalaxy === galaxy.id;
          const selectedResearch = active && selectedItem?.kind === 'research' ? selectedItem : null;
          const selectedProjectId = active && selectedItem?.kind === 'project' ? selectedItem.id : null;
          const selectedEducationId = active && selectedItem?.kind === 'education' ? selectedItem.id : null;

          return (
            <Galaxy key={galaxy.id} galaxy={galaxy} active={active} onFocus={focusGalaxy}>
              {galaxy.id === 'about' ? <AboutSystem galaxy={galaxy} /> : null}
              {galaxy.id === 'projects' ? <ProjectsSystem galaxy={galaxy} selectedProjectId={selectedProjectId} /> : null}
              {galaxy.id === 'skills' ? <SkillsSystem galaxy={galaxy} /> : null}
              {galaxy.id === 'education' ? <EducationSystem galaxy={galaxy} selectedEducationId={selectedEducationId} /> : null}
              {galaxy.id === 'research' ? <ResearchSystem galaxy={galaxy} selectedResearch={selectedResearch} /> : null}
              {galaxy.id === 'resume' ? <ResumeStation galaxy={galaxy} /> : null}
              {galaxy.id === 'contact' ? <ContactSystem galaxy={galaxy} /> : null}
            </Galaxy>
          );
        })}
      </group>

      {selectedItem?.worldPosition && selectedItem.kind !== 'about' ? <SelectedBeacon item={selectedItem} /> : null}
      <WarpEffect />
    </>
  );
}
