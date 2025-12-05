import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface CharacterProps {
  onClick: () => void;
}

// Particle system component
const Particles = ({ count = 50, hovered }: { count?: number; hovered: boolean }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 0.8;
      temp.push({
        angle,
        radius,
        speed: 0.5 + Math.random() * 1.5,
        offset: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * 2,
        scale: 0.03 + Math.random() * 0.05,
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current || !hovered) return;
    
    particles.forEach((particle, i) => {
      const t = state.clock.elapsedTime * particle.speed + particle.offset;
      const x = Math.cos(particle.angle + t) * particle.radius;
      const z = Math.sin(particle.angle + t) * particle.radius;
      const y = particle.y + Math.sin(t * 2) * 0.3;
      
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(particle.scale * (1 + Math.sin(t * 3) * 0.3));
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  if (!hovered) return null;

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#60a5fa"
        emissive="#3b82f6"
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
};

// Doraemon character
const Doraemon = ({ onClick }: CharacterProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle bobbing motion
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      // Subtle breathing effect
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.setScalar(hovered ? 1.05 * breathe : breathe);
    }
    
    // Waving animation for right arm when hovered
    if (rightArmRef.current && hovered) {
      rightArmRef.current.rotation.z = -0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.4;
    } else if (rightArmRef.current) {
      rightArmRef.current.rotation.z = -0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group
        ref={groupRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Particle effects */}
        <Particles hovered={hovered} count={40} />
        
        {/* Sparkles effect when hovered */}
        {hovered && (
          <Sparkles
            count={30}
            scale={3}
            size={3}
            speed={0.4}
            color="#fbbf24"
          />
        )}

        {/* Body - Blue round body */}
        <mesh position={[0, -0.3, 0]} castShadow>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial
            color="#0ea5e9"
            metalness={0.1}
            roughness={0.4}
          />
        </mesh>

        {/* White belly */}
        <mesh position={[0, -0.35, 0.35]} castShadow>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0}
            roughness={0.5}
          />
        </mesh>

        {/* Pocket */}
        <mesh position={[0, -0.5, 0.45]} castShadow>
          <cylinderGeometry args={[0.18, 0.2, 0.08, 32, 1, true]} />
          <meshStandardMaterial
            color="#ffffff"
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.54, 0.45]}>
          <circleGeometry args={[0.18, 32]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>

        {/* Head - Blue round head */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#0ea5e9"
            metalness={0.1}
            roughness={0.4}
          />
        </mesh>

        {/* White face */}
        <mesh position={[0, 0.35, 0.3]} castShadow>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0}
            roughness={0.5}
          />
        </mesh>

        {/* Left Eye white */}
        <mesh position={[-0.12, 0.5, 0.4]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Left Eye pupil */}
        <mesh position={[-0.1, 0.5, 0.5]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Left Eye shine */}
        <mesh position={[-0.08, 0.52, 0.54]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>

        {/* Right Eye white */}
        <mesh position={[0.12, 0.5, 0.4]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Right Eye pupil */}
        <mesh position={[0.1, 0.5, 0.5]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Right Eye shine */}
        <mesh position={[0.12, 0.52, 0.54]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>

        {/* Nose - Red */}
        <mesh position={[0, 0.38, 0.55]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={hovered ? 0.5 : 0.2}
            metalness={0.3}
            roughness={0.3}
          />
        </mesh>

        {/* Nose line down to mouth */}
        <mesh position={[0, 0.28, 0.52]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Smile */}
        <mesh position={[0, 0.22, 0.48]} rotation={[0.1, 0, 0]}>
          <torusGeometry args={[0.12, 0.012, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Whiskers - Left */}
        <mesh position={[-0.35, 0.4, 0.35]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.006, 0.006, 0.25, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.35, 0.32, 0.35]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.25, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.35, 0.24, 0.35]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.006, 0.006, 0.25, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Whiskers - Right */}
        <mesh position={[0.35, 0.4, 0.35]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.006, 0.006, 0.25, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.35, 0.32, 0.35]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.25, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.35, 0.24, 0.35]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.006, 0.006, 0.25, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Collar - Red */}
        <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.05, 16, 32]} />
          <meshStandardMaterial
            color="#ef4444"
            metalness={0.2}
            roughness={0.4}
          />
        </mesh>

        {/* Bell on collar */}
        <mesh position={[0, -0.05, 0.38]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={hovered ? 0.6 : 0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Bell line */}
        <mesh position={[0, -0.05, 0.46]}>
          <boxGeometry args={[0.1, 0.015, 0.01]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>

        {/* Left Arm */}
        <group position={[-0.55, -0.2, 0]} rotation={[0, 0, 0.4]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.1, 0.2, 8, 16]} />
            <meshStandardMaterial color="#0ea5e9" metalness={0.1} roughness={0.4} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.22, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Right Arm - Waving */}
        <group ref={rightArmRef} position={[0.55, -0.2, 0]} rotation={[0, 0, -0.3]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.1, 0.2, 8, 16]} />
            <meshStandardMaterial color="#0ea5e9" metalness={0.1} roughness={0.4} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.22, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Left Leg */}
        <mesh position={[-0.2, -0.85, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.1, 8, 16]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.1} roughness={0.4} />
        </mesh>
        {/* Left Foot */}
        <mesh position={[-0.2, -1.0, 0.05]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Right Leg */}
        <mesh position={[0.2, -0.85, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.1, 8, 16]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.1} roughness={0.4} />
        </mesh>
        {/* Right Foot */}
        <mesh position={[0.2, -1.0, 0.05]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Glow ring when hovered */}
        {hovered && (
          <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1.0, 32]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#3b82f6"
              emissiveIntensity={1}
              transparent
              opacity={0.4}
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
  return (
    <div className="fixed bottom-4 right-4 w-48 h-56 z-50 cursor-pointer">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 3, 3]} intensity={0.5} color="#60a5fa" />
        <pointLight position={[0, 2, 3]} intensity={0.8} color="#fbbf24" />
        <pointLight position={[0, -2, 2]} intensity={0.3} color="#0ea5e9" />
        <Doraemon onClick={onCoachClick} />
      </Canvas>
      
      {/* Label below */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-primary bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50 whitespace-nowrap">
        Click to Chat!
      </div>
    </div>
  );
};
