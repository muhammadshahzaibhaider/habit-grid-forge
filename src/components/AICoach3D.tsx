import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Settings2 } from "lucide-react";

interface FaceProps {
  onClick: () => void;
  primaryColor: string;
  accentColor: string;
}

// Helper to get CSS variable value
const getCSSColor = (varName: string): string => {
  const style = getComputedStyle(document.documentElement);
  const value = style.getPropertyValue(varName).trim();
  if (value) {
    const [h, s, l] = value.split(' ').map(v => parseFloat(v));
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  return '#4ade80';
};

// Character 1: Friendly Robot Face - Sleek modern design
const RobotFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const antennaRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }
    if (eyeLeftRef.current && eyeRightRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 0.5) > 0.95 ? 0.1 : 1;
      eyeLeftRef.current.scale.y = THREE.MathUtils.lerp(eyeLeftRef.current.scale.y, blink, 0.3);
      eyeRightRef.current.scale.y = THREE.MathUtils.lerp(eyeRightRef.current.scale.y, blink, 0.3);
    }
    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        {/* Main head - rounded box shape */}
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.9, 0.7]} />
          <meshStandardMaterial 
            color={primaryColor} 
            metalness={0.6} 
            roughness={0.2}
          />
        </mesh>
        
        {/* Head border/frame */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[1.15, 0.95, 0.68]} />
          <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.05, 0.85, 0.7]} />
          <meshStandardMaterial color={primaryColor} metalness={0.6} roughness={0.2} />
        </mesh>

        {/* Face screen - glossy dark */}
        <mesh position={[0, 0, 0.36]}>
          <boxGeometry args={[0.85, 0.65, 0.02]} />
          <meshStandardMaterial 
            color="#0a0a0f" 
            metalness={0.95} 
            roughness={0.05}
          />
        </mesh>
        
        {/* Screen bezel glow */}
        <mesh position={[0, 0, 0.35]}>
          <boxGeometry args={[0.9, 0.7, 0.01]} />
          <meshStandardMaterial 
            color={primaryColor} 
            emissive={primaryColor} 
            emissiveIntensity={0.3}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Left Eye - glowing */}
        <mesh ref={eyeLeftRef} position={[-0.22, 0.08, 0.38]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={1.2}
          />
        </mesh>
        <mesh position={[-0.22, 0.08, 0.39]}>
          <circleGeometry args={[0.06, 32]} />
          <meshStandardMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={2}
          />
        </mesh>

        {/* Right Eye - glowing */}
        <mesh ref={eyeRightRef} position={[0.22, 0.08, 0.38]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={1.2}
          />
        </mesh>
        <mesh position={[0.22, 0.08, 0.39]}>
          <circleGeometry args={[0.06, 32]} />
          <meshStandardMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={2}
          />
        </mesh>

        {/* Smile - curved LED */}
        <mesh position={[0, -0.15, 0.38]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.12, 0.025, 8, 24, Math.PI]} />
          <meshStandardMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={1.5}
          />
        </mesh>

        {/* Antenna */}
        <group ref={antennaRef} position={[0, 0.55, 0]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.035, 0.25, 12]} />
            <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.08, 24, 24]} />
            <meshStandardMaterial 
              color="#ff4444" 
              emissive="#ff0000" 
              emissiveIntensity={1.5}
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Side panels */}
        <mesh position={[-0.58, 0, 0]}>
          <boxGeometry args={[0.06, 0.5, 0.4]} />
          <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.58, 0, 0]}>
          <boxGeometry args={[0.06, 0.5, 0.4]} />
          <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
};

