import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';

function ParticleAnimation() {
  const particlesRef = useRef();
  const [targetPositions, setTargetPositions] = useState([]);
  const [currentShape, setCurrentShape] = useState('sphere');
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const particles = new THREE.Group();
    particlesRef.current = particles;
    scene.add(particles);

    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load('texture.png'); // Update this path to your texture PNG

    const numParticles = 1000;
    const sphereRadius = 5;
    const initialPositions = [];

    // Create particles as 2D sprites facing the camera
    for (let i = 0; i < numParticles; i++) {
      const spriteMaterial = new THREE.SpriteMaterial({ map: particleTexture });
      const sprite = new THREE.Sprite(spriteMaterial);

      // Set a smaller scale for each sprite
      sprite.scale.set(0.2, 0.2, 0.2);

      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
      const y = sphereRadius * Math.sin(phi) * Math.sin(theta);
      const z = sphereRadius * Math.cos(phi);

      sprite.position.set(x, y, z);
      particles.add(sprite);

      // Store initial positions and distances
      initialPositions.push({ x, y, z, distanceFromCenter: Math.sqrt(x ** 2 + y ** 2 + z ** 2) });
    }

    setTargetPositions(initialPositions);
    camera.position.z = 20;

    // Track time for heartbeat effect
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      // Calculate time-based scale factor for heartbeat effect
      const time = clock.getElapsedTime();
      const waveSpeed = 1; // Speed of wave propagation
      const amplitude = 0.25; // Amplitude of the heartbeat

      particles.children.forEach((particle, i) => {
        const particleData = initialPositions[i];
        
        // Calculate a wave phase for each particle
        const wavePhase = (time - particleData.distanceFromCenter / waveSpeed) * 3; // Adjust frequency here
        const scaleFactor = 1 + amplitude * Math.sin(wavePhase); // Scale factor based on sine wave

        // Apply heartbeat scale with wave effect
        particle.scale.set(0.2 * scaleFactor, 0.2 * scaleFactor, 0.2 * scaleFactor);

        // Move particles smoothly to target positions
        if (targetPositions[i]) {
          particle.position.x += (targetPositions[i].x - particle.position.x) * 0.15;
          particle.position.y += (targetPositions[i].y - particle.position.y) * 0.15;
          particle.position.z += (targetPositions[i].z - particle.position.z) * 0.15;
        }
      });

      // Apply rotation if not dragging
      if (!isDragging.current) {
        particles.rotation.x += 0.004;
        particles.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    }
    animate();

    // Event handling and shape switching
    function getShapePositions(shape) {
      const positions = [];
      const side = Math.cbrt(numParticles);

      if (shape === 'sphere') {
        for (let i = 0; i < numParticles; i++) {
          const theta = Math.random() * 2 * Math.PI;
          const phi = Math.acos(2 * Math.random() - 1);
          const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
          const y = sphereRadius * Math.sin(phi) * Math.sin(theta);
          const z = sphereRadius * Math.cos(phi);
          positions.push({ x, y, z });
        }
      } else if (shape === 'cube') {
        for (let x = -side / 2; x < side / 2; x++) {
          for (let y = -side / 2; y < side / 2; y++) {
            for (let z = -side / 2; z < side / 2; z++) {
              if (positions.length < numParticles) {
                positions.push({ x: x * 0.5, y: y * 0.5, z: z * 0.5 });
              }
            }
          }
        }
      } else if (shape === 'pyramid') {
        for (let i = 0; i < numParticles; i++) {
          const level = Math.floor(i / (side * side));
          const x = (i % side - side / 2) * (1 - level / side);
          const y = -level * 0.5;
          const z = (Math.floor(i / side) % side - side / 2) * (1 - level / side);
          positions.push({ x, y, z });
        }
      }
      return positions;
    }

    function onDoubleClick() {
      const shapes = ['sphere', 'cube', 'pyramid'];
      const nextShape = shapes[(shapes.indexOf(currentShape) + 1) % shapes.length];
      setCurrentShape(nextShape);
      const newTargetPositions = getShapePositions(nextShape);
      setTargetPositions(newTargetPositions);
    }

    function onWheel(event) {
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(5, Math.min(camera.position.z, 50));
    }

    function onMouseDown(event) {
      isDragging.current = true;
      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    }

    function onMouseMove(event) {
      if (isDragging.current) {
        const deltaX = event.clientX - previousMousePosition.current.x;
        const deltaY = event.clientY - previousMousePosition.current.y;
        particles.rotation.y += deltaX * 0.005;
        particles.rotation.x += deltaY * 0.005;
        previousMousePosition.current = { x: event.clientX, y: event.clientY };
      }
    }

    function onMouseUp() {
      isDragging.current = false;
    }

    window.addEventListener('dblclick', onDoubleClick);
    window.addEventListener('wheel', onWheel);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('dblclick', onDoubleClick);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.removeChild(renderer.domElement);
    };
  }, [currentShape]);

  return null;
}

export default ParticleAnimation;
