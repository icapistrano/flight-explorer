import * as THREE from "three";
import { FC, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PaperPlane } from "./PaperPlane";
import { usePlaneStore } from "../store/Plane.store";
import { useGlobeStore } from "../store/Globe.store";
import { useKeysStore } from "../store/Keys.store";

interface PaperPlaneControllerProps {
  maxSpeed?: number; // Maximum speed
  minSpeed?: number; // Minimum speed
  acceleration?: number; // Acceleration rate
  deceleration?: number; // Deceleration rate
  moveSpeed?: number; // Move speed
  maxBankAngle?: number; // Maximum bank angle
  bankSpeed?: number; // Bank speed
  maxOffsetFromCenter?: number; // Maximum offset from center
  yawMaxAngle?: number; // Maximum yaw angle
}

export const PaperPlaneController: FC<PaperPlaneControllerProps> = ({
  maxSpeed = 1.5,
  minSpeed = 0.1,
  acceleration = 0.005,
  deceleration = 0.005,
  maxBankAngle = THREE.MathUtils.degToRad(45),
  bankSpeed = 1,
  maxOffsetFromCenter = 5,
  yawMaxAngle = 5,
}: PaperPlaneControllerProps) => {
  const { setPosition, setRotation } = usePlaneStore();
  const { radius } = useGlobeStore();
  const { keys } = useKeysStore();

  // === Refs & State ===
  const tmpV = useRef(new THREE.Vector3(0, 0, 0));
  const tmpQ = useRef(new THREE.Quaternion());

  const forwardDir = useRef(new THREE.Vector3(0, 1, 0));
  const rotationQuat = useRef(new THREE.Quaternion());
  const currentVelocity = useRef(0);

  const orbitPivotRef = useRef<THREE.Group>(null);
  const orbitalPlaneAxisRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));

  const planeRef = useRef<THREE.Group>(null);
  const planeCoordSysRef = useRef<THREE.Group>(null);

  const bankAngle = useRef(0);
  const targetBankAngle = useRef(0);
  const currentYawRotation = useRef(0);

  const updateBankingAndLateralMovement = (
    a: boolean,
    d: boolean,
    delta: number,
  ) => {
    if (!planeRef.current) return;

    if (a || d) {
      // Set target bank angle based on input
      targetBankAngle.current = a ? -maxBankAngle : maxBankAngle;
    } else {
      // Gradually return to level flight when no input
      targetBankAngle.current = 0;
    }

    // Gradually adjust current bank angle towards target
    bankAngle.current +=
      (targetBankAngle.current - bankAngle.current) * bankSpeed * delta;

    planeRef.current.rotation.y = bankAngle.current;

    // Gradually move laterally or return to center position based on bank angle
    const normalizedBank = bankAngle.current / maxBankAngle; // -1 to 1
    planeRef.current.position.z = normalizedBank * maxOffsetFromCenter;
  };

  const updatePlaneHeading = (a: boolean, d: boolean, delta: number) => {
    if (!planeCoordSysRef.current) return;

    const normalizedBank = bankAngle.current / maxBankAngle; // -1 to 1

    // Invert yaw rotation when A or D is pressed:
    // e.g. The plane is on the right side of the screen but its heading would be pointing to the left
    const yawDirection = a || d ? normalizedBank * -1 : normalizedBank;
    const yawRotationTarget = yawDirection * yawMaxAngle;

    const yawRotationSpeed = a || d ? 3 : 0.5;
    currentYawRotation.current = THREE.MathUtils.lerp(
      currentYawRotation.current,
      yawRotationTarget,
      yawRotationSpeed * delta,
    );

    planeCoordSysRef.current.rotateX(currentYawRotation.current * delta);

    const forwardVector = forwardDir.current
      .set(0, 1, 0)
      .applyQuaternion(planeCoordSysRef.current.quaternion);

    orbitalPlaneAxisRef.current
      .crossVectors(planeCoordSysRef.current.position, forwardVector)
      .normalize();
  };

  const updateThrustAndMovement = (w: boolean, s: boolean, delta: number) => {
    if (!orbitPivotRef.current) return;

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
        minSpeed,
      );
    } else {
      // Natural deceleration when no keys are pressed
      currentVelocity.current = Math.max(
        currentVelocity.current - deceleration,
        minSpeed,
      );
    }

    // Apply movement based on current velocity
    const worldAxis = orbitalPlaneAxisRef.current
      .clone()
      .applyQuaternion(orbitPivotRef.current.quaternion);

    rotationQuat.current.identity();
    const rotation = rotationQuat.current.setFromAxisAngle(
      worldAxis,
      currentVelocity.current * delta,
    );
    orbitPivotRef.current.quaternion.premultiply(rotation);
  };

  // === Animation Frame ===
  useFrame((_, delta) => {
    if (!planeCoordSysRef.current) return;

    const { w, s, a, d } = keys;

    // Banking, offset from its parent's z-axis (A/D)
    updateBankingAndLateralMovement(a, d, delta);

    // Rotation controls along the plane's local up axis (A/D)
    updatePlaneHeading(a, d, delta);

    // Thrust and orbital movement (W/S)
    updateThrustAndMovement(w, s, delta);

    // Update store
    const worldV = planeCoordSysRef.current.getWorldPosition(tmpV.current);
    const worldRotation = planeCoordSysRef.current.getWorldQuaternion(
      tmpQ.current,
    );

    setPosition(worldV);
    setRotation(worldRotation);
  });

  return (
    <group ref={orbitPivotRef}>
      <group ref={planeCoordSysRef} position={[radius * 1.01, 0, 0]}>
        <axesHelper scale={1} />
        <group ref={planeRef}>
          <axesHelper scale={1} />
          <PaperPlane scale={3} rotation={[0, Math.PI / 2, 0]} />
        </group>
      </group>
    </group>
  );
};
