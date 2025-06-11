import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { PaperPlane } from "./PaperPlane";
import * as THREE from "three";
import { Line } from "@react-three/drei";

interface PaperPlaneControllerProps {
  radius?: number; // Radius of the circular path
  speed?: number; // Movement speed
  rotationSpeed?: number; // Rotation speed
  maxSpeed?: number; // Maximum speed
  acceleration?: number; // Acceleration rate
  deceleration?: number; // Deceleration rate
}

export function PaperPlaneController({
  radius = 2.2,
  rotationSpeed = 0.7,
  maxSpeed = 3,
  acceleration = 0.02,
  deceleration = 0.01,
}: PaperPlaneControllerProps) {
  // === Refs & State ===
  const forwardDir = useRef(new THREE.Vector3(0, 1, 0));
  const rotationQuat = useRef(new THREE.Quaternion());
  const currentVelocity = useRef(0);

  const orbitPivotRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Group>(null);
  const orbitalPlaneAxisRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const keysRef = useRef({
    w: false,
    s: false,
    a: false,
    d: false,
  });

  // === Input Handling ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keysRef.current) {
        keysRef.current[e.key.toLowerCase() as keyof typeof keysRef.current] =
          true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keysRef.current) {
        keysRef.current[e.key.toLowerCase() as keyof typeof keysRef.current] =
          false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // === Animation Frame ===
  useFrame((_, delta) => {
    if (!orbitPivotRef.current || !planeRef.current) return;

    const { w, s, a, d } = keysRef.current;

    // Rotation controls (A/D) along the plane's local up axis
    if (a || d) {
      const pitchDirection = a ? rotationSpeed : -rotationSpeed;
      planeRef.current.rotateX(pitchDirection * delta);

      const forwardVector = forwardDir.current
        .set(0, 1, 0)
        .applyQuaternion(planeRef.current.quaternion);

      orbitalPlaneAxisRef.current
        .crossVectors(planeRef.current.position, forwardVector)
        .normalize();
    }

    // Thrust controls (W/S) with acceleration
    if (w) {
      // Accelerate
      currentVelocity.current = Math.min(
        currentVelocity.current + acceleration,
        maxSpeed,
      );
    } else if (s) {
      // Decelerate
      currentVelocity.current = Math.max(
        currentVelocity.current - acceleration,
        -maxSpeed / 2,
      );
    } else {
      // Natural deceleration when no keys are pressed
      if (currentVelocity.current > 0) {
        currentVelocity.current = Math.max(
          currentVelocity.current - deceleration,
          0,
        );
      } else if (currentVelocity.current < 0) {
        currentVelocity.current = Math.min(
          currentVelocity.current + deceleration,
          0,
        );
      }
    }

    // Apply movement based on current velocity
    if (currentVelocity.current !== 0) {
      const worldAxis = orbitalPlaneAxisRef.current
        .clone()
        .applyQuaternion(orbitPivotRef.current.quaternion);

      rotationQuat.current.identity();
      const rotation = rotationQuat.current.setFromAxisAngle(
        worldAxis,
        currentVelocity.current * delta,
      );
      orbitPivotRef.current.quaternion.premultiply(rotation);
    }
  });

  return (
    <group ref={orbitPivotRef}>
      <group
        ref={planeRef}
        position={[radius * 0.5, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <PaperPlane scale={0.5} rotation={[0, Math.PI / 2, 0]} />
      </group>
    </group>
  );
}
