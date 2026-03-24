import { Billboard, Line, Sparkles, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { about } from '../../data/about';
import { contact } from '../../data/contact';
import { education } from '../../data/education';
import { projects } from '../../data/projects';
import { paperConnections, researchDomains, researchPapers } from '../../data/research';
import { skillGroups, skills } from '../../data/skills';
import { useStore } from '../../store/useStore';
import Planet from './Planet';
import Star from './Star';

const addVectors = (a, b) => a.map((value, index) => value + b[index]);

function InteriorAtmosphere({ galaxy }) {
  const shellRef = useRef();
  const ringRef = useRef();
  const veilRef = useRef();

  useFrame((state, delta) => {
    if (shellRef.current) {
      shellRef.current.rotation.y += delta * 0.08;
      shellRef.current.rotation.z += delta * 0.03;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.16;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.14) * 0.22;
    }

    if (veilRef.current) {
      veilRef.current.material.opacity = 0.18 + Math.sin(state.clock.elapsedTime * 0.6) * 0.04;
    }
  });

  return (
    <group position={galaxy.position}>
      <Sparkles count={60} scale={[10, 8, 10]} size={4} speed={0.18} color={galaxy.color} />
      <Sparkles count={32} scale={[6, 5, 6]} size={6} speed={0.28} color="#ffffff" />
      <mesh ref={veilRef} scale={[7.2, 5.4, 7.2]}>
        <sphereGeometry args={[1, 40, 40]} />
        <meshBasicMaterial color={galaxy.color} transparent opacity={0.2} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      <mesh ref={shellRef} scale={[4.2, 3.2, 4.2]}>
        <sphereGeometry args={[1, 40, 40]} />
        <meshBasicMaterial color={galaxy.color} transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} scale={[3.1, 3.1, 3.1]}>
        <torusGeometry args={[1, 0.04, 16, 140]} />
        <meshBasicMaterial color={galaxy.color} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <Billboard position={[0, 2.6, 0]}>
        <group>
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[3.1, 0.72]} />
            <meshBasicMaterial color="#060a15" transparent opacity={0.58} />
          </mesh>
          <Text fontSize={0.24} color="#f6f7fb" anchorX="center">
            {galaxy.label.toUpperCase()}
          </Text>
          <Text position={[0, -0.24, 0]} fontSize={0.11} color="#a9bed3" anchorX="center">
            Explore the orbiting systems
          </Text>
        </group>
      </Billboard>
    </group>
  );
}

function AboutInterior({ galaxy, selectedItem }) {
  const inspectItem = useStore((state) => state.inspectItem);

  return (
    <group position={galaxy.position}>
      <mesh>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color={galaxy.color} emissive={galaxy.color} emissiveIntensity={1.3} roughness={0.2} />
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
          active={selectedItem?.id === item.id}
          anchorPosition={galaxy.position}
          data={item}
          onSelect={(payload) => {
            inspectItem({
              ...item,
              ...payload,
              title: item.title,
              kind: 'about',
              galaxyId: galaxy.id,
              cameraTarget: {
                focus: payload.worldPosition,
                distance: 2.8,
                yaw: 0.55,
                pitch: 0.18,
                minDistance: 2.2,
                maxDistance: 6.4,
              },
            });
          }}
        />
      ))}
    </group>
  );
}

function ProjectsInterior({ galaxy, selectedItem }) {
  const inspectItem = useStore((state) => state.inspectItem);
  const selectedProjectId = selectedItem?.kind === 'project' ? selectedItem.id : null;

  return (
    <group position={galaxy.position}>
      <mesh>
        <sphereGeometry args={[0.34, 28, 28]} />
        <meshBasicMaterial color={galaxy.color} />
      </mesh>
      {projects.map((project) => {
        const worldPosition = addVectors(galaxy.position, project.position);

        return (
          <group key={project.id}>
            <Line points={[[0, 0, 0], project.position]} color={project.color} transparent opacity={0.22} lineWidth={1.5} />
            <Star
              item={{ ...project, worldPosition }}
              color={project.color}
              size={project.featured ? 0.24 : 0.18}
              label={project.title}
              active={selectedProjectId === project.id}
              onSelect={(item) => {
                inspectItem({
                  ...item,
                  kind: 'project',
                  galaxyId: galaxy.id,
                  cameraTarget: {
                    focus: worldPosition,
                    distance: 2.9,
                    yaw: 0.42,
                    pitch: 0.18,
                    minDistance: 2.3,
                    maxDistance: 7,
                  },
                });
              }}
            />
          </group>
        );
      })}
    </group>
  );
}

