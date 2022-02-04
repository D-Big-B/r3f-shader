import React, { useRef, Suspense } from "react";
import * as THREE from "three";
import { Canvas, extend, useFrame, useLoader } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";

import "./App.css";

const WaveShaderMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
    uTexture: new THREE.Texture(),
  },
  // Vertex Shader
  glsl`
    precision mediump float;

    uniform float uTime;

    varying vec2 vUv;
    varying float vWave;

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);

    void main(){
      vUv = uv;

      vec3 pos = position;
      float noiseFreq = 1.5;
      float noiseAmp =  0.25;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;

      vWave = pos.z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  // Fragment Shader
  glsl`
    precision mediump float;

    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;

    varying vec2 vUv;
    varying float vWave;

    void main(){
      float wave = vWave * 0.4;
      vec3 texture = texture2D(uTexture, vUv +wave).rgb;
      gl_FragColor = vec4(texture,1.0);
    }
  `
);

extend({ WaveShaderMaterial });

const Wave = () => {
  const ref = useRef();
  useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

  const [image] = useLoader(THREE.TextureLoader, [
    "https://static.langimg.com/thumb/msid-88634667,imgsize-40988,width-700,height-525,resizemode-75/navbharat-times.jpg",
  ]);
  return (
    <mesh>
      <planeBufferGeometry args={[0.4, 0.6, 16, 16]} />
      <waveShaderMaterial ref={ref} uColor={"hotpink"} uTexture={image} />
    </mesh>
  );
};
const Scene = () => {
  return (
    <Canvas camera={{ fov: 10 }}>
      <Suspense fallback={null}>
        <Wave />
      </Suspense>
    </Canvas>
  );
};

export default function App() {
  return (
    <>
      <h1>PUSHPA</h1>
      <Scene />
    </>
  );
}
