/* eslint-disable @typescript-eslint/no-explicit-any */

import * as THREE from 'three';
import React, {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    Cube001: THREE.SkinnedMesh;
    Cube001_1: THREE.SkinnedMesh;
    Cube001_2: THREE.SkinnedMesh;
    Sphere001: THREE.SkinnedMesh;
    Sphere001_1: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    ['white.001']: THREE.MeshStandardMaterial;
    ['gray.001']: THREE.MeshStandardMaterial;
    ['flag.001']: THREE.MeshStandardMaterial;
    ['transparent_mask.001']: THREE.MeshStandardMaterial;
  };
};

export type ActionName =
  | 'IdleStanding'
  | 'IdleLooking'
  | 'IdleBreathing'
  | 'Greeting'
  | 'LookBehind'
  | 'TalkingAcknowledge'
  | 'TalkingOneHand'
  | 'TalkingTwoHands';
type GLTFActions = THREE.AnimationClip & { name: ActionName };

export type AstronautModelRef = {
  actions: ReturnType<typeof useAnimations<GLTFActions>>['actions'];
  playAnimation: (
    animationName: ActionName,
    callback?: () => void,
    clampWhenFinished?: boolean,
    loop?: boolean
  ) => void;
};

type AstronautModelProps = React.JSX.IntrinsicElements['group'] & {};

export const AstronautModel = forwardRef<
  AstronautModelRef,
  AstronautModelProps
>((props: AstronautModelProps, ref: React.Ref<AstronautModelRef>) => {
  const group = useRef<THREE.Group>(null);
  const currentActionRef = useRef<string | null>(null);
  const { nodes, materials, animations } = useGLTF(
    '/models/Astronaut.glb'
  ) as unknown as GLTFResult;
  const { actions, mixer } = useAnimations<GLTFActions>(
    animations as any,
    group
  );

  const playAnimation = useCallback(
    (
      animationName: ActionName,
      callback?: () => void,
      clampWhenFinished = true,
      loop = false
    ) => {
      const anim = actions[animationName];
      if (anim) {
        // Stop all other animations first
        Object.keys(actions).forEach(key => {
          const action = actions[key as ActionName];
          if (action && action !== anim) {
            action.stop();
          }
        });

        // Setup the new animation
        // eslint-disable-next-line react-hooks/immutability
        anim.weight = 1.0;

        anim.clampWhenFinished = clampWhenFinished;
        anim
          .reset()
          .setLoop(
            loop ? THREE.LoopRepeat : THREE.LoopOnce,
            loop ? Infinity : 1
          )
          .play();

        // Update current action ref
        currentActionRef.current = animationName;

        if (!loop) {
          const onAnimationFinished = (event: {
            action: THREE.AnimationAction;
            direction: number;
          }) => {
            if (event.action?.getClip().name === animationName) {
              callback?.();
              currentActionRef.current = null;
              mixer.removeEventListener('finished', onAnimationFinished);
            }
          };
          mixer.addEventListener('finished', onAnimationFinished);
        }
      }
    },
    [actions, mixer]
  );

  // Play StandingIdle animation by default on mount
  useEffect(() => {
    const standingIdleAnim = actions.IdleStanding;
    if (standingIdleAnim) {
      // eslint-disable-next-line react-hooks/immutability
      standingIdleAnim.clampWhenFinished = true;

      standingIdleAnim.weight = 1.0;
      standingIdleAnim.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      currentActionRef.current = 'IdleStanding';
    }
  }, [actions]);

  useImperativeHandle(ref, () => ({ actions, playAnimation }), [
    actions,
    playAnimation,
  ]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <group name="Body">
            <skinnedMesh
              name="Cube001"
              geometry={nodes.Cube001.geometry}
              material={materials['white.001']}
              skeleton={nodes.Cube001.skeleton}
            />
            <skinnedMesh
              name="Cube001_1"
              geometry={nodes.Cube001_1.geometry}
              material={materials['gray.001']}
              skeleton={nodes.Cube001_1.skeleton}
            />
            <skinnedMesh
              name="Cube001_2"
              geometry={nodes.Cube001_2.geometry}
              material={materials['flag.001']}
              skeleton={nodes.Cube001_2.skeleton}
            />
          </group>
          <group name="Helmet">
            <skinnedMesh
              name="Sphere001"
              geometry={nodes.Sphere001.geometry}
              material={materials['white.001']}
              skeleton={nodes.Sphere001.skeleton}
            />
            <skinnedMesh
              name="Sphere001_1"
              geometry={nodes.Sphere001_1.geometry}
              material={materials['transparent_mask.001']}
              skeleton={nodes.Sphere001_1.skeleton}
            />
          </group>
          <primitive object={nodes.mixamorigHips} />
        </group>
      </group>
    </group>
  );
});

useGLTF.preload('/models/Astronaut.glb');

AstronautModel.displayName = 'AstronautModel';

export default AstronautModel;