// Character 2: Cute Round Face - Kawaii style
const CuteFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.06;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1) * 0.04;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.4}>
      <group ref={groupRef} onClick={onClick}>
        {/* Main face */}
        <mesh castShadow>
          <sphereGeometry args={[0.7, 48, 48]} />
          <meshStandardMaterial 
            color={primaryColor} 
            metalness={0.1} 
            roughness={0.6}
          />
        </mesh>
        
        {/* Gradient overlay for depth */}
        <mesh position={[0, 0.15, 0.3]}>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial 
            color={accentColor} 
            transparent 
            opacity={0.15}
          />
        </mesh>

        {/* Rosy cheeks - left */}
        <mesh position={[-0.38, -0.1, 0.52]}>
          <circleGeometry args={[0.13, 32]} />
          <meshStandardMaterial 
            color="#ff6b8a" 
            transparent 
            opacity={0.5}
          />
        </mesh>
        {/* Rosy cheeks - right */}
        <mesh position={[0.38, -0.1, 0.52]}>
          <circleGeometry args={[0.13, 32]} />
          <meshStandardMaterial 
            color="#ff6b8a" 
            transparent 
            opacity={0.5}
          />
        </mesh>

        {/* Eyes - large and cute */}
        <mesh position={[-0.2, 0.12, 0.62]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.2, 0.12, 0.62]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Eye highlights - large */}
        <mesh position={[-0.17, 0.16, 0.72]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0.23, 0.16, 0.72]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={0.8}
          />
        </mesh>
        {/* Eye highlights - small */}
        <mesh position={[-0.22, 0.08, 0.73]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0.18, 0.08, 0.73]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Happy smile */}
        <mesh position={[0, -0.12, 0.65]} rotation={[0.1, 0, Math.PI]}>
          <torusGeometry args={[0.1, 0.025, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Small decorative star */}
        <mesh position={[0.45, 0.45, 0.3]} rotation={[0, 0, 0.3]}>
          <octahedronGeometry args={[0.08]} />
          <meshStandardMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
};

