import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface FaceProps {
  onClick: () => void;
}

// Character 1: Friendly Robot Face
const RobotFace = ({ onClick }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }
    // Blinking effect
    if (eyeLeftRef.current && eyeRightRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 0.5) > 0.95 ? 0.1 : 1;
      eyeLeftRef.current.scale.y = blink;
      eyeRightRef.current.scale.y = blink;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        {/* Head */}
        <mesh>
          <boxGeometry args={[1.2, 1, 0.8]} />
          <meshStandardMaterial color="#4ade80" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* Face screen */}
        <mesh position={[0, 0, 0.41]}>
          <boxGeometry args={[1, 0.8, 0.02]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Left Eye */}
        <mesh ref={eyeLeftRef} position={[-0.25, 0.1, 0.43]}>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        {/* Right Eye */}
        <mesh ref={eyeRightRef} position={[0.25, 0.1, 0.43]}>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        {/* Smile */}
        <mesh position={[0, -0.2, 0.43]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={1} />
        </mesh>
        {/* Antenna */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#22c55e" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
        </mesh>
      </group>
    </Float>
  );
};

// Character 2: Cute Round Face
const CuteFace = ({ onClick }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.06;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1) * 0.05;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.4}>
      <group ref={groupRef} onClick={onClick}>
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.1} roughness={0.5} />
        </mesh>
        {/* Cheeks */}
        <mesh position={[-0.4, -0.15, 0.5]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial color="#f87171" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.4, -0.15, 0.5]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial color="#f87171" transparent opacity={0.6} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.2, 0.15, 0.65]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.2, 0.15, 0.65]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Eye shine */}
        <mesh position={[-0.18, 0.18, 0.76]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.22, 0.18, 0.76]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        {/* Smile */}
        <mesh position={[0, -0.15, 0.65]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 3: Alien Face
const AlienFace = ({ onClick }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.05;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#a855f7" metalness={0.2} roughness={0.4} />
        </mesh>
        {/* Big eyes */}
        <mesh position={[-0.25, 0.1, 0.45]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.25, 0.1, 0.45]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Eye glow */}
        <mesh position={[-0.25, 0.1, 0.65]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.25, 0.1, 0.65]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
        </mesh>
        {/* Antennae */}
        <mesh position={[-0.3, 0.6, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#a855f7" />
        </mesh>
        <mesh position={[0.3, 0.6, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#a855f7" />
        </mesh>
        <mesh position={[-0.4, 0.85, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.4, 0.85, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
        </mesh>
      </group>
    </Float>
  );
};

// Character 4: Cat Face
const CatFace = ({ onClick }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.04;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        <mesh>
          <sphereGeometry args={[0.65, 32, 32]} />
          <meshStandardMaterial color="#f97316" metalness={0.1} roughness={0.6} />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.4, 0.55, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.2, 0.35, 3]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
        <mesh position={[0.4, 0.55, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.2, 0.35, 3]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
        {/* Inner ears */}
        <mesh position={[-0.38, 0.5, 0.1]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.1, 0.2, 3]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <mesh position={[0.38, 0.5, 0.1]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.1, 0.2, 3]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.2, 0.1, 0.6]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.2, 0.1, 0.6]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.05, 0.65]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Whiskers */}
        <mesh position={[-0.35, -0.1, 0.5]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.008, 0.008, 0.3, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.35, -0.1, 0.5]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.008, 0.008, 0.3, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 5: Ghost Face
const GhostFace = ({ onClick }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.05} floatIntensity={0.5}>
      <group ref={groupRef} onClick={onClick}>
        <mesh>
          <capsuleGeometry args={[0.5, 0.4, 16, 32]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.1} roughness={0.3} transparent opacity={0.9} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.18, 0.15, 0.45]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.18, 0.15, 0.45]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.15, 0.45]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 6: Panda Face
const PandaFace = ({ onClick }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        <mesh>
          <sphereGeometry args={[0.65, 32, 32]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.5} />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.45, 0.45, -0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.45, 0.45, -0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Eye patches */}
        <mesh position={[-0.22, 0.1, 0.5]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.22, 0.1, 0.5]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.22, 0.12, 0.65]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.22, 0.12, 0.65]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.1, 0.62]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 7: Owl Face
