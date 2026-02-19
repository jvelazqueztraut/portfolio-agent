import { useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { useControls, button, folder } from 'leva';
import { debugLog } from '@/utils/log';
import { lerp } from 'three/src/math/MathUtils.js';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const PLANETS_MIN_ORBIT_RADIUS = 2;
const PLANETS_SPREAD_ORBIT_RADIUS = 18;
const PLANETS_MIN_ORBIT_SPEED = 0.02;
const PLANETS_SPREAD_ORBIT_SPEED = 0.1;

const PLANETS_SIZE_LERP_FACTOR = 0.01;
const PLANETS_ORIGIN = [0, 1.95, 0];
const PLANETS_VELOCITY_TARGET = 1;
const PLANETS_VELOCITY_LERP_FACTOR = 0.01;
const PLANETS_ACCELERATION_TARGET = 20;
const PLANETS_ACCELERATION_LERP_FACTOR = 0.02;

const PARTICLES_SIZE_LERP_FACTOR = 0.01;
const PARTICLES_SIZE_TARGET_MIN = 50;
const PARTICLES_SIZE_TARGET_MAX = 100;
const PARTICLES_AVAILABLE_COLORS = ['white', 'green', 'orange', 'purple'];
const PARTICLES_COLOR_LERP_FACTOR = 0.05;

const PLANET_SHAKE_INTENSITY = 0.1;
const PLANET_SHAKE_DURATION = 0.6;
const PLANET_SHAKE_SMOOTHNESS = 0.6; // Lerp factor for smoother shake transitions
const PLANET_SHAKE_TARGET_UPDATE_INTERVAL = 0.1; // How often to update shake target (in seconds)

export type PlanetsSceneRef = {
  enablePlanets: () => void;
  disablePlanets: () => void;
  movePlanetsAround: () => void;
  enableParticleEffect: () => void;
  disableParticleEffect: () => void;
  changeParticlesColor: () => void;
};

export const PlanetsScene = forwardRef<PlanetsSceneRef>(
  (props, ref: React.Ref<PlanetsSceneRef>) => {
    // Create 9 planets in a solar system pattern with orbital inclination
    const planets = [
      {
        size: 0.5,
        orbitRadius: PLANETS_MIN_ORBIT_RADIUS,
        orbitSpeed: PLANETS_MIN_ORBIT_SPEED + PLANETS_SPREAD_ORBIT_SPEED,
        angle: 0,
        inclination: 0.1,
      }, // Mercury
      {
        size: 0.7,
        orbitRadius:
          PLANETS_MIN_ORBIT_RADIUS + 0.05 * PLANETS_SPREAD_ORBIT_RADIUS,
        orbitSpeed: PLANETS_MIN_ORBIT_SPEED + 0.5 * PLANETS_SPREAD_ORBIT_SPEED,
        angle: 40,
        inclination: -0.15,
      }, // Venus
      {
        size: 0.8,
        orbitRadius:
          PLANETS_MIN_ORBIT_RADIUS + 0.1 * PLANETS_SPREAD_ORBIT_RADIUS,
        orbitSpeed: -(
          PLANETS_MIN_ORBIT_SPEED +
          0.25 * PLANETS_SPREAD_ORBIT_SPEED
        ),
        angle: 80,
        inclination: 0.05,
      }, // Earth
      {
        size: 0.6,
        orbitRadius:
          PLANETS_MIN_ORBIT_RADIUS + 0.15 * PLANETS_SPREAD_ORBIT_RADIUS,
        orbitSpeed: PLANETS_MIN_ORBIT_SPEED + 0.35 * PLANETS_SPREAD_ORBIT_SPEED,
        angle: 120,
        inclination: -0.1,
      }, // Mars
      {
        size: 1.5,
        orbitRadius:
          PLANETS_MIN_ORBIT_RADIUS + 0.2 * PLANETS_SPREAD_ORBIT_RADIUS,
        orbitSpeed: PLANETS_MIN_ORBIT_SPEED,
        angle: 160,
        inclination: 0.2,
      }, // Jupiter
      {
        size: 1.3,
        orbitRadius:
          PLANETS_MIN_ORBIT_RADIUS + 0.3 * PLANETS_SPREAD_ORBIT_RADIUS,
        orbitSpeed: -(
          PLANETS_MIN_ORBIT_SPEED +
          0.05 * PLANETS_SPREAD_ORBIT_SPEED
        ),
        angle: 200,
        inclination: -0.25,
      }, // Saturn
      {
        size: 1.1,
        orbitRadius:
          PLANETS_MIN_ORBIT_RADIUS + 0.5 * PLANETS_SPREAD_ORBIT_RADIUS,
        orbitSpeed: PLANETS_MIN_ORBIT_SPEED + 0.15 * PLANETS_SPREAD_ORBIT_SPEED,
        angle: 240,
        inclination: 0.18,
      }, // Uranus
      {
        size: 1.0,
        orbitRadius:
          PLANETS_MIN_ORBIT_RADIUS + 0.75 * PLANETS_SPREAD_ORBIT_RADIUS,
        orbitSpeed: PLANETS_MIN_ORBIT_SPEED + 0.05 * PLANETS_SPREAD_ORBIT_SPEED,
        angle: 280,
        inclination: -0.22,
      }, // Neptune
      {
        size: 0.4,
        orbitRadius: PLANETS_MIN_ORBIT_RADIUS + PLANETS_SPREAD_ORBIT_RADIUS,
        orbitSpeed: -(
          PLANETS_MIN_ORBIT_SPEED +
          0.35 * PLANETS_SPREAD_ORBIT_SPEED
        ),
        angle: 320,
        inclination: 0.3,
      }, // Pluto
    ];

    const [planetsSize, setPlanetsSize] = useState(0);
    const planetsSizeTargetRef = useRef(0);
    const planetsVelocityRef = useRef(0);
    const planetsVelocityTargetRef = useRef(0);
    const planetsAccelerationRef = useRef(0);
    const planetsAccelerationEffectRef = useRef(false);

    const [planetPositions, setPlanetPositions] = useState(
      planets.map(() => ({ x: 0, y: 0, z: 0 }))
    );
    const planetAnglesRef = useRef(planets.map(planet => planet.angle));

    const [planetShakeOffsets, setPlanetShakeOffsets] = useState(
      planets.map(() => ({ x: 0, y: 0, z: 0 }))
    );
    // Shake state for each planet (ref since it doesn't affect rendering directly)
    const planetShakesRef = useRef(
      planets.map(() => ({
        shakeIntensity: 0,
        shakeTime: 0,
        shakeTargetOffset: { x: 0, y: 0, z: 0 },
        shakeTargetUpdateTime: 0,
      }))
    );

    const [particlesSize, setParticlesSize] = useState(0);
    const particlesSizeTargetRef = useRef(0);
    const [particlesColor, setParticlesColor] = useState(
      new THREE.Color('white')
    );
    const particlesColorTargetRef = useRef(new THREE.Color('white'));

    const enablePlanets = () => {
      debugLog('PlanetsScene: Enable Planets');
      planetsSizeTargetRef.current = 1;
    };

    const disablePlanets = () => {
      debugLog('PlanetsScene: Disable Planets');
      planetsSizeTargetRef.current = 0;
      planetsVelocityTargetRef.current = 0;
      planetsAccelerationEffectRef.current = false;
    };

    const movePlanetsAround = () => {
      debugLog('PlanetsScene: Move Planets Around');
      planetsSizeTargetRef.current = 1;
      planetsVelocityTargetRef.current = PLANETS_VELOCITY_TARGET;
      planetsAccelerationEffectRef.current = true;
    };

    const enableParticleEffect = () => {
      debugLog('PlanetsScene: Enable Particle Effect');
      particlesSizeTargetRef.current = PARTICLES_SIZE_TARGET_MIN;
    };

    const disableParticleEffect = () => {
      debugLog('PlanetsScene: Disable Particle Effect');
      particlesSizeTargetRef.current = 0;
    };

    const changeParticlesColor = () => {
      debugLog('PlanetsScene: Change Particles Color');
      particlesSizeTargetRef.current = PARTICLES_SIZE_TARGET_MAX;
      // Create a new array excluding the current color
      const filteredColors = PARTICLES_AVAILABLE_COLORS.filter(
        color =>
          new THREE.Color(color).getStyle() !==
          particlesColorTargetRef.current.getStyle()
      );
      // Fallback: if all colors are the same, use the first
      const newColor =
        filteredColors.length > 0
          ? // eslint-disable-next-line react-hooks/purity
            filteredColors[Math.floor(Math.random() * filteredColors.length)]
          : PARTICLES_AVAILABLE_COLORS[0];
      particlesColorTargetRef.current = new THREE.Color(newColor);
    };

    const shakePlanet = (index: number) => {
      planetShakesRef.current[index] = {
        shakeIntensity: PLANET_SHAKE_INTENSITY,
        shakeTime: PLANET_SHAKE_DURATION,
        shakeTargetOffset: {
          x: (Math.random() - 0.5) * PLANET_SHAKE_INTENSITY, // eslint-disable-line react-hooks/purity
          y: (Math.random() - 0.5) * PLANET_SHAKE_INTENSITY, // eslint-disable-line react-hooks/purity
          z: (Math.random() - 0.5) * PLANET_SHAKE_INTENSITY, // eslint-disable-line react-hooks/purity
        },
        shakeTargetUpdateTime: 0,
      };
    };

    useFrame((state, delta) => {
      setPlanetsSize(prev =>
        lerp(prev, planetsSizeTargetRef.current, PLANETS_SIZE_LERP_FACTOR)
      );
      setParticlesSize(prev =>
        lerp(prev, particlesSizeTargetRef.current, PARTICLES_SIZE_LERP_FACTOR)
      );

      planetsVelocityRef.current = lerp(
        planetsVelocityRef.current,
        planetsVelocityTargetRef.current,
        PLANETS_VELOCITY_LERP_FACTOR
      );
      if (planetsAccelerationEffectRef.current) {
        planetsAccelerationRef.current = lerp(
          planetsAccelerationRef.current,
          PLANETS_ACCELERATION_TARGET,
          PLANETS_ACCELERATION_LERP_FACTOR
        );
        if (planetsAccelerationRef.current >= PLANETS_ACCELERATION_TARGET) {
          planetsAccelerationEffectRef.current = false;
        }
      } else if (planetsAccelerationRef.current > 0) {
        planetsAccelerationRef.current = lerp(
          planetsAccelerationRef.current,
          0,
          PLANETS_ACCELERATION_LERP_FACTOR
        );
      }

      planetAnglesRef.current = planetAnglesRef.current.map(
        (currentAngle, index) => {
          return (
            currentAngle +
            delta * planets[index].orbitSpeed * planetsVelocityRef.current +
            delta * delta * planetsAccelerationRef.current
          );
        }
      );
      setPlanetPositions(
        planets.map((planet, index) => {
          const angle = planetAnglesRef.current[index];
          const x = Math.cos(angle) * planet.orbitRadius;
          const z = Math.sin(angle) * planet.orbitRadius;
          const y = planet.inclination * planet.orbitRadius;
          return { x, y, z };
        })
      );

      setParticlesColor(
        prev =>
          new THREE.Color(
            prev.lerp(
              particlesColorTargetRef.current,
              PARTICLES_COLOR_LERP_FACTOR
            )
          )
      );

      // Decay shake intensity over time
      const updatedShakes = planetShakesRef.current.map(shake => {
        let newIntensity = shake.shakeIntensity;
        let newTime = shake.shakeTime;
        let newTargetOffset = shake.shakeTargetOffset;
        let newTargetUpdateTime = shake.shakeTargetUpdateTime;

        if (shake.shakeTime > 0) {
          newTime = Math.max(0, shake.shakeTime - delta);
          newIntensity = shake.shakeIntensity * (newTime / shake.shakeTime);
        }

        // Increment target update time
        if (newIntensity > 0) {
          newTargetUpdateTime += delta;
          if (newTargetUpdateTime >= PLANET_SHAKE_TARGET_UPDATE_INTERVAL) {
            newTargetUpdateTime = 0;
            newTargetOffset = {
              x: (Math.random() - 0.5) * newIntensity,
              y: (Math.random() - 0.5) * newIntensity,
              z: (Math.random() - 0.5) * newIntensity,
            };
          }
        } else if (newIntensity <= 0) {
          newTargetOffset = { x: 0, y: 0, z: 0 };
          newTargetUpdateTime = 0;
        }

        return {
          shakeIntensity: newIntensity,
          shakeTime: newTime,
          shakeTargetOffset: newTargetOffset,
          shakeTargetUpdateTime: newTargetUpdateTime,
        };
      });
      planetShakesRef.current = updatedShakes;
      // Smoothly lerp current offsets towards target offsets
      setPlanetShakeOffsets(prev =>
        prev.map((offset, index) => {
          const shake = updatedShakes[index];
          if (shake.shakeIntensity > 0) {
            const target = shake.shakeTargetOffset;
            return {
              x: lerp(offset.x, target.x, PLANET_SHAKE_SMOOTHNESS),
              y: lerp(offset.y, target.y, PLANET_SHAKE_SMOOTHNESS),
              z: lerp(offset.z, target.z, PLANET_SHAKE_SMOOTHNESS),
            };
          }
          // Smoothly return to zero when shaking stops
          return {
            x: lerp(offset.x, 0, PLANET_SHAKE_SMOOTHNESS),
            y: lerp(offset.y, 0, PLANET_SHAKE_SMOOTHNESS),
            z: lerp(offset.z, 0, PLANET_SHAKE_SMOOTHNESS),
          };
        })
      );
    });

    const { particlesCount, particlesSpeed } = useControls('Planets Scene', {
      Planets: folder({
        EnablePlanets: button(() => enablePlanets()),
        DisablePlanets: button(() => disablePlanets()),
        MovePlanetsAround: button(() => movePlanetsAround()),
        EnableParticleEffect: button(() => enableParticleEffect()),
        DisableParticleEffect: button(() => disableParticleEffect()),
        ChangeParticlesColor: button(() => changeParticlesColor()),
      }),
      Particles: folder({
        particlesCount: { value: 100, min: 0, max: 100, step: 1 },
        particlesSpeed: { value: 0.4, min: 0, max: 1, step: 0.1 },
      }),
    });

    useImperativeHandle(ref, () => ({
      enablePlanets,
      disablePlanets,
      movePlanetsAround,
      enableParticleEffect,
      disableParticleEffect,
      changeParticlesColor,
    }));

    return (
      <>
        {planets.map((planet, index) => {
          const pos = planetPositions[index];
          const shakeOffset = planetShakeOffsets[index];

          return (
            <mesh
              key={index}
              position={[
                pos.x + PLANETS_ORIGIN[0] + shakeOffset.x,
                pos.y + PLANETS_ORIGIN[1] + shakeOffset.y,
                pos.z + PLANETS_ORIGIN[2] + shakeOffset.z,
              ]}
              onPointerDown={() => shakePlanet(index)}
            >
              <sphereGeometry args={[planet.size * planetsSize, 64, 64]} />
              <meshPhysicalMaterial
                roughness={0}
                color="white"
                emissive="green"
                envMapIntensity={0.2}
              />
            </mesh>
          );
        })}
        <Sparkles
          position={[PLANETS_ORIGIN[0], PLANETS_ORIGIN[1], PLANETS_ORIGIN[2]]}
          count={particlesCount}
          scale={5}
          size={particlesSize}
          speed={particlesSpeed}
          color={particlesColor}
        />
      </>
    );
  }
);

PlanetsScene.displayName = 'PlanetsScene';

export default PlanetsScene;
