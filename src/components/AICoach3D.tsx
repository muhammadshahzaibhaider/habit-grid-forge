import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

interface CharacterProps {
  onClick: () => void;
}

// Friendly Robot Character
const Robot = ({ onClick }: CharacterProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const antennaRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating motion
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
      // Subtle rotation when idle
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      // Breathing/pulsing effect
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.015;
      groupRef.current.scale.setScalar(hovered ? 1.08 * breathe : breathe);
    }
    
    // Head subtle movement
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.2) * 0.03;
    }

    // Waving animation for right arm when hovered
    if (rightArmRef.current) {
      if (hovered) {
        rightArmRef.current.rotation.z = -0.8 + Math.sin(state.clock.elapsedTime * 6) * 0.5;
        rightArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 6) * 0.2;
      } else {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.2, 0.05);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.05);
      }
    }

    // Left arm idle movement
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = 0.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }

    // Antenna wobble
    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.15;
      antennaRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 2.5) * 0.1;
    }
  });

  const bodyColor = "#4ade80";
  const accentColor = "#22c55e";
  const darkAccent = "#166534";
  const screenColor = "#0f172a";
  const glowColor = "#86efac";

  return (
    <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.4}>
      <group
        ref={groupRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Sparkles effect when hovered */}
        {hovered && (
          <Sparkles
            count={40}
            scale={3.5}
            size={4}
            speed={0.6}
            color="#4ade80"
          />
        )}

        {/* === BODY === */}
        {/* Main body - rounded rectangle shape */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.4, 0.5, 16, 32]} />
          <meshStandardMaterial
            color={bodyColor}
            metalness={0.3}
            roughness={0.4}
            emissive={hovered ? glowColor : bodyColor}
            emissiveIntensity={hovered ? 0.2 : 0.05}
          />
        </mesh>

        {/* Chest screen/panel */}
        <mesh position={[0, -0.1, 0.38]} castShadow>
          <boxGeometry args={[0.35, 0.3, 0.08]} />
          <meshStandardMaterial
            color={screenColor}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Screen glow details */}
        <mesh position={[0, -0.05, 0.43]}>
          <boxGeometry args={[0.08, 0.04, 0.01]} />
          <meshStandardMaterial
            color="#4ade80"
            emissive="#4ade80"
            emissiveIntensity={hovered ? 2 : 1}
          />
        </mesh>
        <mesh position={[0, -0.15, 0.43]}>
          <boxGeometry args={[0.2, 0.03, 0.01]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={hovered ? 1.5 : 0.8}
          />
        </mesh>

        {/* === HEAD === */}
        <group ref={headRef} position={[0, 0.55, 0]}>
          {/* Main head */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.45, 0.5]} />
            <meshStandardMaterial
              color={bodyColor}
              metalness={0.3}
              roughness={0.4}
              emissive={hovered ? glowColor : bodyColor}
              emissiveIntensity={hovered ? 0.15 : 0.03}
            />
          </mesh>

          {/* Face screen */}
          <mesh position={[0, 0, 0.26]}>
            <boxGeometry args={[0.5, 0.35, 0.02]} />
            <meshStandardMaterial
              color={screenColor}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* Left Eye */}
          <mesh position={[-0.12, 0.03, 0.28]}>
            <circleGeometry args={[0.08, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={hovered ? 1.5 : 0.8}
            />
          </mesh>
          {/* Left pupil */}
          <mesh position={[-0.12, 0.03, 0.29]}>
            <circleGeometry args={[0.04, 32]} />
            <meshStandardMaterial
              color="#0ea5e9"
              emissive="#0ea5e9"
              emissiveIntensity={hovered ? 2 : 1}
            />
          </mesh>

          {/* Right Eye */}
          <mesh position={[0.12, 0.03, 0.28]}>
            <circleGeometry args={[0.08, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={hovered ? 1.5 : 0.8}
            />
          </mesh>
          {/* Right pupil */}
          <mesh position={[0.12, 0.03, 0.29]}>
            <circleGeometry args={[0.04, 32]} />
            <meshStandardMaterial
              color="#0ea5e9"
              emissive="#0ea5e9"
              emissiveIntensity={hovered ? 2 : 1}
            />
          </mesh>

          {/* Smile */}
          <mesh position={[0, -0.1, 0.28]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#4ade80"
              emissiveIntensity={hovered ? 1.5 : 0.8}
            />
          </mesh>

          {/* Antenna */}
          <group ref={antennaRef} position={[0, 0.3, 0]}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.03, 0.2, 8]} />
              <meshStandardMaterial color={accentColor} metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={hovered ? 2 : 1}
                metalness={0.4}
                roughness={0.3}
              />
            </mesh>
          </group>

          {/* Ear pieces */}
          <mesh position={[-0.32, 0, 0]}>
            <boxGeometry args={[0.08, 0.2, 0.15]} />
            <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0.32, 0, 0]}>
            <boxGeometry args={[0.08, 0.2, 0.15]} />
            <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.4} />
          </mesh>
        </group>

        {/* === ARMS === */}
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.55, -0.1, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.2, 8, 16]} />
            <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.4} />
          </mesh>
          {/* Lower arm */}
          <mesh position={[-0.05, -0.35, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.15, 8, 16]} />
            <meshStandardMaterial color={bodyColor} metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Hand */}
          <mesh position={[-0.05, -0.5, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={darkAccent} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>

        {/* Right Arm - Waving */}
        <group ref={rightArmRef} position={[0.55, -0.1, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.2, 8, 16]} />
            <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.4} />
          </mesh>
          {/* Lower arm */}
          <mesh position={[0.05, -0.35, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.15, 8, 16]} />
            <meshStandardMaterial color={bodyColor} metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Hand */}
          <mesh position={[0.05, -0.5, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={darkAccent} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>

        {/* === LEGS === */}
        {/* Left Leg */}
        <mesh position={[-0.18, -0.75, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.25, 8, 16]} />
          <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.4} />
        </mesh>
        {/* Left Foot */}
        <mesh position={[-0.18, -1.0, 0.05]}>
          <boxGeometry args={[0.15, 0.1, 0.25]} />
          <meshStandardMaterial color={darkAccent} metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Right Leg */}
        <mesh position={[0.18, -0.75, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.25, 8, 16]} />
          <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.4} />
        </mesh>
        {/* Right Foot */}
        <mesh position={[0.18, -1.0, 0.05]}>
          <boxGeometry args={[0.15, 0.1, 0.25]} />
          <meshStandardMaterial color={darkAccent} metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Glow ring when hovered */}
        {hovered && (
          <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1.1, 32]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#22c55e"
              emissiveIntensity={1.5}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
};

interface AICoach3DProps {
  onCoachClick: () => void;
}

export const AICoach3D = ({ onCoachClick }: AICoach3DProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="fixed bottom-4 right-4 w-52 h-60 z-50 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 3, 3]} intensity={0.4} color="#4ade80" />
        <pointLight position={[0, 2, 3]} intensity={0.6} color="#22c55e" />
        <pointLight position={[0, -2, 2]} intensity={0.3} color="#0ea5e9" />
        <Robot onClick={onCoachClick} />
      </Canvas>
      
      {/* Label below */}
      <div 
        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-semibold bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-primary/30 whitespace-nowrap transition-all duration-300 ${
          isHovered ? 'text-primary scale-105 border-primary/60' : 'text-muted-foreground'
        }`}
      >
        {isHovered ? '💬 Chat with AI Coach!' : 'Click to Chat!'}
      </div>
    </div>
  );
};
