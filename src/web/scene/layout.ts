import * as THREE from "three";

/** 相机/开场布局常量与配色（three 相关，仅 scene chunk 内使用）。 */

/** Home and Explore share one look target so Enter is a pure forward dolly. */
export const CAMERA_TARGET = new THREE.Vector3(0, 10, 0);
export const CAMERA_HOME_TARGET = CAMERA_TARGET.clone();
export const CAMERA_INTRO_START = new THREE.Vector3(0, 8.5, 58);
export const CAMERA_INTRO_END = new THREE.Vector3(0, 3.4, 18);
export const INTRO_DURATION_MS = 4200;

export const PALETTE = {
  background: "#050607",
  fog: "#161311",
  skyTop: "#05070b",
  skyHorizon: "#624424",
  terrainLow: "#0b0908",
  terrainHigh: "#2d2117",
  sun: "#ffd8a0",
  mountain: "#0b0b0d",
  artifactSteel: "#b9b9ad",
  accent: "#c9a86c",
} as const;
