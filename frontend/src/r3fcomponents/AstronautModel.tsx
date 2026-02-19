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
    Arms: THREE.SkinnedMesh
    BackPack: THREE.SkinnedMesh
    Boots_A: THREE.SkinnedMesh
    Boots_B: THREE.SkinnedMesh
    Gloves_L: THREE.SkinnedMesh
    Gloves_R: THREE.SkinnedMesh
    Helmet: THREE.SkinnedMesh
    Radio: THREE.SkinnedMesh
    Shoes_A: THREE.SkinnedMesh
    Shoes_B: THREE.SkinnedMesh
    Torso: THREE.SkinnedMesh
    Trousers: THREE.SkinnedMesh
    mixamorigHips: THREE.Bone
  };
  materials: {
    ['Apollo_11_SpaceSuit.1006']: THREE.MeshStandardMaterial
    ['Apollo_11_SpaceSuit.1003']: THREE.MeshStandardMaterial
    ['Apollo_11_SpaceSuit.1005']: THREE.MeshStandardMaterial
    ['Apollo_11_SpaceSuit.001']: THREE.MeshStandardMaterial
    ['Apollo_11_SpaceSuit.1007']: THREE.MeshStandardMaterial
    ['Apollo_11_SpaceSuit.002']: THREE.MeshStandardMaterial
    ['Apollo_11_SpaceSuit.1001']: THREE.MeshStandardMaterial
    ['Apollo_11_SpaceSuit.1008']: THREE.MeshStandardMaterial
    ['Apollo_11_SpaceSuit.003']: THREE.MeshStandardMaterial
    ['Apollo_11_SpaceSuit.004']: THREE.MeshStandardMaterial
    ['Apollo_11_SpaceSuit.1002']: THREE.MeshStandardMaterial
    ['Apollo_11_SpaceSuit.1004']: THREE.MeshStandardMaterial
  };
};

export type ActionName =
  | 'Greeting'
  | 'IdleBreathing'
  | 'IdleLooking'
  | 'IdleStanding'
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
    '/models/Astronaut_V3.glb'
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
        <skinnedMesh
          name="Arms"
          geometry={nodes.Arms.geometry}
          material={materials['Apollo_11_SpaceSuit.1006']}
          skeleton={nodes.Arms.skeleton}
        />
        <skinnedMesh
          name="BackPack"
          geometry={nodes.BackPack.geometry}
          material={materials['Apollo_11_SpaceSuit.1003']}
          skeleton={nodes.BackPack.skeleton}
        />
        <skinnedMesh
          name="Boots_A"
          geometry={nodes.Boots_A.geometry}
          material={materials['Apollo_11_SpaceSuit.1005']}
          skeleton={nodes.Boots_A.skeleton}
        />
        <skinnedMesh
          name="Boots_B"
          geometry={nodes.Boots_B.geometry}
          material={materials['Apollo_11_SpaceSuit.001']}
          skeleton={nodes.Boots_B.skeleton}
        />
        <skinnedMesh
          name="Gloves_L"
          geometry={nodes.Gloves_L.geometry}
          material={materials['Apollo_11_SpaceSuit.1007']}
          skeleton={nodes.Gloves_L.skeleton}
        />
        <skinnedMesh
          name="Gloves_R"
          geometry={nodes.Gloves_R.geometry}
          material={materials['Apollo_11_SpaceSuit.002']}
          skeleton={nodes.Gloves_R.skeleton}
        />
        <skinnedMesh
          name="Helmet"
          geometry={nodes.Helmet.geometry}
          material={materials['Apollo_11_SpaceSuit.1001']}
          skeleton={nodes.Helmet.skeleton}
        />
        <skinnedMesh
          name="Radio"
          geometry={nodes.Radio.geometry}
          material={materials['Apollo_11_SpaceSuit.1008']}
          skeleton={nodes.Radio.skeleton}
        />
        <skinnedMesh
          name="Shoes_A"
          geometry={nodes.Shoes_A.geometry}
          material={materials['Apollo_11_SpaceSuit.003']}
          skeleton={nodes.Shoes_A.skeleton}
        />
        <skinnedMesh
          name="Shoes_B"
          geometry={nodes.Shoes_B.geometry}
          material={materials['Apollo_11_SpaceSuit.004']}
          skeleton={nodes.Shoes_B.skeleton}
        />
        <skinnedMesh
          name="Torso"
          geometry={nodes.Torso.geometry}
          material={materials['Apollo_11_SpaceSuit.1002']}
          skeleton={nodes.Torso.skeleton}
        />
        <skinnedMesh
          name="Trousers"
          geometry={nodes.Trousers.geometry}
          material={materials['Apollo_11_SpaceSuit.1004']}
          skeleton={nodes.Trousers.skeleton}
        />
        <primitive object={nodes.mixamorigHips} />
      </group>
    </group>
  </group>
  );
});

useGLTF.preload('/models/Astronaut_V3.glb');

AstronautModel.displayName = 'AstronautModel';

export default AstronautModel;