// Character 3: Alien Face - Mysterious and glowy
const AlienFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const eyeGlowRef = useRef<number>(0);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.05;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
    eyeGlowRef.current = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        {/* Elongated alien head */}
        <mesh castShadow>
          <sphereGeometry args={[0.55, 48, 48]} />
          <meshStandardMaterial 
            color={primaryColor} 
            metalness={0.3} 
            roughness={0.5}
          />
        </mesh>
        
        {/* Forehead bulge */}
        <mesh position={[0, 0.35, 0.1]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial 
            color={primaryColor} 
            metalness={0.3} 
            roughness={0.5}
          />
        </mesh>

        {/* Big almond eyes - outer */}
        <mesh position={[-0.22, 0.1, 0.42]} rotation={[0, 0.2, 0.1]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.22, 0.1, 0.42]} rotation={[0, -0.2, -0.1]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Eye glow centers */}
        <mesh position={[-0.22, 0.1, 0.6]}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={2}
          />
        </mesh>
        <mesh position={[0.22, 0.1, 0.6]}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={2}
          />
        </mesh>

        {/* Antennae */}
        <mesh position={[-0.25, 0.65, 0]} rotation={[0.2, 0, 0.4]}>
          <cylinderGeometry args={[0.015, 0.025, 0.4, 8]} />
          <meshStandardMaterial color={primaryColor} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0.25, 0.65, 0]} rotation={[0.2, 0, -0.4]}>
          <cylinderGeometry args={[0.015, 0.025, 0.4, 8]} />
          <meshStandardMaterial color={primaryColor} metalness={0.5} roughness={0.3} />
        </mesh>
        
        {/* Antenna tips */}
        <mesh position={[-0.38, 0.9, 0.08]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={2.5}
          />
        </mesh>
        <mesh position={[0.38, 0.9, 0.08]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={2.5}
          />
        </mesh>

        {/* Small mouth */}
        <mesh position={[0, -0.2, 0.5]}>
          <circleGeometry args={[0.04, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 4: Cat Face - Fluffy and playful
const CatFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const earLeftRef = useRef<THREE.Mesh>(null);
  const earRightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.04;
    }
    if (earLeftRef.current) {
      earLeftRef.current.rotation.z = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
    if (earRightRef.current) {
      earRightRef.current.rotation.z = -0.3 + Math.sin(state.clock.elapsedTime * 3.2) * 0.05;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        {/* Main face - slightly oval */}
        <mesh castShadow>
          <sphereGeometry args={[0.6, 48, 48]} />
          <meshStandardMaterial 
            color={primaryColor} 
            metalness={0.05} 
            roughness={0.8}
          />
        </mesh>

        {/* Cheek fluff - left */}
        <mesh position={[-0.45, -0.15, 0.25]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color={primaryColor} roughness={0.9} />
        </mesh>
        {/* Cheek fluff - right */}
        <mesh position={[0.45, -0.15, 0.25]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color={primaryColor} roughness={0.9} />
        </mesh>

        {/* Ears */}
        <mesh ref={earLeftRef} position={[-0.35, 0.55, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.18, 0.35, 4]} />
          <meshStandardMaterial color={primaryColor} roughness={0.8} />
        </mesh>
        <mesh ref={earRightRef} position={[0.35, 0.55, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.18, 0.35, 4]} />
          <meshStandardMaterial color={primaryColor} roughness={0.8} />
        </mesh>
        
        {/* Inner ears */}
        <mesh position={[-0.33, 0.5, 0.1]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.09, 0.2, 4]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0.33, 0.5, 0.1]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.09, 0.2, 4]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>

        {/* Eyes - cat-like */}
        <mesh position={[-0.18, 0.1, 0.55]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.18, 0.1, 0.55]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        
        {/* Eye slits */}
        <mesh position={[-0.18, 0.1, 0.65]}>
          <capsuleGeometry args={[0.02, 0.08, 4, 8]} />
          <meshStandardMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0.18, 0.1, 0.65]}>
          <capsuleGeometry args={[0.02, 0.08, 4, 8]} />
          <meshStandardMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.05, 0.58]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.06, 0.06, 3]} />
          <meshStandardMaterial color="#ffb6c1" />
        </mesh>

        {/* Mouth lines */}
        <mesh position={[-0.06, -0.15, 0.55]} rotation={[0, 0.3, 0]}>
          <capsuleGeometry args={[0.01, 0.08, 4, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.06, -0.15, 0.55]} rotation={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.01, 0.08, 4, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Whiskers */}
        {[-0.08, 0, 0.08].map((yOffset, i) => (
          <mesh key={`whisker-l-${i}`} position={[-0.5, -0.08 + yOffset, 0.4]} rotation={[0, 0, 0.1 - i * 0.1]}>
            <cylinderGeometry args={[0.006, 0.003, 0.3, 4]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        ))}
        {[-0.08, 0, 0.08].map((yOffset, i) => (
          <mesh key={`whisker-r-${i}`} position={[0.5, -0.08 + yOffset, 0.4]} rotation={[0, 0, -0.1 + i * 0.1]}>
            <cylinderGeometry args={[0.006, 0.003, 0.3, 4]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        ))}
      </group>
    </Float>
  );
};

