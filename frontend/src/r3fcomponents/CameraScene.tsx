import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { CameraControls } from '@react-three/drei';
import { useControls, button } from 'leva';
import { debugLog } from '@/utils/log';
import useOrientation from '@/hooks/useOrientation';
export type CameraSceneRef = {
  enableCamera: () => void;
  disableCamera: () => void;
  resetCamera: (
    smoothTime?: number,
    position?: [number, number, number],
    target?: [number, number, number],
    zoom?: number
  ) => void;
  effectsCloseUp: () => void;
  effectWideShot: () => void;
  effectDollyPulse: () => void;
  effectOrbitLeft: () => void;
  effectOrbitRight: () => void;
  effectOrbit360: () => void;
};

const DEFAULT_CAMERA_ZOOM = 2;
const DEFAULT_CAMERA_POSITION_PORTRAIT: [number, number, number] = [0, 1.55, 3];
const DEFAULT_CAMERA_TARGET_PORTRAIT: [number, number, number] = [0, 1.55, 0];
const DEFAULT_CAMERA_POSITION_LANDSCAPE: [number, number, number] = [0.5, 1.55, 3];
const DEFAULT_CAMERA_TARGET_LANDSCAPE: [number, number, number] = [0.5, 1.55, 0];
const DEFAULT_SMOOTH_TIME = 2.5;

const DISABLED_CAMERA_ZOOM = 10;
const DISABLED_CAMERA_POSITION: [number, number, number] = [0, 1.55, 20];
const DISABLED_CAMERA_TARGET: [number, number, number] = [0, 1.55, 0];