function SkillsInterior({ galaxy, selectedItem }) {
  const inspectItem = useStore((state) => state.inspectItem);
  const selectedSkillId = selectedItem?.kind === 'skill' ? selectedItem.id : null;

  return (
    <group position={galaxy.position}>
      <mesh>
        <sphereGeometry args={[0.38, 26, 26]} />
        <meshStandardMaterial color="#d8ffd1" emissive="#a4ff86" emissiveIntensity={1.2} roughness={0.22} />
      </mesh>
      {skillGroups.map((group, index) => (
        <Billboard key={group.id} position={[Math.cos(index * 1.1) * 3.7, 1 + (index % 2) * 0.28, Math.sin(index * 1.1) * 3.7]}>
          <Text fontSize={0.12} color={group.color} anchorX="center">
            {group.label}
          </Text>
        </Billboard>
      ))}
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
            active={selectedSkillId === skill.id}
            anchorPosition={galaxy.position}
            data={skill}
            onSelect={(payload) => {
              inspectItem({
                ...skill,
                ...payload,
                title: skill.name,
                kind: 'skill',
                galaxyId: galaxy.id,
                color: group?.color ?? galaxy.color,
                summary: skill.description,
                levelLabel: `${skill.level}% proficiency`,
                groupLabel: group?.label ?? 'Skill',
                cameraTarget: {
                  focus: payload.worldPosition,
                  distance: 2.8,
                  yaw: 0.5,
                  pitch: 0.2,
                  minDistance: 2.3,
                  maxDistance: 7,
                },
              });
            }}
          />
        );
      })}
    </group>
  );
}

function EducationInterior({ galaxy, selectedItem }) {
  const inspectItem = useStore((state) => state.inspectItem);

  const curvePoints = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(education.map((item) => new THREE.Vector3(...item.position)));
    return curve.getPoints(80).map((point) => point.toArray());
  }, []);

  return (
    <group position={galaxy.position}>
      <Line points={curvePoints} color="#7e8dff" lineWidth={3} transparent opacity={0.42} />
      {education.map((item, index) => {
        const worldPosition = addVectors(galaxy.position, item.position);

        return (
          <group key={item.id}>
            <mesh position={item.position} rotation={[Math.PI / 2, 0, 0]} scale={selectedItem?.id === item.id ? 0.34 : 0.28}>
              <torusGeometry args={[1, 0.12, 12, 48]} />
              <meshBasicMaterial color={item.color} transparent opacity={0.42} />
            </mesh>
            <Star
              item={{ ...item, worldPosition }}
              color={item.color}
              size={index === 0 ? 0.22 : 0.18}
              label={item.title}
              active={selectedItem?.id === item.id}
              onSelect={(entry) => {
                inspectItem({
                  ...entry,
                  kind: 'education',
                  galaxyId: galaxy.id,
                  cameraTarget: {
                    focus: worldPosition,
                    distance: 2.8,
                    yaw: 0.46,
                    pitch: 0.16,
                    minDistance: 2.3,
                    maxDistance: 7.2,
                  },
                });
              }}
            />
          </group>
        );
      })}
    </group>
  );
}

function ResearchInterior({ galaxy, selectedItem }) {
  const inspectItem = useStore((state) => state.inspectItem);

  return (
    <group position={galaxy.position}>
      {researchDomains.map((domain) => (
        <group key={domain.id} position={domain.position}>
          <mesh>
            <sphereGeometry args={[0.18, 20, 20]} />
            <meshBasicMaterial color={domain.color} />
          </mesh>
          <Billboard position={[0, 0.32, 0]}>
            <Text fontSize={0.12} color="#f6f7fb" anchorX="center">
              {domain.title}
            </Text>
          </Billboard>
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
            opacity={0.18}
            lineWidth={1.2}
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
            size={0.17}
            label={`${paper.title} (${paper.year})`}
            active={selectedItem?.id === paper.id}
            onSelect={(item) => {
              inspectItem({
                ...item,
                kind: 'research',
                galaxyId: galaxy.id,
                domainLabel: domain?.title ?? item.domain,
                cameraTarget: {
                  focus: worldPosition,
                  distance: 2.85,
                  yaw: 0.48,
                  pitch: 0.18,
                  minDistance: 2.3,
                  maxDistance: 7.4,
                },
              });
            }}
          />
        );
      })}
    </group>
  );
}