// Character 5: Ghost Face - Ethereal and friendly
const GhostFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.05} floatIntensity={0.6}>
      <group ref={groupRef} onClick={onClick}>
        {/* Main ghost body */}
        <mesh castShadow>
          <capsuleGeometry args={[0.45, 0.5, 24, 48]} />
          <meshStandardMaterial 
            color={primaryColor} 
            metalness={0.1} 
            roughness={0.3}
            transparent 
            opacity={0.92}
          />
        </mesh>

        {/* Inner glow */}
        <mesh>
          <capsuleGeometry args={[0.4, 0.45, 16, 32]} />
          <meshStandardMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.3}
            transparent 
            opacity={0.3}
          />
        </mesh>

        {/* Wavy bottom parts */}
        <mesh position={[-0.2, -0.55, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={primaryColor} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color={primaryColor} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0.2, -0.55, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={primaryColor} transparent opacity={0.9} />
        </mesh>

        {/* Eyes - large and cute */}
        <mesh position={[-0.15, 0.15, 0.42]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.15, 0.15, 0.42]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Eye highlights */}
        <mesh position={[-0.12, 0.18, 0.52]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.18, 0.18, 0.52]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>

        {/* Surprised mouth */}
        <mesh position={[0, -0.1, 0.44]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Rosy cheeks */}
        <mesh position={[-0.32, 0.02, 0.38]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#ffb6c1" transparent opacity={0.4} />
        </mesh>
        <mesh position={[0.32, 0.02, 0.38]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#ffb6c1" transparent opacity={0.4} />
        </mesh>
      </group>
    </Float>
  );
};

// Character 6: Panda Face - Cute and cuddly
const PandaFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.05;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        {/* Main face */}
        <mesh castShadow>
          <sphereGeometry args={[0.6, 48, 48]} />
          <meshStandardMaterial 
            color={primaryColor} 
            metalness={0.05} 
            roughness={0.7}
          />
        </mesh>

        {/* Ears - dark */}
        <mesh position={[-0.42, 0.42, -0.1]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <mesh position={[0.42, 0.42, -0.1]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>

        {/* Eye patches */}
        <mesh position={[-0.2, 0.1, 0.48]} rotation={[0, 0, 0.3]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.2, 0.1, 0.48]} rotation={[0, 0, -0.3]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.2, 0.12, 0.62]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0.2, 0.12, 0.62]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        
        {/* Eye highlights */}
        <mesh position={[-0.18, 0.14, 0.68]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.22, 0.14, 0.68]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.08, 0.58]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Mouth */}
        <mesh position={[0, -0.18, 0.55]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Cheek blush */}
        <mesh position={[-0.38, -0.05, 0.45]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#ffb6c1" transparent opacity={0.4} />
        </mesh>
        <mesh position={[0.38, -0.05, 0.45]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#ffb6c1" transparent opacity={0.4} />
        </mesh>
      </group>
    </Float>
  );
};

// Character 7: Owl Face - Wise and cute
const OwlFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
    }
  });

  return (
    <Float speed={1.3} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        {/* Main face */}
        <mesh castShadow>
          <sphereGeometry args={[0.55, 48, 48]} />
          <meshStandardMaterial 
            color={primaryColor} 
            metalness={0.1} 
            roughness={0.7}
          />
        </mesh>

        {/* Feather pattern - lighter belly */}
        <mesh position={[0, -0.15, 0.35]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>

        {/* Eye circles - large */}
        <mesh position={[-0.18, 0.1, 0.45]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0.18, 0.1, 0.45]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>

        {/* Eye outlines */}
        <mesh position={[-0.18, 0.1, 0.46]}>
          <ringGeometry args={[0.18, 0.2, 32]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh position={[0.18, 0.1, 0.46]}>
          <ringGeometry args={[0.18, 0.2, 32]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.18, 0.1, 0.48]}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.18, 0.1, 0.48]}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Eye highlights */}
        <mesh position={[-0.15, 0.13, 0.5]}>
          <circleGeometry args={[0.03, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.21, 0.13, 0.5]}>
          <circleGeometry args={[0.03, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>

        {/* Beak */}
        <mesh position={[0, -0.08, 0.55]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.07, 0.12, 3]} />
          <meshStandardMaterial color="#f97316" metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Ear tufts */}
        <mesh position={[-0.32, 0.5, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.08, 0.22, 4]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh position={[0.32, 0.5, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.08, 0.22, 4]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
      </group>
    </Float>
  );
};

