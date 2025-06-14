import * as THREE from "three";
import { FC, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { usePlaneStore } from "../store/Plane.store";
import { PerspectiveCamera } from "@react-three/drei";

export const CameraFollower: FC<{
  distanceBehind?: number;
  heightAbove?: number;
  lookAheadDistance?: number;
  lookAtLerpSpeed?: number;
  positionLerpSpeed?: number;
}> = ({
  distanceBehind = -6,
  heightAbove = 5,
  lookAheadDistance = 5,
  lookAtLerpSpeed = 10,
  positionLerpSpeed = 10,
}) => {
  const { position, rotation } = usePlaneStore();

  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const currentPosition = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const upVector = useRef(new THREE.Vector3(0, 1, 0));

  const tmpV = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    if (!cameraRef.current) return;

    // 1. Compute the "up" direction from the center of the globe
    const up = upVector.current.copy(position).normalize();

    // 2. Get the plane's forward direction
    const localForward = tmpV.current.set(0, 0, 1);
    const worldForward = localForward.applyQuaternion(rotation);

    // 3. Project onto the tangent plane to the globe (tangent to sphere)
    const tangentForward = worldForward.clone().projectOnPlane(up).normalize();

    // 4. Get right direction
    const right = tmpV.current
      .set(0, 0, 0)
      .crossVectors(tangentForward, up)
      .normalize();

    // 5. Compute the ideal offset w.r.t. the plane and smoothly lerp to it
    const idealOffset = position
      .clone()
      .add(right.clone().multiplyScalar(distanceBehind))
      .add(up.clone().multiplyScalar(heightAbove));

    currentPosition.current.lerp(idealOffset, positionLerpSpeed * delta);

    const lookAheadPoint = position
      .clone()
      .add(right.clone().multiplyScalar(lookAheadDistance));

    // 6. Compute the ideal look-at point w.r.t. the plane and smoothly lerp to it
    currentLookAt.current.lerp(lookAheadPoint, lookAtLerpSpeed * delta);

    // 7. Apply to camera
    cameraRef.current.position.copy(currentPosition.current);
    cameraRef.current.up.copy(up); // Make sure camera "roll" matches globe curvature
    cameraRef.current.lookAt(currentLookAt.current);
  });

  return <PerspectiveCamera makeDefault ref={cameraRef} />;
};