const CameraScene = forwardRef<CameraSceneRef>(
  (props, ref: React.Ref<CameraSceneRef>) => {
    const controlsRef = useRef<CameraControls>(null);
    const effectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLandscape = useOrientation();

    // Get current default camera position and target based on orientation
    const defaultCameraPosition = useMemo(
      () =>
        isLandscape
          ? DEFAULT_CAMERA_POSITION_LANDSCAPE
          : DEFAULT_CAMERA_POSITION_PORTRAIT,
      [isLandscape]
    );

    const defaultCameraTarget = useMemo(
      () =>
        isLandscape
          ? DEFAULT_CAMERA_TARGET_LANDSCAPE
          : DEFAULT_CAMERA_TARGET_PORTRAIT,
      [isLandscape]
    );

    const enableCamera = () => {
      resetCamera();
    };

    const disableCamera = () => {
      resetCamera(
        DEFAULT_SMOOTH_TIME,
        DISABLED_CAMERA_POSITION,
        DISABLED_CAMERA_TARGET,
        DISABLED_CAMERA_ZOOM
      );
    };

    const resetCamera = (
      smoothTime = 1.0,
      position?: [number, number, number],
      target?: [number, number, number],
      zoom = DEFAULT_CAMERA_ZOOM
    ) => {
      debugLog('Camera Effects: Reset to Default');
      const c = controlsRef.current;
      if (!c) return;
      const [px, py, pz] = position ?? defaultCameraPosition;
      const [tx, ty, tz] = target ?? defaultCameraTarget;
      c.setLookAt(px, py, pz, tx, ty, tz, true);
      c.zoomTo(zoom, true);
      c.smoothTime = smoothTime;
    };

    const effectsCloseUp = () => {
      debugLog('Camera Effects: Close Up');
      const c = controlsRef.current;
      if (!c) return;
      const [px, py, pz] = defaultCameraPosition;
      const [tx, ty, tz] = defaultCameraTarget;
      c.setLookAt(px * 0.5, py + 0.25, pz * 0.35, tx*0.25, ty + 0.25, tz, true);
    };

    const effectWideShot = () => {
      debugLog('Camera Effects: Wide Shot');
      const c = controlsRef.current;
      if (!c) return;
      const [px, py, pz] = defaultCameraPosition;
      const [tx, ty, tz] = defaultCameraTarget;
      c.setLookAt(px, py + 0.15, pz * 2, tx, ty, tz, true);
    };

    const effectDollyPulse = () => {
      debugLog('Camera Effects: Dolly Pulse');
      const c = controlsRef.current;
      if (!c) return;
      c.dolly(-0.5, true);
      if (effectTimeoutRef.current) clearTimeout(effectTimeoutRef.current);
      effectTimeoutRef.current = setTimeout(
        () => {
          c.dolly(0.5, true);
        },
        DEFAULT_SMOOTH_TIME * 1000 * 0.25
      );
    };

    const effectOrbitLeft = () => {
      debugLog('Camera Effects: Orbit Left');
      const c = controlsRef.current;
      if (!c) return;
      c.rotate(Math.PI * 0.5, 0, true);
      c.dolly(-0.5, true);
      if (effectTimeoutRef.current) clearTimeout(effectTimeoutRef.current);
      effectTimeoutRef.current = setTimeout(
        () => {
          c.rotate(-Math.PI * 0.5, 0, true);
          c.dolly(0.5, true);
        },
        DEFAULT_SMOOTH_TIME * 1000 * 1.5
      );
    };

    const effectOrbitRight = () => {
      debugLog('Camera Effects: Orbit Right');
      const c = controlsRef.current;
      if (!c) return;
      c.rotate(-Math.PI * 0.5, 0, true);
      c.dolly(-0.5, true);
      if (effectTimeoutRef.current) clearTimeout(effectTimeoutRef.current);
      effectTimeoutRef.current = setTimeout(
        () => {
          c.rotate(Math.PI * 0.5, 0, true);
          c.dolly(0.5, true);
        },
        DEFAULT_SMOOTH_TIME * 1000 * 1.5
      );
    };

    const effectOrbit360 = () => {
      debugLog('Camera Effects: Orbit 360');
      const c = controlsRef.current;
      if (!c) return;

      // Clear any existing timeouts
      if (effectTimeoutRef.current) {
        clearTimeout(effectTimeoutRef.current);
      }
      // Phase 1: Zoom out (dolly)
      c.dolly(-1, true);

      effectTimeoutRef.current = setTimeout(
        () => {
          // Phase 2: Rotate 360 degrees
          c.rotate(Math.PI * 2, 0, true); // Full rotation
          c.rotate(0, Math.PI * 0.5, true); // Start at 90 degrees

          c.smoothTime = DEFAULT_SMOOTH_TIME * 2;
          effectTimeoutRef.current = setTimeout(
            () => {
              // Phase 3: Zoom in (dolly back)
              c.rotate(0, -Math.PI * 0.5, true);
              c.dolly(1, true);
              c.smoothTime = DEFAULT_SMOOTH_TIME;
            },
            DEFAULT_SMOOTH_TIME * 2 * 0.8 * 1000
          );
        },
        DEFAULT_SMOOTH_TIME * 0.8 * 1000
      );
    };

    /* eslint-disable react-hooks/refs */
    useControls('Camera Effects', {
      EnableCamera: button(() => enableCamera()),
      DisableCamera: button(() => disableCamera()),
      ResetCamera: button(() => resetCamera()),
      CloseUp: button(() => effectsCloseUp()),
      WideShot: button(() => effectWideShot()),
      DollyPulse: button(() => effectDollyPulse()),
      OrbitLeft: button(() => effectOrbitLeft()),
      OrbitRight: button(() => effectOrbitRight()),
      Orbit360: button(() => effectOrbit360()),
    });

    // Set initial camera position on mount
    useEffect(() => {
      debugLog('Camera Effects: Setting initial camera position');
      const c = controlsRef.current;
      if (!c) return;
      const [px, py, pz] = DISABLED_CAMERA_POSITION;
      const [tx, ty, tz] = DISABLED_CAMERA_TARGET;
      c.setLookAt(px, py, pz, tx, ty, tz, false);
      c.zoomTo(DISABLED_CAMERA_ZOOM, false);
    }, []);

    useImperativeHandle(ref, () => ({
      enableCamera,
      disableCamera,
      resetCamera,
      effectsCloseUp,
      effectWideShot,
      effectDollyPulse,
      effectOrbitLeft,
      effectOrbitRight,
      effectOrbit360,
    }));

    return (
      <CameraControls
        ref={controlsRef}
        makeDefault
        smoothTime={DEFAULT_SMOOTH_TIME}
      />
    );
  }
);

CameraScene.displayName = 'CameraScene';

export default CameraScene;
