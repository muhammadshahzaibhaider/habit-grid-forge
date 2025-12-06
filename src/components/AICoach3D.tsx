import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// Character 1: Friendly Robot Face
const RobotFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }
    if (eyeLeftRef.current && eyeRightRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 0.5) > 0.95 ? 0.1 : 1;
      eyeLeftRef.current.scale.y = blink;
      eyeRightRef.current.scale.y = blink;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} onClick={onClick}>
        <mesh>
          <boxGeometry args={[1.2, 1, 0.8]} />
          <meshStandardMaterial color={primaryColor} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.41]}>
          <boxGeometry args={[1, 0.8, 0.02]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh ref={eyeLeftRef} position={[-0.25, 0.1, 0.43]}>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        <mesh ref={eyeRightRef} position={[0.25, 0.1, 0.43]}>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, -0.2, 0.43]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.3, 8]} />
          <meshStandardMaterial color={accentColor} metalness={0.6} />
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
const CuteFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
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
          <meshStandardMaterial color={primaryColor} metalness={0.1} roughness={0.5} />
        </mesh>
        <mesh position={[-0.4, -0.15, 0.5]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial color="#f87171" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.4, -0.15, 0.5]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial color="#f87171" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-0.2, 0.15, 0.65]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.2, 0.15, 0.65]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.18, 0.18, 0.76]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.22, 0.18, 0.76]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, -0.15, 0.65]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 3: Alien Face
const AlienFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
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
          <meshStandardMaterial color={primaryColor} metalness={0.2} roughness={0.4} />
        </mesh>
        <mesh position={[-0.25, 0.1, 0.45]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.25, 0.1, 0.45]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.25, 0.1, 0.65]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.25, 0.1, 0.65]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.3, 0.6, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh position={[0.3, 0.6, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh position={[-0.4, 0.85, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.4, 0.85, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
        </mesh>
      </group>
    </Float>
  );
};

// Character 4: Cat Face
const CatFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
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
          <meshStandardMaterial color={primaryColor} metalness={0.1} roughness={0.6} />
        </mesh>
        <mesh position={[-0.4, 0.55, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.2, 0.35, 3]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh position={[0.4, 0.55, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.2, 0.35, 3]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh position={[-0.38, 0.5, 0.1]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.1, 0.2, 3]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0.38, 0.5, 0.1]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.1, 0.2, 3]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[-0.2, 0.1, 0.6]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.2, 0.1, 0.6]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, -0.05, 0.65]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
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
const GhostFace = ({ onClick, primaryColor }: FaceProps) => {
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
          <meshStandardMaterial color={primaryColor} metalness={0.1} roughness={0.3} transparent opacity={0.9} />
        </mesh>
        <mesh position={[-0.18, 0.15, 0.45]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.18, 0.15, 0.45]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, -0.15, 0.45]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 6: Panda Face
const PandaFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
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
          <meshStandardMaterial color={primaryColor} metalness={0.1} roughness={0.5} />
        </mesh>
        <mesh position={[-0.45, 0.45, -0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.45, 0.45, -0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.22, 0.1, 0.5]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.22, 0.1, 0.5]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.22, 0.12, 0.65]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0.22, 0.12, 0.65]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0, -0.1, 0.62]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 7: Owl Face
const OwlFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
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
          <meshStandardMaterial color={primaryColor} metalness={0.1} roughness={0.6} />
        </mesh>
        <mesh position={[-0.22, 0.1, 0.5]}>
          <circleGeometry args={[0.22, 32]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0.22, 0.1, 0.5]}>
          <circleGeometry args={[0.22, 32]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[-0.22, 0.1, 0.52]}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.22, 0.1, 0.52]}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, -0.12, 0.58]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.08, 0.15, 3]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
        <mesh position={[-0.35, 0.55, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.1, 0.25, 4]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh position={[0.35, 0.55, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.1, 0.25, 4]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
      </group>
    </Float>
  );
};

// Character 8: Bunny Face
const BunnyFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
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
          <meshStandardMaterial color={primaryColor} metalness={0.1} roughness={0.5} />
        </mesh>
        <mesh ref={earLeftRef} position={[-0.2, 0.75, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh ref={earRightRef} position={[0.2, 0.75, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh position={[-0.2, 0.75, 0.08]}>
          <capsuleGeometry args={[0.05, 0.35, 8, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0.2, 0.75, 0.08]}>
          <capsuleGeometry args={[0.05, 0.35, 8, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[-0.18, 0.1, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.18, 0.1, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, -0.05, 0.52]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>
    </Float>
  );
};

// Character 9: Fox Face
const FoxFace = ({ onClick, primaryColor, accentColor }: FaceProps) => {
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
          <meshStandardMaterial color={primaryColor} metalness={0.1} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.15, 0.4]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[-0.35, 0.5, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.18, 0.35, 3]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh position={[0.35, 0.5, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.18, 0.35, 3]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh position={[-0.18, 0.12, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.18, 0.12, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, -0.12, 0.55]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
};

// Character 10: Star Face
const StarFace = ({ onClick, primaryColor }: FaceProps) => {
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
          <meshStandardMaterial color={primaryColor} metalness={0.3} roughness={0.4} emissive={primaryColor} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-0.18, 0.05, 0.35]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.18, 0.05, 0.35]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
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

  // Update colors when theme changes
  useEffect(() => {
    const updateColors = () => {
      setPrimaryColor(getCSSColor('--primary'));
      setAccentColor(getCSSColor('--accent'));
    };

    updateColors();

    // Listen for theme changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class', 'data-theme'] 
    });

    return () => observer.disconnect();
  }, []);

  // Save character preference
  useEffect(() => {
    localStorage.setItem('aiCoachCharacter', character);
  }, [character]);

  const CharacterComponent = CHARACTER_OPTIONS[character].component;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Settings button */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors z-10"
      >
        <Settings2 size={14} />
      </button>

      {/* Character selector dropdown */}
      {showSelector && (
        <div className="absolute bottom-full right-0 mb-2 w-36 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2 z-20">
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-1">Choose Character</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {(Object.entries(CHARACTER_OPTIONS) as [CharacterType, typeof CHARACTER_OPTIONS[CharacterType]][]).map(([key, value]) => (
              <button
                key={key}
                onClick={() => {
                  setCharacter(key);
                  setShowSelector(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                  character === key 
                    ? 'bg-primary/20 text-primary' 
                    : 'hover:bg-muted text-foreground'
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
        className="w-40 h-44 cursor-pointer"
        onClick={onCoachClick}
      >
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-3, 3, 3]} intensity={0.4} color={primaryColor} />
          <pointLight position={[0, 2, 3]} intensity={0.5} color={accentColor} />
          <CharacterComponent onClick={onCoachClick} primaryColor={primaryColor} accentColor={accentColor} />
        </Canvas>
      </div>
      
      {/* Label below */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50 whitespace-nowrap">
        Click to Chat!
      </div>
    </div>
  );
};
