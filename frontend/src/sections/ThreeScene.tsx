'use client';

import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Canvas } from '@react-three/fiber';
import BaseScene, { BaseSceneRef } from '@/r3fcomponents/BaseScene';
import CharacterScene, {
  CharacterSceneRef,
} from '@/r3fcomponents/CharacterScene';
import CameraScene, { CameraSceneRef } from '@/r3fcomponents/CameraScene';
import { Leva } from 'leva';
import {
  CameraCommand,
  CharacterCommand,
  EnvironmentCommand,
} from '@/types/agent';
import { useProgress } from '@react-three/drei';
import PlanetsScene, { PlanetsSceneRef } from '@/r3fcomponents/PlanetsScene';

export type ThreeSceneRef = {
  characterSceneRef: CharacterSceneRef | null;
  planetsSceneRef: PlanetsSceneRef | null;
  cameraSceneRef: CameraSceneRef | null;
  baseSceneRef: BaseSceneRef | null;
};

interface ThreeSceneProps {
  talkingTime: number;
  characterCommand: CharacterCommand | null;
  cameraCommand: CameraCommand | null;
  environmentCommand: EnvironmentCommand[] | null;
  showControls?: boolean;
  onProgress?: (progress: number) => void;
}

const ThreeScene = forwardRef<ThreeSceneRef, ThreeSceneProps>(
  (
    {
      talkingTime,
      characterCommand,
      cameraCommand,
      environmentCommand,
      showControls = false,
      onProgress,
    },
    ref
  ) => {
    const characterSceneRef = useRef<CharacterSceneRef>(null);
    const planetsSceneRef = useRef<PlanetsSceneRef>(null);
    const cameraSceneRef = useRef<CameraSceneRef>(null);
    const baseSceneRef = useRef<BaseSceneRef>(null);

    const { progress } = useProgress();
    useEffect(() => {
      onProgress?.(progress);
    }, [progress, onProgress]);

    useImperativeHandle(ref, () => ({
      get characterSceneRef() {
        return characterSceneRef.current;
      },
      get planetsSceneRef() {
        return planetsSceneRef.current;
      },
      get cameraSceneRef() {
        return cameraSceneRef.current;
      },
      get baseSceneRef() {
        return baseSceneRef.current;
      },
    }));

    useEffect(() => {
      if (characterCommand) {
        switch (characterCommand.type) {
          case 'talking_normally':
            characterSceneRef.current?.playTalkingAnimation(
              'TalkingAcknowledge',
              talkingTime
            );
            break;
          case 'talking_emphatically':
            characterSceneRef.current?.playTalkingAnimation(
              'TalkingOneHand',
              talkingTime
            );
            break;
          case 'talking_excited':
            characterSceneRef.current?.playTalkingAnimation(
              'TalkingTwoHands',
              talkingTime
            );
            break;
          case 'greeting':
            characterSceneRef.current?.playGreeting();
            break;
          case 'looking_around':
            characterSceneRef.current?.playIdleLooking();
            break;
          case 'looking_behind':
            characterSceneRef.current?.playLookBehind();
            break;
        }
      }
    }, [characterCommand, talkingTime]);

    useEffect(() => {
      if (cameraCommand) {
        switch (cameraCommand.type) {
          case 'enable_camera':
            cameraSceneRef.current?.enableCamera();
            break;
          case 'disable_camera':
            cameraSceneRef.current?.disableCamera();
            break;
          case 'default':
            cameraSceneRef.current?.resetCamera();
            break;
          case 'closeup':
            cameraSceneRef.current?.effectsCloseUp();
            break;
          case 'wide_shot':
            cameraSceneRef.current?.effectWideShot();
            break;
          case 'dolly_pulse':
            cameraSceneRef.current?.effectDollyPulse();
            break;
          case 'orbit_left':
            cameraSceneRef.current?.effectOrbitLeft();
            break;
          case 'orbit_right':
            cameraSceneRef.current?.effectOrbitRight();
            break;
          case 'orbit_360':
            cameraSceneRef.current?.effectOrbit360();
            break;
          default:
            break;
        }
      }
    }, [cameraCommand]);

    useEffect(() => {
      if (environmentCommand && environmentCommand.length > 0) {
        environmentCommand.forEach((command: EnvironmentCommand) => {
          switch (command.type) {
            case 'enable_background':
              baseSceneRef.current?.enableBackground();
              break;
            case 'disable_background':
              baseSceneRef.current?.disableBackground();
              break;
            case 'background_change_color':
              baseSceneRef.current?.changeBackgroundHue();
              break;
            case 'enable_planets':
              planetsSceneRef.current?.enablePlanets();
              break;
            case 'disable_planets':
              planetsSceneRef.current?.disablePlanets();
              break;
            case 'planets_move_around':
              planetsSceneRef.current?.movePlanetsAround();
              break;
            case 'enable_particle_effect':
              planetsSceneRef.current?.enableParticleEffect();
              break;
            case 'disable_particle_effect':
              planetsSceneRef.current?.disableParticleEffect();
              break;
            case 'particles_change_color':
              planetsSceneRef.current?.changeParticlesColor();
              break;
            default:
              break;
          }
        });
      }
    }, [environmentCommand]);

    return (
      <>
        <div
          className="fixed top-0 left-0 w-full h-full"
          style={{ zIndex: 'var(--z-canvas)' }}
        >
          <Canvas>
            <BaseScene ref={baseSceneRef}>
              <CharacterScene ref={characterSceneRef} />
              <PlanetsScene ref={planetsSceneRef} />
            </BaseScene>
            <CameraScene ref={cameraSceneRef} />
            {showControls && <axesHelper args={[10]} />}
          </Canvas>
        </div>
        <Leva hidden={!showControls} />
      </>
    );
  }
);

ThreeScene.displayName = 'ThreeScene';

export default ThreeScene;