const OwlFace = ({ onClick }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <Float speed={1.3} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#78350f" metalness={0.1} roughness={0.6} />
        </mesh>
        {/* Eye circles */}
        <mesh position={[-0.22, 0.1, 0.5]}>
          <circleGeometry args={[0.22, 32]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>
        <mesh position={[0.22, 0.1, 0.5]}>
          <circleGeometry args={[0.22, 32]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.22, 0.1, 0.52]}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.22, 0.1, 0.52]}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Beak */}
        <mesh position={[0, -0.12, 0.58]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.08, 0.15, 3]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
        {/* Ear tufts */}
        <mesh position={[-0.35, 0.55, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.1, 0.25, 4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0.35, 0.55, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.1, 0.25, 4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 8: Bunny Face
const BunnyFace = ({ onClick }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const earLeftRef = useRef<THREE.Mesh>(null);
  const earRightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
    }
    if (earLeftRef.current) {
      earLeftRef.current.rotation.z = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    if (earRightRef.current) {
      earRightRef.current.rotation.z = -0.2 + Math.sin(state.clock.elapsedTime * 2.2) * 0.1;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial color="#fecaca" metalness={0.1} roughness={0.5} />
        </mesh>
        {/* Ears */}
        <mesh ref={earLeftRef} position={[-0.2, 0.75, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial color="#fecaca" />
        </mesh>
        <mesh ref={earRightRef} position={[0.2, 0.75, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial color="#fecaca" />
        </mesh>
        {/* Inner ears */}
        <mesh position={[-0.2, 0.75, 0.08]}>
          <capsuleGeometry args={[0.05, 0.35, 8, 16]} />
          <meshStandardMaterial color="#f87171" />
        </mesh>
        <mesh position={[0.2, 0.75, 0.08]}>
          <capsuleGeometry args={[0.05, 0.35, 8, 16]} />
          <meshStandardMaterial color="#f87171" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.18, 0.1, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.18, 0.1, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.05, 0.52]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#f87171" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 9: Fox Face
const FoxFace = ({ onClick }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial color="#ea580c" metalness={0.1} roughness={0.5} />
        </mesh>
        {/* White muzzle area */}
        <mesh position={[0, -0.15, 0.4]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.35, 0.5, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.18, 0.35, 3]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
        <mesh position={[0.35, 0.5, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.18, 0.35, 3]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.18, 0.12, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.18, 0.12, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.12, 0.55]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 10: Star Face
const StarFace = ({ onClick }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  const starShape = new THREE.Shape();
  const outerRadius = 0.7;
  const innerRadius = 0.35;
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
        <mesh>
          <extrudeGeometry args={[starShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 }]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.4} emissive="#fbbf24" emissiveIntensity={0.3} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.18, 0.05, 0.35]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.18, 0.05, 0.35]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Smile */}
        <mesh position={[0, -0.12, 0.35]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character map for easy switching
const CHARACTER_OPTIONS = {
  robot: RobotFace,
  cute: CuteFace,
  alien: AlienFace,
  cat: CatFace,
  ghost: GhostFace,
  panda: PandaFace,
  owl: OwlFace,
  bunny: BunnyFace,
  fox: FoxFace,
  star: StarFace,
};

export type CharacterType = keyof typeof CHARACTER_OPTIONS;

interface AICoach3DProps {
  onCoachClick: () => void;
  character?: CharacterType;
}

export const AICoach3D = ({ onCoachClick, character = 'robot' }: AICoach3DProps) => {
  const CharacterComponent = CHARACTER_OPTIONS[character];

  return (
    <div className="fixed bottom-4 right-4 w-40 h-44 z-50 cursor-pointer">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 3, 3]} intensity={0.4} color="#4ade80" />
        <pointLight position={[0, 2, 3]} intensity={0.5} color="#fbbf24" />
        <CharacterComponent onClick={onCoachClick} />
      </Canvas>
      
      {/* Label below */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50 whitespace-nowrap">
        Click to Chat!
      </div>
    </div>
  );
};
