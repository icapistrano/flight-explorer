import * as THREE from "three";

// Convert latitude and longitude to 3D coordinates
export const latLongToVector3 = (
  lat: number,
  long: number,
  radius: number = 1,
) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (long + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};