// Character 8: Bunny Face - Soft and adorable
const BunnyFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const earLeftRef = useRef<THREE.Mesh>(null);
  const earRightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
    }
    if (earLeftRef.current) {
      earLeftRef.current.rotation.z = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
    }
    if (earRightRef.current) {
      earRightRef.current.rotation.z = -0.15 + Math.sin(state.clock.elapsedTime * 2.2) * 0.08;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        {/* Main face */}
        <mesh castShadow>
          <sphereGeometry args={[0.5, 48, 48]} />
          <meshStandardMaterial 
            color={primaryColor} 
            metalness={0.05} 
            roughness={0.8}
          />
        </mesh>

        {/* Cheeks */}
        <mesh position={[-0.35, -0.1, 0.3]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color={primaryColor} roughness={0.9} />
        </mesh>
        <mesh position={[0.35, -0.1, 0.3]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color={primaryColor} roughness={0.9} />
        </mesh>

        {/* Ears */}
        <mesh ref={earLeftRef} position={[-0.18, 0.75, 0]}>
          <capsuleGeometry args={[0.1, 0.55, 12, 24]} />
          <meshStandardMaterial color={primaryColor} roughness={0.8} />
        </mesh>
        <mesh ref={earRightRef} position={[0.18, 0.75, 0]}>
          <capsuleGeometry args={[0.1, 0.55, 12, 24]} />
          <meshStandardMaterial color={primaryColor} roughness={0.8} />
        </mesh>
        
        {/* Inner ears */}
        <mesh position={[-0.18, 0.75, 0.05]}>
          <capsuleGeometry args={[0.05, 0.4, 8, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0.18, 0.75, 0.05]}>
          <capsuleGeometry args={[0.05, 0.4, 8, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.15, 0.1, 0.45]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.15, 0.1, 0.45]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Eye highlights */}
        <mesh position={[-0.13, 0.13, 0.52]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.17, 0.13, 0.52]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.02, 0.48]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>

        {/* Mouth */}
        <mesh position={[0, -0.12, 0.45]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.04, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 9: Fox Face - Clever and sleek
const FoxFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.05;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        {/* Main face */}
        <mesh castShadow>
          <sphereGeometry args={[0.5, 48, 48]} />
          <meshStandardMaterial 
            color={primaryColor} 
            metalness={0.1} 
            roughness={0.6}
          />
        </mesh>

        {/* White muzzle area */}
        <mesh position={[0, -0.12, 0.38]}>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial color={accentColor} roughness={0.7} />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.32, 0.48, 0]} rotation={[0, 0, 0.35]}>
          <coneGeometry args={[0.16, 0.38, 4]} />
          <meshStandardMaterial color={primaryColor} roughness={0.7} />
        </mesh>
        <mesh position={[0.32, 0.48, 0]} rotation={[0, 0, -0.35]}>
          <coneGeometry args={[0.16, 0.38, 4]} />
          <meshStandardMaterial color={primaryColor} roughness={0.7} />
        </mesh>
        
        {/* Ear tips - dark */}
        <mesh position={[-0.38, 0.62, 0]} rotation={[0, 0, 0.35]}>
          <coneGeometry args={[0.08, 0.12, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.38, 0.62, 0]} rotation={[0, 0, -0.35]}>
          <coneGeometry args={[0.08, 0.12, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.15, 0.12, 0.45]}>
          <sphereGeometry args={[0.08, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.15, 0.12, 0.45]}>
          <sphereGeometry args={[0.08, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Eye highlights */}
        <mesh position={[-0.13, 0.14, 0.52]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.17, 0.14, 0.52]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.1, 0.52]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Sly smile */}
        <mesh position={[0, -0.2, 0.48]} rotation={[0.1, 0, Math.PI]}>
          <torusGeometry args={[0.08, 0.015, 8, 24, Math.PI * 0.8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 10: Star Face - Magical and sparkly
const StarFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  const starShape = new THREE.Shape();
  const outerRadius = 0.65;
  const innerRadius = 0.3;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    if (i === 0) {
      starShape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    } else {
      starShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
  }
  starShape.closePath();

  return (
    <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef} onClick={onClick}>
        {/* Main star */}
        <mesh castShadow>
          <extrudeGeometry args={[starShape, { depth: 0.25, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 }]} />
          <meshStandardMaterial 
            color={primaryColor} 
            metalness={0.4} 
            roughness={0.3}
            emissive={primaryColor}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Inner glow layer */}
        <mesh position={[0, 0, 0.05]}>
          <extrudeGeometry args={[starShape, { depth: 0.15, bevelEnabled: false }]} />
          <meshStandardMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.15, 0.05, 0.3]}>
          <sphereGeometry args={[0.08, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.15, 0.05, 0.3]}>
          <sphereGeometry args={[0.08, 24, 24]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Eye highlights */}
        <mesh position={[-0.13, 0.08, 0.36]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
        <mesh position={[0.17, 0.08, 0.36]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>

        {/* Happy smile */}
        <mesh position={[0, -0.1, 0.3]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.08, 0.02, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Cheek blush */}
        <mesh position={[-0.28, -0.05, 0.25]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#ffb6c1" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.28, -0.05, 0.25]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#ffb6c1" transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  );
};

// Character map
const CHARACTER_OPTIONS = {
  robot: { component: RobotFace, label: "🤖 Robot" },
  cute: { component: CuteFace, label: "😊 Cute" },
  alien: { component: AlienFace, label: "👽 Alien" },
  cat: { component: CatFace, label: "🐱 Cat" },
  ghost: { component: GhostFace, label: "👻 Ghost" },
  panda: { component: PandaFace, label: "🐼 Panda" },
  owl: { component: OwlFace, label: "🦉 Owl" },
  bunny: { component: BunnyFace, label: "🐰 Bunny" },
  fox: { component: FoxFace, label: "🦊 Fox" },
  star: { component: StarFace, label: "⭐ Star" },
};

export type CharacterType = keyof typeof CHARACTER_OPTIONS;

interface AICoach3DProps {
  onCoachClick: () => void;
}

export const AICoach3D = ({ onCoachClick }: AICoach3DProps) => {
  const [character, setCharacter] = useState<CharacterType>(() => {
    const saved = localStorage.getItem('aiCoachCharacter');
    return (saved as CharacterType) || 'robot';
  });
  const [showSelector, setShowSelector] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#4ade80');
  const [accentColor, setAccentColor] = useState('#22c55e');

  useEffect(() => {
    const updateColors = () => {
      setPrimaryColor(getCSSColor('--primary'));
      setAccentColor(getCSSColor('--accent'));
    };

    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class', 'data-theme'] 
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    localStorage.setItem('aiCoachCharacter', character);
  }, [character]);

  const CharacterComponent = CHARACTER_OPTIONS[character].component;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Settings button */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-200 z-10"
      >
        <Settings2 size={15} />
      </button>

      {/* Character selector dropdown */}
      {showSelector && (
        <div className="absolute bottom-full right-0 mb-3 w-40 bg-card/98 backdrop-blur-md border border-border rounded-xl shadow-2xl p-2 z-20 animate-scale-in">
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Choose Character</div>
          <div className="space-y-0.5 max-h-52 overflow-y-auto">
            {(Object.entries(CHARACTER_OPTIONS) as [CharacterType, typeof CHARACTER_OPTIONS[CharacterType]][]).map(([key, value]) => (
              <button
                key={key}
                onClick={() => {
                  setCharacter(key);
                  setShowSelector(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  character === key 
                    ? 'bg-primary/20 text-primary font-medium' 
                    : 'hover:bg-muted text-foreground hover:translate-x-1'
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3D Character */}
      <div 
        className="w-44 h-48 cursor-pointer"
        onClick={onCoachClick}
      >
        <Canvas
          camera={{ position: [0, 0, 2.8], fov: 50 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-3, 2, 4]} intensity={0.4} color={primaryColor} />
          <pointLight position={[0, 3, 2]} intensity={0.6} color={accentColor} />
          <pointLight position={[0, -2, 2]} intensity={0.3} color="#ffffff" />
          <CharacterComponent onClick={onCoachClick} primaryColor={primaryColor} accentColor={accentColor} />
        </Canvas>
      </div>
      
      {/* Label */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground bg-card/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-border shadow-md whitespace-nowrap">
        Click to Chat!
      </div>
    </div>
  );
};
