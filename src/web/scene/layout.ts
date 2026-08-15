import * as THREE from "three";

/** 相机/开场布局常量与配色（three 相关，仅 scene chunk 内使用）。 */

export const CAMERA_TARGET = new THREE.Vector3(0, 2.5, 0);
export const CAMERA_INTRO_START = new THREE.Vector3(0, 20, 64);
export const CAMERA_INTRO_END = new THREE.Vector3(0, 5.5, 24);
export const INTRO_DURATION_MS = 4200;

export const PALETTE = {
  fog: "#2f2718",
  skyTop: "#0d1017",
  skyHorizon: "#54401f",
  terrainLow: "#241f18",
  terrainHigh: "#3a3126",
  sun: "#ffd8a0",
  mountain: "#191512",
  artifactSteel: "#cfd2d6",
  accent: "#c8a25a",
} as const;
