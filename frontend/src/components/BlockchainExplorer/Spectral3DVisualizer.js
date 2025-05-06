import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Spectral3DVisualizer = ({ spectralData }) => {
  const mountRef = useRef(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  useEffect(() => {
    if (!spectralData) return;

    // Scene setup
    camera.position.z = 50;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Spectral line generation
    const points = spectralData.map((y, x) => 
      new THREE.Vector3(x * 0.1, y * 10, Math.sin(x * 0.2) * 5)
    );
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x4f46e5 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      line.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    
    const controls = new OrbitControls(camera, renderer.domElement);
    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
    };
  }, [spectralData]);

  return <div ref={mountRef} style={{ height: '600px', width: '100%' }} />;
};

export default Spectral3DVisualizer;