function ResumeHub({ galaxy, selectedItem }) {
  const inspectItem = useStore((state) => state.inspectItem);
  const setHoveredItem = useStore((state) => state.setHoveredItem);
  const groupRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.08;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.35;
    }
  });

  const stations = [
    { id: 'resume-pdf', title: 'Resume PDF', position: [1.8, 0.5, 0.2], color: '#72f7ff' },
    { id: 'profile-snapshot', title: 'Profile Snapshot', position: [-1.6, -0.25, 0.45], color: '#ffd96a' },
    { id: 'recruiter-route', title: 'Recruiter Route', position: [0.3, -1.5, -0.4], color: '#ff9d5c' },
  ];

  return (
    <group position={galaxy.position}>
      <group
        ref={groupRef}
        onClick={(event) => {
          event.stopPropagation();
          inspectItem({
            id: 'resume-station',
            title: 'Resume Station',
            kind: 'resume',
            galaxyId: galaxy.id,
            color: galaxy.color,
            summary: 'A recruiter-facing hub for profile context and the latest resume PDF.',
            link: '/resume/nakul-pandit-resume.pdf',
            worldPosition: galaxy.position,
            cameraTarget: {
              focus: galaxy.position,
              distance: 3.1,
              yaw: 0.34,
              pitch: 0.14,
              minDistance: 2.6,
              maxDistance: 7.2,
            },
          });
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          setHoveredItem({ title: 'Resume Station', kind: 'resume' });
        }}
        onPointerOut={() => {
          setHovered(false);
          setHoveredItem(null);
        }}
      >
        <pointLight color={galaxy.color} intensity={hovered || selectedItem?.kind === 'resume' ? 1.9 : 1.2} distance={5} decay={2} />
        <mesh>
          <octahedronGeometry args={[0.52, 0]} />
          <meshStandardMaterial color="#ffd96a" emissive="#ffd96a" emissiveIntensity={hovered ? 2 : 1.15} roughness={0.25} />
        </mesh>
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} scale={[1.5, 1.5, 1.5]}>
          <torusGeometry args={[1, 0.05, 16, 72]} />
          <meshBasicMaterial color="#72f7ff" transparent opacity={0.9} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.95, 20, 20]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
      </group>

      {stations.map((station) => {
        const worldPosition = addVectors(galaxy.position, station.position);

        return (
          <group key={station.id}>
            <Line points={[[0, 0, 0], station.position]} color={station.color} transparent opacity={0.22} lineWidth={1.1} />
            <Star
              item={{ ...station, position: station.position, worldPosition }}
              color={station.color}
              size={0.16}
              label={station.title}
              active={selectedItem?.id === station.id}
              onSelect={(item) => {
                inspectItem({
                  ...item,
                  kind: 'resume',
                  galaxyId: galaxy.id,
                  link: '/resume/nakul-pandit-resume.pdf',
                  cameraTarget: {
                    focus: worldPosition,
                    distance: 2.7,
                    yaw: 0.46,
                    pitch: 0.18,
                    minDistance: 2.2,
                    maxDistance: 6.8,
                  },
                });
              }}
            />
          </group>
        );
      })}
    </group>
  );
}

function ContactInterior({ galaxy, selectedItem }) {
  const inspectItem = useStore((state) => state.inspectItem);

  return (
    <group position={galaxy.position}>
      <mesh>
        <sphereGeometry args={[0.24, 18, 18]} />
        <meshBasicMaterial color={galaxy.color} />
      </mesh>
      {contact.channels.map((channel) => {
        const worldPosition = addVectors(galaxy.position, channel.position);

        return (
          <group key={channel.id}>
            <Line points={[[0, 0, 0], channel.position]} color={channel.color} transparent opacity={0.24} lineWidth={1.2} />
            <Star
              item={{ ...channel, position: channel.position, worldPosition, title: channel.title }}
              color={channel.color}
              size={0.18}
              label={channel.label}
              active={selectedItem?.id === channel.id}
              onSelect={(item) => {
                inspectItem({
                  ...item,
                  kind: 'contact',
                  galaxyId: galaxy.id,
                  summary: channel.value,
                  cameraTarget: {
                    focus: worldPosition,
                    distance: 2.75,
                    yaw: 0.44,
                    pitch: 0.2,
                    minDistance: 2.3,
                    maxDistance: 6.8,
                  },
                });
              }}
            />
          </group>
        );
      })}
    </group>
  );
}

export default function GalaxyInterior({ galaxy, selectedItem }) {
  if (!galaxy) {
    return null;
  }

  return (
    <>
      <InteriorAtmosphere galaxy={galaxy} />
      {galaxy.id === 'about' ? <AboutInterior galaxy={galaxy} selectedItem={selectedItem} /> : null}
      {galaxy.id === 'projects' ? <ProjectsInterior galaxy={galaxy} selectedItem={selectedItem} /> : null}
      {galaxy.id === 'skills' ? <SkillsInterior galaxy={galaxy} selectedItem={selectedItem} /> : null}
      {galaxy.id === 'education' ? <EducationInterior galaxy={galaxy} selectedItem={selectedItem} /> : null}
      {galaxy.id === 'research' ? <ResearchInterior galaxy={galaxy} selectedItem={selectedItem} /> : null}
      {galaxy.id === 'resume' ? <ResumeHub galaxy={galaxy} selectedItem={selectedItem} /> : null}
      {galaxy.id === 'contact' ? <ContactInterior galaxy={galaxy} selectedItem={selectedItem} /> : null}
    </>
  );
}
