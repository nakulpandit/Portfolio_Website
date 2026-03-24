import { Line, Sparkles, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { galaxies } from '../../data/galaxies';
import { projects } from '../../data/projects';
import { paperConnections, researchDomains, researchPapers } from '../../data/research';
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

const aboutItems = [
  {
    id: 'background',
    title: 'Background',
    summary: 'A product-minded frontend engineer with a focus on immersive storytelling and systems thinking.',
    body:
      'I enjoy building interfaces that make sophisticated systems feel understandable, cinematic, and approachable for real users.',
    color: '#72f7ff',
  },
  {
    id: 'skills-about',
    title: 'Core Strengths',
    summary: 'Creative frontend architecture, design systems, motion, and interactive 3D.',
    body:
      'My work usually sits at the intersection of product clarity, visual craft, performance, and scalable implementation.',
    color: '#a4ff86',
  },
  {
    id: 'goals',
    title: 'Goals',
    summary: 'Create ambitious interfaces that still respect usability, accessibility, and trust.',
    body:
      'I am especially drawn to experiences where research, engineering, and narrative design all need to work together.',
    color: '#ff9d5c',
  },
];

const skills = [
  { id: 'react', title: 'React', proficiency: 0.95, experience: 5, color: '#72f7ff', angle: 0 },
  { id: 'three', title: 'Three.js', proficiency: 0.78, experience: 3, color: '#ff7df2', angle: 1.2 },
  { id: 'design', title: 'UI Systems', proficiency: 0.88, experience: 4, color: '#ffd96a', angle: 2.1 },
  { id: 'data', title: 'Data Viz', proficiency: 0.72, experience: 3, color: '#a4ff86', angle: 3.6 },
];

const educationMilestones = [
  { label: 'Foundations', offset: [-0.5, 0.4, 0] },
  { label: 'Research Track', offset: [0.7, -0.3, -1.8] },
  { label: 'Capstone', offset: [-0.6, 0.5, -3.6] },
];

const addVectors = (a, b) => a.map((value, index) => value + b[index]);

function StarfieldDome() {
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh scale={[60, 60, 60]}>
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
  const { camera } = useThree();
  const lookAtRef = useRef(new THREE.Vector3(...cameraTarget.lookAt));

  useFrame(() => {
    const targetPosition = new THREE.Vector3(...cameraTarget.position);
    const targetLookAt = new THREE.Vector3(...cameraTarget.lookAt);

    camera.position.lerp(targetPosition, 0.06);
    lookAtRef.current.lerp(targetLookAt, 0.08);
    camera.lookAt(lookAtRef.current);
  });

  return null;
}

function SelectedBeacon({ item }) {
  const ringRef = useRef();

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime;
    }
  });

  return (
    <group position={item.worldPosition}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.02, 16, 64]} />
        <meshBasicMaterial color={item.color ?? '#ffffff'} transparent opacity={0.75} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function PaperSystem({ item }) {
  const orbitRef = useRef();
  const nodes = useMemo(
    () => [
      { id: 'summary', label: 'Summary', offset: [0.85, 0, 0.25], color: '#72f7ff' },
      { id: 'concepts', label: 'Concepts', offset: [0, 0.75, -0.2], color: '#a4ff86' },
      { id: 'notes', label: 'Notes', offset: [-0.8, 0, 0.15], color: '#ffd96a' },
      { id: 'link', label: 'Link', offset: [0, -0.75, -0.15], color: '#ff7df2' },
    ],
    [],
  );

  useFrame((state) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.z = state.clock.elapsedTime * 0.45;
      orbitRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group position={item.worldPosition}>
      <mesh>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshBasicMaterial color={item.color} />
      </mesh>
      <group ref={orbitRef}>
        {nodes.map((node) => (
          <group key={node.id} position={node.offset}>
            <Line points={[[0, 0, 0], node.offset.map((value) => value * -1)]} color={node.color} transparent opacity={0.5} lineWidth={1} />
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={node.color} />
            </mesh>
            <Text position={[0, 0.16, 0]} fontSize={0.09} color="#f6f7fb" anchorX="center">
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
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshBasicMaterial color={galaxy.color} />
      </mesh>
      {aboutItems.map((item, index) => (
        <Planet
          key={item.id}
          label={item.title}
          color={item.color}
          orbitRadius={1.45 + index * 0.28}
          orbitSpeed={0.22 + index * 0.08}
          initialAngle={index * 2.1}
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
      {projects.map((project, index) => {
        const worldPosition = addVectors(galaxy.position, project.position);
        return (
          <Star
            key={project.id}
            item={{ ...project, position: project.position, worldPosition, color: galaxy.color }}
            color={index % 2 === 0 ? galaxy.color : '#ffd96a'}
            size={0.15 + index * 0.03}
            label={project.title}
            active={selectedProjectId === project.id}
            onSelect={(item) => {
              setCurrentGalaxy(galaxy.id);
              inspectItem({
                ...item,
                kind: 'project',
                cameraTarget: {
                  position: [worldPosition[0], worldPosition[1] + 0.25, 2.8],
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
            <sphereGeometry args={[0.14, 20, 20]} />
            <meshBasicMaterial color={domain.color} />
          </mesh>
          <Text position={[0, 0.25, 0]} fontSize={0.11} color="#f6f7fb" anchorX="center">
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
            item={{ ...paper, position: paper.position, worldPosition, color: domain?.color ?? galaxy.color }}
            color={domain?.color ?? galaxy.color}
            size={0.14}
            label={`${paper.title} (${paper.year})`}
            active={selectedResearch?.id === paper.id}
            onSelect={(item) => {
              setCurrentGalaxy(galaxy.id);
              inspectItem({
                ...item,
                kind: 'research',
                cameraTarget: {
                  position: [worldPosition[0], worldPosition[1], 2.6],
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

function SkillsSystem() {
  const inspectItem = useStore((state) => state.inspectItem);
  const setCurrentGalaxy = useStore((state) => state.setCurrentGalaxy);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color="#a4ff86" />
      </mesh>
      {skills.map((skill) => (
        <Planet
          key={skill.id}
          label={skill.title}
          color={skill.color}
          orbitRadius={1.25 + skill.experience * 0.08}
          orbitSpeed={0.18 + skill.proficiency * 0.5}
          size={0.1 + skill.experience * 0.025}
          initialAngle={skill.angle}
          onSelect={() => {
            setCurrentGalaxy('skills');
            inspectItem({
              ...skill,
              kind: 'skill',
              title: skill.title,
              summary: `Proficiency ${Math.round(skill.proficiency * 100)}% with ${skill.experience}+ years of focused experience.`,
              worldPosition: [0, 0, 0],
            });
          }}
          data={skill}
        />
      ))}
    </group>
  );
}

function EducationSystem() {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.8, 0.6, 0.8),
        new THREE.Vector3(0.8, -0.6, -0.8),
        new THREE.Vector3(-0.4, 0.5, -2.2),
        new THREE.Vector3(0.6, -0.4, -4.2),
      ]),
    [],
  );
  const points = curve.getPoints(80).map((point) => [point.x, point.y, point.z]);

  return (
    <group>
      <Line points={points} color="#7e8dff" lineWidth={3} />
      {educationMilestones.map((milestone) => (
        <group key={milestone.label} position={milestone.offset}>
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <Text position={[0, 0.22, 0]} fontSize={0.1} color="#f6f7fb" anchorX="center">
            {milestone.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

function ResumeStation() {
  return (
    <group>
      <mesh>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color="#ffd96a" emissive="#ffd96a" emissiveIntensity={1.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.56, 0.04, 16, 60]} />
        <meshBasicMaterial color="#72f7ff" transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function ContactSystem() {
  const satellites = useMemo(
    () => [
      { label: 'Email', position: [0.8, 0.3, 0] },
      { label: 'LinkedIn', position: [-0.7, -0.2, 0.4] },
      { label: 'GitHub', position: [0.2, -0.7, -0.3] },
    ],
    [],
  );

  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.18, 18, 18]} />
        <meshBasicMaterial color="#6cf6cf" />
      </mesh>
      {satellites.map((satellite) => (
        <group key={satellite.label} position={satellite.position}>
          <mesh>
            <boxGeometry args={[0.14, 0.14, 0.14]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <Text position={[0, 0.2, 0]} fontSize={0.08} color="#f6f7fb" anchorX="center">
            {satellite.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

export default function Universe() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const focusGalaxy = useStore((state) => state.focusGalaxy);
  const isMobile = useStore((state) => state.isMobile);

  return (
    <>
      <CameraRig />
      <StarfieldDome />
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 10]} intensity={1.1} color="#72f7ff" />
      <pointLight position={[-8, 5, 4]} intensity={1.4} color="#ff7df2" />
      <Sparkles count={isMobile ? 80 : 160} scale={[28, 20, 16]} size={2.2} speed={0.12} color="#9ec8ff" />

      {galaxies.map((galaxy) => {
        const active = currentGalaxy === galaxy.id;
        const selectedResearch = active && selectedItem?.kind === 'research' ? selectedItem : null;
        const selectedProjectId = active && selectedItem?.kind === 'project' ? selectedItem.id : null;

        return (
          <Galaxy key={galaxy.id} galaxy={galaxy} active={active} onFocus={focusGalaxy}>
            {galaxy.id === 'about' ? <AboutSystem galaxy={galaxy} /> : null}
            {galaxy.id === 'projects' ? <ProjectsSystem galaxy={galaxy} selectedProjectId={selectedProjectId} /> : null}
            {galaxy.id === 'skills' ? <SkillsSystem /> : null}
            {galaxy.id === 'education' ? <EducationSystem /> : null}
            {galaxy.id === 'research' ? <ResearchSystem galaxy={galaxy} selectedResearch={selectedResearch} /> : null}
            {galaxy.id === 'resume' ? <ResumeStation /> : null}
            {galaxy.id === 'contact' ? <ContactSystem /> : null}
          </Galaxy>
        );
      })}

      {selectedItem?.worldPosition ? <SelectedBeacon item={selectedItem} /> : null}
      <WarpEffect />
    </>
  );
}
