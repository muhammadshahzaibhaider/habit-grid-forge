import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";

interface CharacterProps {
  onClick: () => void;
}

const Character = ({ onClick }: CharacterProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle bobbing motion
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      // Subtle rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        ref={groupRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        {/* Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[0.35, 0.5, 8, 16]} />
          <meshStandardMaterial
            color={hovered ? "#6366f1" : "#8b5cf6"}
            emissive={hovered ? "#4f46e5" : "#6d28d9"}
            emissiveIntensity={0.3}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color={hovered ? "#f0abfc" : "#e879f9"}
            emissive="#d946ef"
            emissiveIntensity={0.2}
            metalness={0.2}
            roughness={0.5}
          />
        </mesh>

        {/* Left Eye */}
        <mesh position={[-0.1, 0.7, 0.25]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>

        {/* Right Eye */}
        <mesh position={[0.1, 0.7, 0.25]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>

        {/* Smile */}
        <mesh position={[0, 0.55, 0.28]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>

        {/* Left Arm */}
        <mesh position={[-0.45, 0.1, 0]} rotation={[0, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
          <meshStandardMaterial
            color={hovered ? "#6366f1" : "#8b5cf6"}
            emissive={hovered ? "#4f46e5" : "#6d28d9"}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Right Arm - Waving */}
        <group position={[0.45, 0.1, 0]}>
          <mesh rotation={[0, 0, -0.8]} castShadow>
            <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
            <meshStandardMaterial
              color={hovered ? "#6366f1" : "#8b5cf6"}
              emissive={hovered ? "#4f46e5" : "#6d28d9"}
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>

        {/* Antenna */}
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
          <meshStandardMaterial color="#c084fc" />
        </mesh>
        <mesh position={[0, 1.12, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#06b6d4"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Floating text */}
        <Text
          position={[0, 1.4, 0]}
          fontSize={0.15}
          color={hovered ? "#22d3ee" : "#a855f7"}
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {hovered ? "Click me!" : "AI Coach"}
        </Text>
      </group>
    </Float>
  );
};

interface AICoach3DProps {
  onCoachClick: () => void;
}

export const AICoach3D = ({ onCoachClick }: AICoach3DProps) => {
  return (
    <div className="fixed bottom-4 right-4 w-40 h-48 z-50 cursor-pointer">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#c084fc" />
        <pointLight position={[0, -3, 2]} intensity={0.3} color="#22d3ee" />
        <Character onClick={onCoachClick} />
      </Canvas>
    </div>
  );
};
