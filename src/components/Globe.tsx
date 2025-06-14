import * as THREE from "three";
import { FC, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Sphere, useTexture } from "@react-three/drei";
import { useGlobeStore } from "../store/Globe.store";

const CloudLayer: FC<{ radius: number }> = ({ radius = 1 }) => {
  const cloudRef = useRef<THREE.Mesh>(null);
  const [cloudTexture] = useLoader(THREE.TextureLoader, ["/clouds.jpg"]);

  useFrame(() => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0005; // Slower rotation than the Earth
    }
  });

  return (
    <Sphere ref={cloudRef} args={[radius, 64, 64]}>
      <meshStandardMaterial
        map={cloudTexture}
        transparent={true}
        opacity={0.4}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </Sphere>
  );
};

export const Globe = () => {
  const { radius } = useGlobeStore();

  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const [textureMap, normalMap, roughnessMap] = useTexture([
    "/earth-texture.jpg",
    "/earth-normal.jpg",
    "/earth-specular.jpg",
  ]);

  return (
    <group ref={groupRef} rotation={[0, 0, THREE.MathUtils.degToRad(-23.5)]}>
      <Sphere ref={meshRef} args={[radius, 64, 64]}>
        <meshStandardMaterial
          map={textureMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          roughnessMap={roughnessMap}
          roughness={0.7}
          metalness={0.1}
        />
      </Sphere>
      <CloudLayer radius={radius + 0.05} />
    </group>
  );
};
