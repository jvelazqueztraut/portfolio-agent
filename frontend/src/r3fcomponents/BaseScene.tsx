import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { button, folder, useControls } from 'leva';

import { GradientBackground } from './GradientBackground';
import { lerp } from 'three/src/math/MathUtils.js';
import { useFrame } from '@react-three/fiber';
import { debugLog } from '@/utils/log';

const OPACITY_LERP_FACTOR = 0.02;
const DEFAULT_BG_OPACITY = 0.2;
const HUE_LERP_FACTOR = 0.05;
const AVAILABLE_HUES = [0.6, 0.2, 0.8, 0.4];

export type BaseSceneRef = {
  enableBackground: () => void;
  disableBackground: () => void;
  changeBackgroundHue: () => void;
};

export type BaseSceneProps = {
  children: React.ReactNode;
};

const BaseScene = forwardRef<BaseSceneRef, BaseSceneProps>(
  ({ children }, ref: React.Ref<BaseSceneRef>) => {
    const [bgOpacity, setBgOpacity] = useState(0);
    const targetBgOpacity = useRef(0);
    const [bgHue, setBgHue] = useState(0.6);
    const targetBgHue = useRef(0.6);

    useFrame(() => {
      setBgHue(prev => lerp(prev, targetBgHue.current, HUE_LERP_FACTOR));
      setBgOpacity(prev =>
        lerp(prev, targetBgOpacity.current, OPACITY_LERP_FACTOR)
      );
    });

    const enableBackground = () => {
      targetBgOpacity.current = DEFAULT_BG_OPACITY;
    };

    const disableBackground = () => {
      targetBgOpacity.current = 0;
    };

    const changeBackgroundHue = () => {
      debugLog('Base Scene: Effect Gradient Hue');
      targetBgHue.current =
        // eslint-disable-next-line react-hooks/purity
        AVAILABLE_HUES[Math.floor(Math.random() * AVAILABLE_HUES.length)];
    };

    const {
      ambientIntensity,
      pointIntensity,
      directionalIntensity,
      bgRadius,
      bgSize,
      bgZ,
      bgSat,
      bgNumSprites,
      bgHasFog,
    } = useControls('Base Scene', {
      Lighting: folder({
        ambientIntensity: { value: 0.95, min: 0, max: 2, step: 0.05 },
        pointIntensity: { value: 1.0, min: 0, max: 2, step: 0.1 },
        directionalIntensity: { value: 4, min: 0, max: 10, step: 0.5 },
      }),
      Background: folder({
        EnableBackground: button(() => enableBackground()),
        DisableBackground: button(() => disableBackground()),
        ChangeBackgroundHue: button(() => changeBackgroundHue()),
      }),
      BGGradient: folder({
        bgRadius: { value: 10, min: 0, max: 100, step: 1 },
        bgSize: { value: 50, min: 0, max: 100, step: 5 },
        bgZ: { value: -30, min: -50, max: 0, step: 2 },
        bgSat: { value: 0.5, min: 0, max: 1, step: 0.01 },
        bgNumSprites: { value: 8, min: 0, max: 10, step: 1 },
        bgHasFog: true,
      }),
    });

    useImperativeHandle(ref, () => ({
      enableBackground,
      disableBackground,
      changeBackgroundHue,
    }));

    return (
      <>
        {/* Gradient background layer using sprites */}
        <GradientBackground
          hue={bgHue}
          numSprites={bgNumSprites}
          opacity={bgOpacity}
          radius={bgRadius}
          size={bgSize}
          z={bgZ}
          sat={bgSat}
          hasFog={bgHasFog}
        />

        <ambientLight intensity={ambientIntensity} />
        <pointLight position={[10, 10, 10]} intensity={pointIntensity} />
        <directionalLight
          position={[-10, 10, 5]}
          intensity={directionalIntensity}
        />
        {children}
      </>
    );
  }
);

BaseScene.displayName = 'BaseScene';

export default BaseScene;
