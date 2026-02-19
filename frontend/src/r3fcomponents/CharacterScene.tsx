import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useControls, button } from 'leva';
import AstronautModel, { AstronautModelRef } from './AstronautModel';
import { ActionName } from '@/r3fcomponents/AstronautModel';
import { debugLog } from '@/utils/log';

// The below should be a subset of the ActionName type
export type TalkingAnimation =
  | 'TalkingAcknowledge'
  | 'TalkingOneHand'
  | 'TalkingTwoHands';

export type CharacterSceneRef = {
  playAnimation: (
    animationName: TalkingAnimation,
    callback?: () => void
  ) => void;
  playGreeting: () => void;
  playIdleStanding: () => void;
  playIdleLooking: () => void;
  playIdleBreathing: () => void;
  playLookBehind: () => void;
  playTalkingAnimation: (
    animationName: TalkingAnimation,
    talkingtimeout?: number
  ) => void;
  stopTalkingAnimations: () => void;
};

export const CharacterScene = forwardRef<CharacterSceneRef>(
  (props, ref: React.Ref<CharacterSceneRef>) => {
    const modelRef = useRef<AstronautModelRef>(null);
    const isTalkingRef = useRef(false);
    const talkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const playAnimation = (
      animationName: ActionName,
      callback?: () => void,
      loop?: boolean
    ) => {
      modelRef.current?.playAnimation(animationName, callback, undefined, loop);
    };

    const playIdleStanding = (callback?: () => void) => {
      debugLog('CharacterScene: Play Idle Standing animation');
      playAnimation('IdleStanding', callback, true);
    };

    const playGreeting = (callback?: () => void) => {
      debugLog('CharacterScene: Play Greeting animation');
      const wrappedCallback = () => {
        callback?.();
        playIdleStanding();
      };
      playAnimation('Greeting', wrappedCallback);
    };

    const playIdleLooking = (callback?: () => void) => {
      debugLog('CharacterScene: Play Idle Looking animation');
      const wrappedCallback = () => {
        callback?.();
        playIdleStanding();
      };
      playAnimation('IdleLooking', wrappedCallback);
    };

    const playIdleBreathing = (callback?: () => void) => {
      debugLog('CharacterScene: Play Idle Breathing animation');
      const wrappedCallback = () => {
        callback?.();
        playIdleStanding();
      };
      playAnimation('IdleBreathing', wrappedCallback);
    };

    const playLookBehind = (callback?: () => void) => {
      debugLog('CharacterScene: Play Look Behind animation');
      const wrappedCallback = () => {
        callback?.();
        playIdleStanding();
      };
      playAnimation('LookBehind', wrappedCallback);
    };

    const stopTalkingAnimations = () => {
      debugLog('CharacterScene: Stop Talking animations');
      isTalkingRef.current = false;
      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
        talkingTimeoutRef.current = null;
      }
    };

    const playTalkingAnimation = (
      animationName: TalkingAnimation,
      timeout?: number
    ) => {
      debugLog(
        'CharacterScene: Play Talking animation',
        animationName,
        timeout
      );

      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
        talkingTimeoutRef.current = null;
      }

      // If timeout is provided, set it to return to StandingIdle
      if (timeout) {
        talkingTimeoutRef.current = setTimeout(() => {
          playIdleStanding();
          talkingTimeoutRef.current = null;
        }, timeout * 1000);
      }

      // Play the animation
      playAnimation(animationName, undefined, true);
    };

    /* eslint-disable react-hooks/refs */
    useControls('Character Scene', {
      Greeting: button(() => playGreeting()),
      IdleStanding: button(() => playIdleStanding()),
      IdleLooking: button(() => playIdleLooking()),
      IdleBreathing: button(() => playIdleBreathing()),
      LookBehind: button(() => playLookBehind()),
      TalkingNormally: button(() => playTalkingAnimation('TalkingAcknowledge')),
      TalkingEmphatically: button(() => playTalkingAnimation('TalkingOneHand')),
      TalkingExcited: button(() => playTalkingAnimation('TalkingTwoHands')),
      StopTalking: button(() => stopTalkingAnimations()),
    });

    useImperativeHandle(ref, () => ({
      playAnimation,
      playIdleStanding,
      playGreeting,
      playIdleLooking,
      playIdleBreathing,
      playLookBehind,
      playTalkingAnimation,
      stopTalkingAnimations,
    }));

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (talkingTimeoutRef.current) {
          clearTimeout(talkingTimeoutRef.current);
        }
      };
    }, []);

    return (
      <>
        <AstronautModel
          ref={modelRef}
          position={[0, 0, 0]}
          scale={[1, 1, 1]}
        />
      </>
    );
  }
);

CharacterScene.displayName = 'CharacterScene';

export default CharacterScene;
